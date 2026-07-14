
CREATE OR REPLACE FUNCTION public.storage_path_company(_name text)
RETURNS uuid
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN _name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/'
    THEN (split_part(_name, '/', 1))::uuid
    ELSE NULL
  END
$$;
