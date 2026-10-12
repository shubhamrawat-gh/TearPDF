import { useEffect, useState } from 'react';
import { Alert, Anchor, Loader, Stack, Text, Title } from '@mantine/core';

export default function Licenses() {
  const [texts, setTexts] = useState<string[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    void Promise.all(['original', 'third-party'].map(async name => {
      const response = await fetch(`/licenses/${name}.txt`, { signal: controller.signal });
      if (!response.ok) throw new Error('Cannot load bundled licenses');
      return response.text();
    })).then(setTexts).catch(error => {
      if (!controller.signal.aborted) setError(String(error));
    });
    return () => controller.abort();
  }, []);
  return <Stack gap="lg">
    <Title order={2}>TearPDF licenses</Title>
    <Text>TearPDF is based on Stirling-PDF (https://github.com/Stirling-Tools/Stirling-PDF)</Text>
    <Text>Copyright © 2026 Shubham Rawat. Original copyright notices and license text are preserved below.</Text>
    {error ? <Alert color="red">{error}</Alert> : !texts.length ? <Loader /> : <>
      <pre style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'}}>{texts[0]}</pre>
      <Title order={3}>Bundled third-party licenses</Title>
      <Anchor href="/licenses/third-party.txt" download>Download all dependency notices</Anchor>
      <pre style={{whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: '50vh', overflow: 'auto'}}>{texts[1]}</pre>
    </>}
  </Stack>;
}
