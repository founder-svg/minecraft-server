package net.wixfox.players.listener;

import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.entity.Monster;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDeathEvent;
import org.bukkit.event.entity.PlayerDeathEvent;

public class PlayerStatsListener implements Listener {

    private final PlayerManager plugin;

    public PlayerStatsListener(PlayerManager plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player victim = event.getEntity();
        NetworkPlayerProfile victimProfile = plugin.getConnectionListener().getCachedProfile(victim.getUniqueId());
        if (victimProfile != null) {
            plugin.getPlayerDAO().incrementStat(victimProfile.getInternalId(), "deaths");
        }

        Player killer = victim.getKiller();
        if (killer != null) {
            NetworkPlayerProfile killerProfile = plugin.getConnectionListener().getCachedProfile(killer.getUniqueId());
            if (killerProfile != null) {
                plugin.getPlayerDAO().incrementStat(killerProfile.getInternalId(), "kills");
            }
        }
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onMobKill(EntityDeathEvent event) {
        if (event.getEntity() instanceof Monster && event.getEntity().getKiller() != null) {
            Player killer = event.getEntity().getKiller();
            NetworkPlayerProfile profile = plugin.getConnectionListener().getCachedProfile(killer.getUniqueId());
            if (profile != null) {
                plugin.getPlayerDAO().incrementStat(profile.getInternalId(), "mob_kills");
            }
        }
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        NetworkPlayerProfile profile = plugin.getConnectionListener().getCachedProfile(event.getPlayer().getUniqueId());
        if (profile != null) {
            plugin.getPlayerDAO().incrementStat(profile.getInternalId(), "blocks_broken");
        }
    }

    @EventHandler(priority = EventPriority.MONITOR, ignoreCancelled = true)
    public void onBlockPlace(BlockPlaceEvent event) {
        NetworkPlayerProfile profile = plugin.getConnectionListener().getCachedProfile(event.getPlayer().getUniqueId());
        if (profile != null) {
            plugin.getPlayerDAO().incrementStat(profile.getInternalId(), "blocks_placed");
        }
    }
}
