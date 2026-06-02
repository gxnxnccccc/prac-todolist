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

    const [totalOrder, setTotalOrder] = useState(null)
    const [totalCategory, setTotalCategory] = useState(null)
    const [allUsername, setAllUsername] = useState(null)
    const [allProductName, setAllProductName] = useState(null)
    const [allCategoryName, setAllCategoryName] = useState(null)
    const [selectedCategory, setSelectedCategory] = useState('')
    const [allId, setAllId] = useState(null)
    const [weeklyReport, setWeeklyReport] = useState(null)
    const [taskOverTime, setTaskOverTime] = useState(null)
    const [text, setText] = useState('')

    const [filters, setFilters] = useState({
        userId: '',
        day: '',
        productId: '',
        categoryId: ''
    })

    const router = useRouter()

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
            router.push('/login')
            return
        }
        const u = localStorage.getItem('Username')
        setUser(JSON.parse(u))
        getTotalOrder();
        // getAllUsernames();
        // getWeeklyReport();
        // getTaskOverTime();
    }, [])

    const getTotalOrder = async ({ userId = '', day = '', productId = '', categoryId = ''} = {}) => {
        try {
            let path = `/api/admin/dashboards`
            const role = localStorage.getItem('role')
            if (role !== 'admin') {
                const userId = localStorage.getItem('UserId')
                path = `/api/dashboards?userId=${userId}`
            }
            else {
                const params = new URLSearchParams()
                if (userId) params.append('user_id', userId)
                if (day) params.append('day', day)
                if (productId) params.append('product_id', productId)
                if (categoryId) params.append('category_id', categoryId)
                
                if (params.toString()) path += `?${params.toString()}`
            }
            // const userId = localStorage.getItem('UserId')
            const res = await fetch(`${path}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                        })
            if (!res.ok) throw new Error(`Request failed: ${res.status}`)

            const data1 = await res.json()
            
            console.log('total product: ', data1)

            setAllCategoryName(data1.result_totalCategoryProduct ?? null)
            setAllUsername(data1.result_allUsername ?? null)
            setAllProductName(data1.result_allProducts ?? null)
            setTotalOrder(data1.result_totalOrder?.[0]?.total_order ?? null)
            setTotalCategory(data1.result_totalCategory?.[0]?.total_category ?? null)

            // const data2 = await res.json()
            console.log("data1: ", data1)
            
            const grouped = (data1.result3 ?? []).reduce((acc, item) => {
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

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        getTotalOrder(newFilters)
    }

    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-geologica)">
            <div className='mt-5 px-1 sm:px-15'>
                <h1 className='text-center  text-4xl'>
                    ORDER
                    <span className='block mt-2 text-xl'>Dashboard</span>
                </h1>
                <hr className="border-t border-black mt-5" />

                {/* Select Options */}
                <div className='grid grid-cols-2 grid-rows-2 sm:grid-cols-4 sm:grid-rows-1 gap-4 mt-5'>
                    <div>
                        <h4>USER</h4>
                        <div className='flex justify-center mx-auto py-3 '>
                            <select className='border p-3 rounded-xl bg-gray-50 w-full' 
                                value={filters.userId} 
                                onChange={(e) => { handleFilterChange('userId', e.target.value) }}>
                                <option value="" >All</option>
                                {allUsername && allUsername.map((u, i) => (
                                    <option key={i} value={u.user_id}>User ID {u.user_id}: {u.username}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h4>DAY</h4>
                        <div className='flex justify-center mx-auto py-3 '>
                            <input
                                type='date' 
                                className='border p-3 rounded-xl bg-gray-50 w-full' 
                                value={filters.day} 
                                onChange={(e) => { handleFilterChange('day', e.target.value) }}/>
                                
                            
                        </div>
                    </div>

                    <div>
                        <h4>PRODUCT</h4>
                        <div className='flex justify-center mx-auto py-3 '>
                            <select className='border p-3 rounded-xl bg-gray-50 w-full' 
                                value={filters.productId} 
                                onChange={(e) => { handleFilterChange('productId', e.target.value) }}>
                                <option value="" >All</option>
                                {allProductName && allProductName.map((p, i) => (
                                    <option key={i} value={p.product_id}>Product ID {p.product_id}: {p.product_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <h4>CATEGORY</h4>
                        <div className='flex justify-center mx-auto py-3 '>
                            <select className='border p-3 rounded-xl bg-gray-50 w-full' 
                                value={filters.categoryId} 
                                onChange={(e) => { handleFilterChange('categoryId', e.target.value) }}>
                                <option value="" >All</option>
                                {allCategoryName && allCategoryName.map((c, i) => (
                                    <option key={i} value={c.category_id}>Category ID {c.category_id}: {c.category_name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className='bg-gray-50 rounded-xl shadow-lg flex-1'>
                    <div className='mx-auto rounded-xl pt-5'>
                        <h3 className='text-center text-xl bg-gray-200 mx-2 rounded-2xl'>Total Order</h3>
                    </div>
                    <p className='text-center text-5xl mt-7 pb-5'>{totalOrder ?? '-'}</p>
                </div>

                <div  className='mx-auto'>

                    <div className='bg-white rounded-xl pb-10 my-2 shadow-lg col-span-4'>
                        <h3 className='text-center text-2xl  pt-5'>Task Over Time</h3>
                        <div className='px-2 sm:px-6 mt-4 flex justify-center' style={{ height: '300px' }}>
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


