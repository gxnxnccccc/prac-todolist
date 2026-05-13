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

const productPage = () => {

  const [ allCategories, setAllCategories ] = useState(null)
  const [ product, setProduct ] = useState([])
  const [ allImage, setAllImages ] = useState([])

  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('Username')) {
      router.push('/login')
    }
    getProductInfo()
  }, [])

  const getProductInfo = async () => {
    try {
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
    }
    catch(error){
      console.log("getProductInfo error: ",error)
    }
  }

  

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
        <div className='mt-5 px-15 '>
            <h1 className='text-center mt-10 text-4xl'>Products</h1>
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
                                <div className='text-lg'>{p.product_name}</div>
                                <div className=''><FaRegHeart /></div>
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
