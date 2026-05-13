import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductionLine } from "./production-line.entity";
import { ProductionLineZone } from "./production-line-zone.entity";
import { ProductionLineController } from "./production-line.controller";
import { ProductionLineService } from "./production-line.service";

@Module({
  imports: [TypeOrmModule.forFeature([ProductionLine, ProductionLineZone])],
  controllers: [ProductionLineController],
  providers: [ProductionLineService],
  exports: [ProductionLineService],
})
export class ProductionLineModule {}
