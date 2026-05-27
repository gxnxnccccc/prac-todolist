'use client'

import NavBar from '../../../components/NavBar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import React from 'react'
import ProductItemCard from '../../../components/Product_ItemCard'

const productPage = () => {

  const [ allCategories, setAllCategories ] = useState(null)
  const [ product, setProduct ] = useState([])
  const [ allImage, setAllImages ] = useState([])
  // const [ wishlist, setWishlist ] = useState(false)
  const [ wishlist, setWishlist ] = useState(new Set())
  const [cartAddedAlert, setCartAddedAlert] = useState(false)

  const { refreshCart } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('Username')) {
      router.push('/login')
    }
    getProductInfo()
  }, [])

  const getProductInfo = async () => {
    try {
      console.log("token: ", localStorage.getItem('token'))
      const res = await fetch(`/api/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `getProductInfo Request failed: ${res.status}`)
      }

      const data = await res.json()
      
      setAllCategories(data.categories)
      setProduct(data.products)
      setAllImages(data.all_images ?? [])
      setWishlist(new Set(data.wishlists.map(w => w.product_id)))
    }
    catch(error){
      console.log("getProductInfo error: ",error)
    }
  }

  const addProductToCart = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error)
      }
      await refreshCart()
      setCartAddedAlert(true)
      setTimeout(() => setCartAddedAlert(false), 2000)
    }
    catch (error) {
      console.error('addProductToCart error:', error)
    }
  }

  const toggleWishlist = async (productId) => {
    const isWishlisted = wishlist.has(productId)
  
    try {
      await fetch('/api/products', {
        method: isWishlisted ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ product_id: productId })
      })
      
      setWishlist(prev => {
        const next = new Set(prev)
        if (next.has(productId)) {
          next.delete(productId)
        }
        else {
          next.add(productId)
        }
        return next
      })
    }
    catch (error) {
      console.log("toggleWishlist error: ", error)
    }
  } 
  

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen">
        <div className='px-8 mt-10 md:px-15 '>
          <div className='relative flex justify-center items-center'>
            <h1 className='flex justify-center text-4xl'>Wishlists</h1>
          </div>
          
          <div className='gap-5 mt-10 mx-auto mb-10'>
            <div className='grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-4'>
              {product.filter(p => wishlist.has(p.product_id)).map((p) => (
                <ProductItemCard
                  key={p.product_id}
                  p={p}
                  wishlist={wishlist}
                  toggleWishlist={toggleWishlist}
                  addProductToCart={addProductToCart}
                />
              ))}
            </div>
            {cartAddedAlert && (
              <div className='fixed bottom-5 right-5 bg-green-200 text-[#4f4f4f] px-4 py-2 rounded-xl shadow-lg'>
                Added to Your Cart
              </div>
            )}
          </div>
        </div>
    </div>
  )
}

export default productPage
