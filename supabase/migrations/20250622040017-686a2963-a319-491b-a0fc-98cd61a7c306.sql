
-- Crear función para eliminar ingrediente y todas sus dependencias de forma atómica
CREATE OR REPLACE FUNCTION delete_ingredient_cascade(ingredient_id UUID)
RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql;
