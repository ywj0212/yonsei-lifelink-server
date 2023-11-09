import { IsNumber, IsEmail, IsString, Length, IsEmpty} from 'class-validator'

export class CreateGetHospitalDto{
    @IsEmpty()
    @IsNumber()
    latitude: number[]

    @IsEmpty()
    @IsNumber()
    longitude: number[]

    @IsEmpty()
    @IsNumber()
    urgent: number
}