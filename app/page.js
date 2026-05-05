'use client'

import NavBar from '../components/NavBar';
import { use, useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import { Playfair_Display } from 'next/font/google';
import { AiOutlineSearch } from 'react-icons/ai'; 
import SearchIcon from '@mui/icons-material/Search';

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
    const [ text, setText ] = useState('')
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
    <div>
        <div className='mt-10 font-[family-name:var(--font-geologica)]'>
            <p className={`text-center m-auto`}>
                " Your future depends on today."
            </p>

            {/* Select Options */}
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

            {/* Search Box */}

            {/* <div className='flex flew-col justify-center mt-3'>
                <input 
                    type='text' 
                    className='border rounded-4xl' 
                    onChange={handleSearch}/>
            </div> */}

            <form className='relative mt-3 w-1/2 mx-auto'>
                <div className='relative'>
                    <input
                        type="search"
                        placeholder='Type here!'
                        className='w-full p-4 rounded-full bg-gray-200'
                        onChange={handleSearch}/>
                        <button className='absolute right-1 top-1/2 -translate-y-1/2 p-4 bg-gray-300 rounded-full'>
                            <AiOutlineSearch/>
                        </button>
                </div>
            </form>

            <div className='flex flex-row justify-center w-1/3 bg-gray-100 mt-5 mx-auto rounded-xl overflow-hidden'>
                    <button className={`${selected=='all'
                            ? 'bg-gray-300 shadow-lg'
                            : 'bg-gray-100'} basis-1/3 text-center p-2.5 hover:bg-gray-400 transition ease-in-out duration-100`} onClick={handleChange} value='all'>All</button>

                    <button className={`${selected=='undone'
                            ? 'bg-gray-300 shadow-lg'
                            : 'bg-gray-100'} basis-1/3 text-center p-2.5 hover:bg-gray-400 transition ease-in-out duration-100`} onClick={handleChange} value='undone'>Undone</button>

                    <button className={`${selected=='done'
                            ? 'bg-gray-300 shadow-lg'
                            : 'bg-gray-100'} basis-1/3 text-center p-2.5 hover:bg-gray-400 transition ease-in-out duration-100`} onClick={handleChange} value='done'>Done</button>
            </div>

            <div className='bg-gray-100 rounded-3xl w-1/2 mx-auto pb-10 m-10 shadow-md'>
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
    </div>
    )
}