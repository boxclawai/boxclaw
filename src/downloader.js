import { mkdir, chmod, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const TARBALL_URL =
  'https://github.com/boxclawai/skills/archive/refs/heads/main.tar.gz';

export async function downloadFromTarball(subdir, destDir) {
  const res = await fetch(TARBALL_URL);
  if (!res.ok) {
    throw new Error(`Failed to download archive (HTTP ${res.status})`);
  }

  const tmpFile = join(tmpdir(), `boxclaw-${Date.now()}.tar.gz`);

  await pipeline(res.body, createWriteStream(tmpFile));
  await mkdir(destDir, { recursive: true });

  // strip-components = 1 (skills-main) + depth of subdir path
  const stripCount = 1 + subdir.split('/').length;

  execSync(
    `tar -xzf "${tmpFile}" -C "${destDir}" --strip-components=${stripCount} "skills-main/${subdir}/"`,
    { stdio: 'pipe' }
  );

  await unlink(tmpFile).catch(() => {});

  // Make scripts executable
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
    // No scripts directory
  }
}
