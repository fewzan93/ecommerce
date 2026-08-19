import { useState } from 'react'

const contactInfo = [
  { icon: '📍', label: 'Address', value: '123 Market Street, Karachi, Pakistan' },
  { icon: '📞', label: 'Phone', value: '+92 300 1234567' },
  { icon: '✉️', label: 'Email', value: 'support@shopverse.example' },
  { icon: '🕒', label: 'Hours', value: 'Mon–Sat, 9:00 AM – 6:00 PM' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const mailto = `mailto:support@shopverse.example?subject=${encodeURIComponent(
      `${form.subject} (from ${form.name}, ${form.email})`
    )}&body=${encodeURIComponent(form.message)}`
    window.location.href = mailto
    setSent(true)
  }

  return (
    <div>
      <section className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="mt-3 text-brand-100">
            Questions about an order, a product or a return? We usually reply within one
            business day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            {contactInfo.map((c) => (
              <div key={c.label} className="flex items-start gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{c.label}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{c.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
                <span className="text-4xl">📨</span>
                <h2 className="mt-3 text-xl font-bold text-gray-900">Message ready in your email app</h2>
                <p className="mt-2 max-w-md text-sm text-gray-600">
                  Your email client should have opened with your message pre-filled. If not,
                  send it directly to <b>support@shopverse.example</b>.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-white p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Subject *</label>
                  <input
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                    placeholder="Order question, returns, product inquiry..."
                  />
                </div>
                <div className="mt-4">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Message *</label>
                  <textarea
                    required
                    rows={6}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-brand-600"
                  />
                </div>
                <button
                  type="submit"
                  className="mt-5 rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}