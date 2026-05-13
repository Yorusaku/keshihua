import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ThrottlerGuard, Throttle } from "@nestjs/throttler";
import { AgvService } from "./agv.service";
import { CreateAgvDto, UpdateAgvDto, QueryAgvDto } from "./agv.dto";
import { RealtimeGateway } from "../../modules/realtime/realtime.gateway";

@Controller("agvs")
export class AgvController {
  constructor(
    private readonly agvService: AgvService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  @Get()
  async findAll(@Query() query: QueryAgvDto) {
    return this.agvService.findAll(query);
  }

  @Post()
  async create(@Body() dto: CreateAgvDto) {
    return this.agvService.create(dto);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.agvService.findById(id);
  }

  @Patch(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAgvDto) {
    return this.agvService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.agvService.remove(id);
  }

  @Post(":id/ping")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 10000, limit: 10 } })
  async ping(
    @Param("id") id: string,
    @Body() body: { x?: number; y?: number },
  ) {
    const agv = await this.agvService.update(id, {
      x: body.x,
      y: body.y,
    });
    this.realtimeGateway.broadcastAgvCreated({
      id: agv.id,
      x: agv.x,
      y: agv.y,
      timestamp: Date.now(),
    });
    return agv;
  }
}


