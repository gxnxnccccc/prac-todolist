'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import moment from 'moment';
import { TbClipboardList } from "react-icons/tb";

const OrdersPage = () => {
    const router = useRouter()
    const [orders, setOrders] = useState([])

    useEffect(() => {
        fetchOrders()
    }, [])

    async function fetchOrders() {
        const res = await fetch(`/api/orders`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        setOrders(data.orders ?? [])
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
            <div className='mt-10 px-15'>
                <div className='relative flex justify-center items-center'>
                    <h1 className='text-4xl'>Order History</h1>
                </div>
                <div className='gap-5 mt-10 mx-40 mb-10'>
                    
                    {orders.map((order) => (
                        <div
                            key={order.order_id}
                            onClick={() => router.push(`/order/${order.order_id}`)}
                            className='mt-2 border-2 border-gray-200 rounded-xl w-full px-4 py-2.5 bg-white shadow-xl mb-5 cursor-pointer'
                        >
                            <div className='grid grid-cols-8'>
                                <div className='text-7xl mx-auto'>
                                    <TbClipboardList />
                                </div>
                                <div className='col-span-7 px-7'>
                                    <div className='mx-auto'>
                                        {/* <div className='flex flex-row h-40 '>
                                            {order.image_url
                                                ? <img src={order.image_url} alt={order.product_name} className='object-cover  ' />
                                                : <div className='flex justify-center items-center w-50 h-50 bg-gray-200'>
                                                    <CiImageOff />
                                                </div>
                                            }
                                        </div> */}
                                    </div>
                                    <p className='text-xl'>Order ID: #{order.order_id}</p>
                                    <div className='text-gray-500 text-md'>
                                        <p>Purchase Date: {order.order_date
                                            ? moment.utc(order.order_date).format('DD/MM/YYYY, h:mm:ss')
                                            : '-'}</p>
                                        <p>Total Amount: {order.total_price} ฿</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default OrdersPage
