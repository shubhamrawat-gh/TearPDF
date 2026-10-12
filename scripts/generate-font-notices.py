"""Extract bundled font copyright/license metadata without changing font binaries.

Requires fonttools and brotli. Full license texts must already be in
frontend/editor/public/licenses/fonts; this script never accesses the network.
"""
from pathlib import Path
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent.parent
resources = root / 'app/core/src/main/resources'
notices = ['TearPDF bundled font notices\nUnmodified font metadata and applicable license texts.\n']
for folder in [resources / 'static/fonts', resources / 'type3/library/fonts']:
    for path in sorted(folder.rglob('*')):
        if path.suffix.lower() not in {'.ttf', '.otf', '.woff', '.woff2'}:
            continue
        with TTFont(path, lazy=True) as font:
            notices.append(f'\n{"="*72}\n{path.relative_to(resources)}\n')
            seen = set()
            for name in font['name'].names:
                if name.nameID in {0, 13, 14}:
                    value = name.toUnicode()
                    if value not in seen:
                        notices.append(value)
                        seen.add(value)
for path in sorted((root / 'frontend/editor/public/licenses/fonts').glob('*.txt')):
    notices.append(f'\n{"="*72}\n{path.name}\n')
    notices.append(path.read_text(encoding='utf-8'))
output = resources / 'static/fonts/LICENSE.txt'
output.write_text('\n'.join(notices), encoding='utf-8')
print(f'Wrote {output.relative_to(root)}')
