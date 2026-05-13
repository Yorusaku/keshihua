import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CapacityRecord } from "./capacity.entity";
import { CapacityController } from "./capacity.controller";
import { CapacityService } from "./capacity.service";

@Module({
  imports: [TypeOrmModule.forFeature([CapacityRecord])],
  controllers: [CapacityController],
  providers: [CapacityService],
})
export class CapacityModule {}
