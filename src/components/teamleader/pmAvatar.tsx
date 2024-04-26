import type { PM } from "~/lib/types";
import Image from "next/image";

export function PmAvatar({ pm, size }: { pm: PM; size?: number }) {
  return (
    <div>
      {pm.avatar_url ? (
        <Image
          src={pm.avatar_url}
          alt="User avatar"
          width={size ?? 24}
          height={size ?? 24}
          className="rounded-14 w-6 h-6"
        />
      ) : (
        <Image
          src="https://cdn3.iconfinder.com/data/icons/feather-5/24/user-512.png"
          alt="User avatar"
          width={size ?? 24}
          height={size ?? 24}
          className="rounded-14 w-6 h-6 bg-white p-1"
        />
      )}
    </div>
  );
}
