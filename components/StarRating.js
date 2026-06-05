'use client'

import { useState } from 'react'

export default function StarRating({ value = 0, onChange, readOnly = false, className = '' }) {
    const [hover, setHover] = useState(0)

    return (
        <div className={`flex flex-row-reverse ${className}`}>
            {[5,4,3,2,1].map((star) => (
                <button
                    key={star}
                    onClick={() => !readOnly && onChange?.(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className={`transition-colors duration-300 cursor-pointer
                                ${(hover || value) >= star
                                    ? 'text-yellow-400' 
                                    : 'text-[#ccc]'
                                } 
                    `}>
                        ★
                    </button>
            ))}
        </div>
    )
}