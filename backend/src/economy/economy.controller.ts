import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { EconomyService } from './economy.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('economy')
export class EconomyController {
  constructor(private readonly economyService: EconomyService) {}

  @Get('transactions')
  getTransactions(
    @Query('limit') limit: number = 50,
    @Query('offset') offset: number = 0,
  ) {
    return this.economyService.getTransactions(Number(limit), Number(offset));
  }

  @Get('leaderboard')
  getLeaderboard(@Query('limit') limit: number = 10) {
    return this.economyService.getTopBalances(Number(limit));
  }

  @Post('adjust')
  adjustBalance(
    @Body('playerId') playerId: string,
    @Body('amount') amount: number,
    @Body('reason') reason: string,
    @Request() req: any,
  ) {
    const admin = req.user?.username || 'Admin';
    return this.economyService.adjustBalance(playerId, Number(amount), admin, reason);
  }
}
