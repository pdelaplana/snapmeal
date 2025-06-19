#!/usr/bin/env node
// This script updates the build number in the config.ts file
// Usage: node scripts/update-build-number.mjs

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CONFIG_FILE_PATH = join(process.cwd(), 'src', 'lib', 'config.ts');

try {
  // Read the current config file
  const configFile = readFileSync(CONFIG_FILE_PATH, 'utf8');

  // Find the current build number using a regular expression
  const buildNumberRegex = /const BUILD_NUMBER = ['"](\d+)['"];/;
  const match = configFile.match(buildNumberRegex);

  if (!match) {
    console.error('Could not find BUILD_NUMBER in config file');
    process.exit(1);
  }

  const currentBuildNumber = Number.parseInt(match[1], 10);
  const newBuildNumber = currentBuildNumber + 1;

  // Replace the old build number with the new one
  const updatedConfigFile = configFile.replace(
    buildNumberRegex,
    `const BUILD_NUMBER = '${newBuildNumber}';`,
  );

  // Write the updated content back to the file
  writeFileSync(CONFIG_FILE_PATH, updatedConfigFile, 'utf8');

  console.log(`Successfully updated build number from ${currentBuildNumber} to ${newBuildNumber}`);
} catch (error) {
  console.error('Error updating build number:', error);
  process.exit(1);
}
