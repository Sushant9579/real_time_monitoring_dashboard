'use client'
import Image from "next/image";
import RadialGauge from "@/component/gauge";
import LineChart from "@/component/linechart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface LineChartRow {
  motor_temperature: string;
  vibration: string;
  speed: string;
  bearing_temperature: string;
  load_current: string;
  power_consumption: string;
  oil_pressure: string;
  datetime: string;
}

interface GaugeData {
  motor_temperature: string;
  vibration: string;
  speed: string;
  bearing_temperature: string;
  load_current: string;
  power_consumption: string;
  oil_pressure: string;
  datetime: string;
}

export default function Home() {
   const router = useRouter();
   const [machineStatus,setMachineStatus] = useState<Record<string, boolean>>({})
   const [alarmStatus,setAlarmStatus] = useState<Record<string, boolean>>({})
   const [machineName,setMachineName] = useState<string | null>(null)
   const [gaugeData,setGaugeData] = useState<GaugeData | null>(null)
   const [linechartData,setLinechartData] = useState<LineChartRow[]>([])
  
     useEffect(()=>{
        const istrue = localStorage.getItem('User');
        if(!istrue){
          router.push('/login')
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
      },[router])
      // onclick useEffect
      useEffect(()=>{
       if(machineName !== null ){
        const getGaugeData = async ()=>{
        try {
        const res = await fetch(`/api/machine/${machineName}`);
        const data = await res.json();
        if (data.success) setGaugeData(data.data);
      } catch (err) {
        console.error("Error fetching while Machine Gauge Data:", err);
      }
       };
       const getLineChartData = async ()=>{
         try {
        const res = await fetch(`/api/machine/${machineName}/last10`);
        const data = await res.json();
        if (data.success) setLinechartData(data.data);
      } catch (err) {
        console.error("Error fetching while Machine Line Chart Data:", err);
      }
       };
       getGaugeData();
       getLineChartData();
       }
      },[machineName]);

      // Convert lineChartData into chart-friendly format
      const categories: string[] = linechartData.map((item) => String(item.datetime ?? ""));

      //console.log(categories)
        const seriesData = [
        {
          name: "Motor Temperature",
          data: linechartData.map((item) => parseFloat(item.motor_temperature)),
        },
        {
          name: "Vibration",
          data: linechartData.map((item) => parseFloat(item.vibration)),
        },
        {
          name: "Speed",
          data: linechartData.map((item) => parseFloat(item.speed)),
        },
        {
          name: "Bearing Temperature",
          data: linechartData.map((item) => parseFloat(item.bearing_temperature)),
        },
        {
          name: "Load Current",
          data: linechartData.map((item) => parseFloat(item.load_current)),
        },
        {
          name: "Power Consumption",
          data: linechartData.map((item) => parseFloat(item.power_consumption)),
        },
        {
          name: "Oil Pressure",
          data: linechartData.map((item) => parseFloat(item.oil_pressure)),
        },
      ];
    //console.log(seriesData)
    const machines = ["Machine 1", "Machine 2", "Machine 3"];
      // Helper to get status color
      const getStatusColor = (machine: string) => {
        if (alarmStatus[machine]) return "bg-yellow-500";
        if (machineStatus[machine]) return "bg-green-500";
        return "bg-red-500";
      };
      //console.log(alarmStatus);
  return (
    <section className="flex flex-col mx-6">
       {/* Selected Machine Header */}
      <article className="shadow-2xl/60 rounded-2xl py-4 px-6">
      <div className="text-xl flex justify-between">
        <span className="flex gap-x-4">Selected Machine: 
          <span className="flex justify-between">
            <span className="font-semibold">{machineName || "None"}
              </span>
              </span> 
               </span>
              <span className="text-base my-auto">{gaugeData?.datetime || ""}</span>
                </div>
      </article>
      {/* Machine Cards */}
       <article className="flex flex-wrap justify-center items-center py-4 gap-x-20 gap-y-4 my-4 shadow-2xl/60 rounded-2xl">
        {machines.map((machine) => (
          <div key={machine} className="relative flex flex-col justify-center items-center border rounded-2xl max-w-1/4 overflow-hidden shadow-xl/30 z-0" >
            <Image src="/motor.jpg" alt="Motor Image not found" width={250} height={100} priority/>
            <div className={`max-sm:hidden w-6 h-6 rounded-full absolute top-0 right-0 m-2 ${getStatusColor(machine)}`}></div>
            <button className="flex justify-center items-center cursor-pointer bg-amber-400 w-full h-10 rounded-b-2xl" onClick={()=>{setMachineName(machine)}}>{machine} </button>
          </div>
        ))}
      </article>
            {/* Gauge Section */}
      <article className="flex flex-wrap justify-center gap-x-8 gap-y-12 my-2 py-16 shadow-2xl/60 rounded-2xl">
      <div className="w-48 h-48 text-center">
         <RadialGauge value={parseFloat(gaugeData?.motor_temperature ?? "0")} minValue={0} maxValue={100} size={200} units="°C" thresholds={{ green: 45, yellow: 65, red: 100 }} />
        <p>Motor Temperature (°C)</p>
      </div>
      <div className="w-48 h-48 text-center">
        <RadialGauge value={parseFloat(gaugeData?.vibration ?? "0")} minValue={0.01} maxValue={10.0} thresholds={{ green: 2.5, yellow: 6, red: 10 }} units="mm/sRMS" />
        <p>Vibration (mm/sRMS)</p>
      </div>
      <div className="w-48 h-48 text-center">
        <RadialGauge value={parseFloat(gaugeData?.speed ?? "0")} minValue={500} maxValue={2500} thresholds={{ green: 1000, yellow: 1500, red: 2500 }} units="RPM" />
        <p>Speed (RPM)</p>
      </div>
      <div className="w-48 h-48 text-center">
        <RadialGauge value={parseFloat(gaugeData?.bearing_temperature ?? "0")} minValue={0} maxValue={100} thresholds={{ green: 35, yellow: 65, red: 100 }} units="°C" />
        <p>Bearing Temperature (°C)</p>
      </div>
      <div className="w-48 h-48 text-center">
        <RadialGauge value={parseFloat(gaugeData?.load_current ?? "0")} minValue={0} maxValue={60} thresholds={{ green: 25, yellow: 50, red: 60 }} units="A" />
        <p>Load Current (A)</p>
      </div>
      <div className="w-48 h-48 text-center">
        <RadialGauge value={parseFloat(gaugeData?.power_consumption ?? "0")} minValue={0} maxValue={100} thresholds={{ green: 45, yellow: 75, red: 100 }} units="kW" />
        <p>Power Consumption (kW)</p>
      </div>
      <div className="w-48 h-48 text-center">
        <RadialGauge value={parseFloat(gaugeData?.oil_pressure ?? "0")} minValue={0.01} maxValue={10.0} thresholds={{ green: 3, yellow: 5, red: 10.0 }} units="bar" />
        <p>Oil Pressure (bar)</p>
      </div>

    </article>

        
 {/* Line Chart */}
      {linechartData.length > 0 && <article className="my-6 shadow-2xl/60 rounded-2xl mb-5">
       <div className="p-8 text-center">
        {/* <h2 className="text-xl font-bold mb-4">Machine 1 Parameters</h2> */}
      <LineChart categories={categories} seriesData={seriesData} />
    </div>
      </article>}
    </section>
  );
}
