import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({ usernameField: "username" });
  }

  async validate(username: string, password: string): Promise<any> {
    // 实际验证在 AuthService.login 中完成，此处仅保留策略类定义
    return { username, password };
  }
}
