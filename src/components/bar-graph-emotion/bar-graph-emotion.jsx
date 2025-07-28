import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { emotionCode, getEmotionImage } from "../../shared";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarGraphEmotion = ({ students }) => {
  const [graphWidth, setGraphWidth] = useState(
    window.innerWidth > 768 ? 600 : 300
  );

  useEffect(() => {
    const handleResize = () => {
      setGraphWidth(window.innerWidth > 768 ? 600 : 300);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Extract emotion list dynamically
  const emotions = Object.values(emotionCode);

  // Count occurrences of each emotion
  const emotionCounts = emotions.reduce((acc, emotion) => {
    acc[emotion.code] = 0; // Initialize count
    return acc;
  }, {});

  students.forEach(({ moodCode }) => {
    if (moodCode && emotionCounts[moodCode] !== undefined) {
      emotionCounts[moodCode] += 1; // Increment count
    }
  });

  // Prepare data for the graph
  const data = {
    labels: emotions.map((emotion) => emotion.description), // Emotion codes
    datasets: [
      {
        label: "Number of Students",
        data: emotions.map((emotion) => emotionCounts[emotion.code]),
        backgroundColor: [
          "#ebff00", // Joy
          "#00ff0a", // Motivated
          "#0038ff", // Calm
          "#ffb800", // Anxious
          "#6782ab", // Sad
          "#ff0000", // Frustrated
        ],
        borderColor: "#ccc",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Student Emotions Bar Graph",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
        },
        ticks: {
          display: false, // Hide default text labels to use icons instead
        },
      },
      y: {
        title: {
          display: true,
          text: "Count",
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1, // Increment by 1
          callback: (value) => value.toString(), // Ensures no decimals
        },
      },
    },
  };

  // Custom plugin to draw emotion icons
  const drawIconsPlugin = {
    id: "drawIcons",
    afterDraw: (chart) => {
      const { ctx, chartArea, scales } = chart;
      const xAxis = scales.x;
      const yAxis = scales.y;

      xAxis.ticks.forEach((_, index) => {
        const emotion = emotions[index];
        const iconSrc = getEmotionImage(emotion.code);
        const xPos = xAxis.getPixelForTick(index); // X position for the tick
        const yPos = chartArea.bottom + 10; // Position below the chart

        // Draw the image icon
        const img = new Image();
        img.src = iconSrc;
        img.onload = () => {
          ctx.drawImage(img, xPos - 12, yPos, 24, 24); // Centered image
        };
      });
    },
  };

  return (
    <div
      style={{
        padding: "15px",
        width: graphWidth,
        background: "#b4edd8",
        borderRadius: "15px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
      }}
    >
      <Bar data={data} options={options} plugins={[drawIconsPlugin]} />
    </div>
  );
};

export default BarGraphEmotion;
