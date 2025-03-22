import { AuthForm } from '../components/AuthForm'

export function SignUpPage() {
  return <AuthForm mode="signup" />
}

export function SignInPage() {
  return <AuthForm mode="signin" />
}