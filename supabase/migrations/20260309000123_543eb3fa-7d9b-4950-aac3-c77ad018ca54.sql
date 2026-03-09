-- Create storage bucket for portfolio images
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true);

-- Create RLS policies for portfolio-images bucket
CREATE POLICY "Admins can upload portfolio images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update portfolio images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete portfolio images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-images' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Anyone can view portfolio images"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-images');

-- Add site_title column to portfolio_projects
ALTER TABLE public.portfolio_projects
ADD COLUMN site_title TEXT;

-- Update existing projects: move description to site_title
UPDATE public.portfolio_projects
SET site_title = description,
    description = '';

-- Make site_title required for future inserts
ALTER TABLE public.portfolio_projects
ALTER COLUMN site_title SET NOT NULL;