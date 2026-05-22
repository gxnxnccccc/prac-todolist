'use client'

import { useState, useEffect } from 'react';
import NewItemCard from "@/components/Todo_ItemCard_new";
import { useRouter } from "next/navigation";
import { FaPencilAlt } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { MdDownloadDone } from "react-icons/md";


export default function Home() {
  const [text, setText] = useState('')
  const [item, setItem] = useState([])
  const [edit, setEdit] = useState('')

  const router = useRouter()

  useEffect(() => {
    if (!localStorage.getItem('Username')) {
      router.push('/login')
    }
    getData();
  }, []);

  const getData = async () => {
    try {
      const userId = localStorage.getItem('UserId')
      const res = await fetch(`/api/todos?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      const data = await res.json()
      setItem(data)
    }
    catch (error) {
      console.log(error)
    }
  }

  async function handleClick() {
    if (edit === '') {
      const data = {
        UserId: JSON.parse(localStorage.getItem('UserId')),
        List: text,
        status: false
      }
      try {
        const add = await fetch("/api/todos", {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(data)
        })
        await add.json()
      }
      catch (error) {
        console.log(error)
      }
      getData();
      setText('');
    }
    else {
      try {
        const data = { ItemId: edit, List: text }
        await fetch("/api/todos", {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
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

  async function handleDelete(i) {
    try {
      await fetch("/api/todos", {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ItemId: i.ItemId })
      })
      getData()
    }
    catch (error) {
      console.log(error)
    }
  }

  function handleEdit(i) {
    setText(i.List)
    setEdit(i.ItemId)
  }

  async function handleStatus(i) {
    try {
      await fetch("/api/todos", {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ ItemId: i.ItemId, Status: !i.Status })
      })
      getData()
    }
    catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)] mb-10">
      <div className="m-5">
        <h1 className="mt-5 text-center text-4xl w-85 sm:w-120 mx-auto">Your To Do</h1>
      </div>

      {/* Input */}
      <div className="flex flex-row gap-4 mx-10 mt-5">
        <div className='w-120 mx-auto flex items-center justify-center gap-3'>
            <div className="relative flex-1">
                <FaPencilAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9d9ca2]-400" />
                <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add new list"
                    className="border-b pl-8 pr-3 py-2 w-full outline-none text-xl"
                />
                </div>
                <button
                onClick={handleClick}
                className="rounded-2xl w-11 h-11 bg-[#3d3d3d] hover:bg-[#4f4f4f] shadow-md text-white text-3xl"
                >
                {edit === '' ? <IoAdd className='w-full'/> : <MdDownloadDone className='w-full'/>}
                </button>
            </div>
        </div>

      {/* Card list */}
      <div className='flex flex-col gap-4 mx-10 mt-5 h-[60vh] overflow-y-auto'>
        {item.map((item) => (
          <NewItemCard
            key={item.ItemId}
            data={item}
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            handleStatus={handleStatus}
          />
        ))}
      </div>
    </div>
  );
}
