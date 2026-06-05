'use client'

import Link from 'next/link'
import { CiImageOff } from "react-icons/ci"
import { FaRegHeart } from "react-icons/fa"
import { FaHeart } from "react-icons/fa6"
import { FaStar } from "react-icons/fa"

export default function ProductItemCard({ p, wishlist, toggleWishlist, addProductToCart, cartAddedAlert = null }) {
  return (
    <Link href={`/product/${p.product_id}`}>
      <div className='mb-5'>
        <div className='relative'>
          {p.image_url
            ? <img src={p.image_url} alt={p.product_name} className='rounded-xl w-full h-100 object-cover mx-auto' />
            : <div className='rounded-xl flex justify-center items-center w-full h-80 bg-gray-200'>
                <CiImageOff />
              </div>
          }
          {p.stock_quantity === 0 && (
              <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80  rounded-full text-white p-3'>Out of Stock</div>
          )}
          <div className='absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center'>
            <button onClick={(e) => {
              e.preventDefault()
              toggleWishlist(p.product_id)
            }}>
              {wishlist.has(p.product_id) ? <FaHeart /> : <FaRegHeart />}
            </button>
          </div>
        </div>

        <div className='mt-2'>
          <div className='flex justify-between items-center'>
            <div className='text-md'>{p.product_name}</div>
            <div className='text-lg'>{p.unit_price}฿</div>
          </div>
          <div className='flex justify-between items-center'>
            <div className='inline-flex items-center gap-1'>
              <FaStar className='w-3 h-3 text-yellow-400' />{p.average_rating != null ? Number(p.average_rating).toFixed(1) : '0.0'}
            </div>
            {addProductToCart && p.stock_quantity > 0 && (
              <>
                <button
                  onClick={(e) => { e.preventDefault(); addProductToCart(p.product_id) }}
                  className='px-3 py-1 bg-black text-white rounded-2xl'
                >
                  Add to Cart
                </button>

                {cartAddedAlert && (
                  <div className='fixed bottom-5 right-5 bg-green-200 text-[#4f4f4f] px-4 py-2 rounded-xl shadow-lg'>
                    Added to Your Cart
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
