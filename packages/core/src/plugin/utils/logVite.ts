import { bold, cyan } from "ansis";

export { logViteInfo };

function logViteInfo(message: string) {
  console.log(`${bold(cyan("[vite]"))} ${message}`);
}
