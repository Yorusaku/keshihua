import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Agv } from "./agv.entity";
import { AgvService } from "./agv.service";
import { AgvController } from "./agv.controller";
import { RealtimeModule } from "../../modules/realtime/realtime.module";

@Module({
  imports: [TypeOrmModule.forFeature([Agv]), RealtimeModule],
  controllers: [AgvController],
  providers: [AgvService],
  exports: [AgvService],
})
export class AgvModule {}
