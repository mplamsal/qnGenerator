-- Seed data for ExamForge
insert into schools (id, name) values
('11111111-1111-1111-1111-111111111111', 'Demo School')
on conflict do nothing;

insert into templates (id, school_id, name, config_json) values
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Template A', '{"header":"Demo Header","footer":"Page {page}"}'::jsonb)
on conflict do nothing;
