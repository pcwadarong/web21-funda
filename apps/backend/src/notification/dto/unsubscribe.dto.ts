import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UnsubscribeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  token!: string;
}
