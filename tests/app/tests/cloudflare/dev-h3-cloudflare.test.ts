import { testRun } from "../testRun.js";

testRun("cloudflare", "dev", "h3", {
  tolerateError({ logText }) {
    return [
      // false-positive cloudflare warnings. See https://github.com/cloudflare/workers-sdk/issues/12194
      "Unexpected Node.js imports for environment",
    ].some((txt) => logText.includes(txt));
  },
});
