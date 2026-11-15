package net.wixfox.moderation.model;

import java.sql.Timestamp;
import java.util.UUID;

public class Punishment {

    private final long id;
    private final UUID playerId;
    private final String type;
    private final String reason;
    private final String punisherName;
    private final Timestamp punishedAt;
    private final Timestamp expiresAt;
    private final boolean isActive;

    public Punishment(long id, UUID playerId, String type, String reason, String punisherName,
                      Timestamp punishedAt, Timestamp expiresAt, boolean isActive) {
        this.id = id;
        this.playerId = playerId;
        this.type = type;
        this.reason = reason;
        this.punisherName = punisherName;
        this.punishedAt = punishedAt;
        this.expiresAt = expiresAt;
        this.isActive = isActive;
    }

    public long getId() { return id; }
    public UUID getPlayerId() { return playerId; }
    public String getType() { return type; }
    public String getReason() { return reason; }
    public String getPunisherName() { return punisherName; }
    public Timestamp getPunishedAt() { return punishedAt; }
    public Timestamp getExpiresAt() { return expiresAt; }
    public boolean isActive() { return isActive; }

    public boolean isExpired() {
        if (expiresAt == null) return false;
        return expiresAt.before(new Timestamp(System.currentTimeMillis()));
    }
}
