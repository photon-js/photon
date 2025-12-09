import * as crypto from "node:crypto";
import dns from "node:dns/promises";
import type { ServerOptions as HttpsServerOptions } from "node:https";
import * as net from "node:net";
import * as os from "node:os";
import type { ServerType } from "@photonjs/core/serve";
import { bold, cyan, green } from "colorette";

// Constants from Vite
const wildcardHosts = new Set(["0.0.0.0", "::", "0000:0000:0000:0000:0000:0000:0000:0000"]);

const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1", "0000:0000:0000:0000:0000:0000:0000:0001"]);

export interface Hostname {
  /** undefined sets the default behaviour of server.listen */
  host: string | undefined;
  /** resolve to localhost when possible */
  name: string;
}

export interface ResolvedServerUrls {
  local: string[];
  network: string[];
}

export interface AddressInfo {
  address: string;
  family: string;
  port: number;
}

/**
 * Generic server type that works with Node.js, Bun, and Deno
 */
// biome-ignore lint/suspicious/noExplicitAny: type
export type GenericServer = ServerType | Bun.Server<any> | Deno.HttpServer;

/**
 * Extract address info from any server type
 */
function getAddressInfo(server: GenericServer): AddressInfo | null {
  // Node.js Server
  if ("address" in server && typeof server.address === "function") {
    const addr = server.address();
    if (addr && typeof addr === "object" && "port" in addr) {
      return {
        address: addr.address,
        family: addr.family,
        port: addr.port,
      };
    }
    return null;
  }

  // Bun Server
  if ("hostname" in server && "port" in server) {
    if (!server.hostname || !server.port) return null;
    return {
      address: server.hostname,
      family: net.isIPv6(server.hostname) ? "IPv6" : "IPv4",
      port: server.port,
    };
  }

  // Deno Server
  if ("addr" in server && server.addr && typeof server.addr === "object") {
    if (server.addr.transport !== "tcp") return null;
    return {
      address: server.addr.hostname,
      family: net.isIPv6(server.addr.hostname) ? "IPv6" : "IPv4",
      port: server.addr.port,
    };
  }

  return null;
}

/**
 * Extract unique hostnames from certificate Subject Alternative Name
 */
export function extractHostnamesFromSubjectAltName(subjectAltName: string): string[] {
  const hostnames: string[] = [];
  let remaining = subjectAltName;
  while (remaining) {
    const nameEndIndex = remaining.indexOf(":");
    const name = remaining.slice(0, nameEndIndex);
    remaining = remaining.slice(nameEndIndex + 1);
    if (!remaining) break;

    const isQuoted = remaining[0] === '"';
    let value: string;
    if (isQuoted) {
      const endQuoteIndex = remaining.indexOf('"', 1);
      value = JSON.parse(remaining.slice(0, endQuoteIndex + 1));
      remaining = remaining.slice(endQuoteIndex + 1);
    } else {
      const maybeEndIndex = remaining.indexOf(",");
      const endIndex = maybeEndIndex === -1 ? remaining.length : maybeEndIndex;
      value = remaining.slice(0, endIndex);
      remaining = remaining.slice(endIndex);
    }
    remaining = remaining.slice(/* for , */ 1).trimStart();

    if (
      name === "DNS" &&
      // [::1] might be included but skip it as it's already included as a local address
      value !== "[::1]" &&
      // skip *.IPv4 addresses, which is invalid
      !(value.startsWith("*.") && net.isIPv4(value.slice(2)))
    ) {
      hostnames.push(value.replace("*", "vite"));
    }
  }
  return hostnames;
}

/**
 * Extract hostnames from SSL certificates
 */
export function extractHostnamesFromCerts(certs: HttpsServerOptions["cert"] | undefined): string[] {
  const certList = certs ? (Array.isArray(certs) ? certs : [certs]) : [];
  if (certList.length === 0) return [];

  const hostnames = certList
    .map((cert) => {
      try {
        return new crypto.X509Certificate(cert);
      } catch {
        return null;
      }
    })
    .flatMap((cert) => (cert?.subjectAltName ? extractHostnamesFromSubjectAltName(cert.subjectAltName) : []));

  return Array.from(new Set(hostnames));
}

