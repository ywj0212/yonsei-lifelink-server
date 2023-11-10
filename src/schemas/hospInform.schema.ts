import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class HospInform{
    @Prop()
    Id: string

    @Prop()
    name: string
}

export const HospInformSchema = SchemaFactory.createForClass(HospInform);