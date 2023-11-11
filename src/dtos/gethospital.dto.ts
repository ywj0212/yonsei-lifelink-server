import { IsNumber, IsEmail, IsString, Length, IsEmpty, IsNotEmpty} from 'class-validator'

export class CreateGetHospitalDto{
    @IsNotEmpty()
    latitude: number

    @IsNotEmpty()
    longitude: number

    @IsNotEmpty()
    @IsNumber()
    preKTAS: number
}