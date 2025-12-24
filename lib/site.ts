const defaultUrl = "http://localhost:3000"
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? defaultUrl).replace(/\/$/, "")

export const siteConfig = {
  name: "SecureChat",
  description: "Защищенный мессенджер для приватного общения без посредников.",
  url: siteUrl,
  ogImage: "/placeholder.jpg",
  locale: "ru_RU",
}
