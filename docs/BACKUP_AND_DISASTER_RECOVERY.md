# Backup & Disaster Recovery Runbook

## 1. Backup Schedule & Retention Policy

| Tier | Frequency | Retention Window | Storage Target |
|---|---|---|---|
| Daily Snapshots | Every 24 hours (03:00 UTC) | 7 Days | Local `/backups` volume + Offsite S3 |
| Weekly Snapshots | Every Sunday | 4 Weeks | Offsite S3 |
| Monthly Snapshots | 1st of each month | 3 Months | Cold Archive |

## 2. Manual Backup Trigger
To execute an immediate snapshot:
```bash
docker compose exec backend ./infrastructure/scripts/backup.sh
```

This creates:
- `db_wixfox_network_<timestamp>.sql.gz` (PostgreSQL dump)
- `worlds_<timestamp>.tar.gz` (Minecraft world directories)

## 3. Disaster Recovery Execution
If the server crashes or data corruption occurs:
1. Stop the Minecraft container:
   ```bash
   docker compose stop minecraft
   ```
2. Run the restore script with your selected timestamp:
   ```bash
   ./infrastructure/scripts/restore.sh 20261116_000000
   ```
3. Restart the cluster:
   ```bash
   docker compose up -d
   ```
4. Verify database and world integrity via the admin panel at `http://localhost:8080`.
