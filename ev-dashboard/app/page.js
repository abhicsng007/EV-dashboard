'use client';
import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { Sun, Moon } from 'lucide-react';
import { Bar, Pie, Line, Scatter } from 'react-chartjs-2';
import 'chart.js/auto';

export default function Dashboard() {
  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [yearFilter, setYearFilter] = useState('all');
  const [makeFilter, setMakeFilter] = useState('all');
  const [activeChart, setActiveChart] = useState(null);
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => !prevTheme);
  };

  // Vibrant color palette
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B59B6', '#3498DB',
    '#FF9F1C', '#2ECC71', '#E74C3C', '#1ABC9C'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/Electric_Vehicle_Population_Data.csv');
        const csvData = await response.text();
        Papa.parse(csvData, {
          header: true,
          complete: (result) => {
            setVehicleData(result.data);
            setLoading(false);
          },
        });
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Enhanced data processing functions
  const getFilteredData = () => {
    return vehicleData.filter(vehicle => {
      const yearMatch = yearFilter === 'all' || vehicle['Model Year'] === yearFilter;
      const makeMatch = makeFilter === 'all' || vehicle['Make'] === makeFilter;
      return yearMatch && makeMatch;
    });
  };

  // Data processing functions with filtering
  const processCountyDistribution = (data = getFilteredData()) => {
    const counts = {};
    data.forEach(vehicle => {
      const county = vehicle.County?.trim();
      if (county) counts[county] = (counts[county] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return {
      labels: sorted.map(([county]) => county),
      data: sorted.map(([, count]) => count)
    };
  };

  const processMakeDistribution = (data = getFilteredData()) => {
    const counts = {};
    data.forEach(vehicle => {
      const make = vehicle.Make?.trim();
      if (make) counts[make] = (counts[make] || 0) + 1;
    });
    const sorted = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
    return {
      labels: sorted.map(([make]) => make),
      data: sorted.map(([, count]) => count)
    };
  };

  const processModelYearDistribution = (data = getFilteredData()) => {
    const counts = {};
    data.forEach(vehicle => {
      const year = parseInt(vehicle['Model Year']);
      if (!isNaN(year) && year >= 2010 && year <= 2024) {
        counts[year] = (counts[year] || 0) + 1;
      }
    });
    const sorted = Object.entries(counts).sort((a, b) => a[0] - b[0]);
    return {
      labels: sorted.map(([year]) => year),
      data: sorted.map(([, count]) => count)
    };
  };

  const processRangeDistribution = (data = getFilteredData()) => {
    const ranges = data
      .map(v => parseFloat(v['Electric Range']))
      .filter(range => !isNaN(range));
    
    const binSize = 25;
    const bins = {};
    ranges.forEach(range => {
      const binIndex = Math.floor(range / binSize) * binSize;
      bins[binIndex] = (bins[binIndex] || 0) + 1;
    });
    
    const sortedBins = Object.entries(bins).sort((a, b) => a[0] - b[0]);
    return {
      labels: sortedBins.map(([range]) => `${range}-${parseInt(range) + binSize}`),
      data: sortedBins.map(([, count]) => count)
    };
  };

  const processPriceVsRange = (data = getFilteredData()) => {
    return data
      .filter(v => v['Base MSRP'] && v['Electric Range'])
      .map(v => ({
        x: parseFloat(v['Electric Range']),
        y: parseFloat(v['Base MSRP']),
        label: `${v.Make} ${v.Model}` // For tooltip
      }))
      .filter(point => !isNaN(point.x) && !isNaN(point.y));
  };

  const processEVTypeDistribution = (data = getFilteredData()) => {
    const counts = { BEV: 0, PHEV: 0 };
    data.forEach(vehicle => {
      if (vehicle['Electric Vehicle Type'] === 'Battery Electric Vehicle (BEV)') counts.BEV++;
      if (vehicle['Electric Vehicle Type'] === 'Plug-in Hybrid Electric Vehicle (PHEV)') counts.PHEV++;
    });
    return counts;
  };

  const processCAFVEligibility = (data = getFilteredData()) => {
    const counts = {};
    data.forEach(vehicle => {
      const status = vehicle['Clean Alternative Fuel Vehicle (CAFV) Eligibility'];
      if (status) counts[status] = (counts[status] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);
  };

  const processUtilityDistribution = (data = getFilteredData()) => {
    const counts = {};
    data.forEach(vehicle => {
      const utility = vehicle['Electric Utility']?.trim();
      if (utility) counts[utility] = (counts[utility] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl font-bold text-blue-600">Loading data...</div>
      </div>
    );
  }

  // Get available filters
  const availableYears = [...new Set(vehicleData.map(v => v['Model Year']))].sort();
  const availableMakes = [...new Set(vehicleData.map(v => v.Make))].sort();

  return (
    <div className={`p-6 min-h-screen transition-colors ${isDarkTheme ? 'bg-gray-900 text-gray-100' : 'bg-gray-100 text-gray-800'}`}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl flex-grow font-bold text-center">
          Electric Vehicle Analysis Dashboard
        </h1>
        <button
          className={`px-4 py-2 rounded-lg transition-colors ${isDarkTheme ? 'bg-gray-700 text-gray-100 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'}`}
          onClick={toggleTheme}
        >
          {isDarkTheme ? <Sun size={24} /> : <Moon size={24} />}

        </button>
      </div>


      {/* Filters */}
      <div className="mb-6 flex gap-4 justify-center">
        <select 
          className={`px-4 py-2 border rounded-lg ${isDarkTheme ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800'}`}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="all">All Years</option>
          {availableYears.map(year => (
            <option key={`year-${year}`} value={year}>{year}</option>
          ))}
        </select>

        <select 
          className={`px-4 py-2 border rounded-lg ${isDarkTheme ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800'}`}
          value={makeFilter}
          onChange={(e) => setMakeFilter(e.target.value)}
        >
          <option value="all">All Makes</option>
          {availableMakes.map(make => (
            <option key={`make-${make}`} value={make}>{make}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* County Distribution */}
        <div 
          key="chart-county"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('county')}
        >
          <h2 className="text-2xl font-bold mb-4">Top Counties by EV Registration</h2>
          <Bar
            data={{
              labels: processCountyDistribution().labels,
              datasets: [{
                label: 'Number of EVs',
                data: processCountyDistribution().data,
                backgroundColor: colors,
              }],
            }}
            options={{
              indexAxis: 'y',
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `Count: ${context.raw}`
                  }
                }
              },
            }}
          />
        </div>

        {/* Make Distribution */}
        <div 
          key="chart-make"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('make')}
        >
          <h2 className="text-2xl font-bold mb-4">Top EV Manufacturers</h2>
          <Bar
            data={{
              labels: processMakeDistribution().labels,
              datasets: [{
                label: 'Number of EVs',
                data: processMakeDistribution().data,
                backgroundColor: colors.slice(2),
              }],
            }}
            options={{
              indexAxis: 'y',
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        {/* Electric Range Distribution */}
        <div 
          key="chart-range"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('range')}
        >
          <h2 className="text-2xl font-bold mb-4">Electric Range Distribution</h2>
          <Bar
            data={{
              labels: processRangeDistribution().labels,
              datasets: [{
                label: 'Number of Vehicles',
                data: processRangeDistribution().data,
                backgroundColor: colors.slice(4),
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        {/* EV Type Distribution */}
        <div
          key="chart-type" 
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('type')}
        >
          <h2 className="text-2xl font-bold mb-4">EV Type Distribution</h2>
          <Pie
            data={{
              labels: ['Battery Electric (BEV)', 'Plug-in Hybrid (PHEV)'],
              datasets: [{
                data: [
                  processEVTypeDistribution().BEV,
                  processEVTypeDistribution().PHEV
                ],
                backgroundColor: [colors[0], colors[1]],
              }],
            }}
            options={{
              plugins: { 
                legend: { position: 'bottom' },
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw} vehicles (${(context.raw / getFilteredData().length * 100).toFixed(1)}%)`
                  }
                }
              },
            }}
          />
        </div>

        {/* CAFV Eligibility */}
        <div 
          key="chart-cafv"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('cafv')}
        >
          <h2 className="text-2xl font-bold mb-4">CAFV Eligibility Distribution</h2>
          <Pie
            data={{
              labels: processCAFVEligibility().map(([label]) => label),
              datasets: [{
                data: processCAFVEligibility().map(([, count]) => count),
                backgroundColor: colors.slice(6),
              }],
            }}
            options={{
              plugins: { legend: { position: 'bottom' } },
            }}
          />
        </div>

        {/* Utility Distribution */}
        <div 
          key="chart-utility"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('utility')}
        >
          <h2 className="text-2xl font-bold mb-4">Top Electric Utilities</h2>
          <Bar
            data={{
              labels: processUtilityDistribution().map(([label]) => label),
              datasets: [{
                label: 'Number of EVs',
                data: processUtilityDistribution().map(([, count]) => count),
                backgroundColor: colors.slice(8),
              }],
            }}
            options={{
              plugins: { legend: { display: false } },
            }}
          />
        </div>

        {/* Price vs Range Scatter Plot */}
        <div 
          key="chart-price-range"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('price-range')}
        >
          <h2 className="text-2xl font-bold mb-4">Price vs Electric Range</h2>
          <Scatter
            data={{
              datasets: [{
                label: 'Vehicles',
                data: processPriceVsRange(),
                backgroundColor: colors[0],
              }],
            }}
            options={{
              scales: {
                x: { 
                  title: { display: true, text: 'Electric Range (miles)' },
                  grid: { display: true }
                },
                y: { 
                  title: { display: true, text: 'Base MSRP ($)' },
                  grid: { display: true }
                },
              },
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const point = context.raw;
                      return `${point.label}: Range: ${point.x}mi, Price: $${point.y.toLocaleString()}`;
                    }
                  }
                }
              }
            }}
          />
        </div>

        {/* Model Year Trend */}
        <div 
          key="chart-year"
          className={`p-4 rounded-lg shadow transition-colors ${isDarkTheme ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-200'}`}
          onClick={() => setActiveChart('year')}
        >
          <h2 className="text-2xl font-bold mb-4">EV Registrations by Model Year</h2>
          <Line
            data={{
              labels: processModelYearDistribution().labels,
              datasets: [{
                label: 'Number of Registrations',
                data: processModelYearDistribution().data,
                borderColor: colors[2],
                backgroundColor: `${colors[2]}33`,
                tension: 0.4,
                fill: true,
              }],
            }}
            options={{
              plugins: { 
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => `Registrations: ${context.raw.toLocaleString()}`
                  }
                }
              },
              scales: {
                x: { title: { display: true, text: 'Model Year' } },
                y: { 
                  title: { display: true, text: 'Number of Vehicles' },
                  beginAtZero: true
                },
              },
            }}
          />
        </div>
      </div>

      {/* Modal for expanded chart view */}
      {activeChart && (
        <div key={`modal-${activeChart}`} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 h-5/6 overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {activeChart === 'county' && 'County Distribution Details'}
                {activeChart === 'make' && 'Manufacturer Distribution Details'}
                {activeChart === 'range' && 'Electric Range Distribution Details'}
                {activeChart === 'type' && 'EV Type Distribution Details'}
                {activeChart === 'cafv' && 'CAFV Eligibility Details'}
                {activeChart === 'utility' && 'Utility Distribution Details'}
                {activeChart === 'price-range' && 'Price vs Range Analysis'}
                {activeChart === 'year' && 'Model Year Registration Trends'}
              </h2>
              <button 
                onClick={() => setActiveChart(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            <div className="h-5/6">
              {activeChart === 'county' && (
                <Bar
                  data={{
                    labels: processCountyDistribution().labels,
                    datasets: [{
                      label: 'Number of EVs',
                      data: processCountyDistribution().data,
                      backgroundColor: colors,
                    }],
                  }}
                  options={{
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `Count: ${context.raw.toLocaleString()}`
                        }
                      }
                    },
                  }}
                />
              )}

              {activeChart === 'make' && (
                <Bar
                  data={{
                    labels: processMakeDistribution().labels,
                    datasets: [{
                      label: 'Number of EVs',
                      data: processMakeDistribution().data,
                      backgroundColor: colors.slice(2),
                    }],
                  }}
                  options={{
                    indexAxis: 'y',
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        callbacks: {
                          label: (context) => `Vehicles: ${context.raw.toLocaleString()}`
                        }
                      }
                    },
                  }}
                />
              )}

              {/* Add similar expanded views for other charts */}
              {/* Summary statistics for the modal view */}
              <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Summary Statistics</h3>
                {activeChart === 'county' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>Total Counties: {processCountyDistribution().labels.length}</p>
                      <p>Total Vehicles: {processCountyDistribution().data.reduce((a, b) => a + b, 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p>Top County: {processCountyDistribution().labels[0]}</p>
                      <p>Vehicles in Top County: {processCountyDistribution().data[0].toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {activeChart === 'make' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>Total Manufacturers: {processMakeDistribution().labels.length}</p>
                      <p>Total Vehicles: {processMakeDistribution().data.reduce((a, b) => a + b, 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p>Top Manufacturer: {processMakeDistribution().labels[0]}</p>
                      <p>Vehicles by Top Manufacturer: {processMakeDistribution().data[0].toLocaleString()}</p>
                    </div>
                  </div>
                )}
                {/* Add similar statistics for other charts */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer with summary stats */}
      <div className={`mt-8 shadow rounded-lg p-4 ${isDarkTheme ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-white text-gray-800'}`}>
  <h2 className="text-2xl font-bold mb-4">Dashboard Summary</h2>
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[
      {
        key: 'total-vehicles',
        title: 'Total Vehicles',
        value: getFilteredData().length.toLocaleString(),
        bgColor: isDarkTheme ? 'bg-blue-900' : 'bg-blue-50'
      },
      {
        key: 'average-range',
        title: 'Average Range',
        value: `${Math.round(
          getFilteredData()
            .map(v => parseFloat(v['Electric Range']))
            .filter(v => !isNaN(v))
            .reduce((a, b) => a + b, 0) / 
          getFilteredData().length
        )} miles`,
        bgColor: isDarkTheme ? 'bg-green-900' : 'bg-green-50'
      },
      {
        key: 'average-price',
        title: 'Average Price',
        value: `$${Math.round(
          getFilteredData()
            .map(v => parseFloat(v['Base MSRP']))
            .filter(v => !isNaN(v))
            .reduce((a, b) => a + b, 0) / 
          getFilteredData().length
        ).toLocaleString()}`,
        bgColor: isDarkTheme ? 'bg-yellow-900' : 'bg-yellow-50'
      },
      {
        key: 'common-make',
        title: 'Most Common Make',
        value: processMakeDistribution().labels[0],
        bgColor: isDarkTheme ? 'bg-purple-900' : 'bg-purple-50'
      }
    ].map(stat => (
      <div key={stat.key} className={`${stat.bgColor} p-4 rounded-lg`}>
        <h3 className="font-bold">{stat.title}</h3>
        <p className="text-2xl">{stat.value}</p>
      </div>
    ))}
  </div>
  </div>

    </div>
  );
}

