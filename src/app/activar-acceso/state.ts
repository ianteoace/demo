export type SetPasswordActionState = {
  error: string | null
  success: boolean
}

export const initialSetPasswordActionState: SetPasswordActionState = {
  error: null,
  success: false,
}
