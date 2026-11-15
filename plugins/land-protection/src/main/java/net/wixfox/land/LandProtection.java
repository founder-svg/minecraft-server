package net.wixfox.land;

import net.wixfox.land.command.ClaimCommand;
import net.wixfox.land.dao.ClaimDAO;
import net.wixfox.land.listener.ProtectionListener;
import net.wixfox.network.NetworkCore;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Objects;

public class LandProtection extends JavaPlugin {

    private static LandProtection instance;
    private ClaimDAO claimDAO;

    @Override
    public void onEnable() {
        instance = this;

        NetworkCore core = NetworkCore.getInstance();
        if (core == null || core.getDatabaseManager() == null) {
            getLogger().severe("NetworkCore not found! Disabling LandProtection.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        this.claimDAO = new ClaimDAO(core.getDatabaseManager());

        getServer().getPluginManager().registerEvents(new ProtectionListener(this), this);

        ClaimCommand claimCmd = new ClaimCommand(this);
        Objects.requireNonNull(getCommand("claim")).setExecutor(claimCmd);
        Objects.requireNonNull(getCommand("unclaim")).setExecutor(claimCmd);
        Objects.requireNonNull(getCommand("trust")).setExecutor(claimCmd);
        Objects.requireNonNull(getCommand("untrust")).setExecutor(claimCmd);
        Objects.requireNonNull(getCommand("claiminfo")).setExecutor(claimCmd);

        getLogger().info("LandProtection enabled successfully.");
    }

    public static LandProtection getInstance() {
        return instance;
    }

    public ClaimDAO getClaimDAO() {
        return claimDAO;
    }
}
