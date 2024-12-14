import React from 'react';
import Plot from 'react-plotly.js';
import "./GeneralStyles.scss"

export function Visualization({ category }) {
    // Extract data for the chart
    const clusterData = category.cluster_data.map(item => ({
        score: item.score,
        user: item.user_id,
        cluster: item.cluster
    }));

    const centroids = category.cluster_centroids;

    // Prepare data for Scatter plot
    const data = [
        {
            type: 'scatter',
            mode: 'markers',
            x: clusterData.map(item => item.user),
            y: clusterData.map(item => item.score),
            marker: {
                size: 10,
                color: clusterData.map(item => {
                    if (item.cluster === 0) return 'rgba(255, 99, 132, 0.7)';
                    if (item.cluster === 1) return 'rgba(54, 162, 235, 0.7)';
                    return 'rgba(75, 192, 192, 0.7)';
                }),
            },
            text: clusterData.map(
                item => `User: ${item.user}, Score: ${item.score}, Cluster: ${item.cluster}`
            ),
            hoverinfo: 'text',
            name: 'Data Points',
        },
    ];

    // Layout configuration for the chart
    const layout = {
        title: {
            text: 'KMeans Clustering of Scores',
            font: {
                size: 18
            }
        },
        xaxis: {
            title: {
                text: 'Users'
            }
        },
        yaxis: {
            title: {
                text: 'Score'
            },
            rangemode: 'tozero',
        },
        showlegend: false,
        width: 600,
        height: 400,
    };
    

    return (
        <div>
            <div>
                <Plot
                    data={data}
                    layout={layout}
                    config={{ responsive: true }}
                />
            </div>
        </div>
    );
}
