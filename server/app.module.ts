import { Module, HttpModule } from '@nestjs/common';
import { AngularUniversalModule } from '@nestjs/ng-universal';
import { join } from 'path';
import { BilibiliApiController } from './controllers/bilibili.api.controller';
import { HuyaController } from './controllers/huya.controller';

@Module({
  imports: [
    AngularUniversalModule.forRoot({
      viewsPath: join(process.cwd(), 'dist/browser'),
      bundle: require('../server/main'),
      liveReload: process.env.DEBUG!=undefined
    }),
    HttpModule
  ],
  controllers:[BilibiliApiController,HuyaController]
})
export class ApplicationModule {}
