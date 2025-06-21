
-- Crear tabla de categorías
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  name_en TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de países
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT NOT NULL UNIQUE,
  currency TEXT NOT NULL,
  currency_symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla principal de ingredientes
CREATE TABLE public.ingredients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_la TEXT,
  name_fr TEXT,
  name_it TEXT,
  name_pt TEXT,
  name_zh TEXT,
  description TEXT NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  popularity INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  temporada TEXT,
  origen TEXT,
  merma DECIMAL(5,2) NOT NULL DEFAULT 0,
  rendimiento DECIMAL(5,2) NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de información nutricional
CREATE TABLE public.nutritional_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  calories INTEGER DEFAULT 0,
  protein DECIMAL(5,2) DEFAULT 0,
  carbs DECIMAL(5,2) DEFAULT 0,
  fat DECIMAL(5,2) DEFAULT 0,
  fiber DECIMAL(5,2) DEFAULT 0,
  vitamin_c DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de precios por país
CREATE TABLE public.ingredient_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  country_id UUID REFERENCES public.countries(id) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  season_variation TEXT,
  month INTEGER CHECK (month >= 1 AND month <= 12),
  year INTEGER DEFAULT EXTRACT(year FROM now()),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de usos profesionales
CREATE TABLE public.ingredient_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  use_description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de recetas destacadas
CREATE TABLE public.ingredient_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  time TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de variedades
CREATE TABLE public.ingredient_varieties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID REFERENCES public.ingredients(id) ON DELETE CASCADE NOT NULL,
  variety_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar categorías básicas
INSERT INTO public.categories (name, name_en, description) VALUES
('verduras', 'vegetables', 'Vegetales frescos y de temporada'),
('carnes', 'meats', 'Cortes profesionales y especialidades'),
('pescados', 'fish', 'Pescados y mariscos frescos'),
('hierbas', 'herbs', 'Hierbas aromáticas y medicinales'),
('especias', 'spices', 'Especias y condimentos'),
('lacteos', 'dairy', 'Productos lácteos y derivados'),
('aceites', 'oils', 'Aceites y grasas culinarias'),
('hongos', 'mushrooms', 'Hongos comestibles y trufas');

-- Insertar países básicos
INSERT INTO public.countries (name, code, currency, currency_symbol) VALUES
('España', 'ES', 'EUR', '€'),
('Francia', 'FR', 'EUR', '€'),
('Estados Unidos', 'US', 'USD', '$'),
('Italia', 'IT', 'EUR', '€'),
('México', 'MX', 'MXN', '$'),
('Argentina', 'AR', 'ARS', '$');

-- Crear índices para optimizar búsquedas
CREATE INDEX idx_ingredients_name ON public.ingredients(name);
CREATE INDEX idx_ingredients_category ON public.ingredients(category_id);
CREATE INDEX idx_ingredients_popularity ON public.ingredients(popularity DESC);
CREATE INDEX idx_ingredient_prices_country ON public.ingredient_prices(country_id);
CREATE INDEX idx_ingredient_prices_ingredient ON public.ingredient_prices(ingredient_id);

-- Habilitar RLS (Row Level Security) - para futuras funcionalidades de usuario
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_varieties ENABLE ROW LEVEL SECURITY;

-- Crear políticas públicas para lectura (por ahora todo público)
CREATE POLICY "Public read access" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.countries FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.nutritional_info FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.ingredient_prices FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.ingredient_uses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.ingredient_recipes FOR SELECT USING (true);
CREATE POLICY "Public read access" ON public.ingredient_varieties FOR SELECT USING (true);
