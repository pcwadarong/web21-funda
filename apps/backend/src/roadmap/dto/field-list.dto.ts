export interface FieldListItem {
  slug: string;
  name: string;
  description: string | null;
}

export interface FieldListResponse {
  fields: FieldListItem[];
}
