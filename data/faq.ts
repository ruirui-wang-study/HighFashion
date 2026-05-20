export type FaqItem = {
  question: string;
  answer: string;
};

export const faqs: FaqItem[] = [
  {
    question: "Where do you ship?",
    answer: "This MVP is designed for US and UK DTC markets. Real shipping rates can be connected through Shopify or a carrier service later.",
  },
  {
    question: "When is shipping free?",
    answer: "The storefront displays free shipping over $60. This threshold is currently mock logic in the cart.",
  },
  {
    question: "What is the return policy?",
    answer: "The site message is 30-day returns. A live policy page can later pull content from a CMS or Shopify page.",
  },
  {
    question: "Is checkout active?",
    answer: "No. Checkout is disabled in this MVP and shows a payment integration coming soon message.",
  },
  {
    question: "How do I choose a size?",
    answer: "Use the Fit Guide and product-page measurement modules. Size selection is always a button group, not a dropdown.",
  },
];
