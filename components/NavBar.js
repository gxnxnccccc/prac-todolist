'use client'; // telling nextjs to treat the component as a Client Component, which is required whenever seeing hooks like useState / useEffect

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Logo from '../public/logos/Logos.png';
import { AiOutlineMenu, AiOutlineClose, AiOutlineInstagram, AiOutlineFacebook, AiOutlineX } from 'react-icons/ai';
import { useState, useEffect } from 'react';
import { FaUserCircle } from 'react-icons/fa';

const NavBar = () => {
    const [ menuOpen, setMenuOpen ] = useState(false)
    const [ imageUrl, setImageUrl ] = useState(null)
    const [ token, setToken ] = useState(null)

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        setToken(storedToken)

        if (storedToken) {
            getProfileLogo(storedToken)
        }
    }, [])

    const handleNav = () => {
        setMenuOpen(!menuOpen)
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

    // const handleLogin = async () => {
    //     e.preventDefault()

    //     try {
    //         if(!token) {
    //             setItem
    //         }
    //     }
    // }

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
        } catch (error){
            console.log("Profile error:", error)
        }
    }

  return (
    <nav className='fixed w-full h-24 shadow-xl bg-white font-[family-name:var(--font-geologica)]'>
        <div className='flex justify-between items-center h-full w-full 2xl:px-16'>
            <Link href="/">
                <Image
                src={Logo}
                alt="Logo"
                width="150"
                
                
                className="cursor-pointer rounded-full"
                priority
                />
            </Link>
            <div className='hidden sm:flex'>
                <ul className="hidden sm:flex items-center px-4">
                    <Link href="/">
                        <li className="ml-10 mr-8 hover:border-b text-xl">Home</li>
                    </Link>
                    <Link href="/todo">
                        <li className="ml-10 mr-8 hover:border-b text-xl">To do</li>
                    </Link>
                    {/* <Link href="/profile">
                        <li className="ml-10 hover:border-b text-xl">Profile</li>
                    </Link> */}
                    {token ? (
                        <Link href="/profile">
                            <div>
                                <form onSubmit={onSubmit} className="flex flex-col items-center">
                                    {imageUrl
                                        ? <div className='p-4'>
                                            <img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-[80px] h-[80px] cursor-pointer" />
                                          </div>
                                        : <div className='p-4'>
                                            <FaUserCircle size={80} className="text-gray-400 cursor-pointer" />
                                          </div>
                                    }
                                </form>
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login">
                            <li className="ml-10 hover:shadow-lg text-xl bg-[#c9c9c9] px-3 py-3 rounded-lg">Register/Login</li>
                        </Link>
                    )}
                </ul>
            </div>
            <div onClick={handleNav} className='sm:hidden cursor-pointer pl-24'>
                <AiOutlineMenu size={25}/>
            </div>
        </div>
        <div className={
                menuOpen
                ? "fixed left-0 top-0 w-[65%] sm:hidden h-screen bg-[#ecf0f3] p-10 ease-in duration-300 shadow-xl"
                : "fixed left-[-100%] top-0 p-10 ease-in duration-300 "
            }>
            <div className='flex w-full items-center justify-end'>
                <div onClick={handleNav} className='cursor-pointer'>
                    <AiOutlineClose size={25}/>
                </div>
            </div>
            {/* <div className='flex justify-around pt-10 items-center'>
                <Link href="/">
                <Image
                src={Logo}
                alt="Logo"
                width="75"
                height="75"
                
                className="cursor-pointer rounded-full"
                priority
                />
            </Link>
            </div> */}
            <div className='flex justify-around pt-10 items-center'>
                {imageUrl
                    ? <div className='p-4'>
                        <img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-[80px] h-[80px] cursor-pointer" />
                        </div>
                    : <div className='p-4'>
                        <FaUserCircle size={80} className="text-gray-400 cursor-pointer" />
                        </div>
                }
            </div>
            <div className='flex-col py-4'>
                <ul>
                    <Link href="/todo">
                        <li
                            onClick={() => setMenuOpen(false)}
                            className='py-4 cursor-pointer'
                        >
                        To do
                        </li>
                    </Link>
                    <Link href="/profile">
                        <li
                            onClick={() => setMenuOpen(false)}
                            className='py-4 cursor-pointer'
                        >
                        Profile
                        </li>
                    </Link>
                </ul>
            </div>
            <div className='flex flex-row justify-evenly pt-10 items-center'>
                <AiOutlineInstagram size={30} className='cursor-pointer'/>
                <AiOutlineFacebook size={30} className='cursor-pointer'/>
                <AiOutlineX size={30} className='cursor-pointer'/>
            </div>
        </div>
    </nav>
  )
}

export default NavBar
