import net from "net";

export function getAvailablePort(preferred = 9876): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.listen(preferred, "127.0.0.1", () => {
      const address = server.address() as net.AddressInfo;
      const port = address.port;
      server.close(() => resolve(port));
    });

    server.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        resolve(getAvailablePort(preferred + 1));
      } else {
        reject(err);
      }
    });
  });
}
