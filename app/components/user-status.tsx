import { SerializeFrom } from "@remix-run/node";
import { useEffect, useState } from "react";
import { DB } from "~/.server/db.server";
import { client } from "~/.server/redis";
import { LoginCookie } from "~/types";

export default function UserStatus({
  user,
}: {
  user:
    | SerializeFrom<LoginCookie>
    | SerializeFrom<{
        isLoggedIn: false;
      }>;
}) {
  const [status, setStatus] = useState<string | null>(null);

  if (!user.isLoggedIn)
    return (
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 bg-gray-500 rounded-full" />
        <span className="text-sm font-medium text-gray-500">Unknown</span>
      </div>
    );

  const getStatus = async () => {
    const status = await client.get(`user:${user?.user.id}:status`);
    setStatus(status);
  };

  useEffect(() => {
    if (status === null) {
      getStatus();
    }
  }, []);

  return status === "online" ? (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-green-500 rounded-full" />
      <span className="text-sm font-medium text-green-500">Online</span>
    </div>
  ) : status === "offline" ? (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-red-500 rounded-full" />
      <span className="text-sm font-medium text-red-500">Offline</span>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 bg-gray-500 rounded-full" />
      <span className="text-sm font-medium text-gray-500">Unknown</span>
    </div>
  );
}
