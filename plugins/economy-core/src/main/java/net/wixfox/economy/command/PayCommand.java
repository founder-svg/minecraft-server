package net.wixfox.economy.command;

import net.wixfox.economy.EconomyCore;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;
import org.jetbrains.annotations.NotNull;

import java.math.BigDecimal;

public class PayCommand implements CommandExecutor {

    private final EconomyCore plugin;

    public PayCommand(EconomyCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!(sender instanceof Player player)) {
            TextUtil.sendMessage(sender, "<red>Only players can execute /pay</red>");
            return true;
        }

        if (args.length < 2) {
            TextUtil.sendMessage(sender, "<red>Usage: /pay <player> <amount></red>");
            return true;
        }

        String targetName = args[0];
        if (player.getName().equalsIgnoreCase(targetName)) {
            TextUtil.sendMessage(sender, "<red>You cannot send money to yourself!</red>");
            return true;
        }

        BigDecimal amount;
        try {
            amount = new BigDecimal(args[1]);
            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                TextUtil.sendMessage(sender, "<red>Amount must be positive.</red>");
                return true;
            }
        } catch (NumberFormatException e) {
            TextUtil.sendMessage(sender, "<red>Invalid number amount: " + args[1] + "</red>");
            return true;
        }

        NetworkPlayerProfile senderProfile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(player.getUniqueId());
        if (senderProfile == null) {
            TextUtil.sendMessage(sender, "<red>Your profile is still loading.</red>");
            return true;
        }

        PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(targetName).thenAccept(optTarget -> {
            if (optTarget.isEmpty()) {
                TextUtil.sendMessage(player, "<red>Player '" + targetName + "' was not found in the network database.</red>");
                return;
            }

            NetworkPlayerProfile targetProfile = optTarget.get();
            plugin.getEconomyDAO().transfer(senderProfile.getInternalId(), targetProfile.getInternalId(), amount).thenAccept(success -> {
                if (success) {
                    TextUtil.sendMessage(player, "<green>Sent <yellow>$" + String.format("%,.2f", amount) + "</yellow> to " + targetProfile.getUsername() + ".</green>");

                    Player onlineTarget = Bukkit.getPlayer(targetProfile.getUsername());
                    if (onlineTarget != null && onlineTarget.isOnline()) {
                        TextUtil.sendMessage(onlineTarget, "<green>Received <yellow>$" + String.format("%,.2f", amount) + "</yellow> from " + player.getName() + "!</green>");
                    }
                } else {
                    TextUtil.sendMessage(player, "<red>Transaction failed! You do not have enough funds.</red>");
                }
            });
        });

        return true;
    }
}
