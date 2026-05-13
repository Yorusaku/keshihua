import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductionLine } from "./production-line.entity";

@Injectable()
export class ProductionLineService {
  constructor(
    @InjectRepository(ProductionLine)
    private readonly productionLineRepository: Repository<ProductionLine>,
  ) {}

  async findAll(): Promise<ProductionLine[]> {
    return this.productionLineRepository.find();
  }
}
