# 20-Player Synthetic Load Test Plan

## Objective
Validate that the Wixfox Minecraft Network maintains **20.0 TPS** and **MSPT < 30ms** when 20 concurrent players (10 Java + 10 Bedrock) are connected simultaneously, moving, breaking blocks, trading, and executing commands.

## Test Matrix
1. **Connection Storm**: Connect 20 clients within 10 seconds.
2. **Chunk Generation**: 5 players sprint in different cardinal directions to force asynchronous chunk loading.
3. **Economy Stress**: 100 simultaneous `/pay` transactions executed via scripts to confirm zero deadlock in PostgreSQL.
4. **Chat & Permissions**: Broadcast chat flood to test AsyncChatEvent MiniMessage rendering overhead.

## Tools
- [Mineflayer](https://github.com/PrismarineJS/mineflayer) (Automated Java bot connections)
- [BedrockBot](https://github.com/bedrock-py/bedrock-bot) (Bedrock synthetic test clients)
- Timings v2 & Spark profiler (`/spark sampler --timeout 60`)
