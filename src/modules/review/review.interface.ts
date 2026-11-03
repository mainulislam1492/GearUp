export interface CreateReviewPayload {
    rentalOrderId: string;
    gearItemId: string;
    rating: number; // 1 - 5
    comment?: string;
}