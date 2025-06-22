
-- Agregar campo role a la tabla profiles para manejar roles de usuario
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Crear índice para optimizar consultas por rol
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Función para verificar si un usuario es super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'super_admin'
  );
$$;

-- Función para actualizar un usuario a super admin por email
CREATE OR REPLACE FUNCTION public.set_super_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET role = 'super_admin' 
  WHERE email = user_email;
  
  RETURN FOUND;
END;
$$;
