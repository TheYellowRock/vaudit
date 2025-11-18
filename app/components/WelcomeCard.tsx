import { Bleed, BlockStack, Text, Card } from "@shopify/polaris";

export default function WelcomeCard() {
  return (
    <Card>
      <BlockStack gap="800">
        <Bleed marginInline="400" marginBlock="400">
          <WelcomePlaceHolder />
        </Bleed>
        <BlockStack gap="800">
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Get You Token First
            </Text>
            <Text as="p" variant="bodyMd">
              To successfully install Vaudit, you need to get your token first,
              if you don't have one please contact our support team{" "}
              <s-link href="https://stg-app.vaudit.com/ ">here</s-link>.
            </Text>
          </BlockStack>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Second, Activate the theme app extension - Necessary
            </Text>
            <Text as="p" variant="bodyMd">
              To enable Vaudit on your storefront, you must activate the theme
              extension. Open your Theme Editor, find the Vaudit app block or
              app embed, enable it, then click Save.
            </Text>
          </BlockStack>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">
              Next Step
            </Text>
            <Text as="p" variant="bodyMd">
              You can add or update your token through the settings page{" "}
              <s-link href="/app/settings">here</s-link>.
            </Text>
          </BlockStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}

const WelcomePlaceHolder = () => {
  return (
    <div style={{ background: "#FF5A2B", padding: "10px", color: "white" }}>
      <BlockStack>
        <Text as="h2" variant="headingMd">
          {" "}
          Welcome to Vaudit Installation Guide{" "}
        </Text>
      </BlockStack>
    </div>
  );
};
