-- Create webhook endpoints table
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  secret TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'error')),
  retry_attempts INTEGER NOT NULL DEFAULT 3 CHECK (retry_attempts BETWEEN 1 AND 10),
  timeout_seconds INTEGER NOT NULL DEFAULT 30 CHECK (timeout_seconds BETWEEN 5 AND 300),
  success_rate NUMERIC(5,2) DEFAULT 0.0,
  last_delivery_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  headers JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Create webhook deliveries table for tracking delivery attempts
CREATE TABLE public.webhook_deliveries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  webhook_endpoint_id UUID NOT NULL,
  tenant_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  response_status INTEGER,
  response_body TEXT,
  response_time_ms INTEGER,
  delivered_at TIMESTAMP WITH TIME ZONE,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Create policies for webhook_endpoints
CREATE POLICY "Admins can manage webhook endpoints in their tenant"
ON public.webhook_endpoints
FOR ALL
USING (tenant_id = get_user_tenant_id() AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (tenant_id = get_user_tenant_id() AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can view webhook endpoints in their tenant"
ON public.webhook_endpoints
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create policies for webhook_deliveries
CREATE POLICY "System can manage webhook deliveries"
ON public.webhook_deliveries
FOR ALL
USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Users can view webhook deliveries in their tenant"
ON public.webhook_deliveries
FOR SELECT
USING (tenant_id = get_user_tenant_id());

-- Create indexes for performance
CREATE INDEX idx_webhook_endpoints_tenant_status ON public.webhook_endpoints(tenant_id, status);
CREATE INDEX idx_webhook_endpoints_events ON public.webhook_endpoints USING GIN(events);
CREATE INDEX idx_webhook_deliveries_webhook_endpoint ON public.webhook_deliveries(webhook_endpoint_id);
CREATE INDEX idx_webhook_deliveries_next_retry ON public.webhook_deliveries(next_retry_at) WHERE next_retry_at IS NOT NULL;
CREATE INDEX idx_webhook_deliveries_event_type ON public.webhook_deliveries(event_type);

-- Create function to update webhook endpoint success rate
CREATE OR REPLACE FUNCTION public.update_webhook_success_rate(webhook_id UUID)
RETURNS VOID
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.webhook_endpoints 
  SET success_rate = (
    SELECT CASE 
      WHEN COUNT(*) > 0 THEN 
        ROUND((COUNT(*) FILTER (WHERE response_status BETWEEN 200 AND 299)::NUMERIC / COUNT(*)) * 100, 2)
      ELSE 0.0
    END
    FROM public.webhook_deliveries 
    WHERE webhook_endpoint_id = webhook_id 
    AND created_at > now() - INTERVAL '30 days'
  ),
  last_delivery_at = (
    SELECT MAX(delivered_at) 
    FROM public.webhook_deliveries 
    WHERE webhook_endpoint_id = webhook_id 
    AND response_status BETWEEN 200 AND 299
  ),
  updated_at = now()
  WHERE id = webhook_id;
$$;

-- Create API monitoring table
CREATE TABLE public.api_monitoring (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL,
  endpoint_path TEXT NOT NULL,
  method TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_time_ms INTEGER NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on API monitoring
ALTER TABLE public.api_monitoring ENABLE ROW LEVEL SECURITY;

-- Create policy for API monitoring
CREATE POLICY "System can insert API monitoring data"
ON public.api_monitoring
FOR INSERT
WITH CHECK (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can view API monitoring data in their tenant"
ON public.api_monitoring
FOR SELECT
USING (tenant_id = get_user_tenant_id() AND has_role(auth.uid(), 'admin'::app_role));

-- Create indexes for API monitoring
CREATE INDEX idx_api_monitoring_tenant_endpoint ON public.api_monitoring(tenant_id, endpoint_path);
CREATE INDEX idx_api_monitoring_created_at ON public.api_monitoring(created_at);
CREATE INDEX idx_api_monitoring_response_status ON public.api_monitoring(response_status);

-- Create trigger for updating webhook endpoint timestamps
CREATE TRIGGER update_webhook_endpoints_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();