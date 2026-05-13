import { Controller, Get } from "@nestjs/common";
import { Public } from "../../common/decorators/public.decorator";

@Controller()
export class HealthController {
  @Public()
  @Get("health")
  check() {
    return { ok: true, service: "smart-manufacturing-server", timestamp: Date.now() };
  }

  @Public()
  @Get("health/ready")
  ready() {
    return { ok: true, status: "ready" };
  }
}

