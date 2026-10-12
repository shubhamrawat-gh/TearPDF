import { Stack, Divider } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { RedactParameters } from "@app/hooks/tools/redact/useRedactParameters";
import RedactModeSelector from "@app/components/tools/redact/RedactModeSelector";
import WordsToRedactInput from "@app/components/tools/redact/WordsToRedactInput";
import RedactAdvancedSettings from "@app/components/tools/redact/RedactAdvancedSettings";

interface RedactSingleStepSettingsProps {
  parameters: RedactParameters;
  onParameterChange: <K extends keyof RedactParameters>(
    key: K,
    value: RedactParameters[K],
  ) => void;
  disabled?: boolean;
}

const RedactSingleStepSettings = ({
  parameters,
  onParameterChange,
  disabled = false,
}: RedactSingleStepSettingsProps) => {
  const { t } = useTranslation();
  return (
    <Stack gap="md">
      {/* Mode Selection */}
      <RedactModeSelector
        mode={parameters.mode}
        onModeChange={(mode) => onParameterChange("mode", mode)}
        disabled={disabled}
      />

      {/* Automatic Mode Settings */}
      {parameters.mode === "automatic" && (
        <>
          <Divider />

          <select aria-label="Regex redaction preset" disabled={disabled} defaultValue="" onChange={e=>{if(e.target.value){onParameterChange('useRegex',true);onParameterChange('wordsToRedact',[...parameters.wordsToRedact,e.target.value]);}}}>
            <option value="">Add regex preset…</option>
            <option value={String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`}>Email addresses</option>
            <option value={String.raw`\+?\d[\d ()-]{7,}\d`}>Phone numbers</option>
            <option value={String.raw`\b\d{3}-\d{2}-\d{4}\b`}>ID numbers (123-45-6789)</option>
          </select>
          <WordsToRedactInput
            wordsToRedact={parameters.wordsToRedact}
            onWordsChange={(words) => onParameterChange("wordsToRedact", words)}
            disabled={disabled}
          />

          <Divider />

          {/* Advanced Settings */}
          <RedactAdvancedSettings
            parameters={parameters}
            onParameterChange={onParameterChange}
            disabled={disabled}
          />
        </>
      )}

      {/* Manual Mode Placeholder */}
      {parameters.mode === "manual" && (
        <>
          <Divider />
          <Stack gap="md">
            <div
              style={{
                padding: "20px",
                textAlign: "center",
                color: "var(--c-text-muted)",
              }}
            >
              {t(
                "redact.manual.notImplemented",
                "Manual redaction interface will be available here when implemented.",
              )}
            </div>
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default RedactSingleStepSettings;
