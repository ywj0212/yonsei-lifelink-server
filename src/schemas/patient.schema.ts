import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Patient{
    @Prop()
    Id: string

    @Prop()
    name: string

    @Prop()
    urgent: number

    @Prop()
    updateTime: number
}

export const PatientSchema = SchemaFactory.createForClass(Patient);