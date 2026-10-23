import React from "react";

interface Props {
  pageNumber?: number;
  total?: number;
  /** Page 8 shows the Abu Dhabi skyline behind the footer */
  skyline?: boolean;
}

export function ADJDCourtFooter({ pageNumber = 1, total = 8, skyline = false }: Props) {
  return (
    <>
      {skyline && (
        // eslint-disable-next-line @next/next/no-img-element
        <img className="aw-skyline" src="/adjd/skyline.png" alt="" aria-hidden />
      )}
      <footer className="aw-footer">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="aw-footer-contact" src="/adjd/footer-contact.png" alt="600 599 799 · 02 651 3262 · CivilFamilyCourt@adjd.gov.ae · @adjd_official · www.adjd.gov.ae" />
        <div className="aw-footer-page">
          <span>PAGE {pageNumber} of {total}</span>
          <span dir="rtl" style={{ fontFamily: "var(--aw-font-ar)" }}>صفحة {pageNumber} من {total}</span>
        </div>
        <div className="aw-footer-code">ADJD-NM0723-07-03</div>
        <div className="aw-footer-copy">
          <span className="ar">جميع الحقوق محفوظة لدائرة القضاء في أبوظبي، 2023©</span>
          All rights reserved to Abu Dhabi Judicial Department,© 2023
        </div>
      </footer>
    </>
  );
}
