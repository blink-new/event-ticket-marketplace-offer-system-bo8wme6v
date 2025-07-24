import { useState } from 'react'
import { DollarSign } from 'lucide-react'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { blink } from '../../blink/client'
import toast from 'react-hot-toast'
import type { User } from '../../types'

interface ListTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onTicketListed: () => void
  user: User
}

export function ListTicketModal({ isOpen, onClose, onTicketListed, user }: ListTicketModalProps) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    venue: '',
    section: '',
    rowSeat: '',
    price: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleClose = () => {
    setFormData({
      eventName: '',
      eventDate: '',
      venue: '',
      section: '',
      rowSeat: '',
      price: '',
      description: ''
    })
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.eventName || !formData.eventDate || !formData.venue || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }
    
    const price = parseFloat(formData.price)
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price')
      return
    }

    setIsSubmitting(true)
    
    try {
      await blink.db.tickets.create({
        id: `ticket_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: user.id,
        eventName: formData.eventName,
        eventDate: formData.eventDate,
        venue: formData.venue,
        section: formData.section || undefined,
        rowNumber: formData.rowSeat || undefined,
        seatNumbers: formData.rowSeat || undefined,
        quantity: 1,
        listedPrice: price,
        description: formData.description || undefined,
        status: 'available'
      })

      toast.success('Ticket listed successfully!')
      onTicketListed()
      handleClose()
    } catch (error) {
      console.error('Error listing ticket:', error)
      toast.error('Failed to list ticket. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>List Your Ticket</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Name *
            </label>
            <Input
              value={formData.eventName}
              onChange={(e) => handleInputChange('eventName', e.target.value)}
              placeholder="e.g., Taylor Swift - Eras Tour"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date *
            </label>
            <Input
              type="date"
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Venue *
            </label>
            <Input
              value={formData.venue}
              onChange={(e) => handleInputChange('venue', e.target.value)}
              placeholder="e.g., Madison Square Garden"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <Input
                value={formData.section}
                onChange={(e) => handleInputChange('section', e.target.value)}
                placeholder="e.g., 101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Row/Seat
              </label>
              <Input
                value={formData.rowSeat}
                onChange={(e) => handleInputChange('rowSeat', e.target.value)}
                placeholder="e.g., Row A, Seat 15"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price *
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
                placeholder="0.00"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add any additional details about the tickets..."
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
              className="flex-1 bg-primary hover:bg-primary/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Listing...' : 'List Ticket'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}