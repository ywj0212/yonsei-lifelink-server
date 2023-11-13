import { IsNumber, IsEmail, IsString, Length, IsEmpty, IsNotEmpty} from 'class-validator'

export class CreateGetHospitalDto{
    @IsNotEmpty()
    @IsNumber()
    latitude: number

    @IsNotEmpty()
    @IsNumber()
    longitude: number

    @IsNotEmpty()
    @IsNumber()
    preKTAS: number
}