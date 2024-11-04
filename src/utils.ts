import { PDFOptions } from 'puppeteer';
import { Request } from 'express';
import { spawnSync } from 'child_process';

export interface ParsedRequest {
  filename: string;
  options: PDFOptions;
}

export function parseRequest(request: Request): ParsedRequest {
  return {
    filename: ((request.query.filename as string) || 'document').replace(
      /(\.pdf)?$/,
      '.pdf',
    ),
    options: {
      format: 'a4',
      landscape: false,
      printBackground: true,
      ...request.query,
      path: undefined, // Discard potential `path` parameter
    },
  };
}

export function compressPDF(
  sourcePdf: string,
  outputFile: string,
  res: number,
): boolean {
  const gsOptions = [
    '-sDEVICE=pdfwrite',
    '-dNOPAUSE',
    '-dQUIET',
    '-dBATCH',
    '-dDetectDuplicateImages=true',
    '-dDownsampleColorImages=true',
    '-dDownsampleGrayImages=true',
    '-dDownsampleMonoImages=true',
    `-dColorImageResolution=${res}`,
    `-dGrayImageResolution=${res}`,
    `-dMonoImageResolution=${res}`,
    `-sOutputFile=${outputFile}`,
    sourcePdf,
  ];

  return executeCommand('gs', gsOptions);
}

export function executeCommand(cmd: string, parameters: string[]): boolean {
  const result = spawnSync(cmd, parameters, {
    cwd: process.cwd(),
    env: process.env,
    stdio: 'pipe',
    encoding: 'utf-8',
  });
  return !result.stderr;
}
