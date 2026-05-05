'use client'

import Image from "next/image";
import { use, useState, useEffect } from 'react';


export default function ItemCard(props) {
    const {data, handleDelete, handleEdit, handleStatus} = props
    const [ isOpen, setIsOpen ] = useState(false)
    console.log(props)
    return (
        <div className='justify-center m-auto font-[family-name:var(--font-geologica)]'>
          <div
            className="bg-gray-100 text-black
                        p-4 rounded-xl items-center
                        flex flex-col shadow-lg gap-4 m-auto">
            
            <p>{data?.List}</p>

            <div className="flex gap-2">
              <button 
                onClick={() => handleStatus(data)} 
                className={`border px-3 py-2 rounded ${data?.Status==true ? "bg-green-200" : "bg-red-200"}`}
                > {data?.Status==true?"Done":"Undone"}
              </button>
              <button 
                onClick={() => handleEdit(data)} 
                className="border px-3 py-2 rounded bg-orange-200 hover:bg-orange-300"
                >Edit
              </button>

              <button
                onClick={() => setIsOpen(true)}
                className="border px-3 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >Delete
              </button>
              {isOpen && (
                <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
                  <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                    <h1 className='text-center text-2xl'>Confirm Delete</h1>
                    <p>Are you sure to delete this list?</p>
                    <div className='flex gap-2 self-end'>
                      <button onClick={() => setIsOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                      <button onClick={() =>handleDelete(data)} className="border px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
    )
}

 