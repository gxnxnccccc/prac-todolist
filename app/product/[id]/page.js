'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaStar } from 'react-icons/fa'
import { useUser } from '@/context/UserContext'

// Known section headers to detect inside flat-text descriptions
const SECTION_HEADERS = ['Features:', 'Perfect for:', 'Designed to remind you:']

function renderStructuredLines(lines) {
    const elements = []
    let bulletBuffer = []

    const flushBullets = (key) => {
        if (bulletBuffer.length === 0) return
        elements.push(
            <ul key={`ul-${key}`} className="list-disc ml-5 text-sm text-gray-500 mb-2 space-y-0.5">
                {bulletBuffer.map((item, idx) => <li key={idx}>{item}</li>)}
            </ul>
        )
        bulletBuffer = []
    }

    lines.forEach((line, i) => {
        const trimmed = line.trim()
        if (!trimmed) { flushBullets(i); return }

        if (/^[•\-·]\s*/.test(trimmed)) {
            bulletBuffer.push(trimmed.replace(/^[•\-·]\s*/, ''))
            return
        }

        flushBullets(i)

        if (trimmed.endsWith(':') && trimmed.split(' ').length <= 6) {
            elements.push(<p key={i} className="font-semibold text-sm text-gray-700 mt-3 mb-1">{trimmed}</p>)
            return
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
            elements.push(<p key={i} className="font-bold text-sm text-gray-700 mt-2">{trimmed.slice(2, -2)}</p>)
            return
        }
        elements.push(<p key={i} className="text-sm text-gray-500 mb-1.5">{trimmed}</p>)
    })

    flushBullets('end')
    return elements
}

