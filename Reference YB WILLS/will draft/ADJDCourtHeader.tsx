import React from "react";

/** Page-1 header: official artwork (emblem, skyline, titles) cropped from the ADJD PDF. */
export function ADJDCourtHeader() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="aw-header"
      src="/adjd/header.png"
      alt="Abu Dhabi Judicial Department – Civil Family Court – Last Will and Testament"
    />
  );
}
