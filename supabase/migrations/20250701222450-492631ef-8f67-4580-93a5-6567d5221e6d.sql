
-- Eliminar TODAS las políticas existentes para profile-avatars que están causando conflictos
DROP POLICY IF EXISTS "Public can view profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete profile avatars" ON storage.objects;

-- Verificar que el bucket existe y es público
INSERT INTO storage.buckets (id, name, public) 
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Crear políticas RLS simples y funcionales
-- Política para que cualquiera pueda ver las imágenes (bucket público)
CREATE POLICY "Anyone can view profile avatars" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'profile-avatars');

-- Política para que usuarios autenticados puedan subir avatares
CREATE POLICY "Authenticated users can upload avatars" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-avatars' AND 
  auth.uid() IS NOT NULL
);

-- Política para que usuarios autenticados puedan actualizar avatares
CREATE POLICY "Authenticated users can update avatares" 
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid() IS NOT NULL
);

-- Política para que usuarios autenticados puedan eliminar avatares
CREATE POLICY "Authenticated users can delete avatares" 
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'profile-avatars' AND 
  auth.uid() IS NOT NULL
);
