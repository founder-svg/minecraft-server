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
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

public class DailyCommand implements CommandExecutor {

    private final EconomyCore plugin;
    private final Map<UUID, Long> cooldowns = new ConcurrentHashMap<>();
    private static final long COOLDOWN_MILLIS = 24 * 60 * 60 * 1000L;
    private static final BigDecimal DAILY_REWARD = new BigDecimal("250.00");

    public DailyCommand(EconomyCore plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        if (!(sender instanceof Player player)) {
            TextUtil.sendMessage(sender, "<red>Only players can claim daily rewards.</red>");
            return true;
        }

        UUID uuid = player.getUniqueId();
        long now = System.currentTimeMillis();
        Long lastClaim = cooldowns.get(uuid);

        if (lastClaim != null && (now - lastClaim) < COOLDOWN_MILLIS) {
            long remainingMillis = COOLDOWN_MILLIS - (now - lastClaim);
            long hours = remainingMillis / (60 * 60 * 1000);
            long minutes = (remainingMillis % (60 * 60 * 1000)) / (60 * 1000);
            TextUtil.sendMessage(player, "<red>You have already claimed your daily reward! Come back in " + hours + "h " + minutes + "m.</red>");
            return true;
        }

        NetworkPlayerProfile profile = PlayerManager.getInstance().getConnectionListener().getCachedProfile(uuid);
        if (profile == null) {
            TextUtil.sendMessage(player, "<red>Profile not loaded.</red>");
            return true;
        }

        plugin.getEconomyDAO().adjustBalance(profile.getInternalId(), DAILY_REWARD, "DAILY_REWARD", "Daily login reward").thenAccept(res -> {
            cooldowns.put(uuid, now);
            TextUtil.sendMessage(player, "<green><bold>CLAIMED!</bold> You received <yellow>$" + DAILY_REWARD + " Coins</yellow> daily reward!</green>");
        });

        return true;
    }
}
