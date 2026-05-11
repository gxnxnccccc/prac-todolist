'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { FaFileImage } from "react-icons/fa6";

const adminProductPage = () => {
    const [ previewUrl, setPreviewUrl ] = useState(null)
    const [ imageUrl, setImageUrl ] = useState(null)
    const fileInputRef = useRef(null)
    const [ savedAlert, setSavedAlert ] = useState(false)
    const [ file, setFile ] = useState(null)
    const [ saved, setSaved ] = useState(false)
    const [ allCategories, setAllCategories ] = useState(null)
    const [ text, setText ] = useState('')

    const [ productName, setProductName ] = useState('')
    const [ categoryId, setCategoryId ] = useState('')
    const [ description, setDescription ] = useState('')
    const [ price, setPrice] = useState('')
    const [ quantity, setQuantity ] = useState('')

    const router = useRouter()

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
            router.push('/login')
        }
        getProductInfo();
    }, [])

    const onSubmit = async (e) => {
        e.preventDefault()

        if (!file) return

        try {
            const data = new FormData()
            data.set('file', file)
            data.set('userId', localStorage.getItem('UserId'))

            const res = await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            })
            if (!res.ok) {
                throw new Error(await res.text())
            }
            const resImg = await res.json()
            setImageUrl(`/uploads/${resImg.filename}`)
            setSaved(true)
            setSavedAlert(true)
            setTimeout(() => setSavedAlert(false), 2000) 
        } catch (error) {
            console.log(error)
        }
    }

    const getProductInfo = async () => {
        try {
            const res = await fetch(`/api/admin/products`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.error ?? `Request failed: ${res.status}`)
            }
            const data = await res.json()
            console.log('All categories: ', data)
            setAllCategories(data)
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleAddEditProductInfo = async (e) => {
        e.preventDefault();
        const data = {
            productName: productName,
            categoryId: categoryId,
            description: description,
            price: price,
            quantity: quantity,
            imageUrl: imageUrl
        }
        
        try {
            
            const addProduct = await fetch(`/api/admin/products`, {
                            method: 'POST', 
                            headers: {'Content-Type': 'application/json',
                                      'Authorization': `Bearer ${localStorage.getItem('token')}`},
                            body: JSON.stringify(data) })
            if (!addProduct.ok) {
                const errBody = await addProduct.json().catch(() => ({}));
                throw new Error(errBody.error ?? `Request failed: ${addProduct.status}`);
            }
            const res = await addProduct.json()
            console.log("Res of addProductInfo: ", res)
            getProductInfo();
            setText('');
        }
        catch (error) {
            console.log(error)
        }
        
    }

    const handleAddEditProductInfoo = () => {

    }

    return (
        <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] bg-gray-50">
            <div className='mt-5 px-15 '>
                <h1 className='text-center mt-10 text-4xl'>Product List</h1>
                <div className='grid grid-cols-2 grid-rows-2 gap-5 mt-10 mx-auto px-15'>
                    <div className='p-3 bg-white rounded-2xl shadow-lg'>

                        <h1 className='text-center text-2xl pt-5'>Add Product</h1>

                        <div className='p-3'>
                            <h3>Product Image</h3>
                            <div className='flex justify-center mx-auto '>
                                {/* <p className='mx-auto'>Add photo</p> */}
                                <form onSubmit={onSubmit} className="flex flex-col items-center gap-4">
                                    <div className="flex justify-center items-center">
                                        {/* previewUrl - just picked image */}
                                        {/* imageUrl   - saved image in db */}
                                        {previewUrl || imageUrl  
                                            ? <div className='flex justify-center w-100 h-100 mt-4'>
                                                <img src={previewUrl || imageUrl} alt="profile_img" className="object-cover cursor-pointer" onClick={() => fileInputRef.current.click()} />
                                            </div>
                                            : <FaFileImage size={100} className="text-gray-400 cursor-pointer" onClick={() => fileInputRef.current.click()} />
                                        }
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            onChange={(e) => {
                                                const selected = e.target.files?.[0]
                                                setFile(selected)
                                                if (selected) setPreviewUrl(URL.createObjectURL(selected))
                                            }}
                                        />
                                    </div>
                                    {previewUrl && !saved &&
                                            <button type="submit" className="border px-3 py-2 rounded bg-blue-200">Add Photo</button>
                                    }
                                    {savedAlert && (
                                        <div className='fixed bottom-5 right-5 bg-green-200 text-black px-4 py-2 rounded-xl shadow-lg'>
                                            Added
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                        
                        <div className='p-3'>
                            <h3>Product Name</h3>
                            <input 
                                type="text"
                                onChange={(e) => setProductName(e.target.value)}
                                className='mt-2 border-2 border-gray-200 rounded w-full px-2 py-2'
                            />
                        </div>

                        <div className='p-3'>
                            <h3>Description</h3>
                            <textarea 
                                className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2 resize-none min-h-24'
                                onChange={(e) => setDescription(e.target.value)}
                                onInput={(e) => {
                                    e.target.style.height = 'auto'
                                    e.target.style.height = e.target.scrollHeight + 'px'
                                }}
                            />
                        </div>

                        <div className='p-3'>
                            <h3>Category Type</h3>
                            {/* <input 
                                type="text"
                                className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2'/> */}
                            {/* Select Options */}
                            <form>
                                {/* <div className='flex justify-center mx-auto mt-3 py-3 '> */}
                                    <select name="role" className='mt-2 border-2 border-gray-200 p-2 rounded-xl bg-white' defaultValue="" onChange={(e) => setCategoryId(e.target.value)}>
                                        {/* <option value="" disabled>Select User Mode</option> */}
                                        <option value="" disabled>Select Category</option>
                                        {allCategories && allCategories.map((u, i) => (
                                            <option key={i} value={u.category_id}>{u.all_category}</option>
                                        ))}
                                    </select>
                                {/* </div> */}
                            </form>
                        </div>

                        <div className='p-3'>
                            <h3>Import Quantity</h3>
                            <input 
                                type="number"
                                onChange={(e) => setQuantity(e.target.value)}
                                className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2'
                            />
                        </div>

                        <div className='p-3'>
                            <h3>Price</h3>
                            <input 
                                type="number"
                                onChange={(e) => setPrice(e.target.value)}
                                className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2'
                            />
                        </div>

                        <div className='p-3'>
                            <button 
                                    className='flex justify-center mx-auto p-3 bg-gray-200 rounded w-1/2 py-4 text-center'
                                    onClick={handleAddEditProductInfo}
                                    >
                                    Add Product
                            </button>
                        </div>
                    </div>

                    <div className='p-3 bg-white rounded-2xl shadow-lg'>
                        <h1 className='text-center text-2xl pt-5'>Product List</h1>
                    </div>
                </div>
            </div>
        </div>
    )
    }

export default adminProductPage
