create extension if not exists "pgcrypto";

create table trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  start_date date,
  end_date date,
  cover_url text,
  created_at timestamptz default now()
);

create table participants (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  email text not null,
  user_id uuid references auth.users(id),
  role text default 'member',
  unique (trip_id, email)
);

create table destinations (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  lat double precision,
  lng double precision,
  arrival_date date,
  nights int,
  sort_order int default 0
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid not null references destinations(id) on delete cascade,
  name text not null,
  category text not null default 'sight',
  description text,
  price_text text,
  duration_min int,
  opening_hours text,
  lat double precision,
  lng double precision,
  url text,
  tags text[] default '{}',
  source text
);

create table days (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  date date,
  destination_id uuid references destinations(id) on delete set null,
  title text,
  sort_order int default 0
);

create table info_pages (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  slug text not null,
  title text not null,
  body_md text not null,
  unique (trip_id, slug)
);

create table todos (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  text text not null,
  done boolean default false,
  assignee text,
  sort_order int default 0
);
