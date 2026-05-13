import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("agvs")
export class Agv {
  @PrimaryColumn({ length: 50 })
  id: string;

  @Column({ length: 100, default: "" })
  name: string;

  @Column({ name: "line_id", length: 50, default: "" })
  lineId: string;

  @Column({ name: "zone_id", length: 50, default: "" })
  zoneId: string;

  @Column({ type: "varchar", length: 20, default: "idle" })
  status: string;

  @Column({ type: "float", default: 0 })
  x: number;

  @Column({ type: "float", default: 0 })
  y: number;

  @Column({ type: "float", default: 100 })
  battery: number;

  @Column({ type: "float", default: 0 })
  speed: number;

  @Column({ length: 200, default: "" })
  task: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
