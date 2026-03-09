-- Add technologies column to portfolio_projects table
ALTER TABLE public.portfolio_projects 
ADD COLUMN technologies text[] DEFAULT '{}';

COMMENT ON COLUMN public.portfolio_projects.technologies IS 'List of technologies used in the project';