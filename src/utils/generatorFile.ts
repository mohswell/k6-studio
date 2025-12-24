import log from 'electron-log/main'
import { readdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { GENERATORS_PATH } from '@/constants/workspace'
import { GeneratorFileDataSchema } from '@/schemas/generator'

// Updates the recordingPath in all generators that reference the old recording file name.
export async function updateGeneratorRecordingReferences(
  oldFileName: string,
  newFileName: string
): Promise<void> {
  const generatorFiles = await readdir(GENERATORS_PATH, { withFileTypes: true })

  await Promise.all(
    generatorFiles
      .filter((file) => file.isFile() && file.name.endsWith('.k6g'))
      .map(async (file) => {
        try {
          const filePath = path.join(GENERATORS_PATH, file.name)
          const contents = await readFile(filePath, 'utf-8')
          const json: unknown = JSON.parse(contents)
          const result = GeneratorFileDataSchema.safeParse(json)

          if (!result.success || result.data.recordingPath !== oldFileName) {
            return
          }

          result.data.recordingPath = newFileName
          await writeFile(filePath, JSON.stringify(result.data, null, 2))
        } catch (error) {
          log.error('Failed to update generator recording reference', {
            file: file.name,
            error,
          })
        }
      })
  )
}
