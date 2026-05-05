'use client'

import Image from "next/image";
import { use, useState, useEffect } from 'react';


export default function ItemCard(props) {
    const {data, handleDelete, handleEdit, handleStatus} = props
    console.log(props)
    return (
        <div className='justify-center m-auto '>
          <div
            className="bg-gray-100 text-black
                        p-4 rounded-xl items-center
                        flex flex-col shadow-lg gap-4 m-auto">
            
            <p>{data?.List}</p>

            <div className="flex gap-2">
              <button onClick={() => handleStatus(data)} className="border px-3 py-2 rounded">{data?.Status==true?"Done":"Undone"}</button>
              <button onClick={() => handleDelete(data)} className="border px-3 py-2 rounded">Delete</button>
              <button onClick={() => handleEdit(data)} className="border px-3 py-2 rounded">Edit</button>
            </div>
          </div>
        </div>
    )
}

 