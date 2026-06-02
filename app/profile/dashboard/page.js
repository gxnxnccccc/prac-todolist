'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Page() {
    const [user, setUser] = useState('')
    const [totalList, setTotalList] = useState(null)
    const [doneList, setDoneList] = useState(null)
    const [undoneList, setUndoneList] = useState(null)
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
        getTotalList();
        // getDoneList();
        // getUndoneList();
        // getWeeklyReport();
        getTaskOverTime();
    }, [])

    const getTotalList = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/dashboards?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            const data = await res.json()
            console.log('total list: ', data)
            setTotalList(data.result_totalList[0].total_list)
            setDoneList(data.result_doneList[0].done_list)
            setUndoneList(data.result_undoneList[0].undone_list)
            }
        catch (error) {
            console.log(error)
        }
    }
    
    // const getDoneList = async () => {
    //     try {
    //         const userId = localStorage.getItem('UserId')
    //         const res = await fetch(`/api/dashboards?userId=${userId}`, {
    //             headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    //                     })
    //         const data = await res.json()
    //         console.log('done list: ', data)
    //         setDoneList(data.result1[0].done_list)
    //         }
    //     catch (error) {
    //         console.log(error)
    //     }
    // }
    // const getUndoneList = async () => {
    //     try {
    //         const userId = localStorage.getItem('UserId')
    //         const res = await fetch(`/api/dashboards?userId=${userId}`, {
    //             headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    //                     })
    //         const data = await res.json()
    //         console.log('undone list: ', data)
    //         setUndoneList(data.result2[0].undone_list)
    //         }
    //     catch (error) {
    //         console.log(error)
    //     }
    // }

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

    // const getWeeklyReport = () => {
    //     const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    //     const now = new Date();
    //     const labels = Array.from({ length: 7 }, (_, i) => {
    //         const d = new Date(now.getFullYear(), now.getMonth() - (6 - i), 1);
    //         return allMonths[d.getMonth()];
    //     });
    //     const data = {
    //         labels,
    //         datasets: [{
    //             label: 'Tasks Completed',
    //             data: [65, 59, 80, 81, 56, 55, 40],
    //             backgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(255, 159, 64, 0.2)',
    //                 'rgba(255, 205, 86, 0.2)',
    //                 'rgba(75, 192, 192, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(153, 102, 255, 0.2)',
    //                 'rgba(201, 203, 207, 0.2)'
    //             ],
    //             borderColor: [
    //                 'rgb(255, 99, 132)',
    //                 'rgb(255, 159, 64)',
    //                 'rgb(255, 205, 86)',
    //                 'rgb(75, 192, 192)',
    //                 'rgb(54, 162, 235)',
    //                 'rgb(153, 102, 255)',
    //                 'rgb(201, 203, 207)'
    //             ],
    //             borderWidth: 1
    //         }]
    //     };
    //     setWeeklyReport(data);
    // }

    const getTaskOverTime = async () => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/dashboards?userId=${userId}`, {
                                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
                                    })
            const { result3 } = await res.json();
            const grouped = result3.reduce((acc, item) => {
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
        <div className="font-(family-name:--font-geologica) min-h-screen ">
        <div className='px-0 md:px-3'>
            <h1 className='text-3xl'>Dashboard</h1>
            <hr className="border-t border-black mt-5"/>
            <h3 className='mt-5 text-xl'>To do list</h3>
            <div className='grid grid-cols-1 sm:grid-col-2 gap-5 mt-4 mx-auto my-2'>
                <div className='grid grid-rows-2  gap-5'>
                    {/* Total */}
                    <div className=' bg-white border-2 border-gray-100 rounded-xl pb-10  shadow-md '>
                        <div className=''>
                            <h3 className='text-center mt-5 text-xl'>Total List</h3>

                        </div>
                        {/* <h3 className='text-center'>To do list</h3> */}
                        <p className='text-center text-5xl mt-9'>{totalList ?? '-'}</p>

                    </div>

                    <div className='grid grid-cols-2 gap-5 '>
                        <div className=' bg-white rounded-xl pb-10 shadow-md border-2 border-gray-100'>
                            <h3 className='text-center mt-5 text-xl text-green-600'>Done List</h3>
                            {/* <h3 className='text-center'>list</h3> */}
                            <p className='text-center text-5xl mt-9'>{doneList ?? '-'}</p>
                        </div>

                        <div className=' bg-white rounded-xl pb-10  shadow-md border-2 border-gray-100'>
                            <h3 className='text-center mt-5 text-xl text-red-600'>Undone List</h3>
                            {/* <h3 className='text-center'>list</h3> */}
                            <p className='text-center text-5xl mt-8'>{undoneList ?? '-'}</p>
                        </div>
                    </div>
                </div>

                {/* <div className='bg-gray-50 rounded-xl pb-10 my-2 shadow-lg col-span-3'>
                    <h3 className='text-center text-xl uppercase mt-5'>Weekly Report</h3>
                    <div className='px-6 mt-4'>
                        {taskOverTime ? <Bar data={taskOverTime} options={{ scales: { y: { ticks: { stepSize: 1 } } } }} /> : <p className='text-center mt-7'>-</p>}
                    </div>
                </div> */}

                <div className='bg-white rounded-xl  shadow-md border-2 border-gray-100'>
                    <h3 className='text-center text-xl mt-5'>Task Over Time</h3>
                    <div className='px-6 mt-4 relative h-80 mb-3'>
                        {taskOverTime ? <Line data={taskOverTime}
                                              options={{
                                                responsive: true,
                                                maintainAspectRatio: false
                                              }} /> 
                                      : <p className='text-center mt-7'>-</p>}
                    </div>
                </div>
                
                <hr className="border-t border-gray-400 mt-5 mx-15"/>
                
                
            </div>
        </div>
        </div>
    );
}


