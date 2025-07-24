import { useState, useEffect, useCallback } from 'react'
import { Search, Filter } from 'lucide-react'
import { Header } from './components/layout/Header'
import { TicketCard } from './components/tickets/TicketCard'
import { OfferModal } from './components/tickets/OfferModal'
import { ListTicketModal } from './components/tickets/ListTicketModal'
import { OfferCard } from './components/offers/OfferCard'
import { Input } from './components/ui/input'
import { Button } from './components/ui/button'
import { blink } from './blink/client'
import toast, { Toaster } from 'react-hot-toast'
import type { Ticket, Offer, User } from './types'

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('browse')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)
  const [isListModalOpen, setIsListModalOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const loadTickets = useCallback(async () => {
    try {
      const ticketsData = await blink.db.tickets.list({
        orderBy: { createdAt: 'desc' }
      })
      console.log('Loaded tickets:', ticketsData)
      setTickets(ticketsData)
    } catch (error) {
      console.error('Error loading tickets:', error)
    }
  }, [])

  const loadOffers = useCallback(async () => {
    if (!user) return
    
    try {
      const offersData = await blink.db.offers.list({
        where: {
          OR: [
            { buyerId: user.id },
            { sellerId: user.id }
          ]
        },
        orderBy: { createdAt: 'desc' }
      })
      setOffers(offersData)
    } catch (error) {
      console.error('Error loading offers:', error)
    }
  }, [user])

  // Auth state management
  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
      
      // Log auth state changes for debugging
      console.log('Auth state changed:', { 
        isAuthenticated: state.isAuthenticated, 
        isLoading: state.isLoading, 
        hasUser: !!state.user 
      })
    })
    return unsubscribe
  }, [])

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      loadTickets()
      loadOffers()
    }
  }, [user, refreshTrigger, loadTickets, loadOffers])

  const handleMakeOffer = (ticket: Ticket) => {
    setSelectedTicket(ticket)
    setIsOfferModalOpen(true)
  }

  const handleOfferSubmitted = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleTicketListed = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleOfferUpdated = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const filteredTickets = tickets.filter(ticket =>
    ticket.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ticket.venue.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const myListings = tickets.filter(ticket => {
    const isMyTicket = ticket.userId === user?.id
    console.log('Filtering ticket:', { ticketId: ticket.id, ticketUserId: ticket.userId, currentUserId: user?.id, isMyTicket })
    return isMyTicket
  })
  const receivedOffers = offers.filter(offer => offer.sellerId === user?.id)
  const sentOffers = offers.filter(offer => offer.buyerId === user?.id)

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onListTicket={() => {}} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg border p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header 
          onListTicket={() => {}} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to TicketHub
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            The marketplace where you can buy and sell event tickets with flexible pricing
          </p>
          <div className="bg-white rounded-lg border p-8 max-w-md mx-auto">
            <h3 className="text-xl font-semibold mb-4">Get Started</h3>
            <p className="text-gray-600 mb-6">
              Sign in to start listing tickets or making offers on existing listings
            </p>
            <Button 
              onClick={() => blink.auth.login()}
              className="w-full bg-primary hover:bg-primary/90"
            >
              Sign In to Continue
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onListTicket={() => setIsListModalOpen(true)} 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'browse' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Browse Tickets</h2>
              <div className="flex space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events or venues..."
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {filteredTickets.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tickets found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery ? 'Try adjusting your search terms' : 'Be the first to list a ticket!'}
                </p>
                <Button 
                  onClick={() => setIsListModalOpen(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  List Your First Ticket
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTickets.map((ticket) => (
                  <TicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onMakeOffer={handleMakeOffer}
                    currentUserId={user.id}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'my-listings' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Listings</h2>
              <p className="text-gray-600">Manage your ticket listings and received offers</p>
            </div>

            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Tickets</h3>
                {myListings.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-600 mb-4">You haven't listed any tickets yet</p>
                    <Button 
                      onClick={() => setIsListModalOpen(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      List Your First Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myListings.map((ticket) => (
                      <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        onMakeOffer={handleMakeOffer}
                        currentUserId={user.id}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Received Offers</h3>
                {receivedOffers.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-lg border">
                    <p className="text-gray-600">No offers received yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {receivedOffers.map((offer) => {
                      const ticket = tickets.find(t => t.id === offer.ticketId)
                      return (
                        <OfferCard
                          key={offer.id}
                          offer={offer}
                          ticket={ticket}
                          type="received"
                          onOfferUpdated={handleOfferUpdated}
                        />
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'my-offers' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">My Offers</h2>
              <p className="text-gray-600">Track the status of offers you've made</p>
            </div>

            {sentOffers.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No offers made yet</h3>
                <p className="text-gray-600 mb-6">
                  Browse available tickets and make your first offer
                </p>
                <Button 
                  onClick={() => setActiveTab('browse')}
                  className="bg-primary hover:bg-primary/90"
                >
                  Browse Tickets
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sentOffers.map((offer) => {
                  const ticket = tickets.find(t => t.id === offer.ticketId)
                  return (
                    <OfferCard
                      key={offer.id}
                      offer={offer}
                      ticket={ticket}
                      type="sent"
                      onOfferUpdated={handleOfferUpdated}
                    />
                  )
                })}
              </div>
            )}
          </div>
        )}
      </main>

      <OfferModal
        ticket={selectedTicket}
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false)
          setSelectedTicket(null)
        }}
        onOfferSubmitted={handleOfferSubmitted}
        user={user}
      />

      <ListTicketModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onTicketListed={handleTicketListed}
        user={user}
      />
      
      <Toaster position="top-right" />
    </div>
  )
}

export default App