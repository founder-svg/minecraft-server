package net.wixfox.ranks.command;

import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.ranks.RankManager;
import net.wixfox.ranks.model.Rank;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

public class RankCommand implements CommandExecutor {

    private final RankManager plugin;

    public RankCommand(RankManager plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!sender.hasPermission("wixfox.ranks.assign")) {
            TextUtil.sendMessage(sender, "<red>You do not have permission to assign ranks.</red>");
            return true;
        }

        if (args.length == 0) {
            TextUtil.sendMessage(sender, "<red>Usage: /rank <set|list|info> [args]</red>");
            return true;
        }

        String sub = args[0].toLowerCase();
        if (sub.equals("list")) {
            TextUtil.sendMessage(sender, "<gold>Available Network Ranks:</gold>");
            for (Rank r : plugin.getCachedRanks().values()) {
                TextUtil.sendRaw(sender, "<gray>• " + r.getPrefix() + "<white>" + r.getName() + " (weight: " + r.getWeight() + ")</white></gray>");
            }
            return true;
        }

        if (sub.equals("set")) {
            if (args.length < 3) {
                TextUtil.sendMessage(sender, "<red>Usage: /rank set <player> <rank></red>");
                return true;
            }

            String targetName = args[1];
            String rankName = args[2].toLowerCase();

            Rank targetRank = plugin.getCachedRanks().get(rankName);
            if (targetRank == null) {
                TextUtil.sendMessage(sender, "<red>Rank '" + rankName + "' does not exist!</red>");
                return true;
            }

            PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(targetName).thenAccept(optProfile -> {
                if (optProfile.isEmpty()) {
                    TextUtil.sendMessage(sender, "<red>Player '" + targetName + "' was not found.</red>");
                    return;
                }

                var profile = optProfile.get();
                plugin.getRankDAO().setPlayerRank(profile.getInternalId(), targetRank.getId(), sender.getName(), null).thenAccept(success -> {
                    TextUtil.sendMessage(sender, "<green>Assigned rank <yellow>" + targetRank.getName() + "</yellow> to " + profile.getUsername() + ".</green>");

                    Player onlinePlayer = Bukkit.getPlayer(profile.getUsername());
                    if (onlinePlayer != null && onlinePlayer.isOnline()) {
                        plugin.getPermissionListener().applyPlayerRankAndPermissions(onlinePlayer);
                        TextUtil.sendMessage(onlinePlayer, "<green>Your rank has been updated to " + targetRank.getPrefix() + "<white>" + targetRank.getDisplayName() + "</white>!</green>");
                    }
                });
            });
            return true;
        }

        return false;
    }
}
