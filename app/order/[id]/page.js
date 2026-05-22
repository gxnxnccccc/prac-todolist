'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CiImageOff } from 'react-icons/ci'

const OrderDetailPage = () => {
    const { id } = useParams()
    const [orderProducts, setOrderProducts] = useState([])

    useEffect(() => {
        if (!id) return
        fetchOrderProducts()
    }, [id])

    async function fetchOrderProducts() {
        const res = await fetch(`/api/orders/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        setOrderProducts(data.order_products ?? [])
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen">
            <div className='mt-10 px-15'>
                <div className='relative flex justify-center items-center'>
                    <h1 className='text-4xl'>Order #{id}</h1>
                </div>
                <div className='gap-5 mt-10 mx-40 mb-10'>
                    <div className='text-lg'>Order Item:</div>
                    {orderProducts.map((item) => (
                        <div key={item.order_product_id} 
                             className='mt-2 border-2 border-gray-200 rounded-xl w-full px-4 py-2.5 bg-white shadow-xl mb-5 cursor-pointer'
                        >
                            <div className='grid grid-rows-1 grid-cols-5 gap-2 px-7'>
                                <div className='mx-auto'>
                                    <div className='flex flex-row w-40 h-40 '>
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.product_name} className='object-cover  ' />
                                            : <div className='flex justify-center items-center w-full h-full bg-gray-200'>
                                                <CiImageOff />
                                            </div>
                                        }
                                    </div> 
                                </div>
                                <div className='col-span-3'>
                                    <p className='text-2xl'>{item.product_name}</p>
                                    <p className='text-sm text-[#9d9ca2]-400'>Description: {item.description}</p>
                                </div>
                                <div className='grid grid-rows-2'>
                                    <div className='text-xl'>
                                        <p>Quantity: {item.buy_amount}</p>
                                        <p>Price per Unit: {item.unit_price} ฿</p>
                                    </div>
                                    <div className=''>
                                        <button  className='px-7 py-2 rounded-lg bg-orange-300 text-white'>Buy Again</button>
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

export default OrderDetailPage
