-- Fix remaining functions without search_path set (Security Linter Fix)

-- Fix generate_slug function
CREATE OR REPLACE FUNCTION public.generate_slug(input_text text)
RETURNS text
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- Fix auto_generate_slug function
CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
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
$$;

-- Fix delete_ingredient_cascade function
CREATE OR REPLACE FUNCTION public.delete_ingredient_cascade(ingredient_id uuid)
RETURNS json
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
    ingredient_name TEXT;
    deleted_prices INTEGER := 0;
    deleted_uses INTEGER := 0;
    deleted_recipes INTEGER := 0;
    deleted_varieties INTEGER := 0;
    deleted_nutritional INTEGER := 0;
    deleted_images INTEGER := 0;
    result JSON;
BEGIN
    -- Verificar que el ingrediente existe y obtener su nombre
    SELECT name INTO ingredient_name 
    FROM ingredients 
    WHERE id = ingredient_id;
    
    IF ingredient_name IS NULL THEN
        RAISE EXCEPTION 'Ingrediente no encontrado con ID: %', ingredient_id;
    END IF;
    
    -- Eliminar dependencias en orden (las FK constraints lo requieren)
    
    -- Eliminar precios
    DELETE FROM ingredient_prices WHERE ingredient_prices.ingredient_id = delete_ingredient_cascade.ingredient_id;
    GET DIAGNOSTICS deleted_prices = ROW_COUNT;
    
    -- Eliminar usos
    DELETE FROM ingredient_uses WHERE ingredient_uses.ingredient_id = delete_ingredient_cascade.ingredient_id;
    GET DIAGNOSTICS deleted_uses = ROW_COUNT;
    
    -- Eliminar recetas
    DELETE FROM ingredient_recipes WHERE ingredient_recipes.ingredient_id = delete_ingredient_cascade.ingredient_id;
    GET DIAGNOSTICS deleted_recipes = ROW_COUNT;
    
    -- Eliminar variedades
    DELETE FROM ingredient_varieties WHERE ingredient_varieties.ingredient_id = delete_ingredient_cascade.ingredient_id;
    GET DIAGNOSTICS deleted_varieties = ROW_COUNT;
    
    -- Eliminar información nutricional
    DELETE FROM nutritional_info WHERE nutritional_info.ingredient_id = delete_ingredient_cascade.ingredient_id;
    GET DIAGNOSTICS deleted_nutritional = ROW_COUNT;
    
    -- Eliminar imágenes reales
    DELETE FROM ingredient_real_images WHERE ingredient_real_images.ingredient_id = delete_ingredient_cascade.ingredient_id;
    GET DIAGNOSTICS deleted_images = ROW_COUNT;
    
    -- Finalmente eliminar el ingrediente principal
    DELETE FROM ingredients WHERE ingredients.id = delete_ingredient_cascade.ingredient_id;
    
    -- Preparar resultado con estadísticas
    result := json_build_object(
        'success', true,
        'ingredient_name', ingredient_name,
        'ingredient_id', ingredient_id,
        'deleted_counts', json_build_object(
            'prices', deleted_prices,
            'uses', deleted_uses,
            'recipes', deleted_recipes,
            'varieties', deleted_varieties,
            'nutritional_info', deleted_nutritional,
            'images', deleted_images
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al eliminar ingrediente "%": %', ingredient_name, SQLERRM;
END;
$$;

-- Fix delete_real_image_safe function
CREATE OR REPLACE FUNCTION public.delete_real_image_safe(image_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    image_record RECORD;
    result JSON;
BEGIN
    -- Verificar que la imagen existe y obtener información
    SELECT id, ingredient_id, image_url, caption, uploaded_by 
    INTO image_record
    FROM ingredient_real_images 
    WHERE id = image_id;
    
    IF image_record.id IS NULL THEN
        RAISE EXCEPTION 'Imagen no encontrada con ID: %', image_id;
    END IF;
    
    -- Eliminar la imagen
    DELETE FROM ingredient_real_images WHERE id = image_id;
    
    -- Preparar resultado
    result := json_build_object(
        'success', true,
        'deleted_image', json_build_object(
            'id', image_record.id,
            'ingredient_id', image_record.ingredient_id,
            'image_url', image_record.image_url,
            'caption', image_record.caption,
            'uploaded_by', image_record.uploaded_by
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al eliminar imagen: %', SQLERRM;
END;
$$;

-- Fix update_image_approval function  
CREATE OR REPLACE FUNCTION public.update_image_approval(image_id uuid, approved boolean)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    image_record RECORD;
    result JSON;
BEGIN
    -- Actualizar estado de aprobación
    UPDATE ingredient_real_images 
    SET is_approved = approved
    WHERE id = image_id
    RETURNING id, ingredient_id, image_url, caption, is_approved INTO image_record;
    
    IF image_record.id IS NULL THEN
        RAISE EXCEPTION 'Imagen no encontrada con ID: %', image_id;
    END IF;
    
    -- Preparar resultado
    result := json_build_object(
        'success', true,
        'updated_image', json_build_object(
            'id', image_record.id,
            'ingredient_id', image_record.ingredient_id,
            'image_url', image_record.image_url,
            'caption', image_record.caption,
            'is_approved', image_record.is_approved
        )
    );
    
    RETURN result;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al actualizar aprobación de imagen: %', SQLERRM;
END;
$$;