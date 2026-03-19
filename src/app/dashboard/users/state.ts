export type UserActionState = {
  error: string | null
  success: boolean
  activationLink: string | null
}

export const initialUserActionState: UserActionState = {
  error: null,
  success: false,
  activationLink: null,
}
