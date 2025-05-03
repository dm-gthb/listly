import { env } from 'cloudflare:workers';
import { Honeypot, SpamError } from 'remix-utils/honeypot/server';

export const honeypot = new Honeypot({
  randomizeNameFieldName: false,
  nameFieldName: "name__confirm",
  validFromFieldName: "from__confirm",
  encryptionSeed: env.HONEYPOT_SECRET,
});

export async function validateHoneypot(formData: FormData) {
  try {
    await honeypot.check(formData);
  } catch (error) {
    if (error instanceof SpamError) {
      throw new Response('Form not submitted properly', { status: 400 });
    }
    throw error;
  }
}
