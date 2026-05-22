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
    const { cartAmount, setCartAmount } = useUser()

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
            setIsCancelOpen(false)
            setCartAmount(cartAmount-1)
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
        .reduce((sum, c) => sum + c.price * c.buy_amount, 0)

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
                        buy_amount: item.buy_amount
                    }))
                })
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            setSelected(new Set())
            setIsBuyOpen(false)
            fetchCart()
        } catch (error) {
            console.log(error)
        }
    }

    console.log("CART:", cart)

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen">
            <div className='mt-10 px-15'>
                <div className='relative flex justify-center items-center'>
                    <h1 className='text-4xl'>My Cart</h1>
                </div>
                <div className='gap-5 mt-10 mx-40 mb-10'>
                    {cart.map((c) => {
                        const cartId_price = c.price * c.buy_amount
                        
                        return (
                        <div key={c.cart_id} className='mt-2 border-2 border-gray-200 rounded-xl w-full px-4 bg-white shadow-lg mb-5'>
                            <div className='grid grid-rows-1 grid-cols-5 p-2 gap-2'>
                                <div className='flex justify-between w-full items-center'>
                                    <button onClick={(e) => {
                                        e.preventDefault()
                                        toggleSelected(c.cart_id)
                                    }} className='text-3xl'>
                                        {selected.has(c.cart_id) ? <MdCheckBox /> : <MdCheckBoxOutlineBlank />}
                                    </button>
                                    <div className='mx-auto'>
                                        <div className='flex flex-row h-40 w-40 '>
                                            {c.image_url
                                                ? <img src={c.image_url} alt={c.product_name} className='object-cover  ' />
                                                : <div className='flex justify-center items-center h-full w-full bg-gray-200'>
                                                    <CiImageOff />
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className='col-span-4 grid grid-rows-2'>
                                    <div className='h-full'>
                                        <h3 className='text-3xl text-bold'>{c.product_name}</h3>
                                        <div className='text-[#9d9ca2]-400'>Type: {c.category_name}</div>
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
                                            <div className='text-xl'>Total Price: {cartId_price} ฿</div>
                                        </div>
                                        <div className='relative'>
                                            <div className='absolute bottom-0 right-4 flex flex-col gap-2'>
                                                <button onClick={() => {setIsCancelOpen(true); setItemToDelete(c)}} className='px-7 rounded-lg bg-red-500 text-white'>Cancel</button>
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
                                                <button onClick={() => {setIsBuyOpen(true)}} className='px-7 py-2 rounded-lg bg-orange-300 text-white'>Buy Now</button>
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
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )})}
                    <div className='flex flex-col items-end gap-4 mt-4'>
                        <div>Selected Items: {selected.size}</div>
                        <div className='text-2xl text-red-600'>Total Price: {totalPrice} ฿</div>
                        <button onClick={() => handleOrder(cart.filter(c => selected.has(c.cart_id)))} className='px-7 py-2 rounded-lg bg-orange-300 text-white'>Buy Selected Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CartPage
