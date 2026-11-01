import { Injectable, signal } from '@angular/core';
import { AuthResult, StoredUser, User } from '../models/user.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly usersKey = 'cineverse_users';
  private readonly sessionKey = 'cineverse_session';

  private readonly users = signal<StoredUser[]>(this.loadUsers());

  readonly currentUser = signal<User | null>(null);

  private readonly iterations = 120000;

  constructor() {
    this.restoreSession();
  }

  async register(name: string, email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = this.users().some((user) => user.email === normalizedEmail);

    if (existingUser) {
      return {
        success: false,
        message: 'Este correo electrónico ya está registrado.',
      };
    }

    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const saltBase64 = this.toBase64(salt);

      const passwordHash = await this.hashPassword(password, salt);

      const newUser: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        salt: saltBase64,
        createdAt: new Date().toISOString(),
      };

      const updatedUsers = [...this.users(), newUser];

      this.users.set(updatedUsers);
      this.saveUsers(updatedUsers);
      this.startSession(newUser);

      return {
        success: true,
        user: this.toPublicUser(newUser),
      };
    } catch {
      return {
        success: false,
        message: 'No se pudo completar el registro.',
      };
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const normalizedEmail = email.trim().toLowerCase();

    const user = this.users().find((registeredUser) => registeredUser.email === normalizedEmail);

    if (!user) {
      return {
        success: false,
        message: 'Correo electrónico o contraseña incorrectos.',
      };
    }

    try {
      const salt = this.fromBase64(user.salt);

      const passwordHash = await this.hashPassword(password, salt);

      if (passwordHash !== user.passwordHash) {
        return {
          success: false,
          message: 'Correo electrónico o contraseña incorrectos.',
        };
      }

      this.startSession(user);

      return {
        success: true,
        user: this.toPublicUser(user),
      };
    } catch {
      return {
        success: false,
        message: 'No se pudo iniciar sesión.',
      };
    }
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
    this.currentUser.set(null);
  }

  private startSession(user: StoredUser): void {
    const publicUser = this.toPublicUser(user);

    localStorage.setItem(this.sessionKey, user.id);
    this.currentUser.set(publicUser);
  }

  private restoreSession(): void {
    const userId = localStorage.getItem(this.sessionKey);

    if (!userId) {
      return;
    }

    const user = this.users().find((registeredUser) => registeredUser.id === userId);

    if (!user) {
      localStorage.removeItem(this.sessionKey);
      return;
    }

    this.currentUser.set(this.toPublicUser(user));
  }

  private async hashPassword(password: string, salt: Uint8Array): Promise<string> {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, [
      'deriveBits',
    ]);

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: this.iterations,
        hash: 'SHA-256',
      },
      key,
      256,
    );

    return Array.from(new Uint8Array(hash))
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
  }

  private toPublicUser(user: StoredUser): User {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    };
  }

  private loadUsers(): StoredUser[] {
    const storedUsers = localStorage.getItem(this.usersKey);

    if (!storedUsers) {
      return [];
    }

    try {
      const parsed: unknown = JSON.parse(storedUsers);

      return Array.isArray(parsed) ? (parsed as StoredUser[]) : [];
    } catch {
      return [];
    }
  }

  private saveUsers(users: StoredUser[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  private toBase64(bytes: Uint8Array): string {
    return btoa(
      Array.from(bytes)
        .map((byte) => String.fromCharCode(byte))
        .join(''),
    );
  }

  private fromBase64(value: string): Uint8Array {
    return Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
  }
}
