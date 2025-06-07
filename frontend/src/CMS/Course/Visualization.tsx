import React from 'react';
import Plot from 'react-plotly.js';
import { Layout, PlotData } from 'plotly.js';
import "./GeneralStyles.scss";

interface VisualizationProps {
  category: {
    data_points: { score: number; user_id: string; cluster: number }[];
    id: string;
    name: string;
  };
}

export function Visualization({ category }: VisualizationProps) {
  const clusterColors: { [key: number]: string } = {
    0: 'rgba(255, 99, 132, 0.8)',  // Red for Low
    1: 'rgba(255, 206, 86, 0.8)',  // Yellow for Average
    2: 'rgba(75, 192, 192, 0.8)',  // Green for High
  };

  // Default color for clusters with fewer than 3 data points
  const defaultColor = 'rgba(75, 192, 192, 0.8)';

  // Sort data_points from lowest to highest score
  const sortedDataPoints = [...category.data_points].sort((a, b) => a.score - b.score);

  // Separate data points into three groups based on cluster
  const groupedData: Partial<PlotData>[] = [0, 1, 2].map(cluster => {
    const clusterData = sortedDataPoints.filter(item => item.cluster === cluster);

    // Check if the cluster has 3 or more data points
    const hasEnoughData = clusterData.length >= 1;

    return {
      type: 'scatter',
      mode: 'markers',
      x: clusterData.map(item => item.user_id ? item.user_id.split('@')[0]: null), // X-axis: Student IDs
      y: clusterData.map(item => item.score), // Y-axis: Score
      marker: {
        size: 10,
        color: hasEnoughData ? clusterColors[cluster] : defaultColor,
      },
      text: clusterData.map(item => `User: ${item.user_id}, Score: ${item.score}`),
      hoverinfo: 'text',
      name: cluster === 0 ? "Low" : cluster === 1 ? "Average" : "High", // Legend labels
    };
  });

  // Layout configuration
  const layout: Partial<Layout> = {
    title: {
      text: `Scores Distribution for ${category.name}`,
      font: {
        size: 18,
      },
    },
    xaxis: {
      title: { text: 'Student ID' }, 
    },
    yaxis: {
      title: { text: 'Score' },
      rangemode: 'tozero',
    },
    showlegend: true,
    width: 600,
    height: 400,
  };

  return (
    <div>
      <Plot
        data={groupedData}
        layout={layout}
        config={{ responsive: true }}
      />
    </div>
  );
}