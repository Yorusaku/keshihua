import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CapacityRecord } from "./capacity.entity";
import { QueryCapacityDto } from "./capacity.dto";

@Injectable()
export class CapacityService {
  constructor(
    @InjectRepository(CapacityRecord)
    private readonly capacityRepository: Repository<CapacityRecord>,
  ) {}

  async getReport(query: QueryCapacityDto): Promise<CapacityRecord[]> {
    const where: Record<string, string> = {};
    if (query.factory) where.factory = query.factory;
    if (query.line) where.line = query.line;
    if (query.date) where.date = query.date;
    return this.capacityRepository.find({ where, order: { createdAt: "DESC" } });
  }
}
