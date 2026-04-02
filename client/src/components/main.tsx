import { useEffect, useState, type ReactElement } from "react";
import "../styles.css";

export function Main(): ReactElement {

    type apiResponse = { status: string };

    const [newVal, useNewVal] = useState<apiResponse>()
    const [status, useStatus] = useState<string>('')

    useEffect(() => {
        async function getSomething() {
            try{
            const res = await fetch('http://localhost:8080/api/base')
            const data = await res.json();
            useNewVal(data)
            }catch(error){
                console.log("whoops teehee")
                useNewVal({status: "gay"})
            }
        }

        getSomething();
    }, [])

    console.log("here is your value: ")
    console.log(newVal)

    useEffect(() => {
        if (newVal) {
            console.log("achieved")
            console.log(newVal.status)
            const statusVal = newVal.status
            console.log(statusVal)
            useStatus(statusVal)
        }
    }, [newVal])

    return (
        <>
            <div className="main">We have made it to main display</div>
            <></>

            <>Status: {status}</>
        </>
    )
}
