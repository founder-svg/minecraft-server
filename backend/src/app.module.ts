import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { PlayersModule } from './players/players.module';
import { ServersModule } from './servers/servers.module';
import { EconomyModule } from './economy/economy.module';
import { ModerationModule } from './moderation/moderation.module';
import { BackupsModule } from './backups/backups.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    PlayersModule,
    ServersModule,
    EconomyModule,
    ModerationModule,
    BackupsModule,
  ],
})
export class AppModule {}
