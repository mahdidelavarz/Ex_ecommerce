// src/modules/attributes/types/attribute.types.ts
export interface AttributeValue {
  id: string;
  value: string;
  color_code: string | null;
}

export interface Attribute {
  id: string;
  name: string;
  values: AttributeValue[];
  values_count: number;
  created_at: string;
  updated_at: string;
}

export interface AttributeMinimal {
  id: string;
  name: string;
  values: AttributeValue[];
}

export interface AttributesResponse {
  data: Attribute[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}