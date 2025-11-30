import { NextRequest, NextResponse } from "next/server";

/**
 * Get Headscale API URL from environment variable at runtime.
 * This function ensures the value is read at runtime, not baked into the build.
 * Each user can override HEADSCALE_API_URL when running the container.
 */
function getHeadscaleApiUrl(): string {
  // Read from process.env at runtime - this will use the value provided
  // when the container is run, not the value at build time
  const url = process.env.HEADSCALE_API_URL;
  if (!url) {
    throw new Error(
      "HEADSCALE_API_URL environment variable is required but not set. " +
      "Please set it when running the container."
    );
  }
  return url;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return handleRequest(request, resolvedParams, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string
) {
  try {
    // Reconstruct the path from the catch-all route
    const path = params.path.join("/");
    const headscaleApiUrl = getHeadscaleApiUrl(); // Read at runtime
    const targetUrl = `${headscaleApiUrl}/api/v1/${path}`;
    
    console.log(`[Proxy] ${method} /api/proxy/${path} -> ${targetUrl}`);

    // Get query parameters from the original request
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const fullUrl = queryString
      ? `${targetUrl}?${queryString}`
      : targetUrl;

    // Get headers from the original request
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get("Authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    // Get request body if present
    let body: string | undefined;
    if (method !== "GET" && method !== "DELETE") {
      try {
        body = await request.text();
      } catch {
        // No body or error reading body
      }
    }

    // Forward request to Headscale backend
    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    // Get response data
    let responseData: unknown;
    const contentType = response.headers.get("content-type");
    
    if (contentType?.includes("application/json")) {
      try {
        responseData = await response.json();
      } catch {
        responseData = await response.text();
      }
    } else {
      responseData = await response.text();
    }

    // Return response with same status code
    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle network errors or other issues
    console.error("Proxy error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Proxy request failed",
      },
      { status: 500 }
    );
  }
}

