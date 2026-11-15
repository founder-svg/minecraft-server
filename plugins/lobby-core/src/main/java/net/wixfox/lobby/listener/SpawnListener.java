package net.wixfox.lobby.listener;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.kyori.adventure.title.Title;
import net.wixfox.lobby.LobbyCore;
import net.wixfox.lobby.gui.NavigatorGUI;
import net.wixfox.network.util.TextUtil;
import org.bukkit.Location;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.player.PlayerInteractEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import java.time.Duration;

public class SpawnListener implements Listener {

    private final LobbyCore plugin;
    private final MiniMessage mm = MiniMessage.miniMessage();

    public SpawnListener(LobbyCore plugin) {
        this.plugin = plugin;
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onPlayerJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();

        // Send welcome title
        Title title = Title.title(
                mm.deserialize("<gradient:#00C9FF:#92FE9D><bold>WIXFOX NETWORK</bold></gradient>"),
                mm.deserialize("<gray>Welcome, <white>" + player.getName() + "</white>! Enjoy your stay.</gray>"),
                Title.Times.times(Duration.ofMillis(500), Duration.ofMillis(3000), Duration.ofMillis(1000))
        );
        player.showTitle(title);

        // Give navigator compass if not already in inventory
        ItemStack compass = createNavigatorItem();
        if (!player.getInventory().contains(Material.COMPASS)) {
            player.getInventory().setItem(4, compass);
        }

        // Teleport to spawn if set
        Location spawn = plugin.getSpawnLocation();
        if (spawn != null && !player.hasPlayedBefore()) {
            player.teleport(spawn);
        }
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onVoidDamage(EntityDamageEvent event) {
        if (event.getEntity() instanceof Player player && event.getCause() == EntityDamageEvent.DamageCause.VOID) {
            Location spawn = plugin.getSpawnLocation();
            if (spawn != null) {
                event.setCancelled(true);
                player.setFallDistance(0);
                player.teleport(spawn);
                TextUtil.sendMessage(player, "<yellow>Rescued from the void! Returned to spawn.</yellow>");
            }
        }
    }

    @EventHandler
    public void onInteract(PlayerInteractEvent event) {
        ItemStack item = event.getItem();
        if (item != null && item.getType() == Material.COMPASS && item.hasItemMeta()) {
            NavigatorGUI.open(event.getPlayer());
            event.setCancelled(true);
        }
    }

    public static ItemStack createNavigatorItem() {
        ItemStack item = new ItemStack(Material.COMPASS);
        ItemMeta meta = item.getItemMeta();
        if (meta != null) {
            meta.displayName(MiniMessage.miniMessage().deserialize("<aqua><bold>Network Navigator</bold></aqua> <gray>(Right-Click)</gray>"));
            item.setItemMeta(meta);
        }
        return item;
    }
}
