import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuthStore } from '../stores/AuthStore'
import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

const signUpSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z.string(),
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  terms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

const signInSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type SignUpFormData = z.infer<typeof signUpSchema>
type SignInFormData = z.infer<typeof signInSchema>

export function AuthForm({ mode }: { mode: 'signup' | 'signin' }) {
    const { user, signUp, signIn, loading, error } = useAuthStore();
    const navigate = useNavigate();
  
    // Redirect when user is authenticated
    useEffect(() => {
      if (user) {
        navigate('/');
      }
    }, [user, navigate]);
  
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(mode === 'signup' ? signUpSchema : signInSchema),
    mode: 'onBlur',
    defaultValues: mode === 'signup' 
      ? { email: '', password: '', confirmPassword: '', firstName: '', lastName: '', terms: false }
      : { email: '', password: '' }
  })

  const onSubmit: SubmitHandler<SignUpFormData | SignInFormData> = async (data) => {
    if (mode === 'signup') {
      const { email, password, firstName, lastName } = data as SignUpFormData
      await signUp(email, password, firstName, lastName)
    } else {
      const { email, password } = data as SignInFormData
      await signIn(email, password)
    }
  }

  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left column with background image */}
      <div 
        className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1500835556837-99ac94a94552?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="relative z-20 flex items-center text-3xl">
          <Link to="/" className="flex items-center">
            SkyLane
          </Link>
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              {mode === 'signup' 
                ? "Join thousands of travelers who have discovered the ease and convenience of booking with SkyLane."
                : "SkyLane has transformed how we travel. Their seamless booking process and excellent customer service make every journey a pleasure."}
            </p>
            <footer className="text-sm">{mode === 'signup' ? 'Michael Chen' : 'Sarah Johnson'}</footer>
          </blockquote>
        </div>
      </div>

      {/* Right column with form */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === 'signup' ? 'Create an account' : 'Welcome back'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {mode === 'signup' 
                ? 'Enter your details to create your SkyLane account' 
                : 'Enter your credentials to sign in to your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register('email')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{String(errors.email.message)}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                {...register('password')}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{String(errors.password.message)}</p>
              )}
            </div>

            {/* Sign up specific fields */}
            {mode === 'signup' && (
              <>
                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">{String(errors.confirmPassword.message)}</p>
                  )}
                </div>

                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    type="text"
                    placeholder="John"
                    {...register('firstName')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500">{String(errors.firstName.message)}</p>
                  )}
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    type="text"
                    placeholder="Doe"
                    {...register('lastName')}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500">{String(errors.lastName.message)}</p>
                  )}
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    {...register('terms')}
                    className="h-4 w-4 mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div className="space-y-1 leading-none">
                    <label htmlFor="terms" className="text-sm font-medium">
                      I agree to the terms of service and privacy policy
                    </label>
                    <p className="text-sm text-gray-500">
                      You must agree to our terms to create an account.
                    </p>
                  </div>
                </div>
                {errors.terms && (
                  <p className="text-sm text-red-500">{String(errors.terms.message)}</p>
                )}
              </>
            )}

            {/* Error message */}
            {error && <div className="text-sm text-red-500">{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (mode === 'signup' ? 'Creating account...' : 'Signing in...') 
                : (mode === 'signup' ? 'Create account' : 'Sign in')}
            </button>
          </form>

          {/* Sign up / Sign in link */}
          <p className="px-8 text-center text-sm text-gray-500">
            {mode === 'signup' ? 'Already have an account? ' : 'Don\'t have an account? '}
            <Link 
              to={mode === 'signup' ? '/auth/login' : '/auth/signup'} 
              className="underline underline-offset-4 hover:text-indigo-600"
            >
              {mode === 'signup' ? 'Sign in' : 'Sign up'}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}