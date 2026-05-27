'use client'

import { use, useState, useEffect, useRef } from 'react';

// ─── Shared style tokens ──────────────────────────────────────────────────────
const inputClass =
  'bg-gray-50 border border-transparent focus:border-gray-900 focus:bg-white ' +
  'rounded-xl px-4 py-3 w-full outline-none text-sm transition-all duration-200 ' +
  'placeholder:text-gray-400 text-gray-800'

const btnPrimary =
  'w-full bg-gray-900 text-white text-xs font-semibold tracking-widest ' +
  'uppercase py-3 rounded-xl mt-1 cursor-pointer hover:bg-gray-700 ' +
  'active:scale-[0.98] transition-all duration-200'

const btnOutline =
  'bg-transparent border-2 border-white/50 text-white text-xs font-semibold ' +
  'uppercase tracking-widest px-10 py-3 rounded-xl cursor-pointer ' +
  'hover:bg-white/10 active:scale-[0.98] transition-all duration-200'
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [isActive, setIsActive] = useState(false)
  const [signInData, setSignInData]   = useState({ email: '', password: '' })
  const [signUpData, setSignUpData]   = useState({ name: '', email: '', password: '' })
  const fileInputRef = useRef(null)
  const [ imageUrl, setImageUrl ] = useState(null)
  const [ file, setFile ] = useState(null)
  const [ previewUrl, setPreviewUrl ] = useState(null)

  const handleSignIn = (e) => {
    e.preventDefault()
    console.log('sign in:', signInData)
    // fetch login API ตรงนี้
  }

  const handleSignUp = (e) => {
    e.preventDefault()
    console.log('sign up:', signUpData)
    // fetch register API ตรงนี้
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden bg-[#efefef] font-[family-name:var(--font-geologica)]">

      {/* Ambient blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-gray-300/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-gray-400/25 rounded-full blur-3xl pointer-events-none" />

      {/* Card ── bg-white keeps forms from bleeding through */}
      <div className="relative overflow-hidden w-205 max-w-full min-h-135 bg-white rounded-3xl shadow-2xl shadow-gray-300/60">

        {/* ── Sign Up Form ──────────────────────────────────────────────────── */}
        <div
          className={[
            'absolute top-0 left-0 w-1/2 h-full bg-white',           // ← bg-white blocks bleed
            'flex items-center justify-center',
            'transition-all duration-700 ease-in-out',
            isActive
              ? 'translate-x-full opacity-100 z-50'
              : 'opacity-0 pointer-events-none z-10',
          ].join(' ')}
        >
          <form onSubmit={handleSignUp} className="flex flex-col items-center px-10 w-full gap-3">
            <FormHeader title="Create Account" subtitle="Register with your email" />
            <input
              type="text" placeholder="Full Name" className={inputClass}
              value={signUpData.name}
              onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
            />
            <input
              type="email" placeholder="Email Address" className={inputClass}
              value={signUpData.email}
              onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
            />
            <input
              type="password" placeholder="Password" className={inputClass}
              value={signUpData.password}
              onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
            />
            <button type="submit" className={btnPrimary}>Sign Up</button>
          </form>
        </div>

        {/* ── Sign In Form ──────────────────────────────────────────────────── */}
        <div
          className={[
            'absolute top-0 left-0 w-1/2 h-full bg-white z-20',      // ← bg-white blocks bleed
            'flex items-center justify-center',
            'transition-all duration-700 ease-in-out',
            isActive ? 'translate-x-full pointer-events-none' : 'translate-x-0',
          ].join(' ')}
        >
          <form onSubmit={handleSignIn} className="flex flex-col items-center px-10 w-full gap-3">
            <FormHeader title="Welcome Back" subtitle="Sign in to your account" />
            <input
              type="email" placeholder="Email Address" className={inputClass}
              value={signInData.email}
              onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
            />
            <input
              type="password" placeholder="Password" className={inputClass}
              value={signInData.password}
              onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
            />
            <a
              href="#"
              className="self-end text-[11px] text-gray-400 hover:text-gray-900 hover:underline -mt-1 transition-colors duration-200"
            >
              Forgot password?
            </a>
            <button type="submit" className={btnPrimary}>Sign In</button>
          </form>
        </div>

        {/* ── Sliding Overlay Panel ─────────────────────────────────────────── */}
        <div
          className={[
            'absolute top-0 left-1/2 w-1/2 h-full z-1000 overflow-hidden',
            'transition-all duration-700 ease-in-out',
            isActive ? '-translate-x-full rounded-r-[130px]' : 'rounded-l-[130px]',
          ].join(' ')}
        >
          <div
            className={[
              'relative h-full w-[200%] -left-full text-white flex',
              'bg-linear-to-br from-gray-700 via-gray-900 to-black',
              'transition-all duration-700 ease-in-out',
              isActive ? 'translate-x-1/2' : 'translate-x-0',
            ].join(' ')}
          >

            {/* Left panel — visible in sign-up mode */}
            <div
              className={[
                'w-1/2 h-full flex flex-col items-center justify-center px-10 text-center',
                'transition-all duration-700 ease-in-out',
                isActive ? 'translate-x-0' : 'translate-x-[-200%]',
              ].join(' ')}
            >
              <h1 className="text-2xl font-bold mb-2">Welcome Back!</h1>
              <p className="text-sm text-white/55 leading-relaxed mb-7">
                Enter your details to access all site features
              </p>
              <button onClick={() => setIsActive(false)} className={btnOutline}>Sign In</button>
            </div>

            {/* Right panel — visible in sign-in mode */}
            <div
              className={[
                'w-1/2 h-full flex flex-col items-center justify-center px-10 text-center',
                'transition-all duration-700 ease-in-out',
                isActive ? 'translate-x-[200%]' : 'translate-x-0',
              ].join(' ')}
            >
              <h1 className="text-2xl font-bold mb-2">Hello, Friend!</h1>
              <p className="text-sm text-white/55 leading-relaxed mb-7">
                Register with your details to access all site features
              </p>
              <button onClick={() => setIsActive(true)} className={btnOutline}>Sign Up</button>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────


function FormHeader({ icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center mb-2 text-center">
      
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
    </div>
  )
}

