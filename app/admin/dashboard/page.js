'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Page() {
    const [user, setUser] = useState('')
    const [role, setRole] = useState('')
    const [totalUser, setTotalUser] = useState(null)
    const [totalDoneList, setTotalDoneList] = useState(null)
    const [totalUndoneList, setTotalUndoneList] = useState(null)
    const [totalList, setTotalList] = useState(null)
    const [allUsername, setAllUsername] = useState(null)
    const [weeklyReport, setWeeklyReport] = useState(null)
    const [taskOverTime, setTaskOverTime] = useState(null)
    const [text, setText] = useState('')
    const router = useRouter()

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
            router.push('/login')
            return
        }
        const u = localStorage.getItem('Username')
        setUser(JSON.parse(u))
        getTotalUser();
        // getAllUsernames();
        // getWeeklyReport();
        // getTaskOverTime();
    }, [])

    const getTotalUser = async (username = null) => {
        try {
            let path = `/api/admin/dashboards`
            const role = localStorage.getItem('role')
            if (role !== 'admin') {
                const userId = localStorage.getItem('UserId')
                path = `/api/dashboards?userId=${userId}`
            }
            else if (username) {
                path = `/api/admin/dashboards?username=${username}`
            }
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`${path}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            if (!res.ok) throw new Error(`Request failed: ${res.status}`)
            const data1 = await res.json()
            
            console.log('total user: ', data1)

            setTotalList(data1.result_totalList[0].total_list)
            setTotalDoneList(data1.result_doneList[0].done_list)
            setTotalUndoneList(data1.result_undoneList[0].undone_list)
            setTotalUser(data1.result_totalUser[0].total_user)
            setAllUsername(data1.result_allUsername)

            // const data2 = await res.json()
            console.log("data1: ", data1)
            
            const grouped = data1.result3.reduce((acc, item) => {
                if (!item.create_at) return acc;
                const date = item.create_at.split("T")[0];
                if (!acc[date]) {
                    acc[date] = 0
                }
                acc[date]++;
                return acc;
            }, {})

            console.log("Grouped Data: ", grouped)

            const label = Object.keys(grouped).sort();
            const countData = label.map((i) => grouped[i])

            const graphData = {
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

            setTaskOverTime(graphData)
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

    // const getTaskOverTime = async () => {
    //     try {
    //         const res = await fetch(`/api/admin/dashboards`, {
    //                                 headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
    //                                 })
    //         const { result3 } = await res.json();
    //         const grouped = result3.reduce((acc, item) => {
    //             const date = item.create_at.split("T")[0];
    //             if (!acc[date]) {
    //                 acc[date] = 0
    //             }
    //             acc[date]++;
    //             return acc;
    //         }, {})

    //         const label = Object.keys(grouped).sort();
    //         const countData = label.map((i) => grouped[i])

    //         const data = {
    //             labels: label,
    //             datasets: [{
    //                 label: 'Tasks Completed',
    //                 data: countData,
    //                 backgroundColor: [
    //                 'rgba(255, 99, 132, 0.2)',
    //                 'rgba(255, 159, 64, 0.2)',
    //                 'rgba(255, 205, 86, 0.2)',
    //                 'rgba(75, 192, 192, 0.2)',
    //                 'rgba(54, 162, 235, 0.2)',
    //                 'rgba(153, 102, 255, 0.2)',
    //                 'rgba(201, 203, 207, 0.2)'
    //             ],
    //                 borderColor: 
    //                 [ 'rgb(255, 99, 132)',
    //                 'rgb(255, 159, 64)',
    //                 'rgb(255, 205, 86)',
    //                 'rgb(75, 192, 192)',
    //                 'rgb(54, 162, 235)',
    //                 'rgb(153, 102, 255)',
    //                 'rgb(201, 203, 207)'
    //             ],
    //                 borderWidth: 1
    //             }]
    //         };
    //         setTaskOverTime(data)
    //     }
    //     catch (error) {
    //         console.log(error)
    //     }
    // }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
            <div className='mt-5 px-15 '>
                <h1 className='text-center mt-10 text-4xl'>Dashboard</h1>

                {/* Select Options */}
                <form>
                    <div className='flex justify-center mx-auto mt-3 py-3 '>
                        <select name="role" className='border-2 p-3 rounded-xl bg-white' defaultValue="" onChange={(e) => getTotalUser(e.target.value)}>
                            {/* <option value="" disabled>Select User Mode</option> */}
                            <option value="" >All</option>
                            {allUsername && allUsername.map((u, i) => (
                                <option key={i} value={u.all_username}>{u.all_username}</option>
                            ))}
                        </select>
                    </div>
                </form>

                <div className='mt-10 grid grid-cols-3 grid-flow-col gap-5 mx-auto'>
                    <div className='row-span-1 bg-white rounded-xl pb-10 shadow-lg '>
                        <div className='bg-blue-300 mx-15 rounded-xl'>
                            <h3 className='text-center mt-5 text-xl'>Total User</h3>
                        </div>
                        <p className='text-center text-5xl mt-8'>{totalUser ?? '-'}</p>
                    </div>

                    <div className='row-span-1 bg-white rounded-xl  pb-10  shadow-lg '>
                        <div className='bg-amber-300 mx-15 rounded-xl'>
                            <h3 className='text-center mt-5 text-xl'>Total List</h3>
                        </div>
                        <p className='text-center text-5xl mt-7'>{totalList ?? '-'}</p>
                    </div>

                    <div className='grid col-span-2 gap-5   '>
                        <div className='flex justify-between col-span-1 row-span-1 p-4 px-10 bg-white rounded-xl items-center shadow-lg '>
                            <div className='text-center text-xl text-green-600'>Total Done</div>
                            <div className='pl-3 text-center text-xl inline'>
                                {totalDoneList ?? '-'}
                            </div> 
                            {/* <p className='text-center text-5xl mt-7'>{totalDoneList ?? '-'}</p> */}
                        </div>

                        <div className='flex justify-between col-span-1 row-span-1 p-4 px-10 bg-white rounded-xl items-center shadow-lg '>
                            <div className='text-center text-xl text-red-600'>Total Undone</div>  
                            <div className='pl-3 text-center text-xl inline'>
                                {totalUndoneList ?? '-'}
                            </div>
                            {/* <p className='text-center text-5xl mt-7'>{totalUndoneList ?? '-'}</p> */}
                        </div>
                    </div>
                </div>

                <div  className='mx-auto mt-5'>
                    {/* <div className='bg-gray-50 rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                        <h3 className='text-center text-xl uppercase mt-5'>Task Over Time</h3>
                        <div className='flex px-6 mt-4 mx-auto justify-center'>
                            {taskOverTime ? <Bar data={taskOverTime} options={{ scales: { y: { ticks: { stepSize: 1 } } } }} /> : <p className='text-center mt-7'>-</p>}
                        </div>
                    </div> */}

                    <div className='bg-white rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                        <h3 className='text-center text-2xl  pt-5'>Task Over Time</h3>
                        <div className='px-6 mt-4 flex justify-center'>
                            {taskOverTime ? <Line data={taskOverTime} 
                                                  options={{ 
                                                    scales: { y: { ticks: { stepSize: 1 } } },
                                                    responsive: true,
                                                    maintainAspectRatio: false
                                                    }} />
                                         : <p className='text-center mt-7'>-</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


