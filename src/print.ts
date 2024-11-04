import { Browser, PDFOptions } from 'puppeteer';

export interface PrintParams {
  browser: Browser;
  htmlContents: string;
  options: PDFOptions;
}

export const print = async ({
  browser,
  htmlContents,
  options,
}: PrintParams): Promise<void> => {
  const page = await browser.newPage();
  await page.setContent(htmlContents, { waitUntil: 'networkidle0' });
  await page.pdf(options);
  await page.close();
};
