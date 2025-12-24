import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertDialog, Flex } from '@radix-ui/themes'
import { FileCode2Icon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import {
  ExportScriptDialogData,
  ExportScriptDialogSchema,
} from '@/schemas/exportScript'
import { useStudioUIStore } from '@/store/ui'

import { getScriptNameWithExtension } from './ExportScriptDialog.utils'
import { OverwriteFileWarning } from './OverwriteFileWarning'
import { ScriptNameForm } from './ScriptNameForm'

interface ExportScriptDialogProps {
  open: boolean
  scriptName: string
  onExport?: (scriptName: string) => void
  onExportFull?: (data: ExportScriptDialogData) => void
  onOpenChange: (open: boolean) => void
  showNetworkProfile?: boolean
}

export function ExportScriptDialog({
  open,
  scriptName,
  onExport,
  onExportFull,
  onOpenChange,
  showNetworkProfile = false,
}: ExportScriptDialogProps) {
  const scripts = useStudioUIStore((store) => store.scripts)

  const formMethods = useForm<ExportScriptDialogData>({
    resolver: zodResolver(ExportScriptDialogSchema),
    defaultValues: {
      scriptName,
      networkProfile: 'none',
    },
  })

  const [alwaysOverwriteScript, setAlwaysOverwriteScript] = useLocalStorage(
    'alwaysOverwriteScript',
    false
  )
  const { setValue } = formMethods

  useEffect(() => {
    if (!open) {
      return
    }

    setValue('scriptName', scriptName)
    setValue('overwriteFile', false)
    setValue('networkProfile', 'none')
  }, [open, scriptName, setValue])

  const onSubmit = (data: ExportScriptDialogData) => {
    const { scriptName: userInput, overwriteFile } = data
    const fileName = getScriptNameWithExtension(userInput)
    const fileExists = Array.from(scripts.keys()).includes(fileName)
    if (fileExists && !overwriteFile && !alwaysOverwriteScript) {
      setValue('overwriteFile', true)
      return
    }

    if (onExportFull) {
      onExportFull({ ...data, scriptName: fileName })
    } else if (onExport) {
      onExport(fileName)
    }
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) {
      setValue('overwriteFile', false)
    }
  }

  const { overwriteFile: showOverwriteWarning } = formMethods.watch()

  return (
    <AlertDialog.Root open={open} onOpenChange={handleOpenChange}>
      <AlertDialog.Content
        size="3"
        maxWidth="450px"
        onEscapeKeyDown={(event) => {
          event.preventDefault()
        }}
      >
        <AlertDialog.Title>
          <Flex align="center" gap="2">
            <FileCode2Icon
              css={css`
                color: var(--accent-9);
              `}
            />
            Export script
          </Flex>
        </AlertDialog.Title>

        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            {showNetworkProfile && (
              <Flex direction="column" gap="1" mb="3">
                <label
                  css={css`
                    font-size: 14px;
                    color: var(--gray-12);
                  `}
                >
                  Network profile
                </label>
                <select
                  {...formMethods.register('networkProfile')}
                  css={css`
                    padding: 8px 10px;
                    border: 1px solid var(--gray-6);
                    border-radius: 6px;
                    background: var(--color-surface);
                    color: var(--gray-12);
                  `}
                >
                  <option value="none">None</option>
                  <option value="fast3g">Fast 3G</option>
                  <option value="slow3g">Slow 3G</option>
                </select>
              </Flex>
            )}
            {showOverwriteWarning ? (
              <OverwriteFileWarning />
            ) : (
              <ScriptNameForm
                alwaysOverwriteScript={!!alwaysOverwriteScript}
                setAlwaysOverwriteScript={setAlwaysOverwriteScript}
              />
            )}
          </form>
        </FormProvider>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
