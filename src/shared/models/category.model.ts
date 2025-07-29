export interface Category {
    id: string;
    name: string;
    slug: string;
    icon?: string;
    description?: string;
    isActive?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}