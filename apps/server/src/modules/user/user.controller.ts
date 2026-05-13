import { Controller, Get, Param } from "@nestjs/common";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  async findById(@Param("id") id: string) {
    return this.userService.findById(id);
  }
}
