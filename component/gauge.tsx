"use client";
import { useEffect, useRef } from "react";

interface Thresholds {
  green: number;
  yellow: number;
  red: number;
}

interface RadialGaugeProps {
  value: number;
  minValue?: number;
  maxValue?: number;
  thresholds?: Thresholds;
  units?: string;
  size?: number;
}

export default function RadialGauge({
  value,
  minValue = 0,
  maxValue = 220,
  thresholds = { green: 120, yellow: 160, red: 200 },
  units = "km/h",
  size = 200,
}: RadialGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gaugeRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadGauge = async () => {
      const { RadialGauge } = await import("canvas-gauges");

      const highlights = [
        { from: minValue, to: thresholds.green, color: "rgba(0, 200, 0, 0.6)" },     // Green
        { from: thresholds.green, to: thresholds.yellow, color: "rgba(255, 200, 0, 0.6)" }, // Yellow
        { from: thresholds.yellow, to: thresholds.red, color: "rgba(255, 0, 0, 0.6)" },     // Red
      ];

      if (!gaugeRef.current) {
        gaugeRef.current = new RadialGauge({
          renderTo: canvasRef.current!,
          width: size,
          height: size,
          units,
          title: false,
          value,
          minValue,
          maxValue,
          majorTicks: Array.from({ length: 11 }, (_, i) =>
            String(Math.round((i * maxValue) / 10))
          ),
          minorTicks: 4,
          strokeTicks: true,
          highlights,
          colorPlate: "#f5f5f5",         // Light plate
          colorMajorTicks: "#666",
          colorMinorTicks: "#999",
          colorNumbers: "#333",
          colorNeedle: "#000",           // Black needle
          needleType: "arrow",
          needleWidth: 3,
          needleCircleSize: 5,
          needleCircleOuter: true,
          needleCircleInner: false,
          valueBox: true,
          valueBoxBorderRadius: 5,
          animationRule: "linear",
          animationDuration: 500,
          borders: false,
        }).draw();
      } else {
        gaugeRef.current.update({ value, highlights });
      }
    };

    loadGauge();
  }, [value, minValue, maxValue, thresholds, units, size]);

  return (
    <div className="flex justify-center items-center">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
}




// 'use client';
// import React from 'react';
// import {
//   CircularGaugeComponent,
//   AxesDirective,
//   AxisDirective,
//   PointersDirective,
//   PointerDirective,
//   RangesDirective,
//   RangeDirective,
//   Inject,
// } from '@syncfusion/ej2-react-circulargauge';

// type Props = {
//   value: number;
//   min: number;
//   max: number;
//   fs: number;
//   fe: number;
//   fcolor: string;
//   ms: number;
//   me: number;
//   mcolor: string;
//   es: number;
//   ee: number;
//   ecolor: string;
// };

// export function App({
//   value,
//   min,
//   max,
//   fs,
//   fe,
//   fcolor,
//   ms,
//   me,
//   mcolor,
//   es,
//   ee,
//   ecolor,
// }: Props) {
//   const startAngle = 210;
//   const endAngle = 150;

//   return (
//     <>
//       {/* Hide Syncfusion license error globally */}
//       <style jsx global>{`
//         .syncfusion-license-error {
//           display: none !important;
//         }
//       `}</style>

//       <div style={{ width: '300px', margin: '3rem auto' }}>
//         <CircularGaugeComponent background="transparent" width="100%" height="250px">
//           <Inject services={[]} />
//           <AxesDirective>
//             <AxisDirective
//               minimum={min}
//               maximum={max}
//               radius="90%"
//               startAngle={startAngle}
//               endAngle={endAngle}
//               majorTicks={{ interval: 10, color: '#9E9E9E', height: 10 }}
//               minorTicks={{ interval: 2, height: 5, color: '#BDBDBD' }}
//               lineStyle={{ width: 2, color: '#E0E0E0' }}
//               labelStyle={{ font: { size: '12px', color: '#333' } }}
//             >
//               <RangesDirective>
//                 <RangeDirective start={fs} end={fe} color={fcolor} />
//                 <RangeDirective start={ms} end={me} color={mcolor} />
//                 <RangeDirective start={es} end={ee} color={ecolor} />
//               </RangesDirective>

//               <PointersDirective>
//                 <PointerDirective
//                   value={value}
//                   radius="80%"
//                   color="#222"
//                   pointerWidth={6}
//                   needleStartWidth={1}
//                   needleEndWidth={6}
//                   cap={{
//                     radius: 8,
//                     color: '#222',
//                     border: { width: 1, color: '#444' },
//                   }}
//                   animation={{ enable: true, duration: 1000 }}
//                 />
//               </PointersDirective>
//             </AxisDirective>
//           </AxesDirective>
//         </CircularGaugeComponent>
//       </div>
//     </>
//   );
// }

// export default App;


