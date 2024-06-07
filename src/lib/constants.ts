import { DealName, PhaseId } from "./types";

export const dealPhases = [
  {
    id: PhaseId.Opportunities,
    name: DealName.Opportunities,
    label: "Mogelijkheden",
  },
  {
    id: PhaseId.Proposed,
    name: DealName.Proposed,
    label: "Voorgesteld",
  },
  {
    id: PhaseId.Interview,
    name: DealName.Interview,
    label: "Interview",
  },
  {
    id: PhaseId.Retained,
    name: DealName.Retained,
    label: "Weerhouden",
  },
  {
    id: PhaseId.NonRetained,
    name: DealName.NonRetained,
    label: "Niet-Weerhouden",
  },
];

export const employeeRoles = [
  {
    name: "JS Fullstack",
    color: "#4A6AF2"
  },
  {
    name: "JS Frontend",
    color: "#8F379E"
  },
  {
    name: "Analist",
    color: "#E76F51"
  },
  {
    name: ".NET Fullstack",
    color: "#fe9f4b"
  },
  {
    name: ".NET Backend",
    color: "#2A9D8F"
  },
]