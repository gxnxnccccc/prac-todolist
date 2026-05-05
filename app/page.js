'use client'

import NavBar from '../components/NavBar';
import { use, useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
// const playfairdisplay = playfair_Display({
//     subsets: ['latin'],
//     weight: '400'
// })

export default function Home() {
    const [ user, setUser ] = useState('')
    const [ done, setDone ] = useState([])
    const [ undone, setUndone ] = useState([])
    const [ allTasks, setAllTasks] = useState([])
    const [ tasks, setTasks ] = useState([])
    const [ selected, setSelected] = useState('all')
    const router = useRouter()

    useEffect(() => {
        if (!localStorage.getItem('Username')) {
          router.push('/login')
        }
        else {
          const u = localStorage.getItem('Username')
          setUser(JSON.parse(u))
        }
        getAllTask();
      } ,[]);


    const getAllTask = async() => {
        try {
            const userId = localStorage.getItem('UserId')
            const res = await fetch(`/api/homes?userId=${userId}`, {
                                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                                })
            const data = await res.json()
            console.log("data: ", data)
            console.log("Done: ", data.filter(t => t.Status === true))
            console.log("Undone ",data.filter(t => t.Status === false))
            setDone(data.filter(t => t.Status === true))
            setUndone(data.filter(t => t.Status === false))
            setAllTasks(data)
            setTasks(data)
            }
            catch(error) {
                console.log(error)
            }
    }

    const handleChange = (e) => {
        console.log(e.target.value)
        let filterTask = []
        const value = e.target.value
        if (value == 'done') {
            filterTask = allTasks.filter(t => t.Status === true)
            setTasks(filterTask)
            setSelected('done')
        }
        else if (value == 'undone') {
            filterTask = allTasks.filter(t => t.Status == false)
            setTasks(filterTask)
            setSelected('undone')
        }
        else {
            setTasks(allTasks)
            setSelected('all')
        }
    }

    const handleSearch = (e) => {
        let search = tasks.filter(({List}) => List.includes(e.target.value))
        console.log(search)
        if (e.target.value.length > 1) {
            setTasks(search)
        }
        else {
            // const holdValue = allTasks.filter(i => )
            let filterTask = []
            if (selected == 'done') {
            filterTask = allTasks.filter(t => t.Status === true)
            setTasks(filterTask)
            }
            else if (selected == 'undone') {
                filterTask = allTasks.filter(t => t.Status == false)
                setTasks(filterTask)
            }
            else {
                setTasks(allTasks)
            }
        }
        



    }
   

return (
    <div className='mt-10'>
        <div className={`text-center w-24 m-auto`}>
                TO DO LIST
        </div>

        {/* <select onChange={handleChange}>
                <option value="all">
                    All
                </option>
                <option value="undone">
                    Undone
                </option>
                <option value="done">
                    Done
                </option>
        </select> */}
            
        <div className='flex justify-center mt-3'>
            <input type='text' className='border' onChange={handleSearch}/>
        </div>
        

        <div className='flex flex-row justify-center w-full bg-blue-100 m-5'>
                <button className={`${selected=='all'
                        ? 'bg-blue-500'
                        : 'bg-blue-100'} basis-1/3 text-center p-2.5 hover:bg-blue-500 transition ease-in-out duration-100`} onClick={handleChange} value='all'>All</button>

                <button className={`${selected=='undone'
                        ? 'bg-blue-500'
                        : 'bg-blue-100'} basis-1/3 text-center p-2.5 hover:bg-blue-500 transition ease-in-out duration-100`} onClick={handleChange} value='undone'>Undone</button>

                <button className={`${selected=='done'
                        ? 'bg-blue-500'
                        : 'bg-blue-100'} basis-1/3 text-center p-2.5 hover:bg-blue-500 transition ease-in-out duration-100`} onClick={handleChange} value='done'>Done</button>
        </div>

        <div className='bg-red-100 rounded-3xl mx-10 pb-10 m-10 shadow-md'>
                <h1 className='mx-3 text-xl text-center p-3'>{}</h1>
                <ul className="flex flex-col gap-3 mt-3 ml-15 list-disc">
                    {tasks.map((task) => (
                            <li
                            className=""
                            key={task.ItemId}>
                                {task.List}
                            </li>
                    ))}
                </ul>
        </div>

        {/* <div className='bg-red-100 rounded-3xl mx-10 pb-10 m-10 shadow-md'>
                <h1 className='mx-3 text-xl text-center p-3'>Undone</h1>
                <ul className="flex flex-col gap-3 mt-3 ml-15 list-disc">
                    {undone.map((task) => (
                            <li
                            className=""
                            key={task.ItemId}>
                                {task.List}
                            </li>
                    ))}
                </ul>
        </div>

        <div className='bg-green-100 rounded-3xl mx-10 pb-10 m-10 shadow-md'>
                <h1 className='mx-3 text-xl text-center p-3'>Done</h1>
                <ul className="flex flex-col gap-3 mt-3 ml-15 list-disc"> 
                    {done.map((task) => (
                        <li
                        className=""
                        key={task.ItemId}>
                            {task.List}
                        </li>
                    ))}
                </ul>
        </div> */}
    </div>
    )
}