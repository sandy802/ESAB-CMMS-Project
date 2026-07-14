const { spawn } = require("child_process");
const path = require("path");

const exportCsv = () => {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, "..", "..", "..", "analytics", "export_csv.py");
    const pythonExe = path.join(__dirname, "..", "..", "..", "analytics", "venv", "Scripts", "python.exe");

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
