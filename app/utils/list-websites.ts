export const listWebsites = async (
    endpoint: string,
    bearerToken: string,
    method = 'GET',
    body?: any,
  ): Promise<any> => {
    try {
      const response = await fetch(`${endpoint}/websites`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bearerToken}`,
        },
        body: method !== 'GET' && body ? JSON.stringify(body) : undefined,
      });
  
      // Check if the response is not OK
      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}: ${response.statusText} - Failed to fetch websites.`
        );
      }
  
      // Attempt to parse the response as JSON
      try {
        const data = await response.json();
        return data;
      } catch (jsonError) {
        if (jsonError instanceof Error) {
          throw new Error(
            `Failed to parse JSON from response: ${jsonError.message}`
          );
        }
        throw new Error(`Failed to parse JSON from response: ${String(jsonError)}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Error in listWebsites: ${error.message}`);
        throw new Error(
          `An error occurred while fetching websites: ${error.message}`
        );
      }
      console.error(`Unknown error in listWebsites: ${String(error)}`);
      throw new Error(`An unknown error occurred: ${String(error)}`);
    }
  };
  