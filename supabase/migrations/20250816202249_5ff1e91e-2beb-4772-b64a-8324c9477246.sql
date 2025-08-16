-- Fix security vulnerability: Restrict access to page_views table
-- Currently it's publicly accessible which exposes user browsing behavior

-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "System can manage page views" ON page_views;

-- Create secure policies that protect user data
-- Allow anonymous users to INSERT page views (needed for tracking)
CREATE POLICY "Anonymous users can insert page views" 
ON page_views 
FOR INSERT 
WITH CHECK (true);

-- Only super admins can read analytics data
CREATE POLICY "Only super admins can read page views" 
ON page_views 
FOR SELECT 
USING (verify_super_admin_access());

-- Only super admins can update/delete for data management
CREATE POLICY "Only super admins can update page views" 
ON page_views 
FOR UPDATE 
USING (verify_super_admin_access());

CREATE POLICY "Only super admins can delete page views" 
ON page_views 
FOR DELETE 
USING (verify_super_admin_access());