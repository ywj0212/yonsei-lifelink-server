import { IsNumber, IsEmail, IsString, Length, IsNotEmpty} from 'class-validator'

export class StopTransferDto{
    @IsNotEmpty()
    @IsNumber()
    patientId: number

    @IsNotEmpty()
    @IsNumber()
    hospitalId: number
}