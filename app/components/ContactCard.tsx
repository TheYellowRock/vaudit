import { MediaCard } from "@shopify/polaris";

const ContactCard = () => {
  const handleContactClick = () => {
    window.open(
      "https://www.vaudit.com/category/help-article",
      "_blank",
      "noopener,noreferrer",
    );
  };
  return (
    <MediaCard
      title="Help Center" 
      portrait
      primaryAction={{
        content: "Help Center",
        onAction: handleContactClick,
      }}
      description="Need help? Visit our help center for more information."
    >
      <img
        alt=""
        width="100%"
        height="100%"
        style={{
          objectFit: "cover",
          objectPosition: "center",
          padding: "40px",
        }}
        src="/vaudit_logo.png"
      />
    </MediaCard>
  );
};

export default ContactCard;