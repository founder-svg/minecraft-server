import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { BackupsService } from './backups.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get()
  getBackups() {
    return this.backupsService.getBackups();
  }

  @Post('record')
  recordBackup(
    @Body('type') type: string,
    @Body('fileName') fileName: string,
    @Body('sizeBytes') sizeBytes: number,
  ) {
    return this.backupsService.recordBackup(type, fileName, sizeBytes);
  }
}
