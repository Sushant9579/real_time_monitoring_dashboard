"use client";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface LineChartProps {
  categories: string[];
  seriesData: {
    name: string;
    data: number[];
  }[];
}

export default function LineChart({ categories, seriesData }: LineChartProps) {
  const options: Highcharts.Options = {
    chart: { type: "line" },
    title: { text: ''},
    xAxis: {
      categories,
      crosshair: true, // correct way to enable crosshairs
    },
    yAxis: { title: { text: "Value" } },
    series: seriesData as Highcharts.SeriesOptionsType[],
    tooltip: { shared: true }, // remove 'crosshairs' from here
    legend: { enabled: true },
    credits: { enabled: false },
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}
