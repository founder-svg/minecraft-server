package net.wixfox.players.command;

import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

public class ProfileCommand implements CommandExecutor {

    private final PlayerManager plugin;

    public ProfileCommand(PlayerManager plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        String targetUsername;
        if (args.length > 0) {
            targetUsername = args[0];
        } else if (sender instanceof Player player) {
            targetUsername = player.getName();
        } else {
            TextUtil.sendMessage(sender, "<red>Usage: /profile <player></red>");
            return true;
        }

        TextUtil.sendMessage(sender, "<gray>Fetching profile for <white>" + targetUsername + "</white>...</gray>");

        plugin.getPlayerDAO().getProfileByUsername(targetUsername).thenAccept(optProfile -> {
            if (optProfile.isEmpty()) {
                TextUtil.sendMessage(sender, "<red>Player not found in network database.</red>");
                return;
            }

            NetworkPlayerProfile profile = optProfile.get();
            long hours = profile.getPlaytimeSeconds() / 3600;
            long minutes = (profile.getPlaytimeSeconds() % 3600) / 60;

            TextUtil.sendRaw(sender, "<dark_aqua>==================== <bold>PLAYER PROFILE</bold> ====================</dark_aqua>");
            TextUtil.sendRaw(sender, "<aqua>Username:</aqua> <white>" + profile.getUsername() + "</white>");
            TextUtil.sendRaw(sender, "<aqua>Platform:</aqua> <green>" + profile.getPlatform().name() + "</green>");
            TextUtil.sendRaw(sender, "<aqua>Account Status:</aqua> <yellow>" + profile.getAccountStatus() + "</yellow>");
            TextUtil.sendRaw(sender, "<aqua>Playtime:</aqua> <white>" + hours + "h " + minutes + "m</white>");
            TextUtil.sendRaw(sender, "<aqua>First Seen:</aqua> <gray>" + profile.getFirstLogin() + "</gray>");
            TextUtil.sendRaw(sender, "<aqua>Last Seen:</aqua> <gray>" + profile.getLastLogin() + "</gray>");
            TextUtil.sendRaw(sender, "<dark_aqua>=========================================================</dark_aqua>");
        });

        return true;
    }
}
