package net.wixfox.moderation.command;

import net.wixfox.moderation.ModerationCore;
import net.wixfox.moderation.model.Punishment;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.jetbrains.annotations.NotNull;

import java.util.List;

public class HistoryCommand implements CommandExecutor {

    private final ModerationCore plugin;

    public HistoryCommand(ModerationCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!sender.hasPermission("wixfox.mod.history")) {
            TextUtil.sendMessage(sender, "<red>You do not have permission to view punishment history.</red>");
            return true;
        }

        if (args.length < 1) {
            TextUtil.sendMessage(sender, "<red>Usage: /history <player></red>");
            return true;
        }

        String target = args[0];
        PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(target).thenAccept(optProfile -> {
            if (optProfile.isEmpty()) {
                TextUtil.sendMessage(sender, "<red>Player " + target + " not found.</red>");
                return;
            }

            var profile = optProfile.get();
            plugin.getPunishmentDAO().getHistory(profile.getInternalId()).thenAccept(history -> {
                TextUtil.sendRaw(sender, "<dark_aqua>==================== <bold>PUNISHMENT HISTORY</bold> ====================</dark_aqua>");
                TextUtil.sendRaw(sender, "<aqua>Target:</aqua> <white>" + profile.getUsername() + "</white> | Total: <yellow>" + history.size() + "</yellow>");

                if (history.isEmpty()) {
                    TextUtil.sendRaw(sender, "<green>No punishment history recorded for this player.</green>");
                } else {
                    for (Punishment p : history) {
                        String status = p.isActive() ? "<red>[ACTIVE]</red>" : "<gray>[EXPIRED]</gray>";
                        TextUtil.sendRaw(sender, status + " <yellow>" + p.getType() + "</yellow> by <white>" + p.getPunisherName() + "</white>: <gray>" + p.getReason() + " (" + p.getPunishedAt() + ")</gray>");
                    }
                }
                TextUtil.sendRaw(sender, "<dark_aqua>=========================================================</dark_aqua>");
            });
        });

        return true;
    }
}
