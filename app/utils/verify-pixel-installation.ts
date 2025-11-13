export const verifyPixelInstallation = async (
  endpoint: string,
  bearerToken: string,
  websiteId: number,
): Promise<any> => {
  const url = `${endpoint}/websites/${websiteId}/verify-pixel`;
  console.log("🛰️ Verifying pixel installation at:", url);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${bearerToken}`,
      },
    });

    // Capture full response text to see backend error messages
    const text = await response.text();
    console.log("📩 Raw verify response:", text);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - Failed to verify pixel installation. Response: ${text}`
      );
    }

    // Try parsing JSON if it exists
    try {
      const data = JSON.parse(text);
      return data;
    } catch {
      console.warn("⚠️ Could not parse verifyPixelInstallation JSON, returning text");
      return { raw: text };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("🔥 Error in verifyPixelInstallation:", error.message);
      throw new Error(`An error occurred while verifying pixel installation: ${error.message}`);
    }
    console.error("💥 Unknown error in verifyPixelInstallation:", String(error));
    throw new Error(`An unknown error occurred: ${String(error)}`);
  }
};
