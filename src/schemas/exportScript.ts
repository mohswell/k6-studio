import { z } from 'zod'

export const ExportScriptDialogSchema = z.object({
  scriptName: z
    .string()
    .min(1, { message: 'Required' })
    .regex(/^[\w,.\s-]+$/, { message: 'Invalid name' }),
  overwriteFile: z.boolean().default(false),
  networkProfile: z
    .enum(['none', 'fast3g', 'slow3g'])
    .optional()
    .default('none'),
})

export type ExportScriptDialogData = z.infer<typeof ExportScriptDialogSchema>
