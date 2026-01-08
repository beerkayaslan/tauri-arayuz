#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Versiyon artırma tipi: patch (default), minor, major
const bumpType = process.argv[2] || 'patch';

function readJSON(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf-8'));
}

function writeJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

function bumpVersion(version, type) {
  const parts = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'patch':
    default:
      parts[2]++;
      break;
  }
  
  return parts.join('.');
}

function run(cmd) {
  console.log(`\n🚀 Running: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit', cwd: rootDir });
  } catch (error) {
    console.error(`❌ Command failed: ${cmd}`);
    process.exit(1);
  }
}

// Dosya yolları
const packageJsonPath = join(rootDir, 'package.json');
const tauriConfPath = join(rootDir, 'src-tauri', 'tauri.conf.json');

// Mevcut versiyonu al
const packageJson = readJSON(packageJsonPath);
const tauriConf = readJSON(tauriConfPath);

const currentVersion = packageJson.version;
const newVersion = bumpVersion(currentVersion, bumpType);

console.log(`\n📦 Version Bump: ${currentVersion} → ${newVersion} (${bumpType})`);

// package.json güncelle
packageJson.version = newVersion;
writeJSON(packageJsonPath, packageJson);
console.log(`✅ Updated package.json`);

// tauri.conf.json güncelle
tauriConf.version = newVersion;
writeJSON(tauriConfPath, tauriConf);
console.log(`✅ Updated tauri.conf.json`);

// Git commit ve tag oluştur
run('git add package.json src-tauri/tauri.conf.json');
run(`git commit -m "chore: bump version to v${newVersion}"`);
run(`git tag v${newVersion}`);

console.log(`\n✨ Release v${newVersion} prepared!`);
console.log(`\n📤 To push the release, run:`);
console.log(`   git push origin main --tags`);
console.log(`\nOr run with auto-push:`);
console.log(`   bun run release -- --push`);

// Auto push flag kontrolü
if (process.argv.includes('--push')) {
  run('git push origin main --tags');
  console.log(`\n🎉 Release v${newVersion} pushed successfully!`);
}
