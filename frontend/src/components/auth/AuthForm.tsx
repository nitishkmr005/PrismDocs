'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'

type AuthMode = 'signin' | 'signup' | 'reset'

interface AuthFormProps {
  onSuccess?: () => void
  defaultMode?: AuthMode
}

export function AuthForm({ onSuccess, defaultMode = 'signin' }: AuthFormProps) {
  const { signIn, signUp, signInWithOAuth, resetPassword } = useAuth()
  const [mode, setMode] = useState<AuthMode>(defaultMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMessage(null)

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) {
          setError(error.message)
        } else {
          onSuccess?.()
        }
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, displayName)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email to confirm your account!')
        }
      } else if (mode === 'reset') {
        const { error } = await resetPassword(email)
        if (error) {
          setError(error.message)
        } else {
          setMessage('Check your email for password reset instructions!')
        }
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google' | 'github') => {
    setIsLoading(true)
    setError(null)
    const { error } = await signInWithOAuth(provider)
    if (error) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-form">
      <div className="auth-form-header">
        <h2 className="auth-form-title">
          {mode === 'signin' && 'Welcome Back'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'reset' && 'Reset Password'}
        </h2>
        <p className="auth-form-subtitle">
          {mode === 'signin' && 'Sign in to continue to Document Generator'}
          {mode === 'signup' && 'Get started with Document Generator'}
          {mode === 'reset' && 'Enter your email to reset your password'}
        </p>
      </div>

      {error && (
        <div className="auth-alert auth-alert-error">
          <AlertCircle className="auth-alert-icon" />
          <span>{error}</span>
        </div>
      )}

      {message && (
        <div className="auth-alert auth-alert-success">
          <CheckCircle className="auth-alert-icon" />
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form-fields">
        {mode === 'signup' && (
          <div className="auth-field">
            <Label htmlFor="displayName">Display Name</Label>
            <div className="auth-input-wrapper">
              <User className="auth-input-icon" />
              <Input
                id="displayName"
                type="text"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="auth-input"
              />
            </div>
          </div>
        )}

        <div className="auth-field">
          <Label htmlFor="email">Email</Label>
          <div className="auth-input-wrapper">
            <Mail className="auth-input-icon" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="auth-input"
            />
          </div>
        </div>

        {mode !== 'reset' && (
          <div className="auth-field">
            <Label htmlFor="password">Password</Label>
            <div className="auth-input-wrapper">
              <Lock className="auth-input-icon" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="auth-input"
              />
            </div>
          </div>
        )}

        <Button type="submit" className="auth-submit-button" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="auth-button-loader" />
              Loading...
            </>
          ) : (
            <>
              {mode === 'signin' && 'Sign In'}
              {mode === 'signup' && 'Create Account'}
              {mode === 'reset' && 'Send Reset Email'}
            </>
          )}
        </Button>
      </form>

      {mode !== 'reset' && (
        <>
          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="auth-oauth-buttons">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('google')}
              disabled={isLoading}
              className="auth-oauth-button"
            >
              <svg viewBox="0 0 24 24" className="auth-oauth-icon">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuth('github')}
              disabled={isLoading}
              className="auth-oauth-button"
            >
              <svg viewBox="0 0 24 24" className="auth-oauth-icon" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </Button>
          </div>
        </>
      )}

      <div className="auth-footer">
        {mode === 'signin' && (
          <>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className="auth-link"
            >
              Forgot password?
            </button>
            <span className="auth-footer-text">
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                className="auth-link"
              >
                Sign up
              </button>
            </span>
          </>
        )}
        {mode === 'signup' && (
          <span className="auth-footer-text">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => setMode('signin')}
              className="auth-link"
            >
              Sign in
            </button>
          </span>
        )}
        {mode === 'reset' && (
          <button
            type="button"
            onClick={() => setMode('signin')}
            className="auth-link"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  )
}
