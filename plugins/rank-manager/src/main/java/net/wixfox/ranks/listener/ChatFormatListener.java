package net.wixfox.ranks.listener;

import io.papermc.paper.event.player.AsyncChatEvent;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.serializer.plain.PlainTextComponentSerializer;
import net.wixfox.ranks.RankManager;
import net.wixfox.ranks.model.Rank;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;

public class ChatFormatListener implements Listener {

    private final RankManager plugin;
    private final MiniMessage miniMessage = MiniMessage.miniMessage();

    public ChatFormatListener(RankManager plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGHEST, ignoreCancelled = true)
    public void onAsyncChat(AsyncChatEvent event) {
        Rank rank = plugin.getPermissionListener().getPlayerRank(event.getPlayer().getUniqueId());
        String prefix = rank != null ? rank.getPrefix() : "<gray>[Member]</gray> ";
        String playerName = event.getPlayer().getName();
        String rawMessage = PlainTextComponentSerializer.plainText().serialize(event.message());

        Component formatted = miniMessage.deserialize(prefix)
                .append(Component.text(playerName + ": "))
                .append(Component.text(rawMessage));

        event.renderer((source, sourceDisplayName, message, viewer) -> formatted);
    }
}
