import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/api';
import config from '@/aws-exports';

let configured = false;

function ensureAmplifyConfigured() {
  if (!configured) {
    Amplify.configure(config, { ssr: true });
    configured = true;
  }
}

ensureAmplifyConfigured();

export function getGraphqlClient() {
  ensureAmplifyConfigured();
  return generateClient();
}

