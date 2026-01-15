'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { LogOut, User } from 'lucide-react'

interface UserMenuProps {
  showName?: boolean
}

export function UserMenu({ showName = true }: UserMenuProps) {
  const { user, signOut, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="user-menu-skeleton">
        <div className="user-menu-skeleton-avatar" />
        {showName && <div className="user-menu-skeleton-name" />}
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  const displayName = user.user_metadata?.display_name || user.email || 'User'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="user-menu">
      <div className="user-menu-info">
        <div className="user-menu-avatar">
          {user.user_metadata?.avatar_url ? (
            <img
              src={user.user_metadata.avatar_url}
              alt={displayName}
              className="user-menu-avatar-image"
            />
          ) : (
            <span className="user-menu-avatar-initials">{initials}</span>
          )}
        </div>
        {showName && (
          <div className="user-menu-details">
            <span className="user-menu-name">{displayName}</span>
            {user.email && (
              <span className="user-menu-email">{user.email}</span>
            )}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => signOut()}
        className="user-menu-signout"
        title="Sign out"
      >
        <LogOut className="user-menu-signout-icon" />
        <span className="sr-only">Sign out</span>
      </Button>
    </div>
  )
}

interface AuthButtonProps {
  onSignInClick: () => void
}

export function AuthButton({ onSignInClick }: AuthButtonProps) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <User className="mr-2 h-4 w-4" />
        Loading...
      </Button>
    )
  }

  if (isAuthenticated) {
    return <UserMenu />
  }

  return (
    <Button variant="outline" onClick={onSignInClick}>
      <User className="mr-2 h-4 w-4" />
      Sign In
    </Button>
  )
}
