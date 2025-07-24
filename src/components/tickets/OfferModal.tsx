import { useState } from 'react'
import { X, DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { blink } from '../../blink/client'
import type { Ticket, User } from '../../types'
import toast from 'react-hot-toast'

interface OfferModalProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  onOfferSubmitted: () => void
  user: User | null
}

export function OfferModal({ ticket, isOpen, onClose, onOfferSubmitted, user }: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setOfferAmount('')
    setMessage('')
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ticket || !offerAmount || !user) return
    
    const amount = parseFloat(offerAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid offer amount')
      return
    }
    
    if (amount >= ticket.listedPrice) {
      toast.error('Offer must be less than the listed price')
      return
    }

    setIsSubmitting(true)
    
    try {
      await blink.db.offers.create({
        id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ticketId: ticket.id,
        buyerId: user.id,
        sellerId: ticket.userId,
        offerAmount: amount,
        message: message.trim() || undefined,
        status: 'pending'
      })

      // Update ticket status to pending
      await blink.db.tickets.update(ticket.id, {
        status: 'pending'
      })

      toast.success('Offer submitted successfully!')
      onOfferSubmitted()
      handleClose()
    } catch (error) {
      console.error('Error submitting offer:', error)
      toast.error('Failed to submit offer. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!ticket) return null

  const suggestedOffers = [
    Math.round(ticket.listedPrice * 0.8),
    Math.round(ticket.listedPrice * 0.85),
    Math.round(ticket.listedPrice * 0.9)
  ]

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900">{ticket.eventName}</h3>
            <p className="text-sm text-gray-600">{ticket.venue}</p>
            <div className="flex items-center mt-2 text-lg font-bold text-primary">
              <DollarSign className="w-4 h-4" />
              {ticket.listedPrice.toFixed(2)} <span className="text-sm font-normal text-gray-600 ml-1">(Listed Price)</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Offer Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={ticket.listedPrice - 0.01}
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  placeholder="0.00"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Must be less than ${ticket.listedPrice.toFixed(2)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quick Suggestions
              </label>
              <div className="flex space-x-2">
                {suggestedOffers.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setOfferAmount(amount.toString())}
                    className="text-xs"
                  >
                    ${amount}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message (Optional)
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message to the seller..."
                rows={3}
                className="resize-none"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-accent hover:bg-accent/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Offer'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}