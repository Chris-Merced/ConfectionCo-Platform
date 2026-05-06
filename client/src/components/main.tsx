import { useEffect, useState, type ReactElement } from "react";
import "../styles.css";

export default function Main(): ReactElement {

    type apiResponse = { success: boolean | null };

    const [newVal, useNewVal] = useState<apiResponse>()
    const [status, useStatus] = useState<boolean | null>(null)

    //Send Email Receipt
    useEffect(() => {
        async function getSomething() {
            try {
                const res = await fetch('http://localhost:8080/api/resend')
                const data = await res.json();
                useNewVal(data)
            } catch (error) {
                console.log("whoops teehee")
                useNewVal({ success: false })
            }
        }

        getSomething();
    }, [])

   


    console.log("here is your value: ")
    console.log(newVal)

    useEffect(() => {
        if (newVal) {
            let statusVal = null
            console.log("achieved")
            console.log(newVal.success)
            statusVal = newVal.success
            console.log(statusVal)
            useStatus(statusVal)
        }
    }, [newVal])

    return (
        <>
            <div className="main">We have made it to main display</div>
            <></>

            <>Status: {String(status)}</>
        </>
    )
}
