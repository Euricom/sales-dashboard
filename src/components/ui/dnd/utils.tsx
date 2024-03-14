import { type IRow } from "./row";

export const defaultRows: IRow[] = [
  {
    rowID: 1,
    items: [
      { itemID: 11, rowID: 1, content: "AA" },
      { itemID: 12, rowID: 1, content: "BB" },
      { itemID: 13, rowID: 1, content: "CC" },
    ],
  },
  {
    rowID: 2,
    items: [
      { itemID: 21, rowID: 2, content: "DD" },
      { itemID: 22, rowID: 2, content: "EE" },
      { itemID: 23, rowID: 2, content: "FF" },
    ],
  },
  {
    rowID: 3,
    items: [
      { itemID: 31, rowID: 3, content: "GG" },
      { itemID: 32, rowID: 3, content: "HH" },
      { itemID: 33, rowID: 3, content: "II" },
    ],
  },
];
