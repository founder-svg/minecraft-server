package net.wixfox.ranks;

import net.wixfox.network.NetworkCore;
import net.wixfox.ranks.command.RankCommand;
import net.wixfox.ranks.dao.RankDAO;
import net.wixfox.ranks.listener.ChatFormatListener;
import net.wixfox.ranks.listener.RankPermissionListener;
import net.wixfox.ranks.model.Rank;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

public class RankManager extends JavaPlugin {

    private static RankManager instance;
    private RankDAO rankDAO;
    private RankPermissionListener permissionListener;
    private final Map<String, Rank> cachedRanks = new ConcurrentHashMap<>();

    @Override
    public void onEnable() {
        instance = this;

        NetworkCore core = NetworkCore.getInstance();
        if (core == null || core.getDatabaseManager() == null) {
            getLogger().severe("NetworkCore not found! Disabling RankManager.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        this.rankDAO = new RankDAO(core.getDatabaseManager());
        this.permissionListener = new RankPermissionListener(this);

        // Load ranks from database
        rankDAO.loadAllRanks().thenAccept(ranks -> {
            cachedRanks.clear();
            cachedRanks.putAll(ranks);
            getLogger().info("Loaded " + cachedRanks.size() + " network ranks into memory.");
        });

        getServer().getPluginManager().registerEvents(permissionListener, this);
        getServer().getPluginManager().registerEvents(new ChatFormatListener(this), this);

        Objects.requireNonNull(getCommand("rank")).setExecutor(new RankCommand(this));

        getLogger().info("RankManager enabled successfully.");
    }

    public static RankManager getInstance() {
        return instance;
    }

    public RankDAO getRankDAO() {
        return rankDAO;
    }

    public RankPermissionListener getPermissionListener() {
        return permissionListener;
    }

    public Map<String, Rank> getCachedRanks() {
        return cachedRanks;
    }
}
