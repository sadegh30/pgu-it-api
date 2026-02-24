import { Module } from '@nestjs/common';
import { FilesService } from 'src/files/files.service';
import { AdminWebsitesController } from './admin-websites.controller';
import { UserWebsitesController } from './user-websites.controller';
import { WebsitesService } from './websites.service';

@Module({
  providers: [WebsitesService, FilesService],
  controllers: [AdminWebsitesController, UserWebsitesController],
})
export class WebsitesModule {}
