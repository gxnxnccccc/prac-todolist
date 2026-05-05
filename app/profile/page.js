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
    const [ previewUrl, setPreviewUrl ] = useState(null)
    const fileInputRef = useRef(null)
    const router = useRouter()

    const [ user, setUser ] = useState('')
    const [ isOpen, setIsOpen ] = useState(false)
    const [ item, setItem ] = useState([])

    const [ text, setText ] = useState('')
    const [ oldPassword, setOldPassword ] = useState('')
    const [ newPassword, setNewPassword ] = useState('')
    const [ confirmPassword, setConfirmPassword ] = useState('')

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
        localStorage.removeItem('Profile_Image')
        localStorage.removeItem('token')
        // router.push('/')
        window.location.href = '/'
    }

    const handleChangePassword = async (i) => {
        
        if (newPassword !== confirmPassword) {
            alert("The new password and the confirm password does not match.\nPlease try again.")
            return
        }

        try {
            const res = await fetch("/api/profiles", {
                method: 'PUT',
                headers:{ 'Content-Type': 'application/json',
                          'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({userId: localStorage.getItem('UserId'), 
                                      oldPassword: oldPassword,
                                      newPassword: newPassword })
            })
            // const oldPassword = res.json()
            if (!res.ok) {
                alert("Old password is incorrect. Please try again")
                return
            }
            setIsOpen(false)
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
            }
        catch (error) {
            console.log(error)
        }
    }


    return (
        <main>
            <div className="flex flex-col gap-5 font-[family-name:var(--font-geologica)]">
                <h1 className="text-center m-4 text-xl">Profile Page</h1>

                {/* <form onSubmit={onSubmit} className="flex flex-col items-center">
                    {imageUrl
                        ? <img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-[150px] h-[150px] cursor-pointer" />
                        : <FaUserCircle size={150} className="text-gray-400 cursor-pointer" />
                    }
                </form> */}
                
                <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
                    <div className="flex justify-center items-center">
                        {/* previewUrl - just picked image */}
                        {/* imageUrl   - saved image in db */}
                        {previewUrl || imageUrl  
                            ? <img src={previewUrl || imageUrl} alt="profile_img" className="rounded-full object-cover w-[150px] h-[150px] cursor-pointer" onClick={() => fileInputRef.current.click()} />
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
                    {previewUrl && <button type="submit" className="border px-3 py-2 rounded bg-blue-200">Save Photo</button>}
                </form>
                <div className="text-center">Welcome Back!</div>
                <div className="flex flex-col justify-between">
                    <div className="flex flex-row justify-center gap-2">
                        <div className="text-center">Username : </div>
                        <div className="text-center">{user}</div>
                    </div>
                    <div className="flex flex-row justify-center items-center gap-2">
                        <div className="text-center">Password : </div>
                        <div className="text-center">....</div>
                        
                    </div>
                </div>
        
                {/* <FaUserCircle size={150} className="text-gray-400" /> */}

                <div className="flex flex-col items-center gap-2">
                    
                    {/* Change Password button */}
                    <button 
                        onClick={() => setIsOpen(true)} 
                        className="border border-gray-400 py-1 px-3 rounded shadow-md"
                    >Change password</button>
                    {isOpen && (
                        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                            <div className="flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4">
                                <h1 className="text-center text-2xl">Change Password</h1>

                                <div className="flex flex-col gap-2">
                                    <h3>Old Password</h3>
                                    <input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="Enter old password"
                                        className="border px-3 py-2 rounded w-64"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h3>New Password</h3>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        className="border px-3 py-2 rounded w-64"
                                    />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <h3>Confirm New Password</h3>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="border px-3 py-2 rounded w-64"
                                    />
                                </div>

                                <div className="flex gap-2 self-end">
                                    <button onClick={handleChangePassword} className="border px-3 py-2 rounded bg-blue-200">Save</button>
                                    <button onClick={() => setIsOpen(false)} className="border px-3 py-2 rounded bg-gray-200">Cancel</button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Log out button */}
                    <button onClick={handleLogOut} className="px-3 py-2 rounded bg-red-200 shadow-md">LogOut</button>
                </div>
            </div>
        </main>
    )
}