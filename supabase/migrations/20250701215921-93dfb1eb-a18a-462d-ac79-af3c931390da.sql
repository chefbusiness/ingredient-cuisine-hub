
-- Eliminar las políticas RLS problemáticas que usan auth.role()
DROP POLICY IF EXISTS "Authenticated users can upload profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete profile avatars" ON storage.objects;

-- Crear políticas RLS correctas para el bucket profile-avatars
-- Política para que usuarios autenticados puedan subir avatares
CREATE POLICY "Authenticated users can upload profile avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' AND 
  auth.uid() IS NOT NULL
);

-- Política para que usuarios autenticados puedan actualizar avatares
CREATE POLICY "Authenticated users can update profile avatars" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid() IS NOT NULL
);

-- Política para que usuarios autenticados puedan eliminar avatares
CREATE POLICY "Authenticated users can delete profile avatars" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid() IS NOT NULL
);
