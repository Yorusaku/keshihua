import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Agv } from "./agv.entity";
import { CreateAgvDto, UpdateAgvDto, QueryAgvDto } from "./agv.dto";

@Injectable()
export class AgvService {
  constructor(
    @InjectRepository(Agv)
    private readonly agvRepository: Repository<Agv>,
  ) {}

  async findAll(query: QueryAgvDto) {
    const current = query.current ?? 1;
    const pageSize = query.pageSize ?? 10;
    const qb = this.agvRepository.createQueryBuilder("agv");

    if (query.keyword) {
      qb.andWhere(
        "(agv.id LIKE :keyword OR agv.name LIKE :keyword)",
        { keyword: `%${query.keyword}%` },
      );
    }

    if (query.status) {
      qb.andWhere("agv.status = :status", { status: query.status });
    }

    const [list, total] = await qb
      .skip((current - 1) * pageSize)
      .take(pageSize)
      .orderBy("agv.createdAt", "DESC")
      .getManyAndCount();

    return { total, list };
  }

  async findById(id: string): Promise<Agv> {
    const agv = await this.agvRepository.findOne({ where: { id } });
    if (!agv) {
      throw new NotFoundException(`AGV ${id} 不存在`);
    }
    return agv;
  }

  async create(dto: CreateAgvDto): Promise<Agv> {
    const existing = await this.agvRepository.findOne({ where: { id: dto.id } });
    if (existing) {
      throw new NotFoundException(`AGV ${dto.id} 已存在`);
    }
    const agv = this.agvRepository.create({
      id: dto.id,
      name: dto.name ?? dto.id,
      lineId: dto.lineId ?? "line-a",
      zoneId: dto.zoneId ?? "line-a-zone-1",
      status: dto.status ?? "idle",
      x: dto.x ?? 0,
      y: dto.y ?? 0,
    });
    return this.agvRepository.save(agv);
  }

  async update(id: string, dto: UpdateAgvDto): Promise<Agv> {
    const agv = await this.findById(id);
    Object.assign(agv, dto);
    return this.agvRepository.save(agv);
  }

  async remove(id: string): Promise<void> {
    const agv = await this.findById(id);
    await this.agvRepository.remove(agv);
  }
}
