const { spawn } = require("child_process");
const path = require("path");

const exportCsv = () => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "..", "..", "Analytics", "export_csv.py");
const pythonExe = process.platform === "win32"
  ? path.join(__dirname, "..", "..", "..", "Analytics", "venv", "Scripts", "python.exe")
  : "python3";
    const python = spawn(pythonExe, [scriptPath]);

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
        return reject(new Error("CSV export failed"));
      }
      resolve(dataOutput);
    });
  });
};

module.exports = { exportCsv };
