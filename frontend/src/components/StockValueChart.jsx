// /frontend/src/components/StockValueChart.jsx
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function StockValueChart({ chartData }) {
  const data = {
    // --- THIS IS THE UPDATED LINE ---
    labels: chartData.map(d => 
      new Date(d.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    ),
    // --- END OF UPDATE ---
    datasets: [
      {
        label: 'Total Stock Value ($)',
        data: chartData.map(d => d.cumulative_value),
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.2)', // Added a light fill
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Stock Value Over Time (Last 30 Days)',
        font: { size: 18 } // Make title a bit bigger
      },
    },
    scales: {
      y: {
        ticks: {
          // Format the Y-axis to show a dollar sign
          callback: function(value) {
            return '$' + value;
          }
        }
      }
    }
  };

  return <Line data={data} options={options} />;
}

export default StockValueChart;