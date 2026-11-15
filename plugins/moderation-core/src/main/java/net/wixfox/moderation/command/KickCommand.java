package net.wixfox.moderation.command;

import net.kyori.adventure.text.Component;
import net.wixfox.moderation.ModerationCore;
import net.wixfox.network.util.TextUtil;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

import java.util.Arrays;

public class KickCommand implements CommandExecutor {

    private final ModerationCore plugin;

    public KickCommand(ModerationCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!sender.hasPermission("wixfox.mod.kick")) {
            TextUtil.sendMessage(sender, "<red>You do not have permission to kick players.</red>");
            return true;
        }

        if (args.length < 1) {
            TextUtil.sendMessage(sender, "<red>Usage: /kick <player> [reason]</red>");
            return true;
        }

        Player target = Bukkit.getPlayer(args[0]);
        if (target == null || !target.isOnline()) {
            TextUtil.sendMessage(sender, "<red>Player is not online.</red>");
            return true;
        }

        String reason = args.length > 1 ? String.join(" ", Arrays.copyOfRange(args, 1, args.length)) : "Kicked by staff member";
        target.kick(Component.text("§cYou were kicked from Wixfox Network.\n§7Reason: §f" + reason));
        TextUtil.sendMessage(sender, "<green>Kicked " + target.getName() + " for: " + reason + "</green>");
        return true;
    }
}
