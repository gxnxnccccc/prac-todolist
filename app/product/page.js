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
import { AiOutlineSearch } from 'react-icons/ai'; // search

const productPage = () => {

  const [ allCategories, setAllCategories ] = useState(null)
  const [ product, setProduct ] = useState([])
  const [ allProduct, setAllProduct] = useState([])
  const [ allImage, setAllImages ] = useState([])
  const [ selectedCategoryId, setSelectedCategoryId ] = useState('')
  // const [ wishlist, setWishlist ] = useState(false)
  const [ wishlist, setWishlist ] = useState(new Set())

  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('Username')) {
      router.push('/login')
    }
    getAllProductInfo()
  }, [])

  const getAllProductInfo = async () => {
    try {
      console.log("token: ", localStorage.getItem('token'))
      const res = await fetch(`/api/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`}
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error ?? `getAllProductInfo Request failed: ${res.status}`)
      }

      const data = await res.json()
      
      setAllCategories(data.categories)
      setAllProduct(data.products)
      setProduct(data.products)
      setAllImages(data.all_images ?? [])
      setWishlist(new Set(data.wishlists.map(w => w.product_id)))
    }
    catch(error){
      console.log("getAllProductInfo error: ",error)
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
  
  const handleSearch = (e) => {
    const value = e.target.value
    if (value.length > 0) {
      const search = allProduct.filter(({ product_name }) =>
        product_name.toLowerCase().includes(value.toLowerCase())
      )
      setProduct(search)
    } else {
      setProduct(allProduct)
    }
  }

  const handleCategoryFilter = (e) => {
    const value = e.target.value
    setSelectedCategoryId(value)
    if (value) {
      const filtered = allProduct.filter(p => String(p.category_id) === value)
      setProduct(filtered)
    } else {
      setProduct(allProduct)
    }
  }

  

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen">
        <div className='px-8 mt-10 md:px-15 '>
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
          <form className='relative mt-3  sm:w-1/3 mx-auto'>
            <div className='relative'>
                <input
                    type="search"
                    placeholder='Type here!'
                    className='border-b w-full p-4 mt-5 outline-none'
                    onChange={handleSearch}/>
                    <button className='absolute right-2 top-1/2 -translate-y-1/2 p-4 mt-2.5 bg-gray-200 rounded-full'>
                        <AiOutlineSearch/>
                    </button>
              </div>
          </form>
          <div className='flex justify-center mt-10 sm:mx-60 gap-4'>
              <button onClick={goWishlistPage} className='flex items-center justify-center gap-2 text-lg cursor-pointer border border-[#4f4f4f] py-1.5 px-3 rounded-xl bg-white w-full hover:bg-gray-300 shadow-md'>
                <FaHeart /> Wishlist
              </button>
              <button onClick={goCartPage} className='flex items-center justify-center gap-2 text-lg cursor-pointer border border-[#4f4f4f] py-1.5 px-3 rounded-xl bg-white w-full hover:bg-gray-300 shadow-md'>
                <FaCartShopping /> Cart
              </button>
              <button onClick={goOrderPage} className='flex items-center justify-center gap-2 text-lg cursor-pointer border border-[#4f4f4f] py-1.5 px-3 rounded-xl bg-white w-full hover:bg-gray-300 shadow-md'>
                <RiFileList3Fill /> History
              </button>
          </div>
          <form className='flex justify-center mt-10 mx-3 sm:mx-60 gap-4'>
              {/* <div className='flex justify-center mx-auto mt-3 py-3 '> */}
                  {/* <select name="role" className='mt-2 border-2 border-gray-200 p-2 rounded-xl bg-white' defaultValue="" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}> */}
                  <select name="role" className='mt-2 border border-[#4f4f4f] shadow-md p-2 rounded-xl bg-white w-full' value={selectedCategoryId} onChange={handleCategoryFilter}>
                      <option value="">All Categories</option>
                      {allCategories && allCategories.map((u, i) => (
                          <option key={i} value={String(u.category_id)}>{u.all_category}</option>
                      ))}
                  </select>
              {/* </div> */}
          </form>
          <div className='mt-10 mx-auto '>
              {/* <div className='p-3 bg-white rounded-2xl shadow-lg h-full'> */}
                <div className='grid grid-cols-1 gap-x-10 gap-y-2 md:grid-cols-4'>
                  {product.map((p) => (
                    <Link href={`/product/${p.product_id}`} key={p.product_id}>
                      <div key={p.product_id} className='mb-5'>
                        <div className='relative'>
                          {p.image_url
                            ? <img src={p.image_url} alt={p.product_name} className='rounded-xl w-full h-100 object-cover mx-auto' />
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
                            <div className='text-lg '>{p.price}฿</div>
                          </div>
                          {/* <div className='flex justify-self-end'>
                            <div className='text-red-600'>{p.price}฿</div>
                          </div> */}
                          <div className='flex justify-between items-center'>
                            <div className='inline-flex items-center gap-1'>
                              <FaStar className='w-3 h-3 text-yellow-400'/>5(67)
                            </div>
                            {/* <div className='text-red-600'>{p.price}฿</div> */}
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
