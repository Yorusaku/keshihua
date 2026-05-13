import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm";
import { ProductionLineZone } from "./production-line-zone.entity";

@Entity("production_lines")
export class ProductionLine {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 50 })
  name: string;

  @OneToMany(() => ProductionLineZone, (zone) => zone.line, { eager: true })
  zones: ProductionLineZone[];
}
