import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class PlayersService {
  constructor(private readonly db: DatabaseService) {}

  async searchPlayers(query: string = '', limit: number = 20, offset: number = 0) {
    const sql = `
      SELECT p.id, p.username, p.status, p.created_at,
             pi.platform, pi.platform_uuid,
             pr.last_login, pr.playtime_seconds,
             pb.balance,
             ps.kills, ps.deaths
      FROM players p
      LEFT JOIN player_identities pi ON p.id = pi.player_id
      LEFT JOIN player_profiles pr ON p.id = pr.player_id
      LEFT JOIN player_balances pb ON p.id = pb.player_id
      LEFT JOIN player_statistics ps ON p.id = ps.player_id
      WHERE LOWER(p.username) LIKE LOWER($1)
      ORDER BY pr.last_login DESC NULLS LAST
      LIMIT $2 OFFSET $3
    `;
    const res = await this.db.query(sql, [`%${query}%`, limit, offset]);
    return res.rows;
  }

  async getPlayerById(id: string) {
    const sql = `
      SELECT p.*, pi.platform, pi.platform_uuid, pr.first_login, pr.last_login, pr.last_ip, pr.playtime_seconds,
             pb.balance, ps.kills, ps.deaths, ps.mob_kills, ps.blocks_broken, ps.blocks_placed
      FROM players p
      LEFT JOIN player_identities pi ON p.id = pi.player_id
      LEFT JOIN player_profiles pr ON p.id = pr.player_id
      LEFT JOIN player_balances pb ON p.id = pb.player_id
      LEFT JOIN player_statistics ps ON p.id = ps.player_id
      WHERE p.id = $1
    `;
    const res = await this.db.query(sql, [id]);
    return res.rows[0] || null;
  }

  async getPlayerSessions(id: string) {
    const res = await this.db.query(
      'SELECT * FROM player_sessions WHERE player_id = $1 ORDER BY joined_at DESC LIMIT 20',
      [id],
    );
    return res.rows;
  }
}
