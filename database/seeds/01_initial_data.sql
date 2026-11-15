-- ===================================================================
-- Wixfox Initial Data Seeds
-- Default ranks, permissions, system administrator & server registry
-- ===================================================================

-- 1. SEED RANKS
INSERT INTO ranks (id, name, display_name, prefix, weight, is_staff) VALUES
(1, 'default', 'Member', '<gray>[Member]</gray> ', 100, FALSE),
(2, 'vip', 'VIP', '<green>[VIP]</green> ', 200, FALSE),
(3, 'premium', 'Premium', '<aqua>[Premium]</aqua> ', 300, FALSE),
(4, 'moderator', 'Moderator', '<blue>[Mod]</blue> ', 400, TRUE),
(5, 'admin', 'Administrator', '<red>[Admin]</red> ', 500, TRUE),
(6, 'owner', 'Owner', '<dark_red><bold>[Owner]</bold></dark_red> ', 1000, TRUE)
ON CONFLICT (name) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    prefix = EXCLUDED.prefix,
    weight = EXCLUDED.weight,
    is_staff = EXCLUDED.is_staff;

-- 2. SEED PERMISSIONS
INSERT INTO permissions (rank_id, permission_node, value) VALUES
-- Default permissions
(1, 'wixfox.chat', TRUE),
(1, 'wixfox.eco.balance', TRUE),
(1, 'wixfox.eco.pay', TRUE),
(1, 'wixfox.spawn', TRUE),
(1, 'wixfox.claim.basic', TRUE),
(1, 'wixfox.rules', TRUE),

-- VIP permissions
(2, 'wixfox.chat.color', TRUE),
(2, 'wixfox.claim.vip', TRUE),
(2, 'wixfox.eco.daily.multiplier', TRUE),

-- Premium permissions
(3, 'wixfox.fly.lobby', TRUE),
(3, 'wixfox.claim.premium', TRUE),
(3, 'wixfox.hat', TRUE),

-- Moderator permissions
(4, 'wixfox.mod.kick', TRUE),
(4, 'wixfox.mod.mute', TRUE),
(4, 'wixfox.mod.tempmute', TRUE),
(4, 'wixfox.mod.warn', TRUE),
(4, 'wixfox.mod.history', TRUE),
(4, 'wixfox.staffchat', TRUE),

-- Administrator permissions
(5, 'wixfox.mod.ban', TRUE),
(5, 'wixfox.mod.tempban', TRUE),
(5, 'wixfox.mod.unban', TRUE),
(5, 'wixfox.eco.admin', TRUE),
(5, 'wixfox.ranks.assign', TRUE),
(5, 'wixfox.claim.bypass', TRUE),
(5, 'wixfox.admin', TRUE),

-- Owner permissions
(6, '*', TRUE)
ON CONFLICT (rank_id, permission_node) DO NOTHING;

-- 3. SEED INITIAL ADMIN USER
-- Default login: admin / admin123 (Password bcrypt hash)
INSERT INTO admin_users (username, email, password_hash, role, is_active) VALUES
('admin', 'admin@wixfox.net', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'SUPERADMIN', TRUE)
ON CONFLICT (username) DO NOTHING;

-- 4. SEED DEFAULT MINECRAFT SERVER
INSERT INTO servers (server_name, server_type, host, port, max_players, is_online) VALUES
('wixfox-smp', 'PAPER', 'minecraft', 25565, 20, FALSE)
ON CONFLICT (server_name) DO NOTHING;
