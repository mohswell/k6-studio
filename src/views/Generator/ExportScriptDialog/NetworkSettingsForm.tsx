import { Flex, Select, TextField } from '@radix-ui/themes'
import { Controller, useFormContext } from 'react-hook-form'

import { FieldGroup } from '@/components/Form'
import {
  ExportScriptDialogData,
  NetworkPreset,
  NetworkThrottleMode,
} from '@/schemas/exportScript'

type NetworkSettingsFormProps = {
  disabled?: boolean
}

export function NetworkSettingsForm({ disabled }: NetworkSettingsFormProps) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext<ExportScriptDialogData>()
  const mode = watch('networkMode')

  const MODE_OPTIONS: readonly NetworkThrottleMode[] = ['preset', 'custom']
  const PRESET_OPTIONS: readonly NetworkPreset[] = [
    'No Throttling',
    'Fast 3G',
    'Slow 3G',
  ]

  return (
    <Flex direction="column" gap="1">
      <FieldGroup
        name="networkMode"
        label="Network throttling"
        errors={errors}
        hint="Choose a preset profile or configure custom throttling."
        hintType="text"
      >
        <Controller
          control={control}
          name="networkMode"
          render={({ field }) => (
            <Select.Root
              value={field.value}
              onValueChange={field.onChange}
              disabled={disabled}
            >
              <Select.Trigger
                placeholder="Select network throttling mode"
                style={{ width: '100%' }}
              />
              <Select.Content>
                {MODE_OPTIONS.map((opt) => (
                  <Select.Item key={opt} value={opt}>
                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          )}
        />
      </FieldGroup>

      {mode === 'preset' && (
        <FieldGroup
          name="networkPreset"
          label="Preset"
          errors={errors}
          hint="Use specified network profiles from browser module."
          hintType="text"
        >
          <Controller
            control={control}
            name="networkPreset"
            render={({ field }) => (
              <Select.Root
                value={field.value}
                onValueChange={field.onChange}
                disabled={disabled}
              >
                <Select.Trigger
                  placeholder="Select preset"
                  style={{ width: '100%' }}
                />
                <Select.Content>
                  {PRESET_OPTIONS.map((preset) => (
                    <Select.Item key={preset} value={preset}>
                      {preset}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            )}
          />
        </FieldGroup>
      )}

      {mode === 'custom' && (
        <>
          <FieldGroup
            name="networkLatency"
            label="Latency (ms)"
            errors={errors}
            hint="Latency is in milliseconds."
            hintType="text"
          >
            <TextField.Root
              type="number"
              step="1"
              min="0"
              disabled={disabled}
              {...register('networkLatency', { valueAsNumber: true })}
            />
          </FieldGroup>

          <FieldGroup
            name="networkDownload"
            label="Download (bytes/sec)"
            errors={errors}
            hint="Use -1 to disable throttling for download."
            hintType="text"
          >
            <TextField.Root
              type="number"
              step="1"
              min="-1"
              disabled={disabled}
              {...register('networkDownload', { valueAsNumber: true })}
            />
          </FieldGroup>

          <FieldGroup
            name="networkUpload"
            label="Upload (bytes/sec)"
            errors={errors}
            hint="Use -1 to disable throttling for upload."
            hintType="text"
          >
            <TextField.Root
              type="number"
              step="1"
              min="-1"
              disabled={disabled}
              {...register('networkUpload', { valueAsNumber: true })}
            />
          </FieldGroup>
        </>
      )}
    </Flex>
  )
}
