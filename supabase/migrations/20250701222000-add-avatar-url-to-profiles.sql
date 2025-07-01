
-- Agregar campo avatar_url a la tabla profiles si no existe
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
