import React, { useState, useEffect } from "react";
// import GaugeChart from "./components/graphs/GaugeChart";
import SkeletonD3 from "./components/graphs/SkeletonD3";
import BarChart from "./components/graphs/BarChart";
import Histogram from "./components/graphs/Histogram";
import GaugeChart from "./components/graphs/GaugeChart";
import Dougnut from "./components/graphs/Dougnut";
import BoxPlot from "./components/graphs/BoxPlot";
import BarChartRace from "./components/graphs/BarChartRace";
import "./App.css";

import Button from "@material-ui/core/Button";

import dataWeather from "./my_weather_data";
import dataWorldPopulation from "./populationWorld";

const dataDougnut = [
  { date: 0, value: 4.827326614168159 },
  { date: 1, value: 89.05377227035503 },
  { date: 2, value: 86.01086379813351 },
  { date: 3, value: 50.11645255255917 },
  { date: 4, value: 16.63891630670513 }
];

dataWorldPopulation.forEach(d => {
  d.value = +d.value;
  d.lastValue = +d.lastValue;
  d.value = isNaN(d.value) ? 0 : d.value;
  d.date = +d.year;
  // d.colour = d3.hsl(Math.random()*360,0.75,0.75)
  d.colour = "#C8BDFF";
});

function App() {
  const [data, setData] = useState([25, 30, 45, 60, 10, 65, 75]);
  let [barRaceNum, setBarRaceNum] = useState(1);
  return (
    <React.Fragment>
      {/* <SkeletonD3 data={data} /> */}
      <BarChartRace
        data={dataWorldPopulation}
        width={600}
        dateGrain="year"
        top_n={10}
        startDate={1600}
        endDate={1644}
        forceReRender={barRaceNum}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={() => setBarRaceNum(++barRaceNum)}
      >
        Reset Bar Race
      </Button>

      <BoxPlot
        data={dataWeather}
        yAccessor={d => d.temperatureMax}
        xDateAccessor={d => d.month}
        width={600}
      />
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
        yAccessor={d => d.length}
        metricAccessor={d => d.humidity}
        width={600}
      />
      <GaugeChart data={[0.5, 0.5]} />
    </React.Fragment>
  );
}

export default App;
