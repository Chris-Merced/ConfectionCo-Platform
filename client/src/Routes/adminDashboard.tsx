import { useAuth0 } from "@auth0/auth0-react";
import { use, useEffect, useState, type ReactElement } from "react";
import { useQuery } from "@tanstack/react-query";

export default function AdminDashboard(): ReactElement {


    const {
        isLoading, // Loading state, the SDK needs to reach Auth0 on load
        isAuthenticated,
        error,
        loginWithRedirect: login, // Starts the login flow
        logout: auth0Logout, // Starts the logout flow
        user, // User profile
        getAccessTokenSilently, //JWT
    } = useAuth0();


    const [token, setToken] = useState("");

    // Send Token to backend for Authentication
    useEffect(() => {
        if(!isAuthenticated) return;

        const getToken = async () => {
            const token = await getAccessTokenSilently({
                authorizationParams: {
                    audience: "https://confectionco-api"
                }
            })
            setToken(token);
        }

        getToken();
    }, [isAuthenticated])

  

    const { data: authData, isLoading: authCheckLoading, error: authCheckError } = useQuery({
        queryKey: ["auth-check"],
        queryFn: async()=>{
            const res = await fetch("http://localhost:8080/api/authentication",{
                headers:{ Authorization: `Bearer ${token}`}
            });
            return res.json();
        },
        enabled: isAuthenticated && !!token,
    })


    const {data: textData, isLoading: textLoading, error: textError} = useQuery({
        queryKey: ["text-query"],
        queryFn: async () =>{
            const res = await fetch("http://localhost:8080/api/base",{
                headers: {Authorization: `Bearer ${token}`}
            })
            return res.json()
        },
        enabled: isAuthenticated && !!token
    })

    //Grab All Orders That Have not Been Completed
    const {data: orderData, isLoading: orderLoading, error: orderError} = useQuery({
        queryKey: ["order-query"],
        queryFn:  async ()=>{
            const res = await fetch("http://localhost:8080/api/admin/orders",{
                headers: {Authorization: `Bearer ${token}`}
            })
            
            if (!res.ok) throw new Error("Failed to retrieve orders")
            
            return res.json()
        },
        enabled: isAuthenticated && !!token
    })

    const {data: receiptData, isLoading: receiptLoading, error : receiptError} = useQuery({
        queryKey: ["order-receipt"],
        queryFn: async ()=>{
            const res = await fetch("http://localhost:8080/api/admin/sendReceipt",{
                headers: {Authorization: `Bearer ${token}`}
            })

            if(!res.ok){
                throw new Error("Failed to send Receipt")
            }
            return res.json();
        },
        enabled: isAuthenticated && !!token
    })

    if(!orderLoading){
        console.log(orderData)
    }


    const signup = () =>
        login({ authorizationParams: { screen_hint: "signup" } });

    const logout = () =>
        auth0Logout({ logoutParams: { returnTo: window.location.origin } });


    const handleLogin = () => {
        login({
            appState: {
                returnTo: "/admin",
            },
        });
    };

    if (isLoading) return <p>Loading...</p>;

    return isAuthenticated && user ? (
        <>
            <p>Logged in as {user.email}</p>

            <h1>User Profile</h1>

            <pre>{JSON.stringify(user, null, 2)}</pre>

            <button onClick={logout}>Logout</button>
        </>
    ) : (
        <>
            {error && <p>Error: {error.message}</p>}

            <button onClick={signup}>Signup</button>

            <button onClick={handleLogin}>Login</button>
        </>
    );

}

