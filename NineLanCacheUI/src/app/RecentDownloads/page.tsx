"use client";

import React, { useEffect, useState } from "react";
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Inject,
  Filter,
  Sort,
  Toolbar,
} from "@syncfusion/ej2-react-grids";

import { formatBytes } from "../../../lib/Utilities";
import { getSignalRConnection } from "../../../lib/SignalR";
import { startTransition } from 'react';
import * as signalR from "@microsoft/signalr";

interface SteamDepot {
  id: number;
  steamAppId: number;
  steamApp: {
    name: string;
  };
}

interface DownloadEvent {
  id: number;
  cacheIdentifier: string;
  downloadIdentifier?: number;
  downloadIdentifierString?: string;
  clientIp: string;
  createdAt: string;
  lastUpdatedAt: string;
  cacheHitBytes: number;
  cacheMissBytes: number;
  totalBytes?: number;
  steamDepot?: SteamDepot | null;
}

const SteamImage = React.memo(({ appId }: { appId: number }) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/header.jpg`;
  const fallbackUrl = "https://steamdb.info/static/img/applogo.svg";

  return (
    <div className="flex items-center justify-center">
      <a
        href={`https://steamdb.info/app/${appId}/`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {imageError ? (
          <object
            data={fallbackUrl}
            type="image/svg+xml"
            width="200"
            height="100"
          >
            Steam App
          </object>
        ) : (
          <img
            src={imageUrl}
            alt={`App ${appId}`}
            className="w-[200px] h-[75px] object-cover rounded shadow bg-gray-900"
            onError={() => setImageError(true)}
          />
        )}
      </a>
    </div>
  );
});
SteamImage.displayName = "SteamImage";



