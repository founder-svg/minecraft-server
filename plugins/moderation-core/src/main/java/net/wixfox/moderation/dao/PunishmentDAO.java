package net.wixfox.moderation.dao;

import net.wixfox.network.database.DatabaseManager;
import net.wixfox.moderation.model.Punishment;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class PunishmentDAO {

    private final DatabaseManager db;

    public PunishmentDAO(DatabaseManager db) {
        this.db = db;
    }

    public CompletableFuture<Optional<Punishment>> getActivePunishment(UUID playerId, String type) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT id, player_id, punishment_type, reason, punisher_name, punished_at, expires_at, is_active " +
                        "FROM punishments WHERE player_id = ? AND punishment_type = ? AND is_active = TRUE " +
                        "AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP) " +
                        "ORDER BY id DESC LIMIT 1";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ps.setString(2, type);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        return Optional.of(new Punishment(
                                rs.getLong("id"),
                                (UUID) rs.getObject("player_id"),
                                rs.getString("punishment_type"),
                                rs.getString("reason"),
                                rs.getString("punisher_name"),
                                rs.getTimestamp("punished_at"),
                                rs.getTimestamp("expires_at"),
                                rs.getBoolean("is_active")
                        ));
                    }
                }
            }
            return Optional.empty();
        });
    }

    public CompletableFuture<Boolean> addPunishment(UUID playerId, String type, String reason, String punisher, Timestamp expiresAt) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "INSERT INTO punishments (player_id, punishment_type, reason, punisher_name, expires_at, is_active) VALUES (?, ?, ?, ?, ?, TRUE)";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ps.setString(2, type);
                    ps.setString(3, reason);
                    ps.setString(4, punisher);
                    ps.setTimestamp(5, expiresAt);
                    ps.executeUpdate();
                    return true;
                }
            }
        });
    }

    public CompletableFuture<Boolean> deactivatePunishments(UUID playerId, String type, String unpunisher) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "UPDATE punishments SET is_active = FALSE, unpunished_at = CURRENT_TIMESTAMP, unpunisher_name = ? WHERE player_id = ? AND punishment_type = ? AND is_active = TRUE";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, unpunisher);
                    ps.setObject(2, playerId);
                    ps.setString(3, type);
                    int updated = ps.executeUpdate();
                    return updated > 0;
                }
            }
        });
    }

    public CompletableFuture<List<Punishment>> getHistory(UUID playerId) {
        return db.supplyAsync(() -> {
            List<Punishment> list = new ArrayList<>();
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT id, player_id, punishment_type, reason, punisher_name, punished_at, expires_at, is_active " +
                        "FROM punishments WHERE player_id = ? ORDER BY id DESC LIMIT 20";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ResultSet rs = ps.executeQuery();
                    while (rs.next()) {
                        list.add(new Punishment(
                                rs.getLong("id"),
                                (UUID) rs.getObject("player_id"),
                                rs.getString("punishment_type"),
                                rs.getString("reason"),
                                rs.getString("punisher_name"),
                                rs.getTimestamp("punished_at"),
                                rs.getTimestamp("expires_at"),
                                rs.getBoolean("is_active")
                        ));
                    }
                }
            }
            return list;
        });
    }
}
