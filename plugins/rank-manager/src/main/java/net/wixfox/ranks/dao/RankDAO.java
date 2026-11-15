package net.wixfox.ranks.dao;

import net.wixfox.network.database.DatabaseManager;
import net.wixfox.ranks.model.Rank;

import java.sql.*;
import java.util.*;
import java.util.concurrent.CompletableFuture;

public class RankDAO {

    private final DatabaseManager db;

    public RankDAO(DatabaseManager db) {
        this.db = db;
    }

    public CompletableFuture<Map<String, Rank>> loadAllRanks() {
        return db.supplyAsync(() -> {
            Map<String, Rank> ranks = new HashMap<>();
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT r.id, r.name, r.display_name, r.prefix, r.weight, r.is_staff FROM ranks r ORDER BY r.weight ASC";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ResultSet rs = ps.executeQuery();
                    while (rs.next()) {
                        int rankId = rs.getInt("id");
                        String name = rs.getString("name");
                        String displayName = rs.getString("display_name");
                        String prefix = rs.getString("prefix");
                        int weight = rs.getInt("weight");
                        boolean isStaff = rs.getBoolean("is_staff");

                        List<String> perms = new ArrayList<>();
                        String permSql = "SELECT permission_node FROM permissions WHERE rank_id = ? AND value = TRUE";
                        try (PreparedStatement psPerm = conn.prepareStatement(permSql)) {
                            psPerm.setInt(1, rankId);
                            ResultSet rsPerm = psPerm.executeQuery();
                            while (rsPerm.next()) {
                                perms.add(rsPerm.getString("permission_node"));
                            }
                        }

                        ranks.put(name.toLowerCase(), new Rank(rankId, name, displayName, prefix, weight, isStaff, perms));
                    }
                }
            }
            return ranks;
        });
    }

    public CompletableFuture<Optional<Rank>> getPlayerRank(UUID playerId, Map<String, Rank> allRanks) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT r.name FROM player_ranks pr JOIN ranks r ON pr.rank_id = r.id " +
                        "WHERE pr.player_id = ? AND (pr.expires_at IS NULL OR pr.expires_at > CURRENT_TIMESTAMP) " +
                        "ORDER BY r.weight DESC LIMIT 1";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        String name = rs.getString("name").toLowerCase();
                        return Optional.ofNullable(allRanks.get(name));
                    }
                }
            }
            return Optional.ofNullable(allRanks.get("default"));
        });
    }

    public CompletableFuture<Boolean> setPlayerRank(UUID playerId, int rankId, String assignedBy, Timestamp expiresAt) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "INSERT INTO player_ranks (player_id, rank_id, assigned_by, expires_at) VALUES (?, ?, ?, ?) " +
                        "ON CONFLICT (player_id, rank_id) DO UPDATE SET assigned_by = EXCLUDED.assigned_by, expires_at = EXCLUDED.expires_at, assigned_at = CURRENT_TIMESTAMP";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ps.setInt(2, rankId);
                    ps.setString(3, assignedBy);
                    ps.setTimestamp(4, expiresAt);
                    ps.executeUpdate();
                    return true;
                }
            }
        });
    }
}
