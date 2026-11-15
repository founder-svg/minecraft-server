package net.wixfox.lobby.gui;

import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.minimessage.MiniMessage;
import net.wixfox.network.util.TextUtil;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import java.util.List;

public class NavigatorGUI implements Listener {

    private static final String GUI_TITLE = "§3§lWixfox Network Selector";
    private static final MiniMessage MM = MiniMessage.miniMessage();

    public static void open(Player player) {
        Inventory inv = Bukkit.createInventory(null, 27, Component.text(GUI_TITLE));

        // Survival SMP Item (Slot 11)
        ItemStack smpItem = new ItemStack(Material.GRASS_BLOCK);
        ItemMeta smpMeta = smpItem.getItemMeta();
        if (smpMeta != null) {
            smpMeta.displayName(MM.deserialize("<green><bold>Survival SMP</bold></green>"));
            smpMeta.lore(List.of(
                    MM.deserialize("<gray>Standard survival multiplayer world.</gray>"),
                    MM.deserialize("<gray>PvP, Land Claims, Economy & Trading.</gray>"),
                    MM.deserialize("<yellow>Crossplay: Java + Bedrock</yellow>"),
                    MM.deserialize("<green>Click to play!</green>")
            ));
            smpItem.setItemMeta(smpMeta);
        }
        inv.setItem(11, smpItem);

        // Rules Book (Slot 13)
        ItemStack rulesItem = new ItemStack(Material.BOOK);
        ItemMeta rulesMeta = rulesItem.getItemMeta();
        if (rulesMeta != null) {
            rulesMeta.displayName(MM.deserialize("<gold><bold>Server Rules</bold></gold>"));
            rulesMeta.lore(List.of(
                    MM.deserialize("<gray>Read the rules and guidelines.</gray>"),
                    MM.deserialize("<yellow>Keep gameplay fun and fair for everyone!</yellow>")
            ));
            rulesItem.setItemMeta(rulesMeta);
        }
        inv.setItem(13, rulesItem);

        // Spawn Star (Slot 15)
        ItemStack spawnItem = new ItemStack(Material.NETHER_STAR);
        ItemMeta spawnMeta = spawnItem.getItemMeta();
        if (spawnMeta != null) {
            spawnMeta.displayName(MM.deserialize("<aqua><bold>Spawn Hub</bold></aqua>"));
            spawnMeta.lore(List.of(
                    MM.deserialize("<gray>Return to spawn.</gray>")
            ));
            spawnItem.setItemMeta(spawnMeta);
        }
        inv.setItem(15, spawnItem);

        player.openInventory(inv);
    }

    @EventHandler
    public void onInventoryClick(InventoryClickEvent event) {
        if (event.getView().title().equals(Component.text(GUI_TITLE))) {
            event.setCancelled(true);
            if (!(event.getWhoClicked() instanceof Player player)) return;

            int slot = event.getRawSlot();
            if (slot == 11) {
                player.closeInventory();
                TextUtil.sendMessage(player, "<green>You are currently on Survival SMP!</green>");
            } else if (slot == 13) {
                player.closeInventory();
                player.performCommand("rules");
            } else if (slot == 15) {
                player.closeInventory();
                player.performCommand("spawn");
            }
        }
    }
}
