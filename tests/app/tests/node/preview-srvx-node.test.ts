import { testRun } from "../testRun.js";

testRun("node", "preview", "srvx", {
  serverIsReadyMessage: "Listening on:",
  tolerateError({ logText }) {
    return [
      // srvx messages
      "Shutting down server",
      "Server closed",
    ].some((txt) => logText.includes(txt));
  },
});
