import { ChevronDown, ChevronUp } from "lucide-react";
import Image from "next/image";
import { useContext, useState } from "react";
import { DealContext } from "~/contexts/dealsProvider";
import { type PM } from "~/lib/types";

export default function PMFields() {
  const { AllPMs, setPMId } = useContext(DealContext);
  const [VisiblePMs, setVisiblePMs] = useState(true);

  const handleClick = (id: string) => {
    setPMId(id);
  };

  if (!AllPMs) {
    return <></>;
  }

  return (
    <>
      <div
        className="flex flex-row w-full gap-1.5"
        onClick={() => setVisiblePMs(!VisiblePMs)}
      >
        Practice Managers
        {VisiblePMs ? <ChevronDown /> : <ChevronUp />}
      </div>
      {VisiblePMs ? (
        <div className="flex  flex-col gap-2">
          {AllPMs?.map((pm) => {
            return (
              <div
                key={pm.id}
                className="bg-primary rounded-[14rem] p-1 flex flex-row gap-2"
                onClick={() => handleClick(pm.id)}
              >
                <PmAvatar pm={pm} />
                <div>{pm.first_name + " " + pm.last_name}</div>
              </div>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

export function PmAvatar({ pm }: { pm: PM }) {
  return (
    <div>
      {pm.avatar_url ? (
        <div style={{ width: "1.5rem", height: "1.5rem", display: "flex" }}>
          <Image
            src={pm.avatar_url}
            alt="User avatar"
            width={24}
            height={24}
            className="rounded-full"
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      ) : (
        <div style={{ width: "1.5rem", height: "1.5rem", display: "flex" }}>
          <Image
            src="https://cdn0.iconfinder.com/data/icons/communication-456/24/account_profile_user_contact_person_avatar_placeholder-512.png"
            alt="User avatar"
            width={24}
            height={24}
            style={{
              objectFit: "contain",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}
    </div>
  );
}
