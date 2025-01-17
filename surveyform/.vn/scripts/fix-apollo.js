// This is currently (11/2022) needed on Netlify 
// because this patch breaks Gatsby install (result app)
// but is needed for the Next.js (surveyform)
// We can't prevent the script to run as all postinstall are run during a monorepo PNPM install
if (process.env.IGNORE_APOLLO_PATCH) {
  console.warn("IGNORING SURVEYFORM APOLLO CLIENT PATCH")
  return
}
/**
 * To be used for subdependencies
 * (you can also explicitely install the subdependency to create
 * a symlink directly in "node_modues/ts-invariant")
 */
// This doesn't work on Vercel, probably because of the symlinks
const PNPM_ROOT = "../node_modules/.pnpm/"
const edits = [
  [
    // PNPM version
    PNPM_ROOT + "node_modules/ts-invariant/package.json",
    {
      type: "module",
      exports: {
        // v0.9 of ts-invariant
        // ".": "./lib/invariant.esm.js",
        // v0.10 of ts-invariant
        ".": "./lib/invariant.js",
        "./process/index.js": "./process/index.js",
      },
    },
  ],
  [
    PNPM_ROOT + "node_modules/ts-invariant/process/package.json",
    {
      type: "module",
    },
  ],
  [
    "node_modules/@apollo/client/package.json",
    {
      exports: {
        ".": "./index.js",
        "./link/error": "./link/error/index.js",
      },
    },
  ],
  ,
  [
    "node_modules/@apollo/client/link/error/package.json",
    {
      exports: {
        ".": "./index.js",
      },
    },
  ],
  /*
  Experiment to force Gatsby to use the ESM version of globals
  but it keeps loading "globals.cjs" instead because it uses @apollo/client CJS version
  [
    "node_modules/@apollo/client/utilities/globals/package.json",
    {
      exports: {
        ".": "./index.js",
      },
    },
  ],
  */
];

const fs = require("fs");
const path = require("path");

edits.forEach(([packageJsonPath, fieldsToAdd]) => {
  const fullPath = path.resolve(__dirname, "../../", packageJsonPath);
  console.log("Add fields", fieldsToAdd, "to", fullPath);
  console.log("Edited");
  const currentPackage = JSON.parse(fs.readFileSync(fullPath));
  const editedPackage = { ...currentPackage, ...fieldsToAdd };
  fs.writeFileSync(fullPath, JSON.stringify(editedPackage));
  // Drop .next folder to force a rebuild
  console.log(
    "Edited, will drop '.next' folder to avoid build issues (only during dev)"
  );
  const dotNextFolder = path.resolve(__dirname, "../../", ".next");
  if (process.NODE_ENV !== "production" && fs.existsSync(dotNextFolder)) {
    fs.rmdirSync(dotNextFolder, { recursive: true });
  }
});
