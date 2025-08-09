"use client";

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';

export default function AccountPage() {
    const { user } = useAuth();
    const router = useRouter();

    if (!user) {
        router.push('/login');
        return null;
    }

    return (
        <Layout>
            <div className="max-w-2xl mx-auto my-10 p-6 bg-base-100 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Account</h1>
                <div className="space-y-4">
                    <div>
                        <label className='label'>
                            <span className="label-text">Name</span>
                        </label>
                        <p className="text-lg">{user.user_metadata.full_name || "N/A"}</p>
                    </div>
                    <div>
                        <label className='label'>
                            <span className="label-text">Email</span>
                        </label>
                        <p className="text-lg">{user.email}</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
}