import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("capacity_records")
export class CapacityRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ length: 50 })
  factory: string;

  @Column({ length: 50 })
  line: string;

  @Column({ length: 20 })
  date: string;

  @Column({ type: "float" })
  yield: number;

  @Column({ name: "defect_rate", type: "float" })
  defectRate: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
