export type RegisterActionState = {
  error: string | null
  success: boolean
}

export const initialRegisterActionState: RegisterActionState = {
  error: null,
  success: false,
}
