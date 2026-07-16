import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";

const emailCatalogUrl = new URL("./src/content/emailCatalogOverrides.json", import.meta.url);
const emailCatalogPathname = decodeURIComponent(emailCatalogUrl.pathname);
const EMAIL_CATALOG_FILE = /^\/[A-Za-z]:\//u.test(emailCatalogPathname)
  ? emailCatalogPathname.slice(1)
  : emailCatalogPathname;
const EMAIL_CATALOG_ENDPOINT = "/__admin/email-catalogs";
const MAX_ADMIN_PAYLOAD_BYTES = 6_000_000;
const NODE_FS_PROMISES_MODULE: string = "node:fs/promises";

interface AdminFileRequest {
  method?: string;
  setEncoding: (encoding: string) => void;
  on: {
    (event: "data", listener: (chunk: string) => void): void;
    (event: "end", listener: () => void): void;
  };
}

async function writeEmailCatalogFile(contents: string): Promise<void> {
  const fileSystem = await import(NODE_FS_PROMISES_MODULE) as {
    writeFile: (path: string, data: string, encoding: string) => Promise<void>;
  };
  await fileSystem.writeFile(EMAIL_CATALOG_FILE, contents, "utf8");
}

function isValidEmailCatalogs(value: unknown): value is Record<
  string,
  { subject: string; body: string }
> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  return Object.entries(value).every(([key, copy]) => {
    if (!/^[0-7]:[a-z0-9-]+$/u.test(key) || !copy || typeof copy !== "object") {
      return false;
    }
    const candidate = copy as { subject?: unknown; body?: unknown };
    return typeof candidate.subject === "string" &&
      candidate.subject.trim().length > 0 &&
      candidate.subject.length <= 200 &&
      typeof candidate.body === "string" &&
      candidate.body.trim().length > 0 &&
      candidate.body.length <= 5_000;
  });
}

function emailCatalogAdminPlugin(): Plugin {
  return {
    name: "email-catalog-admin-file-writer",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(EMAIL_CATALOG_ENDPOINT, (request, response, next) => {
        const adminRequest = request as unknown as AdminFileRequest;
        if (adminRequest.method !== "PUT") {
          next();
          return;
        }

        let raw = "";
        let payloadTooLarge = false;
        adminRequest.setEncoding("utf8");
        adminRequest.on("data", (chunk: string) => {
          if (payloadTooLarge) return;
          raw += chunk;
          if (new TextEncoder().encode(raw).byteLength > MAX_ADMIN_PAYLOAD_BYTES) {
            payloadTooLarge = true;
          }
        });
        adminRequest.on("end", () => {
          void (async () => {
            try {
              if (payloadTooLarge) {
                response.statusCode = 413;
                response.end("Cataloghi email troppo grandi");
                return;
              }
              const catalogs: unknown = JSON.parse(raw);
              if (!isValidEmailCatalogs(catalogs)) {
                response.statusCode = 400;
                response.end("Cataloghi email non validi");
                return;
              }
              const sortedCatalogs = Object.fromEntries(
                Object.entries(catalogs).sort(([left], [right]) =>
                  left.localeCompare(right, "it-IT", { numeric: true }),
                ),
              );
              await server.watcher.unwatch(EMAIL_CATALOG_FILE);
              try {
                await writeEmailCatalogFile(
                  `${JSON.stringify(sortedCatalogs, null, 2)}\n`,
                );
              } finally {
                setTimeout(() => server.watcher.add(EMAIL_CATALOG_FILE), 250);
              }
              response.statusCode = 200;
              response.setHeader("Content-Type", "application/json");
              response.end(JSON.stringify({ file: EMAIL_CATALOG_FILE }));
            } catch {
              response.statusCode = 500;
              response.end("Impossibile scrivere il file dei cataloghi email");
            }
          })();
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), emailCatalogAdminPlugin()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    css: true,
    exclude: ["tests/e2e/**", "node_modules/**", ".kilo/**", "dist/**"],
  },
});
