
-- Insertar nuevas categorías
INSERT INTO categories (name, name_en, description) VALUES
('frutas', 'fruits', 'Frutas frescas y procesadas'),
('aditivos alimentarios', 'food additives', 'Aditivos y conservantes alimentarios'),
('condimentos', 'condiments', 'Condimentos y especias para sazonar'),
('bebidas', 'beverages', 'Bebidas y líquidos'),
('granos y cereales', 'grains and cereals', 'Granos, cereales y derivados'),
('frutos secos', 'nuts', 'Frutos secos y semillas'),
('endulzantes', 'sweeteners', 'Endulzantes naturales y artificiales');

-- Insertar nuevos países
INSERT INTO countries (name, code, currency, currency_symbol) VALUES
('Chile', 'CL', 'CLP', '$'),
('Colombia', 'CO', 'COP', '$'),
('Perú', 'PE', 'PEN', 'S/'),
('Brasil', 'BR', 'BRL', 'R$'),
('Reino Unido', 'GB', 'GBP', '£'),
('Alemania', 'DE', 'EUR', '€');
