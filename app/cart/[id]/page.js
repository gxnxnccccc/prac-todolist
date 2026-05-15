'use client'

import { useState, useEffect } from 'react'
import { useParams } from "next/navigation"
import { CiImageOff } from "react-icons/ci"

const CartPage = () => {

    const { id } = useParams()
    const [cart, setCart] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)

    useEffect(() => {
        fetchCart()
    }, [id])

    async function fetchCart() {
        if (!id) return
        const res = await fetch(`/api/carts/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        const data = await res.json()
        setCart(data.carts ?? [])
    }

    async function changeAmount(item, delta) {
        const newAmount = Math.max(1, item.buy_amount + delta)
        try {
            const res = await fetch(`/api/carts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    cart_id: item.cart_id,
                    buy_amount: newAmount
                })
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            setCart(cart.map(b =>
                b.cart_id === item.cart_id
                    ? { ...b, buy_amount: newAmount }
                    : b
            ))
        } catch (error) {
            console.log("fail to modify buy_amount: ", error)
        }
    }

    async function handleDeleteCart(item) {
        try {
            const res = await fetch(`/api/carts/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    cart_id: item.cart_id
                })
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            fetchCart()
            setIsOpen(false)
            setItemToDelete(null) // clear state
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
            <div className='mt-10 px-15'>
                <div className='relative flex justify-center items-center'>
                    <h1 className='text-4xl'>My Cart</h1>
                </div>
                <div className='gap-5 mt-10 mx-40 mb-10'>
                    {cart.map((c) => (
                        <div key={c.cart_id} className='mt-2 border-2 border-gray-200 rounded-xl w-full px-4 bg-white shadow-lg mb-5'>
                            <div className='grid grid-rows-1 grid-cols-5 p-2 gap-2'>
                                <div>
                                    {c.image_url
                                        ? <img src={c.image_url} alt={c.product_name} className='object-cover mx-auto w-40' />
                                        : <div className='flex justify-center items-center w-full h-50 bg-gray-200'>
                                            <CiImageOff />
                                        </div>
                                    }
                                </div>
                                <div className='col-span-4 grid grid-rows-2'>
                                    <div className='h-full'>
                                        <h3 className='text-3xl text-bold'>{c.product_name}</h3>
                                        <div className='text-gray-400'>Type: {c.category_name}</div>
                                    </div>
                                    <div className='h-full grid grid-cols-5 gap-2'>
                                        <div className='text-right col-span-4 my-auto'>
                                            <div className='inline-flex items-center border rounded bg-white w-fit'>
                                                <button onClick={() => changeAmount(c, -1)} className='px-3 py-1'>-</button>
                                                <span className='px-4'>{c.buy_amount}</span>
                                                <button onClick={() => changeAmount(c, +1)} className='px-3 py-1'>+</button>
                                            </div>
                                            <br />
                                            Price per each: {c.price} ฿ <br />
                                            <div className='text-xl'>Total Price: {c.price * c.buy_amount} ฿</div>
                                        </div>
                                        <div className='relative'>
                                            <div className='absolute bottom-0 right-4 flex flex-col gap-2'>
                                                <button onClick={() => {setIsOpen(true); setItemToDelete(c)}} className='px-7 rounded-lg bg-red-500 text-white'>Cancel</button>
                                                {isOpen && (
                                                    <div className='fixed inset-0 flex items-center justify-center z-50 bg-black/25'>
                                                        <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                                                        <h1 className='text-center text-2xl'>Confirm Delete</h1>
                                                        <p>Are you sure to delete this order?</p>
                                                        <div className='flex gap-2 self-end'>
                                                            <button onClick={() => setIsOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                                            <button onClick={() => handleDeleteCart(itemToDelete)} className="border px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                                                        </div>
                                                        </div>
                                                    </div>
                                                )}
                                                <button className='px-7 py-2 rounded-lg bg-orange-300 text-white'>Buy Now</button>
                                            </div>
                                        </div>
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

export default CartPage
