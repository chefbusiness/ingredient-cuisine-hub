-- Fix security vulnerability: Ensure profiles table properly restricts access to user data
-- Verify RLS is enabled and policies are correctly configured

-- First, ensure RLS is enabled on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public read access" ON public.profiles;

-- Create secure policies that only allow users to access their own data
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Allow super admins to view all profiles for admin purposes (optional)
CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (verify_super_admin_access());

-- Allow super admins to update any profile for admin purposes (optional)
CREATE POLICY "Super admins can update any profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (verify_super_admin_access()) 
WITH CHECK (verify_super_admin_access());

-- Ensure no anonymous access to profiles whatsoever
-- (No policies for anonymous users = no access)