
-- Crear función para eliminar imágenes reales de forma segura
CREATE OR REPLACE FUNCTION public.delete_real_image_safe(image_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Crear función para actualizar estado de aprobación
CREATE OR REPLACE FUNCTION public.update_image_approval(image_id UUID, approved BOOLEAN)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Agregar política para que super admins puedan eliminar
CREATE POLICY "Super admins can delete images" 
ON public.ingredient_real_images 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);

-- Agregar política para que super admins puedan actualizar aprobación
CREATE POLICY "Super admins can update approval" 
ON public.ingredient_real_images 
FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() AND role = 'super_admin'
    )
);
