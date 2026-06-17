// src/modules/attributes/attribute.types.ts
export interface AttributeValueResponse {
  id: string;
  value: string;
  color_code: string | null;
}

export interface AttributeResponse {
  id: string;
  name: string;
  type: 'color' | 'size' | 'text';
  values: AttributeValueResponse[];
  values_count: number;
  created_at: Date;
  updated_at: Date;
}

export interface AttributeMinimal {
  id: string;
  name: string;
  type: 'color' | 'size' | 'text';
  values: AttributeValueResponse[];
}

export interface CreateAttributeDto {
  name: string;
  type?: string;
  values?: { value: string; color_code?: string }[];
}

export interface UpdateAttributeDto {
  name?: string;
  type?: string;
}

export interface CreateValueDto {
  value: string;
  color_code?: string;
}

export interface UpdateValueDto {
  value?: string;
  color_code?: string | null;
}