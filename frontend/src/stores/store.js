import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  createParticipant,
  loginUser,
  logoutUser,
} from "../services/AuthService";
// import { useNavigate } from "react-router";
const LOCAL_KEY = "quizit_auth";
const PARTICIPANT_KEY = "participant";
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
          set({
            accessToken: null,
            user: null,
            authStatus: false,
            authLoading: false,
          });
           await api.persist.clearStorage();

          // ✅ force store to reflect cleared storage (optional but helps)
          api.persist.rehydrate();

          // optional
          localStorage.removeItem(LOCAL_KEY);
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
    }
  )
);

export default useAuth;

export const useParticipant = create(
  persist(
    (set, get) => ({
      participant: {
        id: null,
        name: null,
        status: null,
        quizId: null,
        sessionId: null,
        userId: null,
      },

      isParticipant: () => {
        const p = get().participant;
        return !!p.id && !!p.name && !!p.quizId && !!p.sessionId;
      },

      setParticipant: (data) => {
        set({ participant: data });
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
          };
          set({ participant: participantData });
          return participantData;
        } catch (error) {
          console.error("Error creating participant:", error);
          throw error;
        }
      },
    }),
    { name: PARTICIPANT_KEY }
  )
);
