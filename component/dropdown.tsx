"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AppDropdown() {
  const [open, setOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [showAlarm, setShowAlarm] = useState(false);

  useEffect(() => {
    const isValue = localStorage.getItem('User');
        if(isValue){
            const parsed = JSON.parse(isValue);
            const role = parsed.Role;
           // const username = parsed.Username;

        if(role == 'Admin'){
                setShowAll(true);
                setShowAlarm(true);
        }else if(role == 'SuperVisor'){
             setShowAlarm(true);
        }else{
           setShowAll(false);
        setShowAlarm(false); 
        }

        }
  }, []);

  const links = [
    { name: "Dashboard", href: `${process.env.NEXT_PUBLIC_API_URL}/` },
    { name: "Trend", href: `${process.env.NEXT_PUBLIC_API_URL}/trend` },
    { name: "Custom Trend", href: `${process.env.NEXT_PUBLIC_API_URL}/ctrend` },
    { name: "Data Log", href: `${process.env.NEXT_PUBLIC_API_URL}/datalog` },
    { name: "Report", href: `${process.env.NEXT_PUBLIC_API_URL}/report` },
    ...(showAll ? [{ name: "User", href: `${process.env.NEXT_PUBLIC_API_URL}/user` }] : []),
    ...(showAlarm ? [{ name: "Alarms", href: `${process.env.NEXT_PUBLIC_API_URL}/alarm` }] : []),
  ];

  return (
    <div className="relative inline-block text-left z-50">
      {/* Dropdown trigger */}
      <button onClick={() => setOpen(!open)} className="px-4 py-2 border rounded-4xl bg-white font-light hover:bg-gray-100"> Select</button>

      {/* Dropdown content */}
      {open && (
        <ul className="absolute mt-2 w-48 border rounded bg-white shadow-lg">
          {links.map((link) => (
            <li key={link.name}>
              <Link href={link.href} onClick={() => setOpen(false)} className="block px-4 py-2 hover:bg-gray-100 z-50"> {link.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
