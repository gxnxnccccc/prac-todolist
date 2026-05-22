'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useParams } from "next/navigation";
import { FaStar } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';

export default function ProductDetail() {
    const { id } = useParams()
    const [product, setProduct] = useState(null)
    const [qty, setQty] = useState(1)
    const [slideIndex, setSlideIndex] = useState(0)
    // const [buyAmount, setBuyAmount] = useState(1)
    const [addToCartAmount, setAddToCartAmount] = useState(0)
    const { cartAmount, setCartAmount } = useUser()
    const [cartAddedAlert, setCartAddedAlert] = useState(false)

    const router = useRouter();

    useEffect(() => {
        if (!id) return

        async function fetchProduct() {
            const res = await fetch(`/api/products/${id}`)
            const data = await res.json()
            setProduct(data)
        }

        fetchProduct()
    }, [id])

    const prevSlide = () => {
        setSlideIndex(i => i === 0 ? product.images.length - 1 : i - 1)
    }

    const nextSlide = () => {
        setSlideIndex(i => i === product.images.length - 1 ? 0 : i + 1)
    }

    const addProductToCart = async () => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    productId: product.product_id,
                    quantity: qty
                })
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error)
            }

            const data = await res.json()
            console.log('Added to cart:', data)

            setAddToCartAmount(qty)
            setCartAmount(cartAmount+1)
            setCartAddedAlert(true)
            
            setTimeout(() => {
                router.push('/product')
                setCartAddedAlert(false)
                
            }, 2000)
        }
        catch (error) {
            console.error('addProductToCart error:', error)
        }
    }

    if (!product) return <div className='flex justify-center font-[family-name:var(--font-geologica)]'>Loading...</div>

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen ">
            {/* <div>Product ID: {id}</div>
                <div>Product Name: {product.product_name}</div> */}
            <div className='bg-gray-200 h-full w-full'>
                <div className='mt-10 mb-10  mx-10 bg-white rounded-4xl shadow-2xl'>
                    <div className='grid grid-cols-2  gap-2 '>
                        {/* ซ้าย: name + stepper */}
                        <div className='grid grid-rows-3 gap-2'>
                            <div className='rounded row-span-2 p-6'>
                                <div className='text-3xl font-bold'>{product.product_name}</div>
                                <div className='text-xl inline-flex items-center gap-1'>
                                    <FaStar className='w-6 h-6 text-yellow-400'/>5.0
                                </div>
                                <div className='mt-3'>Description 
                                    <div className='text-[#9d9ca2]-500'>{product.description}</div>
                                </div>
                            </div>
                            <div className='p-6 rounded flex flex-col gap-3'>
                                <div className='grid grid-cols-2 gap-y-3 items-center'>
                                    <div>Remaining</div>
                                    <div>{product.quantity} pieces</div>
                                    <div>Amount</div>
                                    <div className='inline-flex items-center border rounded bg-white w-fit'>
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className='px-3 py-1'>-</button>
                                        <span className='px-4'>{qty}</span>
                                        <button onClick={() => setQty(q => q + 1)} className='px-3 py-1'>+</button>
                                    </div>
                                </div>
                                <div className='flex gap-2 mt-auto'>
                                    <button onClick={addProductToCart} className='bg-white w-full py-2 border-2 border-gray-300 hover:bg-gray-300'>Add to Cart</button>
                                    {cartAddedAlert && (
                                        <div className='fixed bottom-5 right-5 bg-green-200 text-[#4f4f4f] px-4 py-2 rounded-xl shadow-lg'>
                                            Added to Your Cart
                                        </div>
                                    )}
                                    <button className='bg-gray-300 text-[#4f4f4f] w-full py-2 hover:bg-gray-500 hover:text-gray-100'>Buy Now</button>
                                </div>
                            </div>
                        </div>

                        {/* ขวา: รูป */}
                        <div className='p-6 rounded text-center text-gray-500'>
                            Product Preview
                            <div className='relative w-full h-96 mt-2 slider flex justify-center'>
                                <img className='w-100 h-100 object-cover' src={product.images[slideIndex]} alt={`slide-${slideIndex}`} />
                                <button onClick={prevSlide} className='absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-200 opacity-60 px-2 py-1'>&#10094;</button>
                                <button onClick={nextSlide} className='absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-200 opacity-60 px-2 py-1'>&#10095;</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
