"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import Link from "next/link";
import Layout from "@/components/Layout";

export default function SignupPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { data, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (signUpError) throw signUpError;

            if (data.user) {
                router.push("/");
            }

        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-md mx-auto my-10 p-6 bg-base-100 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
                {error && (
                    <div className="alert alert-error mb-4">
                        <span>{error}</span>
                    </div>
                )}
                <form onSubmit={handleSignup} className="space-y-4">
                    <div>
                        <label htmlFor="fullName" className="label">
                            <span className="label-text">Full Name</span>
                        </label>
                        <input
                            type="text"
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                            className="w-full input input-bordered"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="label">
                            <span className="label-text">Email</span>
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full input input-bordered"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="label">
                            <span className="label-text">Password</span>
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full input input-bordered"
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={loading}
                    >
                        {loading ? "Creating account..." : "Sign Up"}
                    </button>
                </form>
                <div className="mt-4 text-center">
                    <p>
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary hover:underline">
                        Login here
                    </Link>
                    </p>
                </div>
            </div>
        </Layout>
    );
}