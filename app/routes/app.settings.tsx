import {
  Form,
  useActionData,
  useLoaderData,
  type LoaderFunctionArgs,
  type ActionFunctionArgs,
} from "react-router";
import {
  AppProvider,
  Banner,
  Page,
  Text,
  Layout,
  Card,
  TextField,
  Button,
  BlockStack,
  Bleed,
} from "@shopify/polaris";
import { useState } from "react";
import en from "@shopify/polaris/locales/en.json";
import shopify from "app/shopify.server";
import {
  getShopPassKey,
  upsertShopPassKey,
} from "app/models/shopSettings.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await shopify.authenticate.admin(request);
  const existing = await getShopPassKey(session.shop);
  return { hasPassKey: !!existing };
}

export async function action({ request }: ActionFunctionArgs) {
  const { session } = await shopify.authenticate.admin(request);
  const formData = await request.formData();
  const passKey = formData.get("passKey") as string | null;

  if (!passKey) return { error: "Passkey is required" };

  await upsertShopPassKey(session.shop, passKey);
  return { success: true };
}

export default function AppSettings() {
  const { hasPassKey } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [value, setValue] = useState("");

  if (hasPassKey) {
    return (
      <AppProvider i18n={en}>
        <Page title="App Settings">
          <Layout.Section>
            <Banner tone="success" title="Passkey already saved">
              <p>Your passkey is stored securely.</p>
            </Banner>
          </Layout.Section>
        </Page>
      </AppProvider>
    );
  }

  return (
    <AppProvider i18n={en}>
      <Page title="App Settings">
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Bleed marginInline="400" marginBlock="400">
                <SettingsPlaceHolder />
              </Bleed>
              <BlockStack gap="400">
                <Form method="post">
                  <TextField
                    label=""
                    name="passKey"
                    value={value}
                    onChange={setValue}
                    autoComplete="off"
                    multiline={6}
                  />
                  <div style={{ marginTop: "1rem" }}>
                    <Button submit>Save passkey</Button>
                  </div>
                  {actionData?.error && (
                    <div style={{ marginTop: "1rem" }}>
                      <Banner tone="critical">{actionData.error}</Banner>
                    </div>
                  )}
                </Form>
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Page>
    </AppProvider>
  );
}

const SettingsPlaceHolder = () => {
  return (
    <div style={{ background: "#FF5A2B", padding: "10px", color: "white" }}>
      <BlockStack>
        <Text as="h2" variant="headingMd">
          {" "}
          Enter Your PassKey{" "}
        </Text>
      </BlockStack>
    </div>
  );
};
