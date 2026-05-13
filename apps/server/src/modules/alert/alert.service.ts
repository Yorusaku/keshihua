import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Alert } from "./alert.entity";
import { AlertProcessRecord } from "./alert-process-record.entity";
import { CreateAlertDto, QueryAlertDto, AssignAlertDto, CloseAlertDto } from "./alert.dto";
import { AgvService } from "../../modules/agv/agv.service";
import { RealtimeGateway } from "../../modules/realtime/realtime.gateway";

@Injectable()
export class AlertService {
  constructor(
    @InjectRepository(Alert)
    private readonly alertRepository: Repository<Alert>,
    @InjectRepository(AlertProcessRecord)
    private readonly recordRepository: Repository<AlertProcessRecord>,
    private readonly agvService: AgvService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(query: QueryAlertDto) {
    const current = query.current ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.alertRepository.createQueryBuilder("alert");

    if (query.lineId) {
      qb.andWhere("alert.lineId = :lineId", { lineId: query.lineId });
    }

    if (query.severity) {
      qb.andWhere("alert.severity = :severity", { severity: query.severity });
    }

    if (query.status) {
      qb.andWhere("alert.status = :status", { status: query.status });
    }

    if (query.assignedToId) {
      qb.andWhere("alert.assignedToId = :assignedToId", {
        assignedToId: query.assignedToId,
      });
    }

    const [list, total] = await qb
      .skip((current - 1) * pageSize)
      .take(pageSize)
      .orderBy("alert.createdAt", "DESC")
      .getManyAndCount();

    return { total, list };
  }

  async findById(id: string): Promise<Alert & { processRecords: AlertProcessRecord[] }> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) {
      throw new NotFoundException(`告警 ${id} 不存在`);
    }

    const processRecords = await this.recordRepository.find({
      where: { alertId: id },
      order: { createdAt: "ASC" },
    });

    return { ...alert, processRecords };
  }

  async create(dto: CreateAlertDto): Promise<Alert> {
    if (dto.impactedAgvIds && dto.impactedAgvIds.length > 0) {
      const invalidIds: string[] = [];
      for (const agvId of dto.impactedAgvIds) {
        try {
          await this.agvService.findById(agvId);
        } catch {
          invalidIds.push(agvId);
        }
      }
      if (invalidIds.length > 0) {
        throw new BadRequestException(
          `以下 AGV ID 无效: ${invalidIds.join(", ")}`,
        );
      }
    }

    const alert = this.alertRepository.create({
      sensorId: dto.sensorId,
      lineId: dto.lineId,
      title: dto.title,
      message: dto.message ?? "",
      severity: dto.severity as Alert["severity"],
      threshold: dto.threshold ?? 0,
      value: dto.value ?? 0,
      impactedAgvIds: dto.impactedAgvIds ?? [],
      suggestion: dto.suggestion ?? "",
    });

    const saved = await this.alertRepository.save(alert);
    return saved;
  }

  async acknowledge(alertId: string, userId: string): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`告警 ${alertId} 不存在`);
    }

    if (alert.status !== "active") {
      throw new BadRequestException("只能确认状态为 active 的告警");
    }

    alert.status = "acknowledged";
    alert.acknowledgedAt = new Date();
    const saved = await this.alertRepository.save(alert);

    await this.addProcessRecord(alertId, userId, "acknowledged", "告警已确认");

    return saved;
  }

  async assign(
    alertId: string,
    dto: AssignAlertDto & { version: number },
    userId: string,
  ): Promise<Alert> {
    const result = await this.alertRepository
      .createQueryBuilder()
      .update(Alert)
      .set({
        assignedToId: dto.assignedToId,
        assignedById: userId,
        assignedAt: new Date(),
        processingStatus: "in_progress",
        version: () => "version + 1",
      })
      .where("id = :id", { id: alertId })
      .andWhere("version = :version", { version: dto.version })
      .execute();

    if (result.affected === 0) {
      throw new ConflictException(
        "告警已被他人修改，请刷新后重试",
      );
    }

    const alert = await this.alertRepository.findOne({ where: { id: alertId } });

    await this.addProcessRecord(
      alertId,
      userId,
      "assigned",
      `告警已分配给 ${dto.assignedToId}`,
    );

    this.realtimeGateway.broadcastAlert("alert.assigned", {
      alertId,
      assignedToId: dto.assignedToId,
      assignedById: userId,
      timestamp: Date.now(),
    });

    return alert!;
  }

  async close(
    alertId: string,
    dto: CloseAlertDto,
    userId: string,
  ): Promise<Alert> {
    const alert = await this.alertRepository.findOne({ where: { id: alertId } });
    if (!alert) {
      throw new NotFoundException(`告警 ${alertId} 不存在`);
    }

    if (alert.status === "resolved") {
      throw new BadRequestException("该告警已关闭");
    }

    const closedAt = new Date();
    const mttr =
      (closedAt.getTime() - alert.createdAt.getTime()) / (1000 * 60);

    alert.status = "resolved";
    alert.closedById = userId;
    alert.closedAt = closedAt;
    alert.mttr = Math.round(mttr * 100) / 100;
    alert.processingStatus = "completed";

    if (dto.rootCause !== undefined) alert.rootCause = dto.rootCause;
    if (dto.actionTaken !== undefined) alert.actionTaken = dto.actionTaken;
    if (dto.resolution !== undefined) alert.resolution = dto.resolution;

    const saved = await this.alertRepository.save(alert);

    await this.addProcessRecord(
      alertId,
      userId,
      "closed",
      `告警已关闭，MTTR: ${saved.mttr} 分钟`,
    );

    return saved;
  }

  async addProcessRecord(
    alertId: string,
    userId: string,
    action: string,
    detail: string,
  ): Promise<AlertProcessRecord> {
    const record = this.recordRepository.create({
      alertId,
      userId,
      action,
      detail,
    });
    return this.recordRepository.save(record);
  }
}

