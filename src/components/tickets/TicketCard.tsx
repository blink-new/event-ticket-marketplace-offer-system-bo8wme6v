import { Calendar, MapPin, DollarSign, User } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import type { Ticket } from '../../types'

interface TicketCardProps {
  ticket: Ticket
  onMakeOffer: (ticket: Ticket) => void
  currentUserId?: string
}

export function TicketCard({ ticket, onMakeOffer, currentUserId }: TicketCardProps) {
  const isOwner = currentUserId === ticket.userId
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sold':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-2">
            {ticket.eventName}
          </h3>
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {formatDate(ticket.eventDate)}
        </div>
        
        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2" />
          {ticket.venue}
        </div>
        
        {(ticket.section || ticket.rowNumber || ticket.seatNumbers) && (
          <div className="text-sm text-gray-600">
            {ticket.section && `Section ${ticket.section}`}
            {ticket.section && (ticket.rowNumber || ticket.seatNumbers) && ' • '}
            {ticket.rowNumber && `Row ${ticket.rowNumber}`}
            {ticket.seatNumbers && ` Seat ${ticket.seatNumbers}`}
          </div>
        )}
        
        {ticket.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {ticket.description}
          </p>
        )}
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center text-2xl font-bold text-primary">
            <DollarSign className="w-5 h-5" />
            {ticket.listedPrice.toFixed(2)}
          </div>
          
          {isOwner && (
            <div className="flex items-center text-xs text-gray-500">
              <User className="w-3 h-3 mr-1" />
              Your listing
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        {!isOwner && ticket.status === 'available' && (
          <Button 
            onClick={() => onMakeOffer(ticket)}
            className="w-full bg-accent hover:bg-accent/90 text-white"
          >
            Make Offer
          </Button>
        )}
        
        {isOwner && (
          <div className="w-full text-center text-sm text-gray-500">
            This is your listing
          </div>
        )}
        
        {ticket.status !== 'available' && !isOwner && (
          <div className="w-full text-center text-sm text-gray-500">
            {ticket.status === 'pending' ? 'Offer Pending' : 'Sold'}
          </div>
        )}
      </CardFooter>
    </Card>
  )
}