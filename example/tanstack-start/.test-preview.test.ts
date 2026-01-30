import { testRun } from "./testRun.js";

testRun("pnpm run preview --strictPort --port 3000", {
  serverIsReadyMessage: "Listening on:",
  tolerateError({ logText }) {
    return [
      // srvx messages
      "Shutting down server",
      "Server closed",
    ].some((txt) => logText.includes(txt));
  },
});
