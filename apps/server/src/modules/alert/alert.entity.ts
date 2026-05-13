import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

export type AlertStatus = "active" | "acknowledged" | "resolved";
export type AlertSeverity = "critical" | "high" | "medium";
export type ProcessingStatus = "pending" | "in_progress" | "review" | "completed";

@Entity("alerts")
export class Alert {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ name: "sensor_id", length: 50 })
  sensorId: string;

  @Column({ name: "line_id", length: 50 })
  lineId: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: "text", default: "" })
  message: string;

  @Column({ type: "varchar", length: 20 })
  severity: AlertSeverity;

  @Column({ type: "float", default: 0 })
  threshold: number;

  @Column({ type: "float", default: 0 })
  value: number;

  @Column({ name: "impacted_agv_ids", type: "jsonb", default: "[]" })
  impactedAgvIds: string[];

  @Column({ type: "text", default: "" })
  suggestion: string;

  @Column({ type: "varchar", length: 20, default: "active" })
  status: AlertStatus;

  @Column({ name: "assigned_to_id", length: 36, nullable: true })
  assignedToId: string;

  @Column({ name: "assigned_by_id", length: 36, nullable: true })
  assignedById: string;

  @Column({ name: "processing_status", type: "varchar", length: 20, nullable: true })
  processingStatus: ProcessingStatus;

  @Column({ name: "root_cause", type: "text", nullable: true })
  rootCause: string;

  @Column({ name: "action_taken", type: "text", nullable: true })
  actionTaken: string;

  @Column({ type: "text", nullable: true })
  resolution: string;

  @Column({ name: "closed_by_id", length: 36, nullable: true })
  closedById: string;

  @Column({ name: "closed_at", type: "timestamptz", nullable: true })
  closedAt: Date;

  @Column({ type: "float", nullable: true })
  mttr: number;

  @Column({ type: "int", default: 0 })
  version: number;

  @Column({ name: "acknowledged_at", type: "timestamptz", nullable: true })
  acknowledgedAt: Date;

  @Column({ name: "assigned_at", type: "timestamptz", nullable: true })
  assignedAt: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
