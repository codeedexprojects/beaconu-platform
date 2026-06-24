import http from "node:http";
import { OAuth2Client } from "google-auth-library";

const PORT = 53682;
const REDIRECT_URI = `http://localhost:${PORT}`;

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("Missing GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in env.");
  process.exit(1);
}

const oauth2Client = new OAuth2Client({
  clientId,
  clientSecret,
  redirectUri: REDIRECT_URI,
});

const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/calendar"],
});

console.log("\n=== Add this exact redirect URI to your OAuth client first ===");
console.log(REDIRECT_URI);
console.log("\n(Google Cloud Console -> APIs & Services -> Credentials -> your OAuth client -> Authorized redirect URIs -> Add URI -> Save)\n");
console.log("=== Then open this URL in your browser and sign in / grant access ===\n");
console.log(authUrl);
console.log("\nWaiting for you to complete the consent flow...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end(`Error: ${error}. You can close this tab.`);
    console.error("OAuth error:", error);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.end("No code received. You can close this tab.");
    return;
  }

  res.end("Success! You can close this tab and return to the terminal.");

  try {
    const { tokens } = await oauth2Client.getToken(code);
    console.log("\n=== TOKENS RECEIVED ===");
    console.log("refresh_token:", tokens.refresh_token);
    console.log("access_token:", tokens.access_token ? "(received, not needed)" : "(none)");
    if (!tokens.refresh_token) {
      console.log(
        "\nNo refresh_token returned. This happens if you've already authorized this app before without revoking access. " +
          "Go to https://myaccount.google.com/permissions, remove access for this app, then re-run this script.",
      );
    } else {
      console.log("\nCopy the refresh_token above into GOOGLE_MEET_REFRESH_TOKEN in your .env file.");
    }
  } catch (err) {
    console.error("\nFailed to exchange code for tokens:", err.message);
    if (err.response?.data) console.error(JSON.stringify(err.response.data, null, 2));
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT);
