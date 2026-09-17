const fs = require('fs');
const path = require('path');

const pkgPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

const version = pkg.version || '1.0.0';
const now = new Date();
const pad = (n) => String(n).padStart(2, '0');

const formattedDate = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
const tag = `v${version}`;

const versionTsContent = `// Auto-generated during build. Do not edit manually.
export const APP_VERSION = {
  version: '${version}',
  tag: '${tag}',
  buildTime: '${formattedDate}',
  buildTimestamp: ${now.getTime()}
};
`;

const versionJsonContent = JSON.stringify(
  {
    name: pkg.name || 'floorstock-web',
    appName: 'FloorStock Smart Medication System',
    version: version,
    tag: tag,
    buildTime: formattedDate,
    buildTimestamp: now.getTime()
  },
  null,
  2
);

// Write to src/environments/version.ts
const envDir = path.join(__dirname, '..', 'src', 'environments');
if (!fs.existsSync(envDir)) {
  fs.mkdirSync(envDir, { recursive: true });
}
fs.writeFileSync(path.join(envDir, 'version.ts'), versionTsContent, 'utf8');

// Write to src/assets/version.json
const assetsDir = path.join(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}
fs.writeFileSync(path.join(assetsDir, 'version.json'), versionJsonContent, 'utf8');

console.log(`[Version Tag] Embedded version: ${tag} (Built at: ${formattedDate})`);
