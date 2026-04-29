'use client'

import Image from "next/image";
import { use, useState, useEffect } from 'react';


export default function ItemCard(props) {
    const {data, handleDelete, handleEdit, handleStatus} = props
    console.log(props)
    return (
        <div
          className="bg-orange-200 text-black gap-6 mx-20 flex flex-col p-4 rounded-xl items-center shadow-lg">
              
            <p>{data?.List}</p>

            <div className="flex gap-2">
              <button onClick={() => handleStatus(data)} className="border px-3 py-2 rounded">{data?.Status==true?"Done":"Undone"}</button>
              <button onClick={() => handleDelete(data)} className="border px-3 py-2 rounded">Delete</button>
              <button onClick={() => handleEdit(data)} className="border px-3 py-2 rounded">Edit</button>
            </div>
          </div>
    )
}

 