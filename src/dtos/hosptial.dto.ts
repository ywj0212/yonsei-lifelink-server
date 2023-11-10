import { IsEmpty, IsEmail, IsString, Length} from 'class-validator'

export class CreateHospitalDto{
    @IsString()
    name: string;
}
