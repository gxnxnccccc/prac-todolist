'use client'

import { useState } from 'react';
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

export default function LoginPage() {
    const [ username, setUsername ] = useState('')
    const [ password, setPassword ] = useState('')
    const router = useRouter()

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const data = Object.fromEntries(formData)
        try {
            const login = await fetch("/api/logins", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            if (login.ok) {
                const res = await login.json()
                localStorage.setItem('UserId', JSON.stringify(res.user.UserId))
                localStorage.setItem('Username', JSON.stringify(res.user.Username))
                localStorage.setItem('Profile_Image', JSON.stringify(res.user.Profile_Image))
                localStorage.setItem('token', res.token)
                localStorage.setItem('role', res.user.Roles)

                if (res.user.Roles === 'admin') {
                    router.push('/admin/dashboard')
                } else {
                    router.push('/')
                }
            } else {
                return "Incorrect Password"
            }
        } catch (error) {
            console.log(error)
        }
    }

    async function handleBackToRegister(i) {
        router.push('/register')
    }

    return (
        <PageTransition direction={-1}>
            <div className="font-(family-name:--font-geologica) min-h-screen overflow-hidden">
                <div className='flex flex-col sm:flex-row'>
                    <div className='sm:w-7/12'>
                        <img
                            src='/login-register-bg/login-bg.png'
                            alt='login_background'
                            className='w-2/3 mx-auto sm:w-3/4 sm:ml-auto'
                        />
                    </div>
                    <div className='my-auto'>

                        <div className="justify-center sm:mt-10 hidden md:flex">
                            <img src='/logos/newLogo.png' alt='Logo' width="200"/>
                        </div>
                        <h1 className="text-center text-5xl mt-3">— Login —</h1>
                        <h5 className="text-center text-lg mt-3">Use your username and password to continue.</h5>
                        <div className=''>
                            <form onSubmit={handleSubmit}>
                                <div className="m-4 text-center">
                                    <input
                                        id='username'
                                        name='username'
                                        type="text"
                                        required
                                        placeholder="Enter Username"
                                        className="border border-gray-300 px-3 py-4 rounded-lg w-90 bg-white"
                                    />
                                </div>

                                <div className="m-4 text-center">
                                    <input
                                        id='password'
                                        name='password'
                                        type="password"
                                        required
                                        placeholder="Enter Password"
                                        className="border border-gray-300 px-3 py-4 rounded-lg w-90 bg-white"
                                    />
                                </div>

                                <div className="text-center m-4">
                                    <button type="submit" className="border rounded-lg p-2 w-90 bg-black text-white">Login</button>
                                </div>
                            </form>

                            <div className='flex justify-center gap-2'>
                                <p>New here?</p>
                                <a href='/register' className="border-b">Back to Register</a>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </PageTransition>
    )
}
