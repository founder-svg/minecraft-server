#!/bin/bash
set -e

# Validate that RCON_PASSWORD is set and not empty (No fallback to insecure defaults)
if [ -z "$RCON_PASSWORD" ]; then
    echo "[-] FATAL ERROR: RCON_PASSWORD environment variable is required and must not be empty!" >&2
    exit 1
fi

if [ -f "/data/server.properties" ]; then
    sed -i "s/\${RCON_PASSWORD}/${RCON_PASSWORD}/g" /data/server.properties
fi

MIN_RAM=${MINECRAFT_RAM_MIN:-4G}
MAX_RAM=${MINECRAFT_RAM_MAX:-5G}

echo "=========================================================="
echo " Starting Wixfox Minecraft Network (Paper 1.20.4 + Geyser)"
echo " Memory: ${MIN_RAM} to ${MAX_RAM} (Aikar's G1GC Flags)"
echo " Ports: Java 25565 (TCP) | Bedrock 19132 (UDP)"
echo " Target Capacity: 20 Concurrent Players"
echo "=========================================================="

# Aikar's Optimized G1GC JVM Flags
exec java \
  -Xms${MIN_RAM} \
  -Xmx${MAX_RAM} \
  -XX:+UseG1GC \
  -XX:+ParallelRefProcEnabled \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UnlockExperimentalVMOptions \
  -XX:+DisableExplicitGC \
  -XX:+AlwaysPreTouch \
  -XX:G1NewSizePercent=30 \
  -XX:G1MaxNewSizePercent=40 \
  -XX:G1ReservePercent=20 \
  -XX:G1HeapWastePercent=5 \
  -XX:G1MixedGCCountTarget=4 \
  -XX:InitiatingHeapOccupancyPercent=15 \
  -XX:G1MixedGCLiveThresholdPercent=90 \
  -XX:G1RSetUpdatingPauseTimePercent=5 \
  -XX:SurvivorRatio=32 \
  -XX:+PerfDisableSharedMem \
  -XX:MaxTenuringThreshold=1 \
  -Dusing.aikars.flags=https://mcflags.emc.gs \
  -Daikars.new.flags=true \
  -jar /data/paper.jar --nogui
