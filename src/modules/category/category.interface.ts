export interface CreateCategoryPayload {
    name: string;
    description?: string;
    imageUrl?: string;
}

export interface UpdateCategoryPayload {
    name?: string;
    description?: string;
    imageUrl?: string;
}