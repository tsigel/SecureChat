const defaultUrl = "http://localhost:5173"
const siteUrl = (import.meta.env.VITE_SITE_URL ?? defaultUrl).replace(/\/$/, "")

export const siteConfig = {
  name: "SecureChat",
  description: "Защищенный мессенджер для приватного общения без посредников.",
  url: siteUrl,
  ogImage: "/placeholder.jpg",
  locale: "ru_RU",
}
