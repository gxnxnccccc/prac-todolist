'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import MIMO_Logo from '../public/logos/icon.jpg';
import { AiOutlineMenu, AiOutlineClose, AiOutlineInstagram, AiOutlineFacebook, AiOutlineX } from 'react-icons/ai';
import { useState, useEffect, useContext } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

import { FaCartShopping } from "react-icons/fa6"; // cart
import { FaHeart } from "react-icons/fa6";   // full heart
import { RiFileList3Fill } from "react-icons/ri"; // history

const NavBar = () => {

    const {
            cartAmount,
            refreshCart
        } = useUser();

    const [menuOpen, setMenuOpen] = useState(false)
    const [imageUrl, setImageUrl] = useState(null)
    const [token, setToken] = useState(null)
    const [role, setRole] = useState(null)
    const [mounted, setMounted] = useState(false)
    const [cart, setCart] = useState([])
    const router = useRouter()

    useEffect(() => {
        const storedToken = localStorage.getItem('token')
        const storedRole = localStorage.getItem('role')
        setToken(storedToken)
        setRole(storedRole)
        if (storedToken) {
            getProfileLogo(storedToken)
        }
        refreshCart()
        setMounted(true)
    }, [refreshCart])

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

    const profileSection = !mounted ? null : token ? (
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

    const goCartPage = ()=> {
        const userId = localStorage.getItem('UserId')
        router.push(`/cart/${userId}`)
    }

    const goWishlistPage = () => {
        const userId = localStorage.getItem('UserId')
        router.push(`/wishlist/${userId}`)
    }

    const goOrderPage = () => {
        const userId = localStorage.getItem('UserId')
        router.push(`/order`)
    }

    return (
        <nav className='fixed w-full h-24 shadow-xl bg-white font-(family-name:--font-geologica) z-50'>
            <div className='flex justify-between items-center h-full w-full 2xl:px-16'>
                <Link href="/">
                    <Image src={MIMO_Logo} alt="Logo" width={80} height={80} className="cursor-pointer rounded-full ml-5" priority />
                </Link>
                <div className='hidden sm:flex'>
                    <ul className="hidden sm:flex items-center px-4">
                        {role === 'admin' ? (
                            <>
                                {/* <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/">Home</Link></li> */}
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/admin/inventory">Inventory</Link></li>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/admin/dashboard">Dashboard</Link></li>
                                {profileSection}
                            </>
                        ) : (
                            <>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/">Home</Link></li>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/todo/newTodo">To do</Link></li>
                                <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/product">Products</Link></li>
                                {/* <li className="ml-10 mr-8 hover:border-b text-xl"><Link href="/dashboard">Dashboard</Link></li> */}
                                <li className='ml-5 mr-8'>
                                    <button onClick={goWishlistPage}  className=' cursor-pointer border border-[#4f4f4f] py-1.5 px-3 rounded-xl bg-white text-lg'>
                                        <FaHeart className=''/>
                                    </button>
                                </li>
                                <li className='mr-8'>
                                    <button onClick={goCartPage} className='flex cursor-pointer border border-[#4f4f4f] py-0.5 px-3 rounded-xl bg-white items-center text-lg'>
                                        <FaCartShopping className=''/>
                                        ({cartAmount})
                                        
                                    </button>
                                </li>
                                {profileSection}
                            </>
                        )}
                    </ul>
                </div>
                <div onClick={handleNav} className='sm:hidden cursor-pointer pl-24 mr-5'>
                    <AiOutlineMenu size={25} />
                </div>
            </div>

            {/* Mobile menu */}
            <div className={
                menuOpen
                    ? "fixed left-0 top-0 w-[65%] sm:hidden h-screen bg-[#ecf0f3] p-10 transition-all ease-in duration-300 shadow-xl"
                    : "fixed -left-full top-0 w-[65%] h-screen p-10 transition-all ease-in duration-300 pointer-events-none"
            }>
                
                <div className='flex w-full items-center justify-end'>
                    <div onClick={handleNav} className='cursor-pointer'>
                        <AiOutlineClose size={25} />
                    </div>
                </div>
                <div className='flex justify-around pt-10 items-center'>
                    <Link href={mounted && token ? "/profile" : "/login"} onClick={() => setMenuOpen(false)}>
                        {imageUrl
                            ? <div className='p-4'><img src={imageUrl} alt="profile_img" className="rounded-full object-cover w-20 h-20 cursor-pointer" /></div>
                            : <div className='p-4'><FaUserCircle size={80} className="text-gray-400 cursor-pointer" /></div>
                        }
                    </Link>
                </div>
                <div className='flex-col py-4'>
                    <ul>
                        {role === 'admin' ? (
                            <>
                                <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                                    <Link href="/admin/inventory">Inventory</Link>
                                </li>

                                <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                                    <Link href="/admin/dashboard">Dashboard</Link>
                                </li>
                            </>
                        ) : (
                            <>
                                <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                                    <Link href="/">Home</Link>
                                </li>
                                <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                                    <Link href="/todo/newTodo">To do</Link>
                                </li>
                                <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                                    <Link href="/product">Products</Link>
                                </li>

                                <li className='mr-8'>
                                    <button onClick={goCartPage} className='flex text-lg cursor-pointer px-1.5 py-0.5 w-full items-center'>
                                        <FaCartShopping className='mr-2'/> 
                                        <p className='text-sm'>Cart ({cartAmount}) </p>
                                    </button>
                                </li>

                                <li className='mt-2 mr-8'>
                                    <button onClick={goWishlistPage}  className='flex text-lg cursor-pointer px-1.5 py-0.5 w-full items-center'>
                                        <FaHeart className='mr-2'/> 
                                        <p className='text-sm'>Wishlists</p>
                                    </button>
                                </li>

                                <li className='mt-2 mr-8'>
                                    <button onClick={goOrderPage}  className='flex text-lg cursor-pointer px-1.5 py-0.5 w-full items-center'>
                                        <RiFileList3Fill className='mr-2'/> 
                                        <p className='text-sm'>Order History</p>
                                    </button>
                                </li>

                                <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                                    <Link href="/dashboard">Dashboard</Link>
                                </li>
                            </>
                        )}

                        {/* <li onClick={() => setMenuOpen(false)} className='py-4 cursor-pointer'>
                            <Link href="/profile">Profile</Link>
                        </li> */}
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
