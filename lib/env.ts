const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const optionalEnv = (name: string): string | undefined => process.env[name];

export const env = {
  authSecret: () => requireEnv('AUTH_SECRET'),
  googleClientId: () => requireEnv('AUTH_GOOGLE_ID'),
  googleClientSecret: () => requireEnv('AUTH_GOOGLE_SECRET'),
  allowedEmails: (): string[] =>
    (optionalEnv('AUTH_ALLOWED_EMAILS') ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  googlePlacesKey: () => requireEnv('GOOGLE_PLACES_API_KEY'),
  trelloApiKey: () => requireEnv('TRELLO_API_KEY'),
  trelloToken: () => requireEnv('TRELLO_TOKEN'),
  trelloBoardId: () => requireEnv('TRELLO_BOARD_ID'),
  trelloListId: () => requireEnv('TRELLO_LIST_ID'),
};
