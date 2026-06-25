-- InspectAid Agency OS initial Supabase schema.
-- Run this in the Supabase SQL editor for the development project.

create extension if not exists pgcrypto;

create table public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  jurisdiction text,
  state_code text,
  primary_domain text,
  status text not null default 'active',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.agency_environments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  environment_type text not null default 'production' check (environment_type in ('production', 'sandbox', 'demo')),
  slug text not null,
  public_url text,
  staff_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, environment_type),
  unique (slug)
);

create table public.agency_users (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  role text not null check (role in (
    'agency_admin',
    'implementation_support',
    'intake_staff',
    'inspector',
    'supervisor',
    'billing_admin',
    'public_user'
  )),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (agency_id, email)
);

create table public.template_library (
  id uuid primary key default gen_random_uuid(),
  owner_agency_id uuid references public.agencies(id) on delete set null,
  name text not null,
  program_type text not null,
  jurisdiction text,
  source_notes text,
  schema_snapshot jsonb not null default '{}'::jsonb,
  is_shareable boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.forms (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  template_id uuid references public.template_library(id) on delete set null,
  name text not null,
  program_type text not null,
  record_type text not null check (record_type in (
    'application',
    'permit',
    'inspection',
    'complaint',
    'invoice',
    'internal'
  )),
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.form_versions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid not null references public.forms(id) on delete cascade,
  version_number integer not null,
  status text not null default 'draft' check (status in ('ai_draft', 'admin_draft', 'published', 'archived')),
  schema jsonb not null default '{}'::jsonb,
  ai_summary jsonb not null default '{}'::jsonb,
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (form_id, version_number)
);

create table public.form_fields (
  id uuid primary key default gen_random_uuid(),
  form_version_id uuid not null references public.form_versions(id) on delete cascade,
  field_key text not null,
  label text not null,
  field_type text not null,
  section text not null default 'General',
  position integer not null default 0,
  required_mode text not null default 'false',
  visibility text not null default 'public_and_staff',
  edit_role text,
  properties jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (form_version_id, field_key)
);

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  name text not null,
  address jsonb not null default '{}'::jsonb,
  contacts jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  form_version_id uuid references public.form_versions(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  status text not null default 'submitted',
  applicant_email text,
  answers jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.permits (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  application_id uuid references public.applications(id) on delete set null,
  facility_id uuid not null references public.facilities(id) on delete cascade,
  permit_number text,
  permit_type text not null,
  status text not null default 'draft',
  issued_at timestamptz,
  expires_at timestamptz,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (agency_id, permit_number)
);

create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  facility_id uuid references public.facilities(id) on delete set null,
  permit_id uuid references public.permits(id) on delete set null,
  status text not null default 'received',
  source text not null default 'public',
  category text,
  narrative text,
  reporter jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  permit_id uuid references public.permits(id) on delete set null,
  facility_id uuid references public.facilities(id) on delete set null,
  complaint_id uuid references public.complaints(id) on delete set null,
  form_version_id uuid references public.form_versions(id) on delete set null,
  inspector_user_id uuid references auth.users(id) on delete set null,
  inspection_type text not null,
  status text not null default 'scheduled',
  scheduled_for timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  findings jsonb not null default '[]'::jsonb,
  offline_client_id text,
  sync_status text not null default 'server',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  permit_id uuid references public.permits(id) on delete set null,
  application_id uuid references public.applications(id) on delete set null,
  status text not null default 'draft',
  amount_cents integer not null default 0,
  line_items jsonb not null default '[]'::jsonb,
  due_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.attachments (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  record_type text not null,
  record_id uuid not null,
  storage_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes integer,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.sync_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  client_event_id text not null,
  record_type text not null,
  record_id uuid,
  operation text not null check (operation in ('create', 'update', 'delete')),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'received',
  conflict jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (agency_id, client_event_id)
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  record_type text not null,
  record_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create table public.agency_configuration_snapshots (
  id uuid primary key default gen_random_uuid(),
  agency_slug text not null,
  snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'draft',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.public_submissions (
  id uuid primary key default gen_random_uuid(),
  agency_slug text not null,
  form_key text not null,
  form_title text not null,
  record_type text not null check (record_type in ('application', 'complaint')),
  status text not null default 'submitted',
  source text not null default 'public',
  answers jsonb not null default '{}'::jsonb,
  applicant_email text,
  converted_record_type text,
  converted_record_id uuid,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index forms_agency_idx on public.forms(agency_id);
create index agency_environments_agency_idx on public.agency_environments(agency_id);
create index form_versions_form_idx on public.form_versions(form_id);
create index form_fields_version_idx on public.form_fields(form_version_id);
create index facilities_agency_idx on public.facilities(agency_id);
create index applications_agency_idx on public.applications(agency_id);
create index permits_agency_idx on public.permits(agency_id);
create index complaints_agency_idx on public.complaints(agency_id);
create index inspections_agency_idx on public.inspections(agency_id);
create index inspections_offline_client_idx on public.inspections(agency_id, offline_client_id);
create index sync_events_agency_idx on public.sync_events(agency_id, status);
create index audit_events_record_idx on public.audit_events(agency_id, record_type, record_id);
create index public_submissions_agency_idx on public.public_submissions(agency_slug, status);
create index agency_configuration_snapshots_agency_idx on public.agency_configuration_snapshots(agency_slug, created_at desc);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger touch_agencies_updated_at before update on public.agencies
  for each row execute function public.touch_updated_at();
create trigger touch_agency_environments_updated_at before update on public.agency_environments
  for each row execute function public.touch_updated_at();
create trigger touch_template_library_updated_at before update on public.template_library
  for each row execute function public.touch_updated_at();
create trigger touch_forms_updated_at before update on public.forms
  for each row execute function public.touch_updated_at();
create trigger touch_facilities_updated_at before update on public.facilities
  for each row execute function public.touch_updated_at();
create trigger touch_applications_updated_at before update on public.applications
  for each row execute function public.touch_updated_at();
create trigger touch_permits_updated_at before update on public.permits
  for each row execute function public.touch_updated_at();
create trigger touch_complaints_updated_at before update on public.complaints
  for each row execute function public.touch_updated_at();
create trigger touch_inspections_updated_at before update on public.inspections
  for each row execute function public.touch_updated_at();
create trigger touch_invoices_updated_at before update on public.invoices
  for each row execute function public.touch_updated_at();
create trigger touch_public_submissions_updated_at before update on public.public_submissions
  for each row execute function public.touch_updated_at();

alter table public.agencies enable row level security;
alter table public.agency_environments enable row level security;
alter table public.agency_users enable row level security;
alter table public.template_library enable row level security;
alter table public.forms enable row level security;
alter table public.form_versions enable row level security;
alter table public.form_fields enable row level security;
alter table public.facilities enable row level security;
alter table public.applications enable row level security;
alter table public.permits enable row level security;
alter table public.complaints enable row level security;
alter table public.inspections enable row level security;
alter table public.invoices enable row level security;
alter table public.attachments enable row level security;
alter table public.sync_events enable row level security;
alter table public.audit_events enable row level security;
alter table public.agency_configuration_snapshots enable row level security;
alter table public.public_submissions enable row level security;

create or replace function public.user_has_agency_access(target_agency_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agency_users
    where agency_users.agency_id = target_agency_id
      and agency_users.user_id = auth.uid()
      and agency_users.status = 'active'
  );
$$;

create or replace function public.user_has_agency_role(target_agency_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.agency_users
    where agency_users.agency_id = target_agency_id
      and agency_users.user_id = auth.uid()
      and agency_users.status = 'active'
      and agency_users.role = any(allowed_roles)
  );
$$;

create policy "agency members can read agencies"
  on public.agencies for select
  using (public.user_has_agency_access(id));

create policy "agency admins can update agencies"
  on public.agencies for update
  using (public.user_has_agency_role(id, array['agency_admin', 'implementation_support']));

create policy "agency members can read environments"
  on public.agency_environments for select
  using (public.user_has_agency_access(agency_id));

create policy "agency admins can manage environments"
  on public.agency_environments for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support']));

create policy "agency members can read agency users"
  on public.agency_users for select
  using (public.user_has_agency_access(agency_id));

create policy "admins manage agency users"
  on public.agency_users for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support']));

create policy "members read template library"
  on public.template_library for select
  using (is_shareable or owner_agency_id is null or public.user_has_agency_access(owner_agency_id));

create policy "admins manage template library"
  on public.template_library for all
  using (owner_agency_id is null or public.user_has_agency_role(owner_agency_id, array['agency_admin', 'implementation_support']))
  with check (owner_agency_id is null or public.user_has_agency_role(owner_agency_id, array['agency_admin', 'implementation_support']));

create policy "members read forms"
  on public.forms for select
  using (public.user_has_agency_access(agency_id));

create policy "admins manage forms"
  on public.forms for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support']));

create policy "members read form versions"
  on public.form_versions for select
  using (exists (
    select 1 from public.forms
    where forms.id = form_versions.form_id
      and public.user_has_agency_access(forms.agency_id)
  ));

create policy "admins manage form versions"
  on public.form_versions for all
  using (exists (
    select 1 from public.forms
    where forms.id = form_versions.form_id
      and public.user_has_agency_role(forms.agency_id, array['agency_admin', 'implementation_support'])
  ))
  with check (exists (
    select 1 from public.forms
    where forms.id = form_versions.form_id
      and public.user_has_agency_role(forms.agency_id, array['agency_admin', 'implementation_support'])
  ));

create policy "members read form fields"
  on public.form_fields for select
  using (exists (
    select 1
    from public.form_versions
    join public.forms on forms.id = form_versions.form_id
    where form_versions.id = form_fields.form_version_id
      and public.user_has_agency_access(forms.agency_id)
  ));

create policy "admins manage form fields"
  on public.form_fields for all
  using (exists (
    select 1
    from public.form_versions
    join public.forms on forms.id = form_versions.form_id
    where form_versions.id = form_fields.form_version_id
      and public.user_has_agency_role(forms.agency_id, array['agency_admin', 'implementation_support'])
  ))
  with check (exists (
    select 1
    from public.form_versions
    join public.forms on forms.id = form_versions.form_id
    where form_versions.id = form_fields.form_version_id
      and public.user_has_agency_role(forms.agency_id, array['agency_admin', 'implementation_support'])
  ));

create policy "members read facilities" on public.facilities for select
  using (public.user_has_agency_access(agency_id));
create policy "staff manage facilities" on public.facilities for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor']));

create policy "members read applications" on public.applications for select
  using (public.user_has_agency_access(agency_id));
create policy "staff manage applications" on public.applications for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'supervisor']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'supervisor']));

create policy "members read permits" on public.permits for select
  using (public.user_has_agency_access(agency_id));
create policy "staff manage permits" on public.permits for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'supervisor']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'supervisor']));

