-- ===================================================================
-- Wixfox Migration V1: Initial Schema (PostgreSQL 16)
-- ===================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PLAYERS TABLE
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'BANNED', 'SUSPENDED'))
);
CREATE INDEX IF NOT EXISTS idx_players_username ON players(LOWER(username));

-- 2. PLAYER IDENTITIES TABLE
CREATE TABLE IF NOT EXISTS player_identities (
    id BIGSERIAL PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('JAVA', 'BEDROCK')),
    platform_uuid VARCHAR(64) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    verified_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_platform_identity UNIQUE (platform, platform_uuid)
);
CREATE INDEX IF NOT EXISTS idx_player_identities_uuid ON player_identities(platform_uuid);
CREATE INDEX IF NOT EXISTS idx_player_identities_player_id ON player_identities(player_id);

-- 3. PLAYER PROFILES TABLE
CREATE TABLE IF NOT EXISTS player_profiles (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    first_login TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_ip VARCHAR(45),
    playtime_seconds BIGINT NOT NULL DEFAULT 0,
    account_status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX IF NOT EXISTS idx_player_profiles_last_login ON player_profiles(last_login);

-- 4. PLAYER STATISTICS TABLE
CREATE TABLE IF NOT EXISTS player_statistics (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    kills INT NOT NULL DEFAULT 0 CHECK (kills >= 0),
    deaths INT NOT NULL DEFAULT 0 CHECK (deaths >= 0),
    mob_kills INT NOT NULL DEFAULT 0 CHECK (mob_kills >= 0),
    blocks_broken BIGINT NOT NULL DEFAULT 0 CHECK (blocks_broken >= 0),
    blocks_placed BIGINT NOT NULL DEFAULT 0 CHECK (blocks_placed >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. PLAYER BALANCES TABLE
CREATE TABLE IF NOT EXISTS player_balances (
    player_id UUID PRIMARY KEY REFERENCES players(id) ON DELETE CASCADE,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 1000.00 CHECK (balance >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_player_balances_balance ON player_balances(balance DESC);

-- 6. ECONOMY TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS economy_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES players(id) ON DELETE SET NULL,
    receiver_id UUID REFERENCES players(id) ON DELETE SET NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
    transaction_type VARCHAR(32) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_eco_transactions_sender ON economy_transactions(sender_id);
CREATE INDEX IF NOT EXISTS idx_eco_transactions_receiver ON economy_transactions(receiver_id);
CREATE INDEX IF NOT EXISTS idx_eco_transactions_created_at ON economy_transactions(created_at DESC);

-- 7. RANKS TABLE
CREATE TABLE IF NOT EXISTS ranks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE,
    display_name VARCHAR(64) NOT NULL,
    prefix VARCHAR(64) NOT NULL,
    weight INT NOT NULL DEFAULT 0,
    is_staff BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_ranks_weight ON ranks(weight DESC);

-- 8. PLAYER RANKS TABLE
CREATE TABLE IF NOT EXISTS player_ranks (
    id BIGSERIAL PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    rank_id INT NOT NULL REFERENCES ranks(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    assigned_by VARCHAR(64) DEFAULT 'Console',
    CONSTRAINT uq_player_rank UNIQUE (player_id, rank_id)
);
CREATE INDEX IF NOT EXISTS idx_player_ranks_player_id ON player_ranks(player_id);
CREATE INDEX IF NOT EXISTS idx_player_ranks_expires_at ON player_ranks(expires_at);

-- 9. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    rank_id INT NOT NULL REFERENCES ranks(id) ON DELETE CASCADE,
    permission_node VARCHAR(128) NOT NULL,
    value BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT uq_rank_permission UNIQUE (rank_id, permission_node)
);
CREATE INDEX IF NOT EXISTS idx_permissions_rank_id ON permissions(rank_id);

-- 10. PUNISHMENTS TABLE
CREATE TABLE IF NOT EXISTS punishments (
    id BIGSERIAL PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    punishment_type VARCHAR(20) NOT NULL CHECK (punishment_type IN ('BAN', 'MUTE', 'WARN', 'KICK')),
    reason TEXT NOT NULL,
    punisher_name VARCHAR(64) NOT NULL DEFAULT 'Console',
    punished_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    unpunished_at TIMESTAMPTZ,
    unpunisher_name VARCHAR(64)
);
CREATE INDEX IF NOT EXISTS idx_punishments_player_active ON punishments(player_id, is_active);
CREATE INDEX IF NOT EXISTS idx_punishments_expires_at ON punishments(expires_at);

-- 11. PLAYER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS player_sessions (
    id BIGSERIAL PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    server_name VARCHAR(64) NOT NULL DEFAULT 'wixfox-smp',
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    quit_at TIMESTAMPTZ,
    duration_seconds INT DEFAULT 0,
    ip_address VARCHAR(45)
);
CREATE INDEX IF NOT EXISTS idx_player_sessions_player_id ON player_sessions(player_id);
CREATE INDEX IF NOT EXISTS idx_player_sessions_joined_at ON player_sessions(joined_at DESC);

-- 12. SERVERS TABLE
CREATE TABLE IF NOT EXISTS servers (
    id SERIAL PRIMARY KEY,
    server_name VARCHAR(64) NOT NULL UNIQUE,
    server_type VARCHAR(32) NOT NULL DEFAULT 'PAPER',
    host VARCHAR(128) NOT NULL DEFAULT 'minecraft',
    port INT NOT NULL DEFAULT 25565,
    max_players INT NOT NULL DEFAULT 20,
    is_online BOOLEAN NOT NULL DEFAULT FALSE,
    last_heartbeat TIMESTAMPTZ
);

-- 13. PLAYER ACHIEVEMENTS TABLE
CREATE TABLE IF NOT EXISTS player_achievements (
    id BIGSERIAL PRIMARY KEY,
    player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    achievement_key VARCHAR(64) NOT NULL,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_player_achievement UNIQUE (player_id, achievement_key)
);

-- 14. LAND CLAIMS TABLE
CREATE TABLE IF NOT EXISTS land_claims (
    id BIGSERIAL PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    world_name VARCHAR(64) NOT NULL DEFAULT 'world',
    chunk_x INT NOT NULL,
    chunk_z INT NOT NULL,
    claim_name VARCHAR(64),
    is_pvp_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    allow_public_access BOOLEAN NOT NULL DEFAULT FALSE,
    trusted_players JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_world_chunk UNIQUE (world_name, chunk_x, chunk_z)
);
CREATE INDEX IF NOT EXISTS idx_land_claims_owner ON land_claims(owner_id);
CREATE INDEX IF NOT EXISTS idx_land_claims_chunk ON land_claims(world_name, chunk_x, chunk_z);

-- 15. ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(64) NOT NULL UNIQUE,
    email VARCHAR(128) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'ADMIN' CHECK (role IN ('SUPERADMIN', 'ADMIN', 'MODERATOR')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 16. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    actor_type VARCHAR(20) NOT NULL CHECK (actor_type IN ('ADMIN', 'CONSOLE', 'SYSTEM')),
    actor_name VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    target_type VARCHAR(32),
    target_id VARCHAR(64),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_name);

-- 17. BACKUP RECORDS TABLE
CREATE TABLE IF NOT EXISTS backup_records (
    id BIGSERIAL PRIMARY KEY,
    backup_type VARCHAR(32) NOT NULL CHECK (backup_type IN ('DATABASE', 'WORLD', 'FULL')),
    file_name VARCHAR(255) NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED')),
    checksum VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_backup_records_created_at ON backup_records(created_at DESC);
