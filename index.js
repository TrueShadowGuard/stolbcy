import express from "express";
import * as path from "path";

const PORT = process.env.PORT || 8080;

const app = express();

app.use(express.static(path.resolve("static")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve("static", "index.html"));
});

app.listen(PORT, () => console.log("Listening on" + PORT));

