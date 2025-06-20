import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventModule } from './event.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EventModule,
  ],
})
export class AppModule {}
