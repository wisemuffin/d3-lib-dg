import React, { useState } from "react";
// import GaugeChart from "./components/graphs/GaugeChart";
import SkeletonD3 from "./components/graphs/SkeletonD3";
import GaugeChart from "./components/graphs/GaugeChart";
import "./App.css";

function App() {
  const [data, setData] = useState([25, 30, 45, 60, 10, 65, 75]);

  return (
    <React.Fragment>
      {/* <GaugeChart data={[0.5, 0.5]} /> */}
      <SkeletonD3 data={data} />
      <GaugeChart data={[0.5, 0.5]} />
    </React.Fragment>
  );
}

export default App;
