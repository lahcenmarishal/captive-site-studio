
-- Catalogue items (websites for sale)
CREATE TABLE public.catalogue_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Site vitrine',
  price NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  features TEXT[] NOT NULL DEFAULT '{}',
  image_url TEXT,
  demo_url TEXT,
  published BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.catalogue_items TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalogue_items TO authenticated;
GRANT ALL ON public.catalogue_items TO service_role;

ALTER TABLE public.catalogue_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published items"
  ON public.catalogue_items FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all items"
  ON public.catalogue_items FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage items"
  ON public.catalogue_items FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_catalogue_items_updated_at
  BEFORE UPDATE ON public.catalogue_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Catalogue requests (visitor wants to acquire a site)
CREATE TABLE public.catalogue_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.catalogue_items(id) ON DELETE SET NULL,
  item_title TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT INSERT ON public.catalogue_requests TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.catalogue_requests TO authenticated;
GRANT ALL ON public.catalogue_requests TO service_role;

ALTER TABLE public.catalogue_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a catalogue request"
  ON public.catalogue_requests FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view catalogue requests"
  ON public.catalogue_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update catalogue requests"
  ON public.catalogue_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete catalogue requests"
  ON public.catalogue_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.catalogue_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.catalogue_requests;
