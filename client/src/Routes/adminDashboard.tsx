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

    /*
    useEffect(() => {
        if (!isAuthenticated || !token) return;

        const getToken = async () => {

            try {
                console.log("Access Token:", token);

                // Example API call
                const res = await fetch("http://localhost:8080/api/authentication", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                console.log(await res.json());
            } catch (err) {
                console.log("Failed authentication route")
            }
        };

        getToken();

    }, [isAuthenticated, token]);
*/

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

    /*
    //Send Text Message
    useEffect(() => {
        if (!isAuthenticated || !token) return;

        async function sendText() {
            try {

                console.log("starting the processs of text sending")
                const res = await fetch("http://localhost:8080/api/base", {
                    headers: { Authorization: `Bearer ${token}` }
                })
                const data = await res.json()

                console.log(data)
            }
            catch (err) {
                console.log("Whoops text error" + err)


            }

        }

        sendText();
    }, [isAuthenticated, token])*/

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

    /*const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")



    async function loginHandler(e: FormEvent) {
        e.preventDefault()
        console.log("you've logged in")
        console.log(username)
        console.log(password)

        const res = await fetch("http://localhost:8080/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password })
        })
        const data = await res.json();
        console.log(res)
        console.log(data)

    }

    return (<><h1>Welcome to the Admin Dashboard</h1>
        <form className="loginForm" onSubmit={loginHandler} role="form">
            <h2>Login</h2>
            <div className="username">
                <label className="usernameLabel" htmlFor="username">Username: </label>
                <input 
                    className="usernameInput"
                    id="username" 
                    value={username} 
                    onChange={(e) => { setUsername(e.target.value) }} >
                </input>
            </div>
            <div className="password">
                <label className="passwordLabel" htmlFor="password">Password: </label>
                <input 
                    className="passwordInput" 
                    id="password" 
                    name="password" 
                    onChange={(e) => { setPassword(e.target.value) }}>
                </input>
            </div>
            <button className="loginButton" type="submit">login</button>
        </form>

    </>)*/
}

