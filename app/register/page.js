'use client'

import Image from "next/image";
import { use, useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";

export default function LoginPage() {
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
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)]">
            <main className='mt-8 mx-auto'>
                <h1 className="text-center text-4xl">— Register —</h1>
                
                <div className="flex justify-center items-center mt-5">
                    {previewUrl
                        ? <img src={previewUrl} className="rounded-full object-cover w-[150px] h-[150px] cursor-pointer" onClick={() => fileInputRef.current.click()} />
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

                <form onSubmit={handleSubmit}>

                    {/* Select Options */}
                    <div className='flex justify-center mx-auto mt-3 py-3'>
                        <select name="role" className='border-2 p-3 rounded-2xl' defaultValue="">
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
                            className="border-2 px-3 py-2 rounded w-64"
                        />
                    </div>

                    <div className="m-4">
                        <input
                            id='password'
                            name='password'
                            type="password"
                            required
                            placeholder="Enter Password"
                            className="border-2 px-3 py-2 rounded w-64"
                        />
                    </div>

                    <div className="text-center m-4">
                        <button type="submit" className="border rounded-2xl p-2 px-18 bg-green-200">register</button>
                        <br />
                        <button onClick={handleBackToLogin} className="mt-4 border rounded-2xl p-2 bg-red-50">Back to Login</button>
                    </div>
                </form>
            </main>
        </div>
          
    )
}

 