import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createParticipant,
  loginUser,
  logoutUser,
  updateProfile,
} from "../services/AuthService";
// import { useNavigate } from "react-router";
const LOCAL_KEY = "quizit_auth";
const PARTICIPANT_KEY = "participant";
const QUESTIONS_KEY = "question_ids"
const NAVIGATION_DATA_KEY = "navigation_response"
// AuthState = {
//     accessToken :null,
//     user:null,
//     authLoading:false,
//     authStatus:null,
//     login:(loginData)=>{},
//     logout:(options) =>{},
// };

//   const navigate = useNavigate();

const useAuth = create(
  persist(
    (set, get, api) => ({
      accessToken: null,
      user: null,
      authLoading: false,
      authStatus: false,
      login: async (loginData) => {
        set({ authLoading: true });
        try {
          const loginResponseData = await loginUser(loginData);
          // console.log(loginResponseData)
          set({
            accessToken: loginResponseData.accessToken,
            user: loginResponseData.user,
            authStatus: true,
          });
          import("./webSocketStore").then(({ useWS }) =>
            useWS.getState().reconnectWithFreshToken(),
          );
          // console.log(get().user);
          return loginResponseData;
        } catch (error) {
          throw error;
        } finally {
          set({ authLoading: false });
        }
      },
      logout: async () => {
        set({ authLoading: true });
        try {
          await logoutUser();
          import("./webSocketStore").then(({ useWS }) => useWS.getState().disconnect());
          set({
            accessToken: null,
            user: null,
            authStatus: false,
            authLoading: false,
          });
          api.persist.clearStorage();
          localStorage.removeItem("participant_history_cache");
          localStorage.removeItem("quizit_auth");
        } catch (error) {
          throw error;
        } finally {
          set({ authLoading: false });
        }
      },
      updateUser: async (newUserProfile) => {
        set({ authLoading: true });
        try {
          const updatedUser = await updateProfile(newUserProfile);
          // console.log(loginResponseData)
          set({
            user: updatedUser,
            authStatus: true,
          });
          // console.log(get().user);
          return updatedUser;
        } catch (error) {
          throw error;
        } finally {
          set({ authLoading: false });
        }
      },
      checkLogin: () => {
        if (get().accessToken && get().authStatus) return true;
        else return false;
      },

      setLocalData: (accessToken, user, authStatus) => {
        set({
          accessToken,
          user,
          authStatus,
        });
      },
    }),
    {
      name: LOCAL_KEY,
    },
  ),
);

export default useAuth;

export const useQuestionList = create(
  persist(
    (set, get) => ({
      questionIds: [],
      statuses: {}, // { [questionId]: 'answered' | 'marked' | 'visited' | 'not_visited' }

      setStatus: (id, status) => set((state) => {
        const currentStatus = state.statuses[id];
        
        // Priority Logic: Answered and Marked should stay unless explicitly cleared or updated
        if (currentStatus === 'answered' && status === 'visited') return state;
        if (currentStatus === 'marked' && status === 'visited') return state;

        return {
          statuses: { ...state.statuses, [id]: status }
        };
      }),

      getStatus: (id) => get().statuses[id] || 'not_visited',

      setQuestionIds: (ids) => set((state) => ({
          questionIds: [...new Set([...state.questionIds, ...ids])],
      })),

      clearQuestionIds: () => set({ questionIds: [], statuses: {} }),
      getQuizIds: () => get().questionIds,
      getIndexByQuestionId: (questionId) => get().questionIds.findIndex((id) => id === questionId),
    }),
    { name: QUESTIONS_KEY }
  )
);




export const useNavigationStore = create(
  persist(
    (set, get) => ({

      // 🔥 Matches ExamNavigationResponse
      navigationData: null,

      // ✅ Set full response
      setNavigationData: (data) => set({ navigationData: data }),

      // ✅ Get navigation data
      getNavigationData: () => get().navigationData,

      // ✅ Clear navigation data
      clearNavigationData: () => set({ navigationData: null }),

    }),
    {
      name: NAVIGATION_DATA_KEY, // localStorage key
    }
  )
);

export const useParticipant = create(
  persist(
    (set, get) => ({
      participant: {
        id: null,
        name: null,
        email: null,
        enrollmentId: null,
        status: null,
        quizId: null,
        sessionId: null,
        userId: null,
      },

      isParticipant: () => {
        const p = get().participant;
        return !!p.id && !!p.name && !!p.quizId;
      },
      isParticipantForExam: () => {
        const p = get().participant;
        return !!p.id && !!p.name && !!p.quizId && !!p.enrollmentId && !!p.email;
      },

      isPhysicallyInStorage: () => {
        // 1. Get the raw string using your PARTICIPANT_KEY
        const rawData = localStorage.getItem(PARTICIPANT_KEY);

        if (!rawData) return false;

        try {
          const parsed = JSON.parse(rawData);
          // Zustand wraps your data inside a 'state' property
          const p = parsed.state?.participant;

          // 2. Perform the logic check on the parsed object
          const isValid = !!(
            p?.id &&
            p?.name &&
            p?.quizId &&
            p?.email &&
            p?.enrollmentId
          );

          return isValid;
        } catch (error) {
          return false;
        }
      },

      setParticipant: (data) => {
        set({ participant: data });
      },

      updateParticipant: (data) =>
        set((state) => ({
          participant: {
            ...state.participant,
            ...data,
          },
        })),
      clearParticipant: () => {
        set({
          participant: {
            id: null, name: null, email: null, enrollmentId: null,
            status: null, quizId: null, sessionId: null, userId: null,
          }
        });
        // This physically removes it from localStorage too
        useParticipant.persist.clearStorage();
      },
      participantCreation: async (createData) => {
        try {
          const responseData = await createParticipant(createData);
          const participantData = {
            id: responseData.participantId,
            name: responseData.participantName,
            status: responseData.status,
            quizId: createData.quizId,
            sessionId: createData.sessionId || null,
            userId: createData.userId || null,
            email: createData.email || null,
            enrollmentId: createData.enrollmentId || null
          };
          set({ participant: participantData });
          return participantData;
        } catch (error) {
          console.error("Error creating participant:", error);
          throw error;
        }
      },
    }),
    { name: PARTICIPANT_KEY },
  ),
);

export const getAccessToken = () => useAuth.getState().accessToken;
