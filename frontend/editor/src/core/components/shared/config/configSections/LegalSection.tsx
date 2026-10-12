import { Stack, Text, Anchor } from '@mantine/core';
export default function LegalSection() {
 return <Stack><Text>TearPDF runs locally for one user. Documents and preferences stay on this machine. No analytics or update checks are enabled.</Text><Text>Timestamping contacts a server only when you configure one and run the timestamp tool.</Text><Anchor href="/settings/licenses">Licenses and copyright notices</Anchor></Stack>;
}
