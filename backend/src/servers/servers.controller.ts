import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ServersService } from './servers.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('servers')
export class ServersController {
  constructor(private readonly serversService: ServersService) {}

  @Get('status')
  getStatus() {
    return this.serversService.getServerStatus();
  }

  @Post('command')
  executeCommand(@Body('command') command: string) {
    return this.serversService.executeCommand(command);
  }
}
