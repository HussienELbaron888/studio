
import 'dotenv/config';

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage);
  }
  return v;
}

export const brevoApiKey = assertValue(
  process.env.BREVO_API_KEY,
  'BREVO_API_KEY is not set in the environment variables. Please ensure it is in your .env file and restart the server.'
);
