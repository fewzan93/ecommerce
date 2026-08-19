import { useEffect } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useGetMeQuery } from '../api/authApi'
import { setCredentials } from '../features/auth/authSlice'
import Spinner from './Spinner'

export default function AdminRoute() {
  const dispatch = useDispatch()
  const { data, isLoading } = useGetMeQuery()

  useEffect(() => {
    if (data?.user) dispatch(setCredentials({ user: data.user }))
  }, [data, dispatch])

  if (isLoading) return <Spinner />

  if (!data?.user) return <Navigate to="/login" replace />

  if (data.user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}