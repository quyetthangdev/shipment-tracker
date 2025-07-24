export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

export interface IAuthUser {
    username: string;
    role: UserRole;
}

export interface IAuthStore{
    user: IAuthUser | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}