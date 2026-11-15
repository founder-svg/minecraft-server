package net.wixfox.players.dao;

import net.wixfox.network.database.DatabaseManager;
import net.wixfox.network.model.PlatformType;
import net.wixfox.players.model.NetworkPlayerProfile;

import java.sql.*;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class PlayerDAO {

    private final DatabaseManager db;

    public PlayerDAO(DatabaseManager db) {
        this.db = db;
    }

    public CompletableFuture<NetworkPlayerProfile> loadOrCreateProfile(String username, PlatformType platform, String platformUuid, String ipAddress) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                conn.setAutoCommit(false);
                try {
                    // Check if player_identity exists
                    UUID playerId = null;
                    String queryIdentity = "SELECT player_id FROM player_identities WHERE platform = ? AND platform_uuid = ?";
                    try (PreparedStatement ps = conn.prepareStatement(queryIdentity)) {
                        ps.setString(1, platform.name());
                        ps.setString(2, platformUuid);
                        ResultSet rs = ps.executeQuery();
                        if (rs.next()) {
                            playerId = (UUID) rs.getObject("player_id");
                        }
                    }

                    Timestamp now = new Timestamp(System.currentTimeMillis());

                    if (playerId == null) {
                        // Create in players table
                        String insertPlayer = "INSERT INTO players (username) VALUES (?) RETURNING id";
                        try (PreparedStatement ps = conn.prepareStatement(insertPlayer)) {
                            ps.setString(1, username);
                            ResultSet rs = ps.executeQuery();
                            if (rs.next()) {
                                playerId = (UUID) rs.getObject("id");
                            }
                        }

                        // Create identity
                        String insertIdentity = "INSERT INTO player_identities (player_id, platform, platform_uuid) VALUES (?, ?, ?)";
                        try (PreparedStatement ps = conn.prepareStatement(insertIdentity)) {
                            ps.setObject(1, playerId);
                            ps.setString(2, platform.name());
                            ps.setString(3, platformUuid);
                            ps.executeUpdate();
                        }

                        // Create profile
                        String insertProfile = "INSERT INTO player_profiles (player_id, first_login, last_login, last_ip) VALUES (?, ?, ?, ?)";
                        try (PreparedStatement ps = conn.prepareStatement(insertProfile)) {
                            ps.setObject(1, playerId);
                            ps.setTimestamp(2, now);
                            ps.setTimestamp(3, now);
                            ps.setString(4, ipAddress);
                            ps.executeUpdate();
                        }

                        // Create statistics record
                        String insertStats = "INSERT INTO player_statistics (player_id) VALUES (?)";
                        try (PreparedStatement ps = conn.prepareStatement(insertStats)) {
                            ps.setObject(1, playerId);
                            ps.executeUpdate();
                        }

                        // Create default balance record
                        String insertBalance = "INSERT INTO player_balances (player_id, balance) VALUES (?, 1000.00)";
                        try (PreparedStatement ps = conn.prepareStatement(insertBalance)) {
                            ps.setObject(1, playerId);
                            ps.executeUpdate();
                        }

                        // Assign default rank (rank_id = 1)
                        String assignRank = "INSERT INTO player_ranks (player_id, rank_id) VALUES (?, 1)";
                        try (PreparedStatement ps = conn.prepareStatement(assignRank)) {
                            ps.setObject(1, playerId);
                            ps.executeUpdate();
                        }

                        conn.commit();
                        return new NetworkPlayerProfile(playerId, username, platform, platformUuid, now, now, ipAddress, 0, "ACTIVE");
                    } else {
                        // Existing player, update username, last login & IP
                        String updateProfile = "UPDATE player_profiles SET last_login = ?, last_ip = ? WHERE player_id = ?";
                        try (PreparedStatement ps = conn.prepareStatement(updateProfile)) {
                            ps.setTimestamp(1, now);
                            ps.setString(2, ipAddress);
                            ps.setObject(3, playerId);
                            ps.executeUpdate();
                        }

                        String updatePlayer = "UPDATE players SET username = ? WHERE id = ?";
                        try (PreparedStatement ps = conn.prepareStatement(updatePlayer)) {
                            ps.setString(1, username);
                            ps.setObject(2, playerId);
                            ps.executeUpdate();
                        }

                        // Fetch details
                        String fetchQuery = "SELECT p.username, pr.first_login, pr.last_login, pr.last_ip, pr.playtime_seconds, pr.account_status " +
                                "FROM players p JOIN player_profiles pr ON p.id = pr.player_id WHERE p.id = ?";
                        try (PreparedStatement ps = conn.prepareStatement(fetchQuery)) {
                            ps.setObject(1, playerId);
                            ResultSet rs = ps.executeQuery();
                            if (rs.next()) {
                                conn.commit();
                                return new NetworkPlayerProfile(
                                        playerId,
                                        rs.getString("username"),
                                        platform,
                                        platformUuid,
                                        rs.getTimestamp("first_login"),
                                        rs.getTimestamp("last_login"),
                                        rs.getString("last_ip"),
                                        rs.getLong("playtime_seconds"),
                                        rs.getString("account_status")
                                );
                            }
                        }
                        conn.commit();
                        return new NetworkPlayerProfile(playerId, username, platform, platformUuid, now, now, ipAddress, 0, "ACTIVE");
                    }
                } catch (Exception e) {
                    conn.rollback();
                    throw e;
                }
            }
        });
    }

    public CompletableFuture<Void> recordSessionEnd(UUID playerId, long durationSeconds) {
        return db.runAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String updatePlaytime = "UPDATE player_profiles SET playtime_seconds = playtime_seconds + ? WHERE player_id = ?";
                try (PreparedStatement ps = conn.prepareStatement(updatePlaytime)) {
                    ps.setLong(1, durationSeconds);
                    ps.setObject(2, playerId);
                    ps.executeUpdate();
                }

                String insertSession = "INSERT INTO player_sessions (player_id, server_name, duration_seconds) VALUES (?, 'wixfox-smp', ?)";
                try (PreparedStatement ps = conn.prepareStatement(insertSession)) {
                    ps.setObject(1, playerId);
                    ps.setInt(2, (int) durationSeconds);
                    ps.executeUpdate();
                }
            }
        });
    }

    public CompletableFuture<Optional<NetworkPlayerProfile>> getProfileByUsername(String username) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT p.id, p.username, pi.platform, pi.platform_uuid, pr.first_login, pr.last_login, pr.last_ip, pr.playtime_seconds, pr.account_status " +
                        "FROM players p " +
                        "JOIN player_identities pi ON p.id = pi.player_id " +
                        "JOIN player_profiles pr ON p.id = pr.player_id " +
                        "WHERE LOWER(p.username) = LOWER(?) LIMIT 1";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, username);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        return Optional.of(new NetworkPlayerProfile(
                                (UUID) rs.getObject("id"),
                                rs.getString("username"),
                                PlatformType.valueOf(rs.getString("platform")),
                                rs.getString("platform_uuid"),
                                rs.getTimestamp("first_login"),
                                rs.getTimestamp("last_login"),
                                rs.getString("last_ip"),
                                rs.getLong("playtime_seconds"),
                                rs.getString("account_status")
                        ));
                    }
                }
            }
            return Optional.empty();
        });
    }

    public CompletableFuture<Void> incrementStat(UUID playerId, String statColumn) {
        return db.runAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "UPDATE player_statistics SET " + statColumn + " = " + statColumn + " + 1, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ps.executeUpdate();
                }
            }
        });
    }
}
