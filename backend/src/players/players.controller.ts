import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { PlayersService } from './players.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  search(
    @Query('q') q: string = '',
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
  ) {
    return this.playersService.searchPlayers(q, Number(limit), Number(offset));
  }

  @Get(':id')
  getPlayer(@Param('id') id: string) {
    return this.playersService.getPlayerById(id);
  }

  @Get(':id/sessions')
  getSessions(@Param('id') id: string) {
    return this.playersService.getPlayerSessions(id);
  }
}
