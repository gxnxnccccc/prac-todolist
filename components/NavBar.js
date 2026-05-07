'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../public/logos/newLogo.png';
import { AiOutlineMenu, AiOutlineClose, AiOutlineInstagram, AiOutlineFacebook, AiOutlineX } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const NavBar = () => {
    const [menuOpen, setMenuOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)
    const [token, setToken] = useState(null)
    const [role, setRole] = useState(null)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedRole = localStorage.getItem('role')
        setToken(storedToken)
        setRole(storedRole)
        if (storedToken) {
            getProfileLogo(storedToken)
        }
    }, [])

    const handleNav = () => {
        setMenuOpen(!menuOpen)
    }

    const getProfileLogo = async (authToken) => {
        const userId = localStorage.getItem('UserId')
        if (!userId) return
        try {
            const res = await fetch(`/api/profiles?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
            const data = await res.json()
            if (data[0]?.Profile_Image) {
                setImageUrl(data[0].Profile_Image)
            }
        } catch (error) {
            console.log("Profile error:", error)
        }
    }

    const profileSection = token ? (
        <li>
            <Link href="/profile">
                {imageUrl
                    ? <div className='p-4'><img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-20 h-20 cursor-pointer" /></div>
                    : <div className='p-4'><FaUserCircle size={80} className="text-gray-400 cursor-pointer" /></div>
                }
            </Link>
        </li>
    ) : (
        <li className="ml-10 hover:shadow-lg text-xl bg-[#c9c9c9] px-3 py-3 rounded-lg">
            <Link href="/login">Register/Login</Link>
        </li>
    )

    return (
        <nav className='fixed w-full h-24 shadow-xl bg-white font-(family-name:--font-geologica)'>
            <div className='flex justify-between items-center h-full w-full 2xl:px-16'>
                <Link href="/">
                    <Image src={Logo} alt="Logo" width="150" className="cursor-pointer rounded-full" priority />
                </Link>
                <div className='hidden sm:flex'>
                    <ul className="hidden sm:flex items-center px-4">
                        {role === 'admin' ? (
                            <>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/">Home</Link></li>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/admin/dashboard">Dashboard</Link></li>
                                {profileSection}
                            </>
                        ) : (
                            <>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/">Home</Link></li>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/dashboard">Dashboard</Link></li>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/todo">To do</Link></li>
                                {profileSection}
                            </>
                        )}
                    </ul>
                </div>
                <div onClick={handleNav} className='sm:hidden cursor-pointer pl-24'>
                    <AiOutlineMenu size={25} />
                </div>
            </div>

            {/* Mobile menu */}
            <div className={
                menuOpen
                    ? "fixed left-0 top-0 w-[65%] sm:hidden h-screen bg-[#ecf0f3] p-10 ease-in duration-300 shadow-xl"
                    : "fixed -left-full top-0 p-10 ease-in duration-300"
            }>
                <div className='flex w-full items-center justify-end'>
                    <div onClick={handleNav} className='cursor-pointer'>
                        <AiOutlineClose size={25} />
                    </div>
                </div>
                <div className='flex justify-around pt-10 items-center'>
                    {imageUrl
                        ? <div className='p-4'><img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-20 h-20 cursor-pointer" /></div>
                        : <div className='p-4'><FaUserCircle size={80} className="text-gray-400 cursor-pointer" /></div>
                    }
                </div>
                <div className='flex-col py-4'>
                    <ul>
                        <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                            <Link href="/todo">To do</Link>
                        </li>
                        <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                            <Link href="/profile">Profile</Link>
                        </li>
                    </ul>
                </div>
                <div className='flex flex-row justify-evenly pt-10 items-center'>
                    <AiOutlineInstagram size={30} className='cursor-pointer' />
                    <AiOutlineFacebook size={30} className='cursor-pointer' />
                    <AiOutlineX size={30} className='cursor-pointer' />
                </div>
            </div>
        </nav>
    )
}

export default NavBar
