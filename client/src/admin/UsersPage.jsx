import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  useGetUsersQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} from '../api/adminApi'
import { selectCurrentUser } from '../features/auth/authSlice'
import { useSelector } from 'react-redux'
import Spinner from '../components/Spinner'

export default function AdminUsers() {
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const { data, isLoading } = useGetUsersQuery({
    keyword: keyword || undefined,
    page,
    limit: 10,
  })
  const [updateUser] = useUpdateUserMutation()
  const [deleteUser] = useDeleteUserMutation()
  const currentUser = useSelector(selectCurrentUser)

  const toggleBlock = async (user) => {
    try {
      await updateUser({ id: user._id, isBlocked: !user.isBlocked }).unwrap()
      toast.success(user.isBlocked ? 'User unblocked' : 'User blocked')
    } catch (err) {
      toast.error(err.data?.message || 'Update failed')
    }
  }

  const changeRole = async (user, role) => {
    try {
      await updateUser({ id: user._id, role }).unwrap()
      toast.success('Role updated')
    } catch (err) {
      toast.error(err.data?.message || 'Update failed')
    }
  }

  const confirmDelete = async (user) => {
    if (!window.confirm(`Delete user "${user.name}"?`)) return
    try {
      await deleteUser(user._id).unwrap()
      toast.success('User deleted')
    } catch (err) {
      toast.error(err.data?.message || 'Delete failed')
    }
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Users</h2>
        <input
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value)
            setPage(1)
          }}
          placeholder="Search by name or email..."
          className="w-64 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs uppercase tracking-wide text-gray-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data?.users?.map((user) => {
                  const isSelf = user._id === currentUser?._id
                  return (
                    <tr key={user._id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name}
                              {isSelf && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                            </p>
                            <p className="text-xs text-gray-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2.5">
                        <select
                          value={user.role}
                          disabled={isSelf}
                          onChange={(e) => changeRole(user, e.target.value)}
                          className="rounded-lg border border-gray-300 px-2 py-1 text-xs outline-none focus:border-brand-600 disabled:opacity-50"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                            user.isBlocked
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {user.isBlocked ? 'Blocked' : 'Active'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => toggleBlock(user)}
                            disabled={isSelf}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-40 ${
                              user.isBlocked
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                          >
                            {user.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                          <button
                            onClick={() => confirmDelete(user)}
                            disabled={isSelf}
                            className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-40"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {data?.pagination?.pages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-sm text-gray-500">
                Page {data.pagination.page} of {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page >= data.pagination.pages}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}