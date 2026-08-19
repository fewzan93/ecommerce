import { Link } from 'react-router-dom'

const stats = [
  { value: '30+', label: 'Products' },
  { value: '6', label: 'Categories' },
  { value: '24h', label: 'Dispatch time' },
  { value: '$50', label: 'Free shipping threshold' },
]

const values = [
  {
    icon: '🛡️',
    title: 'Quality you can trust',
    text: 'Every product is hand-picked and quality-checked before it reaches your doorstep.',
  },
  {
    icon: '🚚',
    title: 'Fast, reliable delivery',
    text: 'Orders ship within 24 hours with free shipping on orders over $50.',
  },
  {
    icon: '🔒',
    title: 'Secure payments',
    text: 'Checkout is powered by Stripe — your payment details never touch our servers.',
  },
  {
    icon: '💬',
    title: 'Support that cares',
    text: 'Our team answers your questions quickly, and returns are always hassle-free.',
  },
]

export default function AboutPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">About ShopVerse</h1>
          <p className="mt-4 text-brand-100">
            Your one-stop shop for electronics, fashion and home essentials — since day one,
            our mission has been simple: make quality shopping effortless.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Our Story</h2>
            <p className="mt-4 leading-relaxed text-gray-600">
              ShopVerse started with a simple observation: shopping online should feel like
              walking into your favorite store — curated, personal and trustworthy. We
              partner directly with manufacturers and trusted brands to bring you a
              hand-picked catalog of products at honest prices.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              Today we serve customers worldwide with fast dispatch, transparent pricing and
              support that actually picks up the phone. No inflated markups, no hidden fees —
              just great products delivered with care.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                to="/shop"
                className="rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
              >
                Explore the Catalog
              </Link>
              <Link
                to="/contact"
                className="rounded-full border border-gray-300 px-8 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Get in Touch
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm"
              >
                <p className="text-3xl font-extrabold text-brand-600">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-2xl font-bold text-gray-900">Why Shop With Us</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-3 font-bold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}