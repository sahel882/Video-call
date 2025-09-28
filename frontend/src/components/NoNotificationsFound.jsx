import { BellIcon } from "lucide-react";

function NoNotificationsFound() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-[60vh]">
      <div className="flex flex-col items-center text-center">
        <BellIcon className="size-8 text-base-content opacity-40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">No notifications yet</h3>
        <p className="text-base-content opacity-70 max-w-md">
          When you receive friend requests or messages, they'll appear here.
        </p>
      </div>
    </div>
  );
}

export default NoNotificationsFound;