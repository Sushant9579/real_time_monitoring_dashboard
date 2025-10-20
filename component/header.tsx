'use client'
import Link from "next/link";
import Dropdown from "@/component/dropdown";
import { useEffect,useState } from "react";
import { useRouter, usePathname } from "next/navigation";
//import { GiHamburgerMenu } from "react-icons/gi";
//import { IoIosCloseCircleOutline } from "react-icons/io";
//import { useState } from "react";

export default function Head(){
   // const [openDiv,setOpenDiv] = useState(false)
   const router = useRouter();
   const [showall, setAll] = useState(false);
   const [showalarm, setAlarm] = useState(false);

    useEffect(()=>{
        const isValue = localStorage.getItem('User');
        if(isValue){
            const parsed = JSON.parse(isValue);
            const role = parsed.Role;
           // const username = parsed.Username;

        if(role == 'Admin'){
                setAll(true);
                setAlarm(true);
        }else if(role == 'SuperVisor'){
             setAlarm(true);
        }else{
           setAll(false);
        setAlarm(false); 
        }

        }
    },[])

   const pathname = usePathname();
  // Hide logout button on login page
  const showLogout = pathname !== "/login";
   
    return <header className="sticky top-0 z-100">
            <section className="flex justify-between py-3 bg-violet-500 w-full">
                <div className="flex justify-center items-center gap-2">
                    {/* <span className="mx-2 text-lg cursor-pointer"><GiHamburgerMenu onClick={()=>setOpenDiv(true)}/></span> */}
                    {showLogout && <ul className="max-sm:hidden text-center text-white flex gap-3 ml-6 font-semibold text-shadow-violet-50">
                        <li><Link href="/">Dashboard</Link>             </li>
                        <li><Link href="/trend">Trend</Link>            </li>
                        <li><Link href="/ctrend">Custom Trend</Link>    </li>
                        <li><Link href="/datalog">Data Log</Link>       </li>
                        <li><Link href="/report">Report</Link>          </li>
                        {(showall && showalarm) && <li><Link href="/user">User</Link> </li>}
                        {showalarm && <li><Link href="/alarm">Alarms</Link>          </li>}
                    </ul>}
                    {showLogout && <div className="sm:hidden ml-6"><Dropdown /></div>}
                </div>
                {/* {openDiv && <div className="flex flex-col absolute top-0 left-0 bg-violet-500 gap-y-4 min-h-screen lg:w-1/6">
                    <IoIosCloseCircleOutline className="absolute top-0 right-0 m-2 cursor-pointer" onClick={()=>setOpenDiv(false)}/>
                    <div className="mx-4 my-6">
                        <div className="my-2"><Link href="/">Dashboard</Link></div>
                        <div className="my-2"><Link href="/trend">Trend</Link></div>
                        <div className="my-2"><Link href="/ctrend">Custom Trend</Link></div>
                        <div className="my-2"><Link href="/datalog">Data Log</Link></div>
                        <div className="my-2"><Link href="/report">Report</Link></div>
                    </div>
                </div>} */}
                <div className="mx-2 flex items-center gap-x-3">
                    <span className="text-white font-semibold text-shadow-voilet-50">{pathname == '/login' ? "Login" 
                                                                                        : pathname == '/' ? "Dashboard" :
                                                                                        pathname == '/trend' ? "Trends" :
                                                                                        pathname == '/ctrend' ? "Custom Trends":
                                                                                        pathname == '/datalog' ? "Data Log" :
                                                                                        pathname == '/report' ? "Report" :
                                                                                        pathname == '/user' ? "User" :
                                                                                        pathname == '/alarm' ? "Alarm" : ""} Page</span>
                    {showLogout && <button className="cursor-pointer bg-violet-200 px-4 py-2 font-semibold rounded-4xl" onClick={()=>{router.push('/login'); localStorage.removeItem('User')}}>Logout</button>}
                </div>
            </section>
    </header>
}