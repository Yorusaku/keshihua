import { IsOptional, IsString } from "class-validator";

export class QueryCapacityDto {
  @IsOptional() @IsString() factory?: string;
  @IsOptional() @IsString() line?: string;
  @IsOptional() @IsString() date?: string;
}
