export interface FieldListItem {
  slug: string;
  name: string;
  description: string | null;
  icon: string;
}

export interface FieldListResponse {
  fields: FieldListItem[];
}
