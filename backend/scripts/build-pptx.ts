import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBlusparkPresentation } from '../utils/generatePptx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const publicDir = path.resolve(rootDir, 'public');

async function build() {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.resolve(publicDir, 'BLUSPARK_Judges_Presentation.pptx');
  const pres = createBlusparkPresentation();

  await pres.writeFile({ fileName: outputPath });
  const stats = fs.statSync(outputPath);
  console.log(`✅ PowerPoint successfully generated: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

build().catch((err) => {
  console.error('Failed to generate PPTX:', err);
  process.exit(1);
});
