import { BaseParameters } from "@app/types/parameters";
import {
  useBaseParameters,
  BaseParametersHook,
} from "@app/hooks/tools/shared/useBaseParameters";

// Fallback presets used only when AppConfig hasn't loaded yet.
// The real presets are served by the backend via /api/v1/config/app-config
// (field: timestampTsaPresets) — single source of truth.
export const FALLBACK_TSA_PRESETS: {label:string;url:string}[] = [];

export interface TimestampPdfParameters extends BaseParameters {
  tsaUrl: string;
}

export const defaultParameters: TimestampPdfParameters = {
  tsaUrl: "",
};

export type TimestampPdfParametersHook =
  BaseParametersHook<TimestampPdfParameters>;

/** Whether these parameters are complete enough to run. Shared by the tool's settings
 * hook and its operationConfig, so the editor and the pipeline builder agree. */
export function validateTimestampPdfParameters(
  params: TimestampPdfParameters,
): boolean {
  return params.tsaUrl.trim().length > 0;
}

export const useTimestampPdfParameters = (): TimestampPdfParametersHook => {
  return useBaseParameters({
    defaultParameters: {...defaultParameters,tsaUrl:localStorage.getItem('tearpdf.timestampServer')||''},
    endpointName: "timestamp-pdf",
    validateFn: validateTimestampPdfParameters,
  });
};
