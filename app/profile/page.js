'use client'

import { useState, useRef, useEffect } from "react"

import { HiUserCircle } from 'react-icons/hi';
import { AiOutlineUser } from 'react-icons/ai';
import { MdAccountCircle } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function Profile() {
    const [ file, setFile ] = useState(null)
    const [ imageUrl, setImageUrl ] = useState(null)
    const fileInputRef = useRef(null)
    const router = useRouter()

    const [ user, setUser ] = useState('')

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
            router.push('/login')
        }
        else {
            const u = localStorage.getItem('Username')
            setUser(JSON.parse(u))
        }
        getData();
        getProfile();
    } ,[]);
      
    const getData = async() => {
    try {
        const userId = localStorage.getItem('UserId')
        const data = await fetch(`/api/todos?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }).then((result) => result.json()).then((res) => setItem(res))
    } catch(error) {}
    }

    const getProfile = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const token = localStorage.getItem('token')
            const res = await fetch(`/api/profiles?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const data = await res.json()
            if (data[0]?.Profile_Image) {
                setImageUrl(data[0].Profile_Image)
            }
        } catch (error) {}
    }

    const onSubmit = async (e) => {
        e.preventDefault()

        if (!file) return

        try {
            const data = new FormData()
            data.set('file', file)
            data.set('userId', localStorage.getItem('UserId'))

            const res = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            const resImg = await res.json()
            setImageUrl(`/uploads/${resImg.filename}`)
        } catch (error) {
            console.log(error)
        }
    }

    const handleLogOut = async () => {
        localStorage.removeItem('UserId')
        localStorage.removeItem('Username')
        localStorage.removeItem('token')
        router.push('/')
    }

    return (
        <main>
            <div className="flex flex-col gap-5">
                <h1 className="text-center m-4 text-xl">Profile Page</h1>
                
                <form onSubmit={onSubmit} className="flex flex-col items-center">
                    {imageUrl
                        ? <img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-[150px] h-[150px] cursor-pointer" />
                        : <FaUserCircle size={150} className="text-gray-400 cursor-pointer" />
                    }
                </form>
                <div className="text-center">{user} is back!</div>
                {/* <FaUserCircle size={150} className="text-gray-400" /> */}

                <div className="text-center">
                    <button onClick={handleLogOut} className="border px-3 py-2 rounded bg-red-200">LogOut</button>
                </div>
            </div>
        </main>
    )
}