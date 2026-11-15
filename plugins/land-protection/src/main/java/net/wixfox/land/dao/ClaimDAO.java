package net.wixfox.land.dao;

import net.wixfox.network.database.DatabaseManager;
import net.wixfox.land.model.LandClaim;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class ClaimDAO {

    private final DatabaseManager db;

    public ClaimDAO(DatabaseManager db) {
        this.db = db;
    }

    public CompletableFuture<Optional<LandClaim>> getClaim(String world, int chunkX, int chunkZ) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT id, owner_id, world_name, chunk_x, chunk_z, claim_name, is_pvp_enabled, allow_public_access, trusted_players " +
                        "FROM land_claims WHERE world_name = ? AND chunk_x = ? AND chunk_z = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, world);
                    ps.setInt(2, chunkX);
                    ps.setInt(3, chunkZ);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        Set<String> trusted = new HashSet<>();
                        String json = rs.getString("trusted_players");
                        if (json != null && !json.isEmpty() && !json.equals("[]")) {
                            // Simple array parsing
                            String cleaned = json.replace("[", "").replace("]", "").replace("\"", "");
                            for (String s : cleaned.split(",")) {
                                if (!s.trim().isEmpty()) trusted.add(s.trim().toLowerCase());
                            }
                        }
                        return Optional.of(new LandClaim(
                                rs.getLong("id"),
                                (UUID) rs.getObject("owner_id"),
                                rs.getString("world_name"),
                                rs.getInt("chunk_x"),
                                rs.getInt("chunk_z"),
                                rs.getString("claim_name"),
                                rs.getBoolean("is_pvp_enabled"),
                                rs.getBoolean("allow_public_access"),
                                trusted
                        ));
                    }
                }
            }
            return Optional.empty();
        });
    }

    public CompletableFuture<Boolean> createClaim(UUID ownerId, String world, int chunkX, int chunkZ, String claimName) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "INSERT INTO land_claims (owner_id, world_name, chunk_x, chunk_z, claim_name) VALUES (?, ?, ?, ?, ?)";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, ownerId);
                    ps.setString(2, world);
                    ps.setInt(3, chunkX);
                    ps.setInt(4, chunkZ);
                    ps.setString(5, claimName);
                    ps.executeUpdate();
                    return true;
                }
            } catch (Exception e) {
                return false;
            }
        });
    }

    public CompletableFuture<Boolean> removeClaim(UUID ownerId, String world, int chunkX, int chunkZ) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "DELETE FROM land_claims WHERE world_name = ? AND chunk_x = ? AND chunk_z = ? AND owner_id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, world);
                    ps.setInt(2, chunkX);
                    ps.setInt(3, chunkZ);
                    ps.setObject(4, ownerId);
                    return ps.executeUpdate() > 0;
                }
            }
        });
    }

    public CompletableFuture<Boolean> updateTrust(long claimId, Set<String> trustedPlayers) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                StringBuilder sb = new StringBuilder("[");
                int i = 0;
                for (String p : trustedPlayers) {
                    sb.append("\"").append(p).append("\"");
                    if (++i < trustedPlayers.size()) sb.append(",");
                }
                sb.append("]");

                String sql = "UPDATE land_claims SET trusted_players = ?::jsonb WHERE id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setString(1, sb.toString());
                    ps.setLong(2, claimId);
                    return ps.executeUpdate() > 0;
                }
            }
        });
    }
}
