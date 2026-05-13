import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { AgvModule } from "./modules/agv/agv.module";
import { AlertModule } from "./modules/alert/alert.module";
import { CapacityModule } from "./modules/capacity/capacity.module";
import { ProductionLineModule } from "./modules/production-line/production-line.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { HealthController } from "./modules/production-line/health.controller";

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.PG_HOST ?? "127.0.0.1",
      port: Number(process.env.PG_PORT ?? 5434),
      username: process.env.PG_USER ?? "postgres",
      password: process.env.PG_PASSWORD ?? "smart123",
      database: process.env.PG_DATABASE ?? "smart_manufacturing",
      entities: [__dirname + "/**/*.entity{.ts,.js}"],
      synchronize: false,
      logging: false,
    }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    AuthModule,
    UserModule,
    AgvModule,
    AlertModule,
    CapacityModule,
    ProductionLineModule,
    RealtimeModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
