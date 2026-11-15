package net.wixfox.players.listener;

import net.wixfox.network.model.PlatformType;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.Bukkit;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.player.AsyncPlayerPreLoginEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class PlayerConnectionListener implements Listener {

    private final PlayerManager plugin;
    private final Map<UUID, Long> joinTimestamps = new ConcurrentHashMap<>();
    private final Map<UUID, NetworkPlayerProfile> cachedProfiles = new ConcurrentHashMap<>();

    public PlayerConnectionListener(PlayerManager plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.LOWEST)
    public void onAsyncPreLogin(AsyncPlayerPreLoginEvent event) {
        String username = event.getName();
        String rawUuid = event.getUniqueId().toString();
        String ip = event.getAddress().getHostAddress();

        // Detect platform: Check Floodgate API or Bedrock prefix
        PlatformType platform = PlatformType.JAVA;
        if (Bukkit.getPluginManager().isPluginEnabled("floodgate")) {
            try {
                if (org.geysermc.floodgate.api.FloodgateApi.getInstance().isFloodgatePlayer(event.getUniqueId())) {
                    platform = PlatformType.BEDROCK;
                }
            } catch (NoClassDefFoundError ignored) {
                if (username.startsWith(".")) {
                    platform = PlatformType.BEDROCK;
                }
            }
        } else if (username.startsWith(".")) {
            platform = PlatformType.BEDROCK;
        }

        try {
            NetworkPlayerProfile profile = plugin.getPlayerDAO()
                    .loadOrCreateProfile(username, platform, rawUuid, ip)
                    .join();

            if ("BANNED".equalsIgnoreCase(profile.getAccountStatus())) {
                event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_BANNED,
                        net.kyori.adventure.text.Component.text("You are permanently banned from Wixfox Network."));
                return;
            }

            cachedProfiles.put(event.getUniqueId(), profile);
        } catch (Exception e) {
            plugin.getLogger().severe("Failed to load profile for " + username + ": " + e.getMessage());
            event.disallow(AsyncPlayerPreLoginEvent.Result.KICK_OTHER,
                    net.kyori.adventure.text.Component.text("Internal database error loading your network profile. Please retry."));
        }
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerJoin(PlayerJoinEvent event) {
        joinTimestamps.put(event.getPlayer().getUniqueId(), System.currentTimeMillis());
    }

    @EventHandler(priority = EventPriority.MONITOR)
    public void onPlayerQuit(PlayerQuitEvent event) {
        UUID bukkitUuid = event.getPlayer().getUniqueId();
        Long joinTime = joinTimestamps.remove(bukkitUuid);
        NetworkPlayerProfile profile = cachedProfiles.remove(bukkitUuid);

        if (profile != null && joinTime != null) {
            long duration = (System.currentTimeMillis() - joinTime) / 1000L;
            plugin.getPlayerDAO().recordSessionEnd(profile.getInternalId(), duration);
        }
    }

    public NetworkPlayerProfile getCachedProfile(UUID bukkitUuid) {
        return cachedProfiles.get(bukkitUuid);
    }
}
