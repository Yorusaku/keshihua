import { IsString, IsNumber, IsOptional, IsIn } from "class-validator";
import { Type } from "class-transformer";

export class CreateAgvDto {
  @IsString() id: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() lineId?: string;
  @IsOptional() @IsString() zoneId?: string;
  @IsOptional() @IsIn(["idle", "moving", "error"]) status?: string;
  @IsOptional() @IsNumber() x?: number;
  @IsOptional() @IsNumber() y?: number;
}

export class UpdateAgvDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() lineId?: string;
  @IsOptional() @IsString() zoneId?: string;
  @IsOptional() @IsIn(["idle", "moving", "error"]) status?: string;
  @IsOptional() @IsNumber() x?: number;
  @IsOptional() @IsNumber() y?: number;
  @IsOptional() @IsNumber() battery?: number;
  @IsOptional() @IsNumber() speed?: number;
  @IsOptional() @IsString() task?: string;
}

export class QueryAgvDto {
  @IsOptional() @Type(() => Number) @IsNumber() current?: number;
  @IsOptional() @Type(() => Number) @IsNumber() pageSize?: number;
  @IsOptional() @IsString() keyword?: string;
  @IsOptional() @IsString() status?: string;
}
