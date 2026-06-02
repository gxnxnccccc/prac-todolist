'use client'

import { useState, useRef, useEffect } from "react"

import { HiUserCircle } from 'react-icons/hi';
import { AiOutlineUser } from 'react-icons/ai';
import { MdAccountCircle } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { IoPerson } from "react-icons/io5";
import { IoMail } from "react-icons/io5";
import { FaBell } from "react-icons/fa";
import { TbBusinessplan } from "react-icons/tb";
import { TbPlugConnected } from "react-icons/tb";
import { TbLogout2 } from "react-icons/tb";

import { FaNoteSticky } from "react-icons/fa6";
import { AiFillProduct } from "react-icons/ai";
import { TbReportMoney } from "react-icons/tb";
import { RxHamburgerMenu } from "react-icons/rx";

export default function ProfileLayout({ children }) {

    const [isCollapsed, setIsCollapsed] = useState(false)

    const pathname = usePathname()

    const menus = [
        { href: '/admin/dashboard', label: 'To Do Lists', icon: <FaNoteSticky /> },
        { href: '/admin/dashboard/product', label: 'Products', icon: <AiFillProduct /> },
        { href: '/admin/dashboard/order', label: 'Orders', icon: <TbReportMoney /> },
    ]

    const handleLogOut = async () => {
        localStorage.removeItem('UserId')
        localStorage.removeItem('Username')
        localStorage.removeItem('Profile_Image')
        localStorage.removeItem('token')
        // router.push('/')
        window.location.href = '/'
    }

    return(
        <div className="flex flex-col font-(family-name:--font-geologica) bg-gray-100 h-[calc(100vh-6rem)] overflow-hidden">
            <div className='flex flex-1 min-h-0 mx-2 sm:mx-5 rounded-3xl mt-10 mb-10 gap-3'>
                <aside className={`relative ${isCollapsed ? 'w-25' : 'w-84'} py-4 px-6 bg-white rounded-2xl shadow-md overflow-y-auto flex flex-col transition-all duration-500`}>
                    <div className='flex justify-between items-center text-2xl'>
                        
                        <button onClick={() => setIsCollapsed(!isCollapsed)} className='self-start mt-5 px-4'>
                            <RxHamburgerMenu className={`transition-transform duration-500 ${isCollapsed ? 'rotate-180' : 'rotate-0'}`}/>
                        </button>
                        {!isCollapsed && <div>Admin Dashboard<br/> Management</div>}
                    </div>
                    <div className="flex flex-col mt-15 gap-2 flex-1">
                        {menus.map((menu) => (
                            <Link
                                key={menu.href}
                                href={menu.href}
                                className={`${pathname === menu.href
                                    ? 'bg-gray-100 shadow-md'
                                    : 'bg-white' } rounded-md hover:bg-gray-300 py-1 text-start inline-flex items-center gap-2 px-4 sm:px-3`}
                            >
                                <span className={`${isCollapsed ? 'text-3xl' : 'text-2xl'}`}>{menu.icon}</span> {!isCollapsed && <span>{menu.label}</span>}
                            </Link>
                        ))}

                        
                    </div>
                    <button onClick={handleLogOut} className='bg-white rounded-md hover:bg-gray-300 py-1 text-start inline-flex items-center gap-2 px-4'>
                            <TbLogout2 className={`${isCollapsed ? 'text-3xl' : 'text-2xl'}`}/> {!isCollapsed && <span>LogOut</span>}
                    </button>

                </aside>

                <main className='flex-1 min-h-0 px-4 py-6 bg-white rounded-2xl shadow-md overflow-y-auto'>
                    {children}
                </main>
            </div>
        </div>
    )
}