import { isBootstrapAllowedInCurrentEnv } from "@/lib/bootstrap"

import LoginPageClient from "./page-client"

export default function LoginPage() {
  return (
    <LoginPageClient
      isBootstrapRegistrationEnabled={isBootstrapAllowedInCurrentEnv()}
    />
  )
}
