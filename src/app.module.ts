import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { UsersModule } from './users/users.module';
import { WebsitesModule } from './websites/websites.module';

@Module({
  imports: [AuthModule, UsersModule, FilesModule, WebsitesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
