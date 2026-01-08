import { create } from "zustand";
import { persist } from 'zustand/middleware'
import { createParticipant as createParticipantApi, loginUser, logoutUser } from "../services/AuthService";
// import { useNavigate } from "react-router";
const LOCAL_KEY = "quizit_auth"
const PARTICIPANT_KEY = "participant"
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
        (set, get) => ({
            accessToken: null,
            user: null,
            authLoading: false,
            authStatus: false,
            login: async (loginData) => {
                set({ authLoading: true })
                try {
                    const loginResponseData = await loginUser(loginData);
                    // console.log(loginResponseData)
                    set({
                        accessToken: loginResponseData.accessToken,
                        user: loginResponseData.user,
                        authStatus: true
                    })
                    // console.log(get().user);
                    return loginResponseData;
                } catch (error) {
                    throw error;
                }
                finally {
                    set({ authLoading: false })
                }

            },
            logout: async () => {
                set({ authLoading: true })
                try {
                    await logoutUser();
                    set({
                        accessToken: null,
                        user: null,
                        authStatus: false,
                        authLoading: false
                    })
                    localStorage.removeItem(LOCAL_KEY);
                    // window.location.replace("/auth");
                } catch (error) {
                    throw error;
                }
                finally {
                    set({ authLoading: false })
                }


            },
            checkLogin: () => {
                if (get().accessToken && get().authStatus)
                    return true;
                else return false;
            },

            setLocalData:(accessToken,user,authStatus)=>{
                set({
                    accessToken,
                    user,
                    authStatus
                })
            }
        }),
        {
            name: LOCAL_KEY,
        }
    )
)

export default useAuth;


export const useParticipant = create(
    persist(
        (set, get) => ({
            participant: {
                id: null,
                status: null,
                name: null,
            },
            isParticipant: () => {
                if (get().participant.id != null && get().participant.name != null)
                    return true;

                return false;
            },
            participantCreation: async (createData) => {
                try {
                    const responseData = await createParticipantApi(createData);
                    console.log(responseData)
                    set({
                        participant: {
                                id: responseData.participantId,
                                status: responseData.status,
                                name: responseData.participantName,
                             }
                        }
                    )
                    return responseData;
                }
                catch(error){
                    throw error;
                }

            }
        }),
        {
            name: PARTICIPANT_KEY,
        }
    )
)
