import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { StoresModule } from './stores/stores.module';
import { SearchModule } from './search/search.module';
import { AiModule } from './ai/ai.module';
import { RedisCacheModule } from './cache/cache.module';
import { ElasticsearchModule } from './elasticsearch/elasticsearch.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // Time to live in milliseconds (60 seconds)
      limit: 100, // Maximum number of requests within TTL
    }]),
    RedisCacheModule,
    ElasticsearchModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    StoresModule,
    SearchModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