create policy "members read complaints" on public.complaints for select
  using (public.user_has_agency_access(agency_id));
create policy "staff manage complaints" on public.complaints for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor']));

create policy "members read inspections" on public.inspections for select
  using (public.user_has_agency_access(agency_id));
create policy "inspection staff manage inspections" on public.inspections for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'inspector', 'supervisor']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'inspector', 'supervisor']));

create policy "members read invoices" on public.invoices for select
  using (public.user_has_agency_access(agency_id));
create policy "billing staff manage invoices" on public.invoices for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'billing_admin', 'supervisor']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'billing_admin', 'supervisor']));

create policy "members read attachments" on public.attachments for select
  using (public.user_has_agency_access(agency_id));
create policy "staff manage attachments" on public.attachments for all
  using (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor', 'billing_admin']))
  with check (public.user_has_agency_role(agency_id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor', 'billing_admin']));

create policy "members create sync events" on public.sync_events for insert
  with check (public.user_has_agency_access(agency_id));
create policy "members read own sync events" on public.sync_events for select
  using (public.user_has_agency_access(agency_id));

create policy "members read audit events" on public.audit_events for select
  using (public.user_has_agency_access(agency_id));
create policy "staff create audit events" on public.audit_events for insert
  with check (public.user_has_agency_access(agency_id));

create policy "admins read configuration snapshots" on public.agency_configuration_snapshots for select
  using (exists (
    select 1 from public.agencies
    where agencies.slug = agency_configuration_snapshots.agency_slug
      and public.user_has_agency_role(agencies.id, array['agency_admin', 'implementation_support'])
  ));

create policy "admins create configuration snapshots" on public.agency_configuration_snapshots for insert
  with check (exists (
    select 1 from public.agencies
    where agencies.slug = agency_configuration_snapshots.agency_slug
      and public.user_has_agency_role(agencies.id, array['agency_admin', 'implementation_support'])
  ));

create policy "public can submit intake" on public.public_submissions for insert
  with check (true);

create policy "staff read public submissions" on public.public_submissions for select
  using (exists (
    select 1 from public.agencies
    where agencies.slug = public_submissions.agency_slug
      and public.user_has_agency_role(agencies.id, array['agency_admin', 'implementation_support', 'intake_staff', 'inspector', 'supervisor'])
  ));

create policy "staff update public submissions" on public.public_submissions for update
  using (exists (
    select 1 from public.agencies
    where agencies.slug = public_submissions.agency_slug
      and public.user_has_agency_role(agencies.id, array['agency_admin', 'implementation_support', 'intake_staff', 'supervisor'])
  ))
  with check (exists (
    select 1 from public.agencies
    where agencies.slug = public_submissions.agency_slug
      and public.user_has_agency_role(agencies.id, array['agency_admin', 'implementation_support', 'intake_staff', 'supervisor'])
  ));
