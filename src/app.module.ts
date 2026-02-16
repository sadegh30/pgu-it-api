import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FaqModule } from './faq/faq.module';
import { BlogsModule } from './blogs/blogs.module';
import { LinksModule } from './links/links.module';

@Module({
  imports: [AuthModule, UsersModule, FaqModule, BlogsModule, LinksModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
