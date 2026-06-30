import placeholder from '@/assets/images/placeholder.webp'

export interface Raffle{
  id: number
  title: string
  image: string
  prize:string
  ticketPrice:number
  ticketsSold: number
  ticketsTotal: number
  endDate: string
}

export const mockRaffles: Raffle[] = [
  {
    id: 1,
    title: 'Win a PS5 Bundle',
    image: placeholder,
    prize: 'PlayStation 5 + 2 Games',
    ticketPrice: 5,
    ticketsSold: 320,
    ticketsTotal: 500,
    endDate: '2026-07-15',
  },
  {
    id: 2,
    title: 'Win £500 Cash',
    image: placeholder,
    prize: '£500 Cash Prize',
    ticketPrice: 2,
    ticketsSold: 850,
    ticketsTotal: 1000,
    endDate: '2026-07-10',
  },
  {
    id: 3,
    title: 'Win a MacBook Pro',
    image: placeholder,
    prize: 'MacBook Pro 14"',
    ticketPrice: 10,
    ticketsSold: 90,
    ticketsTotal: 300,
    endDate: '2026-08-01',
  },
   {
    id: 1,
    title: 'Win a PS5 Bundle',
    image: placeholder,
    prize: 'PlayStation 5 + 2 Games',
    ticketPrice: 5,
    ticketsSold: 320,
    ticketsTotal: 500,
    endDate: '2026-07-15',
  },
  {
    id: 2,
    title: 'Win £500 Cash',
    image: placeholder,
    prize: '£500 Cash Prize',
    ticketPrice: 2,
    ticketsSold: 850,
    ticketsTotal: 1000,
    endDate: '2026-07-10',
  },
  {
    id: 3,
    title: 'Win a MacBook Pro',
    image: placeholder,
    prize: 'MacBook Pro 14"',
    ticketPrice: 10,
    ticketsSold: 90,
    ticketsTotal: 300,
    endDate: '2026-08-01',
  },
   {
    id: 1,
    title: 'Win a PS5 Bundle',
    image: placeholder,
    prize: 'PlayStation 5 + 2 Games',
    ticketPrice: 5,
    ticketsSold: 320,
    ticketsTotal: 500,
    endDate: '2026-07-15',
  },
  {
    id: 2,
    title: 'Win £500 Cash',
    image: placeholder,
    prize: '£500 Cash Prize',
    ticketPrice: 2,
    ticketsSold: 850,
    ticketsTotal: 1000,
    endDate: '2026-07-10',
  },
  {
    id: 3,
    title: 'Win a MacBook Pro',
    image: placeholder,
    prize: 'MacBook Pro 14"',
    ticketPrice: 10,
    ticketsSold: 90,
    ticketsTotal: 300,
    endDate: '2026-08-01',
  },
]
