export class Usuario {
  _id: string;
  nombre: string;
  apellido: string;
  contraseña: string;
  mail: string;
  roles: string[];
  creadoEn: Date;
  modificadoEn: Date;
}
