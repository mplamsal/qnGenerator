-- ExamForge database schema for local Postgres (no Supabase auth)

-- Drop in reverse order to allow reapply
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS question_papers CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS schools CASCADE;

-- schools
CREATE TABLE schools (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- users (local version; not referencing Supabase auth schema)
CREATE TABLE users (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  role text not null,
  name text,
  email text
);

-- templates
CREATE TABLE templates (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  name text not null,
  config_json jsonb not null,
  created_at timestamptz default now()
);

-- question_papers
CREATE TABLE question_papers (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  teacher_id uuid references users(id),
  template_id uuid references templates(id),
  metadata_json jsonb,
  status text default 'Draft',
  created_at timestamptz default now()
);

-- questions
CREATE TABLE questions (
  id uuid primary key default gen_random_uuid(),
  paper_id uuid references question_papers(id) on delete cascade,
  type text not null,
  question_text text,
  marks int,
  order_index int
);
