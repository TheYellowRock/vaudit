import { useEffect } from "react";
import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import {
  AppProvider,
  Banner,
  Page,
  Layout,
  Card,
  TextField,
  Button,
} from "@shopify/polaris";
import en from "@shopify/polaris/locales/en.json";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import WelcomeCard from "app/components/WelcomeCard";
import ContactCard from "app/components/ContactCard";
import { getShopPassKey } from "app/models/shopSettings.server";
import { listWebsites } from "app/utils/list-websites";
import { json } from "app/utils/response.server";
import { createWebsite } from "app/utils/create-website";
import { getWebsiteById } from "app/utils/get-website-by-id";
import { verifyPixelInstallation } from "app/utils/verify-pixel-installation";
import { upsertMetafield } from "app/utils/metafields/upsert-metafield";

export interface ActionData {
  status: "success" | "error" | "idle";
  message?: string;
}

interface Website {
  id: number;
  website_url: string;
  website_name: string;
  script: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);

    console.log("+++++++++++++++++++++++++++++++++ SESSION AUTH +++++++++++++++++++++++++++++++");
    console.log("SESSION:", session);
    const { accessToken } = session;
    const { shop } = session;
    const APIUrl = process.env.VAUDIT_API_URL || "";

    const settings = await getShopPassKey(session.shop);
    const bearer = settings?.passKey;

    console.log("+++++++++++++++++++++++++++++++++ BEARER TOKEN +++++++++++++++++++++++++++++++");
    console.log("Bearer token:", bearer);
    if (!bearer) {
      return json({
        status: "error",
        message: "Missing passKey. Please add it in Settings.",
      });
    }

    console.log("+++++++++++++++++++++++++++++++++ API URL +++++++++++++++++++++++++++++++");
    console.log("🔍 VAUDIT_API_URL:", process.env.VAUDIT_API_URL);

     // 3️⃣ Fetch websites from backend
    let listOfWebsites: Website[] = [];
    try {
      const websites = await listWebsites(APIUrl, bearer);

      if (websites.status !== "success" || !Array.isArray(websites.data)) {
        return json<ActionData>(
          {
            status: "error",
            message: "Failed to fetch websites.",
          },
          { status: 502 },
        );
      }

      listOfWebsites = websites.data as Website[];
  
    } catch (error) {
      console.error("Error fetching websites:", error);
      return json<ActionData>(
        {
          status: "error",
          message: "Failed to retrieve website list.",
        },
        { status: 502 },
      );
    }

    console.log("📋 listOfWebsites:", listOfWebsites);
console.log("🔍 Shop URL:", shop);

    // 4️⃣ Check or create website entry
    let pixelScript = "";
    let websiteId: number | undefined;

    const existingWebsite = listOfWebsites.find(
      (website) => website.website_url === shop,
    );

    console.log("+++++++++++++++++++++++++++++++++ Existing Website +++++++++++++++++++++++++++++++");
    console.log("Existing website:", existingWebsite);
    try {
      if (!existingWebsite) {
        const created = await createWebsite(
          APIUrl,
          "POST",
          bearer,
          { website_url: shop, website_name: shop },
        );
        const newWebsite: Website = created.data;
        pixelScript = newWebsite.script;
        websiteId = newWebsite.id;
                console.log("+++++++++++++++++++++++++++++++++ Website Id +++++++++++++++++++++++++++++++");
      console.log("Website Id:", newWebsite);
      } else {
        websiteId = existingWebsite.id;
        console.log("+++++++++++++++++++++++++++++++++ Website Id +++++++++++++++++++++++++++++++");
        console.log("Website Id:", websiteId);
        const getScript = await getWebsiteById(APIUrl, bearer, websiteId);
        pixelScript = getScript.data.script;

        console.log("+++++++++++++++++++++++++++++++++ Pixel Script +++++++++++++++++++++++++++++++");
        console.log("Pixel Script:", pixelScript);
      }
    } catch (error) {
      console.error("Error processing website:", error);
      return json<ActionData>(
        {
          status: "error",
          message: "Error creating or retrieving website.",
        },
        { status: 500 },
      );
    }

if (accessToken && shop && pixelScript) {
  await upsertMetafield(
    shop,
    accessToken,
    "vaudit_app",
    "pixel_script",
    pixelScript,
    "multi_line_text_field"
  );
  console.log("✅ Pixel script injected into Shopify metafield");
}

// ✅ Now verify installation
try {

  if (shop.includes("myshopify.com") && process.env.NODE_ENV !== "production") {
  console.log("🚧 Dev store detected — skipping pixel verification");
  return json({
    status: "success",
    message: "Pixel verification skipped for password-protected dev store",
  });
}

  const verifyResponse = await verifyPixelInstallation(APIUrl, bearer, websiteId);
  console.log("📩 Verify response:", verifyResponse);

  if (verifyResponse?.status === "success" || verifyResponse?.data?.verified) {
    return json({
      status: "success",
      message: "Pixel verified successfully!",
    });
  } else {
    return json({
      status: "error",
      message: "Pixel not yet verified. Please reload in a few seconds.",
    });
  }
} catch (error) {
  console.error("Error verifying installation:", error);
  return json(
    {
      status: "error",
      message: "Pixel verification failed after injection.",
    },
    { status: 500 }
  );
}

    // 6️⃣ Default success
    return json<ActionData>({
      status: "success",
      message: "Website processed successfully.",
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return json<ActionData>(
      {
        status: "error",
        message: "An unexpected error occurred. Please try again.",
      },
      { status: 500 },
    );
  }
};

export default function Index() {
    const fetcher = useFetcher();

  // Automatically trigger action on first load
  useEffect(() => {
    if (fetcher.state === "idle" && !fetcher.data) {
      fetcher.submit(null, { method: "post" });
    }
  }, [fetcher]);

  const status = fetcher.data?.status;
  const message = fetcher.data?.message;

  return (
    <AppProvider i18n={en}>
      <Page title="Vaudit Dashboard">
        <Layout>
          <Layout.Section>
            <WelcomeCard />
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <ContactCard />
          </Layout.Section>
        </Layout>
      </Page>
    </AppProvider>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
