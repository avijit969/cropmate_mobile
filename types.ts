export interface User {
  id: string;
  email: string;
  avatar: string;
  username: string;
  full_name: string;
}

export interface SensorData {
  temp?: number;
  hum?: number;
  N?: number;
  P?: number;
  K?: number;
  water?: number;
  pH?: number;
  EC?: number;
  OC?: number;
  S?: number;
  Zn?: number;
  Fe?: number;
  Cu?: number;
  Mn?: number;
  B?: number;
}
