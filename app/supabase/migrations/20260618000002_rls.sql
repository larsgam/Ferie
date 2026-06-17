-- Helper: is the current user a participant of this trip?
create or replace function public.is_trip_member(p_trip_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.participants
    where participants.trip_id = p_trip_id
      and participants.user_id = auth.uid()
  );
$$;

-- On new auth user, link to the matching participant row(s) by email.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  update public.participants
    set user_id = new.id
    where lower(email) = lower(new.email) and user_id is null;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Enable RLS
alter table trips enable row level security;
alter table participants enable row level security;
alter table destinations enable row level security;
alter table activities enable row level security;
alter table days enable row level security;
alter table info_pages enable row level security;
alter table todos enable row level security;

-- Read policies (members only)
create policy trips_read on trips for select
  using (is_trip_member(id));
create policy participants_read on participants for select
  using (is_trip_member(trip_id));
create policy destinations_read on destinations for select
  using (is_trip_member(trip_id));
create policy activities_read on activities for select
  using (is_trip_member((select trip_id from destinations d where d.id = destination_id)));
create policy days_read on days for select
  using (is_trip_member(trip_id));
create policy info_read on info_pages for select
  using (is_trip_member(trip_id));
create policy todos_read on todos for select
  using (is_trip_member(trip_id));

-- Todos are writable by members (the one write feature in Phase 1)
create policy todos_update on todos for update
  using (is_trip_member(trip_id)) with check (is_trip_member(trip_id));
