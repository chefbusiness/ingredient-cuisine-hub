
-- Agregar campo avatar_url a la tabla profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;

-- Crear bucket para avatares de perfil
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Política para que los usuarios puedan ver avatares públicos
CREATE POLICY IF NOT EXISTS "Public can view profile avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-avatars');

-- Política para que los usuarios puedan subir sus propios avatares
CREATE POLICY IF NOT EXISTS "Users can upload their own avatar" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que los usuarios puedan actualizar sus propios avatares
CREATE POLICY IF NOT EXISTS "Users can update their own avatar" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Política para que los usuarios puedan eliminar sus propios avatares
CREATE POLICY IF NOT EXISTS "Users can delete their own avatar" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);
