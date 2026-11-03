export interface RentalItemPayload {
    gearItemId: string;
    quantity: number;
}

export interface CreateRentalPayload {
    items: RentalItemPayload[];
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD (return day, included in the rental)
    notes?: string;
}

export interface RentalQuery {
    status?: string;
}