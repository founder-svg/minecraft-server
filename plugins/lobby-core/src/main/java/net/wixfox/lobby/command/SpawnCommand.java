package net.wixfox.lobby.command;

import net.wixfox.lobby.LobbyCore;
import net.wixfox.network.util.TextUtil;
import org.bukkit.Location;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

public class SpawnCommand implements CommandExecutor {

    private final LobbyCore plugin;

    public SpawnCommand(LobbyCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!(sender instanceof Player player)) {
            TextUtil.sendMessage(sender, "<red>Only players can teleport to spawn.</red>");
            return true;
        }

        if (command.getName().equalsIgnoreCase("setspawn")) {
            if (!player.hasPermission("wixfox.admin")) {
                TextUtil.sendMessage(player, "<red>You do not have permission to set spawn.</red>");
                return true;
            }
            plugin.setSpawnLocation(player.getLocation());
            TextUtil.sendMessage(player, "<green>Global server spawn location updated to your coordinates!</green>");
            return true;
        }

        Location spawn = plugin.getSpawnLocation();
        if (spawn == null) {
            spawn = player.getWorld().getSpawnLocation();
        }

        player.teleport(spawn);
        TextUtil.sendMessage(player, "<green>Teleported to server spawn!</green>");
        return true;
    }
}
