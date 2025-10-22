'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface AlarmApiData {
  id: number;
  alarm_name: string;
  machine: string;
  creation_date: string;
  acknowledge_date: string;
  acknowledge_by: string;
}

export default function Alarm() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<AlarmApiData[]>([]);
  const [acknowledgerName, setAcknowledgerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("User");
    if (!userData) {
      router.push(`${process.env.NEXT_PUBLIC_API_URL}/login`);
      return;
    }

    const parsed = JSON.parse(userData);
    const role = parsed.Role;
    setAcknowledgerName(parsed.Username);

    if (role !== "Admin" && role !== "SuperVisor") {
      router.push(`${process.env.NEXT_PUBLIC_API_URL}/`);
      return;
    }

    async function fetchAlarms() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alarm`);
        if (!res.ok) throw new Error("Failed to fetch alarms");
        const data = await res.json();
        setAlarms(data);
      } catch (err) {
        console.error("Error fetching alarms:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAlarms();
    const interval = setInterval(fetchAlarms, 240000);
    return () => clearInterval(interval);
  }, [router]);

  const acknowledgeAlarm = async (id: number) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alarm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, acknowledgeBy: acknowledgerName }),
    });

    if (res.ok) {
      const updated = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/alarm`).then((r) => r.json());
      setAlarms(updated);
    } else {
      alert("Failed to acknowledge alarm");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Clock className="animate-spin w-6 h-6 text-gray-600" />
        <span className="ml-2 text-gray-700">Loading alarms...</span>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6 text-amber-600 flex items-center justify-center gap-2">
        <AlertTriangle className="w-7 h-7 text-amber-500" />
        Alarm Dashboard
      </h1>

      {alarms.length === 0 ? (
        <div className="text-center text-gray-500 mt-10"> No active alarms right now!</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 bg-white">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sr No.</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Alarm Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Machine</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Creation Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acknowledge By</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Acknowledge Date</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 text-sm">
              {alarms.map((alarm, index) => (
                <tr key={alarm.id} className={`hover:bg-gray-50 transition ${alarm.acknowledge_by === "Unacknowledged" ? "bg-red-50" : "bg-green-50" }`}>
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-gray-800">{alarm.alarm_name}</td>
                  <td className="px-4 py-2">{alarm.machine}</td>
                  <td className="px-4 py-2 text-gray-700">{alarm.creation_date}</td>
                  <td className="px-4 py-2">
                    {alarm.acknowledge_by === "Unacknowledged" ? (
                      <span className="text-red-600 font-semibold">Unacknowledged</span>) : (
                      <span className="flex items-center text-green-600 gap-1"> <CheckCircle2 className="w-4 h-4" />{alarm.acknowledge_by}</span> )}
                  </td>
                  <td className="px-4 py-2 text-gray-700">{alarm.acknowledge_date || "-"}</td>
                  <td className="px-4 py-2 text-center">
                    {alarm.acknowledge_by === "Unacknowledged" ? (
                      <button onClick={() => acknowledgeAlarm(alarm.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-medium shadow-md transition"> Acknowledge</button>) : (
                      <span className="text-gray-400 text-sm">—</span> )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}


// 'use client';
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";

// interface AlarmApiData {
//   id: number;
//   alarm_name: string;
//   machine: string;
//   creation_date: string;
//   acknowledge_date: string;
//   acknowledge_by: string;
// }

// export default function Alarm() {
//   const router = useRouter();
//   const [alarms, setAlarms] = useState<AlarmApiData[]>([]);
//   const [acknowledgerName, setAcknowledgerName] = useState("");

//   // -------------------- Load User & Fetch Alarms --------------------
//   useEffect(() => {
//     const userData = localStorage.getItem("User");

//     if (!userData) {
//       router.push("/login");
//       return;
//     }

//     const parsed = JSON.parse(userData);
//     const role = parsed.Role;
//     setAcknowledgerName(parsed.Username);

//     if (role !== "Admin" && role !== "SuperVisor") {
//       router.push("/");
//       return;
//     }

//     async function fetchAlarms() {
//       try {
//         const res = await fetch("/api/alarm");
//         if (!res.ok) throw new Error("Failed to fetch alarms");
//         const data = await res.json();
//         setAlarms(data);
//       } catch (err) {
//         console.error("Error fetching alarms:", err);
//       }
//     }

//     // Initial fetch
//     fetchAlarms();

//     // Auto-refresh alarms every 4 min
//     const interval = setInterval(fetchAlarms, 240000);
//     return () => clearInterval(interval);

//   }, [router]);

//   // -------------------- Handle Acknowledge --------------------
//   const acknowledgeAlarm = async (id: number) => {
//     const acknowledgeBy = acknowledgerName;

//     const res = await fetch(`/api/alarm`, {
//       method: "PATCH",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ id, acknowledgeBy }),
//     });

//     if (res.ok) {
//       alert(" Alarm acknowledged successfully!");
//       // Re-fetch data (no reload)
//       const updated = await fetch("/api/alarm").then((r) => r.json());
//       setAlarms(updated);
//     } else {
//       alert(" Failed to acknowledge alarm");
//     }
//   };

//   // -------------------- Render --------------------
//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-4 text-center">🚨 Alarms Dashboard</h1>

//       <table className="min-w-full border text-sm">
//         <thead>
//           <tr className="bg-gray-100">
//             <th className="p-2 border">Sr No.</th>
//             <th className="p-2 border">Alarm Name</th>
//             <th className="p-2 border">Machine</th>
//             <th className="p-2 border">Creation Date</th>
//             <th className="p-2 border">Acknowledge By</th>
//             <th className="p-2 border">Acknowledge Date</th>
//             <th className="p-2 border text-center">Action</th>
//           </tr>
//         </thead>

//         <tbody>
//           {alarms.map((alarm, index) => (
//             <tr key={alarm.id} className="text-center">
//               <td className="p-2 border">{index + 1}</td>
//               <td className="p-2 border">{alarm.alarm_name}</td>
//               <td className="p-2 border">{alarm.machine}</td>
//               <td className="p-2 border">{alarm.creation_date}</td>
//               <td className="p-2 border">
//                 {alarm.acknowledge_by === "Unacknowledged" ? ( <span className="text-red-600 font-semibold">Unacknowledged</span> ) : (
//                   <span className="text-green-600">{alarm.acknowledge_by}</span> )}
//               </td>
//               <td className="p-2 border"> {alarm.acknowledge_date || "-"}</td>
//               <td className="p-2 border text-center">
//                 {alarm.acknowledge_by === "Unacknowledged" ? (
//                   <button onClick={() => acknowledgeAlarm(alarm.id)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"> Acknowledge </button> ) : ( "-" )}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }
