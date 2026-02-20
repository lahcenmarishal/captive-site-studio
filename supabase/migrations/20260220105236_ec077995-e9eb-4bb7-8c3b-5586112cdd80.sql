
-- Table de logs d'accès API pour toutes les requêtes de licence
CREATE TABLE public.license_api_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  license_key_prefix TEXT,
  domain TEXT,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT NOT NULL, -- 'success' | 'rejected' | 'error'
  rejection_reason TEXT,
  request_timestamp BIGINT, -- unix ms envoyé par le client
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_license_api_logs_domain ON public.license_api_logs(domain);
CREATE INDEX idx_license_api_logs_created_at ON public.license_api_logs(created_at DESC);
CREATE INDEX idx_license_api_logs_status ON public.license_api_logs(status);

-- RLS activé : admins seulement
ALTER TABLE public.license_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view api logs"
  ON public.license_api_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Les edge functions écrivent via service_role (bypass RLS), pas besoin de policy INSERT pour users
