
-- Agregar campo para imágenes reales en la tabla ingredients
ALTER TABLE public.ingredients 
ADD COLUMN real_image_url TEXT;

-- Crear tabla para múltiples imágenes reales por ingrediente
CREATE TABLE public.ingredient_real_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  caption TEXT,
  uploaded_by TEXT, -- Para futuro sistema de usuarios
  is_approved BOOLEAN DEFAULT false,
  votes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_ingredient_real_images_ingredient ON public.ingredient_real_images(ingredient_id);
CREATE INDEX idx_ingredient_real_images_approved ON public.ingredient_real_images(is_approved);

-- Habilitar RLS
ALTER TABLE public.ingredient_real_images ENABLE ROW LEVEL SECURITY;

-- Política pública para lectura
CREATE POLICY "Public read access" ON public.ingredient_real_images FOR SELECT USING (true);

-- Política para inserción (por ahora pública, después se puede restringir)
CREATE POLICY "Public insert access" ON public.ingredient_real_images FOR INSERT WITH CHECK (true);
