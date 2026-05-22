'use client'

import Image from "next/image";
import { use, useState, useEffect } from 'react';
import ItemCard  from "@/components/ItemCard";
import { useRouter } from "next/navigation";
import NavBar from '@/components/NavBar';
import moment from 'moment';

import { MdCheckBoxOutlineBlank } from "react-icons/md"; // not selected
import { MdCheckBox } from "react-icons/md";             // selected
import { FaPencilAlt } from "react-icons/fa";            // pencil


export default function Home() {
  const [text, setText] = useState('')
  const [item, setItem] = useState([]) 
  const [edit, setEdit] = useState('')
  const [user, setUser] = useState('')
  const [timeCreated, setTimeCreated] = useState('')
  const [timeUpdated, setTimeUpdated] = useState('')
  const [ isOpen, setIsOpen ] = useState(false)

  const [menu, setMenu] = useState({ visible: false, x:0, y:0, itemId: null })

  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('Username')) {
      router.push('/login')
    }
    else {
      const u = localStorage.getItem('Username')
      setUser(JSON.parse(u))
    }
    getData();
  } ,[]);

  const getData = async() => {
    try {
      const userId = localStorage.getItem('UserId')
      const data = await fetch(`/api/todos?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      }).then((result) => result.json()).then((res) => setItem(res))
    } 
    catch(error) {
      console.log(error)
    }
  }
  
  async function handleClick(){

    // console.log(user[0]?.UserId)
    console.log(localStorage.getItem('UserId'))

    console.log(edit)
    
    if (edit==='') { 
      console.log("Typed", text)
      const id = item.length

      const data = {
        UserId: JSON.parse(localStorage.getItem('UserId')),
        List: text,
        status: false
      }

      try { // add part
        console.log("try")
        const add = await fetch("/api/todos", {method:'POST', 
                    headers:{ 'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`}, 
                    body:JSON.stringify(data)})
        const res = await add.json()
        console.log(res)
      }
      catch (error) {
        console.log(error)
      }
      // setItem([...item]);
      getData();
      setText('');
    }
    else {          // edit part
      try {
        console.log("Edit to ", text)
        const data = {
          ItemId: edit,
          List: text
        }
        const editData = await fetch("/api/todos", {method:'PUT',
                        headers:{ 'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`},
                        body: JSON.stringify(data)
        })
        getData()
        setEdit('')
        setText('')
      }
      catch (error) {
        console.log(error)
      }
    }
  }

  console.log(item)

  async function handleDelete(i){
    // const deleteData = item.filter((j) => j.id != i.id)
    try {
      console.log("DELETE NA JA")

      const data = {
        ItemId: i.ItemId
      }

      const res = await fetch("/api/todos", {method:'DELETE',
                    headers:{ 'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(data)
      })
      setIsOpen(false)
      getData()
    }
    catch (error) {
      console.log(error)
    }

  }

  function handleEdit(i) {
    // const editData = prompt("Edit to: ", i.text)
    console.log(i, "hello")
    // setText(i.text);
    setText(i.List)
    // setEdit(i.id)
    setEdit(i.ItemId)
  }

  async function handleStatus(i) {

  // const updated = item.map((j) => {
    // if (j.ItemId === i.ItemId) {
      try {
        console.log(i, "hello")

        const data = {
          ItemId: i.ItemId,
          Status: !i.Status
        }
        const res = await fetch("/api/todos", {method:'PUT',
                    headers:{ 'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(data)
        })
        // return {...j, status: !i.status}
        getData()
      }
      catch (error) {
        console.log(error)
      }

    // }
    // else {
    //   return j
    // }
  // })
  // setItem(updated)
      
  }
  
  const handleContextMenu = (e, itemId) => {
    e.preventDefault();
    setMenu({ visible: true, x: e.clientX, y: e.clientY, itemId });
  }

  const handleClose = () => setMenu({ visible: false, x: 0, y: 0, itemId: null });

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] mb-10">
      <div>
        
      </div>
      <div className="">
        <div>
          <div className="m-5">
            <h1 className="text-center text-4xl">Your To Do</h1>
            {/* <div className="text-center">{user} is back!</div> */}
          </div>
          {/* Fill Box */}
          <div className="flex flex-row gap-3 items-center justify-center">

            <div className="relative w-64 flex-inline">
                <FaPencilAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="type in here!"
                  className="border-b pl-8 pr-3 py-2 w-full outline-none"
                />
            </div>
            
            <button onClick={handleClick} className="rounded-2xl w-12 h-12 bg-[#3d3d3d] hover:bg-[#4f4f4f] shadow-md text-white">{edit == ''?"+":"Save"}</button>
          </div>
        </div>
        
        {/* History */}

        {/* <div className="flex flex-col gap-6 mt-6">  */} {/*  */}
        {/* <div className="grid grid-cols-2 gap-6 mt-6"> */} {/* 2 per row */} 
        {/* <div className="grid grid-cols-3 gap-6 mt-6"> */} {/* 3 per row */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6 w-full"> responsive */}
        <div>
          {/* {item.map((i) => 
            (
              <ItemCard
              key={i.ItemId}
              data = {i}
              
              
              handleStatus = {handleStatus}
              handleEdit = {handleEdit}
              handleDelete = {handleDelete}
              />
            )
            // <div
            // className="bg-blue-500 text-white gap-6 mx-10 flex p-4 rounded-xl justify-center"
            // key={i.ItemId}>
                
            //     {i.List}

            //   <button onClick={() => handleStatus(i)} className="border px-3 py-2 rounded">{i.Status==true?"Done":"Undone"}</button>
            //   <button onClick={() => handleDelete(i)} className="border px-3 py-2 rounded">Delete</button>
            //   <button onClick={() => handleEdit(i)} className="border px-3 py-2 rounded">Edit</button>
            // </div>
          )} */}
          <div className='px-10 border-2 border-gray-100 rounded-4xl mx-10 mt-10 my-auto shadow-2xl'>
            <table className='w-full justify-center mt-10 mb-20'>

              <thead>
                <tr className='text-xl'>
                  {/* <th className='text-center justify-center border-r'>Status</th> */}
                  <th className='text-center justify-center'>List</th>
                  <th className='text-center justify-center border-l'>Actions</th>
                  {/* <th className='text-center justify-center'>Edit</th> */}
                  <th className='text-center justify-center border-l'>Time Created</th>
                  <th className='text-center justify-center border-l'>Time Updated</th>
                  
                </tr>
                
              </thead>

              <tbody >
                {item.map((item, i) => (
                  <tr
                  key={item.ItemId}
                  >
                    {/* <td className='text-center justify-center border-r border-t'><button onClick={() => handleStatus(item)} className={`px-3 py-2 rounded border ${item?.Status==true ? "bg-green-200" : "bg-red-200"}`}>{item.Status==true?"Done":"Undone"}</button></td> */}
                    {/* <td className='text-center justify-center border-r border-t'>
                      <button onClick={() => handleStatus(item)} className={`px-3 py-2 text-2xl`}>
                          {item.Status==true
                          ? <MdCheckBox/>
                          : <MdCheckBoxOutlineBlank/>
                          }
                      </button>
                    </td> */}

                    <td className='border-t py-6 text-xl'>
                      <div className='flex items-center gap-2 my-auto'>
                        <button onClick={() => handleStatus(item)} className={`px-3 py-2 text-2xl`}>
                          {item.Status==true
                          ? <MdCheckBox/>
                          : <MdCheckBoxOutlineBlank/>
                          }
                        </button>
                        <div
                          className={`relative transition-colors duration-300 ${item?.Status ? 'text-gray-400' : ''}`}
                          onContextMenu={(e) => handleContextMenu(e, item.ItemId)}
                          onClick={handleClose}
                          >
                          {item.List}
                          <span style={{
                            display: 'block',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '100%',
                            height: '2px',
                            backgroundColor: 'currentColor',
                            clipPath: item?.Status ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                            transition: 'clip-path 0.35s ease',
                            pointerEvents: 'none',
                          }} />
                        </div>
                        {menu.visible && menu.itemId === item.ItemId && (
                          <ul className="fixed bg-white shadow-lg rounded-md py-1 z-50 min-w-45 text-sm" style={{ top: menu.y, left: menu.x }}>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-md text-gray-400 italic">Time Created: {item.create_at
                              ? moment.utc(item.create_at).format('DD/MM/YYYY, h:mm:ss')
                              : "-"}
                            </li>
                            <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-md text-gray-400 italic">Updated at: {item.update_at
                              ? moment.utc(item.create_at).format('DD/MM/YYYY, h:mm:ss')
                              : "-"}
                            </li>
                            <li onClick={() => { handleEdit(item); handleClose(); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Edit</li>
                            <li onClick={() => { setIsOpen(item.ItemId); handleClose(); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer">Delete</li>
                            {isOpen === item.ItemId && (
                              <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                                <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                                  <h1 className='text-center text-2xl'>Confirm Delete</h1>
                                  <p>Are you sure to delete this list?</p>
                                  <div className='flex gap-2 self-end'>
                                    <button onClick={() => setIsOpen(false)} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                    <button onClick={() =>handleDelete(item)} className="px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </ul>
                        )}
                      </div>
                    </td>
                    {/* <td className='text-center justify-center border-2 '><button onClick={() => setIsOpen(true)} className="border px-3 py-2 rounded">Delete</button> */}
                    <td className='border-t border-l border-r'>
                      <div className='flex justify-center gap-2'>
                        <button onClick={() => setIsOpen(item.ItemId)} className="px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                        {isOpen === item.ItemId && (
                          <div className='fixed inset-0 flex items-center justify-center z-50 bg-[#4f4f4f]/25'>
                            <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                              <h1 className='text-center text-2xl'>Confirm Delete</h1>
                              <p>Are you sure to delete this list?</p>
                              <div className='flex gap-2 self-end'>
                                <button onClick={() => setIsOpen(false)} className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300">Cancel</button>
                                <button onClick={() =>handleDelete(item)} className="px-3 py-2 rounded bg-red-200 hover:bg-red-300">Delete</button>
                              </div>
                            </div>
                          </div>
                        )}
                        <button onClick={() => handleEdit(item)} className="px-3 py-2 rounded bg-orange-200 hover:bg-orange-300">Edit</button>
                      </div>
                    </td>
                    {/* <td className='text-center justify-center border '><button onClick={() => handleEdit(item)} className="border px-3 py-2 rounded">Edit</button></td> */}
                    <td className='text-center justify-center border-t'>{item.create_at
                      ? moment.utc(item.create_at).format('DD/MM/YYYY, h:mm:ss')
                      : "-"}</td>
                    <td className='text-center justify-center border-t border-l '>{item.update_at
                      ? moment.utc(item.update_at).format('DD/MM/YYYY, h:mm:ss')
                      : "-"}</td>
                    {/* <td className='text-center justify-center border-2 '>{new Date(item.create_at).toLocaleString('en-GB', { timezone: 'Asia/Bangkok' })}</td>
                    <td className='text-center justify-center border-2 '>{new Date(item.update_at).toLocaleString('th-TH', { timezone: 'Asia/Bangkok' })}</td> */}
                  </tr>
                
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    
  );
}

