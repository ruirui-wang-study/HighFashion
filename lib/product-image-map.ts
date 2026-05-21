const pexelsBase = "https://images.pexels.com/photos";

function pexelsImage(id: string, width = 1600, height = 2000) {
  return `${pexelsBase}/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`;
}

export const productImageMap: Record<string, string> = {
  "knee-sleeve-hero": pexelsImage("6203585"),
  "knee-sleeve-scale": pexelsImage("33417695"),
  "knee-sleeve-detail": pexelsImage("4429137"),

  "patella-hero": pexelsImage("6203585"),
  "patella-scale": pexelsImage("33417695"),
  "patella-detail": pexelsImage("4429137"),

  "hydration-hero": pexelsImage("10226372"),
  "hydration-scale": pexelsImage("9871654"),
  "hydration-detail": pexelsImage("17979571"),

  "belt-hero": pexelsImage("9871631"),
  "belt-scale": pexelsImage("9871654"),
  "belt-detail": pexelsImage("17979571"),

  "socks-hero": pexelsImage("34663465"),
  "socks-scale": pexelsImage("16499255"),
  "socks-detail": pexelsImage("9786898"),

  "sweatband-hero": pexelsImage("8007580"),
  "sweatband-scale": pexelsImage("5730286"),
  "sweatband-detail": pexelsImage("4863837"),

  "bottle-hero": pexelsImage("7690201"),
  "bottle-scale": pexelsImage("4853098"),
  "bottle-detail": pexelsImage("6922154"),

  "recovery-hero": pexelsImage("4429137"),
  "recovery-scale": pexelsImage("33417695"),
  "recovery-detail": pexelsImage("6922154"),
};

export function resolveProductImage(image?: string | null) {
  if (!image) return undefined;
  if (image.startsWith("http://") || image.startsWith("https://")) return image;
  return productImageMap[image];
}
