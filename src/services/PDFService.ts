import 'fast-text-encoding';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { readFileAsUint8Array } from './FileService';
import type { Annotation, FormFieldValue } from '@/store/editorStore';

export interface SplitRange {
  from: number;
  to: number;
  name?: string;
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return rgb(r, g, b);
}

function rgbaStringToComponents(rgba: string): {
  r: number;
  g: number;
  b: number;
  opacity: number;
} {
  const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!match) return { r: 1, g: 0.9, b: 0, opacity: 0.4 };
  return {
    r: parseInt(match[1]) / 255,
    g: parseInt(match[2]) / 255,
    b: parseInt(match[3]) / 255,
    opacity: match[4] ? parseFloat(match[4]) : 0.4,
  };
}

export async function loadDocument(filePath: string): Promise<PDFDocument> {
  const bytes = await readFileAsUint8Array(filePath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  doc.registerFontkit(fontkit);
  return doc;
}

export async function applyEditsAndSerialize(
  filePath: string,
  annotations: Annotation[],
  formFields: FormFieldValue[]
): Promise<Uint8Array> {
  const doc = await loadDocument(filePath);
  const pages = doc.getPages();

  // Apply form field values
  try {
    const form = doc.getForm();
    for (const field of formFields) {
      try {
        if (field.fieldType === 'text') {
          const tf = form.getTextField(field.fieldName);
          tf.setText(String(field.value));
        } else if (field.fieldType === 'checkbox') {
          const cb = form.getCheckBox(field.fieldName);
          if (field.value) cb.check();
          else cb.uncheck();
        } else if (field.fieldType === 'dropdown') {
          const dd = form.getDropdown(field.fieldName);
          dd.select(String(field.value));
        }
      } catch {
        // Field might not exist or be read-only; skip
      }
    }
    form.flatten();
  } catch {
    // No form fields in this PDF
  }

  // Apply annotations per page
  for (const annotation of annotations) {
    if (annotation.pageIndex >= pages.length) continue;
    const page = pages[annotation.pageIndex];
    const { width, height } = page.getSize();

    // Convert normalized coords to PDF points
    const pdfX = annotation.x * width;
    const pdfY = (1 - annotation.y - annotation.height) * height;
    const pdfW = annotation.width * width;
    const pdfH = annotation.height * height;

    if (annotation.type === 'highlight') {
      const { r, g, b, opacity } = rgbaStringToComponents(
        annotation.color ?? 'rgba(255,235,59,0.5)'
      );
      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
        color: rgb(r, g, b),
        opacity,
      });
    } else if (annotation.type === 'redact') {
      page.drawRectangle({
        x: pdfX,
        y: pdfY,
        width: pdfW,
        height: pdfH,
        color: rgb(0, 0, 0),
        opacity: 1,
      });
    } else if (annotation.type === 'signature' && annotation.imageBase64) {
      try {
        const imageBytes = Uint8Array.from(
          atob(annotation.imageBase64.replace(/^data:image\/png;base64,/, '')),
          (c) => c.charCodeAt(0)
        );
        const image = await doc.embedPng(imageBytes);
        page.drawImage(image, {
          x: pdfX,
          y: pdfY,
          width: pdfW,
          height: pdfH,
        });
      } catch {
        // Signature embedding failed; skip
      }
    }
  }

  return doc.save();
}

