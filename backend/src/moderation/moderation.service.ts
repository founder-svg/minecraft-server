import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class ModerationService {
  constructor(private readonly db: DatabaseService) {}

  async getRecentPunishments(limit: number = 50) {
    const sql = `
      SELECT pu.*, p.username as target_name
      FROM punishments pu
      JOIN players p ON pu.player_id = p.id
      ORDER BY pu.id DESC
      LIMIT $1
    `;
    const res = await this.db.query(sql, [limit]);
    return res.rows;
  }

  async punishPlayer(playerId: string, type: string, reason: string, punisher: string, durationMinutes?: number) {
    let expiresAt: Date | null = null;
    if (durationMinutes && durationMinutes > 0) {
      expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
    }

    const sql = `
      INSERT INTO punishments (player_id, punishment_type, reason, punisher_name, expires_at, is_active)
      VALUES ($1, $2, $3, $4, $5, TRUE)
      RETURNING *
    `;
    const res = await this.db.query(sql, [playerId, type, reason, punisher, expiresAt]);
    return res.rows[0];
  }

  async pardonPlayer(punishmentId: number, unpunisher: string) {
    const sql = `
      UPDATE punishments
      SET is_active = FALSE, unpunished_at = CURRENT_TIMESTAMP, unpunisher_name = $1
      WHERE id = $2
      RETURNING *
    `;
    const res = await this.db.query(sql, [unpunisher, punishmentId]);
    return res.rows[0];
  }
}
