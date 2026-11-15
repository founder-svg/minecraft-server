package net.wixfox.network.event;

import org.bukkit.entity.Player;
import org.bukkit.event.Event;
import org.bukkit.event.HandlerList;
import org.jetbrains.annotations.NotNull;

import java.util.UUID;

public abstract class NetworkPlayerEvent extends Event {

    private static final HandlerList HANDLERS = new HandlerList();
    private final Player player;
    private final UUID networkId;

    public NetworkPlayerEvent(Player player, UUID networkId, boolean async) {
        super(async);
        this.player = player;
        this.networkId = networkId;
    }

    public Player getPlayer() {
        return player;
    }

    public UUID getNetworkId() {
        return networkId;
    }

    @Override
    public @NotNull HandlerList getHandlers() {
        return HANDLERS;
    }

    public static HandlerList getHandlerList() {
        return HANDLERS;
    }
}
