import { IsEmail, IsString, MIN, MinLength, isString } from "class-validator";

export class CreateUserDto {

@IsEmail() //verificadores
email: string;

@IsString()
name: string;

@MinLength(6)
password: string;




}
