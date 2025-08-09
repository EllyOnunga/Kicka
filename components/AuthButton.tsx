"use client";

import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthButton() {
  const { session, user, signOut, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (isLoading) {
    return <div className='w-20 h-8'></div>;
  }

  return session ? (
    <div className="dropdown droppdown-end">
      <label tabIndex={0} className="btn btn-circle btn-ghost avatar">
        <div className="w-8 rounded-full">
          {user?.user_metadata?.avatar_url ? (
            <img src={user.user_metadata.avatar_url} alt="User" />
          ) : (
            <div className="bg-neutral text-neutral-content rounded-full w-full h-full flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </label>
      <ul tabIndex={0} 
      className="dropdown-content menu menu-sm mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
        <li>
          <Link href="/account" className="justify-between">
            Profile
          </Link>
        </li>
        <li>
          <Link href="/account/orders">My Orders</Link>
        </li>
        <li>
          <button onClick={handleSignOut} className="btn btn-sm btn-ghost">
            Sign Out
        </button>
        </li>
      </ul>
    </div>
  ) : (
    <Link href="/login" className="btn btn-sm btn-primary">
      Sign In
    </Link>
  );
}
      