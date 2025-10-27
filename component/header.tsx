'use client'

import Link from "next/link";
import Dropdown from "@/component/dropdown";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Head() {
  const router = useRouter();
  const pathname = usePathname();

  const [showAll, setAll] = useState(false);
  const [showAlarm, setAlarm] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("User");
    if (userData) {
      const parsed = JSON.parse(userData);
      const role = parsed.Role;

      if (role === "Admin") {
        setAll(true);
        setAlarm(true);
      } else if (role === "SuperVisor") {
        setAlarm(true);
      } else {
        setAll(false);
        setAlarm(false);
      }
    }
  }, []);

  // Map of page names
  const pageTitleMap: { [key: string]: string } = {
    "/login": "Login",
    "/": "Dashboard",
    "/trend": "Trends",
    "/ctrend": "Custom Trends",
    "/datalog": "Data Log",
    "/report": "Report",
    "/user": "User",
    "/alarm": "Alarm",
  };

  //  Get current page title
  const pageTitle = pageTitleMap[pathname] || "";

  //  Hide logout button only on login page
  const showLogout = pathname !== "/login";

  //  Base URL — avoids repeating env var
  const base = process.env.NEXT_PUBLIC_API_URL || "";

  return (
    <header className="sticky top-0 z-100">
      <section className="flex justify-between py-3 bg-violet-500 w-full">
        <div className="flex justify-center items-center gap-2">
          {showLogout && (
            <ul className="max-sm:hidden text-center text-white flex gap-3 ml-6 font-semibold text-shadow-violet-50">
              <li><Link href={`${base}/`}>Dashboard</Link></li>
              <li><Link href={`${base}/trend`}>Trend</Link></li>
              <li><Link href={`${base}/ctrend`}>Custom Trend</Link></li>
              <li><Link href={`${base}/datalog`}>Data Log</Link></li>
              <li><Link href={`${base}/report`}>Report</Link></li>
              {showAll && showAlarm && <li><Link href={`${base}/user`}>User</Link></li>}
              {showAlarm && <li><Link href={`${base}/alarm`}>Alarms</Link></li>}
            </ul>
          )}
          {showLogout && <div className="sm:hidden ml-6"><Dropdown /></div>}
        </div>

        <div className="mx-2 flex items-center gap-x-3">
          <span className="text-white font-semibold text-shadow-violet-50">{pageTitle ? `${pageTitle} Page` : ""}</span>

          {showLogout && (
            <button className="cursor-pointer bg-violet-200 px-4 py-2 font-semibold rounded-4xl" onClick={() => { localStorage.removeItem("User"); router.push(`${base}/login`); }}>Logout </button>
          )}
        </div>
      </section>
    </header>
  );
}
