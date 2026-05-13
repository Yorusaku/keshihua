import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcryptjs";
import { UserService } from "../user/user.service";
import { LoginDto, RegisterDto } from "./auth.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userService.findByUsername(dto.username);
    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existingUser = await this.userService.findByUsername(dto.username);
    if (existingUser) {
      throw new ConflictException("用户名已存在");
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.userService.create({
      username: dto.username,
      passwordHash,
      name: dto.name,
      email: dto.email,
    });

    const payload = {
      sub: user.id,
      username: user.username,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
      },
    };
  }

  async getProfile(userId: string) {
    return this.userService.findById(userId);
  }
}
