import { useState } from 'react'
import ThreeScene from './components/ThreeScene'
import AuthCard from './components/AuthCard'

export default function App() {
  const [page, setPage] = useState('signup')

  return (
    <>
      <ThreeScene />
      <AuthCard page={page} setPage={setPage} />
    </>
  )
}
