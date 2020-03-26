import React, { useState, useEffect } from "react";
// import GaugeChart from "./components/graphs/GaugeChart";
import SkeletonD3 from "./components/graphs/SkeletonD3";
import BarChart from "./components/graphs/BarChart";
import Histogram from "./components/graphs/Histogram";
import GaugeChart from "./components/graphs/GaugeChart";
import Dougnut from "./components/graphs/Dougnut";
import "./App.css";

import dataWeather from "./my_weather_data";

const dataDougnut = [
  { date: 0, value: 4.827326614168159 },
  { date: 1, value: 89.05377227035503 },
  { date: 2, value: 86.01086379813351 },
  { date: 3, value: 50.11645255255917 },
  { date: 4, value: 16.63891630670513 }
];

function App() {
  const [data, setData] = useState([25, 30, 45, 60, 10, 65, 75]);

  // Histogram params
  const metricAccessor = d => d.humidity;
  const yAccessor = d => d.length;

  return (
    <React.Fragment>
      {/* <SkeletonD3 data={data} /> */}
      <div>
        <span className="label">Animated Pie Hooks (D3 animations)</span>
        <Dougnut
          data={dataDougnut}
          width={200}
          height={200}
          innerRadius={60}
          outerRadius={100}
        />
      </div>
      <BarChart data={data} />

      <Histogram
        data={dataWeather}
        yAccessor={yAccessor}
        metricAccessor={metricAccessor}
        width={600}
      />
      <GaugeChart data={[0.5, 0.5]} />
    </React.Fragment>
  );
}

export default App;
