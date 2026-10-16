import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

class Coords {
  lat: number;
  lon: number;
}

@Schema({ collection: 'ciudades' })
export class Ciudad {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  provincia: string;

  @Prop()
  coords: Coords;

  @Prop({ type: [Types.ObjectId], ref: 'Monumento' })
  monumentos: Types.ObjectId[];
}

export const CiudadSchema = SchemaFactory.createForClass(Ciudad);
