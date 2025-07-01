
-- Eliminar las políticas RLS existentes que están causando problemas
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;

-- Crear políticas RLS correctas para el bucket profile-avatars
-- Política para que usuarios autenticados puedan subir avatares
CREATE POLICY "Authenticated users can upload profile avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' AND 
  auth.role() = 'authenticated'
);

-- Política para que usuarios autenticados puedan actualizar avatares
CREATE POLICY "Authenticated users can update profile avatars" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.role() = 'authenticated'
);

-- Política para que usuarios autenticados puedan eliminar avatares
CREATE POLICY "Authenticated users can delete profile avatars" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.role() = 'authenticated'
);
