export const createWebsite = async (
  endpoint: string,
  method: "POST" | "PUT" = "POST",
  bearer: string,
  body?: any,
): Promise<any> => {
  const url = `${endpoint}/websites/create`;
  console.log("🛰️ Creating website at:", url);
  console.log("📤 Request body:", body);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${bearer}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    console.log("📩 Raw createWebsite response:", text);

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} - Failed to create website. Response: ${text}`,
      );
    }

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`Failed to parse JSON from response: ${text}`);
    }

    return data;
  } catch (error: any) {
    console.error("🔥 Error in createWebsite:", error.message);
    throw new Error(`An error occurred while creating the website: ${error.message}`);
  }
};
