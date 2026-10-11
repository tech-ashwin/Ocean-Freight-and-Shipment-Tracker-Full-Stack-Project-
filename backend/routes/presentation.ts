import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createBlusparkPresentation } from '../utils/generatePptx.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const publicDir = path.resolve(rootDir, 'public');
const pptxFilePath = path.resolve(publicDir, 'BLUSPARK_Judges_Presentation.pptx');

export const presentationRouter = Router();

// GET /api/presentation/download-pptx
presentationRouter.get('/download-pptx', async (_req: Request, res: Response) => {
  try {
    // If file exists, stream it directly
    if (fs.existsSync(pptxFilePath)) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
      res.setHeader('Content-Disposition', 'attachment; filename="BLUSPARK_Judges_Presentation.pptx"');
      return res.sendFile(pptxFilePath);
    }

    // Otherwise generate on the fly
    const pres = createBlusparkPresentation();
    const buffer = await pres.write({ outputType: 'nodebuffer' }) as Buffer;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    res.setHeader('Content-Disposition', 'attachment; filename="BLUSPARK_Judges_Presentation.pptx"');
    res.setHeader('Content-Length', buffer.length);
    return res.end(buffer);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Error generating presentation file:', err);
    return res.status(500).json({ error: 'Failed to generate presentation', details: message });
  }
});
