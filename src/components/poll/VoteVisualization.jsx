import { Pie, Bar } from 'react-chartjs-2';
import {Chart as ChartJS,ArcElement,CategoryScale,LinearScale,BarElement,Title,Tooltip,Legend} from 'chart.js';
import './PollComponents.css';

ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const VoteVisualization = ({ poll }) => {
    if (!poll || !poll.votes) return null;

    const totalVotes = Object.values(poll.votes).reduce((a, b) => a + b, 0);

    const colors = [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#43e97b',
        '#fa709a'
    ];

    const labels = poll.options;
    const data = poll.options.map(option => poll.votes[option] || 0);
    const percentages = data.map(value => 
        totalVotes > 0 ? ((value / totalVotes) * 100).toFixed(1) : 0
    );

    const chartData = {
        labels: labels.map((label, i) => `${label} (${percentages[i]}%)`),
        datasets: [
        {
            data: data,
            backgroundColor: colors.slice(0, labels.length),
            borderColor: '#ffffff',
            borderWidth: 2
        }
        ]
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            position: 'bottom',
            labels: {
            padding: 15,
            font: {
                size: 12,
                family: "'Inter', sans-serif"
            }
            }
        },
        tooltip: {
            callbacks: {
            label: function(context) {
                const label = poll.options[context.dataIndex];
                const value = context.parsed;
                const percentage = percentages[context.dataIndex];
                return `${label}: ${value} votes (${percentage}%)`;
            }
            }
        }
        }
    };

    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
        legend: {
            display: false
        },
        tooltip: {
            callbacks: {
            label: function(context) {
                const value = context.parsed.y;
                const percentage = percentages[context.dataIndex];
                return `${value} votes (${percentage}%)`;
            }
            }
        }
        },
        scales: {
        y: {
            beginAtZero: true,
            ticks: {
            stepSize: 1
            }
        }
        }
    };

    return (
        <div className="visualization-section">
        <h3>Vote Distribution</h3>
        
        {totalVotes === 0 ? (
            <div className="no-votes-message">
            <p>No votes yet. Be the first to vote!</p>
            </div>
        ) : (
            <>
            <div className="vote-breakdown">
                {poll.options.map((option, index) => {
                const votes = poll.votes[option] || 0;
                const percentage = percentages[index];
                
                return (
                    <div key={option} className="breakdown-item">
                    <div className="breakdown-header">
                        <span className="breakdown-label">
                        <span 
                            className="color-dot" 
                            style={{ backgroundColor: colors[index] }}
                        ></span>
                        {option}
                        </span>
                        <span className="breakdown-value">{votes} votes</span>
                    </div>
                    <div className="breakdown-bar">
                        <div 
                        className="breakdown-fill" 
                        style={{ 
                            width: `${percentage}%`,
                            backgroundColor: colors[index]
                        }}
                        ></div>
                    </div>
                    <span className="breakdown-percentage">{percentage}%</span>
                    </div>
                );
                })}
            </div>

            <div className="charts-container">
                <div className="chart-wrapper">
                <h4>Pie Chart</h4>
                <div className="chart-canvas">
                    <Pie data={chartData} options={pieOptions} />
                </div>
                </div>

                <div className="chart-wrapper">
                <h4>Bar Chart</h4>
                <div className="chart-canvas">
                    <Bar data={chartData} options={barOptions} />
                </div>
                </div>
            </div>
            </>
        )}
        </div>
    );
};

export default VoteVisualization;