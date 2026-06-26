// src/lib/forms.ts
// react-hook-form register options for numeric inputs.
// A cleared field becomes undefined/null (never NaN), so the input renders
// empty and is fully clearable instead of being forced back to a default.

/** For required/optional-without-null number fields: '' -> undefined. */
export const numberField = {
  setValueAs: (v: string) => (v === '' || v == null ? undefined : Number(v)),
};

/** For nullable number fields: '' -> null. */
export const nullableNumberField = {
  setValueAs: (v: string) => (v === '' || v == null ? null : Number(v)),
};
