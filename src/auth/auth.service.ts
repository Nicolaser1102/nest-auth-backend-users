import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { User } from './entities/user.entity';
import { Model } from 'mongoose';

import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayLoad } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { LoginDto, RegisterUserDto, CreateUserDto,UpdateAuthDto} from './dto';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,

    //Inyectar el servicio de los Jason Web Tokens
    private jwtService: JwtService,
  ){}


  async create(createUserDto: CreateUserDto): Promise<User> {
    //return 'This action adds a new auth';


  try {
    
    //1.Encriptar la contraseña
    const {password, ...userData} = createUserDto;
    const newUser = new this.userModel({
      password: bcryptjs.hashSync(password,10),
      ...userData
    });
    //2. Guardar el usuario
    await newUser.save();
    //solo retornar (al usuario) que se registró correctamente todos sus datos menos la contraseña
    const {password:_, ...user} = newUser.toJSON();

    return user
    

  } catch (error) {
    //3. Manejar errores /excepciones 
    if(error.code === 11000){
    throw new BadRequestException(`${createUserDto} already exists!`)
    }
    throw new InternalServerErrorException('Something terrible happen!')
  }    
  }


  //Logica del register

  async register(registerDto: RegisterUserDto): Promise<LoginResponse>{

    const user = await this.create(registerDto);



  return {
    user: user,
    token: this.getJwtToken({id: user._id})
  }

  }




  //Lógica del Post del login()

  async login(loginDto: LoginDto): Promise<LoginResponse>{

    console.log({loginDto});

    const {email, password} = loginDto;

    const user = await this.userModel.findOne({ email});

    if(!user){
      throw new UnauthorizedException('Not valid credentials - email');
    }

    if(!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Not valid credentials - password')
    }

    const { password:_ , ...rest} = user.toJSON();

    return { 
      user : rest, 
      token: this.getJwtToken({id:user.id})
    }
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findUserById(userID:string){

    const user = await this.userModel.findById(userID);

    const{ password, ...rest} = user.toJSON();
    return rest;
  }


  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }


  //Firma del PayLoad

  getJwtToken(payload: JwtPayLoad){

    const token = this.jwtService.sign(payload);
    return token;

  }
}
