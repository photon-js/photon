import "./style.css";
import { setupCounter } from "./counter.js";

setupCounter(document.querySelector("#counter") as HTMLButtonElement);

// Dynamically append Photon logo
const img = document.createElement("img");
img.src = "/logo.svg";
img.alt = "Photon logo";
img.className = "logo";

// biome-ignore lint/style/noNonNullAssertion: <explanation>
const h1 = document.querySelector("h1")!;

h1.parentNode?.insertBefore(img, h1);
