import { z } from 'zod'

export const NetworkThrottleModeSchema = z.enum(['preset', 'custom'])

export const NetworkPresetSchema = z.enum([
  'No Throttling',
  'Fast 3G',
  'Slow 3G',
])

export const ExportScriptDialogSchema = z
  .object({
    scriptName: z
      .string()
      .min(1, { message: 'Required' })
      .regex(/^[\w,.\s-]+$/, { message: 'Invalid name' }),
    overwriteFile: z.boolean().default(false),
    networkMode: NetworkThrottleModeSchema.default('preset'),
    networkPreset: NetworkPresetSchema.default('No Throttling'),
    networkLatency: z.number().min(0).default(0),
    networkDownload: z.number().int().min(-1).default(-1),
    networkUpload: z.number().int().min(-1).default(-1),
  })
  .superRefine((data, ctx) => {
    if (data.networkMode === 'preset' && !data.networkPreset) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Choose a preset',
        path: ['networkPreset'],
      })
    }

    if (data.networkMode === 'custom') {
      if (Number.isNaN(data.networkLatency)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Latency is required',
          path: ['networkLatency'],
        })
      }

      if (Number.isNaN(data.networkDownload)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Download is required',
          path: ['networkDownload'],
        })
      }

      if (Number.isNaN(data.networkUpload)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Upload is required',
          path: ['networkUpload'],
        })
      }
    }
  })

export type ExportScriptDialogData = z.infer<typeof ExportScriptDialogSchema>
export type NetworkPreset = z.infer<typeof NetworkPresetSchema>
export type NetworkThrottleMode = z.infer<typeof NetworkThrottleModeSchema>

export type NetworkThrottleSelection =
  | { type: 'preset'; preset: NetworkPreset }
  | { type: 'custom'; latency: number; download: number; upload: number }
