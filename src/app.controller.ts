import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly logger = new Logger(AppService.name);
  constructor(private readonly appService: AppService) {
    this.logger.log(`host: ${process.env.DB_HOST},
      port: parseInt(${process.env.DB_PORT} || '5432', 10),
      username: ${process.env.DB_USER},
      password: ${process.env.DB_PASSWORD},
      database: ${process.env.DB_NAME},`);
  }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  health(): { status: string } {
    return { status: 'ok' };
  }
}
