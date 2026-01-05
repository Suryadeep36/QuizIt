import { create } from "zustand";
import { persist } from 'zustand/middleware'
import { loginUser, logoutUser } from "../services/AuthService";
// import { useNavigate } from "react-router";
const LOCAL_KEY = "quizit_auth"

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
                    // navigate("/")
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
            }
        }),
        {
            name: LOCAL_KEY,
        }
    )
)

export default useAuth;