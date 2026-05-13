import { Controller, Get } from "@nestjs/common";
import { ProductionLineService } from "./production-line.service";

@Controller("production-lines")
export class ProductionLineController {
  constructor(private readonly productionLineService: ProductionLineService) {}

  @Get()
  findAll() {
    return this.productionLineService.findAll();
  }
}
