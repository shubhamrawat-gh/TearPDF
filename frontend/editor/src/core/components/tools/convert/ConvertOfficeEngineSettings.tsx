import { Switch } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAppConfig } from "@app/contexts/AppConfigContext";
import { ConvertParameters } from "@app/hooks/tools/convert/useConvertParameters";

interface ConvertOfficeEngineSettingsProps {
  parameters: ConvertParameters;
  onParameterChange: <K extends keyof ConvertParameters>(
    key: K,
    value: ConvertParameters[K],
  ) => void;
  disabled?: boolean;
}

/** Picks TearPDF Office Convert or LibreOffice for this conversion; starts from the server setting. */
const ConvertOfficeEngineSettings = ({
  parameters,
  onParameterChange,
  disabled = false,
}: ConvertOfficeEngineSettingsProps) => {
  const { t } = useTranslation();
  const { config } = useAppConfig();
  const checked =
    parameters.useTearPDFOfficeConvert ??
    config?.tearpdfOfficeConversion ??
    false;

  return (
    <Switch
      data-testid="tearpdf-office-convert-switch"
      label={t(
        "convert.tearpdfOfficeConvert",
        "Use TearPDF Office Convert (beta)",
      )}
      description={t(
        "convert.tearpdfOfficeConvertDescription",
        "Better, faster conversions with less memory. Turn off to use the standard converter.",
      )}
      checked={checked}
      onChange={(event) =>
        onParameterChange(
          "useTearPDFOfficeConvert",
          event.currentTarget.checked,
        )
      }
      disabled={disabled}
    />
  );
};

export default ConvertOfficeEngineSettings;
