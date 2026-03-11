import React, { useEffect, useState } from "react";
import useAuth from "../../../stores/store";
import { refreshToken } from "../../../services/AuthService";
import { tabClasses } from "@mui/material";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";

function OAuth2Success(){
    const[isRefreshing , setIsRefreshing] = useState(false);
    const setLocalData = useAuth((state)=> state.setLocalData)
    const navigate = useNavigate();
    useEffect(()=>{
        async function getAccessToken() {
            if(!isRefreshing)
            {
                setIsRefreshing(true)
               
                try {
                     const responseLoginData = await refreshToken();
                setLocalData(
                    responseLoginData.accessToken,
                    responseLoginData.user,
                    true
                )

                navigate('/dashboard')
                } catch (err) {
                    toast.error(err.message);
                }
                finally{
                    setIsRefreshing(false)
                }
            }
        }

        getAccessToken()
    },[])
return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="bg-white shadow-lg rounded-2xl p-8 text-center w-[350px]">
      {isRefreshing ? (
        <>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">
            Logging you in...
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Please wait while we complete authentication.
          </p>
        </>
      ) : (
        <>
          <h2 className="text-lg font-semibold text-green-600">
            Login Successful...
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Redirecting to dashboard...
          </p>
        </>
      )}
    </div>

    <div className="block md:hidden">
        <MobileAuthView 
          isSignUp={isSignUp} 
          setIsSignUp={setIsSignUp}
          step={step}
          setStep={setStep}
          // ... pass all other props
        />
      </div>
  </div>
);

}

export default OAuth2Success;