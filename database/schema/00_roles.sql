-- ===================================================================
-- Wixfox Minecraft Network — Database Roles & Least-Privilege Access
-- Implementation of Finding 6 (SEC-003, SEC-010)
-- File: /docker-entrypoint-initdb.d/00_roles.sql
-- ===================================================================

-- 1. Create Dedicated Application User (wixfox_app)
-- Restricted strictly to DML (SELECT, INSERT, UPDATE, DELETE)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'wixfox_app') THEN
        CREATE ROLE wixfox_app WITH LOGIN PASSWORD 'change_in_production_app_secret';
    END IF;
END
$$;

-- 2. Create Dedicated Schema Migration User (wixfox_migration)
-- Granted DDL privileges for versioned schema upgrades
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'wixfox_migration') THEN
        CREATE ROLE wixfox_migration WITH LOGIN PASSWORD 'change_in_production_migration_secret';
    END IF;
END
$$;

-- 3. Create Dedicated Backup User (wixfox_backup)
-- Restricted strictly to read-only pg_dump operations
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'wixfox_backup') THEN
        CREATE ROLE wixfox_backup WITH LOGIN PASSWORD 'change_in_production_backup_secret';
    END IF;
END
$$;

-- 4. Create Dedicated Analytics/Reporting User (wixfox_readonly)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'wixfox_readonly') THEN
        CREATE ROLE wixfox_readonly WITH LOGIN PASSWORD 'change_in_production_readonly_secret';
    END IF;
END
$$;

-- -------------------------------------------------------------------
-- Privilege Granting Matrix (Least Privilege)
-- -------------------------------------------------------------------

-- Revoke all default public permissions on public schema
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO wixfox_app, wixfox_migration, wixfox_backup, wixfox_readonly;

-- wixfox_migration permissions: Full DDL control
GRANT ALL PRIVILEGES ON SCHEMA public TO wixfox_migration;

-- wixfox_app permissions: DML only on current and future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO wixfox_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO wixfox_app;

-- wixfox_backup & wixfox_readonly permissions: Read-only access
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO wixfox_backup, wixfox_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON SEQUENCES TO wixfox_backup, wixfox_readonly;
