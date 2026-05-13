import { DataSource } from "typeorm";
import { User } from "../modules/user/user.entity";
import { Agv } from "../modules/agv/agv.entity";
import { Alert } from "../modules/alert/alert.entity";
import { AlertProcessRecord } from "../modules/alert/alert-process-record.entity";
import { CapacityRecord } from "../modules/capacity/capacity.entity";
import { ProductionLine } from "../modules/production-line/production-line.entity";
import { ProductionLineZone } from "../modules/production-line/production-line-zone.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST ?? "127.0.0.1",
  port: Number(process.env.PG_PORT ?? 5434),
  username: process.env.PG_USER ?? "postgres",
  password: process.env.PG_PASSWORD ?? "smart123",
  database: process.env.PG_DATABASE ?? "smart_manufacturing",
  entities: [User, Agv, Alert, AlertProcessRecord, CapacityRecord, ProductionLine, ProductionLineZone],
  migrations: [__dirname + "/migrations/*{.ts,.js}"],
  synchronize: false,
  logging: true,
});
