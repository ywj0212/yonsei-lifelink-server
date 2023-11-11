import { IsNumber, IsString, IsNotEmpty, IsBoolean} from 'class-validator'

export class CreatePatientDto{
    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsNumber()
    age: number

    @IsNotEmpty()
    @IsString()
    sex: string

    @IsNotEmpty()
    @IsNumber()
    latitude: number

    @IsNotEmpty()
    @IsNumber()
    longitude: number

    @IsNotEmpty()
    @IsNumber()
    preKTAS: number

    @IsNotEmpty()
    @IsString()
    gido: string

    @IsNotEmpty()
    @IsBoolean()
    isBreathing: boolean

    @IsNotEmpty()
    @IsString()
    breathDepth: string

    @IsNotEmpty()
    @IsString()
    bloodPressure: string

    @IsNotEmpty()
    @IsString()
    beat: string

    @IsNotEmpty()
    @IsBoolean()
    isBleeding: boolean

    @IsNotEmpty()
    @IsString()
    consciousness: string

    @IsNotEmpty()
    @IsNumber()
    hospitalId: number
}