function renderFlatText(text) {
    // Build a regex that captures the known section headers as split delimiters
    const escapedHeaders = SECTION_HEADERS.map(h => h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    const headerRegex = new RegExp(`(${escapedHeaders.join('|')})`)
    const parts = text.split(headerRegex).filter(Boolean)

    const elements = []
    let partIndex = 0

    // Everything before the first header → split into sentences as separate paragraphs
    if (parts.length > 0 && !SECTION_HEADERS.includes(parts[0])) {
        const sentences = parts[0].match(/[^.!?]*[.!?]+(?:\s|$)/g) || [parts[0]]
        sentences.forEach((s, idx) => {
            const t = s.trim()
            if (t) elements.push(<p key={`intro-${idx}`} className="text-sm text-gray-500 mb-2">{t}</p>)
        })
        partIndex++
    }

    // Alternating pairs: header, content
    while (partIndex < parts.length) {
        const header = parts[partIndex]
        const content = (parts[partIndex + 1] || '').trim()
        partIndex += 2

        elements.push(
            <p key={`h-${partIndex}`} className="font-semibold text-sm text-gray-700 mt-3 mb-1">{header}</p>
        )

        if (!content) continue

        // Split items: split where a lowercase/comma char is followed by space + Uppercase
        // then merge back any orphaned single-word fragments into the previous item
        const rawItems = content.split(/(?<=[a-z,s])\s+(?=[A-Z])/).filter(Boolean)
        const items = rawItems.reduce((acc, item) => {
            const wordCount = item.trim().split(/\s+/).length
            if (wordCount <= 1 && acc.length > 0) {
                acc[acc.length - 1] = acc[acc.length - 1] + ' ' + item.trim()
            } else {
                acc.push(item.trim())
            }
            return acc
        }, [])

        if (items.length > 1) {
            elements.push(
                <ul key={`ul-${partIndex}`} className="list-disc ml-5 text-sm text-gray-500 mb-2 space-y-0.5">
                    {items.map((item, idx) => <li key={idx}>{item}</li>)}
                </ul>
            )
        } else {
            elements.push(<p key={`c-${partIndex}`} className="text-sm text-gray-500 mb-2">{content}</p>)
        }
    }

    return elements
}

function renderDescription(text) {
    if (!text) return <span className="text-gray-400">No description available</span>

    const lines = text.split(/\n/)

    // Has proper newlines — use structured line renderer
    if (lines.length > 1) {
        return <>{renderStructuredLines(lines)}</>
    }

    // Flat text — use smart section/sentence parser
    return <>{renderFlatText(text)}</>
}

export default function ProductDetail() {
    const { id } = useParams()

    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [thumbOffset, setThumbOffset] = useState(0)
    
    const [addToCartAmount, setAddToCartAmount] = useState (0)
    const [qty, setQty] = useState(1)
    const [slideIndex, setSlideIndex] = useState(0)
    const [cartAddedAlert, setCartAddedAlert] = useState(false)
    const { refreshCart } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!id) return
        fetchProduct()
    }, [id])

    async function fetchProduct() {
        setLoading(true)
        const res = await fetch(`/api/products/${id}`)
        const data = await res.json()
        setProduct(data)
        setLoading(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
            </div>
        )
    }
    
    if (!product) return <div className='flex justify-center font-(family-name:--font-geologica)'>Loading...</div>

    const images = product.images ?? []
    const totalImage = images.length;
    const THUMBS_PER_PAGE = 4;
    const maxOffset = Math.max(0, totalImage - THUMBS_PER_PAGE)
    const canPrev = thumbOffset > 0;
    const canNext = thumbOffset < maxOffset;
    const visibleThumbs = images.slice(thumbOffset, thumbOffset + THUMBS_PER_PAGE);

    const prevSlide = () => {
        setSlideIndex(i => i === 0 ? product.images.length - 1 : i - 1)
    }

    const nextSlide = () => {
        setSlideIndex(i => i === product.images.length - 1 ? 0 : i + 1)
    }

    const handleSelectImage = (globalIndex) => {
        setSelectedImage(globalIndex)
        if (globalIndex < thumbOffset) {
            setThumbOffset(globalIndex)
        }
        else if (globalIndex >= thumbOffset + THUMBS_PER_PAGE) {
            setThumbOffset(globalIndex - THUMBS_PER_PAGE + 1)
        }
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
            await refreshCart()   // re-fetch the real count from the server
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



    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50 min-h-screen ">
            {/* <div>Product ID: {id}</div>
                <div>Product Name: {product.product_name}</div> */}
            <div className='bg-gray-200 h-full w-full'>
                <div className='mt-10 mb-10  mx-10 bg-white rounded-4xl shadow-2xl'>
                    <div className=' flex flex-col sm:flex-row  gap-2 '>

                        {/* left: รูป */}
                        {/* <div className='m-6 rounded text-center text-gray-500 '>
                            Product Preview
                            <div className='relative w-full h-96 mt-2 slider flex justify-center'>
                                <img className='w-100 h-100 object-cover' src={product.images[slideIndex]} alt={`slide-${slideIndex}`} />
                                <button onClick={prevSlide} className='absolute left-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-200 opacity-60 px-2 py-1'>&#10094;</button>
                                <button onClick={nextSlide} className='absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gray-200 opacity-60 px-2 py-1'>&#10095;</button>
                            </div>
                        </div> */}

                        <div className='flex flex-col items-center p-6 gap-4 border-gray-100'>
                            <div className='relative sm:w-100 sm:h-100 w-60 h-60 md:w-80 md:h-80 bg-gray-100 rounded-2xl overflow-hidden'>
                                {images[selectedImage] 
                                ? (
                                    <Image
                                        src={images[selectedImage]}
                                        alt={product.product_name}
                                        fill
                                        className='object-contain'
                                        />
                                    ) : (
                                        <div className='w-full h-full flex items-center justify-center text-gray-300 text-sm'>
                                            No preview image
                                        </div>
                                    )
                                }
                            </div>

                            <div className='flex items-center gap-1.5 w-full justify-center'>
                                <button
                                    onClick={() => setThumbOffset(o => Math.max(0, o - 1))}
                                    disabled={!canPrev}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all
                                        ${canPrev
                                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-700 cursor-pointer'
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    &#10094;
                                </button>
                                <div className='flex gap-1.5'>
                                    {visibleThumbs.map((url, i) => {
                                        const globalIndex = thumbOffset + i;
                                        return (
                                            <button
                                                key={globalIndex}
                                                onClick={() => handleSelectImage(globalIndex)}
                                                className={`relative w-12 h-12 rounded-lg border-2 overflow-hidden transition-all
                                                    ${selectedImage == globalIndex
                                                        ? 'border-gray-900 shadow-sm scale-105'
                                                        : 'border-transparent bg-gray-200 hover-gray-400'
                                                    }
                                                `}
                                            >
                                                <Image
                                                    src={url}
                                                    alt={`image ${globalIndex + 1}`}
                                                    fill
                                                    className='object-cover'
                                                />
                                            </button>
                                        )
                                    })}

                                </div>

                                <button
                                    onClick={() => setThumbOffset(o => Math.min(maxOffset, o + 1))}
                                    disabled={!canNext}
                                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs transition-all
                                        ${canNext
                                            ? 'bg-gray-200 hover:bg-gray-300 text-black cursor-pointer'
                                            : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                        }
                                    `}
                                >
                                    &#10095;
                                </button>
                            </div>
                            
                            <div className='flex gap-1'>
                                {images.map((_,i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSelectImage(i)}
                                        className={`rounded-full transition-all
                                            ${selectedImage === i
                                                ? 'w-4 h-1.5 bg-gray-900'
                                                : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'
                                            }
                                        `}
                                    >

                                    </button>
                                ))}

                            </div>
                        </div>

                        {/* right: name + stepper */}
                        <div className='gap-2'>
                            <div className='rounded row-span-2 p-6'>
                                <div className='text-3xl font-bold'>{product.product_name}</div>
                                <div className='text-xl inline-flex items-center gap-1'>
                                    <FaStar className='w-6 h-6 text-yellow-400'/>5.0
                                </div>
                                <div className='mt-3'>
                                    <p className='font-semibold text-sm text-gray-700 mb-1'>Description</p>
                                    <div>{renderDescription(product.description)}</div>
                                </div>
                            </div>
                            <div className='p-6 gap-3'>
                                <div className='grid grid-cols-2 gap-y-3 items-center'>
                                    <div>Remaining</div>
                                    <div>{product.stock_quantity} pieces</div>
                                    <div>Amount</div>
                                    <div className='inline-flex items-center border rounded bg-white w-fit'>
                                        <button onClick={() => setQty(q => Math.max(1, q - 1))} className='px-3 py-1'>-</button>
                                        <span className='px-4'>{qty}</span>
                                        <button onClick={() => setQty(q => q + 1)} className='px-3 py-1'>+</button>
                                    </div>
                                </div>
                                <div className='mt-5 flex gap-2'>
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

                        
                    </div>
                </div>
            </div>
        </div>
    )
}
