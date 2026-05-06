'use client'

// import React from 'react'
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";


export default function Page() {
    const [user, setUser] = useState('')
    const [totalList, setTotalList] = useState(null)
    const [doneList, setDoneList] = useState(null)
    const [undoneList, setUndoneList] = useState(null)
    const [text, setText] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
            router.push('/login')
        }
        else {
            const u = localStorage.getItem('Username')
            setUser(JSON.parse(u))
        }
        getTotalList();
        getDoneList();
        getUndoneList();
    }, [])

    const getTotalList = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/dashboards?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('total list: ', data)
            setTotalList(data.result[0].total_list)
            }
        catch (error) {
            console.log(error)
        }
    }
    
    const getDoneList = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/dashboards?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('done list: ', data)
            setDoneList(data.result1[0].done_list)
            }
        catch (error) {
            console.log(error)
        }
    }
    const getUndoneList = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/dashboards?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('undone list: ', data)
            setUndoneList(data.result2[0].undone_list)
            }
        catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)]">
        <div className='mt-10'>
            <h1 className='text-center text-4xl'>Dashboard</h1>
            <div className='grid grid-cols-3 gap-5 mt-10 mx-auto px-15'>
                <div className='bg-gray-200 rounded-xl h-50 pb-10 my-2 shadow-lg '>
                    <h3 className='text-center mt-5 text-xl uppercase'>Total</h3>
                    <h3 className='text-center'>To do list</h3>
                    <p className='text-center text-5xl mt-8'>{totalList ?? '-'}</p>
                </div>

                <div className='bg-gray-200 rounded-xl h-50 pb-10 my-2 shadow-lg '>
                    <h3 className='text-center mt-5 text-xl uppercase'>Done</h3>
                    <h3 className='text-center'>list</h3>
                    <p className='text-center text-5xl mt-7'>{doneList ?? '-'}</p>
                </div>

                <div className='bg-gray-200 rounded-xl h-50 pb-10 my-2 shadow-lg '>
                    <h3 className='text-center mt-5 text-xl uppercase'>Undone</h3>
                    <h3 className='text-center'>list</h3>
                    <p className='text-center text-5xl mt-7'>{undoneList ?? '-'}</p>
                </div>

                <div className='bg-gray-200 rounded-xl h-69 pb-10 my-2 shadow-lg col-span-3'>
                    <h3 className='text-center text-xl uppercase mt-5'>Weekly Report</h3>
                </div>

            </div>
        </div>
        </div>
    );
}


