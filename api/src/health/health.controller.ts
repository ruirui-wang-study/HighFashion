import { Controller, Get } from "@nestjs/common";
import { ok } from "../common/api-response";

@Controller("health")
export class HealthController {
  @Get()
  check() {
    return ok({ status: "ok", service: "pulsegear-api", timestamp: new Date().toISOString() });
  }
}
