import { reactive } from 'vue'

// Map of raffleId -> array of ticket numbers owned by the user
export const userTicketStore = reactive<Record<number, number[]>>({
  // Example initial mock entry so you can see it work:
  1: [42, 108]
})

export const addUserTicket = (raffleId: number, ticketNumber: number) => {
  if (!userTicketStore[raffleId]) {
    userTicketStore[raffleId] = []
  }
  userTicketStore[raffleId].push(ticketNumber)
}
