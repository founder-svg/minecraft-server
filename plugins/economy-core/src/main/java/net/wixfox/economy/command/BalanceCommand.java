package net.wixfox.economy.command;

import net.wixfox.economy.EconomyCore;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

import java.math.BigDecimal;

public class BalanceCommand implements CommandExecutor {

    private final EconomyCore plugin;

    public BalanceCommand(EconomyCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (args.length == 0) {
            if (!(sender instanceof Player player)) {
                TextUtil.sendMessage(sender, "<red>Console must specify a player: /balance <player></red>");
                return true;
            }
            NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(player.getUniqueId());
            if (profile == null) {
                TextUtil.sendMessage(sender, "<red>Profile not loaded.</red>");
                return true;
            }
            plugin.getEconomyDAO().getBalance(profile.getInternalId()).thenAccept(balance -> {
                TextUtil.sendMessage(sender, "<gray>Your balance: <green>$" + String.format("%,.2f", balance) + "</green></gray>");
            });
            return true;
        }

        // View other player's balance
        String targetName = args[0];
        PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(targetName).thenAccept(optProfile -> {
            if (optProfile.isEmpty()) {
                TextUtil.sendMessage(sender, "<red>Player '" + targetName + "' not found.</red>");
                return;
            }
            NetworkPlayerProfile targetProfile = optProfile.get();
            plugin.getEconomyDAO().getBalance(targetProfile.getInternalId()).thenAccept(balance -> {
                TextUtil.sendMessage(sender, "<gray>" + targetProfile.getUsername() + "'s balance: <green>$" + String.format("%,.2f", balance) + "</green></gray>");
            });
        });

        return true;
    }
}
