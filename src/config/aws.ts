// AWS & Cognito OIDC configuration

export const cognitoOidcConfig = {
  authority: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY!,
  client_id: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!,
  redirect_uri: process.env.NEXT_PUBLIC_COGNITO_REDIRECT_URI || 'http://localhost:3000',
  response_type: 'code',
  scope: 'phone openid email',
};

export const awsConfig = {
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'ap-south-1',
  appsync: {
    endpoint: process.env.NEXT_PUBLIC_APPSYNC_GRAPHQL_ENDPOINT || 'http://localhost:3000/api',
  },
  cognito: {
    domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN || '',
    clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  },
  dynamodb: {
    documentsTable: 'Documents',
    sessionsTable: 'Sessions',
    usersTable: 'Users',
  },
};
