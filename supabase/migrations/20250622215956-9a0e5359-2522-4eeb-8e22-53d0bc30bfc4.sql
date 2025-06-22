
-- 1. Create security definer function to check super admin status server-side
CREATE OR REPLACE FUNCTION public.verify_super_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if current user is authenticated and has super_admin role
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$;

-- 2. Fix RLS policies on ingredients table - remove conflicting policies
DROP POLICY IF EXISTS "Allow public image updates" ON public.ingredients;
DROP POLICY IF EXISTS "Allow public read access" ON public.ingredients;

-- Create proper RLS policies for ingredients
CREATE POLICY "Public can read ingredients" ON public.ingredients
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify ingredients" ON public.ingredients
FOR ALL USING (public.verify_super_admin_access());

-- 3. Add RLS policies for categories table
CREATE POLICY "Public can read categories" ON public.categories
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify categories" ON public.categories
FOR ALL USING (public.verify_super_admin_access());

-- 4. Add RLS policies for countries table
CREATE POLICY "Public can read countries" ON public.countries
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify countries" ON public.countries
FOR ALL USING (public.verify_super_admin_access());

-- 5. Secure related tables with proper RLS
CREATE POLICY "Public can read ingredient prices" ON public.ingredient_prices
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify ingredient prices" ON public.ingredient_prices
FOR ALL USING (public.verify_super_admin_access());

CREATE POLICY "Public can read ingredient uses" ON public.ingredient_uses
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify ingredient uses" ON public.ingredient_uses
FOR ALL USING (public.verify_super_admin_access());

CREATE POLICY "Public can read ingredient recipes" ON public.ingredient_recipes
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify ingredient recipes" ON public.ingredient_recipes
FOR ALL USING (public.verify_super_admin_access());

CREATE POLICY "Public can read ingredient varieties" ON public.ingredient_varieties
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify ingredient varieties" ON public.ingredient_varieties
FOR ALL USING (public.verify_super_admin_access());

CREATE POLICY "Public can read nutritional info" ON public.nutritional_info
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify nutritional info" ON public.nutritional_info
FOR ALL USING (public.verify_super_admin_access());

CREATE POLICY "Public can read real images" ON public.ingredient_real_images
FOR SELECT USING (true);

CREATE POLICY "Only super admins can modify real images" ON public.ingredient_real_images
FOR ALL USING (public.verify_super_admin_access());

-- 6. Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only super admins can read audit logs
CREATE POLICY "Only super admins can read audit logs" ON public.admin_audit_log
FOR SELECT USING (public.verify_super_admin_access());

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" ON public.admin_audit_log
FOR INSERT WITH CHECK (true);

-- 7. Remove the client-side super admin promotion function
DROP FUNCTION IF EXISTS public.set_super_admin(text);

-- 8. Create server-side only super admin promotion function
CREATE OR REPLACE FUNCTION public.promote_to_super_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_role text;
  promotion_successful boolean := false;
BEGIN
  -- Only allow existing super admins to promote others
  SELECT role INTO current_user_role
  FROM public.profiles
  WHERE id = auth.uid();
  
  IF current_user_role != 'super_admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only super admins can promote users';
  END IF;
  
  -- Promote the target user
  UPDATE public.profiles 
  SET role = 'super_admin' 
  WHERE email = target_email;
  
  promotion_successful := FOUND;
  
  -- Log the promotion action
  INSERT INTO public.admin_audit_log (
    user_id, action, resource_type, details
  ) VALUES (
    auth.uid(), 
    'promote_super_admin', 
    'user', 
    jsonb_build_object('target_email', target_email, 'success', promotion_successful)
  );
  
  RETURN promotion_successful;
END;
$$;

-- 9. Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  action_type text,
  resource_type text,
  resource_id uuid DEFAULT NULL,
  action_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    user_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), action_type, resource_type, resource_id, action_details
  );
END;
$$;
