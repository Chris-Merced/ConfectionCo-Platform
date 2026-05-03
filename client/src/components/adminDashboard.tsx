import type { FormEvent } from "react";
import { useState, type ReactElement } from "react";

export default function AdminDashboard(): ReactElement {

    const [username, setUsername] = useState("")
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

    return (<><p>Welcome to the Admin Dashboard</p>
        <form className="loginForm" onSubmit={loginHandler} role="form">
            <h2>Login</h2>
            <div className="username">
                <label className="usernameLabel" htmlFor="username">Username: </label>
                <input className="usernameInput" id="username" value={username} onChange={(e) => { setUsername(e.target.value) }} />
            </div>
            <div className="password">
                <label className="passwordLabel" htmlFor="password">Password: </label>
                <input className="passwordInput" id="password" name="password" onChange={(e) => { setPassword(e.target.value) }} />
            </div>
            <button className="loginButton" type="submit">login</button>
        </form>

    </>)
}

