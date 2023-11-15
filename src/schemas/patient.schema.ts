import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Patient{
    @Prop()
    id: number

    @Prop()
    name: string

    @Prop()
    age: number

    @Prop()
    sex: string

    @Prop()
    preKTAS: number

    @Prop()
    latitude: number

    @Prop()
    longitude: number

    @Prop()
    updateTime: number

    @Prop()
    expectedArrival: number

    @Prop()
    gido: string

    @Prop()
    isBreathing: boolean

    @Prop()
    breathDepth: string

    @Prop()
    bloodPressure: string

    @Prop()
    beat: string

    @Prop()
    isBleeding: boolean

    @Prop()
    consciousness: string

    @Prop()
    HospitalId: number
}

export const PatientSchema = SchemaFactory.createForClass(Patient);