/**
 * Returns resolved localhost address when `dns.lookup` result differs from DNS
 *
 * `dns.lookup` result is same when defaultResultOrder is `verbatim`.
 * Even if defaultResultOrder is `ipv4first`, `dns.lookup` result maybe same.
 * For example, when IPv6 is not supported on that machine/network.
 */
export async function getLocalhostAddressIfDiffersFromDNS(): Promise<string | undefined> {
  const [nodeResult, dnsResult] = await Promise.all([
    dns.lookup("localhost"),
    dns.lookup("localhost", { verbatim: true }),
  ]);
  const isSame = nodeResult.family === dnsResult.family && nodeResult.address === dnsResult.address;
  return isSame ? undefined : nodeResult.address;
}

export async function resolveHostname(optionsHost: string | boolean | undefined): Promise<Hostname> {
  let host: string | undefined;
  if (optionsHost === undefined || optionsHost === false) {
    // Use a secure default
    host = "localhost";
  } else if (optionsHost === true) {
    // If passed --host in the CLI without arguments
    host = undefined; // undefined typically means 0.0.0.0 or :: (listen on all IPs)
  } else {
    host = optionsHost;
  }

  // Set host name to localhost when possible
  let name = host === undefined || wildcardHosts.has(host) ? "localhost" : host;

  if (host === "localhost") {
    const localhostAddr = await getLocalhostAddressIfDiffersFromDNS();
    if (localhostAddr) {
      name = localhostAddr;
    }
  }

  return { host, name };
}

/**
 * Resolve server URLs for all network interfaces
 * Compatible with Node.js, Bun, and Deno server instances
 */
export async function resolveServerUrls(
  server: GenericServer | undefined,
  isHttps: boolean,
  optionsHost: string | undefined,
  httpsOptions: { cert?: HttpsServerOptions["cert"] } | undefined,
): Promise<ResolvedServerUrls | null> {
  if (!server) {
    return null;
  }

  const hostname = await resolveHostname(optionsHost);

  const address = getAddressInfo(server);

  if (!address) {
    return null;
  }

  const local: string[] = [];
  const network: string[] = [];
  const protocol = isHttps ? "https" : "http";
  const port = address.port;

  if (hostname.host !== undefined && !wildcardHosts.has(hostname.host)) {
    let hostnameName = hostname.name;
    // ipv6 host
    if (hostnameName.includes(":")) {
      hostnameName = `[${hostnameName}]`;
    }
    const url = `${protocol}://${hostnameName}:${port}`;
    if (loopbackHosts.has(hostname.host)) {
      local.push(url);
    } else {
      network.push(url);
    }
  } else {
    Object.values(os.networkInterfaces())
      .flatMap((nInterface) => nInterface ?? [])
      .filter((detail) => detail.address && detail.family === "IPv4")
      .forEach((detail) => {
        let host = detail.address.replace("127.0.0.1", hostname.name);
        // ipv6 host
        if (host.includes(":")) {
          host = `[${host}]`;
        }
        const url = `${protocol}://${host}:${port}`;
        if (detail.address.includes("127.0.0.1")) {
          local.push(url);
        } else {
          network.push(url);
        }
      });
  }

  const hostnamesFromCert = extractHostnamesFromCerts(httpsOptions?.cert);
  if (hostnamesFromCert.length > 0) {
    const existings = new Set([...local, ...network]);
    local.push(
      ...hostnamesFromCert.map((hostname) => `${protocol}://${hostname}:${port}`).filter((url) => !existings.has(url)),
    );
  }

  return { local, network };
}

export function printServerUrls(urls: ResolvedServerUrls): void {
  const colorUrl = (url: string) => cyan(url.replace(/:(\d+)\//, (_, port) => `:${bold(port)}/`));
  for (const url of urls.local) {
    console.log(`  ${green("➜")}  ${bold("Local")}:   ${colorUrl(url)}`);
  }
  for (const url of urls.network) {
    console.log(`  ${green("➜")}  ${bold("Network")}: ${colorUrl(url)}`);
  }
}
