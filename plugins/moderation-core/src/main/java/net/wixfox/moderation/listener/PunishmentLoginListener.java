package net.wixfox.moderation.listener;

import net.kyori.adventure.text.Component;
import net.wixfox.moderation.ModerationCore;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;

public class PunishmentLoginListener implements Listener {

    private final ModerationCore plugin;

    public PunishmentLoginListener(ModerationCore plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onPreLogin(AsyncPlayerPreLoginEvent event) {
        NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(event.getUniqueId());
        if (profile == null) return;

        plugin.getPunishmentDAO().getActivePunishment(profile.getInternalId(), "BAN").thenAccept(optBan -> {
            if (optBan.isPresent()) {
                var ban = optBan.get();
                String expireMsg = ban.getExpiresAt() != null ? " Expires: " + ban.getExpiresAt() : " (Permanent)";
                event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_BANNED,
                        Component.text("§cYou are banned from Wixfox Network!\n§7Reason: §f" + ban.getReason() + "\n§7Banned by: §f" + ban.getPunisherName() + expireMsg));
            }
        }).join();
    }
}
