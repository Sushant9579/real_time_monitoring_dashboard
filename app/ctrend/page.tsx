"use client";
import Image from "next/image";
import LineChart from "@/component/linechart";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ApiDataFormat {
  date: string;
  vibration: string;
  speed: string;
  bearing_temperature: string;
  load_current: string;
  power_consumption: string;
  oil_pressure: string;
  motor_temperature: string;
}

export default function CustomTrend() {
  const router = useRouter();

  // State definitions
  const [machineStatus, setMachineStatus] = useState<Record<string, boolean>>({});
  const [alarmStatus, setAlarmStatus] = useState<Record<string, boolean>>({});
  const [machineName, setMachineName] = useState<string | null>(null);
  const [customData, setCustomData] = useState<ApiDataFormat[]>([]); 

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Format date to "DD-MM-YYYY HH:MM:SS"
  const formatDate = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Fetch machine status on mount
  useEffect(() => {
    const isTrue = localStorage.getItem("User");
    if (!isTrue) {
      router.push("/login");
    }

    const fetchMachineStatus = async () => {
      try {
        const res = await fetch("/api/checkmachine");
        const data = await res.json();
        if (data.success) setMachineStatus(data.machines);
      } catch (err) {
        console.error("Error fetching while Machine Status:", err);
      }
    };
    fetchMachineStatus();
  }, [router]);

  // Fetch custom trend data when all values are ready
  useEffect(() => {
    const fetchCustomData = async () => {
      if (!machineName || !startDate || !endDate) return;

      const parsedStartDate = formatDate(startDate);
      const parsedEndDate = formatDate(endDate);

      try {
        const res = await fetch(
          `/api/customtrend/${machineName}?start=${parsedStartDate}&end=${parsedEndDate}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "API Error");
        setCustomData(data.data); // API directly returns an array of rows
      } catch (err) {
        console.error("Error fetching custom trend data:", err);
      }
    };

    fetchCustomData();
  }, [machineName, startDate, endDate]);
  //console.log(customData)
  // Chart categories and data
  const customCategories: string[] = customData.map((item) => item.date);

  const customSeriesData = [
    { name: "Motor Temperature", data: customData.map((i) => parseFloat(i.motor_temperature)) },
    { name: "Vibration", data: customData.map((i) => parseFloat(i.vibration)) },
    { name: "Speed", data: customData.map((i) => parseFloat(i.speed)) },
    { name: "Bearing Temperature", data: customData.map((i) => parseFloat(i.bearing_temperature)) },
    { name: "Load Current", data: customData.map((i) => parseFloat(i.load_current)) },
    { name: "Power Consumption", data: customData.map((i) => parseFloat(i.power_consumption)) },
    { name: "Oil Pressure", data: customData.map((i) => parseFloat(i.oil_pressure)) },
  ];

  const machines = ["Machine 1", "Machine 2", "Machine 3"];

  // Machine indicator color logic
  const getStatusColor = (machine: string) => {
    if (machineStatus[machine]) return "bg-green-500";
    if (alarmStatus[machine]) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <section className="flex flex-col mx-6">
      {/* Header */}
      <article className="shadow-2xl/60 rounded-2xl py-4 px-6">
        <div className="text-xl flex justify-between">
          <span className="flex gap-x-4"> Selected Machine:{" "}
            <span className="font-semibold">{machineName || "None"}</span>
          </span>
        </div>
      </article>

      {/* Date Pickers */}
      <article className="flex flex-wrap items-center py-4 my-4 px-8 shadow-2xl/60 rounded-2xl gap-4">
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Select Start Date & Time:</label>
          <DatePicker selected={startDate} onChange={(date: Date | null) => setStartDate(date)} showTimeSelect dateFormat="dd-MM-yyyy HH:mm" className="border px-3 py-2 rounded w-64" placeholderText="Pick a Start Date and Time" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold">Select End Date & Time:</label>
          <DatePicker selected={endDate} onChange={(date: Date | null) => setEndDate(date)} showTimeSelect dateFormat="dd-MM-yyyy HH:mm" className="border px-3 py-2 rounded w-64" placeholderText="Pick an End Date and Time" />
        </div>
      </article>

      {/* Machine Cards */}
      <article className="flex flex-wrap justify-center items-center py-4 gap-x-20 gap-y-4 my-4 shadow-2xl/60 rounded-2xl">
        {machines.map((machine) => (
          <div key={machine} className="relative flex flex-col justify-center items-center border rounded-2xl max-w-1/4 overflow-hidden shadow-xl/30 z-0" >
            <Image src="/motor.jpg" alt="Motor Image" width={250} height={100} priority />
            <div className={`max-sm:hidden w-6 h-6 rounded-full absolute top-0 right-0 m-2 ${getStatusColor(machine)}`}></div>
            <button className="flex justify-center items-center cursor-pointer bg-amber-400 w-full h-10 rounded-b-2xl" onClick={() => setMachineName(machine)} > {machine} </button>
          </div>
        ))}
      </article>

      {/* Line Chart */}
      {customData.length >0 && <article className="my-2 shadow-2xl/60 rounded-2xl mb-5">
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold mb-4"> {machineName ? `${machineName} Parameters` : "Select a Machine"}</h2>
          <LineChart categories={customCategories} seriesData={customSeriesData} />
        </div>
      </article>}
    </section>
  );
}
