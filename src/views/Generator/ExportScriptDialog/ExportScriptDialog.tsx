import { css } from '@emotion/react'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertDialog, Flex, Button } from '@radix-ui/themes'
import { FileCode2Icon } from 'lucide-react'
import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocalStorage } from 'react-use'

import {
  ExportScriptDialogData,
  ExportScriptDialogSchema,
  NetworkThrottleSelection,
} from '@/schemas/exportScript'
import { useStudioUIStore } from '@/store/ui'

import { getScriptNameWithExtension } from './ExportScriptDialog.utils'
import { NetworkSettingsForm } from './NetworkSettingsForm'
import { OverwriteFileWarning } from './OverwriteFileWarning'
import { ScriptNameForm } from './ScriptNameForm'

interface ExportScriptDialogProps {
  open: boolean
  scriptName: string
  onExport: (
    scriptName: string,
    networkThrottle?: NetworkThrottleSelection
  ) => void
  onOpenChange: (open: boolean) => void
  showNetworkSettings?: boolean
}

export function ExportScriptDialog({
  open,
  scriptName,
  onExport,
  onOpenChange,
  showNetworkSettings = false,
}: ExportScriptDialogProps) {
  const scripts = useStudioUIStore((store) => store.scripts)

  const formMethods = useForm<ExportScriptDialogData>({
    resolver: zodResolver(ExportScriptDialogSchema),
    defaultValues: {
      scriptName,
      networkMode: 'preset',
      networkPreset: 'No Throttling',
      networkLatency: 0,
      networkDownload: -1,
      networkUpload: -1,
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
    setValue('networkMode', 'preset')
    setValue('networkPreset', 'No Throttling')
    setValue('networkLatency', 0)
    setValue('networkDownload', -1)
    setValue('networkUpload', -1)
  }, [open, scriptName, setValue])

  const onSubmit = (data: ExportScriptDialogData) => {
    const { scriptName: userInput, overwriteFile } = data
    const fileName = getScriptNameWithExtension(userInput)
    const fileExists = Array.from(scripts.keys()).includes(fileName)
    if (fileExists && !overwriteFile && !alwaysOverwriteScript) {
      setValue('overwriteFile', true)
      return
    }

    if (showNetworkSettings) {
      const networkThrottle: NetworkThrottleSelection =
        data.networkMode === 'preset'
          ? { type: 'preset', preset: data.networkPreset }
          : {
              type: 'custom',
              latency: data.networkLatency,
              download: data.networkDownload,
              upload: data.networkUpload,
            }

      onExport(fileName, networkThrottle)
    } else {
      onExport(fileName)
    }
    onOpenChange(false)
  }

  function handleOpenChange(open: boolean) {
    onOpenChange(open)
    if (!open) {
      setValue('overwriteFile', false)
      setValue('networkMode', 'preset')
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
            {showOverwriteWarning ? (
              <OverwriteFileWarning />
            ) : (
              <>
                <ScriptNameForm
                  alwaysOverwriteScript={!!alwaysOverwriteScript}
                  setAlwaysOverwriteScript={setAlwaysOverwriteScript}
                />
                {showNetworkSettings && <NetworkSettingsForm />}
              </>
            )}

            {!showOverwriteWarning && (
              <Flex justify="end" gap="2" mt="2">
                <AlertDialog.Cancel>
                  <Button variant="outline" color="orange">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>

                <Button color="orange" type="submit">
                  Export
                </Button>
              </Flex>
            )}
          </form>
        </FormProvider>
      </AlertDialog.Content>
    </AlertDialog.Root>
  )
}
