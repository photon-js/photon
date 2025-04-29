import './style.css'
import { setupCounter } from './counter.js'

// biome-ignore lint/style/noNonNullAssertion: <explanation>
setupCounter(document.querySelector('#counter')!)
