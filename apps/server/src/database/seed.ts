import { AppDataSource } from "./data-source";
import { User } from "../modules/user/user.entity";
import { Agv } from "../modules/agv/agv.entity";
import { CapacityRecord } from "../modules/capacity/capacity.entity";
import { ProductionLine } from "../modules/production-line/production-line.entity";
import { ProductionLineZone } from "../modules/production-line/production-line-zone.entity";
import * as bcrypt from "bcryptjs";

async function seed() {
  await AppDataSource.initialize();
  console.log("数据库已连接，开始填充种子数据...");

  const queryRunner = AppDataSource.createQueryRunner();

  // 清空旧数据（按外键顺序）
  await queryRunner.query("DELETE FROM capacity_records");
  await queryRunner.query("DELETE FROM agvs");
  await queryRunner.query("DELETE FROM users");
  await queryRunner.query("DELETE FROM production_line_zones");
  await queryRunner.query("DELETE FROM production_lines");
  console.log("已清空旧数据");

  // ========== 插入产线 + 区域 ==========
  const linesData = [
    {
      id: "line-a",
      name: "A 产线",
      zones: [
        { id: "line-a-zone-1", name: "冲压区", x: 120, y: 140, width: 560, height: 260 },
        { id: "line-a-zone-2", name: "装配区", x: 720, y: 140, width: 560, height: 260 },
      ],
    },
    {
      id: "line-b",
      name: "B 产线",
      zones: [
        { id: "line-b-zone-1", name: "焊接区", x: 120, y: 440, width: 560, height: 260 },
        { id: "line-b-zone-2", name: "检测区", x: 720, y: 440, width: 560, height: 260 },
      ],
    },
    {
      id: "line-c",
      name: "C 产线",
      zones: [
        { id: "line-c-zone-1", name: "包装区", x: 1320, y: 140, width: 460, height: 260 },
        { id: "line-c-zone-2", name: "入库区", x: 1320, y: 440, width: 460, height: 260 },
      ],
    },
  ];

  const lineRepo = AppDataSource.getRepository(ProductionLine);
  const zoneRepo = AppDataSource.getRepository(ProductionLineZone);

  for (const line of linesData) {
    await lineRepo.save(lineRepo.create({ id: line.id, name: line.name }));
    for (const zone of line.zones) {
      await zoneRepo.save(
        zoneRepo.create({
          id: zone.id,
          lineId: line.id,
          name: zone.name,
          x: zone.x,
          y: zone.y,
          width: zone.width,
          height: zone.height,
        }),
      );
    }
  }
  console.log("产线 + 区域数据已插入");

  // ========== 插入用户 ==========
  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash("123456", 10);

  const usersData = [
    { username: "admin", name: "管理员", role: "admin", email: "admin@smart.com", department: "工程部" },
    { username: "zhangwork", name: "张工", role: "device_engineer", email: "zhang@smart.com", department: "设备部" },
    { username: "liwork", name: "李工", role: "electrical_engineer", email: "li@smart.com", department: "电气部" },
    { username: "wangji", name: "王技师", role: "maintenance_technician", email: "wang@smart.com", department: "维修部" },
    { username: "chenqc", name: "陈工", role: "quality_engineer", email: "chen@smart.com", department: "质量部" },
  ];

  for (const u of usersData) {
    await userRepo.save(
      userRepo.create({
        username: u.username,
        passwordHash,
        name: u.name,
        email: u.email,
        role: u.role as any,
        department: u.department,
      }),
    );
  }
  console.log("用户数据已插入");

  // ========== 插入 20 台 AGV ==========
  const agvRepo = AppDataSource.getRepository(Agv);
  const lineIds = ["line-a", "line-b", "line-c"];
  const zoneIds = [
    "line-a-zone-1", "line-a-zone-2",
    "line-b-zone-1", "line-b-zone-2",
    "line-c-zone-1", "line-c-zone-2",
  ];
  const statuses = ["idle", "moving", "error"];

  for (let i = 1; i <= 20; i++) {
    const id = `AGV-${String(i).padStart(3, "0")}`;
    const lineId = lineIds[Math.floor(Math.random() * lineIds.length)];
    const zoneId = zoneIds[Math.floor(Math.random() * zoneIds.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const x = Math.floor(Math.random() * 2000);
    const y = Math.floor(Math.random() * 1000);
    const battery = 50 + Math.floor(Math.random() * 51);
    const speed = Math.floor(Math.random() * 30);

    await agvRepo.save(
      agvRepo.create({
        id,
        name: id,
        lineId,
        zoneId,
        status,
        x,
        y,
        battery,
        speed,
        task: status === "moving" ? "运输中" : "",
      }),
    );
  }
  console.log("AGV 数据已插入");

  // ========== 插入 1000 条产能记录 ==========
  const capacityRepo = AppDataSource.getRepository(CapacityRecord);
  const factories = ["Factory-A", "Factory-B", "Factory-C"];
  const lines = ["Line-1", "Line-2", "Line-3", "Line-4"];

  const batchSize = 200;
  const records: CapacityRecord[] = [];

  for (let i = 0; i < 1000; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().slice(0, 10);

    records.push(
      capacityRepo.create({
        factory: factories[Math.floor(Math.random() * factories.length)],
        line: lines[Math.floor(Math.random() * lines.length)],
        date: dateStr,
        yield: 1000 + Math.floor(Math.random() * 10001),
        defectRate: Math.random() * 0.1,
      }),
    );

    if (records.length >= batchSize) {
      await capacityRepo.save(records);
      records.length = 0;
    }
  }

  if (records.length > 0) {
    await capacityRepo.save(records);
  }
  console.log("产能记录已插入");

  await AppDataSource.destroy();
  console.log("Seed completed");
}

seed().catch(console.error);
