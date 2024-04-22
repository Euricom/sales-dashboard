import type { SimplifiedDeal } from "~/server/api/routers/teamleader/types";
import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { DropContext } from "~/contexts/dndProvider";
import { useContext } from "react";
import CompanyLogo from "./companyLogo";
import afkortingen from "~/lib/Afkortingen.json";
import { PmAvatar } from "./pmAvatar";

export default function DealCard({ deal }: { deal: SimplifiedDeal }) {
  const { activeDealId } = useContext(DropContext);

  const variant =
    deal.id === (activeDealId as string)?.split("/")[0]
      ? "dealhighlight"
      : "deal";

  return (
    <Card variant={variant} size={"deal"}>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex max-w-40 items-center">
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
        <div className="text-end text-xs bg-js_dev_role px-2 py-0.5 rounded-[14px] tv:rounded-[28px] w-fit truncate...">
          {deal.custom_fields[1]?.value
            ? deal.custom_fields[1]?.value
            : trimRole(deal.title)}
        </div>
        <div className="flex gap-3 justify-end font-normal text-sm items-end">
          {deal.estimated_closing_date ? (
            <div>{deal.estimated_closing_date}</div>
          ) : (
            <div>no date</div>
          )}
          <PmAvatar pm={deal.PM} size={24} />
        </div>
      </CardContent>
    </Card>
  );
}

const trimDealTitle = (title: string) => {
  let trimmedTitle = title.split("[")[0]?.split("(")[0];
  trimmedTitle = replaceWords(trimmedTitle);
  return trimmedTitle;
};

const trimRole = (role: string) => {
  let newRole = role.split("[")[0]?.split("(")[0];
  newRole = newRole?.replace(/\b[A-Z]*[0-9]+[A-Z]+|[A-Z]+[0-9]+[A-Z]*\b/g, "");
  newRole = replaceWords(newRole);
  return newRole;
};

const replaceWords = (str: string | undefined): string => {
  if (!str) return "";
  const words: Record<string, string> = afkortingen.reduce(
    (acc: Record<string, string>, { woord, afkorting }) => {
      acc[woord] = afkorting;
      return acc;
    },
    {},
  );

  const replacedStr: string = str
    .split(/[\s/]+/)
    .map((word: string) => {
      if (words[word]) {
        return words[word];
      }
      return word;
    })
    .join(" ");

  return replacedStr;
};
