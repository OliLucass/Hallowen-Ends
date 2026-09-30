-- Halloween 2026 — banco compartilhado simples para 2 pessoas
-- Cole tudo no SQL Editor do Supabase e clique em Run.

create table if not exists public.halloween_state (
  id bigint primary key,
  state jsonb not null,
  updated_at timestamptz not null default now()
);

insert into public.halloween_state (id, state)
values (1, '{"names":["Eu","Você"],"days":{}}'::jsonb)
on conflict (id) do nothing;

alter table public.halloween_state enable row level security;

drop policy if exists "halloween public read" on public.halloween_state;
drop policy if exists "halloween public insert" on public.halloween_state;
drop policy if exists "halloween public update" on public.halloween_state;

create policy "halloween public read"
on public.halloween_state for select
to anon, authenticated
using (true);

create policy "halloween public insert"
on public.halloween_state for insert
to anon, authenticated
with check (id = 1);

create policy "halloween public update"
on public.halloween_state for update
to anon, authenticated
using (id = 1)
with check (id = 1);

-- Realtime para que uma pessoa veja as alterações da outra sem atualizar a página.
alter publication supabase_realtime add table public.halloween_state;
