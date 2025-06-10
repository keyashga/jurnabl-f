import { create } from 'zustand'

const useUserStore = create((set, get) => ({
  userId: null,
  
  // Set the userId
  setUserId: (id) => set({ userId: id }),
  
  // Clear the userId
  clearUserId: () => set({ userId: null }),
  
  // Get the current userId
  getUserId: () => get().userId,
  
  // Check if user is logged in
  isLoggedIn: () => get().userId !== null,
}))

export default useUserStore