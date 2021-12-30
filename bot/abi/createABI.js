const fs = require("fs");
const path = require("path");

let contractJson = process.argv[2];
let outputDirectory = process.argv[3];

if (process.argv.length != 4) {
    console.log("Usage: node createABI.js [contractJson] [output-directory]");
    process.exit(1);
}

const contents = fs.readFileSync(contractJson, "utf8");
const abi = JSON.parse(contents).abi;

let outputPath = outputDirectory;
if (outputDirectory.substr(outputDirectory.length - 1) != "/") {
    outputPath += "/";
}

const fileNameWithExt = contractJson.split("/").reverse()[0];
const fileName = path.parse(fileNameWithExt).name;
const lowerCaseFileName = fileName.charAt(0).toLowerCase() + fileName.slice(1);

const outputFileName = outputPath + lowerCaseFileName + ".json";

fs.writeFileSync(outputFileName, JSON.stringify(abi));
