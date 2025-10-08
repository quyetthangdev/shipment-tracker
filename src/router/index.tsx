import { Suspense } from "react";
import ErrorPage from "@/error-page";
import { createBrowserRouter } from "react-router-dom";

import { LoginPage, EmployeePage, AdminPage } from "./loadable";
import { ROUTES } from "@/constants";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import { HomeRedirect } from "@/components/HomeRedirect";
import { Spinner } from "@/app/components";

export const router = createBrowserRouter([
    {
        path: ROUTES.HOME,
        element: <HomeRedirect />,
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
                    <EmployeePage />
                </Suspense>
            </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
    },
    {
        path: ROUTES.ADMIN,
        element: (
            <ProtectedRoute>
                <Suspense fallback={<div>Loading...</div>}>
                    <AdminPage />
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