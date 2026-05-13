import { IsString, IsOptional, IsIn, IsNumber, MinLength } from "class-validator";

export class CreateAlertDto {
  @IsString() sensorId: string;
  @IsString() lineId: string;
  @IsString() @MinLength(1) title: string;
  @IsOptional() @IsString() message?: string;
  @IsIn(["critical", "high", "medium"]) severity: string;
  @IsOptional() @IsNumber() threshold?: number;
  @IsOptional() @IsNumber() value?: number;
  @IsOptional() impactedAgvIds?: string[];
  @IsOptional() @IsString() suggestion?: string;
}

export class QueryAlertDto {
  @IsOptional() @IsNumber() current?: number;
  @IsOptional() @IsNumber() pageSize?: number;
  @IsOptional() @IsString() lineId?: string;
  @IsOptional() @IsString() severity?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() assignedToId?: string;
}

export class AssignAlertDto {
  @IsString() assignedToId: string;
  @IsNumber() version: number;
}

export class CloseAlertDto {
  @IsOptional() @IsString() rootCause?: string;
  @IsOptional() @IsString() actionTaken?: string;
  @IsOptional() @IsString() resolution?: string;
}
