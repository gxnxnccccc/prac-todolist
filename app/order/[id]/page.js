'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CiImageOff } from 'react-icons/ci'
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';


const OrderDetailPage = () => {
    const { id } = useParams()
    const [orderProducts, setOrderProducts] = useState([])

    const router = useRouter()

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

    const goOrderPage = () => {
        const userId = localStorage.getItem('UserId')
        router.push(`/order`)
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen">
            <div className='mt-10 px-5 sm:px-15'>
                <div className='flex flex-inline items-center'>
                    <button onClick={goOrderPage} className='bg-white border-2  rounded-full'>
                        <IoChevronBack className='text-2xl'/>
                    </button>
                    <h1 className='text-4xl ml-3'>Order #{id}</h1>
                </div>
                <div className='gap-5 mt-10 mx-0 sm:mx-40'>
                    <div className='text-lg mb-2'>Order Item:</div>
                    {orderProducts.map((item) => (
                        <div key={item.order_product_id} className='border-2 border-gray-200 rounded-xl bg-white shadow-lg mb-5'>
                            <div className='grid grid-rows-1 grid-cols-4 gap-2 px-3 py-3'>
                                <div className='flex items-center'>
                                    <div className='mx-auto h-32 w-32 sm:w-55 sm:h-55'>
                                        {item.image_url
                                            ? <img src={item.image_url} alt={item.product_name} className='object-cover w-full h-full' />
                                            : <div className='flex justify-center items-center w-full h-full bg-gray-200'>
                                                <CiImageOff />
                                            </div>
                                        }
                                    </div> 
                                </div>

                                <div className='col-span-2 flex flex-col justify-between'>
                                    <p className='text-lg sm:text-2xl'>{item.product_name}</p>
                                    {/* <p className='text-xs sm:text-sm text-[#9d9ca2]'>
                                        {item.description || 'No description available'}
                                    </p> */}
                                    <div className='text-sm sm:text-lg'>
                                        <p>Quantity: {item.buy_quantity ?? '-'}</p>
                                        <p>Price/unit: {item.unit_price} ฿</p>
                                    </div>
                                </div>

                                <div className='relative'>
                                    {/* <div className='text-xs sm:text-lg'>
                                        <p>Quantity: {item.buy_quantity ?? '-'}</p>
                                        <p>Price/unit: {item.unit_price} ฿</p>
                                    </div> */}
                                    <div className='absolute right-1 bottom-0'>
                                        <button  className='px-6 sm:px-10 py-2 rounded-lg bg-black text-white'>
                                            <p className='text-xs sm:text-lg'>Buy Again</p>
                                        </button>
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
