'use client'

import NavBar from '../components/NavBar';
import { use, useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation';
import React from 'react'

const page = () => {
  return (
    <div>
        <NavBar />
    </div>
  )
}

export default page
