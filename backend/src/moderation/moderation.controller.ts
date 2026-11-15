import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('moderation')
export class ModerationController {
  constructor(private readonly moderationService: ModerationService) {}

  @Get('punishments')
  getPunishments(@Query('limit') limit: number = 50) {
    return this.moderationService.getRecentPunishments(Number(limit));
  }

  @Post('punish')
  punish(
    @Body('playerId') playerId: string,
    @Body('type') type: string,
    @Body('reason') reason: string,
    @Body('durationMinutes') durationMinutes: number,
    @Request() req: any,
  ) {
    const punisher = req.user?.username || 'Admin';
    return this.moderationService.punishPlayer(playerId, type, reason, punisher, durationMinutes);
  }

  @Post('pardon/:id')
  pardon(@Param('id') id: string, @Request() req: any) {
    const unpunisher = req.user?.username || 'Admin';
    return this.moderationService.pardonPlayer(Number(id), unpunisher);
  }
}
