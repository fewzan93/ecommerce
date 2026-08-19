import { useState } from 'react'
import { Link } from 'react-router-dom'

const faqs = [
  {
    q: 'How long does delivery take?',
    a: 'Orders are dispatched within 24 hours of payment. Delivery typically takes 3–7 business days depending on your location. You can track your order status on the Orders page under your profile.',
  },
  {
    q: 'Do you offer free shipping?',
    a: 'Yes — shipping is free on all orders over $50. Orders below $50 are charged a flat $5 shipping fee. Taxes are calculated at checkout based on your order subtotal.',
  },
  {
    q: 'How do I use a discount coupon?',
    a: 'Copy your coupon code (e.g. WELCOME10) and enter it in the coupon field on the Cart or Checkout page. The discount applies instantly if the coupon is active and your order meets any minimum order requirement.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit and debit cards (Visa, Mastercard, Amex) securely through Stripe. Your card details are processed by Stripe and never stored on our servers.',
  },
  {
    q: 'Can I cancel or change my order?',
    a: 'You can cancel an order from the order detail page as long as its status is Pending or Processing. Once an order is Shipped, it can no longer be cancelled — please contact us for return options instead.',
  },
  {
    q: 'What is your return policy?',
    a: 'If something is not right, contact us within 14 days of delivery. Unused items in original packaging can be returned for a refund or replacement. We will guide you through the return process step by step.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes. Sign in and visit Orders to see the live status of every order (Pending → Processing → Shipped → Delivered). You will also see the payment status there.',
  },
  {
    q: 'How do I reset my password?',
    a: 'Click "Forgot password" on the login page and enter your account email. We will send you a reset link to create a new password.',
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState(0)

  return (
    <div>
      <section className="bg-gradient-to-r from-brand-600 via-brand-700 to-indigo-800 py-14 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-extrabold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-3 text-brand-100">
            Everything you need to know about ordering, shipping, coupons and returns.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14">
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-semibold text-gray-900">{f.q}</span>
                <span
                  className={`shrink-0 text-gray-400 transition-transform duration-200 ${
                    open === i ? 'rotate-180' : ''
                  }`}
                >
                  ▼
                </span>
              </button>
              {open === i && (
                <p className="border-t border-gray-100 px-5 py-4 text-sm leading-relaxed text-gray-600">
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-2xl bg-gray-50 p-8 text-center">
          <h2 className="text-lg font-bold text-gray-900">Still have questions?</h2>
          <p className="mt-1 text-sm text-gray-600">
            Our support team is happy to help.
          </p>
          <Link
            to="/contact"
            className="mt-4 inline-block rounded-full bg-brand-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Contact Us
          </Link>
        </div>
      </section>
    </div>
  )
}