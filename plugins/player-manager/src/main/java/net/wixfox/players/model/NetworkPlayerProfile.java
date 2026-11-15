package net.wixfox.players.model;

import net.wixfox.network.model.PlatformType;

import java.sql.Timestamp;
import java.util.UUID;

public class NetworkPlayerProfile {

    private final UUID internalId;
    private final String username;
    private final PlatformType platform;
    private final String platformUuid;
    private final Timestamp firstLogin;
    private Timestamp lastLogin;
    private String lastIp;
    private long playtimeSeconds;
    private String accountStatus;

    public NetworkPlayerProfile(UUID internalId, String username, PlatformType platform, String platformUuid,
                                Timestamp firstLogin, Timestamp lastLogin, String lastIp, long playtimeSeconds, String accountStatus) {
        this.internalId = internalId;
        this.username = username;
        this.platform = platform;
        this.platformUuid = platformUuid;
        this.firstLogin = firstLogin;
        this.lastLogin = lastLogin;
        this.lastIp = lastIp;
        this.playtimeSeconds = playtimeSeconds;
        this.accountStatus = accountStatus;
    }

    public UUID getInternalId() { return internalId; }
    public String getUsername() { return username; }
    public PlatformType getPlatform() { return platform; }
    public String getPlatformUuid() { return platformUuid; }
    public Timestamp getFirstLogin() { return firstLogin; }
    public Timestamp getLastLogin() { return lastLogin; }
    public String getLastIp() { return lastIp; }
    public long getPlaytimeSeconds() { return playtimeSeconds; }
    public String getAccountStatus() { return accountStatus; }

    public void setLastLogin(Timestamp lastLogin) { this.lastLogin = lastLogin; }
    public void setLastIp(String lastIp) { this.lastIp = lastIp; }
    public void addPlaytime(long seconds) { this.playtimeSeconds += seconds; }
}
