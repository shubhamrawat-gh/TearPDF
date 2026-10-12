import { useNavigate } from 'react-router-dom';
import { RailButton } from './QuickNavRailBase';
import { Icon } from '@app/ui/Icon';
import { useQuickNavHost } from '@app/contexts/QuickNavHostContext';

export function QuickNavRailFooterExtensions() {
  const navigate = useNavigate();
  const host = useQuickNavHost();
  const go = (path: string) => {
    const guard = host?.actions.current?.requestNavigation;
    if (guard) guard(() => navigate(path));
    else navigate(path);
  };
  return <>
    <RailButton label="Local library and automation" icon={<Icon name="database" />} onClick={() => go('/local-workspace')} />
    <RailButton label="Licenses" icon={<Icon name="file-text" />} onClick={() => go('/settings/licenses')} />
  </>;
}
