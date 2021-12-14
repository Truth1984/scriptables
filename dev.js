// save files from src to icloud drive
// scriptable scripts are saved to `~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents`

const os = require("os");
const tasklanguage = require("tl2");
const u = require("awadau");
const un = require("backend-core-bm").un;

const task = new tasklanguage();
const appPath = `~/Library/Mobile Documents/iCloud~dk~simonbs~Scriptable/Documents`;

task.add("check-platform", () => {
  if (os.platform() != "darwin") return Promise.reject("You are not on a mac");
});

task.add("check-app-exist", () => {
  if (!un.fileExist(appPath)) return Promise.reject("can't find scriptable on icloud");
});

task.add("copy-files", () => {
  return un.fileMove("./src", appPath, false, true, true);
});

task
  .runAuto()
  .then(() => console.log("Sync complete"))
  .catch((e) => console.log("Error", e));
