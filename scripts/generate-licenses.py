"""Generate the bundled notice from installed npm packages and resolved Java archives."""
import json
from pathlib import Path
import re
import zipfile

root = Path(__file__).resolve().parent.parent
notices = ["TearPDF bundled dependency notices\nGenerated from installed dependency metadata.\n"]
lock = json.loads((root / "frontend/package-lock.json").read_text(encoding="utf-8"))
for relative, entry in lock["packages"].items():
    if not relative or entry.get("dev"):
        continue
    folder = root / "frontend" / relative
    package = folder / "package.json"
    if not package.exists():
        continue
    metadata = json.loads(package.read_text(encoding="utf-8"))
    notices.append(f"\n{'='*72}\n{metadata.get('name')} {metadata.get('version')}\nLicense: {metadata.get('license', entry.get('license','See package notices'))}\n")
    for file in sorted(folder.iterdir()):
        if file.is_file() and re.match(r"^(license|licence|notice|copying)(\.|$)", file.name, re.I):
            notices.append(file.read_text(encoding="utf-8", errors="replace"))

manifest = root / "build/runtime-dependencies.json"
if manifest.exists():
    for artifact in json.loads(manifest.read_text(encoding="utf-8")):
        notices.append(f"\n{'='*72}\n{artifact['coordinate']}\n")
        path = Path(artifact['file'])
        if path.suffix == '.jar':
            with zipfile.ZipFile(path) as archive:
                for name in archive.namelist():
                    if re.search(r"(^|/)(license|licence|notice|copying)(\.[^/]+)?$", name, re.I):
                        notices.append(archive.read(name).decode('utf-8',errors='replace'))
        for pom in path.parent.parent.glob('**/*.pom'):
            text = pom.read_text(encoding='utf-8',errors='replace')
            match = re.search(r'<licenses>([\s\S]*?)</licenses>', text)
            if match:
                notices.append(match.group(0))
                break
for folder in [root / 'app/core/src/main/resources/static/fonts', root / 'app/core/src/main/resources/type3/library/fonts']:
    for file in sorted(folder.rglob('*')):
        if file.is_file() and re.match(r'^(license|licence|notice|copying|ofl)(\.|$)', file.name, re.I):
            notices.append(f"\n{'='*72}\nBundled font notice: {file.relative_to(root)}\n")
            notices.append(file.read_text(encoding='utf-8', errors='replace'))
output = root / 'frontend/editor/public/licenses/third-party.txt'
output.parent.mkdir(parents=True,exist_ok=True)
output.write_text('\n'.join(notices),encoding='utf-8')
print(f'Wrote {output.relative_to(root)} ({output.stat().st_size:,} bytes)')
