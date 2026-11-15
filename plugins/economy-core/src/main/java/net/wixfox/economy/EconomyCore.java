package net.wixfox.economy;

import net.milkbowl.vault.economy.Economy;
import net.wixfox.economy.command.BalanceCommand;
import net.wixfox.economy.command.DailyCommand;
import net.wixfox.economy.command.EcoAdminCommand;
import net.wixfox.economy.command.PayCommand;
import net.wixfox.economy.dao.EconomyDAO;
import net.wixfox.economy.vault.WixfoxVaultEconomy;
import net.wixfox.network.NetworkCore;
import org.bukkit.Bukkit;
import org.bukkit.plugin.ServicePriority;
import org.bukkit.plugin.java.JavaPlugin;

import java.util.Objects;

public class EconomyCore extends JavaPlugin {

    private static EconomyCore instance;
    private EconomyDAO economyDAO;

    @Override
    public void onEnable() {
        instance = this;

        NetworkCore core = NetworkCore.getInstance();
        if (core == null || core.getDatabaseManager() == null) {
            getLogger().severe("NetworkCore not found! Disabling EconomyCore.");
            getServer().getPluginManager().disablePlugin(this);
            return;
        }

        this.economyDAO = new EconomyDAO(core.getDatabaseManager());

        // Register commands
        Objects.requireNonNull(getCommand("balance")).setExecutor(new BalanceCommand(this));
        Objects.requireNonNull(getCommand("pay")).setExecutor(new PayCommand(this));
        Objects.requireNonNull(getCommand("eco")).setExecutor(new EcoAdminCommand(this));
        Objects.requireNonNull(getCommand("daily")).setExecutor(new DailyCommand(this));

        // Hook into Vault
        if (Bukkit.getPluginManager().isPluginEnabled("Vault")) {
            Bukkit.getServicesManager().register(Economy.class, new WixfoxVaultEconomy(this), this, ServicePriority.High);
            getLogger().info("Successfully hooked into Vault Economy API.");
        }

        getLogger().info("EconomyCore enabled successfully.");
    }

    public static EconomyCore getInstance() {
        return instance;
    }

    public EconomyDAO getEconomyDAO() {
        return economyDAO;
    }
}
