'use client'

import NavBar from '../../../components/NavBar';
import { use, useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import React from 'react'
import Link from 'next/link'

import { CiImageOff } from "react-icons/ci"; // no image 
import { FaRegHeart } from "react-icons/fa"; // blank heart
import { FaHeart } from "react-icons/fa6";   // full heart
import { FaStar } from "react-icons/fa";     // full star
import { FaCartShopping } from "react-icons/fa6"; // cart

const productPage = () => {

  const [ allCategories, setAllCategories ] = useState(null)
  const [ product, setProduct ] = useState([])
  const [ allImage, setAllImages ] = useState([])
  // const [ wishlist, setWishlist ] = useState(false)
  const [ wishlist, setWishlist ] = useState(new Set())

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

  const goCartPage = ()=> {
      const userId = localStorage.getItem('UserId')
      router.push(`/cart/${userId}`)
  }

  const goWishlistPage = () => {
    const userId = localStorage.getItem('UserId')
    router.push(`/wishlist/${userId}`)
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
              {/* <div className='p-3 bg-white rounded-2xl shadow-lg h-full'> */}
                <div className='grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-4'>
                  {product.filter(p => wishlist.has(p.product_id)).map((p) => (
                    <Link href={`/product/${p.product_id}`} key={p.product_id} className='mb-5'>
                          <div className='relative'>
                            {p.image_url
                              ? <div>
                                  <img src={p.image_url} alt={p.product_name} className='rounded-xl w-full h-100 object-cover mx-auto' />
                                </div>
                              : <div className='rounded-xl flex justify-center items-center w-full h-80 bg-gray-200'>
                                  <CiImageOff />
                                </div>
                            }
                            <div className='absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center'>
                              <button onClick={(e) => {
                                e.preventDefault()
                                toggleWishlist(p.product_id)
                              }}>
                                {wishlist.has(p.product_id) ? <FaHeart /> : <FaRegHeart />}
                              </button>
                            </div>
                          </div>

                          <div >
                            <div className='flex justify-between items-center'>
                              <div className='text-md'>{p.product_name}</div>

                              {/* 1 */}
                              {/* <div className=''><FaRegHeart /></div> */}

                              {/* 2 */}
                              {/* <button onClick={() => setWishlist(!wishlist)}>
                                {wishlist ? <FaHeart/> : <FaRegHeart/>}
                              </button> */}

                              {/* 3 */}
                              {/* <button onClick={(e) => {
                                e.preventDefault()
                                toggleWishlist(p.product_id)
                              }}>
                                {wishlist.has(p.product_id) ? <FaHeart/> : <FaRegHeart/>}
                              </button> */}
                              <div className='text-lg '>{p.unit_price}฿</div>
                            </div>
                            {/* <div className='flex justify-self-end'>
                              <div className='text-red-600'>{p.unit_price}฿</div>
                            </div> */}
                            <div className='flex justify-between items-center'>
                              <div className='inline-flex items-center gap-1'>
                                <FaStar className='w-3 h-3 text-yellow-400'/>5(67)
                              </div>
                              {/* <div className='text-red-600'>{p.unit_price}฿</div> */}
                            </div>
                          </div>
                        
                      
                    </Link> 
                  ))}
                </div>
                
            </div>
        </div>
    </div>
  )
}

export default productPage
