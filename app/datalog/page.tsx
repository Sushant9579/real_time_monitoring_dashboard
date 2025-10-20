"use client";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface apiDataformat {
  datetime: string;
  vibration: string;
  speed: string;
  bearing_temperature: string;
  load_current: string;
  power_consumption: string;
  oil_pressure: string;
  motor_temperature: string;
}

export default function DataLog() {
  const router = useRouter();

  const [machineStatus, setMachineStatus] = useState<Record<string, boolean>>({});
  const [alarmStatus, setAlarmStatus] = useState<Record<string, boolean>>({});
  const [machineName, setMachineName] = useState<string | null>(null);
  const [datalogData, setDatalogData] = useState<apiDataformat[]>([]);
  const [dropdownvalue, setDropDownValue] = useState<apiDataformat[]>([]);
  const [StartDate, setStartDate] = useState<Date | null>(null);
  const [EndDate, setEndDate] = useState<Date | null>(null);
  const [timeRange, setTimeRange] = useState("");

  const formatDate = (date: Date): string => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  // Check user login
  useEffect(() => {
    const user = localStorage.getItem("User");
    if (!user) router.push("/login");

    const fetchMachineStatus = async () => {
      try {
        const res = await fetch("/api/checkmachine");
        const data = await res.json();
        if (data.success) setMachineStatus(data.machines);
      } catch (err) {
        console.error("Error fetching Machine Status:", err);
      }
    };
    const fetchAlarmStatus = async () => {
      try {
        const res = await fetch("/api/checkalarm");
        const data = await res.json();
        if (data.success) setAlarmStatus(data.machines);
      } catch (err) {
        console.error("Error fetching while Machine Status:", err);
      }
    };
    fetchAlarmStatus();
    fetchMachineStatus();
  }, [router]);

  // Fetch datalog data
  useEffect(() => {
    if (!machineName) return;

    const fetchDatalograngeData = async () => {
      if (!StartDate || !EndDate) return;

      const parsedStartDate = formatDate(StartDate);
      const parsedEndDate = formatDate(EndDate);

      try {
        const res = await fetch(
          `/api/datalog/datewise/${machineName}?start=${parsedStartDate}&end=${parsedEndDate}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "API Error");
        setDatalogData(data.data);
        setDropDownValue([]); // clear dropdownvalue when date range is selected
      } catch (err) {
        console.error("Error fetching datalog range data:", err);
      }
    };

    const fetchDatalogValueData = async () => {
      if (!timeRange) return;

      try {
        const res = await fetch(`/api/datalog/valuewise/${machineName}?value=${timeRange}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "API Error");
        setDropDownValue(data.data);
        setDatalogData([]); // clear datalogData when valuewise selected
      } catch (err) {
        console.error("Error fetching valuewise data:", err);
      }
    };

    if (StartDate && EndDate) {
      fetchDatalograngeData();
    } else if (timeRange) {
      fetchDatalogValueData();
    }
  }, [machineName, StartDate, EndDate, timeRange]);

  const machines = ["Machine 1", "Machine 2", "Machine 3"];
  const getStatusColor = (machine: string) => {
    if (alarmStatus[machine]) return "bg-yellow-500";
    if (machineStatus[machine]) return "bg-green-500";
    return "bg-red-500";
  };

  // Download logic
  const handleDownload = () => {
    const dataToDownload = dropdownvalue.length > 0 ? dropdownvalue : datalogData;
    const worksheet = XLSX.utils.json_to_sheet(dataToDownload);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataLog");
    const filename = `${machineName || "Machine"}_DataLog_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const isDownloadDisabled = datalogData.length === 0 && dropdownvalue.length === 0;
  const tableData = dropdownvalue.length > 0 ? dropdownvalue : datalogData;

  return (
    <section className="flex flex-col mx-6">
      {/* Header */}
      <article className="shadow-2xl/60 rounded-2xl py-4 px-6 mb-4">
        <div className="text-xl flex gap-x-4"> Selected Machine: <span className="font-semibold">{machineName || "None"}</span></div>
      </article>

      {/* Date Pickers & Time Range */}
      <article className="flex justify-between items-center py-4 my-4 px-8 shadow-2xl/60 rounded-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Select Start Date & Time:</label>
            <DatePicker selected={StartDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="Pp" className="border px-3 py-2 rounded w-64" placeholderText="Pick a Start Date and Time"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Select End Date & Time:</label>
            <DatePicker selected={EndDate} onChange={(date) => setEndDate(date)} showTimeSelect dateFormat="Pp" className="border px-3 py-2 rounded w-64" placeholderText="Pick an End Date and Time"/>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Select Option:</label>
            <select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="border px-3 py-2 rounded w-full">
              <option value="">Select Range</option>
              <option value="1day">1 Day</option>
              <option value="1week">1 Week</option>
              <option value="1month">1 Month</option>
              <option value="6month">6 Months</option>
            </select>
          </div>
        </div>

        <div>
          <button className={`px-4 py-3 font-semibold rounded-4xl ${ isDownloadDisabled ? "bg-gray-300 cursor-not-allowed text-gray-600" : "bg-violet-200 hover:bg-violet-300"}`} onClick={handleDownload} disabled={isDownloadDisabled}> Download </button>
        </div>
      </article>

      {/* Machine Cards */}
      <article className="flex flex-wrap justify-center items-center py-4 gap-x-20 gap-y-4 my-4 shadow-2xl/60 rounded-2xl">
        {machines.map((machine) => (
          <div key={machine} className="relative flex flex-col justify-center items-center border rounded-2xl max-w-1/4 overflow-hidden shadow-xl/30 z-0" >
            <Image src="/motor.jpg" alt="Motor" width={250} height={100} />
            <div className={`w-6 h-6 rounded-full absolute top-0 right-0 m-2 ${getStatusColor(machine)}`}></div>
            <button className="flex justify-center items-center cursor-pointer bg-amber-400 w-full h-10 rounded-b-2xl" onClick={() => setMachineName(machine)} > {machine} </button>
          </div>
        ))}
      </article>

      {/* Table */}
      {tableData.length > 0 && (
        <article className="shadow-2xl/60 rounded-2xl py-8 px-6 my-5 overflow-x-auto">
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Date & Time</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Motor Temp</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Vibration</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Speed</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Bearing Temp</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Load Current</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Oil Pressure</th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Power Consumption</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {tableData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{row.datetime}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.motor_temperature}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.vibration}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.speed}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.bearing_temperature}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.load_current}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.oil_pressure}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{row.power_consumption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {tableData.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No data available to display.</p>
      )}
    </section>
  );
}
