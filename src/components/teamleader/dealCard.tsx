import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { DropContext } from "~/contexts/dndProvider";
import { useContext, useEffect, useState } from "react";
import CompanyLogo from "./companyLogo";
import { PmAvatar } from "./pmAvatar";
import { type GroupedDeal } from "~/lib/types";
import { employeeRoles } from "~/lib/constants";

export default function DealCard({
  groupedDeal,
}: {
  groupedDeal: GroupedDeal;
}) {
  const { activeDealId, groupedDealsToWrap } = useContext(DropContext);
  const variant =
    groupedDeal.groupedDealId === (activeDealId as string)?.split("/")[0]
      ? "dealhighlight"
      : "deal";

  const [shouldWrap, setShouldWrap] = useState(false);

  useEffect(() => {
    setShouldWrap(groupedDealsToWrap.includes(groupedDeal.groupedDealId));
  }, [groupedDealsToWrap, groupedDeal.groupedDealId]);

  const formatDate = (date: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time part
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // remove time part

    if (targetDate.getTime() === today.getTime()) {
      return "Vandaag";
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      return "Morgen";
    } else if (targetDate.getTime() === yesterday.getTime()) {
      return "Gisteren";
    } else {
      return targetDate.toLocaleDateString("fr-BE", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
      });
    }
  };

  if (!groupedDeal.deal.custom_fields[1]) return null;
  const employeeRole = employeeRoles.filter(e => e.name.includes(groupedDeal.deal.custom_fields[1].value))[0];

  return (
    <Card
      variant={variant}
      size={"deal"}
      className={`${shouldWrap ? "mb-[4.25rem]" : ""}`}
    >
      <CardHeader>
        <CardTitle className="text-sm font-medium flex max-w-40 items-center">
          {groupedDeal.deal.company.logo_url ? (
            // hier checken we of de url via de google api komt
            groupedDeal.deal.company.logo_url.startsWith(
              `https://t${0 | 1 | 2 | 3}.gstatic.com/faviconV2`,
            ) ? (
              <CompanyLogo url={groupedDeal.deal.company.logo_url} />
            ) : (
              // dit gebruiken we als de google api niet werkt, omdat /favicon.ico niet werkt met next/image moeten we de default gebruiken.
              <div className="bg-white rounded-[0.438rem] mr-2 min-w-[1.875rem] min-h-[1.875rem] flex items-center justify-center">
                <div
                  style={{ width: "1.5rem", height: "1.5rem", display: "flex" }}
                >
                  <img
                    src={groupedDeal.deal.company.logo_url}
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
          {groupedDeal.deal.company.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1 items-end h-[3rem]">
        <div
          className="bg-white text-white text-end text-[13px] px-2 rounded-[14px] tv:rounded-[28px] w-fit truncate"
          style={{
            backgroundColor: employeeRole?.color ?? 'black',
          }}
        >
          {trimRole(groupedDeal.deal.title)}
        </div>
        <div className="flex items-center gap-2 justify-end font-normal text-sm">
          {groupedDeal.deal.estimated_closing_date ? (
            <div>{formatDate(groupedDeal.deal.estimated_closing_date)}</div>
          ) : (
            <div>no date</div>
          )}
          <PmAvatar pm={groupedDeal.deal.PM} size={24} />
        </div>
      </CardContent>
    </Card>
  );
}

const trimRole = (role: string) => {
  if (!role) return null;

  let newRole = role.split("[")[0]?.split("(")[0];
  newRole = newRole?.replace(/\b[A-Z]*[0-9]+[A-Z]+|[A-Z]+[0-9]+[A-Z]*\b/g, "");

  return newRole;
};