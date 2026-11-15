package net.wixfox.moderation.listener;

import io.papermc.paper.event.player.AsyncChatEvent;
import net.wixfox.moderation.ModerationCore;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;

public class PunishmentChatListener implements Listener {

    private final ModerationCore plugin;

    public PunishmentChatListener(ModerationCore plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.LOWEST, ignoreCancelled = true)
    public void onChat(AsyncChatEvent event) {
        Player player = event.getPlayer();
        NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(player.getUniqueId());
        if (profile == null) return;

        plugin.getPunishmentDAO().getActivePunishment(profile.getInternalId(), "MUTE").thenAccept(optMute -> {
            if (optMute.isPresent()) {
                event.setCancelled(true);
                var mute = optMute.get();
                String expireMsg = mute.getExpiresAt() != null ? " Expires: " + mute.getExpiresAt() : " (Permanent)";
                TextUtil.sendMessage(player, "<red>You are muted! Reason: " + mute.getReason() + expireMsg + "</red>");
            }
        });
    }
}
