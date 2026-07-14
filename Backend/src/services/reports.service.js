const { spawn } = require("child_process");
const path = require("path");

const getReportsSummary = ({ from, to, assetId } = {}) => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "..", "..", "Analytics", "report.py");
    const pythonExe = process.platform === "win32"
  ? path.join(__dirname, "..", "..", "..", "ASnalytics", "venv", "Scripts", "python.exe")
  : "python3";

    const args = [scriptPath];
    if (from) args.push(`--from=${from}`);
    if (to) args.push(`--to=${to}`);
    if (assetId) args.push(`--assetId=${assetId}`);

    const python = spawn(pythonExe, args);

    let dataOutput = "";
    let errorOutput = "";

    python.stdout.on("data", (chunk) => {
      dataOutput += chunk.toString();
    });

    python.stderr.on("data", (chunk) => {
      errorOutput += chunk.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python stderr:", errorOutput);
        return reject(new Error("Python script failed"));
      }
      try {
        const result = JSON.parse(dataOutput.trim());
        resolve(result);
      } catch (err) {
        console.error("Failed to parse Python output:", dataOutput);
        reject(new Error("Invalid JSON from Python script"));
      }
    });
  });
};

module.exports = { getReportsSummary };
