'use client';

import { User } from '@/types';

interface UserPresenceProps {
  users: User[];
}

export default function UserPresence({ users }: UserPresenceProps) {
  const uniqueUsers = users.filter(
    (user, index, arr) => arr.findIndex((u) => u.userId === user.userId) === index
  );
  const maxVisible = 5;
  const visibleUsers = uniqueUsers.slice(0, maxVisible);
  const remaining = uniqueUsers.length - maxVisible;

  return (
    <div className="user-presence">
      <div className="user-avatars">
        {visibleUsers.map((user, index) => (
          <div
            key={user.userId}
            className="user-avatar"
            style={{
              backgroundColor: user.avatarColor,
              zIndex: visibleUsers.length - index,
            }}
            title={user.displayName}
          >
            {user.displayName.charAt(0).toUpperCase()}
          </div>
        ))}
        {remaining > 0 && (
          <div className="user-avatar user-avatar-more" title={`${remaining} more users`}>
            +{remaining}
          </div>
        )}
      </div>
      <span className="user-count">
        {uniqueUsers.length} {uniqueUsers.length === 1 ? 'user' : 'users'} online
      </span>
    </div>
  );
}
