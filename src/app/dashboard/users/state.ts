export type UserActionState = {
  error: string | null
  success: boolean
}

export const initialUserActionState: UserActionState = {
  error: null,
  success: false,
}
