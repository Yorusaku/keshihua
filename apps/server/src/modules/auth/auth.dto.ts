import { IsString, MinLength, MaxLength } from "class-validator";

export class LoginDto {
  @IsString()
  @MinLength(2)
  username: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  username: string;

  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  email: string;
}
