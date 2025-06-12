// store/selectedDayStore.js or .ts
import { create } from 'zustand';

const useSelectedDayStore = create((set) => ({
  selectedDay: null, // or new Date() if you want current date as default
  setSelectedDay: (day) => set({ selectedDay: day }),
  clearSelectedDay: () => set({ selectedDay: null }),
}));

export default useSelectedDayStore;
