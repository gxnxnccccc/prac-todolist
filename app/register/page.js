'use client'

import Image from "next/image";
import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";

import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";

export default function RegisterPage() {
    const [ username, setUsername ] = useState('')
    const [ password, setPassword ] = useState('')
    const router = useRouter()
    const fileInputRef = useRef(null)
    const [ imageUrl, setImageUrl ] = useState(null)
    const [ file, setFile ] = useState(null)
    const [ previewUrl, setPreviewUrl ] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        if (file) formData.set('file', file)
        try {
            const register = await fetch("/api/registers", {method:'POST', body:formData})
            if (register.ok) {
                alert('Register Successful')
                router.push('/login')
            } else {
                return "Fail"
            }
        }
        catch (error) {
            console.log(error)
        }
    }   

    const onSubmit = async (e) => {
        e.preventDefault()

        if (!file) return

        try {
            const data = new FormData()
            data.set('file', file)

            const res = await fetch('/api/register', {method:'POST',
                                                    body: data})
            if (!res.ok) {
                throw new Error(await res.text())
            }
            const resImg = await res.json()
            setImageUrl(`/uploads/${resImg.filename}`)
        } catch (error) {
            console.log(error)
        }
    }

    async function handleBackToLogin(i) {
        router.push('/login')
    }

    // const handleChange = (e) => {
    //     console.log(e.target.value)
    //     let filterTask = []
    //     const value = e.target.value
    //     if (value == 'user') {
    //         // filterTask = allTasks.filter(t => t.Status === true)
    //         // setTasks(filterTask)
    //         // setSelected('done')
    //     }
    //     else if (value == 'admin') {
    //         // filterTask = allTasks.filter(t => t.Status == false)
    //         // setTasks(filterTask)
    //         // setSelected('undone')
    //     }
    //     else {
    //         // setTasks(allTasks)
    //         // setSelected('all')
    //     }
    // }


    return (
        <PageTransition direction={1}>
            <div className="flex flex-col sm:flex-row gap-6 font-(family-name:--font-geologica) min-h-screen justify-center lg:justify-between">
                <div className='flex-1 sm:my-auto mx-auto mt-20'> 
                    <div className="justify-center sm:mt-10 flex md:hidden">
                        <img src='/logos/newLogo.png' alt='Logo' width="200"/>
                    </div>
                    <h1 className="text-center text-4xl mt-3">— Register —</h1>
                    <h5 className="text-center text-lg mt-3">A few details and you're in. No credit card.</h5>
                    <div className="flex justify-center items-center mt-5 ">
                        {previewUrl
                            ? <img src={previewUrl} className="rounded-full object-cover w-37.5 h-37.5 cursor-pointer" onClick={() => fileInputRef.current.click()} />
                            : <FaUserCircle size={100} className="text-gray-400 cursor-pointer" onClick={() => fileInputRef.current.click()} />
                        }
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={(e) => {
                                const selected = e.target.files?.[0]
                                setFile(selected)
                                if (selected) setPreviewUrl(URL.createObjectURL(selected))
                            }}
                        />
                    </div>
                    <p className='text-center text-sm text-gray-500'>Add your profile</p>

                    <form onSubmit={handleSubmit} className='w-fit mx-auto'>

                        {/* Select Options */}
                        <div className='flex justify-center mx-auto mt-3 py-3'>
                            <select name="role" className='border border-gray-300 p-3 rounded-2xl bg-white' defaultValue="">
                                <option value="" disabled>Select your Role</option>
                                <option value="user">
                                    USER
                                </option>
                                <option value="admin">
                                    ADMIN
                                </option>
                            </select>
                        </div>

                        <div className="m-4">
                            <input
                                id='username'
                                name='username'
                                type="text"
                                required
                                placeholder="Enter Username"
                                className="border border-gray-300 px-3 py-4 rounded-lg w-90 bg-white"
                            />
                        </div>

                        <div className="m-4">
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
                            <button type="submit" className="border rounded-lg p-2 w-90 bg-black text-white">register</button>
                        </div>

                        
                    </form>
                    <div className='flex justify-center gap-2'>
                        <p>Already have an account? </p>
                        <a onClick={handleBackToLogin} className="border-b">Back to Login</a>
                    </div>
                </div>

                <div className='flex-1'>
                    <img
                        src='/login-register-bg/register-bg.png'
                        alt='login_background'
                        className='w-5/6 ml-auto'
                    />
                </div>
            </div>
        </PageTransition>
    )
}

 