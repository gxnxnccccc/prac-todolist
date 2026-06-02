'use client'

import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Page() {
    const [user, setUser] = useState('')
    const [role, setRole] = useState('')
    // const [totalUser, setTotalUser] = useState(null)
    // const [totalDoneList, setTotalDoneList] = useState(null)
    // const [totalUndoneList, setTotalUndoneList] = useState(null)
    // const [totalList, setTotalList] = useState(null)
    // const [allUsername, setAllUsername] = useState(null)

    const [totalProduct, setTotalProduct] = useState(null)
    const [totalCategory, setTotalCategory] = useState(null)
    const [allCategoryName, setAllCategoryName] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [allId, setAllId] = useState(null)
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
        getTotalProduct();
        // getAllUsernames();
        // getWeeklyReport();
        // getTaskOverTime();
    }, [])

    const getTotalProduct = async (categoryId  = null) => {
        try {
            let path = `/api/admin/dashboards`
            const role = localStorage.getItem('role')
            if (role !== 'admin') {
                const userId = localStorage.getItem('UserId')
                path = `/api/dashboards?userId=${userId}`
            }
            else if (categoryId) {
                path = `/api/admin/dashboards?category_id=${categoryId}`
            }
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`${path}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            if (!res.ok) throw new Error(`Request failed: ${res.status}`)

            const data1 = await res.json()
            
            console.log('total product: ', data1)

            setAllCategoryName(data1.result_totalCategoryProduct ?? null)
            setTotalProduct(data1.result_totalProduct?.[0]?.total_product ?? null)
            setTotalCategory(data1.result_totalCategory?.[0]?.total_category ?? null)



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

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-geologica)">
            <div className='mt-5 px-1 sm:px-15'>
                <h1 className='text-center  text-4xl'>
                    PRODUCTS
                    <span className='block mt-2 text-xl'>Dashboard</span>
                </h1>
                <hr className="border-t border-black mt-5" />

                {/* Select Options */}
                <div>
                    <div className='flex justify-center mx-auto mt-10 py-3 '>
                        <select name="role" className='border p-3 rounded-xl bg-gray-50 w-full' value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); getTotalProduct(e.target.value); }}>
                            {/* <option value="" disabled>Select User Mode</option> */}
                            <option value="" >All</option>
                            {allCategoryName && allCategoryName.map((c, i) => (
                                <option key={i} value={c.category_id}>Category ID {c.category_id}: {c.category_name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className='mt-10 grid grid-rows-2 grid-cols-1 sm:grid-cols-2 sm:grid-rows-1 gap-5 mx-auto'>
                    <div className='bg-gray-50 rounded-xl shadow-lg flex-1'>
                        <div className='mx-auto rounded-xl pt-5'>
                            <h3 className='text-center text-xl bg-gray-200 mx-2 rounded-2xl'>Total Product</h3>
                        </div>
                        <p className='text-center text-5xl mt-7 pb-5'>{totalProduct ?? '-'}</p>
                    </div>

                    <div className='bg-gray-50 rounded-xl shadow-lg flex-1'>
                        <div className='mx-auto rounded-xl pt-5'>
                            <h3 className='text-center text-xl bg-gray-200 mx-2 rounded-2xl'>Total Categories</h3>
                        </div>
                        <p className='text-center text-5xl mt-7 pb-5'>{totalCategory ?? '-'}</p>
                    </div>

                </div>

                <div  className='mx-auto'>
                    {/* <div className='bg-gray-50 rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                        <h3 className='text-center text-xl uppercase mt-5'>Task Over Time</h3>
                        <div className='flex px-6 mt-4 mx-auto justify-center'>
                            {taskOverTime ? <Bar data={taskOverTime} options={{ scales: { y: { ticks: { stepSize: 1 } } } }} /> : <p className='text-center mt-7'>-</p>}
                        </div>
                    </div> */}

                    <div className='bg-white rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                        <h3 className='text-center text-2xl  pt-5'>Task Over Time</h3>
                        <div className='px-2 sm:px-6 mt-4 flex justify-center'>
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


