export interface CreateGearPayload {
    name: string;
    brand: string;
    description: string;
    categoryId: string;
    specifications?: Record<string, any>;
    images?: string[];
    pricePerDay: number;
    securityDeposit?: number;
    stockQuantity?: number;
    isAvailable?: boolean;
}

export interface UpdateGearPayload {
    name?: string;
    brand?: string;
    description?: string;
    categoryId?: string;
    specifications?: Record<string, any>;
    images?: string[];
    pricePerDay?: number;
    securityDeposit?: number;
    stockQuantity?: number;
    isAvailable?: boolean;
}