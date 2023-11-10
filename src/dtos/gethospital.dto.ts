import { IsNumber, IsEmail, IsString, Length, IsEmpty} from 'class-validator'

export class CreateGetHospitalDto{
    @IsEmpty()
    latitude: number[]

    @IsEmpty()
    longitude: number[]

    @IsEmpty()
    @IsNumber()
    urgent: number
}