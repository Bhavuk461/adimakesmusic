// Switches on online booking: deploys the booking server (worker/) to
// Cloudflare and stores its secrets there — the Razorpay keys and the
// dashboard password. Run it yourself, in a terminal:
//
//   npm run pay:setup       everything (safe to run again)
//   npm run pay:password    just a new dashboard password
//
// Secrets are typed here, hidden, and handed straight to Cloudflare. They are
// never written to a file, so nothing secret can end up in this (public) repo.
import { spawnSync } from "node:child_process";
import { randomInt } from "node:crypto";
import fs from "node:fs";
import readline from "node:readline";

const CONFIG = "--config worker/wrangler.toml";
const WRANGLER = "npx --yes wrangler@4";
const ENV_FILE = ".env.production";
const CURRENT_KEY_ID = "rzp_live_Snb4RTDdgHiGsI";
const passwordOnly = process.argv.includes("--password-only");

const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const step = (s) => console.log(`\n${bold("▸ " + s)}`);
const fail = (s) => {
  console.error(`\n✗ ${s}`);
  process.exit(1);
};

/** Asks a question; `hidden` shows * for each character typed or pasted. */
function ask(question, { hidden = false } = {}) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    let muted = false;
    // readline echoes through this; while muted, echo stars instead
    rl._writeToOutput = (s) => {
      if (!muted) return rl.output.write(s);
      if (s.includes(question)) return rl.output.write(question + "*".repeat(rl.line.length)); // a redraw
      if (/[\r\n]/.test(s)) return rl.output.write("\n");
      rl.output.write("*".repeat(s.length));
    };
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
    muted = hidden;
  });
}

function wrangler(args, { input } = {}) {
  const res = spawnSync(`${WRANGLER} ${args}`, {
    shell: true,
    input,
    stdio: input === undefined ? "inherit" : ["pipe", "inherit", "inherit"],
  });
  return res.status === 0;
}

function putSecret(name, value) {
  if (!wrangler(`secret put ${name} ${CONFIG}`, { input: value })) fail(`Couldn't store ${name} on Cloudflare.`);
}

/** Four groups of five letters and digits, without look-alikes (0/O, 1/l/I). */
function newPassword() {
  const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = () => Array.from({ length: 5 }, () => chars[randomInt(chars.length)]).join("");
  return [group(), group(), group(), group()].join("-");
}

function endpoint() {
  try {
    const m = /^VITE_PAYMENTS_ENDPOINT=(\S+)/m.exec(fs.readFileSync(ENV_FILE, "utf8"));
    return m ? m[1].replace(/\/+$/, "") : "";
  } catch {
    return "";
  }
}

async function dashboardPassword() {
  step("Dashboard password");
  console.log("Opens adimakesmusic.in/dashboard/. Press Enter to get a strong one made for you,");
  console.log("or type your own (12 characters or more).");
  for (;;) {
    const typed = await ask("Password: ", { hidden: true });
    if (!typed) {
      const made = newPassword();
      putSecret("DASHBOARD_PASSWORD", made);
      return made;
    }
    if (typed.length < 12) {
      console.log("That's shorter than 12 characters — try again, or press Enter for a made one.");
      continue;
    }
    if ((await ask("Same again, to be sure: ", { hidden: true })) !== typed) {
      console.log("Those didn't match — once more.");
      continue;
    }
    putSecret("DASHBOARD_PASSWORD", typed);
    return null;
  }
}

async function main() {
  console.log(bold(passwordOnly ? "adimakesmusic — new dashboard password" : "adimakesmusic — switch on online booking"));

  step("Cloudflare");
  const who = spawnSync(`${WRANGLER} whoami`, { shell: true, encoding: "utf8" });
  if (who.error) fail("Couldn't run wrangler. Is Node installed, and are you online?");
  if (who.stdout?.includes("You are logged in")) console.log("✓ signed in");
  else {
    console.log("Opening Cloudflare in your browser — sign in there and allow wrangler.");
    if (!wrangler("login")) fail("Cloudflare login didn't finish.");
  }

  if (!passwordOnly) {
    step("Deploying the booking server");
    if (!wrangler(`deploy ${CONFIG}`)) fail("The deploy didn't work — see the message above.");

    step("Razorpay keys");
    console.log("In Razorpay: Account & Settings → API Keys. (If you regenerate them, use the new pair.)");
    let keyId = "";
    while (!/^rzp_(live|test)_\w+$/.test(keyId)) {
      keyId = (await ask(`Key ID ${dim(`[${CURRENT_KEY_ID}]`)}: `)) || CURRENT_KEY_ID;
      if (!/^rzp_(live|test)_\w+$/.test(keyId)) console.log("A key ID starts with rzp_live_ or rzp_test_.");
    }
    putSecret("RAZORPAY_KEY_ID", keyId);
    let secret = "";
    while (secret.length < 10) secret = await ask("Key secret (hidden as you paste it): ", { hidden: true });
    putSecret("RAZORPAY_KEY_SECRET", secret);
  }

  const made = await dashboardPassword();

  step("Checking");
  const url = endpoint();
  if (url) {
    const health = await fetch(`${url}/`).then((r) => r.json()).catch(() => null);
    if (health?.configured && health?.dashboard) console.log(`✓ ${url} is on — bookings are live.`);
    else console.log(`! ${url} answered ${JSON.stringify(health)} — give it a few seconds and open the dashboard.`);
  } else {
    console.log(`! ${ENV_FILE} has no VITE_PAYMENTS_ENDPOINT yet — put the workers.dev address from the deploy`);
    console.log("  above into it, then run: npm run deploy");
  }

  console.log(`\n${bold("Done.")}`);
  console.log(`Dashboard: https://adimakesmusic.in/dashboard/`);
  if (made) {
    console.log(`Password:  ${bold(made)}`);
    console.log(dim("Save it in your password manager now — it isn't stored anywhere you can read it back."));
  }
  if (!passwordOnly) {
    console.log(`\nOne last thing in Razorpay: Account & Settings → Business website details —`);
    console.log("make sure https://adimakesmusic.in is listed, or live payments from the site are declined.");
  }
}

main().catch((err) => fail(err?.message ?? String(err)));
