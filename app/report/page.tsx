"use client";

import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface SummaryData {
  machine: string;
  avg_vibration: string;
  avg_speed: string;
  avg_bearing_temperature: string;
  avg_load_current: string;
  avg_power_consumption: string;
  avg_oil_pressure: string;
  avg_motor_temperature: string;
}

interface DetailedData {
  date: string;
  motor_temperature: string;
  vibration: string;
  speed: string;
  bearing_temperature: string;
  load_current: string;
  oil_pressure: string;
  power_consumption: string;
}

export default function Report() {
  const router = useRouter();

  const [StartDate, setStartDate] = useState<Date | null>(null);
  const [EndDate, setEndDate] = useState<Date | null>(null);
  const [machineStatus, setMachineStatus] = useState<Record<string, boolean>>({});
  const [alarmStatus, setAlarmStatus] = useState<Record<string, boolean>>({});
  const [machineName, setMachineName] = useState<string | null>(null);
  const [reportSummaryData, setSummaryData] = useState<SummaryData[]>([]);
  const [reportDetailedData, setDetailedData] = useState<DetailedData[]>([]);
  const [loading, setLoading] = useState(false);

  const machines = ["Machine 1", "Machine 2", "Machine 3"];

  // --- Helper: Format date to "DD-MM-YYYY HH:mm:ss"
  const formatDate = (date: Date): string => {
    const utc = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(utc.getDate())}-${pad(utc.getMonth() + 1)}-${utc.getFullYear()} ${pad(
      utc.getHours()
    )}:${pad(utc.getMinutes())}:${pad(utc.getSeconds())}`;
  };

  // --- Fetch machine status + check login
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

  // --- Fetch data whenever StartDate, EndDate, or machineName changes
  useEffect(() => {
    const fetchData = async () => {
      if (!StartDate || !EndDate) return;

      setLoading(true);
      const parsedStart = formatDate(StartDate);
      const parsedEnd = formatDate(EndDate);

      try {
        // Fetch Summary
        const summaryRes = await fetch(
          `/api/report/summary?start=${parsedStart}&end=${parsedEnd}`
        );
        const summaryData = await summaryRes.json();
        if (!summaryRes.ok) throw new Error(summaryData.error || "Failed to fetch summary");
        setSummaryData(summaryData.data);

        // Fetch Detailed (only when machine selected)
        if (machineName) {
          const detailRes = await fetch(
            `/api/report/detailed/${machineName}?start=${parsedStart}&end=${parsedEnd}`
          );
          const detailData = await detailRes.json();
          if (!detailRes.ok) throw new Error(detailData.error || "Failed to fetch detailed data");
          setDetailedData(detailData.data);
        } else {
          setDetailedData([]);
        }
      } catch (err) {
        console.error("Error fetching report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [StartDate, EndDate, machineName]);

  // --- Color status helper
  const getStatusColor = (machine: string) => {
    if (alarmStatus[machine]) return "bg-yellow-500";
    if (machineStatus[machine]) return "bg-green-500";
    return "bg-red-500";
  };

  // --- Download Excel
  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportDetailedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DataLog");
    const filename = `${machineName || "Machine"}_Report_${new Date()
      .toISOString()
      .replace(/[:.]/g, "-")}.xlsx`;
    XLSX.writeFile(workbook, filename);
  };

  const isDownloadDisabled = reportDetailedData.length === 0;

  return (
    <section className="flex flex-col mx-6">
      {/* Header */}
      <article className="shadow-2xl rounded-2xl py-4 px-6 mb-4">
        <div className="text-xl flex gap-x-4"> Selected Machine:{" "}<span className="font-semibold">{machineName || "None"}</span>
        </div>
      </article>

      {/* Date Pickers */}
      <article className="flex justify-between items-center py-4 my-4 px-8 shadow-2xl rounded-2xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Select Start Date & Time:</label>
            <DatePicker selected={StartDate} onChange={(date) => setStartDate(date)} showTimeSelect dateFormat="Pp" className="border px-3 py-2 rounded w-64" placeholderText="Pick a Start Date and Time" />
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-semibold">Select End Date & Time:</label>
            <DatePicker selected={EndDate} onChange={(date) => setEndDate(date)} showTimeSelect dateFormat="Pp" className="border px-3 py-2 rounded w-64" placeholderText="Pick an End Date and Time"/>
          </div>
        </div>
      </article>

      {/* Machine Cards */}
      <article className="flex flex-wrap justify-center items-center py-4 gap-x-20 gap-y-4 my-4 shadow-2xl rounded-2xl">
        {machines.map((machine) => (
          <div key={machine} className="relative flex flex-col justify-center items-center border rounded-2xl max-w-1/4 overflow-hidden shadow-xl">
            <Image src="/motor.jpg" alt="Motor" width={250} height={100} />
            <div className={`w-6 h-6 rounded-full absolute top-0 right-0 m-2 ${getStatusColor( machine )}`}></div>
            <button className="flex justify-center items-center cursor-pointer bg-amber-400 w-full h-10 rounded-b-2xl" onClick={() => setMachineName(machine)}>{machine} </button>
          </div>
        ))}
      </article>

      {/* Loading State */}
      {loading && <p className="text-center text-gray-500 mt-4">Loading report data...</p>}

      {/* Summary Table */}
      {!loading && reportSummaryData.length > 0 && (
        <article className="shadow-2xl rounded-2xl py-8 px-6 my-5 overflow-x-auto">
          <h2 className="text-xl font-semibold py-4">Summary Report:</h2>
          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Machine</th>
                <th className="px-4 py-2 text-left">Motor Temp</th>
                <th className="px-4 py-2 text-left">Vibration</th>
                <th className="px-4 py-2 text-left">Speed</th>
                <th className="px-4 py-2 text-left">Bearing Temp</th>
                <th className="px-4 py-2 text-left">Load Current</th>
                <th className="px-4 py-2 text-left">Oil Pressure</th>
                <th className="px-4 py-2 text-left">Power Consumption</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportSummaryData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{row.machine}</td>
                  <td className="px-4 py-2">{row.avg_motor_temperature}</td>
                  <td className="px-4 py-2">{row.avg_vibration}</td>
                  <td className="px-4 py-2">{row.avg_speed}</td>
                  <td className="px-4 py-2">{row.avg_bearing_temperature}</td>
                  <td className="px-4 py-2">{row.avg_load_current}</td>
                  <td className="px-4 py-2">{row.avg_oil_pressure}</td>
                  <td className="px-4 py-2">{row.avg_power_consumption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {/* Detailed Table */}
      {!loading && reportDetailedData.length > 0 && (
        <article className="shadow-2xl rounded-2xl py-8 px-6 my-5 overflow-x-auto">
          <div className="flex mb-4 justify-between items-center">
            <h2 className="text-xl font-semibold py-4">Detailed Report:</h2>
            <button className={`px-4 py-2 font-semibold rounded-4xl ${ isDownloadDisabled ? "bg-gray-300 cursor-not-allowed text-gray-600" : "bg-violet-200 hover:bg-violet-300" }`} onClick={handleDownload} disabled={isDownloadDisabled} > Download </button>
          </div>

          <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Motor Temp</th>
                <th className="px-4 py-2 text-left">Vibration</th>
                <th className="px-4 py-2 text-left">Speed</th>
                <th className="px-4 py-2 text-left">Bearing Temp</th>
                <th className="px-4 py-2 text-left">Load Current</th>
                <th className="px-4 py-2 text-left">Oil Pressure</th>
                <th className="px-4 py-2 text-left">Power Consumption</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportDetailedData.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{row.date}</td>
                  <td className="px-4 py-2">{row.motor_temperature}</td>
                  <td className="px-4 py-2">{row.vibration}</td>
                  <td className="px-4 py-2">{row.speed}</td>
                  <td className="px-4 py-2">{row.bearing_temperature}</td>
                  <td className="px-4 py-2">{row.load_current}</td>
                  <td className="px-4 py-2">{row.oil_pressure}</td>
                  <td className="px-4 py-2">{row.power_consumption}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      )}

      {/* Empty State */}
      {!loading && reportSummaryData.length === 0 && (
        <p className="text-center text-gray-500 mt-4"> Select a date range and machine to view report data. </p>
      )}
    </section>
  );
}
