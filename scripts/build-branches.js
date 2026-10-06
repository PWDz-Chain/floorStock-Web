const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.join(__dirname, '..');

const ALL_TARGETS = {
  er: {
    id: 'er',
    name: 'Sunpasit-ER',
    branch: 'Sunpasit-ER',
    outputPath: 'dist/er/vmd-web',
    baseHref: '/VMD/'
  },
  ipd: {
    id: 'ipd',
    name: 'Sunpasit-IPD',
    branch: 'Sunpasit-IPD',
    outputPath: 'dist/ipd/vmd-web',
    baseHref: '/VMD/'
  }
};

function run(command) {
  return execSync(command, { cwd: rootDir, stdio: 'inherit' });
}

function runQuiet(command) {
  return execSync(command, { cwd: rootDir, encoding: 'utf8' }).trim();
}

function resetTransientFiles() {
  try {
    const versionFiles = ['src/assets/version.json', 'src/environments/version.ts'];
    const existing = versionFiles.filter(f => fs.existsSync(path.join(rootDir, f)));
    if (existing.length > 0) {
      runQuiet(`git checkout -- ${existing.join(' ')}`);
    }
  } catch (e) {
    // Ignore if not tracked or already clean
  }
}

async function main() {
  const arg = (process.argv[2] || 'all').toLowerCase();
  let targetsToBuild = [];

  if (arg === 'all') {
    targetsToBuild = [ALL_TARGETS.er, ALL_TARGETS.ipd];
  } else if (ALL_TARGETS[arg]) {
    targetsToBuild = [ALL_TARGETS[arg]];
  } else {
    console.error(`\x1b[31m[ERROR] Unknown target: '${arg}'. Valid options: 'er', 'ipd', 'all'\x1b[0m`);
    process.exit(1);
  }

  let initialBranch = '';
  let didStash = false;

  try {
    initialBranch = runQuiet('git rev-parse --abbrev-ref HEAD');
    console.log(`\n\x1b[36m==================================================\x1b[0m`);
    console.log(`\x1b[36m🚀 Starting Branch Build Process\x1b[0m`);
    console.log(`\x1b[36m   Initial Branch : ${initialBranch}\x1b[0m`);
    console.log(`\x1b[36m   Targets        : ${targetsToBuild.map(t => t.name).join(', ')}\x1b[0m`);
    console.log(`\x1b[36m==================================================\x1b[0m\n`);

    // Reset any dirty version files before starting
    resetTransientFiles();

    // Check for tracked uncommitted changes
    let isDirty = false;
    try {
      execSync('git diff-index --quiet HEAD --', { cwd: rootDir });
    } catch {
      isDirty = true;
    }

    if (isDirty) {
      console.log(`\x1b[33m[INFO] Tracked changes detected. Stashing changes temporarily...\x1b[0m`);
      run('git stash push -m "Auto-stashed before multi-branch build"');
      didStash = true;
    }

    const completed = [];

    for (let i = 0; i < targetsToBuild.length; i++) {
      const target = targetsToBuild[i];
      console.log(`\n\x1b[35m--------------------------------------------------\x1b[0m`);
      console.log(`\x1b[35m▶ [${i + 1}/${targetsToBuild.length}] Building branch: \x1b[1m${target.branch}\x1b[0m`);
      console.log(`\x1b[35m   Output directory: ${target.outputPath}\x1b[0m`);
      console.log(`\x1b[35m   Base href       : ${target.baseHref}\x1b[0m`);
      console.log(`\x1b[35m--------------------------------------------------\x1b[0m\n`);

      // Switch branch
      console.log(`\x1b[34m[1/3] Switching to branch '${target.branch}'...\x1b[0m`);
      resetTransientFiles();
      run(`git checkout ${target.branch}`);

      // Set version
      const versionScript = path.join(rootDir, 'scripts', 'set-version.js');
      if (fs.existsSync(versionScript)) {
        console.log(`\x1b[34m[2/3] Updating version information...\x1b[0m`);
        run('node scripts/set-version.js');
      }

      // Build Angular
      console.log(`\x1b[34m[3/3] Building Angular app...\x1b[0m`);
      run(`npx ng build --output-path=${target.outputPath} --base-href=${target.baseHref}`);

      // Clean transient generated files in this branch before moving on
      resetTransientFiles();

      completed.push(target);
      console.log(`\x1b[32m✔ Completed build for ${target.name} -> ${target.outputPath}\x1b[0m`);
    }

    console.log(`\n\x1b[32m==================================================\x1b[0m`);
    console.log(`\x1b[32m🎉 All builds completed successfully!\x1b[0m`);
    completed.forEach(c => {
      console.log(`   ✔ ${c.name.padEnd(20)} -> ${path.join(rootDir, c.outputPath)}`);
    });
    console.log(`\x1b[32m==================================================\x1b[0m\n`);

  } catch (err) {
    console.error(`\n\x1b[31m❌ Build failed with error:\x1b[0m`, err.message || err);
    process.exitCode = 1;
  } finally {
    resetTransientFiles();
    if (initialBranch) {
      console.log(`\x1b[34m[Restoring] Returning to initial branch '${initialBranch}'...\x1b[0m`);
      try {
        run(`git checkout ${initialBranch}`);
      } catch (e) {
        console.error(`\x1b[31m[Warning] Failed to checkout back to '${initialBranch}':\x1b[0m`, e.message);
      }
    }

    if (didStash) {
      console.log(`\x1b[33m[Restoring] Restoring stashed changes...\x1b[0m`);
      try {
        run('git stash pop');
      } catch (e) {
        console.error(`\x1b[31m[Warning] Failed to auto-pop stash. You can run 'git stash pop' manually.\x1b[0m`, e.message);
      }
    }
  }
}

main();
