package net.wixfox.economy.command;

import net.wixfox.economy.EconomyCore;
import net.wixfox.network.util.TextUtil;
import net.wixfox.players.PlayerManager;
import net.wixfox.players.model.NetworkPlayerProfile;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.jetbrains.annotations.NotNull;

import java.math.BigDecimal;

public class EcoAdminCommand implements CommandExecutor {

    private final EconomyCore plugin;

    public EcoAdminCommand(EconomyCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!sender.hasPermission("wixfox.eco.admin")) {
            TextUtil.sendMessage(sender, "<red>You do not have permission for this command.</red>");
            return true;
        }

        if (args.length < 3) {
            TextUtil.sendMessage(sender, "<red>Usage: /eco <give|take|set> <player> <amount></red>");
            return true;
        }

        String sub = args[0].toLowerCase();
        String targetName = args[1];
        BigDecimal amount;
        try {
            amount = new BigDecimal(args[2]);
            if (amount.compareTo(BigDecimal.ZERO) < 0) {
                TextUtil.sendMessage(sender, "<red>Amount cannot be negative.</red>");
                return true;
            }
        } catch (NumberFormatException e) {
            TextUtil.sendMessage(sender, "<red>Invalid numeric amount: " + args[2] + "</red>");
            return true;
        }

        PlayerManager.getInstance().getPlayerDAO().getProfileByUsername(targetName).thenAccept(optTarget -> {
            if (optTarget.isEmpty()) {
                TextUtil.sendMessage(sender, "<red>Player not found.</red>");
                return;
            }

            NetworkPlayerProfile profile = optTarget.get();
            switch (sub) {
                case "give" -> plugin.getEconomyDAO().adjustBalance(profile.getInternalId(), amount, "ADMIN_GIVE", "Admin balance addition by " + sender.getName()).thenAccept(res -> {
                    TextUtil.sendMessage(sender, "<green>Added <yellow>$" + amount + "</yellow> to " + profile.getUsername() + "'s balance.</green>");
                });
                case "take" -> plugin.getEconomyDAO().adjustBalance(profile.getInternalId(), amount.negate(), "ADMIN_TAKE", "Admin balance deduction by " + sender.getName()).thenAccept(res -> {
                    if (res) {
                        TextUtil.sendMessage(sender, "<green>Deducted <yellow>$" + amount + "</yellow> from " + profile.getUsername() + "'s balance.</green>");
                    } else {
                        TextUtil.sendMessage(sender, "<red>Player has insufficient funds.</red>");
                    }
                });
                case "set" -> plugin.getEconomyDAO().setBalance(profile.getInternalId(), amount).thenAccept(res -> {
                    TextUtil.sendMessage(sender, "<green>Set " + profile.getUsername() + "'s balance to <yellow>$" + amount + "</yellow>.</green>");
                });
                default -> TextUtil.sendMessage(sender, "<red>Unknown action. Use give, take, or set.</red>");
            }
        });

        return true;
    }
}
