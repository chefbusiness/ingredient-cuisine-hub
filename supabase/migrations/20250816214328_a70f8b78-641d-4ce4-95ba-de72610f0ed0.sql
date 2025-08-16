-- SECURITY FIXES: Comprehensive security hardening

-- 1. CRITICAL FIX: Prevent privilege escalation via profiles table
-- Create a trigger to prevent users from changing their own role
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  -- Allow super admins to change roles
  IF verify_super_admin_access() THEN
    RETURN NEW;
  END IF;
  
  -- For regular users, prevent role changes
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    RAISE EXCEPTION 'Access denied: Users cannot change their own role';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;

-- Apply the trigger to profiles table
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.profiles;
CREATE TRIGGER prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION prevent_role_escalation();

-- 2. CRITICAL FIX: Secure ingredient_real_images table
-- Remove overly permissive public insert policy
DROP POLICY IF EXISTS "Public insert access" ON public.ingredient_real_images;
DROP POLICY IF EXISTS "Public can read real images" ON public.ingredient_real_images;

-- Create secure policies for ingredient_real_images
CREATE POLICY "Only authenticated users can insert images"
ON public.ingredient_real_images
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public can read approved images"
ON public.ingredient_real_images
FOR SELECT
USING (is_approved = true);

-- 3. CRITICAL FIX: Harden SECURITY DEFINER functions by pinning search_path
CREATE OR REPLACE FUNCTION public.verify_super_admin_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, preferred_language)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'preferred_language', 'es'));
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.promote_to_super_admin(target_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

CREATE OR REPLACE FUNCTION public.log_admin_action(action_type text, resource_type text, resource_id uuid DEFAULT NULL::uuid, action_details jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_audit_log (
    user_id, action, resource_type, resource_id, details
  ) VALUES (
    auth.uid(), action_type, resource_type, resource_id, action_details
  );
END;
$$;

-- 4. MEDIUM FIX: Improve admin_audit_log policies
-- Replace permissive system insert policy with authenticated requirement
DROP POLICY IF EXISTS "System can insert audit logs" ON public.admin_audit_log;

CREATE POLICY "Authenticated users can insert audit logs"
ON public.admin_audit_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

-- 5. Add additional security: Ensure profiles table has proper constraints
-- Add constraint to prevent empty or invalid roles
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'super_admin'));

-- Add constraint to ensure email is not empty
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_email_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_email_check 
CHECK (email IS NOT NULL AND length(trim(email)) > 0);