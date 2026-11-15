package net.wixfox.ranks.listener;

import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import net.wixfox.ranks.RankManager;
import net.wixfox.ranks.model.Rank;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.permissions.PermissionAttachment;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class RankPermissionListener implements Listener {

    private final RankManager plugin;
    private final Map<UUID, PermissionAttachment> attachments = new ConcurrentHashMap<>();
    private final Map<UUID, Rank> playerRanks = new ConcurrentHashMap<>();

    public RankPermissionListener(RankManager plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        applyPlayerRankAndPermissions(player);
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerQuit(PlayerQuitEvent event) {
        UUID uuid = event.getPlayer().getUniqueId();
        PermissionAttachment attachment = attachments.remove(uuid);
        if (attachment != null) {
            try {
                event.getPlayer().removeAttachment(attachment);
            } catch (IllegalArgumentException ignored) {}
        }
        playerRanks.remove(uuid);
    }

    public void applyPlayerRankAndPermissions(Player player) {
        NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(player.getUniqueId());
        if (profile == null) return;

        plugin.getRankDAO().getPlayerRank(profile.getInternalId(), plugin.getCachedRanks()).thenAccept(optRank -> {
            Rank rank = optRank.orElse(plugin.getCachedRanks().get("default"));
            playerRanks.put(player.getUniqueId(), rank);

            // Apply permission attachment on main thread
            plugin.getServer().getScheduler().runTask(plugin, () -> {
                PermissionAttachment old = attachments.remove(player.getUniqueId());
                if (old != null) {
                    try { player.removeAttachment(old); } catch (Exception ignored) {}
                }

                PermissionAttachment attachment = player.addAttachment(plugin);
                for (String perm : rank.getPermissions()) {
                    attachment.setPermission(perm, true);
                }
                attachments.put(player.getUniqueId(), attachment);
            });
        });
    }

    public Rank getPlayerRank(UUID bukkitUuid) {
        return playerRanks.getOrDefault(bukkitUuid, plugin.getCachedRanks().get("default"));
    }
}
