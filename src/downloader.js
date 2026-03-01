import { mkdir, writeFile, chmod } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { tmpdir } from 'node:os';
import { createGunzip } from 'node:zlib';

const TARBALL_URL =
  'https://github.com/boxclawai/skills/archive/refs/heads/main.tar.gz';

export async function downloadSkill(skillName, destDir) {
  const res = await fetch(TARBALL_URL);
  if (!res.ok) {
    throw new Error(`Failed to download skills archive (HTTP ${res.status})`);
  }

  const tmpFile = join(tmpdir(), `boxclaw-${Date.now()}.tar.gz`);

  // Save tarball to temp file
  await pipeline(res.body, createWriteStream(tmpFile));

  // Extract specific skill directory
  await extractSkillFromTarball(tmpFile, skillName, destDir);

  // Cleanup temp file
  const { unlink } = await import('node:fs/promises');
  await unlink(tmpFile).catch(() => {});
}

async function extractSkillFromTarball(tarballPath, skillName, destDir) {
  // Dynamic import tar to handle it properly
  const { createReadStream } = await import('node:fs');
  const { createGunzip } = await import('node:zlib');

  // We'll parse the tar format manually to avoid extra deps
  // Use node:child_process with tar command (available on macOS + Linux)
  const { execSync } = await import('node:child_process');

  // Create destination directory
  await mkdir(destDir, { recursive: true });

  // Extract using system tar (available on macOS + Linux)
  // --strip-components=1 removes the top-level "skills-main/" prefix
  // We filter to only extract the skill directory
  execSync(
    `tar -xzf "${tarballPath}" -C "${destDir}" --strip-components=2 "skills-main/${skillName}/"`,
    { stdio: 'pipe' }
  );

  // Make scripts executable
  const { readdirSync, statSync } = await import('node:fs');
  const scriptsDir = join(destDir, 'scripts');
  try {
    const files = readdirSync(scriptsDir);
    for (const file of files) {
      const filePath = join(scriptsDir, file);
      if (statSync(filePath).isFile()) {
        await chmod(filePath, 0o755);
      }
    }
  } catch {
    // No scripts directory — that's fine
  }
}
