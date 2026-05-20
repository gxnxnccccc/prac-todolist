'use client'

import NavBar from '../../components/NavBar';
import { use, useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import React from 'react'
import Link from 'next/link'

import { CiImageOff } from "react-icons/ci"; // no image 
import { FaRegHeart } from "react-icons/fa"; // blank heart
import { FaHeart } from "react-icons/fa6";   // full heart
import { FaStar } from "react-icons/fa";     // full star
import { FaCartShopping } from "react-icons/fa6"; // cart
import { RiFileList3Fill } from "react-icons/ri"; // history

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

  const goOrderPage = () => {
    router.push(`/order`)
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

    }
  }
  

  

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
        <div className='mt-10 px-15'>
          <div className='relative flex justify-center items-center'>
            <h1 className='text-4xl'>Products</h1>
            {/* <div className='absolute right-0 flex gap-2'>
              <button onClick={goWishlistPage} className='text-2xl cursor-pointer border-2 border-gray-300 py-1.5 px-3 rounded-xl bg-white'>
                <FaHeart className=''/>
              </button>
              <button onClick={goCartPage} className='text-2xl cursor-pointer border-2 border-gray-300 py-1.5 px-3 rounded-xl bg-white'>
                <FaCartShopping className=''/>
              </button>
              <button onClick={goOrderPage} className='text-2xl cursor-pointer border-2 border-gray-300 py-1.5 px-3 rounded-xl bg-white'>
                <RiFileList3Fill className=''/>
              </button>
            </div> */}
          </div>
          <div className='flex justify-center mt-10 mx-60 gap-4'>
              <button onClick={goWishlistPage} className='flex items-center justify-center gap-2 text-xl cursor-pointer border-2 border-gray-300 py-1.5 px-3 rounded-xl bg-white w-full'>
                <FaHeart /> Wishlist
              </button>
              <button onClick={goCartPage} className='flex items-center justify-center gap-2 text-xl cursor-pointer border-2 border-gray-300 py-1.5 px-3 rounded-xl bg-white w-full'>
                <FaCartShopping /> Cart
              </button>
              <button onClick={goOrderPage} className='flex items-center justify-center gap-2 text-xl cursor-pointer border-2 border-gray-300 py-1.5 px-3 rounded-xl bg-white w-full'>
                <RiFileList3Fill /> History
              </button>
            </div>
          <div className='gap-5 mt-10 mx-auto px-30 mb-10'>
              {/* <div className='p-3 bg-white rounded-2xl shadow-lg h-full'> */}
                <div className='grid grid-cols-4 gap-10 px-10 '>
                  {product.map((p) => (
                    <Link href={`/product/${p.product_id}`} key={p.product_id}>
                      <div key={p.product_id} className='mt-2 rounded-xl w-full h-70 px-4 bg-white shadow-lg'>
                        <div className='grid grid-rows-4 p-2 gap-2'>
                          <div>
                            {p.image_url
                              ? <div>
                                  <img src={p.image_url} alt={p.product_name} className='w-full h-50 object-cover mx-auto' />
                                </div>
                              : <div className='flex justify-center items-center w-full h-50 bg-gray-200'>
                                  <CiImageOff />
                                </div>
                            }
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
                              <button onClick={(e) => {
                                e.preventDefault()
                                toggleWishlist(p.product_id)
                              }}>
                                {wishlist.has(p.product_id) ? <FaHeart/> : <FaRegHeart/>}
                              </button>
                            </div>
                            {/* <div className='flex justify-self-end'>
                              <div className='text-red-600'>{p.price}฿</div>
                            </div> */}
                            <div className='flex justify-between items-center'>
                              <div className='inline-flex items-center gap-1'>
                                <FaStar className='w-3 h-3 text-yellow-400'/>5(67)
                              </div>
                              <div className='text-red-600'>{p.price}฿</div>
                            </div>
                          </div>
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
