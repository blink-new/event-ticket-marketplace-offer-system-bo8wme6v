import { useState } from 'react'
import { DollarSign, Calendar, MapPin, MessageSquare, Check, X } from 'lucide-react'
import { Button } from '../ui/button'
import { Card, CardContent, CardHeader } from '../ui/card'
import { Badge } from '../ui/badge'
import { blink } from '../../blink/client'
import toast from 'react-hot-toast'

interface OfferCardProps {
  offer: any
  ticket: any
  type: 'received' | 'sent'
  onOfferUpdated: () => void
}

export function OfferCard({ offer, ticket, type, onOfferUpdated }: OfferCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleOfferAction = async (action: 'approved' | 'denied') => {
    setIsUpdating(true)
    
    try {
      // Update offer status
      await blink.db.offers.update(offer.id, {
        status: action
      })

      // Update ticket status
      const newTicketStatus = action === 'approved' ? 'sold' : 'available'
      await blink.db.tickets.update(ticket.id, {
        status: newTicketStatus
      })

      toast.success(`Offer ${action} successfully!`)
      onOfferUpdated()
    } catch (error) {
      console.error('Error updating offer:', error)
      toast.error('Failed to update offer. Please try again.')
    } finally {
      setIsUpdating(false)
    }
  }

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'denied':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending'
      case 'approved':
        return 'Approved'
      case 'denied':
        return 'Denied'
      default:
        return status
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {ticket?.eventName || 'Event'}
            </h3>
            <p className="text-sm text-gray-600">
              {type === 'received' ? 'Offer received' : 'Offer sent'}
            </p>
          </div>
          <Badge className={getStatusColor(offer.status)}>
            {getStatusText(offer.status)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {ticket && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {formatDate(ticket.eventDate)}
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {ticket.venue}
            </div>
            
            {(ticket.section || ticket.rowSeat) && (
              <div className="text-sm text-gray-600">
                {ticket.section && `Section ${ticket.section}`}
                {ticket.section && ticket.rowSeat && ' • '}
                {ticket.rowSeat && `Row/Seat ${ticket.rowSeat}`}
              </div>
            )}
          </div>
        )}
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Listed Price:</span>
            <div className="flex items-center text-sm font-medium">
              <DollarSign className="w-3 h-3" />
              {ticket?.price?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Offer Amount:</span>
            <div className="flex items-center text-lg font-bold text-accent">
              <DollarSign className="w-4 h-4" />
              {offer.offerAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {offer.message && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-start space-x-2">
              <MessageSquare className="w-4 h-4 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Message:</p>
                <p className="text-sm text-blue-800">{offer.message}</p>
              </div>
            </div>
          </div>
        )}

        {type === 'received' && offer.status === 'pending' && (
          <div className="flex space-x-3 pt-2">
            <Button
              onClick={() => handleOfferAction('denied')}
              variant="outline"
              className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
              disabled={isUpdating}
            >
              <X className="w-4 h-4 mr-2" />
              Deny
            </Button>
            <Button
              onClick={() => handleOfferAction('approved')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isUpdating}
            >
              <Check className="w-4 h-4 mr-2" />
              {isUpdating ? 'Approving...' : 'Approve'}
            </Button>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-2">
          Offer made on {new Date(offer.createdAt).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  )
}