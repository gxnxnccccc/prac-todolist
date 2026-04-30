'use client'

import Image from "next/image";
import { use, useState, useEffect } from 'react';
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [ username, setUsername ] = useState('')
    const [ password, setPassword ] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log(e.target)
        const formData = new FormData(e.target)
        console.log(formData)
        const data = Object.fromEntries(formData)
        try {
            const login = await fetch("/api/logins", {method:'POST',
                          headers:{ 'Content-Type': 'application/json'},
                          body:JSON.stringify(data)}

            )
            if (login.ok) {
                const res = await login.json()
                console.log("The data is: ", res)
                localStorage.setItem('UserId', JSON.stringify(res.user.UserId))
                localStorage.setItem('Username', JSON.stringify(res.user.Username))
                localStorage.setItem('Profile_Image', JSON.stringify(res.user.Profile_Image))
                localStorage.setItem('token', res.token)
                // router.push('/')
                window.location.href = '/'
                
            }
            else {
                return "Incorrect Password"
            }
        }
        catch (error) {
            console.log(error)
        }
        console.log(data)
        
    }   
    
    async function handleBackToRegister(i) {
        router.push('/register')
    }


    return (
        <div>
            <main>
                <h1 className="text-center">Login Page</h1>
                <form onSubmit={handleSubmit}>
                    <div className="m-4">
                        <input
                            id='username'
                            name='username'
                            type="text"
                            required
                            placeholder="Enter Username"
                            className="border px-3 py-2 rounded w-full"
                        />
                    </div>

                    <div className="m-4">
                        <input
                            id='password'
                            name='password'
                            type="password"
                            required
                            placeholder="Enter Password"
                            className="border px-3 py-2 rounded w-full"
                        />
                    </div>

                    <div className="text-center m-4 ">
                        <button type="submit" className="border rounded p-4 bg-red-200">Login</button>
                        <br />
                        <button onClick={handleBackToRegister} className="border rounded p-4 bg-red-200">Back to Register</button>
                    </div>
                </form>
            </main>
        </div>
          
    )
}

 