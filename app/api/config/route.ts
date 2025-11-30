import { NextResponse } from "next/server";

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

/**
 * API endpoint to get Headscale server URL for client-side use.
 * Returns the server URL that should be used in setup examples.
 */
export async function GET() {
  try {
    const serverUrl = getHeadscaleApiUrl();
    return NextResponse.json({ serverUrl });
  } catch {
    // If HEADSCALE_API_URL is not set, return generic placeholder
    return NextResponse.json({
      serverUrl: "https://your-headscale-server.com",
    });
  }
}

