package net.wixfox.moderation;

import net.wixfox.moderation.command.BanCommand;
import net.wixfox.moderation.command.HistoryCommand;
import net.wixfox.moderation.command.KickCommand;
import net.wixfox.moderation.command.MuteCommand;
import net.wixfox.moderation.dao.PunishmentDAO;
import net.wixfox.moderation.listener.PunishmentChatListener;
import net.wixfox.moderation.listener.PunishmentLoginListener;
import net.wixfox.network.NetworkCore;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Objects;

public class ModerationCore extends JavaPlugin {

    private static ModerationCore instance;
    private PunishmentDAO punishmentDAO;

    @Override
    public void onEnable() {
        instance = this;

        NetworkCore core = NetworkCore.getInstance();
        if (core == null || core.getDatabaseManager() == null) {
            getLogger().severe("NetworkCore not found! Disabling ModerationCore.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        this.punishmentDAO = new PunishmentDAO(core.getDatabaseManager());

        // Register listeners
        getServer().getPluginManager().registerEvents(new PunishmentLoginListener(this), this);
        getServer().getPluginManager().registerEvents(new PunishmentChatListener(this), this);

        // Register commands
        BanCommand banCmd = new BanCommand(this);
        Objects.requireNonNull(getCommand("ban")).setExecutor(banCmd);
        Objects.requireNonNull(getCommand("tempban")).setExecutor(banCmd);
        Objects.requireNonNull(getCommand("unban")).setExecutor(banCmd);

        Objects.requireNonNull(getCommand("kick")).setExecutor(new KickCommand(this));

        MuteCommand muteCmd = new MuteCommand(this);
        Objects.requireNonNull(getCommand("mute")).setExecutor(muteCmd);
        Objects.requireNonNull(getCommand("tempmute")).setExecutor(muteCmd);
        Objects.requireNonNull(getCommand("warn")).setExecutor(muteCmd);

        Objects.requireNonNull(getCommand("history")).setExecutor(new HistoryCommand(this));

        getLogger().info("ModerationCore enabled successfully.");
    }

    public static ModerationCore getInstance() {
        return instance;
    }

    public PunishmentDAO getPunishmentDAO() {
        return punishmentDAO;
    }
}
