package net.wixfox.economy.dao;

import net.wixfox.network.database.DatabaseManager;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

public class EconomyDAO {

    private final DatabaseManager db;

    public EconomyDAO(DatabaseManager db) {
        this.db = db;
    }

    public CompletableFuture<BigDecimal> getBalance(UUID playerId) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                String sql = "SELECT balance FROM player_balances WHERE player_id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setObject(1, playerId);
                    ResultSet rs = ps.executeQuery();
                    if (rs.next()) {
                        return rs.getBigDecimal("balance");
                    }
                }
            }
            return BigDecimal.ZERO;
        });
    }

    public CompletableFuture<Boolean> transfer(UUID senderId, UUID receiverId, BigDecimal amount) {
        return db.supplyAsync(() -> {
            if (amount.compareTo(BigDecimal.ZERO) <= 0) return false;

            try (Connection conn = db.getConnection()) {
                conn.setAutoCommit(false);
                try {
                    // Check sender balance with row lock
                    BigDecimal senderBal = BigDecimal.ZERO;
                    String lockSender = "SELECT balance FROM player_balances WHERE player_id = ? FOR UPDATE";
                    try (PreparedStatement ps = conn.prepareStatement(lockSender)) {
                        ps.setObject(1, senderId);
                        ResultSet rs = ps.executeQuery();
                        if (rs.next()) {
                            senderBal = rs.getBigDecimal("balance");
                        } else {
                            conn.rollback();
                            return false;
                        }
                    }

                    if (senderBal.compareTo(amount) < 0) {
                        conn.rollback();
                        return false;
                    }

                    // Deduct from sender
                    String deduct = "UPDATE player_balances SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?";
                    try (PreparedStatement ps = conn.prepareStatement(deduct)) {
                        ps.setBigDecimal(1, amount);
                        ps.setObject(2, senderId);
                        ps.executeUpdate();
                    }

                    // Add to receiver
                    String add = "UPDATE player_balances SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?";
                    try (PreparedStatement ps = conn.prepareStatement(add)) {
                        ps.setBigDecimal(1, amount);
                        ps.setObject(2, receiverId);
                        ps.executeUpdate();
                    }

                    // Record transaction
                    String logTx = "INSERT INTO economy_transactions (sender_id, receiver_id, amount, transaction_type, description) VALUES (?, ?, ?, 'TRANSFER', 'Player payment')";
                    try (PreparedStatement ps = conn.prepareStatement(logTx)) {
                        ps.setObject(1, senderId);
                        ps.setObject(2, receiverId);
                        ps.setBigDecimal(3, amount);
                        ps.executeUpdate();
                    }

                    conn.commit();
                    return true;
                } catch (SQLException e) {
                    conn.rollback();
                    throw e;
                }
            }
        });
    }

    public CompletableFuture<Boolean> adjustBalance(UUID playerId, BigDecimal amount, String type, String description) {
        return db.supplyAsync(() -> {
            try (Connection conn = db.getConnection()) {
                conn.setAutoCommit(false);
                try {
                    String updateSql;
                    if (amount.compareTo(BigDecimal.ZERO) >= 0) {
                        updateSql = "UPDATE player_balances SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?";
                    } else {
                        updateSql = "UPDATE player_balances SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ? AND balance >= ?";
                    }

                    try (PreparedStatement ps = conn.prepareStatement(updateSql)) {
                        ps.setBigDecimal(1, amount.abs());
                        ps.setObject(2, playerId);
                        if (amount.compareTo(BigDecimal.ZERO) < 0) {
                            ps.setBigDecimal(3, amount.abs());
                        }
                        int affected = ps.executeUpdate();
                        if (affected == 0) {
                            conn.rollback();
                            return false;
                        }
                    }

                    // Log audit
                    String logTx = "INSERT INTO economy_transactions (receiver_id, amount, transaction_type, description) VALUES (?, ?, ?, ?)";
                    try (PreparedStatement ps = conn.prepareStatement(logTx)) {
                        ps.setObject(1, playerId);
                        ps.setBigDecimal(2, amount.abs());
                        ps.setString(3, type);
                        ps.setString(4, description);
                        ps.executeUpdate();
                    }

                    conn.commit();
                    return true;
                } catch (SQLException e) {
                    conn.rollback();
                    throw e;
                }
            }
        });
    }

    public CompletableFuture<Boolean> setBalance(UUID playerId, BigDecimal amount) {
        return db.supplyAsync(() -> {
            if (amount.compareTo(BigDecimal.ZERO) < 0) return false;
            try (Connection conn = db.getConnection()) {
                String sql = "UPDATE player_balances SET balance = ?, updated_at = CURRENT_TIMESTAMP WHERE player_id = ?";
                try (PreparedStatement ps = conn.prepareStatement(sql)) {
                    ps.setBigDecimal(1, amount);
                    ps.setObject(2, playerId);
                    ps.executeUpdate();
                    return true;
                }
            }
        });
    }
}