const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function RecentDownloads() {
  const [data, setData] = useState<DownloadEvent[]>([]);
  const [stagedData, setStagedData] = useState<DownloadEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRange, setSelectedRange] = useState<string>("0");
  const [customDays, setCustomDays] = useState<string>("");
  const [excludeIPs, setExcludeIPs] = useState<boolean>(true);

  const days =
    selectedRange === "custom" ? parseInt(customDays) || 0 : parseInt(selectedRange);

  async function fetchData() {
    setLoading(true);
    try {
        const params = new URLSearchParams();
        if (days > 0) params.append("days", days.toString());
        params.append("excludeIPs", excludeIPs.toString());
        params.append("limit", "100");

        const res = await fetch(`${API_BASE_URL}/RecentDownloads/GetRecentDownloads?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch data");

        const json = await res.json();

        // Buffer the data first
        setStagedData(json);
    } catch (error) {
        console.error(error);
        setStagedData([]);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    if (stagedData !== null) {
        const existingIds = new Set(data.map(d => d.id));
        const stagedIds = new Set(stagedData.map(d => d.id));

        const isSameLength = data.length === stagedData.length;
        const hasChanges = [...stagedIds].some(id => !existingIds.has(id));

        if (!isSameLength || hasChanges) {
        startTransition(() => {
            setData(stagedData);
            setStagedData(null);
        });
        }
    }
  }, [stagedData]);



  async function fetchAndMergeNewData() {
    try {
        const params = new URLSearchParams();
        if (days > 0) params.append("days", days.toString());
        params.append("excludeIPs", excludeIPs.toString());
        params.append("limit", "20");

        const res = await fetch(`${API_BASE_URL}/RecentDownloads/GetRecentDownloads?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch new data");

        const newData: DownloadEvent[] = await res.json();

        startTransition(() => {
            setData(prevData => {
                const updated = [...prevData];

                newData.forEach(item => {
                    const index = updated.findIndex(d => d.id === item.id);
                    if (index >= 0) {
                        updated[index] = item;
                    } else {
                        updated.unshift(item);
                    }
                });

                // Only sort if new items were added or updated
                return updated
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 100);
            });
        });
    } catch (error) {
        console.error("Failed to fetch and merge new data", error);
    }
  }


  useEffect(() => {
    fetchData();
  }, [days, excludeIPs]);

  useEffect(() => {
    const connection = getSignalRConnection();

    async function start() {
      try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
        }
        console.log("SignalR connected.");
      } catch (err) {
        console.error("SignalR connection error:", err);
        setTimeout(start, 2000);
      }
    }

    connection.on("UpdateDownloadEvents", () => {
      console.log("Received UpdateDownloadEvents");
      fetchAndMergeNewData();
    });

    start();

    return () => {
      connection.off("UpdateDownloadEvents");
      connection.stop();
    };
  }, []);

  return (
    <div className="p-6 mx-auto rounded-3xl" style={{ backgroundColor: "#1a1a1a", color: "#eee", width: "95%" }}>
      <h1 className="text-4xl font-bold mb-6 text-center">Recent Downloads</h1>

      {/* Filter Panel */}
      <div
        className="flex flex-wrap items-center gap-4 p-4 rounded-md shadow-md mb-6"
        style={{ backgroundColor: "#2a2a2a" }}
      >
        <label htmlFor="range" className="text-white font-semibold whitespace-nowrap">
          Date Range:
        </label>

        <select
          id="range"
          className="text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
          style={{ color: "#ffffff", backgroundColor: "#1a1a1a" }}
          value={selectedRange}
          onChange={(e) => setSelectedRange(e.target.value)}
        >
          <option value="0">All time</option>
          <option value="30">Last 30 days</option>
          <option value="7">Last 7 days</option>
          <option value="1">Last 1 day</option>
          <option value="custom">Custom</option>
        </select>

        {selectedRange === "custom" && (
          <input
            type="number"
            min={1}
            max={365}
            placeholder="Days"
            className="text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            style={{ margin: "0", width: "5rem", color: "#ffffff", backgroundColor: "#1a1a1a" }}
            value={customDays}
            onChange={(e) => {
              const val = e.target.value;
              if (/^\d{0,3}$/.test(val)) {
                setCustomDays(val);
              }
            }}
          />
        )}

        <button
          className={`ml-auto px-5 py-2 rounded-md font-semibold transition-colors duration-300 ${
            excludeIPs ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
          } text-white shadow-md whitespace-nowrap`}
          onClick={() => setExcludeIPs(!excludeIPs)}
          type="button"
        >
          {excludeIPs ? "Exclude IPs" : "Include All IPs"}
        </button>
      </div>
      
      {/* {loading && (
        <div className="grid grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[100px] rounded animate-pulse col-span-3" />
            ))}
        </div>
        )} */}
      <div className={`transition-opacity duration-300 ${loading ? "opacity-50" : "opacity-100"}`}>
        {/* Grid */}
        <GridComponent
            dataSource={data}
            allowPaging={false}
            allowSorting={true}
            allowFiltering={true}
            filterSettings={{ type: "Menu" }}
            height={"60vh"}
            rowSelected={() => {}}
            style={{ minHeight: "500px" }}
        >
            <ColumnsDirective>
            <ColumnDirective field="id" headerText="ID" width={80} visible={false} />
            <ColumnDirective field="cacheIdentifier" headerText="Service" width={100} textAlign="Left" />
            <ColumnDirective
                headerText="Timestamp"
                width={180}
                template={(props: DownloadEvent) => {
                const created = new Date(props.createdAt);
                const updated = new Date(props.lastUpdatedAt);
                const formatDateTime = (date: Date) =>
                    `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}`;

                return (
                    <div className="text-sm text-white text-center whitespace-normal break-words">
                     <div>{formatDateTime(created)} → {formatDateTime(updated)}</div>
                    </div>
                );
                }}
            />
            <ColumnDirective
                headerText="App"
                width={140}
                template={(props: DownloadEvent) => {
                const appId = props.steamDepot?.steamAppId;
                return props.cacheIdentifier === "steam" && appId
                    ? <SteamImage appId={appId} />
                    : <span className="text-sm text-gray-300">unknown</span>;
                }}
            />
            <ColumnDirective
                headerText="Depot"
                width={120}
                template={(props: DownloadEvent) => {
                if (props.cacheIdentifier === "steam") {
                    const depotLink = `https://steamdb.info/depot/${props.steamDepot?.id}/`;
                    return (
                    <a
                        href={depotLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline text-sm"
                    >
                        {props.steamDepot?.id}
                    </a>
                    );
                }
                return <span className="text-sm text-gray-300">N/A</span>;
                }}
            />
            <ColumnDirective field="clientIp" headerText="Client IP" width={130} textAlign="Left" />
            <ColumnDirective
                headerText="Hit %"
                width={150}
                template={(props: DownloadEvent) => {
                const total = props.cacheHitBytes + props.cacheMissBytes;
                const hitPercent = total > 0 ? (props.cacheHitBytes / total) * 100 : 0;

                return (
                    <div className="w-full">
                    <div className="h-4 bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${hitPercent}%` }}></div>
                    </div>
                    <div className="text-xs mt-1 text-white text-center">
                        {formatBytes(props.cacheHitBytes)} • {hitPercent.toFixed(1)}%
                    </div>
                    </div>
                );
                }}
            />
            <ColumnDirective
                headerText="Miss %"
                width={150}
                template={(props: DownloadEvent) => {
                const total = props.cacheHitBytes + props.cacheMissBytes;
                const missPercent = total > 0 ? (props.cacheMissBytes / total) * 100 : 0;

                return (
                    <div className="w-full">
                    <div className="h-4 bg-gray-700 rounded overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${missPercent}%` }}></div>
                    </div>
                    <div className="text-xs mt-1 text-white text-center">
                        {formatBytes(props.cacheMissBytes)} • {missPercent.toFixed(1)}%
                    </div>
                    </div>
                );
                }}
            />
            </ColumnsDirective>
            <Inject services={[Toolbar]} />
        </GridComponent>
      </div>
    </div>
  );
}
