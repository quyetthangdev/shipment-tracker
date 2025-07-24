import React, { useState } from 'react';
import { useAuthStore } from '@/stores';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useAuthStore((state) => state.login);
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const success = login(username, password);
        if (success) {
            navigate(ROUTES.DASHBOARD);
        } else {
            setError('Tên đăng nhập hoặc mật khẩu không đúng');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="w-full max-w-sm p-6 bg-white rounded shadow-md">
                <h2 className="mb-4 text-xl font-bold">Đăng nhập</h2>
                <div className="mb-4">
                    <label className="block mb-1">Tài khoản</label>
                    <input
                        className="w-full p-2 border rounded"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="admin hoặc user"
                    />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Mật khẩu</label>
                    <input
                        className="w-full p-2 border rounded"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="admin123 hoặc user123"
                    />
                </div>
                {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
                <button
                    type="submit"
                    className="w-full py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                    Đăng nhập
                </button>
            </form>
        </div>
    );
};

export default LoginPage;
