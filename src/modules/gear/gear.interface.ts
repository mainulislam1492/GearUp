// all query values arrive as strings from the URL
export interface GearQuery {
    searchTerm?: string;
    category?: string; // category id or slug
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    available?: string; // "true" | "false"
    page?: string;
    limit?: string;
    sortBy?: string; // pricePerDay | createdAt | name
    sortOrder?: string; // asc | desc
}