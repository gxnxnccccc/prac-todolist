'use client'

import { useState } from 'react'

export default function StarRating() {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)

    return (
        <div className='flex flex-row-reverse justify-center gap-4'>
            {[5,4,3,2,1].map((star) => (
                <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={`text-5xl transition-colors duration-300 cursor-pointer
                                ${(hover || rating) >= star 
                                    ? 'text-[#ffee8c]' 
                                    : 'text-[#ccc]'
                                } 
                    `}>
                        ★
                    </button>
            ))}
        </div>
    )
}