'use client'
import Image from "next/image";
import LineChart from "@/component/linechart";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";

interface apiDataformat {
  date: string,
  vibration: string;
  speed: string;
  bearing_temperature: string;
  load_current: string;
  power_consumption: string;
  oil_pressure: string;
  motor_temperature: string;
}

export default function Trend() {
  const router = useRouter();

  const [machineStatus,setMachineStatus] = useState<Record<string, boolean>>({});
  const [alarmStatus,setAlarmStatus] = useState<Record<string, boolean>>({});
  const [machineName,setMachineName] = useState<string | null>(null);
  const [hoursData,setHoursData] = useState<apiDataformat[]>([]);
  const [dateData,setDateData] = useState<apiDataformat[]>([]);
  const [monthData,setMonthData] = useState<apiDataformat[]>([]);

   useEffect(()=>{
      const istrue = localStorage.getItem('User');
      if(!istrue){
        router.push(`${process.env.NEXT_PUBLIC_API_URL}/login`)
      }
  const fetchMachineStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkmachine`);
        const data = await res.json();
        if (data.success) setMachineStatus(data.machines);
      } catch (err) {
        console.error("Error fetching while Machine Status:", err);
      }
    };
    const fetchAlarmStatus = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/checkalarm`);
        const data = await res.json();
        if (data.success) setAlarmStatus(data.machines);
      } catch (err) {
        console.error("Error fetching while Machine Status:", err);
      }
    };
    fetchAlarmStatus();
    fetchMachineStatus();
    },[router])
    
    // OnClick useEffect
    useEffect(()=>{
      if(machineName !== null){
        const hoursDatafunc = async () =>{
       try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trend/last24h/${machineName}/`);
        const data = await res.json();
        if (data.success) setHoursData(data.data);
      } catch (err) {
        console.error("Error fetching while Machine Line Chart Hours Data:", err);
      }
        }
        const DateDatafunc = async () =>{
        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trend/datewise/${machineName}/`);
        const data = await res.json();
        if (data.success) setDateData(data.data);
      } catch (err) {
        console.error("Error fetching while Machine Line Chart Date Data:", err);
      }
        }
        const MonthDatafunc = async () =>{
        try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/trend/monthwise/${machineName}/`);
        const data = await res.json();
        if (data.success) setMonthData(data.data);
      } catch (err) {
        console.error("Error fetching while Machine Line Chart Monthwise Data:", err);
      }
        }
        hoursDatafunc();
        DateDatafunc();
        MonthDatafunc();
      }

    },[machineName])

    // Hours Data Linked
  // Convert lineChartData into chart-friendly format
  const Hourcategories: string[] = hoursData.map((item) => String(item.date ?? ""));

      //console.log(categories)
        const HourseriesData = [
        {
          name: "Motor Temperature",
          data: hoursData.map((item) => parseFloat(item.motor_temperature)),
        },
        {
          name: "Vibration",
          data: hoursData.map((item) => parseFloat(item.vibration)),
        },
        {
          name: "Speed",
          data: hoursData.map((item) => parseFloat(item.speed)),
        },
        {
          name: "Bearing Temperature",
          data: hoursData.map((item) => parseFloat(item.bearing_temperature)),
        },
        {
          name: "Load Current",
          data: hoursData.map((item) => parseFloat(item.load_current)),
        },
        {
          name: "Power Consumption",
          data: hoursData.map((item) => parseFloat(item.power_consumption)),
        },
        {
          name: "Oil Pressure",
          data: hoursData.map((item) => parseFloat(item.oil_pressure)),
        },
      ];

    // Date Data Linked
  // Convert lineChartData into chart-friendly format
  const Datecategories: string[] = dateData.map((item) => String(item.date ?? ""));

      //console.log(categories)
        const DateseriesData = [
        {
          name: "Motor Temperature",
          data: dateData.map((item) => parseFloat(item.motor_temperature)),
        },
        {
          name: "Vibration",
          data: dateData.map((item) => parseFloat(item.vibration)),
        },
        {
          name: "Speed",
          data: dateData.map((item) => parseFloat(item.speed)),
        },
        {
          name: "Bearing Temperature",
          data: dateData.map((item) => parseFloat(item.bearing_temperature)),
        },
        {
          name: "Load Current",
          data: dateData.map((item) => parseFloat(item.load_current)),
        },
        {
          name: "Power Consumption",
          data: dateData.map((item) => parseFloat(item.power_consumption)),
        },
        {
          name: "Oil Pressure",
          data: dateData.map((item) => parseFloat(item.oil_pressure)),
        },
      ];

    // Month Data Linked
  // Convert lineChartData into chart-friendly format
  const Monthcategories: string[] = monthData.map((item) => String(item.date ?? ""));

      //console.log(categories)
        const MonthseriesData = [
        {
          name: "Motor Temperature",
          data: monthData.map((item) => parseFloat(item.motor_temperature)),
        },
        {
          name: "Vibration",
          data: monthData.map((item) => parseFloat(item.vibration)),
        },
        {
          name: "Speed",
          data: monthData.map((item) => parseFloat(item.speed)),
        },
        {
          name: "Bearing Temperature",
          data: monthData.map((item) => parseFloat(item.bearing_temperature)),
        },
        {
          name: "Load Current",
          data: monthData.map((item) => parseFloat(item.load_current)),
        },
        {
          name: "Power Consumption",
          data: monthData.map((item) => parseFloat(item.power_consumption)),
        },
        {
          name: "Oil Pressure",
          data: monthData.map((item) => parseFloat(item.oil_pressure)),
        },
      ];


  const machines = ["Machine 1", "Machine 2", "Machine 3"];
   // Helper to get status color
  const getStatusColor = (machine: string) => {
    if (alarmStatus[machine]) return "bg-yellow-500";
    if (machineStatus[machine]) return "bg-green-500";
    return "bg-red-500";
  };
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

        

      {hoursData.length > 0 && <article className="my-2 shadow-2xl/60 rounded-2xl mb-5">
       <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Daily Hours Trend</h2>
            <LineChart categories={Hourcategories} seriesData={HourseriesData} />
        </div>
       
      </article>}
      {dateData.length > 0 && <article className="my-2 shadow-2xl/60 rounded-2xl mb-5">
        <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Monthly Trend</h2>
            <LineChart categories={Datecategories} seriesData={DateseriesData} />
        </div>
      </article>}
      {monthData.length > 0 && <article className="my-2 shadow-2xl/60 rounded-2xl mb-5">
       <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Yearly Trend</h2>
            <LineChart categories={Monthcategories} seriesData={MonthseriesData} />
        </div>
      </article>}
    </section>
  );
}
