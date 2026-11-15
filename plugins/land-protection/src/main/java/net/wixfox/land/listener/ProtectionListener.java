package net.wixfox.land.listener;

import net.wixfox.land.LandProtection;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.Chunk;
import org.bukkit.Material;
import org.bukkit.block.Block;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.block.Action;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.player.PlayerInteractEvent;

public class ProtectionListener implements Listener {

    private final LandProtection plugin;

    public ProtectionListener(LandProtection plugin) {
        this.plugin = plugin;
    }

    private boolean canBuild(Player player, Block block) {
        if (player.hasPermission("wixfox.claim.bypass")) return true;

        Chunk chunk = block.getChunk();
        var optClaim = plugin.getClaimDAO().getClaim(block.getWorld().getName(), chunk.getX(), chunk.getZ()).join();
        if (optClaim.isEmpty()) {
            return true; // Wilderness allows building
        }

        var claim = optClaim.get();
        NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(player.getUniqueId());
        if (profile == null) return false;

        if (claim.getOwnerId().equals(profile.getInternalId())) return true;
        return claim.isTrusted(player.getName());
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onBlockBreak(BlockBreakEvent event) {
        if (!canBuild(event.getPlayer(), event.getBlock())) {
            event.setCancelled(true);
            TextUtil.sendMessage(event.getPlayer(), "<red>You do not have permission to break blocks on this claimed land!</red>");
        }
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onBlockPlace(BlockPlaceEvent event) {
        if (!canBuild(event.getPlayer(), event.getBlock())) {
            event.setCancelled(true);
            TextUtil.sendMessage(event.getPlayer(), "<red>You do not have permission to place blocks on this claimed land!</red>");
        }
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onInteract(PlayerInteractEvent event) {
        if (event.getAction() != Action.RIGHT_CLICK_BLOCK || event.getClickedBlock() == null) return;

        Block b = event.getClickedBlock();
        Material mat = b.getType();
        if (mat.name().contains("CHEST") || mat.name().contains("BARREL") || mat.name().contains("SHULKER") || mat.name().contains("DOOR") || mat.name().contains("TRAPDOOR")) {
            if (!canBuild(event.getPlayer(), b)) {
                event.setCancelled(true);
                TextUtil.sendMessage(event.getPlayer(), "<red>This container/mechanism is protected by a land claim.</red>");
            }
        }
    }

    @EventHandler(priority = EventPriority.HIGH, ignoreCancelled = true)
    public void onPvP(EntityDamageByEntityEvent event) {
        if (event.getEntity() instanceof Player && event.getDamager() instanceof Player attacker) {
            Chunk chunk = event.getEntity().getLocation().getChunk();
            var optClaim = plugin.getClaimDAO().getClaim(event.getEntity().getWorld().getName(), chunk.getX(), chunk.getZ()).join();
            if (optClaim.isPresent() && !optClaim.get().isPvpEnabled()) {
                event.setCancelled(true);
                TextUtil.sendMessage(attacker, "<red>PvP is disabled in this protected territory.</red>");
            }
        }
    }
}
