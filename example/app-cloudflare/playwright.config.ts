export { default } from "e2e/config";
// We cannot E2E test Cloudflare Workers with Durable Objects as no preview URL is generated for them,
// as stated in the documentation https://developers.cloudflare.com/workers/configuration/previews/#limitations
// This example does not include DO for that reason.
