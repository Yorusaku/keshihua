import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Omit<User, "passwordHash">[]> {
    return this.userRepository.find();
  }

  async findById(id: string): Promise<Omit<User, "passwordHash"> | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException("用户不存在");
    }
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder("user")
      .addSelect("user.passwordHash")
      .where("user.username = :username", { username })
      .getOne();
  }

  async create(dto: {
    username: string;
    passwordHash: string;
    name: string;
    email: string;
    role?: string;
  }): Promise<Omit<User, "passwordHash">> {
    const user = this.userRepository.create({
      username: dto.username,
      passwordHash: dto.passwordHash,
      name: dto.name,
      email: dto.email,
      role: (dto.role as User["role"]) ?? "viewer",
    });
    const saved = await this.userRepository.save(user);
    const { passwordHash, ...result } = saved as any;
    return result;
  }
}
