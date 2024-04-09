import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import Image from "next/image";
import { DropContext } from "~/contexts/dndProvider";
import { useContext } from "react";
import { url } from "inspector";
import CompanyLogo from "./companyLogo";

export default function DealCard({ deal }: { deal: SimplifiedDeal }) {
  const { activeDealId } = useContext(DropContext);

  const variant =
    deal.id === (activeDealId as string)?.split("/")[0]
      ? "dealhighlight"
      : "deal";

  return (
    <Card variant={variant} size={"deal"}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex max-w-32 items-center">
          {deal.company.logo_url ? (
            // hier checken we of de url via de google api komt
            deal.company.logo_url.startsWith(
              `https://t${0 | 1 | 2 | 3}.gstatic.com/faviconV2`,
            ) ? (
              <CompanyLogo url={deal.company.logo_url} />
            ) : (
              // dit gebruiken we als de google api niet werkt, omdat /favicon.ico niet werkt met next/image moeten we de default gebruiken.
              <div className="bg-white rounded-[0.438rem] mr-2 min-w-[1.875rem] min-h-[1.875rem] flex items-center justify-center">
                <div
                  style={{ width: "1.5rem", height: "1.5rem", display: "flex" }}
                >
                  <img
                    src={deal.company.logo_url}
                    alt="example.com icon"
                    className="rounded-[0.438rem]"
                  />
                </div>
              </div>
            )
          ) : (
            // dit is de placeholder image
            <CompanyLogo
              url={
                "https://www.svgrepo.com/show/508699/landscape-placeholder.svg"
              }
            />
          )}
          {trimDealTitle(deal.company.name)}
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

const trimDealTitle = (title: string) => {
  const splitTitle = title.split(" ");
  if (splitTitle.length > 2) {
    return splitTitle.slice(0, 2).join(" ") + "...";
  }
  return title;
};
