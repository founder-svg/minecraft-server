import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class BackupsService {
  constructor(private readonly db: DatabaseService) {}

  async getBackups() {
    const res = await this.db.query('SELECT * FROM backup_records ORDER BY created_at DESC LIMIT 30');
    return res.rows;
  }

  async recordBackup(type: string, fileName: string, sizeBytes: number, status: string = 'COMPLETED') {
    const sql = `
      INSERT INTO backup_records (backup_type, file_name, size_bytes, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const res = await this.db.query(sql, [type, fileName, sizeBytes, status]);
    return res.rows[0];
  }
}
