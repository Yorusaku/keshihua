import { Controller, Get, Query } from "@nestjs/common";
import { CapacityService } from "./capacity.service";
import { QueryCapacityDto } from "./capacity.dto";

@Controller("capacity")
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Get("report")
  getReport(@Query() query: QueryCapacityDto) {
    return this.capacityService.getReport(query);
  }
}
