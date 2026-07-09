const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(process.argv[2] || "dist");
const port = Number(process.argv[3] || 5183);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css"
};

http
  .createServer((request, response) => {
    let pathname = decodeURIComponent(request.url.split("?")[0]);
    if (pathname === "/" || pathname === "") pathname = "/index.html";
    const file = path.join(root, pathname);

    fs.readFile(file, (error, bytes) => {
      if (error) {
        response.writeHead(404);
        response.end("not found");
        return;
      }
      response.writeHead(200, {
        "Content-Type": types[path.extname(file)] || "application/octet-stream"
      });
      response.end(bytes);
    });
  })
  .listen(port, "127.0.0.1", () => {
    console.log(`Static server listening on http://127.0.0.1:${port}`);
  });
