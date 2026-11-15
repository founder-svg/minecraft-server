# Security Policy — Wixfox Minecraft Network

## 1. Reporting a Vulnerability

Wixfox Technologies takes the security of the Wixfox Minecraft Network and our players' information very seriously.

If you believe you have discovered a security vulnerability in this repository, server configuration, custom plugins, or backend services:

**Please DO NOT open a public issue on GitHub.**

Instead, please send an encrypted or direct email to:
- **Email:** `security@wixfox.net`
- **Subject line:** `[Vulnerability Report] Wixfox Minecraft Server`

Please include in your report:
1. Detailed description of the vulnerability.
2. Steps to reproduce the issue (including proof of concept scripts or commands if applicable).
3. Potential impact on server stability, player data, or infrastructure.
4. Any potential mitigations you have identified.

We will acknowledge receipt of your vulnerability report within **48 hours** and provide regular updates regarding our progress toward resolution.

---

## 2. Supported Versions

| Component | Version | Supported |
|---|---|---|
| Paper Minecraft Server | 1.20.4+ / 1.21.x | :white_check_mark: |
| GeyserMC | Latest Release | :white_check_mark: |
| Floodgate | 2.2.x+ | :white_check_mark: |
| PostgreSQL | 16.x LTS | :white_check_mark: |
| NestJS Backend | 10.x | :white_check_mark: |
| React Admin Dashboard | 18.x | :white_check_mark: |

---

## 3. Core Security Rules & Guidelines

1. **Environment Variables**: Never commit `.env` files, SSH keys, RCON passwords, or database credentials to GitHub. Always use `.env.example` as a template.
2. **Bedrock Authentication**: Always maintain strict `Floodgate` encryption key exchange (`key.pem`). Never rely solely on matching usernames between Java and Bedrock.
3. **Database Security**:
   - The PostgreSQL container must never bind to `0.0.0.0` or expose port `5432` to the public internet.
   - All database access must use connection pooling (HikariCP) with parameterized prepared statements to prevent SQL injection.
4. **Minecraft RCON**:
   - RCON must be bound only to internal Docker network addresses (`127.0.0.1` or the Docker bridge).
   - Use high-entropy passwords (minimum 32 characters).
5. **Rate Limiting & DDoS Mitigation**:
   - Web APIs are protected with Nginx reverse proxy rate limiting.
   - Minecraft connection throttles (`connection-throttle: 4000`) are active in `bukkit.yml` to prevent bot flooding.
