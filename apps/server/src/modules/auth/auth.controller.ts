import { Controller, Post, Get, Body } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./auth.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post("login")
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return {
      user: result.user,
      token: result.access_token,
      refreshToken: result.access_token,
      expiresIn: 7200,
    };
  }

  @Public()
  @Post("register")
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      user: result.user,
      token: result.access_token,
      refreshToken: result.access_token,
      expiresIn: 7200,
    };
  }

  @Get("me")
  async getProfile(@CurrentUser("sub") userId: string) {
    return this.authService.getProfile(userId);
  }
}
