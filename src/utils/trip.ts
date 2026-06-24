import type { Trip } from '@/lib/mockData'

export function tripTotalParticipants(trip: Trip) {
  return trip.takenSeats + 1
}

export function tripMaxParticipants(trip: Trip) {
  return trip.seats + 1
}
