import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { ProductionLine } from "./production-line.entity";

@Entity("production_line_zones")
export class ProductionLineZone {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ name: "line_id", length: 50 })
  lineId: string;

  @Column({ length: 50 })
  name: string;

  @Column({ type: "float" })
  x: number;

  @Column({ type: "float" })
  y: number;

  @Column({ type: "float" })
  width: number;

  @Column({ type: "float" })
  height: number;

  @ManyToOne(() => ProductionLine, (line) => line.zones)
  @JoinColumn({ name: "line_id" })
  line: ProductionLine;
}
