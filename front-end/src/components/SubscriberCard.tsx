import SubscribeButton from "@/components/SubscribeButton";
import { Link } from "react-router-dom";

type UserResponseDto = {
  id: number;
  fullName: string;
  username: string;
  description?: string;
  avatar?: string;
};

type Props = {
  user: UserResponseDto;
};

export default function SubscriberCard({ user }: Props) {
  const subscriberCount = "162 N"; // hardcoded as requested

  return (
    <Link
      to={`/@${user.username}`}
      className="flex items-center gap-4 py-5 px-4 border-b border-base-200 hover:bg-base-100 transition-colors"
    >
      {/* Avatar */}
      <div className="avatar shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-1">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.fullName}
              className="object-cover"
            />
          ) : (
            <div className="bg-primary text-primary-content flex items-center justify-center w-full h-full text-2xl font-bold uppercase rounded-full">
              {user.fullName?.charAt(0) ?? "?"}
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="font-semibold text-base-content text-base leading-tight truncate">
            {user.fullName}
          </span>
        </div>
        <p className="text-sm text-base-content/60 mt-0.5">
          @{user.username} · {subscriberCount} người đăng ký
        </p>
        {user.description && (
          <p className="text-sm text-base-content/70 mt-1 line-clamp-2 hidden sm:block">
            {user.description}
          </p>
        )}
      </div>

      {/* Subscribe Button */}
      <div className="shrink-0 ml-2">
        <SubscribeButton username={user.username} size="md" />
      </div>
    </Link>
  );
}
