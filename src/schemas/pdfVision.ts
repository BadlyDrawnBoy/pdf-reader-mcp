import { bool, description, gte, type InferOutput, int, num, object, optional } from '@sylphx/vex';
import { pdfSourceSchema } from './pdfSource.js';

export const pdfVisionArgsSchema = object({
  source: pdfSourceSchema,
  page: num(int, gte(1), description('1-based page number.')),
  index: optional(
    num(
      int,
      gte(0),
      description(
        '0-based image index within the page. If provided, Vision will analyze the specific image. If omitted, Vision will analyze the entire rendered page.'
      )
    )
  ),
  cache: optional(bool(description('Use cached Vision result when available. Defaults to true.'))),
});

export type PdfVisionArgs = InferOutput<typeof pdfVisionArgsSchema>;
