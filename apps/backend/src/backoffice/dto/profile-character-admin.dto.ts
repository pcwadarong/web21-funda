export interface AdminProfileCharacterItem {
  id: number;
  name: string;
  imageUrl: string;
  priceDiamonds: number;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminProfileCharacterUpdateRequest {
  priceDiamonds: number;
  isActive: boolean;
}