export async function mergePDFs(filePaths: string[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create();

  for (const path of filePaths) {
    const bytes = await readFileAsUint8Array(path);
    const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    for (const page of copiedPages) {
      mergedDoc.addPage(page);
    }
  }

  return mergedDoc.save();
}

export async function splitPDF(
  filePath: string,
  ranges: SplitRange[]
): Promise<Uint8Array[]> {
  const bytes = await readFileAsUint8Array(filePath);
  const srcDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const results: Uint8Array[] = [];

  for (const range of ranges) {
    const newDoc = await PDFDocument.create();
    const indices: number[] = [];
    for (let i = range.from - 1; i < range.to; i++) {
      if (i >= 0 && i < srcDoc.getPageCount()) {
        indices.push(i);
      }
    }
    const copiedPages = await newDoc.copyPages(srcDoc, indices);
    for (const page of copiedPages) {
      newDoc.addPage(page);
    }
    results.push(await newDoc.save());
  }

  return results;
}

export async function addBlankPage(
  filePath: string,
  atIndex: number
): Promise<Uint8Array> {
  const doc = await loadDocument(filePath);
  const pages = doc.getPages();
  const refPage = pages[Math.min(atIndex, pages.length - 1)];
  const { width, height } = refPage.getSize();
  const newPage = doc.insertPage(atIndex, [width, height]);
  // Draw a subtle border so the blank page is visible
  newPage.drawRectangle({
    x: 10,
    y: 10,
    width: width - 20,
    height: height - 20,
    borderColor: rgb(0.9, 0.9, 0.9),
    borderWidth: 1,
    opacity: 0,
  });
  return doc.save();
}

export async function addPageFromPDF(
  targetPath: string,
  sourcePath: string,
  sourcePageIndex: number,
  atIndex: number
): Promise<Uint8Array> {
  const [targetBytes, sourceBytes] = await Promise.all([
    readFileAsUint8Array(targetPath),
    readFileAsUint8Array(sourcePath),
  ]);
  const targetDoc = await PDFDocument.load(targetBytes, {
    ignoreEncryption: true,
  });
  const sourceDoc = await PDFDocument.load(sourceBytes, {
    ignoreEncryption: true,
  });
  const [copiedPage] = await targetDoc.copyPages(sourceDoc, [sourcePageIndex]);
  targetDoc.insertPage(atIndex, copiedPage);
  return targetDoc.save();
}

export async function removePage(
  filePath: string,
  pageIndex: number
): Promise<Uint8Array> {
  const doc = await loadDocument(filePath);
  doc.removePage(pageIndex);
  return doc.save();
}

export async function removePages(
  filePath: string,
  pageIndices: number[]
): Promise<Uint8Array> {
  const doc = await loadDocument(filePath);
  // Remove from highest index to lowest to avoid shifting issues
  const sorted = [...pageIndices].sort((a, b) => b - a);
  for (const idx of sorted) {
    if (idx >= 0 && idx < doc.getPageCount()) {
      doc.removePage(idx);
    }
  }
  return doc.save();
}

export async function rotatePage(
  filePath: string,
  pageIndex: number,
  angle: 90 | 180 | 270
): Promise<Uint8Array> {
  const doc = await loadDocument(filePath);
  const page = doc.getPage(pageIndex);
  const current = page.getRotation().angle;
  page.setRotation(degrees((current + angle) % 360));
  return doc.save();
}

export async function getPageCount(filePath: string): Promise<number> {
  const bytes = await readFileAsUint8Array(filePath);
  const doc = await PDFDocument.load(bytes, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  return doc.getPageCount();
}

export interface FormField {
  name: string;
  type: 'text' | 'checkbox' | 'radio' | 'dropdown';
  x: number;
  y: number;
  width: number;
  height: number;
  pageIndex: number;
  options?: string[];
  value?: string | boolean;
}

export async function extractFormFields(filePath: string): Promise<FormField[]> {
  try {
    const bytes = await readFileAsUint8Array(filePath);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const form = doc.getForm();
    const fields = form.getFields();
    const pages = doc.getPages();
    const result: FormField[] = [];

    for (const field of fields) {
      try {
        const widgets = field.acroField.getWidgets();
        for (const widget of widgets) {
          const rect = widget.getRectangle();
          const pageRef = widget.P();
          const pageIndex = pages.findIndex(
            (p) => p.ref === pageRef
          );
          if (pageIndex === -1) continue;
          const page = pages[pageIndex];
          const { height: pageHeight, width: pageWidth } = page.getSize();

          const normalized = {
            x: rect.x / pageWidth,
            y: 1 - (rect.y + rect.height) / pageHeight,
            width: rect.width / pageWidth,
            height: rect.height / pageHeight,
            pageIndex,
          };

          const fieldName = field.getName();
          let fieldType: FormField['type'] = 'text';
          let options: string[] | undefined;
          let value: string | boolean | undefined;

          if (field.constructor.name === 'PDFCheckBox') {
            fieldType = 'checkbox';
          } else if (field.constructor.name === 'PDFRadioGroup') {
            fieldType = 'radio';
          } else if (field.constructor.name === 'PDFDropdown') {
            fieldType = 'dropdown';
            try {
              // @ts-ignore
              options = field.getOptions();
              // @ts-ignore
              value = field.getSelected()?.[0];
            } catch {
              /* empty */
            }
          } else {
            // TextField
            try {
              // @ts-ignore
              value = field.getText() ?? '';
            } catch {
              value = '';
            }
          }

          result.push({
            name: fieldName,
            type: fieldType,
            ...normalized,
            options,
            value,
          });
        }
      } catch {
        // Skip problematic fields
      }
    }
    return result;
  } catch {
    return [];
  }
}
