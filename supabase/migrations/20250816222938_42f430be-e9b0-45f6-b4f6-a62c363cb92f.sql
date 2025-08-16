-- Remove the broad "Public read access" policy from ingredient_real_images
DROP POLICY IF EXISTS "Public read access" ON ingredient_real_images;

-- The "Public can read approved images" policy should remain:
-- Policy: "Public can read approved images" (SELECT, is_approved = true)
-- This ensures only approved images are visible to the public

-- Verify no other tables have conflicting broad public policies
-- This is a cleanup to ensure we don't have duplicate conflicting policies