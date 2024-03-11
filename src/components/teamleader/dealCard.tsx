import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import Image from "next/image";

export default function DealCard({ deal }: { deal: SimplifiedDeal }) {
  return (
    <Card variant={"deal"} size={"deal"}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex max-w-32 items-center">
          {deal.company.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 items-end">
        <div className="text-end text-xs bg-js_dev_role px-2 py-0.5 rounded-[14px] tv:rounded-[28px] w-fit">
          {trimMogelijkhedenTitle(deal.title)}
        </div>
        <div className="flex gap-3 justify-end font-normal text-sm items-end">
          {deal.estimated_closing_date ? (
            <div>{deal.estimated_closing_date}</div>
          ) : (
            <div>no date</div>
          )}
          <div>
            {deal.PM.avatar_url ? (
              <Image
                src={deal.PM.avatar_url}
                alt="User avatar"
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <Image
                src="https://cdn0.iconfinder.com/data/icons/communication-456/24/account_profile_user_contact_person_avatar_placeholder-512.png"
                alt="User avatar"
                width={24}
                height={24}
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

const trimMogelijkhedenTitle = (title: string) => {
  return title.split("(")[0];
};
