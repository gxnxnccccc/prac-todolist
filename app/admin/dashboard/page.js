'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Page() {
    const [user, setUser] = useState('')
    const [totalUser, setTotalUser] = useState(null)
    const [totalDoneList, setTotalDoneList] = useState(null)
    const [totalUndoneList, setTotalUndoneList] = useState(null)
    const [totalList, setTotalList] = useState(null)
    const [weeklyReport, setWeeklyReport] = useState(null)
    const [taskOverTime, setTaskOverTime] = useState(null)
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
        getTotalUser();
        getTotalList();
        getTotalDoneList();
        getTotalUndoneList();
        getWeeklyReport();
        getTaskOverTime();
    }, [])

    const getTotalUser = async () => {
        try {
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/admin/dashboards`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('total user: ', data)
            setTotalUser(data.result[0].total_user)
            }
        catch (error) {
            console.log(error)
        }
    }

    const getTotalList = async () => {
        try {
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/admin/dashboards`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('total list: ', data)
            setTotalList(data.result4[0].total_list)
            }
        catch (error) {
            console.log(error)
        }
    }
    
    const getTotalDoneList = async () => {
        try {
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/admin/dashboards?`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('total done list: ', data)
            setTotalDoneList(data.result1[0].done_list)
            }
        catch (error) {
            console.log(error)
        }
    }
    const getTotalUndoneList = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/admin/dashboards`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('total undone list: ', data)
            setTotalUndoneList(data.result2[0].undone_list)
            }
        catch (error) {
            console.log(error)
        }
    }

    // const data = {
    //     labels: [
    //         'Red',
    //         'Blue',
    //         'Yellow'
    //     ],
    //     datasets: [{
    //         label: 'My First Dataset',
    //         data: [300, 50, 100],
    //         backgroundColor: [
    //         'rgb(255, 99, 132)',
    //         'rgb(54, 162, 235)',
    //         'rgb(255, 205, 86)'
    //         ],
    //         hoverOffset: 4
    //     }]
    // };

    const getWeeklyReport = () => {
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        const labels = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
            return allMonths[d.getMonth()];
        });
        const data = {
            labels,
            datasets: [{
                label: 'Tasks Completed',
                data: [65, 59, 80, 81, 56, 55, 40],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                ],
                borderWidth: 1
            }]
        };
        setWeeklyReport(data);
    }

    const getTaskOverTime = async () => {
        try {
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/admin/dashboards`, {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
                                    })
            const { result3 } = await res.json();
            const grouped = result3.reduce((acc, item) => {
                if (!item.create_at) return acc;
                const date = item.create_at.split("T")[0];
                if (!acc[date]) {
                    acc[date] = 0
                }
                acc[date]++;
                return acc;
            }, {})

            const label = Object.keys(grouped).sort();
            const countData = label.map((i) => grouped[i])

            const data = {
                labels: label,
                datasets: [{
                    label: 'Tasks Completed',
                    data: countData,
                    backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 159, 64, 0.2)',
                    'rgba(255, 205, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(201, 203, 207, 0.2)'
                ],
                    borderColor: 
                    [ 'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)',
                    'rgb(201, 203, 207)'
                ],
                    borderWidth: 1
                }]
            };
            setTaskOverTime(data)
        }
        catch (error) {
            console.log(error)
        }
        
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)]">
        <div className='mt-10'>
            <h1 className='text-center text-4xl'>Dashboard</h1>
            <div className='grid grid-col-4 gap-5 mt-10 mx-auto px-15'>
                <div className='bg-gray-50 col-span-1 rounded-xl h-50 pb-10 my-2 shadow-lg '>
                    <h3 className='text-center mt-5 text-xl uppercase'>Total</h3>
                    <h3 className='text-center'>User</h3>
                    <p className='text-center text-5xl mt-8'>{totalUser ?? '-'}</p>
                </div>

                <div className='bg-gray-50 col-span-1 rounded-xl h-50 pb-10 my-2 shadow-lg '>
                    <h3 className='text-center mt-5 text-xl uppercase'>Total</h3>
                    <h3 className='text-center'>list</h3>
                    <p className='text-center text-5xl mt-7'>{totalList ?? '-'}</p>
                </div>

                <div className='col-span-2'>
                    <div className='bg-gray-50 rounded-xl h-50 pb-10 my-2 shadow-lg'>
                        <h3 className='text-center mt-5 text-xl uppercase'>Total Done</h3>
                        <h3 className='text-center'>list</h3>
                        <p className='text-center text-5xl mt-7'>{totalDoneList ?? '-'}</p>
                    </div>

                    <div className='bg-gray-50 rounded-xl h-50 pb-10 my-2 shadow-lg'>
                        <h3 className='text-center mt-5 text-xl uppercase'>Total Undone</h3>
                        <h3 className='text-center'>list</h3>
                        <p className='text-center text-5xl mt-7'>{totalUndoneList ?? '-'}</p>
                    </div>
                </div>

                <div className='bg-gray-50 rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                    <h3 className='text-center text-xl uppercase mt-5'>Task Over Time</h3>
                    <div className='px-6 mt-4'>
                        {taskOverTime ? <Bar data={taskOverTime} options={{ scales: { y: { ticks: { stepSize: 1 } } } }} /> : <p className='text-center mt-7'>-</p>}
                    </div>
                </div>

                <div className='bg-gray-50 rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                    <h3 className='text-center text-xl uppercase mt-5'>Task Over Time</h3>
                    <div className='px-6 mt-4'>
                        {taskOverTime ? <Line data={taskOverTime} /> : <p className='text-center mt-7'>-</p>}
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
}


