package net.wixfox.network.util;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.text.serializer.legacy.LegacyComponentSerializer;
import org.bukkit.command.CommandSender;

public final class TextUtil {

    private static final MiniMessage MINI_MESSAGE = MiniMessage.miniMessage();
    private static final LegacyComponentSerializer LEGACY_SERIALIZER = LegacyComponentSerializer.legacyAmpersand();
    private static final String DEFAULT_PREFIX = "<gradient:#00C9FF:#92FE9D>[Wixfox]</gradient> <gray>";

    private TextUtil() {}

    public static Component parse(String input) {
        if (input == null || input.isEmpty()) {
            return Component.empty();
        }
        // Handle legacy & codes if present
        if (input.contains("&")) {
            return LEGACY_SERIALIZER.deserialize(input);
        }
        return MINI_MESSAGE.deserialize(input);
    }

    public static void sendMessage(CommandSender sender, String message) {
        sender.sendMessage(parse(DEFAULT_PREFIX + message + "</gray>"));
    }

    public static void sendRaw(CommandSender sender, String message) {
        sender.sendMessage(parse(message));
    }
}
