'use client'

import { useState } from 'react';
import moment from 'moment';
import { MdCheckBoxOutlineBlank } from "react-icons/md"; // not selected
import { MdCheckBox } from "react-icons/md";             // selected
import { MdCancel } from "react-icons/md";               // cancel

export default function TodoItemCard(props) {
    const { data, handleDelete, handleEdit, handleStatus } = props
    const [ isOpen, setIsOpen ] = useState(false)
    const [ menu, setMenu ] = useState({ visible: false, x: 0, y: 0 })

    const handleContextMenu = (e) => {
        e.preventDefault();
        setMenu({ visible: true, x: e.clientX, y: e.clientY });
    }

    const handleClose = () => setMenu({ visible: false, x: 0, y: 0 });

    return (
        <div className='m-auto font-[family-name:var(--font-geologica)]'>
          <div className='flex bg-white shadow-md w-85 sm:w-120 border border-[#3d3d3d] rounded-3xl'>
            <div
              className="w-full text-[#4f4f4f] rounded-xl items-center flex justify-start p-4"
            >
              {/* <div></div>  */}
                <button onClick={() => handleStatus(data)} className={`px-3 py-2 text-2xl`}>
                  {data.Status==true
                  ? <MdCheckBox/>
                  : <MdCheckBoxOutlineBlank/>
                  }
                </button>
                <p onContextMenu={handleContextMenu} onClick={handleClose} className='relative text-lg'>
                  {data?.List}
                  <span style={{
                        display: 'block',
                        position: 'absolute',
                        left: 0,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'currentColor',
                        clipPath: data?.Status ? 'inset(0 0% 0 0)' : 'inset(0 100% 0 0)',
                        transition: 'clip-path 0.35s ease',
                        pointerEvents: 'none',
                  }} />
                </p>

                {/* Context menu (right-click) */}
                {menu.visible && (
                  <ul
                    className="fixed bg-white shadow-lg rounded-md py-1 z-50 min-w-45 text-sm"
                    style={{ top: menu.y, left: menu.x }}
                  >
                    <li className="px-4 py-2 text-sm text-[#9d9ca2]-400 italic">
                      Created: {data.create_at ? moment.utc(data.create_at).format('DD/MM/YYYY, h:mm:ss') : "-"}
                    </li>
                    <li className="px-4 py-2 text-sm text-[#9d9ca2]-400 italic">
                      Updated: {data.update_at ? moment.utc(data.update_at).format('DD/MM/YYYY, h:mm:ss') : "-"}
                    </li>
                    <li
                      onClick={() => { handleEdit(data); handleClose(); }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Edit
                    </li>
                    {/* <li
                      onClick={() => { setIsOpen(true); handleClose(); }}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      Delete
                    </li> */}
                  </ul>
                )}

              
              <div className='text-2xl ml-auto'>
                <MdCancel onClick={() => { setIsOpen(true); handleClose(); }}/>
              </div>
              {/* Delete confirmation modal */}
              {isOpen && (
                <div className='fixed inset-0 bg-[#4f4f4f]/50 flex items-center justify-center z-50'>
                  <div className='flex flex-col bg-white rounded-xl px-12 py-8 shadow gap-4'>
                    <h1 className='text-center text-2xl'>Confirm Delete</h1>
                    <p>Are you sure to delete this list?</p>
                    <div className='flex gap-2 self-end'>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="border px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(data)}
                        className="border px-3 py-2 rounded bg-red-200 hover:bg-red-300"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
              </div>
          </div>
        </div>
    )
}
