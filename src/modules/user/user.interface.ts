import { Role } from "../../../generated/prisma/enums";

export interface RegisterUserPayload {
    name: string;
    email: string;
    password: string;
    role?: typeof Role.CUSTOMER | typeof Role.PROVIDER;
    profilePhoto?: string;
    phone?: string;
    address?: string;
    // provider only
    shopName?: string;
    shopAddress?: string;
}

export interface UpdateProfilePayload {
    name?: string;
    profilePhoto?: string;
    phone?: string;
    address?: string;
    // provider only
    shopName?: string;
    shopAddress?: string;
}