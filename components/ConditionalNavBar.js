'use client'

import { usePathname } from 'next/navigation';
import NavBar from './NavBar';

export default function ConditionalNavBar() {
    const pathname = usePathname();
    const hidden = ['/login', '/register'];
    if (hidden.includes(pathname)) {
        return null;
    }

    return <NavBar />
}