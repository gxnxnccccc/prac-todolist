'use client'

import { useState, useEffect } from 'react'
import { useParams } from "next/navigation"
import { CiImageOff } from "react-icons/ci"
import { useUser } from '@/context/UserContext';

import { MdCheckBoxOutlineBlank } from "react-icons/md"; // not selected
import { MdCheckBox } from "react-icons/md";             // selected

const CartPage = () => {

    const { id } = useParams()
    const [cart, setCart] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState(null)
    const [selected, setSelected] = useState(new Set())
    // const [totalPrice, setTotalPrice] = useState([])
    const [selectedProduct, setSelectedProduct] = useState([])
    const [isCancelOpen, setIsCancelOpen] = useState(false)
    const [isBuyOpen, setIsBuyOpen] = useState(false)
    const { refreshCart } = useUser()

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
        const newAmount = Math.max(1, item.buy_quantity + delta)
        try {
            const res = await fetch(`/api/carts/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    cart_id: item.cart_id,
                    buy_quantity: newAmount
                })
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            setCart(cart.map(b =>
                b.cart_id === item.cart_id
                    ? { ...b, buy_quantity: newAmount }
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
            await refreshCart()   // sync the navbar badge with real server count
            setIsCancelOpen(false)
            setItemToDelete(null) // clear state
        } catch (error) {
            console.log(error)
        }
    }

    const toggleSelected = (cartId) => {
        try {
            // const selected_cardIds = Array.from(selected)
            // const res =  await fetch(`/api/carts/${id}`, {
            //                     method: 'POST', 
            //                     body: JSON.stringify({cardIds: selected_cardIds})
            //                 })
            // if (!res.ok) {
            //     throw new Error(await res.text())
            // }

            setSelected(prev => {
                const next = new Set(prev)
                if (next.has(cartId)) {
                    next.delete(cartId)
                } else {
                    next.add(cartId)
                }
                return next
            })
        } catch (error) {
            console.log("toggleSelected error: ", error)
        }
    }

    const totalPrice = cart
        .filter(c => selected.has(c.cart_id))
        .reduce((sum, c) => sum + c.unit_price * c.buy_quantity, 0)

    async function handleOrder(itemsToOrder) {
        try {
            const res = await fetch(`/api/orders`, {
                method: 'POST',
                headers: { 'Content-type': 'application/json',
                           'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({
                    items: itemsToOrder.map(item => ({
                        cart_id: item.cart_id,
                        product_id: item.product_id,
                        buy_quantity: item.buy_quantity
                    }))
                })
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            setSelected(new Set())
            setIsBuyOpen(false)
            fetchCart()
            await refreshCart()   // sync navbar badge after purchase
        } catch (error) {
            console.log(error)
        }
    }

    console.log("CART:", cart)

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen">
            <div className='mt-10 px-5 sm:px-15'>
                <div className='relative flex justify-center items-center'>
                    <h1 className='text-4xl'>My Cart</h1>
                </div>
                <div className='gap-5 mt-10 mx-0 sm:mx-40 mb-10'>
                    {cart.map((c) => {
                        const cartId_price = c.unit_price * c.buy_quantity
                        
                        return (
                        <div key={c.cart_id} className='mt-2 border-2 border-gray-200 rounded-xl w-full  bg-white shadow-lg mb-5'>
                            <div className='grid grid-rows-1 grid-cols-2 sm:grid-cols-4 p-2 gap-2'>
                                <div className='flex justify-between my-auto w-full h-35 sm:h-full items-center col-span-1 sm:col-span-1'>
                                    <button onClick={(e) => {
                                        e.preventDefault()
                                        toggleSelected(c.cart_id)
                                    }} className='text-xl sm:text-3xl px-1 sm:px-4'>
                                        {selected.has(c.cart_id) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                    </button>
                                    
                                        <div className='mx-auto h-32 w-32 sm:w-55 sm:h-55'>
                                            {c.image_url
                                                ? <img src={c.image_url} alt={c.product_name} className='object-cover w-full h-full' />
                                                : <div className='flex justify-center items-center h-full w-full bg-gray-200'>
                                                    <CiImageOff />
                                                </div>
                                            }
                                        </div>
                                    
                                </div>

                                <div className='grid grid-rows-1 sm:grid-rows-2 col-span-0 sm:col-span-3'>
                                    <div className='h-full'>
                                        <h3 className='text-sm sm:text-3xl font-bold'>{c.product_name}</h3>
                                        <div className='text-xs sm:text-xl text-[#9d9ca2]'>Type: {c.category_name}</div>
                                    </div>
                                    
                                        <div className='flex flex-col h-full px-1 sm:px-8 '>
                                            <div className='text-right my-auto'>
                                                <div className='inline-flex items-center border rounded bg-white w-fit'>
                                                    <button onClick={() => changeAmount(c, -1)} className='px-2 py-0 sm:py-1 sm:px-3 text-sm sm:text-base'>-</button>
                                                    <span className='px-2 sm:px-4 text-sm sm:text-base'>{c.buy_quantity}</span>
                                                    <button onClick={() => changeAmount(c, +1)} className='px-2 py-0 sm:py-1 sm:px-3 text-sm sm:text-base'>+</button>
                                                </div>                                            <br />
                                                    <div className='text-xs sm:text-lg'>Price per each: {c.unit_price} ฿</div>
                                                    <div className='text-sm sm:text-xl'>Total Price: {cartId_price} ฿</div>
                                            </div>
                                            
                                            {/* <div className='relative'> */}
                                                <div className='flex flex-row ml-auto gap-2 '>
                                                    <button onClick={() => {setIsCancelOpen(true); setItemToDelete(c)}} className='px-3 sm:px-7 rounded-lg bg-red-500 text-white'>Cancel</button>
                                                    
                                                    <button onClick={() => {setIsBuyOpen(true)}} className='px-3 sm:px-7 py-0 sm:py-2 rounded-lg bg-orange-300 text-white text-sm sm:text-lg'>Buy Now</button>
                                                </div>
                                            {/* </div> */}
                                        </div>
                                    
                                </div>
                            </div>
                        </div>
                    )})}
                    {isCancelOpen && (
                        <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                            <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                            <h1 className='text-center text-2xl'>Confirm Delete</h1>
                            <p>Are you sure to delete this order?</p>
                            <div className='flex gap-2 self-end'>
                                <button onClick={() => setIsCancelOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                <button onClick={() => handleDeleteCart(itemToDelete)} className="border px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                            </div>
                            </div>
                        </div>
                    )}

                    {isBuyOpen && (
                        <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                            <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                            <h1 className='text-center text-2xl'>Confirm Purchase</h1>
                            <p>Are you sure to purchase this item?</p>
                            <div className='flex gap-2 self-end'>
                                <button onClick={() => setIsBuyOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                <button onClick={() => handleOrder([c])} className="border px-3 py-2 rounded bg-orange-300 hover:bg-orange-400 text-white">Confirm</button>
                            </div>
                            </div>
                        </div>
                    )}

                    
                    <div className='flex flex-col items-end gap-2 mt-4'>
                        <div>Selected Items: {selected.size}</div>
                        <div className='text-2xl text-red-600 '>Total Price: {totalPrice} ฿</div>
                        <button onClick={() => handleOrder(cart.filter(c => selected.has(c.cart_id)))} className='px-7 py-2 rounded-lg bg-orange-300 text-white'>Buy Selected Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
