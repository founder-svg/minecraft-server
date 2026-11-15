package net.wixfox.land.model;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class LandClaim {

    private final long id;
    private final UUID ownerId;
    private final String worldName;
    private final int chunkX;
    private final int chunkZ;
    private String claimName;
    private boolean pvpEnabled;
    private boolean publicAccess;
    private final Set<String> trustedPlayers;

    public LandClaim(long id, UUID ownerId, String worldName, int chunkX, int chunkZ,
                     String claimName, boolean pvpEnabled, boolean publicAccess, Set<String> trustedPlayers) {
        this.id = id;
        this.ownerId = ownerId;
        this.worldName = worldName;
        this.chunkX = chunkX;
        this.chunkZ = chunkZ;
        this.claimName = claimName;
        this.pvpEnabled = pvpEnabled;
        this.publicAccess = publicAccess;
        this.trustedPlayers = trustedPlayers != null ? trustedPlayers : new HashSet<>();
    }

    public long getId() { return id; }
    public UUID getOwnerId() { return ownerId; }
    public String getWorldName() { return worldName; }
    public int getChunkX() { return chunkX; }
    public int getChunkZ() { return chunkZ; }
    public String getClaimName() { return claimName; }
    public boolean isPvpEnabled() { return pvpEnabled; }
    public boolean isPublicAccess() { return publicAccess; }
    public Set<String> getTrustedPlayers() { return trustedPlayers; }

    public boolean isTrusted(String username) {
        return trustedPlayers.contains(username.toLowerCase());
    }
}
