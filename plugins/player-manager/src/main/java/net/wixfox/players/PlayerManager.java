package net.wixfox.players;

import net.wixfox.network.NetworkCore;
import net.wixfox.players.command.ProfileCommand;
import net.wixfox.players.dao.PlayerDAO;
import net.wixfox.players.listener.PlayerConnectionListener;
import net.wixfox.players.listener.PlayerStatsListener;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Objects;

public class PlayerManager extends JavaPlugin {

    private static PlayerManager instance;
    private PlayerDAO playerDAO;
    private PlayerConnectionListener connectionListener;

    @Override
    public void onEnable() {
        instance = this;

        NetworkCore core = NetworkCore.getInstance();
        if (core == null || core.getDatabaseManager() == null) {
            getLogger().severe("NetworkCore not found! Disabling PlayerManager.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        this.playerDAO = new PlayerDAO(core.getDatabaseManager());
        this.connectionListener = new PlayerConnectionListener(this);

        getServer().getPluginManager().registerEvents(connectionListener, this);
        getServer().getPluginManager().registerEvents(new PlayerStatsListener(this), this);

        ProfileCommand profileCmd = new ProfileCommand(this);
        Objects.requireNonNull(getCommand("profile")).setExecutor(profileCmd);
        Objects.requireNonNull(getCommand("stats")).setExecutor(profileCmd);

        getLogger().info("PlayerManager enabled successfully.");
    }

    public static PlayerManager getInstance() {
        return instance;
    }

    public PlayerDAO getPlayerDAO() {
        return playerDAO;
    }

    public PlayerConnectionListener getConnectionListener() {
        return connectionListener;
    }
}
