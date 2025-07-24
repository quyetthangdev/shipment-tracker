import { RouterProvider } from "react-router-dom"
import { Toaster } from 'react-hot-toast'

import { router } from "./router"

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  )
}
