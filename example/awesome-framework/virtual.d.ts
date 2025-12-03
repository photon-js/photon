declare module "virtual:awesome-plugin:*" {
  // biome-ignore lint/suspicious/noExplicitAny: any
  const handler: any;
  export default handler;
}
