import { useState, useEffect } from 'react'
import { Plus, User, LogOut } from 'lucide-react'
import { blink } from '../../blink/client'
import { Button } from '../ui/button'
import type { User as UserType } from '../../types'

interface HeaderProps {
  onListTicket: () => void
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Header({ onListTicket, activeTab, onTabChange }: HeaderProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </header>
    )
  }

  if (!user) {
    return (
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">TicketHub</h1>
          <Button 
            onClick={() => blink.auth.login()}
            className="bg-primary hover:bg-primary/90"
          >
            Sign In
          </Button>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">TicketHub</h1>
        
        <nav className="hidden md:flex space-x-8">
          <button
            onClick={() => onTabChange('browse')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'browse' 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            Browse Tickets
          </button>
          <button
            onClick={() => onTabChange('my-listings')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'my-listings' 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            My Listings
          </button>
          <button
            onClick={() => onTabChange('my-offers')}
            className={`text-sm font-medium transition-colors ${
              activeTab === 'my-offers' 
                ? 'text-primary border-b-2 border-primary pb-1' 
                : 'text-gray-600 hover:text-primary'
            }`}
          >
            My Offers
          </button>
        </nav>

        <div className="flex items-center space-x-4">
          <Button onClick={onListTicket} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" />
            List Ticket
          </Button>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <User className="w-4 h-4" />
              <span>{user.email}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}