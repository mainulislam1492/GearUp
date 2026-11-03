export interface AdminUserQuery {
    searchTerm?: string;
    role?: string; // CUSTOMER | PROVIDER
    status?: string; // ACTIVE | SUSPENDED
    page?: string;
    limit?: string;
}

export interface AdminGearQuery {
    searchTerm?: string;
    status?: string; // ACTIVE | HIDDEN
    categoryId?: string;
    providerId?: string;
    page?: string;
    limit?: string;
}

export interface AdminRentalQuery {
    status?: string; // PLACED | CONFIRMED | PAID | PICKED_UP | RETURNED | CANCELLED
    customerId?: string;
    providerId?: string;
    page?: string;
    limit?: string;
}