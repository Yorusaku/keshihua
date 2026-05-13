import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

export type UserRole = "admin" | "device_engineer" | "electrical_engineer" | "maintenance_technician" | "quality_engineer" | "process_engineer" | "viewer";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: "password_hash", length: 255 })
  passwordHash: string;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ type: "varchar", length: 50, default: "viewer" })
  role: UserRole;

  @Column({ length: 50, nullable: true })
  department: string;

  @Column({ type: "jsonb", default: "[]" })
  permissions: Array<{ resource: string; actions: string[] }>;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
