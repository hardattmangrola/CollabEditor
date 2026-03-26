interface GraphqlError {
  message: string;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: GraphqlError[];
}

export class AppSyncRequestError extends Error {
  status?: number;
  payload?: unknown;

  constructor(message: string, options?: { status?: number; payload?: unknown }) {
    super(message);
    this.name = 'AppSyncRequestError';
    this.status = options?.status;
    this.payload = options?.payload;
  }
}

export async function callAppSync<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string
): Promise<T> {
  const endpoint = process.env.NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT;
  if (!endpoint) {
    throw new Error('Missing NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT');
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: token,
    },
    body: JSON.stringify({ query, variables }),
  });

  const payload = (await response.json()) as GraphqlResponse<T>;

  if (!response.ok) {
    throw new AppSyncRequestError(`AppSync request failed with status ${response.status}`, {
      status: response.status,
      payload,
    });
  }

  if (payload.errors?.length) {
    throw new AppSyncRequestError(payload.errors.map((e) => e.message).join('; '), {
      status: response.status,
      payload,
    });
  }

  if (!payload.data) {
    throw new AppSyncRequestError('AppSync returned no data', {
      status: response.status,
      payload,
    });
  }

  return payload.data;
}

