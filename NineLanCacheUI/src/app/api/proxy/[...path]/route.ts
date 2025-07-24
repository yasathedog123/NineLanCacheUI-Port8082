import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL not configured");
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
  searchParams: URLSearchParams;
};

export async function GET(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "GET");
}

export async function POST(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "POST");
}

export async function PUT(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "PUT");
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  const { params } = context;
  const resolvedParams = await params;
  return proxyRequest(req, resolvedParams, "DELETE");
}

async function proxyRequest(
  req: NextRequest,
  params: { path: string[] },
  method: string
) {
  const pathSegments = params.path;

  if (!pathSegments || pathSegments.length === 0) {
    return NextResponse.json({ error: "Invalid API path" }, { status: 400 });
  }

  try {
    // Compose URL with query string if GET
    const url = new URL(`${API_BASE_URL}/${pathSegments.join("/")}`);
    if (method === "GET") {
      url.search = req.nextUrl.search;
    }

    // Filter headers (removes disallowed ones)
    const filteredHeaders = filterHeaders(req.headers);

    const fetchOptions: RequestInit = {
      method,
      headers: filteredHeaders,
    };

    if (method !== "GET") {
      fetchOptions.body = await req.text();
    }

    // Direct fetch without protectedProxyRequest
    const response = await fetch(url.toString(), fetchOptions);

    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    } else {
      const text = await response.text();
      return new NextResponse(text, { status: response.status });
    }
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

function filterHeaders(headers: Headers): Record<string, string> {
  const disallowed = [
    "connection",
    "host",
    "keep-alive",
    "proxy-connection",
    "transfer-encoding",
    "upgrade",
  ];
  return Object.fromEntries(
    Array.from(headers.entries()).filter(
      ([key]) => !disallowed.includes(key.toLowerCase())
    )
  );
}
