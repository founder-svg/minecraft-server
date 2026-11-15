package net.wixfox.moderation.command;

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

public class MuteCommand implements CommandExecutor {

    private final ModerationCore plugin;

    public MuteCommand(ModerationCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        String cmd = command.getName().toLowerCase();

        if (cmd.equals("warn")) {
            if (args.length < 2) {
                TextUtil.sendMessage(sender, "<red>Usage: /warn <player> <reason></red>");
                return true;
            }
            String target = args[0];
            String reason = String.join(" ", Arrays.copyOfRange(args, 1, args.length));

            PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(target).thenAccept(optProfile -> {
                if (optProfile.isEmpty()) {
                    TextUtil.sendMessage(sender, "<red>Player not found.</red>");
                    return;
                }
                var profile = optProfile.get();
                plugin.getPunishmentDAO().addPunishment(profile.getInternalId(), "WARN", reason, sender.getName(), null).thenAccept(res -> {
                    TextUtil.sendMessage(sender, "<green>Warned " + profile.getUsername() + " for: " + reason + "</green>");
                    Player p = Bukkit.getPlayer(profile.getUsername());
                    if (p != null) {
                        TextUtil.sendMessage(p, "<red><bold>[WARNING]</bold> You have been officially warned for: " + reason + "</red>");
                    }
                });
            });
            return true;
        }

        if (cmd.equals("mute") || cmd.equals("tempmute")) {
            if (args.length < 2) {
                TextUtil.sendMessage(sender, "<red>Usage: /" + cmd + " <player> " + (cmd.equals("tempmute") ? "<duration_minutes> " : "") + "<reason></red>");
                return true;
            }

            String target = args[0];
            Timestamp expiresAt = null;
            int reasonIndex = 1;

            if (cmd.equals("tempmute")) {
                try {
                    int minutes = Integer.parseInt(args[1]);
                    expiresAt = new Timestamp(System.currentTimeMillis() + (minutes * 60L * 1000L));
                    reasonIndex = 2;
                } catch (NumberFormatException e) {
                    TextUtil.sendMessage(sender, "<red>Invalid minutes: " + args[1] + "</red>");
                    return true;
                }
            }

            final Timestamp finalExpiresAt = expiresAt;
            final String reason = args.length > reasonIndex ? String.join(" ", Arrays.copyOfRange(args, reasonIndex, args.length)) : "Chat misconduct";

            PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(target).thenAccept(optProfile -> {
                if (optProfile.isEmpty()) {
                    TextUtil.sendMessage(sender, "<red>Player not found.</red>");
                    return;
                }
                var profile = optProfile.get();
                plugin.getPunishmentDAO().addPunishment(profile.getInternalId(), "MUTE", reason, sender.getName(), finalExpiresAt).thenAccept(res -> {
                    TextUtil.sendMessage(sender, "<green>Muted " + profile.getUsername() + ".</green>");
                    Player p = Bukkit.getPlayer(profile.getUsername());
                    if (p != null) {
                        TextUtil.sendMessage(p, "<red>You have been muted from chat. Reason: " + reason + "</red>");
                    }
                });
            });
            return true;
        }

        return false;
    }
}
