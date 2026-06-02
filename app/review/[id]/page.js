'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CiImageOff } from 'react-icons/ci'
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating'

import { FaFileImage } from "react-icons/fa6";
import moment from 'moment';

const OrderDetailPage = () => {
    const { id: ProductId } = useParams()
    const searchParams = useSearchParams()
    const OrderId = searchParams.get('orderId')

    const [product, setProduct] = useState(null)
    const [description, setDescription] = useState('')
    const [previewUrls, setPreviewUrls] = useState([])
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)

    const router = useRouter()

    useEffect(() => {
        if (!ProductId) return
        fetchProduct()
    }, [ProductId])

    async function fetchProduct() {
        const res = await fetch(`/api/products/${ProductId}`)
        const data = await res.json()
        setProduct(data)
    }

    const goOrderListPage = () => {
        router.push(`/order/${OrderId}`)
    }

    const handleAddEditProductInfo = async (e) => {
    if (e?.preventDefault) {
        e.preventDefault()
    } 
    
    try {
        const uploadedUrls = await uploadImages()
        const data = {
            imageUrl: uploadedUrls
        }
        
        const addProductReview = await fetch(`/api/reviews/${ProductId}`, {
                        method: 'POST', 
                        headers: {'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`},
                        body: JSON.stringify(data) })
        if (!addProductReview.ok) {
            const errBody = await addProductReview.json().catch(() => ({}));
            throw new Error(errBody.error ?? `Request failed: ${addProductReview.status}`);
        }
        const res = await addProductReview.json()
        console.log("Res of addProductReviewInfo: ", res)

        setDescription('')
        setFiles([])
        setPreviewUrls([])
        }
        catch (error) {
            console.log(error)
        }
    }

    const uploadImages = async () => {
        if (files.length === 0) return []
        const uploadedUrls = []
        try {
            for (const file of files) {
                const data = new FormData()
                data.set('file', file)
                const res = await fetch('/api/admin/inventories', {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: data
                })
                if (!res.ok) throw new Error(await res.text())
                const resImg = await res.json()
                if (!resImg.success || !resImg.filename) throw new Error('Upload failed: no filename returned')
                uploadedUrls.push(`/productUploads/${resImg.filename}`)
            }
        } catch (error) {
            console.log(error)
        }
        return uploadedUrls
    }

    function handleRemovePreview(i) {
        setPreviewUrls(prev => prev.filter((_, idx) => idx !== i))
        setFiles(prev => prev.filter((_, idx) => idx !== i))
    }


    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-geologica) bg-gray-50 min-h-screen">
            <div className='mt-10 px-5 sm:px-15'>
                <div className='flex flex-inline items-center'>
                    <button onClick={goOrderListPage} className='bg-white border-2 rounded-full'>
                        <IoChevronBack className='text-2xl'/>
                    </button>
                    <h1 className='text-4xl ml-3'>Review</h1>
                </div>
                <div className='gap-5 mt-10 mx-0 sm:mx-40'>
                    {product && (
                        <div className='border-2 border-gray-200 rounded-xl bg-white shadow-lg mb-5'>
                            <div className='grid grid-rows-1 grid-cols-4 gap-2 px-3 py-3'>
                                <div className='flex items-center'>
                                    <div className='mx-auto h-32 w-32 sm:w-55 sm:h-55'>
                                        {product.images?.[0]
                                            ? <img src={product.images[0]} alt={product.product_name} className='object-cover w-full h-full' />
                                            : <div className='flex justify-center items-center w-full h-full bg-gray-200'>
                                                <CiImageOff />
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className='col-span-2 flex flex-col justify-between'>
                                    <p className='text-lg sm:text-2xl'>{product.product_name}</p>
                                    <div className='text-sm sm:text-lg'>
                                        <p>{product.unit_price} ฿</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className='gap-5 mt-10 mx-0 sm:mx-40'>
                    <div className='border-2 border-gray-200 rounded-xl bg-white shadow-lg mb-5 p-4'>
                        <h1 className='text-2xl'>Overall Rating</h1>
                        <div className='flex justify-center'>
                            <StarRating/>
                        </div>
                        <p className='text-center mt-2'>Click to rate</p>

                        <div className='pt-4'>
                            <h3 className='text-lg'>What did you like about the product?</h3>
                            <div className='flex gap-2 pt-2'>
                                <button className='border rounded-lg bg-white px-3 py-1'>Great Quality</button>
                                <button className='border rounded-lg bg-white px-3 py-1'>Cute Design</button>
                                <button className='border rounded-lg bg-white px-3 py-1'>Worth the Price</button>
                                <button className='border rounded-lg bg-white px-3 py-1'>Exactly as expected</button>
                                <button className='border rounded-lg bg-white px-3 py-1'>Well Made</button>
                                <button className='border rounded-lg bg-white px-3 py-1'>Highly Recommended</button>
                            </div>

                        </div>
                        
                        <div className='pt-4'>
                            <h3 className='text-lg'>Product Review</h3>
                            <textarea 
                                className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2 resize-none min-h-36'
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                onInput={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = e.target.scrollHeight + 'px'
                                }}
                            />
                        </div>

                        <div className='pt-4'>
                            <h3 className='text-lg'>Review Photo</h3>
                            <div className='flex justify-center mx-auto mt-5 h-full'>
                            <div className="flex flex-col justify-center items-center gap-4">
                                {previewUrls.length > 0
                                    ? <div className='flex flex-wrap justify-center gap-2 '>
                                        {previewUrls.map(({image_url}, i) => (
                                            <div key={i} >
                                                <img src={image_url} alt="preview" className="object-cover w-24 h-24 cursor-pointer" onClick={() => fileInputRef.current.click()} />
                                                <button onClick={() => handleRemovePreview(i)}>X</button>
                                            </div>
                                        ))}
                                    </div>
                                    : <FaFileImage size={100} className="text-gray-400 cursor-pointer" onClick={() => fileInputRef.current.click()} />
                                }
                                <input
                                    type="file"
                                    multiple
                                    ref={fileInputRef}
                                    className="hidden"
                                    onChange={(e) => {
                                        const imgs = Array.from(e.target.files).map(f => ({ image_url: URL.createObjectURL(f) }))
                                        const selected = Array.from(e.target.files)
                                        setFiles(prev => [...prev, ...selected])
                                        setPreviewUrls(prev => [...prev, ...imgs])
                                    }}
                                />
                            </div>
                        </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OrderDetailPage
