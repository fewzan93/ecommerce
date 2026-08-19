import { Link } from 'react-router-dom'

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', to: '/shop' },
      { label: 'Electronics', to: '/shop?category=electronics' },
      { label: 'Fashion', to: '/shop?category=fashion' },
      { label: 'Home & Kitchen', to: '/shop?category=home-kitchen' },
      { label: 'Beauty & Care', to: '/shop?category=beauty-care' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Track My Order', to: '/orders' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Shipping Info', to: '/faq' },
      { label: 'Returns', to: '/faq' },
    ],
  },
  {
    title: 'Account',
    links: [
      { label: 'My Profile', to: '/profile' },
      { label: 'My Orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-gray-900 text-gray-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-1.5 text-xl font-extrabold tracking-tight">
            <span className="text-brand-500">Shop</span>
            <span className="text-white">Verse</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Your one-stop shop for electronics, fashion, home essentials and
            more. Quality products, fast delivery, happy customers.
          </p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold text-white">{col.title}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-gray-400 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} ShopVerse. All rights reserved. Built with
        the MERN stack.
      </div>
    </footer>
  )
}