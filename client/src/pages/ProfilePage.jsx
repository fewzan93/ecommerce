import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetMeQuery,
} from '../api/authApi'
import { updateUser, selectCurrentUser } from '../features/auth/authSlice'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const { data: meData } = useGetMeQuery(undefined, { skip: !!user })
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation()
  const [activeTab, setActiveTab] = useState('profile')

  const profileForm = useForm()
  const passwordForm = useForm()

  useEffect(() => {
    const current = user || meData?.user
    if (current) {
      profileForm.reset({
        name: current.name,
        phone: current.phone || '',
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, meData])

  const onSaveProfile = async (data) => {
    try {
      const res = await updateProfile(data).unwrap()
      dispatch(updateUser(res.user))
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.data?.message || 'Update failed')
    }
  }

  const onChangePassword = async (data) => {
    try {
      await changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword }).unwrap()
      toast.success('Password changed — please log in again')
      passwordForm.reset()
    } catch (err) {
      toast.error(err.data?.message || 'Password change failed')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">My Account</h1>

      <div className="mt-6 flex gap-1 rounded-xl bg-gray-100 p-1">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            activeTab === 'profile' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex-1 rounded-lg py-2 text-sm font-medium ${
            activeTab === 'password' ? 'bg-white text-gray-900 shadow' : 'text-gray-500'
          }`}
        >
          Change Password
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Full name</label>
                <input
                  type="text"
                  {...profileForm.register('name', { required: 'Name is required' })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
                />
                {profileForm.formState.errors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {profileForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                {...profileForm.register('phone')}
                placeholder="+92 3XX XXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-gray-300"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Current password</label>
              <input
                type="password"
                {...passwordForm.register('currentPassword', { required: 'Current password is required' })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              />
              {passwordForm.formState.errors.currentPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordForm.formState.errors.currentPassword.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">New password</label>
              <input
                type="password"
                {...passwordForm.register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'Must be at least 6 characters' },
                })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand-600"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="mt-1 text-xs text-red-500">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={changing}
              className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-gray-300"
            >
              {changing ? 'Updating...' : 'Change Password'}
            </button>
            <p className="text-xs text-gray-500">
              You'll be logged out after changing your password.
            </p>
          </form>
        </div>
      )}
    </div>
  )
}