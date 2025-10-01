/**
 * Entidad de Usuario
 * Representa el modelo de dominio de un usuario en la aplicación
 */
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export class UserEntity implements User {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public createdAt: Date,
    public avatar?: string
  ) {}

  // Métodos de negocio si son necesarios
  get displayName(): string {
    return this.name;
  }

  isEmailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }
}

