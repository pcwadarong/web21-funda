export interface ProfileCharacterItem {
  id: number;
  imageUrl: string;
  priceDiamonds: number;
  description: string | null;
  isActive: boolean;
  isOwned: boolean;
}

export interface ProfileCharacterListResult {
  selectedCharacterId: number | null;
  diamondCount: number;
  characters: ProfileCharacterItem[];
}

export interface ProfileCharacterPurchaseResult {
  characterId: number;
  purchased: boolean;
  diamondCount: number;
}

export interface ProfileCharacterApplyResult {
  characterId: number;
  applied: boolean;
}
