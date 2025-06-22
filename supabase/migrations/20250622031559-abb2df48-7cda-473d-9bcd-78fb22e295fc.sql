
-- Primero, verificar las políticas RLS existentes en la tabla ingredients
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'ingredients';

-- Habilitar RLS si no está habilitado (probablemente ya lo está)
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;

-- Crear una política permisiva para permitir actualizaciones públicas de image_url
-- Esto permitirá que las edge functions actualicen las imágenes sin autenticación
CREATE POLICY "Allow public image updates" ON public.ingredients
FOR UPDATE 
USING (true)
WITH CHECK (true);

-- También crear una política para permitir lecturas públicas
CREATE POLICY "Allow public read access" ON public.ingredients
FOR SELECT 
USING (true);

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'ingredients';
