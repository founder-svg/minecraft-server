package net.wixfox.land.command;

import net.wixfox.land.LandProtection;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.Chunk;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

public class ClaimCommand implements CommandExecutor {

    private final LandProtection plugin;

    public ClaimCommand(LandProtection plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!(sender instanceof Player player)) {
            TextUtil.sendMessage(sender, "<red>Only players can manage claims.</red>");
            return true;
        }

        String cmd = command.getName().toLowerCase();
        Chunk chunk = player.getLocation().getChunk();
        String world = player.getWorld().getName();
        int chunkX = chunk.getX();
        int chunkZ = chunk.getZ();

        NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(player.getUniqueId());
        if (profile == null) {
            TextUtil.sendMessage(player, "<red>Profile not loaded.</red>");
            return true;
        }

        if (cmd.equals("claim")) {
            String claimName = args.length > 0 ? args[0] : player.getName() + "'s Territory";
            plugin.getClaimDAO().createClaim(profile.getInternalId(), world, chunkX, chunkZ, claimName).thenAccept(success -> {
                if (success) {
                    TextUtil.sendMessage(player, "<green>Successfully claimed chunk (<yellow>" + chunkX + ", " + chunkZ + "</yellow>) as <white>" + claimName + "</white>!</green>");
                } else {
                    TextUtil.sendMessage(player, "<red>Failed to claim: This chunk is already claimed by someone else!</red>");
                }
            });
            return true;
        }

        if (cmd.equals("unclaim")) {
            plugin.getClaimDAO().removeClaim(profile.getInternalId(), world, chunkX, chunkZ).thenAccept(success -> {
                if (success) {
                    TextUtil.sendMessage(player, "<green>Unclaimed chunk (<yellow>" + chunkX + ", " + chunkZ + "</yellow>).</green>");
                } else {
                    TextUtil.sendMessage(player, "<red>You do not own this chunk claim.</red>");
                }
            });
            return true;
        }

        if (cmd.equals("trust") || cmd.equals("untrust")) {
            if (args.length < 1) {
                TextUtil.sendMessage(player, "<red>Usage: /" + cmd + " <player></red>");
                return true;
            }
            String target = args[0].toLowerCase();
            plugin.getClaimDAO().getClaim(world, chunkX, chunkZ).thenAccept(optClaim -> {
                if (optClaim.isEmpty() || !optClaim.get().getOwnerId().equals(profile.getInternalId())) {
                    TextUtil.sendMessage(player, "<red>You must be standing inside a claim you own to manage trust.</red>");
                    return;
                }

                var claim = optClaim.get();
                if (cmd.equals("trust")) {
                    claim.getTrustedPlayers().add(target);
                } else {
                    claim.getTrustedPlayers().remove(target);
                }

                plugin.getClaimDAO().updateTrust(claim.getId(), claim.getTrustedPlayers()).thenAccept(res -> {
                    TextUtil.sendMessage(player, "<green>" + (cmd.equals("trust") ? "Granted" : "Revoked") + " trust for <yellow>" + target + "</yellow>.</green>");
                });
            });
            return true;
        }

        if (cmd.equals("claiminfo")) {
            plugin.getClaimDAO().getClaim(world, chunkX, chunkZ).thenAccept(optClaim -> {
                if (optClaim.isEmpty()) {
                    TextUtil.sendMessage(player, "<gray>This chunk (<yellow>" + chunkX + ", " + chunkZ + "</yellow>) is currently <green>Wilderness</green> (unclaimed).</gray>");
                } else {
                    var claim = optClaim.get();
                    TextUtil.sendRaw(player, "<dark_aqua>==================== <bold>CLAIM INFO</bold> ====================</dark_aqua>");
                    TextUtil.sendRaw(player, "<aqua>Name:</aqua> <white>" + claim.getClaimName() + "</white>");
                    TextUtil.sendRaw(player, "<aqua>Chunk:</aqua> <yellow>" + chunkX + ", " + chunkZ + "</yellow>");
                    TextUtil.sendRaw(player, "<aqua>PvP:</aqua> " + (claim.isPvpEnabled() ? "<red>Enabled</red>" : "<green>Disabled</green>"));
                    TextUtil.sendRaw(player, "<aqua>Trusted Members:</aqua> <gray>" + String.join(", ", claim.getTrustedPlayers()) + "</gray>");
                    TextUtil.sendRaw(player, "<dark_aqua>==================================================</dark_aqua>");
                }
            });
            return true;
        }

        return false;
    }
}
