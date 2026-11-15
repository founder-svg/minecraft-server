package net.wixfox.network;

import net.wixfox.network.database.DatabaseManager;
import net.wixfox.network.util.TextUtil;
import org.bukkit.command.Command;
import org.bukkit.command.CommandSender;
import org.bukkit.plugin.java.JavaPlugin;
import org.jetbrains.annotations.NotNull;

public class NetworkCore extends JavaPlugin {

    private static NetworkCore instance;
    private DatabaseManager databaseManager;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        getLogger().info("Initializing Wixfox NetworkCore...");

        // Initialize Database Pool
        this.databaseManager = new DatabaseManager(getLogger());
        if (!databaseManager.initialize(getConfig().getConfigurationSection("database"))) {
            getLogger().severe("Database initialization failed! Disabling plugin.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        getLogger().info("Wixfox NetworkCore enabled successfully!");
    }

    @Override
    public void onDisable() {
        if (databaseManager != null) {
            databaseManager.shutdown();
        }
        getLogger().info("Wixfox NetworkCore disabled.");
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (command.getName().equalsIgnoreCase("wixfox")) {
            TextUtil.sendMessage(sender, "<green>Wixfox Minecraft Network v" + getDescription().getVersion() + " (Java + Bedrock)</green>");
            TextUtil.sendMessage(sender, "<gray>Database Status: <green>Connected</green> | Target Capacity: <yellow>20 Players</yellow></gray>");
            return true;
        }
        if (command.getName().equalsIgnoreCase("netreload")) {
            reloadConfig();
            TextUtil.sendMessage(sender, "<green>Network configuration reloaded.</green>");
            return true;
        }
        return false;
    }

    public static NetworkCore getInstance() {
        return instance;
    }

    public DatabaseManager getDatabaseManager() {
        return databaseManager;
    }
}
