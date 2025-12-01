const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 5173;
const filePath = path.join(__dirname, "index.html");

const server = http.createServer((req, res) => {
  fs.readFile(filePath, (err, data) => {
    if(err){
      res.writeHead(500);
      return res.end("Dosya okunamadý");
    }
    res.writeHead(200, {"Content-Type": "text/html"});
    res.end(data);
  });
});

server.listen(PORT, () => console.log("Frontend server running at http://localhost:" + PORT));
