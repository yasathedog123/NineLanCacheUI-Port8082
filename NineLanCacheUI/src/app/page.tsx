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

   useEffect(() => {
    const fetchHitMiss = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Data/GetHitMiss`);
        const data = await res.json();
        setHitMissData([
          { x: 'Hit Bytes', y: data.totalHitBytes },
          { x: 'Miss Bytes', y: data.totalMissBytes },
        ]);
      } catch (error) {
        console.error('Error fetching hit/miss:', error);
      }
    };

    fetchHitMiss();
  }, []);

  useEffect(() => {
    const fetchServiceSplitData = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/Data/GetBytesByService`);
        const data: ServiceData[] = await res.json();

        const formattedData = data.map((item: ServiceData) => ({
          x: item.service,
          y: item.totalBytes
        }));

        setServiceSplitData(formattedData);
      } catch (err) {
        console.error('Failed to fetch service breakdown:', err);
      }
    };

    fetchServiceSplitData();
  }, []);

  const missBytesByService = [
    { x: 'Steam', y: 1600000000 },
    { x: 'WSUS', y: 800000000 },
    { x: 'Epic Games', y: 400000000 },
  ];

  const hitBytesByService = [
    { x: 'Steam', y: 4000000000 },
    { x: 'WSUS', y: 2000000000 },
    { x: 'Epic Games', y: 1200000000 },
  ];

  const commonProps = {
    legendSettings: {
      visible: true,
      textStyle: {
        color: '#ededed',
        fontFamily: 'Poppins, sans-serif',
        fontWeight: '500',
        fontSize: '14px',
      },
    },
    tooltip: { enable: true },
  };

  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="w-full h-96">
        <h2 className="text-lg font-semibold mb-2 text-center">Cache Hit vs Miss (Bytes)</h2>
        {hitMissData[0].y > 0 && (  // render only if data loaded (hit bytes > 0)
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
        <h2 className="text-lg font-semibold mb-2 text-center">Download Requests by Service</h2>
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
        <h2 className="text-lg font-semibold mb-2 text-center">Miss Bytes by Service</h2>
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
      </div>

      <div className="w-full h-96">
        <h2 className="text-lg font-semibold mb-2 text-center">Hit Bytes by Service</h2>
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
      </div>
    </div>
  );
}
