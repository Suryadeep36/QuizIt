import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getParticipantHistory } from "../services/AuthService";

const HISTORY_KEY = "participant_history_cache";
const TTL_MS = 2 * 60 * 1000; // 2 minutes

const useHistoryStore = create(
  persist(
    (set, get) => ({
      history: [],
      fetchedAt: 0,
      loading: false,

      // Call this from AttendedQuizzes
      fetchHistory: async (userId, { force = false } = {}) => {
        if (!userId) return;

        const { fetchedAt, loading } = get();
        if (loading) return;

        const isFresh = Date.now() - fetchedAt < TTL_MS;
        if (!force && isFresh && get().history.length > 0) return;

        try {
          set({ loading: true });

          const data = await getParticipantHistory(userId);
          const sorted = (data || []).sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          );

          set({
            history: sorted,
            fetchedAt: Date.now(),
          });
        } finally {
          set({ loading: false });
        }
      },

      clearHistory: () => set({ history: [], fetchedAt: 0 }),
    }),
    {
      name: HISTORY_KEY,
      partialize: (state) => ({
        history: state.history,
        fetchedAt: state.fetchedAt,
      }),
    }
  )
);

export default useHistoryStore;
