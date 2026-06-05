'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import { CiImageOff } from 'react-icons/ci'
import { IoChevronBack } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import StarRating from '@/components/StarRating'
import { TiTick } from "react-icons/ti";

import { FaFileImage } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import moment from 'moment';

const OrderDetailPage = () => {
    const { id: ProductId } = useParams()
    const searchParams = useSearchParams()
    const OrderId = searchParams.get('orderId')

    const [product, setProduct] = useState(null)
    const [review, setReview] = useState(null)
    const [imageUrl, setImageUrl] = useState(null)
    const [description, setDescription] = useState('')
    const [reviewComment, setReviewComment] = useState('')
    const [previewUrls, setPreviewUrls] = useState([])
    const [files, setFiles] = useState([])
    const fileInputRef = useRef(null)
    const [reviewAddedAlert, setReviewAddedAlert] = useState(false)
    const [selectedLike, setSelectedLike] = useState(new Set())

    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [starRating, setStarRating] = useState(0)

    const router = useRouter()

    useEffect(() => {
        if (!ProductId) return
        fetchProduct(),
        fetchReview()
    }, [ProductId])

    const label = ['Great Quality', 'Cute Design', 'Worth the Price', 'Exactly as expected', 'Well Made', 'Highly Recommended']
    const toggleSelectedLike = (label) => {
        setSelectedLike(prev => {
            const next = new Set(prev)
            next.has(label)
                ? next.delete(label)
                : next.add(label)
            return next
        })
    }

    async function fetchProduct() {
        const res = await fetch(`/api/products/${ProductId}`)
        const data = await res.json()
        setProduct(data)
    }

    async function fetchReview() {
        const userId = localStorage.getItem('UserId')
        const res = await fetch(`/api/reviews/${ProductId}?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
        const data = await res.json()
        console.log('fetchReview response:', data)
        setReview(data.reviewByUser)
    }

    const goOrderListPage = () => {
        router.push(`/order/${OrderId}`)
    }

    const getProfileLogo = async (authToken) => {
        const userId = localStorage.getItem('UserId')
        if (!userId) return
        try {
            const res = await fetch(`/api/profiles?userId=${userId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
            const data = await res.json()
            if (data[0]?.Profile_Image) {
                setImageUrl(data[0].Profile_Image)
            }
        } catch (error) {
            console.log("Profile error:", error)
        }
    }

    const handleAddReviewInfo = async (e) => {
    if (e?.preventDefault) {
        e.preventDefault()
    } 
    
    try {
        // const uploadedUrls = await uploadImages()
        const data = new FormData()
        files.forEach(f => data.append('files', f))
        data.append('userId', localStorage.getItem('UserId'))
        data.append('productId', ProductId)
        data.append('reviewComment', reviewComment)
        data.append('starRating', starRating)
        data.append('selectedLike', JSON.stringify([...selectedLike]))
        
        const addProductReview = await fetch(`/api/reviews/${ProductId}`, {
                        method: 'POST', 
                        headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`},
                        body: data })
        if (!addProductReview.ok) {
            const errBody = await addProductReview.json().catch(() => ({}));
            throw new Error(errBody.error ?? `Request failed: ${addProductReview.status}`);
        }
        const res = await addProductReview.json()
        console.log("Res of addProductReviewInfo: ", res)

        setStarRating(0)
        setSelectedLike(new Set()) // change to blank set(or blank array)
        setTimeout(() => {setReviewAddedAlert(true)}, 2000)
        setReviewComment('')
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
                const res = await fetch(`/api/reviews/${ProductId}`, {
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
                            <div className='flex flex-col sm:flex-row p-4 gap-2'>
                                <div className='flex items-center'>
                                    <div className='mx-auto h-75 w-75 sm:w-55 sm:h-55'>
                                        {product.images?.[0]
                                            ? <img src={product.images[0]} alt={product.product_name} className='object-cover w-full h-full' />
                                            : <div className='flex justify-center items-center w-full h-full bg-gray-200'>
                                                <CiImageOff />
                                            </div>
                                        }
                                    </div>
                                </div>

                                <div className='col-span-2 flex flex-col justify-between'>
                                    <div className='text-2xl'>
                                        {product.product_name}
                                        <p className='text-xs'>{product.description}</p>
                                    </div>
                                    
                                    <div className='text-lg mt-2'>
                                        <p>Price: {product.unit_price} ฿</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className='gap-5 mt-10 mx-0 sm:mx-40'>
                    <div className='border-2 border-gray-200 rounded-xl bg-white shadow-lg mb-5 p-4'>
                        <h1 className='text-2xl'>Overall Rating</h1>
                        <div className='flex justify-center text-5xl mt-2'>
                            <StarRating 
                                value={starRating} 
                                onChange={setStarRating} 
                            />
                        </div>
                        <p className='text-center mt-2'>Click to rate</p>

                        <div className='pt-4'>
                            <h3 className='text-lg'>What did you like about the product?</h3>
                            <div className='flex gap-2 pt-2 flex-wrap'>
                                {label.map(label => (
                                    <button
                                        key={label}
                                        onClick={() => toggleSelectedLike(label)}
                                        className={selectedLike.has(label)
                                            ? 'border rounded-lg bg-black text-white px-3 py-1'
                                            : 'border rounded-lg bg-white text-black px-3 py-1'
                                        }
                                    >
                                        {selectedLike.has(label)
                                            ? <span className='inline-flex items-center gap-1'>{label} <TiTick/></span>
                                            : label
                                        }
                                    </button>
                                ))}
                            </div>

                        </div>
                        
                        <div className='pt-4'>
                            <h3 className='text-lg'>Product Review</h3>
                            <textarea 
                                className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2 resize-none min-h-36'
                                value={reviewComment}
                                onChange={(e) => setReviewComment(e.target.value)}
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

                                <div className='p-3 mt-2'>
                                    <button 
                                        className='flex justify-center mx-auto p-3 bg-gray-200 rounded w-full py-2 text-center'
                                        onClick={handleAddReviewInfo}
                                        disabled={starRating === 0}
                                        >
                                        Submit Review
                                    </button>
                                    {reviewAddedAlert && (
                                                <div className='fixed bottom-5 right-5 bg-green-200 text-[#4f4f4f] px-4 py-2 rounded-xl shadow-lg'>
                                                    Review Added
                                                </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <div className='gap-5 mt-10 mx-0 sm:mx-40'>
                    <div className='border-2 border-gray-200 rounded-xl bg-white shadow-lg mb-5 p-4'>
                        <h1 className='text-2xl'>Your Previous Review</h1>
                        <div>
                            {review?.map((r) => (
                                <div key={r.review_id} className='mt-4'>
                                    <div className='inline-flex gap-3 items-center'>
                                        {r.Profile_Image
                                            ? <img src={r.Profile_Image} alt="profile_img" className="rounded-full object-cover w-10 h-10" />
                                            : <FaUserCircle size={80} className="text-gray-400" />
                                        }
                                        <div>{r.Username}</div>
                                    </div>
                                    
                                    <StarRating className='flex justify-end text-2xl' value={r.star_rating} readOnly />
                                    <div className='flex gap-2'>
                                        {JSON.parse(r.like_select || '[]').map((like, i) => (
                                            <span key={i} className='border rounded-full px-3 py-1 text-sm text-gray-500 bg-gray-100'>{like}</span>
                                        ))}
                                    </div>
                                    <div>{r.review_comment}</div>
                                    <div className='flex flex-wrap gap-2 mt-2'>
                                        {(() => { try { const v = JSON.parse(r.review_img || '[]'); return Array.isArray(v) ? v : [v] } catch { return r.review_img ? [r.review_img] : [] } })().map((url, i) => (
                                            <img key={i} src={url} alt="review" className='w-30 h-30 object-cover rounded' />
                                        ))}
                                    </div>
                                    <div className='mt-2'>{moment.utc(r.review_date).format('DD/MM/YYYY, h:mm:ss')}</div>
                                    <hr className="border-t border-gray-300 mt-2" />
                                    
                                </div>
                            ))}
                        </div>


                    </div>
                </div>

            </div>
        </div>
    )
}

export default OrderDetailPage
