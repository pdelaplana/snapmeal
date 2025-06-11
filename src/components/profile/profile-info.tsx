'use client';

import { useUserData } from '@/hooks/queries/use-user-data';
import { useAuth } from '@/context/auth-context';

/**
 * Example component showing how to use React Query hooks
 */
export default function ProfileInfo() {
  const { user } = useAuth();
  const { data, isLoading, error } = useUserData(user?.uid);

  if (isLoading) return <div>Loading user profile...</div>;
  if (error) return <div>Error loading profile: {(error as Error).message}</div>;
  if (!data) return <div>No profile data available</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">User Profile</h1>
      <div>
        <p><strong>Email:</strong> {data.email}</p>
        {data.displayName && <p><strong>Name:</strong> {data.displayName}</p>}
      </div>
    </div>
  );
}
