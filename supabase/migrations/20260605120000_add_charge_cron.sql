create extension if not exists pg_cron with schema extensions;
create extension if not exists pg_net with schema extensions;
create extension if not exists supabase_vault with schema vault;

-- Runs every day at 12:00 UTC, which is 9am BRT.
-- Requires a Supabase Vault secret named DROPI_SERVICE_ROLE_KEY.
select cron.unschedule('dropi-daily-schedule-charges')
where exists (
  select 1 from cron.job where jobname = 'dropi-daily-schedule-charges'
);

select cron.schedule(
  'dropi-daily-schedule-charges',
  '0 12 * * *',
  $$
  select net.http_post(
    url := 'https://gvysnzzkeyhuwuonlomq.supabase.co/functions/v1/schedule-charges',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'DROPI_SERVICE_ROLE_KEY'
        limit 1
      )
    ),
    body := '{}'::jsonb
  );
  $$
);
