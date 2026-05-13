import 'dotenv/config';
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { WsAdapter } from "@nestjs/platform-ws";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { validateEnv } from "./config/env.validation";

async function bootstrap() {
  validateEnv();

  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new WsAdapter(app));

  app.use(helmet());
  app.enableCors({
    origin: ["http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  });
  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = process.env.SERVER_PORT ?? "8091";
  await app.listen(Number(port));
  console.log(`[smart-server] running on http://127.0.0.1:${port}`);
  console.log(`[smart-server] ws endpoint ws://127.0.0.1:${port}/ws`);
}

bootstrap();
