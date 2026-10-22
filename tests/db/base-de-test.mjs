// Base de test en mémoire (PostgreSQL via PGlite) qui imite ce que Supabase
// fournit autour de nos migrations : rôles, schéma auth, schéma storage.
// On y applique ensuite les vraies migrations de supabase/migrations.
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DOSSIER_MIGRATIONS = new URL('../../supabase/migrations/', import.meta.url).pathname;

const SIMULATION_SUPABASE = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb);
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text not null, public boolean default false, file_size_limit bigint);
  create table storage.objects (
    id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id),
    name text not null, owner uuid);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
  $$;

  grant usage on schema public, auth, storage to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated;
  grant select, insert, update, delete on storage.objects to authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
  alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;
`;

export async function creerBase() {
  const db = new PGlite();
  await db.exec(SIMULATION_SUPABASE);
  const fichiers = readdirSync(DOSSIER_MIGRATIONS).filter((f) => f.endsWith('.sql')).sort();
  for (const fichier of fichiers) {
    await db.exec(readFileSync(join(DOSSIER_MIGRATIONS, fichier), 'utf8'));
  }
  return db;
}

/** Crée un compte, comme le fait Supabase à l'inscription. */
export async function creerCompte(db, email, metadonnees = {}) {
  const id = crypto.randomUUID();
  await db.query('reset role');
  await db.query('insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)', [
    id,
    email,
    metadonnees,
  ]);
  return id;
}

/** Exécute une requête « en tant que » ce bailleur, connecté à l'application. */
export async function enTantQue(db, idBailleur, sql, params = []) {
  await db.query('reset role');
  await db.query(`select set_config('request.jwt.claim.sub', $1, false)`, [idBailleur]);
  await db.query('set role authenticated');
  try {
    return await db.query(sql, params);
  } finally {
    await db.query('reset role');
  }
}

/** Exécute une requête avec les droits d'administration (hors application). */
export async function enAdmin(db, sql, params = []) {
  await db.query('reset role');
  return db.query(sql, params);
}
