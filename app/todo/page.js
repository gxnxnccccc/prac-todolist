'use client'

import Image from "next/image";
import { use, useState, useEffect } from 'react';
import ItemCard  from "@/components/ItemCard";
import { useRouter } from "next/navigation";
import NavBar from '@/components/NavBar';


export default function Home() {
  const [text, setText] = useState('')
  const [item, setItem] = useState([]) 
  const [edit, setEdit] = useState('')
  const [user, setUser] = useState('')
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
  } catch(error) {}
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
      const editData = await fetch("/api/todos", {method:'PUT',
                       headers:{ 'Content-Type': 'application/json',
                                 'Authorization': `Bearer ${localStorage.getItem('token')}`},
                       body: JSON.stringify({ItemId: edit, List: text})
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

    const res = await fetch("/api/todos", {method:'DELETE',
                  headers:{ 'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                  },
                  body: JSON.stringify({ItemId: i.ItemId})
    }) 
    // console.log("Deleted")
    getData() // fetch data
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
          const res = await fetch("/api/todos", {method:'PUT',
                      headers:{ 'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                      },
                      body: JSON.stringify({ItemId: i.ItemId, Status: !i.Status})
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



  return (
    <div className="flex flex-col gap-6 font-[family-name:var(--font-geologica)]">
      <div>
        
      </div>
      <div className="">
        <div>
          <div className="mt-5">
            <h1 className="text-center text-4xl">To Do List</h1>
            {/* <div className="text-center">{user} is back!</div> */}
          </div>
          {/* Fill Box */}
          <div className="flex flex-col items-center justify-center">
            <br />
            <input 
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="type in here!"
              className="border px-3 py-2 rounded w-64"
              />
            <br/>
            <button onClick={handleClick} className="border px-3 py-2 rounded w-64 hover:bg-gray-200 shadow-md">{edit == ''?"Add":"Save"}</button>
          </div>
        </div>
        
        {/* History */}

        {/* <div className="flex flex-col gap-6 mt-6">  */} {/*  */}
        {/* <div className="grid grid-cols-2 gap-6 mt-6"> */} {/* 2 per row */} 
        {/* <div className="grid grid-cols-3 gap-6 mt-6"> */} {/* 3 per row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-6"> {/* responsive */}
          {item.map((i) => 
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
          )}
        </div>
      </div>
    </div>

    
  );
}

