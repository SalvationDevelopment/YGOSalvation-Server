import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";
import { promisify } from "node:util";
import mongoose from "mongoose";

const scrypt = promisify(crypto.scrypt);
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const FIXED_DUMMY_USER = Object.freeze({
  username: "dummy_test",
  email: "dummy_test@ygo.local",
  role: "user",
  points: 250,
  elo: 1200,
  service: false
});

const ROOT_DIR = path.resolve(process.cwd());
const ENV_FILES = [
  path.join(ROOT_DIR, "configuration", ".env.local"),
  path.join(ROOT_DIR, "configuration", ".env"),
  path.join(ROOT_DIR, "..", "configuration", ".env.local"),
  path.join(ROOT_DIR, "..", "configuration", ".env")
];

function loadEnvFile() {
  for (const envFile of ENV_FILES) {
    if (!fs.existsSync(envFile)) {
      continue;
    }

    const text = fs.readFileSync(envFile, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) {
        continue;
      }

      const equalIndex = line.indexOf("=");
      if (equalIndex <= 0) {
        continue;
      }

      const key = line.slice(0, equalIndex).trim();
      const value = line.slice(equalIndex + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  }
}

function getCountArg() {
  const arg = process.argv.find((value) => value.startsWith("--count="));
  if (!arg) {
    return 20;
  }

  const count = Number(arg.split("=")[1]);
  if (!Number.isInteger(count) || count <= 0) {
    throw new Error("Invalid --count value. Use a positive integer.");
  }

  return count;
}

async function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = await scrypt(plainPassword, salt, KEY_LENGTH);
  return `scrypt$${salt.toString("hex")}$${Buffer.from(derivedKey).toString("hex")}`;
}

async function main() {
  loadEnvFile();
  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("Missing MONGODB_URI. Set it in configuration/.env.local or environment.");
  }

  const count = getCountArg();
  const now = Date.now();
  const defaultPassword = "DummyUser123!";
  const passwordHash = await hashPassword(defaultPassword);

  await mongoose.connect(mongodbUri, {
    autoIndex: true,
    serverSelectionTimeoutMS: 5000
  });

  const userSchema = new mongoose.Schema(
    {
      username: String,
      email: String,
      passwordHash: String,
      role: String,
      points: Number,
      elo: Number,
      service: Boolean
    },
    { collection: "users", strict: false }
  );

  const User = mongoose.models.SeedUser || mongoose.model("SeedUser", userSchema);

  await User.updateOne(
    { username: FIXED_DUMMY_USER.username },
    {
      $set: {
        ...FIXED_DUMMY_USER,
        passwordHash
      }
    },
    { upsert: true }
  );

  const docs = Array.from({ length: count }, (_, index) => {
    const number = index + 1;
    const suffix = `${now}_${number}`;
    const points = Math.floor(Math.random() * 600);
    const elo = 1000 + Math.floor(Math.random() * 800);
    return {
      username: `dummy_${suffix}`,
      email: `dummy_${suffix}@ygo.local`,
      passwordHash,
      role: "user",
      points,
      elo,
      service: false
    };
  });

  const inserted = await User.insertMany(docs, { ordered: false });
  await mongoose.disconnect();

  console.log(
    `Created ${inserted.length} rotating dummy users plus fixed user ${FIXED_DUMMY_USER.username}. Password: ${defaultPassword}`
  );
}

main().catch(async (error) => {
  console.error(error.message);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
