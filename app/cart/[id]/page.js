'use client'

import NavBar from '../../../components/NavBar';
import { use, useState, useEffect } from 'react'; 
import { useRouter, useParams } from "next/navigation";
// import { useRouter } from 'next/router';
import React from 'react'
import Link from 'next/link'
import { CiImageOff } from "react-icons/ci"




const cartPage = () => {

    const { id } = useParams() // userId from goCartPage function
    const [cart, setCart] = useState([])
    const [qty, setQty] = useState([])

    useEffect(() => {
        if (!id) return


        async function fetchCart() {
            const res = await fetch(`/api/carts/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    })
            console.log("RES:", res)
            const data = await res.json()
            console.log("cart data is ", data)
            setCart(data.carts ?? [])
            console.log("Check carts: ", cart)
        }

            fetchCart()
        }, [id])

        async function changeAmount(item, delta){
            const newAmount = Math.max(1, item.buy_amount + delta)
            try{
                // let newCart = cart.map((item) => {
                // if (e.card_id == item.card_id) {
                //     item.buy_amount++;
                //     return item
                // }
                // else {
                //     return item
                // }
                // })
                const res = await fetch(`/api/carts/${id}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json',
                                                'Authorization': `Bearer ${localStorage.getItem('token')}` },
                                        body: JSON.stringify({
                                            cart_id: item.cart_id,
                                            buy_amount: newAmount
                                        })
                })
                if (!res.ok) {
                    throw new Error(await res.text())
                }
                // setCart(newCart)
                setCart(cart.map(b => 
                    b.cart_id === item.cart_id 
                    ? { ...b, buy_amount: newAmount }
                    : b
                ))
            }
            catch (error) {
                console.log("fail to modify buy_amount: ", error)
            }
            
        }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
            <div className='mt-10 px-15'>
                <div className='relative flex justify-center items-center'>
                    <h1 className='text-4xl'>My Cart</h1>
                </div>
                <div className='gap-5 mt-10 mx-40 mb-10 '>
                    {cart.map((c) => (
                        <div key={c.cart_id} className='mt-2 border-2 border-gray-200 rounded-xl w-full px-4 bg-white shadow-lg mb-5'>
                            <div className='grid grid-rows-1 grid-cols-5 p-2 gap-2'>
                                <div>
                                    {c.image_url
                                        ? <div>
                                            <img src={c.image_url} alt={c.product_name} className='object-cover mx-auto w-40 ' />
                                        </div>
                                        : <div className='flex justify-center items-center w-full h-50 bg-gray-200'>
                                            <CiImageOff />
                                        </div>
                                    }
                                </div>
                                <div className='col-span-4 grid grid-rows-2'>
                                    {/* <div className='grid grid-rows-2 gap-2'> */}
                                        <div className='h-full'>
                                            <h3 className='text-3xl text-bold'>{c.product_name}</h3>
                                            <div className='text-gray-400'>Type: {c.category_name}</div>
                                        </div>
                                        <div className='h-full grid grid-cols-5 gap-2 '>
                                            <div className='text-right col-span-4 my-auto'>
                                                <div className='inline-flex items-center border rounded bg-white w-fit'>
                                                    {/* <input
                                                        type='number'
                                                        value={c.buy_amount}
                                                        step="1"
                                                        onChange={changeAmount}
                                                    /> */}
                                                    <button onClick={() => changeAmount(c, -1)} className='px-3 py-1'>-</button>
                                                    <span className='px-4'>{c.buy_amount}</span>
                                                    <button onClick={() => changeAmount(c, +1)} className='px-3 py-1'>+</button>
                                                </div>
                                                {/* Amount: {c.buy_amount} */}
                                                <br/> 
                                                Price per each: {c.price} ฿ <br/>
                                                <div className='text-xl'>Total Price: {c.price * c.buy_amount} ฿</div>
                                            </div>
                                            <div className='relative'>
                                                <div className='absolute bottom-0 right-4 flex flex-col gap-2'>
                                                    <button className='px-7 rounded-lg bg-red-500 text-white'>Cancel</button> 
                                                    <button className='px-7 py-2 rounded-lg bg-orange-300 text-white'>Buy Now</button>
                                                </div>
                                            </div>
                                        </div>
                                    {/* </div> */}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default cartPage
