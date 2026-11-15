package net.wixfox.moderation.command;

import net.kyori.adventure.text.Component;
import net.wixfox.moderation.ModerationCore;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

import java.sql.Timestamp;
import java.util.Arrays;

public class BanCommand implements CommandExecutor {

    private final ModerationCore plugin;

    public BanCommand(ModerationCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        String cmd = command.getName().toLowerCase();

        if (cmd.equals("unban")) {
            if (args.length < 1) {
                TextUtil.sendMessage(sender, "<red>Usage: /unban <player></red>");
                return true;
            }
            String target = args[0];
            PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(target).thenAccept(optProfile -> {
                if (optProfile.isEmpty()) {
                    TextUtil.sendMessage(sender, "<red>Player not found.</red>");
                    return;
                }
                plugin.getPunishmentDAO().deactivatePunishments(optProfile.get().getInternalId(), "BAN", sender.getName()).thenAccept(res -> {
                    if (res) {
                        TextUtil.sendMessage(sender, "<green>Unbanned " + target + ".</green>");
                    } else {
                        TextUtil.sendMessage(sender, "<red>Player " + target + " was not banned.</red>");
                    }
                });
            });
            return true;
        }

        if (cmd.equals("ban") || cmd.equals("tempban")) {
            if (args.length < 2) {
                TextUtil.sendMessage(sender, "<red>Usage: /" + cmd + " <player> " + (cmd.equals("tempban") ? "<duration_minutes> " : "") + "<reason></red>");
                return true;
            }

            String target = args[0];
            Timestamp expiresAt = null;
            int reasonStartIndex = 1;

            if (cmd.equals("tempban")) {
                try {
                    int minutes = Integer.parseInt(args[1]);
                    expiresAt = new Timestamp(System.currentTimeMillis() + (minutes * 60L * 1000L));
                    reasonStartIndex = 2;
                } catch (NumberFormatException e) {
                    TextUtil.sendMessage(sender, "<red>Invalid minutes: " + args[1] + "</red>");
                    return true;
                }
            }

            final Timestamp finalExpiresAt = expiresAt;
            final String reason = args.length > reasonStartIndex ? String.join(" ", Arrays.copyOfRange(args, reasonStartIndex, args.length)) : "Violation of server rules";

            PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(target).thenAccept(optProfile -> {
                if (optProfile.isEmpty()) {
                    TextUtil.sendMessage(sender, "<red>Player " + target + " not found.</red>");
                    return;
                }

                var profile = optProfile.get();
                plugin.getPunishmentDAO().addPunishment(profile.getInternalId(), "BAN", reason, sender.getName(), finalExpiresAt).thenAccept(res -> {
                    TextUtil.sendMessage(sender, "<green>Banned " + profile.getUsername() + " for: " + reason + "</green>");

                    Player onlinePlayer = Bukkit.getPlayer(profile.getUsername());
                    if (onlinePlayer != null && onlinePlayer.isOnline()) {
                        Bukkit.getScheduler().runTask(plugin, () -> {
                            onlinePlayer.kick(Component.text("§cYou have been banned from Wixfox Network.\n§7Reason: §f" + reason));
                        });
                    }
                });
            });
            return true;
        }

        return false;
    }
}
