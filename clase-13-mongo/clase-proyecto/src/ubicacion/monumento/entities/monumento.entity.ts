import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ collection: 'monumentos' })
export class Monumento {
  @Prop({ required: true })
  nombre: string;

  @Prop({ type: Types.ObjectId, ref: 'Ciudad', required: true })
  ciudad: Types.ObjectId;
}

export const MonumentoSchema = SchemaFactory.createForClass(Monumento);
