let stripe = null

export async function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null
  if (!stripe) {
    const { default: Stripe } = await import('stripe')
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  }
  return stripe
}