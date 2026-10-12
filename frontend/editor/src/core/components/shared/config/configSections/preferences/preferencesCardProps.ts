export type DesktopInstallState =
  | "idle"
  | "downloading"
  | "installing"
  | "ready-to-restart"
  | "error";

export interface DesktopInstallProgress {
  downloaded: number;
  total: number | null;
  percent: number;
}

export interface DesktopInstallActions {
  /**
   * Kick off the Tauri updater download + install. Resolves to `true` on
   * success and `false` on failure — never rejects. Auto-mode callers MUST
   * check the return value before calling [`restartApp`]; restarting on a
   * failed install puts the app in a restart loop because the install state
   * (`hasChecked`) resets on every launch.
   */
  startInstall: () => Promise<boolean>;
  restartApp: () => Promise<void>;
}

/**
 * Passed alongside the install state when the Tauri `can_install_updates`
 * probe has run. When `canInstall` is `false` the UpdateModal shows an
 * inline "admin permissions required" warning and disables the Install Now
 * button so users can't trip themselves into a UAC prompt they can't satisfy.
 */
export interface DesktopInstallCanInstall {
  canInstall: boolean;
  reason: string | null;
}


/**
 * Desktop-only: user-facing update policy control, rendered inside the Software
 * updates card alongside the version info. Passed down from the desktop
 * GeneralSection override so this core component never imports a Tauri API.
 */
export interface DesktopUpdateModeControl {
  /** Current mode. */
  mode: "prompt" | "auto" | "disabled";
  /** `true` when the mode was written by a provisioning file - disables the control. */
  locked: boolean;
  /** Called when the user picks a new mode. Async: surface errors via toast. */
  onChange: (mode: "prompt" | "auto" | "disabled") => Promise<void> | void;
}

/** Desktop-only: Tauri updater install state, passed from the desktop override. */
export interface DesktopInstall {
  state: DesktopInstallState;
  progress: DesktopInstallProgress | null;
  errorMessage: string | null;
  tauriInstallReady: boolean;
  /** Result of the `can_install_updates` probe, used to show an inline warning
   *  when msiexec would need UAC elevation this user doesn't have. */
  canInstall?: DesktopInstallCanInstall | null;
  actions: DesktopInstallActions;
}

/**
 * What the Software updates card needs from the page that owns it. Every other
 * preferences card reads its own context (preferences, theme, app config) and
 * writes straight through, so this is the only card with props.
 */
export interface SoftwareUpdatesCardProps {
  desktopInstall?: DesktopInstall;
  desktopUpdateMode?: DesktopUpdateModeControl;
}
