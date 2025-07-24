import { useRouteError, useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui'
import { ROUTES } from './constants';

export default function ErrorPage() {
  const error = useRouteError() as { statusText?: string; message?: string }
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-28 dark:bg-gray-900">
      {/* Hình ảnh minh họa lỗi */}

      {/* Tiêu đề lỗi */}
      <h1 className="mb-4 text-5xl font-bold text-destructive">
        Oops!
      </h1>

      {/* Nội dung lỗi */}
      <p className="mb-2 text-lg text-muted-foreground dark:text-gray-300">
        Something went wrong.
      </p>

      {error?.statusText && (
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {error.statusText}
        </p>
      )}
      {error?.message && (
        <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
          {error.message}
        </p>
      )}

      {/* Nút điều hướng */}
      <div className="flex space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
        <Button
          onClick={() => navigate(ROUTES.HOME)}
        >
          Go Home
        </Button>
      </div>
    </div>
  )
}
