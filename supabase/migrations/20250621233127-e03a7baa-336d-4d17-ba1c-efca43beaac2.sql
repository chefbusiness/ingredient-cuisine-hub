
-- Corrección directa de categorización de especias
-- Primero obtenemos el ID de la categoría "especias"
-- Luego actualizamos los ingredientes específicos que deben estar en esa categoría

UPDATE ingredients 
SET category_id = (
  SELECT id FROM categories WHERE name = 'especias' LIMIT 1
)
WHERE name IN (
  'Pimentón',
  'Pimienta negra', 
  'Azafrán',
  'Canela',
  'Clavo',
  'Comino',
  'Nuez moscada',
  'Orégano',
  'Laurel',
  'Tomillo'
);

-- Verificar el resultado
SELECT 
  i.name as ingrediente,
  c.name as categoria_actual
FROM ingredients i
JOIN categories c ON i.category_id = c.id
WHERE i.name IN (
  'Pimentón',
  'Pimienta negra', 
  'Azafrán',
  'Canela',
  'Clavo',
  'Comino',
  'Nuez moscada',
  'Orégano',
  'Laurel',
  'Tomillo'
)
ORDER BY i.name;
