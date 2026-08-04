import http from "http";
import { OAuth2Client } from "google-auth-library";
import { env } from "../src/shared/config/env";

const REDIRECT_URI = "http://localhost:4000/oauth/callback";

async function main() {
  if (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET) {
    console.error(
      "Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env first.",
    );
    process.exit(1);
  }

  const client = new OAuth2Client({
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    redirectUri: REDIRECT_URI,
  });

  const authUrl = client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
  });

  console.log(
    "\nOpen this URL and authorize with the account that should own the calendar:\n",
  );
  console.log(authUrl + "\n");

  const code = await new Promise<string>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url ?? "", REDIRECT_URI);
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (error) {
        res.end("Authorization failed. You can close this tab.");
        server.close();
        reject(new Error(error));
        return;
      }

      if (code) {
        res.end("Authorization successful. You can close this tab.");
        server.close();
        resolve(code);
      }
    });

    server.listen(4000, () => {
      console.log(
        "Waiting for redirect on http://localhost:4000/oauth/callback ...\n",
      );
    });
  });

  const { tokens } = await client.getToken(code);

  if (!tokens.refresh_token) {
    console.error(
      "No refresh token returned. Revoke prior access at " +
        "https://myaccount.google.com/permissions and re-run this script.",
    );
    process.exit(1);
  }

  console.log("\nAdd this to .env:\n");
  console.log(`GOOGLE_MEET_REFRESH_TOKEN=${tokens.refresh_token}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
