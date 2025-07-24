import { Suspense } from "react";
import ErrorPage from "@/error-page";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { LoginPage, DashboardPage } from "./loadable";
import { ROUTES } from "@/constants";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { Spinner } from "@/app/components";

export const router = createBrowserRouter([
    {
        path: ROUTES.HOME,
        element: <Navigate to={ROUTES.DASHBOARD} replace />,
        errorElement: <ErrorPage />,
    },
    {
        path: ROUTES.LOGIN,
        element: (
            <PublicRoute>
                <Suspense fallback={<Spinner />}>
                    <LoginPage />
                </Suspense>
            </PublicRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: ROUTES.DASHBOARD,
        element: (
            <ProtectedRoute>
                <Suspense fallback={<div>Loading...</div>}>
                    <DashboardPage />
                </Suspense>
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: ROUTES.NOT_FOUND,
        element: <ErrorPage />,
    },
])