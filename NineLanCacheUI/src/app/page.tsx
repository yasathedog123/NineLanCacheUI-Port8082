'use client';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject,
  PieSeries,
  AccumulationTooltip,
  AccumulationLegend
} from '@syncfusion/ej2-react-charts';
import { formatBytes, chartPalette } from "../../lib/Utilities";
import React, { useEffect, useState } from 'react';
import { getSignalRConnection } from "../../lib/SignalR";
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

interface ServiceData {
  service: string;
  totalBytes: number;
}

export default function Home() {
  const [hitMissData, setHitMissData] = useState([
    { x: 'Hit Bytes', y: 0 },
    { x: 'Miss Bytes', y: 0 },
  ]);

  const [serviceSplitData, setServiceSplitData] = useState<{ x: string; y: number }[]>([]);
  const [missBytesByService, setMissBytesByService] = useState<{ x: string; y: number }[]>([]);
  const [hitBytesByService, setHitBytesByService] = useState<{ x: string; y: number }[]>([]);
  const [selectedRange, setSelectedRange] = useState("0");
  const [customDays, setCustomDays] = React.useState('');
  const [excludeIPs, setExcludeIPs] = useState(true);

  // Compute effective days param
  const daysToUse =
    selectedRange === 'custom'
      ? customDays && Number(customDays) > 0
        ? Number(customDays)
        : 30
      : Number(selectedRange);

  // Debounce hook to avoid too many fetches when typing custom days
  function useDebounce<T>(value: T, delay: number) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  }
  const debouncedDays = useDebounce(daysToUse, 400);

  const fetchAll = async () => {
      try {
        const base = `${API_BASE_URL}/Data`;
        const qs = `?days=${debouncedDays}&excludeIPs=${excludeIPs}`;

        const [hitMissRes, serviceRes, missRes, hitRes] = await Promise.all([
          fetch(`${base}/GetHitMiss${qs}`),
          fetch(`${base}/GetBytesByService${qs}`),
          fetch(`${base}/GetMissBytesByService${qs}`),
          fetch(`${base}/GetHitBytesByService${qs}`),
        ]);

        const hitMiss = await hitMissRes.json();
        setHitMissData([
          { x: 'Hit Bytes', y: hitMiss.totalHitBytes },
          { x: 'Miss Bytes', y: hitMiss.totalMissBytes },
        ]);

        const service = await serviceRes.json();
        setServiceSplitData(service.map((s: ServiceData) => ({ x: s.service, y: s.totalBytes })));

        const miss = await missRes.json();
        setMissBytesByService(miss.map((s: ServiceData) => ({ x: s.service, y: s.totalBytes })));

        const hit = await hitRes.json();
        setHitBytesByService(hit.map((s: ServiceData) => ({ x: s.service, y: s.totalBytes })));

      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

  useEffect(() => {
    fetchAll();
  }, [debouncedDays, excludeIPs]);

  useEffect(() => {
    const connection = getSignalRConnection();

    async function start() {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
          await connection.start();
        }
        console.log('SignalR connected.');
      } catch (err) {
        console.error('SignalR connection error:', err);
        setTimeout(start, 2000); // retry on fail
      }
    }

    connection.on("UpdateDownloadEvents", () => {
      fetchAll();

    });

    start();

    return () => {
      connection.off("UpdateDownloadEvents");
      connection.stop();
    };
  }, []);

  const commonProps = {
    legendSettings: {
      visible: true,
      textStyle: {
        size: '16px',
        color: '#ededed',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '600',
      },
    },
    tooltip: {
      enable: true,
      textStyle: {
        fontFamily: 'Poppins, sans-serif',
        size: '14px',
        fontWeight: '500',
        color: '#ffffff'
      },
      fill: '#0a0a0a',
    },
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-8 p-6">
        {/* Charts */}
        <div className="w-full h-96">
          <h2 className="text-lg font-semibold mb-2 text-center text-white">Cache Hit vs Miss (Bytes)</h2>
          {hitMissData[0].y > 0 && (
            <AccumulationChartComponent
              {...commonProps}
              tooltipRender={(args) => {
                if (args.point?.y) {
                  args.text = `${args.point.x}: ${formatBytes(args.point.y)}`;
                }
              }}
            >
              <Inject services={[PieSeries, AccumulationTooltip, AccumulationLegend]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={hitMissData}
                  xName="x"
                  yName="y"
                  type="Pie"
                  dataLabel={{ visible: true, name: 'x' }}
                  palettes={['#4CAF50', '#ff3131ff']}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          )}
        </div>

        <div className="w-full h-96">
          <h2 className="text-lg font-semibold mb-2 text-center text-white">Download Requests by Service</h2>
          {serviceSplitData.length > 0 && (
            <AccumulationChartComponent
              {...commonProps}
              tooltipRender={(args) => {
                if (args.point?.y) {
                  args.text = `${args.point.x}: ${formatBytes(args.point.y)}`;
                }
              }}
            >
              <Inject services={[PieSeries, AccumulationTooltip, AccumulationLegend]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={serviceSplitData}
                  xName="x"
                  yName="y"
                  type="Pie"
                  dataLabel={{ visible: true, name: 'x' }}
                  palettes={chartPalette}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          )}
        </div>

        <div className="w-full h-96">
          <h2 className="text-lg font-semibold mb-2 text-center text-white">Miss Bytes by Service</h2>
          {missBytesByService.length > 0 && (
            <AccumulationChartComponent
              {...commonProps}
              tooltipRender={(args) => {
                if (args.point?.y) {
                  args.text = `${args.point.x}: ${formatBytes(args.point.y)}`;
                }
              }}
            >
              <Inject services={[PieSeries, AccumulationTooltip, AccumulationLegend]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={missBytesByService}
                  xName="x"
                  yName="y"
                  type="Pie"
                  dataLabel={{ visible: true, name: 'x' }}
                  palettes={chartPalette}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          )}
        </div>

        <div className="w-full h-96">
          <h2 className="text-lg font-semibold mb-2 text-center text-white">Hit Bytes by Service</h2>
          {hitBytesByService.length > 0 && (
            <AccumulationChartComponent
              {...commonProps}
              tooltipRender={(args) => {
                if (args.point?.y) {
                  args.text = `${args.point.x}: ${formatBytes(args.point.y)}`;
                }
              }}
            >
              <Inject services={[PieSeries, AccumulationTooltip, AccumulationLegend]} />
              <AccumulationSeriesCollectionDirective>
                <AccumulationSeriesDirective
                  dataSource={hitBytesByService}
                  xName="x"
                  yName="y"
                  type="Pie"
                  dataLabel={{ visible: true, name: 'x' }}
                  palettes={chartPalette}
                />
              </AccumulationSeriesCollectionDirective>
            </AccumulationChartComponent>
          )}
        </div>
      </div>
      <div className="container flex flex-wrap items-center gap-4 px-8 py-4 bg-gray-900 rounded-md shadow-md" style={{ width: '100%', marginTop: '0.25rem', padding: '15px', marginBottom: '2rem'}}>
        <label htmlFor="range" className="text-white font-semibold whitespace-nowrap">
          Date Range:
        </label>

        <div className="flex items-center gap-2">
          <select
            id="range"
            className="text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            style={{color: '#ffffff', backgroundColor: '#1a1a1a'}}
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
          >
            <option value="0">All time</option>
            <option value="30">Last 30 days</option>
            <option value="7">Last 7 days</option>
            <option value="1">Last 1 day</option>
            <option value="custom">Custom</option>
          </select>

          {selectedRange === 'custom' && (
            <input
              type="number"
              min={1}
              max={365}
              placeholder="Days"
              className="text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              style={{ margin: '0', width: '5rem', color: '#ffffff', backgroundColor: '#1a1a1a' }}
              value={customDays}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d{0,3}$/.test(val)) {
                  setCustomDays(val);
                }
              }}
            />
          )}
        </div>

        <button
          className={`ml-auto px-5 py-2 rounded-md font-semibold transition-colors duration-300 ${
            excludeIPs ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          } text-white shadow-md whitespace-nowrap`}
          onClick={() => setExcludeIPs(!excludeIPs)}
          type="button"
        >
          {excludeIPs ? 'Exclude IPs' : 'Include All IPs'}
        </button>
      </div>
    </div>
  );
}
