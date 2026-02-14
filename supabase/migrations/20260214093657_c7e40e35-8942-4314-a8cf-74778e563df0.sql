
-- Add new columns for pipeline tracking
ALTER TABLE public.demo_requests 
  ADD COLUMN IF NOT EXISTS demo_sent_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_date timestamp with time zone,
  ADD COLUMN IF NOT EXISTS payment_amount numeric,
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false;

-- Migrate old statuses to new pipeline statuses
UPDATE public.demo_requests SET status = 'nouvelle_demande' WHERE status = 'nouveau';
UPDATE public.demo_requests SET status = 'interesse' WHERE status = 'en cours';
UPDATE public.demo_requests SET status = 'paye' WHERE status = 'terminé';
UPDATE public.demo_requests SET status = 'non_qualifie' WHERE status = 'rejeté';
