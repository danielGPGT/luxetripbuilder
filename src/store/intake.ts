import { create } from 'zustand';

export type IntakeData = {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  tone: string;
  travelType: string;
  budget: { amount: number; currency: string };
  includeInventory?: boolean;
  inventoryTypes?: string[]; // e.g., ['hotels', 'flights', 'events']
  eventRequests?: string;
  eventTypes?: string[];
  // Event and ticket data
  selectedEvent?: any;
  selectedTicket?: any;
};

type IntakeStore = {
  intakeData: IntakeData | null;
  setIntakeData: (data: IntakeData) => void;
  updateEventData: (event: any, ticket: any) => void;
};

export const useIntakeStore = create<IntakeStore>((set) => ({
  intakeData: null,
  setIntakeData: (data) => set({ intakeData: data }),
  updateEventData: (event, ticket) => set((state) => ({
    intakeData: {
      destination: '',
      startDate: '',
      endDate: '',
      interests: [],
      tone: 'luxury',
      travelType: 'solo',
      budget: { amount: 0, currency: 'GBP' },
      ...state.intakeData,
      selectedEvent: event,
      selectedTicket: ticket
    }
  })),
})); 