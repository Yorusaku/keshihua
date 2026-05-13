import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Alert } from "./alert.entity";
import { AlertProcessRecord } from "./alert-process-record.entity";
import { AlertService } from "./alert.service";
import { AlertController } from "./alert.controller";
import { AgvModule } from "../../modules/agv/agv.module";
import { RealtimeModule } from "../../modules/realtime/realtime.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Alert, AlertProcessRecord]),
    AgvModule,
    RealtimeModule,
  ],
  controllers: [AlertController],
  providers: [AlertService],
})
export class AlertModule {}
