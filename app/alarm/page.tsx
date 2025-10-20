'use client';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

  // -------------------- Load User & Fetch Alarms --------------------
  useEffect(() => {
    const userData = localStorage.getItem("User");

    if (!userData) {
      router.push("/login");
      return;
    }

    const parsed = JSON.parse(userData);
    const role = parsed.Role;
    setAcknowledgerName(parsed.Username);

    if (role !== "Admin" && role !== "SuperVisor") {
      router.push("/");
      return;
    }

    async function fetchAlarms() {
      try {
        const res = await fetch("/api/alarm");
        if (!res.ok) throw new Error("Failed to fetch alarms");
        const data = await res.json();
        setAlarms(data);
      } catch (err) {
        console.error("Error fetching alarms:", err);
      }
    }

    // Initial fetch
    fetchAlarms();

    // Auto-refresh alarms every 4 min
    const interval = setInterval(fetchAlarms, 240000);
    return () => clearInterval(interval);

  }, [router]);

  // -------------------- Handle Acknowledge --------------------
  const acknowledgeAlarm = async (id: number) => {
    const acknowledgeBy = acknowledgerName;

    const res = await fetch(`/api/alarm`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, acknowledgeBy }),
    });

    if (res.ok) {
      alert(" Alarm acknowledged successfully!");
      // Re-fetch data (no reload)
      const updated = await fetch("/api/alarm").then((r) => r.json());
      setAlarms(updated);
    } else {
      alert(" Failed to acknowledge alarm");
    }
  };

  // -------------------- Render --------------------
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">🚨 Alarms Dashboard</h1>

      <table className="min-w-full border text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Sr No.</th>
            <th className="p-2 border">Alarm Name</th>
            <th className="p-2 border">Machine</th>
            <th className="p-2 border">Creation Date</th>
            <th className="p-2 border">Acknowledge By</th>
            <th className="p-2 border">Acknowledge Date</th>
            <th className="p-2 border text-center">Action</th>
          </tr>
        </thead>

        <tbody>
          {alarms.map((alarm, index) => (
            <tr key={alarm.id} className="text-center">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{alarm.alarm_name}</td>
              <td className="p-2 border">{alarm.machine}</td>
              <td className="p-2 border">{alarm.creation_date}</td>
              <td className="p-2 border">
                {alarm.acknowledge_by === "Unacknowledged" ? ( <span className="text-red-600 font-semibold">Unacknowledged</span> ) : (
                  <span className="text-green-600">{alarm.acknowledge_by}</span> )}
              </td>
              <td className="p-2 border"> {alarm.acknowledge_date || "-"}</td>
              <td className="p-2 border text-center">
                {alarm.acknowledge_by === "Unacknowledged" ? (
                  <button onClick={() => acknowledgeAlarm(alarm.id)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"> Acknowledge </button> ) : ( "-" )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
