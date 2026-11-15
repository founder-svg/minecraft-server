package net.wixfox.lobby.command;

import net.wixfox.network.util.TextUtil;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.jetbrains.annotations.NotNull;

public class RulesCommand implements CommandExecutor {

    @Override
    public boolean onCommand(@NotNull CommandSender sender, @NotNull Command command, @NotNull String label, @NotNull String[] args) {
        TextUtil.sendRaw(sender, "<dark_aqua>==================== <bold>SERVER RULES</bold> ====================</dark_aqua>");
        TextUtil.sendRaw(sender, "<aqua>1.</aqua> <white>Treat all players and staff with respect. No harassment or toxicity.</white>");
        TextUtil.sendRaw(sender, "<aqua>2.</aqua> <white>No hacking, xray, or unfair client modifications.</white>");
        TextUtil.sendRaw(sender, "<aqua>3.</aqua> <white>No griefing or stealing within claimed lands.</white>");
        TextUtil.sendRaw(sender, "<aqua>4.</aqua> <white>No spamming or advertising other servers in chat.</white>");
        TextUtil.sendRaw(sender, "<aqua>5.</aqua> <white>Keep lag machines to a minimum. Redstone limits apply.</white>");
        TextUtil.sendRaw(sender, "<dark_aqua>=========================================================</dark_aqua>");
        return true;
    }
}
