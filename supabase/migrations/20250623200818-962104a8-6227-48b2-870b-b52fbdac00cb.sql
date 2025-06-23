
-- Create storage bucket for ingredient images
INSERT INTO storage.buckets (id, name, public)
VALUES ('ingredient-images', 'ingredient-images', true);

-- Create policies for the ingredient-images bucket
CREATE POLICY "Allow public read access to ingredient images"
ON storage.objects FOR SELECT
USING (bucket_id = 'ingredient-images');

CREATE POLICY "Allow authenticated users to upload ingredient images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ingredient-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update ingredient images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ingredient-images' AND auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete ingredient images"
ON storage.objects FOR DELETE
USING (bucket_id = 'ingredient-images' AND auth.role() = 'authenticated');
