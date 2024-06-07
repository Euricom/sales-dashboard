import { Card, CardHeader, CardContent, CardTitle } from "../ui/card";
import { DropContext } from "~/contexts/dndProvider";
import { useContext, useEffect, useState, useRef } from "react";
import CompanyLogo from "./companyLogo";
import { PmAvatar } from "./pmAvatar";
import { type GroupedDeal } from "~/lib/types";
import { employeeRoles } from "~/lib/constants";
import { DealContext } from "~/contexts/dealsProvider";
import { Button } from "../ui/button";
import { X, Home, Mail } from "lucide-react";

export default function DealCard({
  groupedDeal,
}: {
  groupedDeal: GroupedDeal;
}) {
  const { activeDealId, groupedDealsToWrap } = useContext(DropContext);
  const { currentDealDetailsId, setCurrentDealDetailsId } = useContext(DealContext);
  const variant =
    groupedDeal.groupedDealId === (activeDealId as string)?.split("/")[0]
      ? "dealhighlight"
      : "deal";

  const [shouldWrap, setShouldWrap] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [childLocation, setChildLocation] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setShouldWrap(groupedDealsToWrap.includes(groupedDeal.groupedDealId));
  }, [groupedDealsToWrap, groupedDeal.groupedDealId]);

    // Show detail view when clicked
  useEffect(() => {
      setShowDetailView(currentDealDetailsId === groupedDeal.groupedDealId);
  }, [currentDealDetailsId, groupedDeal.groupedDealId]);

  const formatDate = (date?: string) => {
    if (!date) return 'Geen datum';

    const today = new Date();
    today.setHours(0, 0, 0, 0); // remove time part
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0); // remove time part

    return targetDate.toLocaleDateString("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const handleDetailView = (event: React.MouseEvent<HTMLButtonElement>) => {
    const clickedElement = event.currentTarget;
    const clickedElementWidth = clickedElement.offsetWidth;
    const windowWidth =
      window.innerWidth || document.documentElement.clientWidth;
    const windowHeight =
      window.innerHeight || document.documentElement.clientHeight;
    const detailViewHeight = 60;
    const detailViewWidth = 315;
    // Get position relative to the document
    const rect = clickedElement.getBoundingClientRect();
    let top = rect.top + window.scrollY;
    let left = rect.left + window.scrollX + clickedElementWidth;

    if (rect.bottom + detailViewHeight > windowHeight) {
      top = top - detailViewHeight;
    }

    if (rect.right + detailViewWidth > windowWidth) {
      left = rect.left + window.scrollX - detailViewWidth;
    }

    const positionRelativeToDocument = {
      top: top,
      left: left,
    };
    setChildLocation(positionRelativeToDocument);

    if (currentDealDetailsId === groupedDeal.groupedDealId) {
      setCurrentDealDetailsId("");
      setShowDetailView(false);
      return;
    }
    setCurrentDealDetailsId(groupedDeal.groupedDealId);
  };

  const detailViewRef = useRef<HTMLDivElement>(null);

  // Add mousedown event listener to document
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Check if the clicked element is outside of the detail view card
      if (detailViewRef.current && !detailViewRef.current.contains(event.target as Node)) {
        // Close the detail view
        setCurrentDealDetailsId("");
        setShowDetailView(false);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    
    // Cleanup function to remove event listener
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [setCurrentDealDetailsId]);

  if (!groupedDeal.deal.custom_fields[1]?.value === undefined) return null;
  const employeeRole = employeeRoles.filter(e => e.name.includes(groupedDeal.deal.custom_fields[1]!.value!))[0];

  return (
    <Card
      variant={variant}
      size={"deal"}
      className={`${shouldWrap && "mb-[4.25rem]"}`}
    >
      <Button
          variant="ghost"
          size={"clear"}
          className="w-full h-full flex justify-between"
          onClick={handleDetailView}
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
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <div>{formatDate(groupedDeal.deal.created_at)}</div>
          <PmAvatar pm={groupedDeal.deal.PM} size={24} />
        </div>
      </CardContent>
      </Button>
      {showDetailView && (
          <Card
            className="left-[5.5rem] top-0 h-fit z-50 bg-white text-primary fixed"
            style={{
              top: childLocation.top,
              left: childLocation.left + 8,
            }}
            ref={detailViewRef}
          >
            <CardContent className="flex flex-col gap-2">
              <div className="flex justify-between gap-8 h-fit">
                <h1>{groupedDeal.deal.company.name}</h1>
                <Button variant={"icon"} size={"clear"} onClick={handleDetailView}>
                  <X width={20} className="cursor-pointer" />
                </Button>
              </div>
              <div className="h-0.5 bg-primary rounded-full" />
              {groupedDeal.deal.company.email && (
                <div className="flex gap-3">
                  <Mail width={20} />
                  <div className="flex flex-col items-start justify-center">
                    <p>{groupedDeal.deal.company.email}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3">
                <Home width={20} />
                <div className="flex flex-col items-start justify-center">
                  <p>{groupedDeal.deal.company.primary_address?.line_1}</p>
                  <p>{groupedDeal.deal.company.primary_address?.postal_code} {groupedDeal.deal.company.primary_address?.city}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </Card>
  );
}

const trimRole = (role: string) => {
  if (!role) return null;

  return role.split("[")[0]?.split("(")[0];
};