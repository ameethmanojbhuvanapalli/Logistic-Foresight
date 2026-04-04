import { useEffect, useState } from "react";
import Chart from "react-apexcharts";

const LineChart = ({ predictedOrders, actualOrders, rmse }) => {
  const [chartConfig, setChartConfig] = useState({ series: [], options: {} });

  useEffect(() => {
    if (predictedOrders.length > 0 && actualOrders.length > 0) {
      const xValues = predictedOrders.map((item) => item.ds);
      const yhatValues = predictedOrders.map((item) => item.yhat);
      const actualYValues = actualOrders.map((item) => item.y);

      setChartConfig({
        options: {
          chart: {
            id: "line-chart",
            toolbar: { show: false }
          },
          xaxis: {
            categories: xValues,
            title: {
              text: "Date & Time"
            },
            tickPlacement: "on"
          },
          yaxis: {
            labels: {
              formatter: (value) => Math.round(value)
            },
            title: {
              text: "Orders"
            }
          },
          title: {
            text: "Orders Trend",
            align: "center"
          },
          stroke: {
            curve: "smooth",
            width: 2
          },
          markers: {
            size: 0
          }
        },
        series: [
          {
            name: "Predicted Orders",
            data: yhatValues,
            type: "line",
            color: "#0000FF"
          },
          {
            name: "Actual Orders",
            data: actualYValues,
            type: "line",
            color: "#FF0000"
          }
        ]
      });
    }
  }, [predictedOrders, actualOrders]); // Re-run the effect when the props change

  return (
    <div>
      {chartConfig.series.length > 0 ? (
        <>
          <Chart
            options={chartConfig.options}
            series={chartConfig.series}
            type="line"
            height={350}
          />
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <strong>RMSE: </strong>
            {rmse.toFixed(2)}
          </div>
        </>
      ) : (
        <p className="mt-2 text-red-500"> {console.log("CHART CONFIG: ", chartConfig)} No Chart Data....</p>
      )}
    </div> 
  );
};

export default LineChart;
