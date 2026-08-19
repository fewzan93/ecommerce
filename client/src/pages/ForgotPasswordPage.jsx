import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useForgotPasswordMutation } from '../api/authApi'

export default function ForgotPasswordPage() {
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [sent, setSent] = useState(false)

  const onSubmit = async (data) => {
    try {
      await forgotPassword(data).unwrap()
      setSent(true)
    } catch (err) {
      toast.error(err.data?.message || 'Something went wrong')
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Reset your password</h1>

        {sent ? (
          <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-700">
            <p className="font-medium">Check your inbox!</p>
            <p className="mt-1">
              If an account exists for that email, we've sent a reset link. It
              expires in 30 minutes. In development (no SMTP configured), the
              link is printed in the server console.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-1 text-sm text-gray-500">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-gray-300"
              >
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
          </>
        )}

        <p className="mt-5 text-center text-sm text-gray-500">
          Remembered it?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  )
}