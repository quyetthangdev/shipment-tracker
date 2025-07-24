import React from 'react';

//Auth
export const LoginPage = React.lazy(() =>
    import('@/app/auth').then((module) => ({
        default: module.LoginPage,
    })),
)

//Dashboard
export const DashboardPage = React.lazy(() =>
    import('@/app/dashboard').then((module) => ({
        default: module.DashboardPage,
    })),
)