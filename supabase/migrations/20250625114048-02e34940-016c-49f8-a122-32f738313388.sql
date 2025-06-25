
-- Agregar campo slug a la tabla ingredients
ALTER TABLE ingredients ADD COLUMN slug TEXT;

-- Crear índice único para el slug (importante para SEO y rendimiento)
CREATE UNIQUE INDEX idx_ingredients_slug ON ingredients(slug);

-- Función para generar slug desde nombre
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug_text TEXT;
BEGIN
    -- Convertir a minúsculas, reemplazar espacios y caracteres especiales
    slug_text := lower(input_text);
    slug_text := regexp_replace(slug_text, '[áàäâã]', 'a', 'g');
    slug_text := regexp_replace(slug_text, '[éèëê]', 'e', 'g');
    slug_text := regexp_replace(slug_text, '[íìïî]', 'i', 'g');
    slug_text := regexp_replace(slug_text, '[óòöôõ]', 'o', 'g');
    slug_text := regexp_replace(slug_text, '[úùüû]', 'u', 'g');
    slug_text := regexp_replace(slug_text, 'ñ', 'n', 'g');
    slug_text := regexp_replace(slug_text, 'ç', 'c', 'g');
    slug_text := regexp_replace(slug_text, '[^a-z0-9\s-]', '', 'g');
    slug_text := regexp_replace(slug_text, '\s+', '-', 'g');
    slug_text := regexp_replace(slug_text, '-+', '-', 'g');
    slug_text := trim(slug_text, '-');
    
    RETURN slug_text;
END;
$$ LANGUAGE plpgsql;

-- Generar slugs para ingredientes existentes
UPDATE ingredients 
SET slug = generate_slug(name) || '-' || substr(id::text, 1, 8)
WHERE slug IS NULL;

-- Hacer el campo slug obligatorio después de llenar los datos existentes
ALTER TABLE ingredients ALTER COLUMN slug SET NOT NULL;

-- Función trigger para generar slug automáticamente en nuevos ingredientes
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Solo generar slug si no se proporciona uno
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := generate_slug(NEW.name);
        final_slug := base_slug;
        
        -- Verificar si el slug ya existe y agregar sufijo si es necesario
        WHILE EXISTS (SELECT 1 FROM ingredients WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para nuevos ingredientes
CREATE TRIGGER trigger_auto_generate_slug
    BEFORE INSERT OR UPDATE ON ingredients
    FOR EACH ROW
    EXECUTE FUNCTION auto_generate_slug();
