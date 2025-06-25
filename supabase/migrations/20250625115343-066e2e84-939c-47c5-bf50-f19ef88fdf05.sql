
-- Migración para limpiar slugs y mejorar la función de auto-generación
-- Paso 1: Limpiar slugs existentes removiendo sufijos UUID
UPDATE ingredients 
SET slug = CASE 
  WHEN slug ~ '-[0-9a-f]{8}$' THEN 
    regexp_replace(slug, '-[0-9a-f]{8}$', '')
  ELSE slug
END
WHERE slug ~ '-[0-9a-f]{8}$';

-- Paso 2: Actualizar la función auto_generate_slug para usar sufijos numéricos simples
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Solo generar slug si no se proporciona uno
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        base_slug := generate_slug(NEW.name);
        final_slug := base_slug;
        
        -- Verificar si el slug ya existe y agregar sufijo numérico simple si es necesario
        WHILE EXISTS (SELECT 1 FROM ingredients WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    ELSE
        -- Si se proporciona un slug manualmente, verificar unicidad
        final_slug := NEW.slug;
        counter := 1;
        
        WHILE EXISTS (SELECT 1 FROM ingredients WHERE slug = final_slug AND id != NEW.id) LOOP
            counter := counter + 1;
            final_slug := NEW.slug || '-' || counter;
        END LOOP;
        
        NEW.slug := final_slug;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Paso 3: Asegurar que todos los slugs existentes sean únicos
-- Identificar y resolver cualquier duplicado que pueda haber quedado
DO $$
DECLARE
    ingredient_record RECORD;
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER;
BEGIN
    -- Buscar ingredientes con slugs potencialmente duplicados
    FOR ingredient_record IN 
        SELECT id, name, slug
        FROM ingredients
        WHERE slug IN (
            SELECT slug 
            FROM ingredients 
            GROUP BY slug 
            HAVING COUNT(*) > 1
        )
        ORDER BY created_at
    LOOP
        base_slug := generate_slug(ingredient_record.name);
        final_slug := base_slug;
        counter := 1;
        
        -- Encontrar un slug único para este ingrediente
        WHILE EXISTS (
            SELECT 1 FROM ingredients 
            WHERE slug = final_slug 
            AND id != ingredient_record.id
        ) LOOP
            counter := counter + 1;
            final_slug := base_slug || '-' || counter;
        END LOOP;
        
        -- Actualizar solo si el slug cambió
        IF final_slug != ingredient_record.slug THEN
            UPDATE ingredients 
            SET slug = final_slug 
            WHERE id = ingredient_record.id;
        END IF;
    END LOOP;
END $$;
