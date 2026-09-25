import { Controller, Get, Post, Param, Body, Query } from "@nestjs/common";
import { AlertService } from "./alert.service";
import { CreateAlertDto, QueryAlertDto, AssignAlertDto, CloseAlertDto, UpdateAlertProcessDto } from "./alert.dto";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("alerts")
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Get()
  async findAll(@Query() query: QueryAlertDto) {
    return this.alertService.findAll(query);
  }

  @Post()
  async create(@Body() dto: CreateAlertDto) {
    return this.alertService.create(dto);
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.alertService.findById(id);
  }

  @Post(":id/acknowledge")
  async acknowledge(
    @Param("id") id: string,
    @CurrentUser("sub") userId: string,
  ) {
    return this.alertService.acknowledge(id, userId);
  }

  @Post(":id/assign")
  async assign(
    @Param("id") id: string,
    @Body() dto: AssignAlertDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.alertService.assign(id, dto, userId);
  }

  @Post(":id/close")
  async close(
    @Param("id") id: string,
    @Body() dto: CloseAlertDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.alertService.close(id, dto, userId);
  }

  @Post(":id/process")
  async process(
    @Param("id") id: string,
    @Body() dto: UpdateAlertProcessDto,
    @CurrentUser("sub") userId: string,
  ) {
    return this.alertService.updateProcess(id, dto, userId);
  }
}
