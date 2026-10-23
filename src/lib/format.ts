import { STORE } from "./config";

export const money = (n: number) => `${STORE.currency} ${n.toLocaleString("en-US")}`;

export const dateTime = (d: Date) =>
  d.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
