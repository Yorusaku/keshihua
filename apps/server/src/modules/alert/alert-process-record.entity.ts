import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Alert } from "./alert.entity";

@Entity("alert_process_records")
export class AlertProcessRecord {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "alert_id" })
  alertId: string;

  @Column({ name: "user_id", length: 36 })
  userId: string;

  @Column({ length: 50 })
  action: string;

  @Column({ type: "text", default: "" })
  detail: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @ManyToOne(() => Alert)
  @JoinColumn({ name: "alert_id" })
  alert: Alert;
}
