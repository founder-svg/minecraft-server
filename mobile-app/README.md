# Wixfox Network Mobile Application (Capacitor)

## Overview
Phase 7 expansion module providing Android and iOS mobile administration for the Wixfox Minecraft Network.

## Architecture
- Framework: [Capacitor](https://capacitorjs.com/) + React + TypeScript
- Communicates exclusively with the NestJS Administration API (`/api/`) over HTTPS.
- Never directly connects to PostgreSQL or exposes RCON ports.

## Planned Features
- Push notifications for server offline/TPS drop alerts.
- Live player count and CPU/RAM charts.
- Quick-moderation actions (Ban, Kick, Mute, Warn) from phone.
- One-tap server restart request.
