import { create } from 'zustand';

export type IntakeData = {
  destination: string;
  startDate: string;
  endDate: string;
  interests: string[];
  tone: string;
  travelType: string;
  budget: { amount: number; currency: string };
};

type IntakeStore = {
  intakeData: IntakeData | null;
  setIntakeData: (data: IntakeData) => void;
};

export const useIntakeStore = create<IntakeStore>((set) => ({
  intakeData: null,
  setIntakeData: (data) => set({ intakeData: data }),
})); 