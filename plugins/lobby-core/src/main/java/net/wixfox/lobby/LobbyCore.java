package net.wixfox.lobby;

import net.wixfox.lobby.command.RulesCommand;
import net.wixfox.lobby.command.SpawnCommand;
import net.wixfox.lobby.gui.NavigatorGUI;
import net.wixfox.lobby.listener.SpawnListener;
import org.bukkit.Bukkit;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Objects;

public class LobbyCore extends JavaPlugin {

    private static LobbyCore instance;
    private Location spawnLocation;

    @Override
    public void onEnable() {
        instance = this;
        saveDefaultConfig();

        loadSpawnLocation();

        getServer().getPluginManager().registerEvents(new SpawnListener(this), this);
        getServer().getPluginManager().registerEvents(new NavigatorGUI(), this);

        SpawnCommand spawnCmd = new SpawnCommand(this);
        Objects.requireNonNull(getCommand("spawn")).setExecutor(spawnCmd);
        Objects.requireNonNull(getCommand("setspawn")).setExecutor(spawnCmd);
        Objects.requireNonNull(getCommand("rules")).setExecutor(new RulesCommand());
        Objects.requireNonNull(getCommand("navigator")).setExecutor((sender, command, label, args) -> {
            if (sender instanceof org.bukkit.entity.Player player) {
                NavigatorGUI.open(player);
                return true;
            }
            return false;
        });

        getLogger().info("LobbyCore enabled successfully.");
    }

    private void loadSpawnLocation() {
        if (getConfig().contains("spawn.world")) {
            String worldName = getConfig().getString("spawn.world", "world");
            World world = Bukkit.getWorld(worldName);
            if (world != null) {
                double x = getConfig().getDouble("spawn.x");
                double y = getConfig().getDouble("spawn.y");
                double z = getConfig().getDouble("spawn.z");
                float yaw = (float) getConfig().getDouble("spawn.yaw");
                float pitch = (float) getConfig().getDouble("spawn.pitch");
                this.spawnLocation = new Location(world, x, y, z, yaw, pitch);
            }
        }
    }

    public void setSpawnLocation(Location location) {
        this.spawnLocation = location;
        getConfig().set("spawn.world", location.getWorld().getName());
        getConfig().set("spawn.x", location.getX());
        getConfig().set("spawn.y", location.getY());
        getConfig().set("spawn.z", location.getZ());
        getConfig().set("spawn.yaw", location.getYaw());
        getConfig().set("spawn.pitch", location.getPitch());
        saveConfig();
    }

    public Location getSpawnLocation() {
        return spawnLocation;
    }

    public static LobbyCore getInstance() {
        return instance;
    }
}
