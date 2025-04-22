import fs from "fs";
import path from "path";
import readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => resolve(answer));
  });
}

const fields = [
  { name: "FRONTEND_URL", description: "The url of the frontend" },
  {
    name: "GOOGLE_CLIENT_ID",
    description: "Public ID of the google oauth client",
  },
  {
    name: "GOOGLE_CLIENT_SECRET",
    description: "Private secret of the google oauth client",
  },
  {
    name: "JWT_ACCESS_SECRET",
    description: "Secret string for verifying access JWT's",
  },
  {
    name: "JWT_ACCESS_EXPIRATION",
    description: "Time in hours for the access JWT to expire. (0.5)",
  },
  {
    name: "JWT_REFRESH_SECRET",
    description: "Secret string for verifying refresh JWT's.",
  },
  {
    name: "JWT_REFRESH_EXPIRATION",
    description: "Time in hours for the refresh JWT to expire. (72)",
  },
  {
    name: "NODE_ENV",
    description: "The state of the application. (development / production)",
  },
  {
    name: "DOMAIN",
    description: "The domain of the website. (ex. '.futureDomain.com')",
  },
  {
    name: "GEMINI_API_KEY",
    description: "The API key for Gemini AI.",
  },
];

(async () => {
  const values: string[] = [];

  for (const field of fields) {
    console.log(field.description);
    const answer = await ask(`${field.name} >> `);
    console.log("XXXXXXXXXXXXXXX");
    values.push(answer);
  }

  rl.close();

  const ending = values[values.length - 2] == "development" ? "dev" : "prod";

  const envPath = path.join(__dirname, "../../.env." + ending);
  const envContent = fields
    .map((field, i) => `${field.name}=${values[i]}`)
    .join("\n");

  fs.writeFileSync(envPath, envContent);
  console.log(`✅ .env file created at ${envPath}`);
})();
