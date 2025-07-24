export interface Ticket {
  id: string
  userId: string
  eventName: string
  eventDate: string
  venue: string
  section?: string
  rowNumber?: string
  seatNumbers?: string
  quantity: number
  listedPrice: number
  description?: string
  status: 'available' | 'pending' | 'sold'
  createdAt: string
}

export interface Offer {
  id: string
  ticketId: string
  buyerId: string
  sellerId: string
  offerAmount: number
  message?: string
  status: 'pending' | 'approved' | 'denied'
  createdAt: string
}

export interface User {
  id: string
  email: string
  displayName?: string
}