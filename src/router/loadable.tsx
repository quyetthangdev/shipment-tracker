import React from 'react';

//Auth
export const LoginPage = React.lazy(() =>
    import('@/app/auth').then((module) => ({
        default: module.LoginPage,
    })),
)

//Dashboard
export const EmployeePage = React.lazy(() =>
    import('@/app/dashboard').then((module) => ({
        default: module.EmployeePage,
    })),
)

//Admin
export const AdminPage = React.lazy(() =>
    import('@/app/admin').then((module) => ({
        default: module.AdminPage,
    })),
)