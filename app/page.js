'use client'

import NavBar from '../components/NavBar';
import { useState } from 'react'; 

export default function Home() {
    const [ item, setItem ] = useState([])

return (
    <div className='mt-30'>
       {/* <div className='bg-amber-300 text-center w-24 m-auto'>
            Yellow
       </div> */}
       <div className='bg-blue-100 rounded-3xl mx-10 pb-10'>
            {item.map((i) => (
                <div
                key={i.ItemId}
                data = {i}
                />
                )
            )}
        <h1 className='mx-3 text-xl text-start p-3'>Done</h1>
       </div>

       <div className='bg-blue-100 rounded-3xl mx-10 pb-10'>
            {item.map((i) => (
                <div
                key={i.ItemId}
                data = {i}
                />
                )
            )}
        <h1 className='mx-3 text-xl text-start p-3'>Done</h1>
       </div>
    </div>
    )
}