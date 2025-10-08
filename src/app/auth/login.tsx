import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { ROUTES } from '@/constants';
import { LoginBackground } from '@/assets/images';
import { useAuthStore } from '@/stores';
import { Button } from '@/components/ui';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedUsername = username.trim();
        const success = login(trimmedUsername, password);

        console.log('Login attempt:', { trimmedUsername, success });

        if (success) {
            console.log('Login success! Username:', trimmedUsername);
            console.log('ROUTES.ADMIN:', ROUTES.ADMIN);
            console.log('ROUTES.DASHBOARD:', ROUTES.DASHBOARD);

            if (trimmedUsername === 'admin') {
                console.log('Navigating to ADMIN route...');
                navigate(ROUTES.ADMIN, { replace: true });
            } else {
                console.log('Navigating to DASHBOARD route...');
                navigate(ROUTES.DASHBOARD, { replace: true });
            }
            toast.success('Đăng nhập thành công!');
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
    };

    return (
        <div className="flex overflow-hidden relative justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200">
            {/* Background Image */}
            <img
                src={LoginBackground}
                alt="Background"
                className="object-cover absolute inset-0 w-full h-full"
            />

            {/* Overlay Gradient & Blur */}
            {/* <div className="absolute inset-0 backdrop-blur-md bg-white/0" /> */}

            {/* Glassmorphism Form */}
            <form
                onSubmit={handleSubmit}
                className="relative z-10 w-[calc(100%-2rem)] sm:w-full sm:max-w-sm p-8 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/30 shadow-xl"
            >
                <h2 className="mb-6 text-2xl font-bold text-center drop-shadow-md">
                    Đăng nhập
                </h2>

                <div className="mb-4">
                    <label className="block mb-1 text-sm">Tài khoản</label>
                    <input
                        className="p-3 w-full rounded-md border outline-none bg-white/30 placeholder-white/70 border-white/30 focus:ring-2 focus:ring-white/50"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin hoặc user"
                    />
                </div>

                <div className="mb-4">
                    <label className="block mb-1 text-sm">Mật khẩu</label>
                    <input
                        className="p-3 w-full rounded-md border outline-none bg-white/30 placeholder-white/70 border-white/30 focus:ring-2 focus:ring-white/50"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="admin123 hoặc user123"
                    />
                </div>

                {error && <p className="mb-3 text-sm text-red-300">{error}</p>}

                <Button
                    type="submit"
                    className="py-3 mt-2 w-full font-semibold text-white bg-blue-600 rounded-md shadow-md transition-all duration-300 hover:bg-blue-700 hover:shadow-lg"
                >
                    Đăng nhập
                </Button>
            </form>
        </div>

    );
};

export default LoginPage;
