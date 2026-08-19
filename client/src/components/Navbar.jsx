import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { useGetCategoriesQuery } from '../api/categoriesApi'
import { useLogoutMutation } from '../api/authApi'
import { logout, selectCurrentUser } from '../features/auth/authSlice'
import { selectCartCount } from '../features/cart/cartSlice'
import { selectWishlistItems } from '../features/wishlist/wishlistSlice'

export default function Navbar() {
  const [keyword, setKeyword] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectCurrentUser)
  const cartCount = useSelector(selectCartCount)
  const wishlistCount = useSelector(selectWishlistItems).length
  const { data } = useGetCategoriesQuery()
  const [logoutApi] = useLogoutMutation()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = keyword.trim()
    navigate(q ? `/shop?keyword=${encodeURIComponent(q)}` : '/shop')
    setMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      /* cookie may already be gone */
    }
    dispatch(logout())
    toast.success('Logged out')
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm">
      <div className="bg-gray-900 py-1.5 text-center text-xs text-gray-200">
        Free shipping on orders over $50 · Use code <b>WELCOME10</b> for 10% off
      </div>

      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <button
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/" className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight">
          <span className="text-brand-600">Shop</span>
          <span className="text-gray-900">Verse</span>
        </Link>

        <form onSubmit={handleSearch} className="ml-auto hidden max-w-md flex-1 md:block">
          <div className="flex overflow-hidden rounded-full border border-gray-300 focus-within:border-brand-600">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 text-sm outline-none"
            />
            <button className="bg-brand-600 px-4 text-white hover:bg-brand-700" title="Search">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
              </svg>
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-2">
          <Link
            to="/wishlist"
            className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            title="Wishlist"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            className="relative rounded-lg p-2 text-gray-700 hover:bg-gray-100"
            title="Cart"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm8 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM3 3h2l2.4 12.2A2 2 0 0 0 9.36 17h7.7a2 2 0 0 0 1.96-1.6L21 7H6" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-gray-100"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
                <span className="hidden text-sm font-medium sm:block">
                  {user.name.split(' ')[0]}
                </span>
              </button>
              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
                  onMouseLeave={() => setUserMenuOpen(false)}
                >
                  <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-gray-50">
                    My Profile
                  </Link>
                  <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50">
                    My Orders
                  </Link>
                  <Link to="/wishlist" className="block px-4 py-2 text-sm hover:bg-gray-50">
                    Wishlist
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="block px-4 py-2 text-sm font-medium text-brand-600 hover:bg-gray-50">
                      Admin Dashboard
                    </Link>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button onClick={handleLogout} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50">
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Link to="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-gray-100">
                Login
              </Link>
              <Link
                to="/register"
                className="hidden rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 sm:block"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>

      <nav className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 pb-2 lg:flex">
        <NavLink
          to="/shop"
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          All Products
        </NavLink>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          About Us
        </NavLink>
        <NavLink
          to="/faq"
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
              isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
            }`
          }
        >
          FAQ
        </NavLink>
        {data?.categories?.map((cat) => (
          <NavLink
            key={cat._id}
            to={`/shop?category=${cat.slug}`}
            className={({ isActive }) =>
              `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${
                isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            {cat.name}
          </NavLink>
        ))}
      </nav>

      {mobileOpen && (
        <div className="border-t border-gray-200 px-4 py-3 lg:hidden">
          <form onSubmit={handleSearch} className="mb-3 flex overflow-hidden rounded-full border border-gray-300">
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search products..."
              className="w-full px-4 py-2 text-sm outline-none"
            />
            <button className="bg-brand-600 px-4 text-white" title="Search">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0z" />
              </svg>
            </button>
          </form>
          <div className="flex flex-col gap-1">
            <Link to="/shop" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
              All Products
            </Link>
            <Link to="/about" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
              About Us
            </Link>
            <Link to="/faq" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
              FAQ
            </Link>
            {data?.categories?.map((cat) => (
              <Link
                key={cat._id}
                to={`/shop?category=${cat.slug}`}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-100"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}