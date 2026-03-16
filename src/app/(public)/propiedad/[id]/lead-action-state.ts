export type LeadActionState = {
  error: string | null
  success: string | null
}

export const EMPTY_LEAD_ACTION_STATE: LeadActionState = {
  error: null,
  success: null,
}
