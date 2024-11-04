import dotenv from 'dotenv';
dotenv.config();

import bodyParser from 'body-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import pdf from 'pdfjs';
import puppeteer, { Browser } from 'puppeteer';
import tmp from 'tmp';
import { print } from './print';
import { compressPDF, parseRequest } from './utils';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 1646;

const limit: string = process.env.BODY_LIMIT || '10mb';

app.use(express.json({ limit }));
app.use(bodyParser.text({ type: 'text/html', limit }));

async function launchBrowser(): Promise<Browser> {
  return puppeteer.launch({
    // @ts-ignore
    headless: 'new', // Updated headless option for Puppeteer v20+
    args: [
      '--disable-features=IsolateOrigins',
      '--disable-site-isolation-trials',
      '--autoplay-policy=user-gesture-required',
      '--disable-background-networking',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-breakpad',
      '--disable-client-side-phishing-detection',
      '--disable-component-update',
      '--disable-default-apps',
      '--disable-dev-shm-usage',
      '--disable-domain-reliability',
      '--disable-extensions',
      '--disable-features=AudioServiceOutOfProcess',
      '--disable-hang-monitor',
      '--disable-ipc-flooding-protection',
      '--disable-notifications',
      '--disable-offer-store-unmasked-wallet-cards',
      '--disable-popup-blocking',
      '--disable-print-preview',
      '--disable-prompt-on-repost',
      '--disable-renderer-backgrounding',
      '--disable-speech-api',
      '--disable-sync',
      '--hide-scrollbars',
      '--ignore-gpu-blacklist',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-default-browser-check',
      '--no-first-run',
      '--no-pings',
      '--no-sandbox',
      '--password-store=basic',
      '--use-gl=swiftshader',
      '--use-mock-keychain',
    ],
  });
}
app.post('/pdf', cors(), async (request: Request, response: Response) => {
  const browser = await launchBrowser();
  const { filename, options } = parseRequest(request);

  try {
    // Generate PDFs
    const files = await Promise.all(
      request.body.map(async (htmlContents: string) => {
        const { name: path, removeCallback: rm } = tmp.fileSync();
        await print({
          htmlContents,
          browser,
          options: { ...options, path },
        });
        return { path, rm };
      }),
    );

    // Merge all PDFs into one
    const res = files.reduce((merged, { path, rm }) => {
      merged.addPagesOf(new pdf.ExternalDocument(fs.readFileSync(path)));
      rm();
      return merged;
    }, new pdf.Document());

    // Compress and send the PDF
    const { name: outputPath, removeCallback: removeOutput } = tmp.fileSync({
      postfix: '.pdf',
    });
    res.pipe(fs.createWriteStream(outputPath)).on('finish', async () => {
      const success = await compressPDF(outputPath, outputPath, 150);
      if (success) {
        response.attachment(filename).send(fs.readFileSync(outputPath));
      } else {
        response.status(500).send('Failed to compress PDF');
      }
      removeOutput();
    });
  } catch (err) {
    response.status(500).send((err as Error).stack);
  } finally {
    await browser.close();
  }
});

app.options('/*', cors());

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  res.status(500).send(err.stack);
});

// Start the server
app.listen(port, () => {
  console.log(`HTML to PDF converter listening on port: ${port}`);
});
