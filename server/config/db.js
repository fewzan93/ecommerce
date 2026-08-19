import mongoose from 'mongoose'

export default async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    console.warn(
      '[db] MONGODB_URI not set — skipping database connection. Copy .env.example to .env'
    )
    return
  }

  try {
    const conn = await mongoose.connect(uri)
    console.log(`[db] MongoDB connected: ${conn.connection.host}`)
  } catch (err) {
    console.error(`[db] Connection error: ${err.message}`)
    process.exit(1)
  }
}