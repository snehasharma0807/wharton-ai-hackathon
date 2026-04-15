-- ============================================================
-- Gap Intelligence — Supabase schema
-- Paste this entire file into Supabase → SQL Editor → Run
-- ============================================================

-- Drop in reverse-dependency order so re-runs are safe
drop table if exists gap_scores_cache;
drop table if exists gap_answers;
drop table if exists review_sessions;

-- ------------------------------------------------------------
-- review_sessions
-- ------------------------------------------------------------
create table review_sessions (
  id          uuid        primary key default gen_random_uuid(),
  session_id  text        not null,
  property_id text        not null,
  created_at  timestamptz not null default now(),
  input_mode  text,
  star_rating integer
);

create index idx_review_sessions_session_id  on review_sessions (session_id);
create index idx_review_sessions_property_id on review_sessions (property_id);

-- ------------------------------------------------------------
-- gap_answers  (no FK — simpler, avoids cache / ordering issues)
-- ------------------------------------------------------------
create table gap_answers (
  id              uuid        primary key default gen_random_uuid(),
  session_id      text        not null,
  property_id     text        not null,
  gap_category    text        not null,
  selected_option text,
  free_text       text,
  submitted_at    timestamptz not null default now()
);

create index idx_gap_answers_session_id  on gap_answers (session_id);
create index idx_gap_answers_property_id on gap_answers (property_id);
create index idx_gap_answers_category    on gap_answers (gap_category);

-- ------------------------------------------------------------
-- gap_scores_cache
-- ------------------------------------------------------------
create table gap_scores_cache (
  property_id   text primary key,
  scores        jsonb,
  last_computed timestamptz not null default now()
);
