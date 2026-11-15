package net.wixfox.network.database;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.bukkit.configuration.ConfigurationSection;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

public class DatabaseManager {

    private final Logger logger;
    private HikariDataSource dataSource;
    private final ExecutorService asyncExecutor = Executors.newFixedThreadPool(4);

    public DatabaseManager(Logger logger) {
        this.logger = logger;
    }

    public boolean initialize(ConfigurationSection dbConfig) {
        if (dbConfig == null) {
            logger.severe("Database configuration section is missing!");
            return false;
        }

        try {
            String host = System.getenv("POSTGRES_HOST") != null ? System.getenv("POSTGRES_HOST") : dbConfig.getString("host", "postgres");
            int port = dbConfig.getInt("port", 5432);
            String db = System.getenv("POSTGRES_DB") != null ? System.getenv("POSTGRES_DB") : dbConfig.getString("database", "wixfox_network");
            String user = System.getenv("POSTGRES_USER") != null ? System.getenv("POSTGRES_USER") : dbConfig.getString("username", "wixfox_admin");
            String pass = System.getenv("POSTGRES_PASSWORD") != null ? System.getenv("POSTGRES_PASSWORD") : dbConfig.getString("password", "");

            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:postgresql://" + host + ":" + port + "/" + db);
            config.setUsername(user);
            config.setPassword(pass);
            config.setDriverClassName("org.postgresql.Driver");

            ConfigurationSection poolConfig = dbConfig.getConfigurationSection("pool");
            if (poolConfig != null) {
                config.setMaximumPoolSize(poolConfig.getInt("maximum-pool-size", 10));
                config.setMinimumIdle(poolConfig.getInt("minimum-idle", 3));
                config.setConnectionTimeout(poolConfig.getLong("connection-timeout-ms", 10000));
                config.setIdleTimeout(poolConfig.getLong("idle-timeout-ms", 30000));
                config.setMaxLifetime(poolConfig.getLong("max-lifetime-ms", 1800000));
            } else {
                config.setMaximumPoolSize(10);
                config.setMinimumIdle(3);
            }

            config.setPoolName("Wixfox-HikariPool");
            config.addDataSourceProperty("cachePrepStmts", "true");
            config.addDataSourceProperty("prepStmtCacheSize", "250");
            config.addDataSourceProperty("prepStmtCacheSqlLimit", "2048");

            this.dataSource = new HikariDataSource(config);

            // Test connection
            try (Connection conn = dataSource.getConnection()) {
                if (conn.isValid(2)) {
                    logger.info("Successfully connected to PostgreSQL database (" + db + ") via HikariCP.");
                    return true;
                }
            }
        } catch (Exception e) {
            logger.log(Level.SEVERE, "Failed to initialize PostgreSQL database connection pool!", e);
            return false;
        }
        return false;
    }

    public Connection getConnection() throws SQLException {
        if (dataSource == null || dataSource.isClosed()) {
            throw new SQLException("HikariDataSource is not initialized or closed.");
        }
        return dataSource.getConnection();
    }

    public <T> CompletableFuture<T> supplyAsync(AsyncSupplier<T> supplier) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return supplier.get();
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Asynchronous database operation failed", e);
                throw new RuntimeException(e);
            }
        }, asyncExecutor);
    }

    public CompletableFuture<Void> runAsync(AsyncRunnable runnable) {
        return CompletableFuture.runAsync(() -> {
            try {
                runnable.run();
            } catch (Exception e) {
                logger.log(Level.SEVERE, "Asynchronous database operation failed", e);
                throw new RuntimeException(e);
            }
        }, asyncExecutor);
    }

    public void shutdown() {
        if (dataSource != null && !dataSource.isClosed()) {
            logger.info("Closing database connection pool...");
            dataSource.close();
        }
        asyncExecutor.shutdown();
    }

    @FunctionalInterface
    public interface AsyncSupplier<T> {
        T get() throws Exception;
    }

    @FunctionalInterface
    public interface AsyncRunnable {
        void run() throws Exception;
    }
}
