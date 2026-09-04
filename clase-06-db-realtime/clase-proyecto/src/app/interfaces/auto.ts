export interface Auto {
  id: number;
  created_at: string;
  marca: string | null;
  modelo: string | null;
  precio: number | null;
}

export interface AutoPorCrear {
  marca: string | null;
  modelo: string | null;
  precio: number | null;
}
