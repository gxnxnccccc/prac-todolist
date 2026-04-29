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


    return (
        <div>
            <main>
                <h1 className="text-center">Register Page</h1>

                <div className="flex justify-center items-center">
                    {previewUrl
                        ? <img src={previewUrl} className="rounded-full object-cover w-[150px] h-[150px] cursor-pointer" onClick={() => fileInputRef.current.click()} />
                        : <FaUserCircle size={150} className="text-gray-400 cursor-pointer" onClick={() => fileInputRef.current.click()} />
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

                    <div className="text-center m-4">
                        <button type="submit" className="border rounded p-4 bg-green-200">register</button>
                    </div>
                </form>
            </main>
        </div>
          
    )
}

 