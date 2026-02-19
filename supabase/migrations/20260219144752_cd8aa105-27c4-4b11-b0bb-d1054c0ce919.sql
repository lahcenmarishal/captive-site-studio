
-- Extension for hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Table licenses
CREATE TABLE public.licenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_key_hash TEXT NOT NULL UNIQUE,
  license_key_prefix TEXT NOT NULL, -- first 8 chars for display
  email TEXT NOT NULL,
  product_id TEXT NOT NULL DEFAULT 'prodevelo-template',
  allowed_domains TEXT[] NOT NULL DEFAULT '{}',
  max_activations INTEGER NOT NULL DEFAULT 1,
  current_activations INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
  expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table license_activations (logs)
CREATE TABLE public.license_activations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  deactivated_at TIMESTAMP WITH TIME ZONE,
  ip_address TEXT,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;

-- RLS: Admins can manage licenses
CREATE POLICY "Admins can view licenses"
  ON public.licenses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert licenses"
  ON public.licenses FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update licenses"
  ON public.licenses FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete licenses"
  ON public.licenses FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS: Admins can manage activations
CREATE POLICY "Admins can view activations"
  ON public.license_activations FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activations"
  ON public.license_activations FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update activations"
  ON public.license_activations FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Index for performance
CREATE INDEX idx_license_activations_license_id ON public.license_activations(license_id);
CREATE INDEX idx_license_activations_domain ON public.license_activations(domain);
CREATE INDEX idx_licenses_status ON public.licenses(status);
CREATE INDEX idx_licenses_email ON public.licenses(email);

-- Enable realtime for admin dashboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.licenses;
ALTER PUBLICATION supabase_realtime ADD TABLE public.license_activations;
