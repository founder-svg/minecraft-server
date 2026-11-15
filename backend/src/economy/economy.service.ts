import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EconomyService {
  constructor(private readonly db: DatabaseService) {}

  async getTransactions(limit: number = 50, offset: number = 0) {
    const sql = `
      SELECT et.*,
             sp.username as sender_name,
             rp.username as receiver_name
      FROM economy_transactions et
      LEFT JOIN players sp ON et.sender_id = sp.id
      LEFT JOIN players rp ON et.receiver_id = rp.id
      ORDER BY et.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const res = await this.db.query(sql, [limit, offset]);
    return res.rows;
  }

  async getTopBalances(limit: number = 10) {
    const sql = `
      SELECT p.id, p.username, pb.balance, pb.updated_at
      FROM player_balances pb
      JOIN players p ON pb.player_id = p.id
      ORDER BY pb.balance DESC
      LIMIT $1
    `;
    const res = await this.db.query(sql, [limit]);
    return res.rows;
  }

  async adjustBalance(playerId: string, amount: number, adminName: string, reason: string) {
    const type = amount >= 0 ? 'ADMIN_GIVE' : 'ADMIN_TAKE';
    const client = await (this.db as any).pool.connect();
    try {
      await client.query('BEGIN');
      const updateSql = amount >= 0
        ? 'UPDATE player_balances SET balance = balance + $1, updated_at = CURRENT_TIMESTAMP WHERE player_id = $2 RETURNING balance'
        : 'UPDATE player_balances SET balance = balance - $1, updated_at = CURRENT_TIMESTAMP WHERE player_id = $2 AND balance >= $1 RETURNING balance';

      const res = await client.query(updateSql, [Math.abs(amount), playerId]);
      if (res.rows.length === 0) {
        throw new BadRequestException('Player not found or insufficient balance for deduction');
      }

      await client.query(
        'INSERT INTO economy_transactions (receiver_id, amount, transaction_type, description) VALUES ($1, $2, $3, $4)',
        [playerId, Math.abs(amount), type, `Admin adjustment by ${adminName}: ${reason}`],
      );

      await client.query('COMMIT');
      return { success: true, new_balance: res.rows[0].balance };
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
