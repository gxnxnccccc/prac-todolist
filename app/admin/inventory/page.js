'use client'

import React from 'react'
import { useState, useEffect, useRef } from 'react';
import { useRouter } from "next/navigation";
import { FaFileImage } from "react-icons/fa6";
import moment from 'moment';
import { CiImageOff } from "react-icons/ci";

import { MdOutlineCancel } from "react-icons/md";

const AdminProductPage = () => {
    const [ previewUrl, setPreviewUrl ] = useState(null)
    const fileInputRef = useRef(null)
    const editFileInputRef = useRef(null)
    const [ editFiles, setEditFiles ] = useState([])
    const [ editPreviewUrls, setEditPreviewUrls ] = useState([])
    const [ editSaved, setEditSaved ] = useState(false)
    const [ productAddedAlert, setProductAddedAlert ] = useState(false)
    const [ file, setFile ] = useState(null)
    const [ allCategories, setAllCategories ] = useState([]) // change from null
    // const [ text, setText ] = useState('')
    const [ product, setProduct ] = useState([])
    const [ allImages, setAllImages ] = useState([])
    const [ isOpen, setIsOpen ] = useState(false)
    const [files, setFiles] = useState([])
    const [previewUrls, setPreviewUrls] = useState([])
    const [ edit, setEdit ] = useState('')

    const [ productId, setProductId ] = useState('')
    const [ productName, setProductName ] = useState('')
    const [ categoryId, setCategoryId ] = useState('')
    const [ description, setDescription ] = useState('')
    const [ price, setPrice] = useState('')
    const [ quantity, setQuantity ] = useState('')

    const [ editProductName, setEditProductName ] = useState('')
    const [ editCategoryId, setEditCategoryId ] = useState('')
    const [ editDescription, setEditDescription ] = useState('')
    const [ editPrice, setEditPrice ] = useState('')
    const [ editQuantity, setEditQuantity ] = useState('')
    const [ originalProduct, setOriginalProduct ] = useState(null)
    const [ imageId, setImageId ] = useState([])

    const [ newCategory, setNewCategory ] = useState('')

    const router = useRouter()

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
            router.push('/login')
        }
        getProductInfo();
    }, [])

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

    const uploadEditImages = async () => {
        if (editFiles.length === 0) return []
        const uploadedUrls = []
        try {
            for (const file of editFiles) {
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
    

    const getProductInfo = async () => {
        try {
            const res = await fetch(`/api/admin/inventories`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            })
            if (!res.ok) {
                const err = await res.json().catch(() => ({}))
                throw new Error(err.error ?? `Request failed: ${res.status}`)
            }
            const data = await res.json()
            setAllCategories(data.categories)
            setProduct(data.products)
            setAllImages(data.all_images ?? [])
        }
        catch (error) {
            console.log(error)
        }
    }

    const handleAddEditProductInfo = async (e) => {
        if (e?.preventDefault) {
            e.preventDefault()
        } 
        if (edit==='') {
            try {
                // ADD PART
                if (!productName || !categoryId || !price || !quantity) {
                    alert('Please fill in all required fields (name, category, price, quantity).')
                    return
                }
                const uploadedUrls = await uploadImages()
                const data = {
                    productName: productName,
                    categoryId: categoryId,
                    description: description,
                    price: price,
                    quantity: quantity,
                    imageUrl: uploadedUrls
                }
                
                const addProduct = await fetch(`/api/admin/inventories`, {
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

                setProductAddedAlert(true)
                setTimeout(() => setProductAddedAlert(false), 2000) 

                setProductName('')
                setCategoryId('')
                setDescription('')
                setPrice('')
                setQuantity('')

                setPreviewUrl(null)
                setFile(null)
                setFiles([])
                setPreviewUrls([])

                getProductInfo();
            }
            catch (error) {
                console.log(error)
            }
        }
        else {
            // EDIT PART
            try {
                if (imageId.length > 0) {
                    const deleteImage = await handleDeleteImage()
                }
                const uploadedUrls = await uploadEditImages()
                const data = {
                    product_id: edit,
                    productName: editProductName,
                    categoryId: editCategoryId,
                    description: editDescription,
                    price: editPrice,
                    quantity: editQuantity,
                    imageUrl: uploadedUrls
                }
                const unchanged =
                    editProductName === originalProduct?.product_name &&
                    editCategoryId  === String(originalProduct?.category_id) &&
                    editDescription === originalProduct?.description &&
                    String(editPrice)    === String(originalProduct?.unit_price) &&
                    String(editQuantity) === String(originalProduct?.stock_quantity) &&
                    uploadedUrls.length === 0 && editFiles.length === 0
                if (unchanged) {
                    alert('No changes detected. Please edit at least one field.')
                    return
                }
                const editProduct = await fetch("/api/admin/inventories", {method:'PUT',
                        headers:{ 'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`},
                        body: JSON.stringify(data)
                })
                if (!editProduct.ok) {
                    const errBody = await editProduct.json().catch(() => ({}));
                    alert("Failed to edit the data.")
                    throw new Error(errBody.error ?? `Request failed: ${editProduct.status}`);
                }
                
                setProductAddedAlert(true)
                setTimeout(() => setProductAddedAlert(false), 2000) 

                setEditProductName('')
                setEditCategoryId('')
                setEditDescription('')
                setEditPrice('')
                setEditQuantity('')
                setEditFiles([])
                setEditPreviewUrls([])
                setEditSaved(false)
                setEdit('')
                setIsOpen(false)

                getProductInfo();
            }
            catch (error) {
                console.log(error)
            }
        }
    }

    function handleEdit(p) {
        setEditProductName(p.product_name)
        setEditCategoryId(String(p.category_id))
        setEditDescription(p.description)
        setEditPrice(p.unit_price)
        setEditQuantity(p.stock_quantity)
        setEdit(p.product_id)
        setOriginalProduct(p)
    }
    
    async function handleDelete(p) {
        try {
            await fetch("/api/admin/inventories", {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json',
                           'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: JSON.stringify({ product_id: p.product_id })
            })
            getProductInfo()
        } catch (error) {
            console.log(error)
        }
    }

    async function handleDeleteImage(p) {
        try {
            for (const img of imageId) {
                console.log(img)
                await fetch("/api/admin/inventories", {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}` },
                    body: JSON.stringify({ product_id: img.product_id, image_id: img.image_id })
                })
            }
            
            getProductInfo()
        } catch (error) {
            console.log(error)
        }
    }

    function handleRemovePreview(i){
        setPreviewUrls(prev => prev.filter((_, idx) => idx !== i))
        setFiles(prev => prev.filter((_, idx) => idx !== i))
    }

    function handleRemoveEditPreview(i){
        const removedItem = editPreviewUrls[i]

        setEditPreviewUrls(prev => prev.filter((_, idx) => idx !== i))

        if (removedItem && removedItem.image_id) {
            // It's an existing DB image — mark it for deletion from DB
            setImageId(prev => [...prev, removedItem])
        } else {
            // It's a newly-selected file (blob URL) — remove the corresponding File from editFiles
            // editPreviewUrls = [...dbImages, ...newBlobImages]; count how many blob items precede index i
            const newFileIndex = editPreviewUrls.slice(0, i).filter(item => !item.image_id).length
            setEditFiles(prev => prev.filter((_, idx) => idx !== newFileIndex))
        }
    }

    async function handleAddCategory(e) {
        if (e?.preventDefault) {
            e.preventDefault()
        }
        try {
            const data = {
                categoryType: newCategory
            }

            const addCategory = await fetch(`/api/admin/inventories`, {
                                method: 'POST', 
                                headers: {'Content-Type': 'application/json',
                                        'Authorization': `Bearer ${localStorage.getItem('token')}`},
                                body: JSON.stringify(data) })
            if (!addCategory.ok) {
                const errBody = await addCategory.json().catch(() => ({}));
                throw new Error(errBody.error ?? `Request failed: ${addCategory.status}`);
            }
            const res = await addCategory.json()
            console.log("Res of aaddCategoryInfo: ", res)

            setNewCategory('')
            setIsOpen(false)
            getProductInfo();
                
        }
        catch (error) {
            console.log("Add type error: ", error)
        }
        
    }

    console.log("ImageId: ", imageId)
    console.log('editPreviewUrls: ', editPreviewUrls)
    return (
        <div className="flex flex-col gap-6 font-(family-name:--font-geologica) bg-gray-50 min-h-screen">
            <div className='mt-5 mx-2 sm:mx-5 '>
                <h1 className='text-center mt-10 text-4xl'>Inventory</h1>
                <div className='flex flex-col gap-5 mt-10 mx-auto mb-10'>
                    <div className='p-3 bg-white rounded-2xl shadow-lg'>

                        <h1 className='text-center text-2xl pt-5 font-bold mb-5'>Add Product</h1>
                        <div className='grid grid-cols-1 grid-rows-3 sm:grid-cols-3 sm:grid-rows-1'>
                            <div> 
                                <div className='p-3'>
                                    <h3>Product Name</h3>
                                    <input 
                                        type="text"
                                        value={productName}
                                        onChange={(e) => setProductName(e.target.value)}
                                        className='mt-2 border-2 border-gray-200 rounded w-full px-2 py-2'
                                    />
                                </div>

                                <div className='p-3'>
                                    <h3>Description</h3>
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
                            </div>

                            <div>
                                <div className='p-3'>
                                    <h3>Category Type</h3>
                                    {/* <input 
                                        type="text"
                                        className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2'/> */}
                                    {/* Select Options */}
                                    <form>
                                        {/* <div className='flex justify-center mx-auto mt-3 py-3 '> */}
                                            {/* <select name="role" className='mt-2 border-2 border-gray-200 p-2 rounded-xl bg-white' defaultValue="" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}> */}
                                            <select name="role" className='mt-2 border-2 border-gray-200 p-2 rounded-xl bg-white w-full' value={categoryId} onChange={(e) => {
                                                    const val = e.target.value
                                                    if (val === 'newCategoryType') {
                                                        setIsOpen('newCategoryType')
                                                    } else {
                                                        setCategoryId(val)
                                                    }
                                                }}>
                                                <option value="" disabled>Select Category</option>
                                                {allCategories && allCategories.map((u, i) => (
                                                    <option key={i} value={u.category_id}>{u.all_category}</option>
                                                ))}
                                                <option value="newCategoryType">+ Add</option>
                                            </select>
                                            {isOpen === 'newCategoryType' && (
                                                    <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                                                        <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                                                            <h1 className='text-center text-2xl'>Add Category</h1>
                                                            <input
                                                                type="text"
                                                                placeholder="Category name"
                                                                value={newCategory}
                                                                onChange={(e) => setNewCategory(e.target.value)}
                                                                className='border-2 border-gray-200 rounded w-full px-2 py-2'
                                                            />
                                                            <div className='flex gap-2 self-end'>
                                                                <button onClick={() => setIsOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                                                <button onClick={handleAddCategory} className="border px-3 py-2 rounded bg-green-200 hover:bg-green-300">Add</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                        {/* </div> */}
                                    </form>
                                </div>

                                <div className='p-3'>
                                    <h3>Import Quantity</h3>
                                    <input 
                                        type="number"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2'
                                    />
                                </div>

                                <div className='p-3'>
                                    <h3>Price</h3>
                                    <input 
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className='mt-2 border-2 border-gray-200 rounded w-full py-2 px-2'
                                    />
                                </div>

                                
                            </div>

                            <div className='p-3'>
                                <h3>Product Image</h3>
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

                        <div className='p-3 mt-2'>
                            <button 
                                    className='flex justify-center mx-auto p-3 bg-gray-200 rounded w-full py-2 text-center'
                                    onClick={handleAddEditProductInfo}
                                    >
                                    Add Product
                            </button>
                            {productAddedAlert && (
                                        <div className='fixed bottom-5 right-5 bg-green-200 text-[#4f4f4f] px-4 py-2 rounded-xl shadow-lg'>
                                            Product Added
                                        </div>
                            )}
                        </div>
                    </div>

                    <div className='p-3 bg-white rounded-2xl shadow-lg col-span-2'>
                        <h1 className='text-center text-2xl pt-5 font-bold'>Product List</h1>
                        {/* <table className='w-full justify-center mt-10 mb-20'>
                            <thead>
                                <tr className='text-md'>
                                    <th className='text-center justify-center'>ID</th>
                                    <th className='text-center justify-center border-l'>Name</th>
                                    <th className='text-center justify-center border-l'>Description</th>
                                    <th className='text-center justify-center border-l'>Quantity</th>
                                    <th className='text-center justify-center border-l'>Price</th>
                                    <th className='text-center justify-center border-l'>Time Created</th>
                                    <th className='text-center justify-center border-l'>Time Updated</th>
                                    <th className='text-center justify-center border-l'>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {product.map((p) => (
                                <tr key={p.product_id}>
                                    <td className='text-center justify-center border-t py-6'>{p.product_id}</td>
                                    <td className='text-center justify-center border-t border-l'>{p.product_name}</td>
                                    <td className='text-center justify-center border-t border-l'>{p.description}</td>
                                    <td className='text-center justify-center border-t border-l'>{p.stock_quantity}</td>
                                    <td className='text-center justify-center border-t border-l'>{p.unit_price}</td>
                                    <td className='text-center justify-center border-t border-l'>{p.add_at
                                        ? moment.utc(p.add_at).format('DD/MM/YYYY, h:mm:ss')
                                        : '-'}
                                    </td>
                                    <td className='text-center justify-center border-t border-l'>{p.update_at
                                        ? moment.utc(p.update_at).format('DD/MM/YYYY, h:mm:ss')
                                        : '-'}
                                    </td>
                                    <td className='border-t border-l'>
                                        <div className='flex justify-center gap-2 py-2'>
                                            <button onClick={() => setIsOpen(p.product_id)} className="border px-3 py-2 rounded bg-gray-300 hover:bg-gray-400">Delete</button>
                                            {isOpen === p.product_id && (
                                                <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                                                    <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                                                        <h1 className='text-center text-2xl'>Confirm Delete</h1>
                                                        <p>Are you sure to delete this product?</p>
                                                        <div className='flex gap-2 self-end'>
                                                            <button onClick={() => setIsOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                                            <button onClick={() => { handleDelete(p); setIsOpen(false) }} className="border px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            <button onClick={() => handleEdit(p)} className="border px-3 py-2 rounded bg-orange-200 hover:bg-orange-300">Edit</button>
                                        </div>
                                    </td>
                                </tr>
                                ))}
                            </tbody>
                        </table> */}

                        <div className='overflow-y-auto mt-4'>
                        {product.map((p) => (
                            <div key={p.product_id} className='mt-2 border-2 border-gray-200 rounded mx-4'>
                                <div className='grid grid-rows-1 grid-cols-3 p-2 gap-2'>

                                    {/* Image Box 1 */}
                                    <div className='my-auto'>
                                        {p.image_url 
                                            ? <img src={p.image_url} alt={p.product_name} className='w-50 h-50 object-cover mx-auto' />
                                            : <div className='flex justify-center items-center w-50 h-50 bg-gray-200 mx-auto'>
                                                <CiImageOff className='text-2xl'/>
                                              </div>
                                        }
                                    </div>

                                    {/* Info Box 2 */}
                                    <div className='col-span-2 '>
                                        <h1 className='text-xl font-bold'>{p.product_name}</h1>
                                        <div className='flex gap-1'>ID: 
                                            <p className='text-[#9d9ca2]-400'>{p.product_id}</p>
                                        </div>
                                        <div className='grid grid-rows-2 grid-cols-1 sm:grid-rows-1 sm:grid-cols-3 text-xs '>
                                            <div className='sm:col-span-2'>
                                                <div className='flex gap-1'>Description: 
                                                    <p className='text-[#9d9ca2]-400'>{p.description}</p>
                                                </div>
                                                <div className='flex gap-1'>Type: 
                                                    <p className='text-gray-400'>{p.category_name}</p>
                                                </div>
                                                <div className='flex gap-1'>Created at: 
                                                    <p className='text-gray-400'>{p.add_at
                                                        ? moment.utc(p.add_at).format('DD/MM/YYYY, h:mm:ss')
                                                        : '-'}
                                                    </p>
                                                </div>
                                                <div className='flex gap-1'>Last Modified: 
                                                    <p className='text-gray-400'>{p.update_at
                                                        ? moment.utc(p.update_at).format('DD/MM/YYYY, h:mm:ss')
                                                        : '-'}
                                                    </p>
                                                </div>
                                            </div>
                                        
                                            <div>
                                                <div className='flex gap-1'>Price:
                                                    <p className='text-gray-400'>{p.unit_price}</p>
                                                </div>
                                                <div className='flex gap-1'>Quantity:
                                                    <p className='text-gray-400'>{p.stock_quantity}</p>
                                                </div>
                                                <div className='flex gap-2 py-2'>
                                                    <button onClick={() => setIsOpen(p.product_id)} className="border px-3 py-2 rounded bg-red-200 hover:bg-red-400">Delete</button>
                                                    {isOpen === p.product_id && (
                                                        <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                                                            <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                                                                <h1 className='text-center text-2xl'>Confirm Delete</h1>
                                                                <p>Are you sure to delete this product?</p>
                                                                <div className='flex gap-2 self-end'>
                                                                    <button onClick={() => setIsOpen(false)} className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                                                    <button onClick={() => { handleDelete(p); setIsOpen(false) }} className="border px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <button onClick={() => { handleEdit(p); setIsOpen('edit') }} className="border px-3 py-2 rounded bg-orange-200 hover:bg-orange-300">Edit</button>
                                                    {isOpen === 'edit' && edit === p.product_id && (
                                                        <div className="fixed inset-0 bg-[#4f4f4f]/50 flex items-center justify-center z-50">
                                                            <div className="flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4">
                                                                <h1 className="text-center text-2xl">Change Product Information</h1>

                                                                <div className="flex flex-col gap-2">
                                                                    <h3>Product Image</h3>
                                                                    <div className="flex flex-wrap items-center gap-4 max-w-[calc(4*5rem+3*1rem)]">
                                                                        {/* <div
                                                                            className="flex flex-wrap gap-1 justify-center cursor-pointer"
                                                                            onClick={() => editFileInputRef.current.click()}
                                                                        > */}
                                                                            
                                                                        {editPreviewUrls.length > 0
                                                                            ? editPreviewUrls.map(({image_url}, i) => (
                                                                                <div key={i}>
                                                                                <img src={image_url} alt="preview" className="w-20 h-20 object-cover" />
                                                                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemoveEditPreview(i) }}>X</button>
                                                                                </div>
                                                                            ))
                                                                            : (() => {
                                                                                const imgs = allImages.filter(img => img.product_id === p.product_id)
                                                                                return imgs.length > 0
                                                                                ? imgs.map((img, i) => (
                                                                                    <div key={i}>
                                                                                        <img src={img.image_url} alt={p.product_name} className="w-20 h-20 object-cover" />
                                                                                        <button 
                                                                                            type="button" 
                                                                                            onClick={(e) => { 
                                                                                                e.stopPropagation(); 
                                                                                                const updated = imgs.filter((_, idx) => idx !== i)
                                                                                                setEditPreviewUrls(updated)
                                                                                                setImageId(prev => [...prev, img]) 
                                                                                            }}>X
                                                                                        </button>
                                                                                    </div>
                                                                                    ))
                                                                                : <div className="flex justify-center items-center w-24 h-24 bg-gray-200 rounded"><CiImageOff /></div>
                                                                            })()
                                                                        }
                                                                        {/* </div> */}

                                                                        <input
                                                                            type="file"
                                                                            multiple
                                                                            ref={editFileInputRef}
                                                                            className="hidden"
                                                                            onChange={(e) => {
                                                                                const imgs = allImages.filter(img => img.product_id === edit)
                                                                                // const totalImage = [...imgs, {image_url: selected.map(f => URL.createObjectURL(f))[0]}]
                                                                                const selected = Array.from(e.target.files).map(f => URL.createObjectURL(f))
                                                                                const selectedEdit = Array.from(e.target.files)

                                                                                selected.forEach((url) => {
                                                                                    imgs.push({image_url: url})
                                                                                })
                                                                                console.log(imgs)
                                                                                console.log(selectedEdit)
                                                                                
                                                                                // console.log(totalImage)
                                                                                setEditFiles(selectedEdit)
                                                                                setEditPreviewUrls(imgs)
                                                                                setEditSaved(false)
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <button onClick={() => editFileInputRef.current.click()} className="border px-3 py-2 rounded bg-blue-200">
                                                                    Add Photo
                                                                </button>

                                                                <div className="flex flex-col gap-2">
                                                                    <h3>Product Name</h3>
                                                                    <input
                                                                        type="text"
                                                                        value={editProductName}
                                                                        onChange={(e) => setEditProductName(e.target.value)}
                                                                        // placeholder="Enter old password"
                                                                        className="border-2 border-gray-200 px-3 py-2 rounded w-full"
                                                                    />
                                                                </div>

                                                                <div className="flex flex-col gap-2">
                                                                    <h3>Description</h3>
                                                                    <p className="text-xs text-gray-400">Press Enter for a new line. Start a line with • for a bullet point.</p>
                                                                    <textarea
                                                                        value={editDescription}
                                                                        onChange={(e) => setEditDescription(e.target.value)}
                                                                        rows={6}
                                                                        className="border-2 border-gray-200 px-3 py-2 rounded w-full resize-y"
                                                                    />
                                                                </div>

                                                                <div className="flex flex-col gap-2">
                                                                    <h3>Category</h3>
                                                                    <form>
                                                                        {/* <div className='flex justify-center mx-auto mt-3 py-3 '> */}
                                                                            {/* <select name="role" className='mt-2 border-2 border-gray-200 p-2 rounded-xl bg-white' defaultValue="" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}> */}
                                                                            <select name="role" className='mt-2 border-2 border-gray-200 p-2 rounded-xl bg-white w-full' value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)}>
                                                                                {/* <option value="" disabled>Select User Mode</option> */}
                                                                                <option value="" disabled>Select Category</option>
                                                                                {allCategories && allCategories.map((u, i) => (
                                                                                    <option key={i} value={String(u.category_id)}>{u.all_category}</option>
                                                                                ))}
                                                                            </select>
                                                                        {/* </div> */}
                                                                    </form>
                                                                </div> 
                                                                
                                                                <div className="flex flex-col gap-2">
                                                                    <h3>Price</h3>
                                                                    <input
                                                                        type="number"
                                                                        value={editPrice}
                                                                        onChange={(e) => setEditPrice(e.target.value)}
                                                                        // placeholder="Enter new password"
                                                                        className="border-2 border-gray-200 px-3 py-2 rounded w-full"
                                                                    />
                                                                </div>

                                                                <div className="flex flex-col gap-2">
                                                                    <h3>Quantity</h3>
                                                                    <input
                                                                        type="number"
                                                                        value={editQuantity}
                                                                        onChange={(e) => setEditQuantity(e.target.value)}
                                                                        // placeholder="Enter new password"
                                                                        className="border-2 border-gray-200 px-3 py-2 rounded w-full"
                                                                    />
                                                                </div>

                                                                <div className="flex gap-2 self-end">
                                                                    <button onClick={handleAddEditProductInfo} className="border px-3 py-2 rounded bg-blue-200">Save</button>
                                                                    {/* {savedAlert && (
                                                                        <div className='fixed bottom-5 right-5 bg-[#4f4f4f] text-white px-4 py-2 rounded-xl shadow-lg'>
                                                                            saved
                                                                        </div>
                                                                    )} */}
                                                                    <button onClick={() => { setIsOpen(false); setEdit(''); setEditProductName(''); setEditCategoryId(''); setEditDescription(''); setEditPrice(''); setEditQuantity(''); setEditFiles([]); setEditPreviewUrls([]); setEditSaved(false) }} className="border px-3 py-2 rounded bg-gray-200">Cancel</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
    }

export default AdminProductPage
