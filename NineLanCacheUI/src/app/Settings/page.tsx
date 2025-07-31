"use client";
import { useEffect, useState } from "react";
import Button from "../../components/Button";

function isValidIp(ip: string) {
  // Basic IPv4 regex validation
  return /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(ip);
}

export default function SettingsPage() {
  const [excludedIps, setExcludedIps] = useState<string[]>([]);
  const [newIp, setNewIp] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [selectedInterface, setSelectedInterface] = useState("");
  const [interfaceOptions, setInterfaceOptions] = useState<string[]>([]);
  const [interfaceLoading, setInterfaceLoading] = useState(true);


  useEffect(() => {
    async function fetchIps() {
      try {
        setLoading(true);
        const res = await fetch(`/api/proxy/Settings/GetExcludedIps`);
        const data = await res.json();
        setExcludedIps(data || []);
      } catch {
        setError("Failed to load excluded IPs.");
      } finally {
        setLoading(false);
      }
    }
    fetchIps();
  }, []);

  const addIp = async () => {
    if (!newIp.trim() || !isValidIp(newIp.trim())) {
      setError("Please enter a valid IPv4 address.");
      return;
    }
    setError(null);
    setAdding(true);
    try {
      const res = await fetch(`/api/proxy/Settings/AddExcludedIp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: newIp.trim() }),
      });

      if (res.ok) {
        setExcludedIps((prev) => [...prev, newIp.trim()]);
        setNewIp("");
      } else {
        const result = await res.json();
        setError(result.message || "Failed to add IP.");
      }
    } catch {
      setError("Failed to add IP.");
    } finally {
      setAdding(false);
    }
  };

  const removeIp = async (ipToRemove: string) => {
    try {
      const res = await fetch(`/api/proxy/Settings/DeleteExcludedIp`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipToRemove }),
      });

      if (res.ok) {
        setExcludedIps((prev) => prev.filter((ip) => ip !== ipToRemove));
      } else {
        setError("Failed to delete IP.");
      }
    } catch {
        setError("Failed to delete IP.");
    }
  };

  useEffect(() => {
    async function fetchInterfacesAndSetting() {
      try {
        setInterfaceLoading(true);

        const [interfacesRes, selectedRes] = await Promise.all([
          fetch("/api/proxy/Network/GetNetworkInterfaces"),
          fetch("/api/proxy/Settings/GetNetworkGraphInterface")
        ]);

        const ifaceList = await interfacesRes.json();
        const selectedData = await selectedRes.json();

        setInterfaceOptions(ifaceList);
        setSelectedInterface(selectedData.interfaceName || "");
      } catch (err) {
        console.error("Error loading interface data:", err);
        setError("Failed to load network interface settings.");
      } finally {
        setInterfaceLoading(false);
      }
    }

    fetchInterfacesAndSetting();
  }, []);


  return (
    <div
      className=" p-8 max-w-xl mx-auto"
      style={{ backgroundColor: "#1a1a1a", color: "#eee", fontFamily: "Poppins, sans-serif" }}
    >
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Excluded IP Addresses</h2>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul
            className="max-h-60 overflow-y-auto rounded-md p-3"
            style={{ backgroundColor: "#2a2a2a" }}
          >
            {excludedIps.length === 0 && (
              <li className="text-gray-400 italic">No excluded IP addresses yet.</li>
            )}
            {excludedIps.map((ip, idx) => (
              <li
                key={idx}
                className="text-white flex justify-between items-center mb-1 px-3 py-1 rounded transition"
              >
                <span>{ip}</span>
                <button
                  onClick={() => removeIp(ip)}
                  className="text-red-500 hover:text-red-700 font-semibold"
                  aria-label={`Remove ${ip}`}
                  title={`Remove ${ip}`}
                  style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.5rem', padding: '0', lineHeight: '1' }}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <label htmlFor="ip-input" className="block font-semibold mb-2">
          Add new IP address
        </label>
        <div className="flex gap-3">
          <input
            id="ip-input"
            type="text"
            placeholder="e.g. 192.168.1.1"
            value={newIp}
            onChange={(e) => setNewIp(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                e.preventDefault();
                addIp();
                }
            }}
            style={{ color: "#ffffff", margin: "0" }}
            className="flex-1 px-4 py-2 rounded text-white border border-gray-700 focus:border-indigo-500 focus:outline-none transition"
          />

          <Button
            disabled={!newIp.trim() || !isValidIp(newIp.trim()) || adding}
            onClick={addIp}
            className={`px-6 py-2 rounded font-semibold text-white transition ${
              !newIp.trim() || !isValidIp(newIp.trim()) || adding
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {adding ? "Adding..." : "Add"}
          </Button>
        </div>
        {error && <p className="mt-2 text-red-500 font-semibold">{error}</p>}
      </section>
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Network Graph Interface</h2>

        {interfaceLoading ? (
          <p>Loading interfaces...</p>
        ) : (
          <select
            value={selectedInterface}
            onChange={async (e) => {
              const newInterface = e.target.value;
              setSelectedInterface(newInterface);

              try {
                const res = await fetch("/api/proxy/Settings/SetNetworkGraphInterface", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ interface: newInterface })
                });

                if (!res.ok) {
                  const err = await res.json();
                  setError(err.message || "Failed to update network interface.");
                }
              } catch {
                setError("Failed to update network interface.");
              }
            }}
            className="text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            style={{ margin: '0', color: '#ffffff', backgroundColor: '#1a1a1a' }}
          >
            {interfaceOptions.map((iface) => (
              <option key={iface} value={iface}>
                {iface}
              </option>
            ))}
          </select>
        )}
      </section>

    </div>
  );
}
