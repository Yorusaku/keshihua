import { z } from "zod";

const envSchema = z.object({
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  PG_HOST: z.string().min(1),
  PG_PORT: z.string().regex(/^\d+$/).transform(Number),
  PG_USER: z.string().min(1),
  PG_PASSWORD: z.string().min(1),
  PG_DATABASE: z.string().min(1),
  SERVER_PORT: z.string().regex(/^\d+$/).transform(Number).optional(),
});

export function validateEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("[smart-server] Environment validation failed:");
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
    }
    throw new Error("Environment validation failed. Server cannot start.");
  }
  console.log("[smart-server] Environment validation passed");
}
