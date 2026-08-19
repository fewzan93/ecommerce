export default function PagePlaceholder({ title, description }) {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-md text-gray-500">{description}</p>
    </main>
  )
}