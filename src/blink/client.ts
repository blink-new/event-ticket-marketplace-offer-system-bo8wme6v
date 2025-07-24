import { createClient } from '@blinkdotnew/sdk'

export const blink = createClient({
  projectId: 'event-ticket-marketplace-offer-system-bo8wme6v',
  authRequired: false // Changed to false to prevent automatic redirects
})