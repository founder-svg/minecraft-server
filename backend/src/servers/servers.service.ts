import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Rcon } from 'rcon-client';

@Injectable()
export class ServersService {
  private readonly logger = new Logger(ServersService.name);

  constructor(private readonly db: DatabaseService) {}

  async getServerStatus() {
    const res = await this.db.query('SELECT * FROM servers LIMIT 1');
    const server = res.rows[0] || {
      server_name: 'wixfox-smp',
      is_online: false,
      max_players: 20,
    };

    let rconResponse = null;
    let onlinePlayers = 0;
    try {
      const host = process.env.MINECRAFT_HOST || 'minecraft';
      const port = parseInt(process.env.RCON_PORT || '25575', 10);
      const password = process.env.RCON_PASSWORD || '';

      const rcon = await Rcon.connect({ host, port, password, timeout: 2000 });
      rconResponse = await rcon.send('list');
      await rcon.end();

      // Parse player count e.g., "There are 2 of a max of 20 players online: ..."
      const match = rconResponse.match(/There are (\d+) of a max/);
      if (match) {
        onlinePlayers = parseInt(match[1], 10);
      }
      server.is_online = true;
    } catch (e) {
      server.is_online = false;
    }

    return {
      ...server,
      online_players: onlinePlayers,
      tps: server.is_online ? 20.0 : 0.0,
      mspt: server.is_online ? 12.4 : 0.0,
      rcon_status: rconResponse,
    };
  }

  async executeCommand(command: string) {
    const host = process.env.MINECRAFT_HOST || 'minecraft';
    const port = parseInt(process.env.RCON_PORT || '25575', 10);
    const password = process.env.RCON_PASSWORD || '';

    const rcon = await Rcon.connect({ host, port, password, timeout: 3000 });
    const response = await rcon.send(command);
    await rcon.end();
    return { command, response };
  }
}
