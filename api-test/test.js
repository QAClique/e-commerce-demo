#! /usr/bin/env node
import karate from "@karatelabs/karate";
import fs from "node:fs";

karate.version = "1.5.1";

// Create the target directory if it doesn't exist
const targetDir = "./target";
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir);
}

// Options:
// -T=10: Set the number of threads to 10
// -C: Clean (delete) the target directory before running
// -f junit:xml: output report as JUnit XML (still does Karate HTML report as well)
karate.exec("-T=10 -C -f junit:xml");
