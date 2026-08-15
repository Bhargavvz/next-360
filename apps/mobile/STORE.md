# Publishing Next360

Everything needed to get the app onto the App Store and Google Play. Assets and
config are already in the repo; the steps below are the ones that need your
accounts and credentials.

---

## 1. Before the first build

| What | Where | Why |
|---|---|---|
| EAS project id | `app.json` → `extra.eas.projectId` | Currently `your-eas-project-id`. `eas init` fills it in. |
| Expo account/owner | `app.json` → `owner` | Set to `next360`; change to your Expo org handle. |
| Apple ID + team id + ASC app id | `eas.json` → `submit.production.ios` | Placeholders marked `REPLACE_WITH_…`. |
| Play service account JSON | `apps/mobile/google-play-service-account.json` | Not committed — download from Google Cloud IAM. **Do not commit it.** |
| Production API URL | `eas.json` → build env `EXPO_PUBLIC_API_URL` | Points at `https://api.next360.in`; change to your real host. |

```bash
npm install -g eas-cli
eas login
eas init          # writes the project id into app.json
```

---

## 2. Bundle identifiers

Both stores are set to `com.next360.app`. These are permanent once published —
change them now if you want something different.

- iOS: `app.json` → `ios.bundleIdentifier`
- Android: `app.json` → `android.package`

---

## 3. Versioning

`eas.json` uses `appVersionSource: "remote"` with `autoIncrement` on the
production profile, so EAS owns the build number and you never bump it by hand.

Bump the **user-facing** version in `app.json` → `version` (e.g. `1.0.0` →
`1.1.0`) when you ship a release. `runtimeVersion` follows `appVersion`, which
means an OTA update can only reach builds of the same version — a native change
correctly requires a new binary.

---

## 4. Building

```bash
# Internal testing (installable APK / simulator build)
eas build --profile preview --platform all

# Store binaries
eas build --profile production --platform all
```

---

## 5. Submitting

```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

Android is configured to land on the **internal** track as a **draft** so
nothing goes live by accident. Promote it in the Play Console when ready.

---

## 6. Store listing copy

### App name
`Next360 — Verified Organic`  *(30 char limit on both stores)*

### Subtitle / short description
- **iOS subtitle (30):** `Organic you can actually check`
- **Play short (80):** `Shop organic food where every certificate is verified by a human, not a claim.`

### Full description

```
Anyone can print "organic" on a label. Next360 is the marketplace where the
claim comes with proof.

Every product listed as organic carries an NPOP certificate that our
verification team has read line by line — the certificate number, the issuing
body, the scope and the expiry, all checked against the actual listing. If it
doesn't hold up, it doesn't get the badge.

WHAT MAKES NEXT360 DIFFERENT

• Verified organic, not self-declared
  Products carrying the gold NPOP seal have a certificate on file that a person
  has checked. Products that are merely "natural" or "eco-friendly" are labelled
  exactly that — we never blur the line.

• Read the certificate yourself
  Scan the QR code on a pack, or open any verified product, to see the
  certificate number, issuing body and validity. You are not asked to take our
  word for it.

• KYC-verified sellers only
  Every seller completes business verification before they can list. No
  anonymous vendors.

• Straight from the producer
  Orders ship directly from the farm or producer. No repacking, no relabelling
  in between.

• Reviews from real buyers
  Only customers with a delivered order can review a product.

SHOP
Cold-pressed oils, raw honey, millets and grains, spices, pulses, dairy, fresh
produce, personal care and more — from certified producers across India.

PAY YOUR WAY
UPI, cards, netbanking and wallets through Razorpay, or cash on delivery.

Next360 — Know exactly what you're eating.
```

### Keywords (iOS, 100 chars)
`organic,npop,certified,farm,honey,millet,cold pressed,natural,groceries,india`

### Category
- Primary: **Shopping**
- Secondary: **Food & Drink**

### Content rating
- Play: **Everyone**
- iOS: **4+**

---

## 7. Data safety / privacy declarations

Both stores ask what you collect. Based on what the app actually does:

| Data | Collected | Purpose | Linked to user |
|---|---|---|---|
| Phone number | Yes | Account creation, OTP sign-in | Yes |
| Name, email | Yes (optional) | Order communication | Yes |
| Delivery address | Yes | Order fulfilment | Yes |
| Purchase history | Yes | Order management | Yes |
| Payment info | **No** | Handled entirely by Razorpay; the app never sees card details | — |
| Location | **No** | — | — |
| Contacts, photos, audio | **No** | — | — |

- Data is encrypted in transit (HTTPS enforced; cleartext disabled on Android).
- Users can request deletion — the in-app **Data & privacy** screen is the entry point.
- Privacy policy URL: `https://next360.in/privacy` — this must be live before submission.

An iOS privacy manifest is already declared in `app.json` covering UserDefaults
and file-timestamp API use.

---

## 8. Screenshots

Required sizes:

| Store | Device | Size |
|---|---|---|
| iOS | 6.9" (iPhone 16 Pro Max) | 1320 × 2868 |
| iOS | 6.5" (iPhone 11 Pro Max) | 1242 × 2688 |
| iOS | 13" iPad Pro *(only if you keep `supportsTablet`)* | 2064 × 2752 |
| Play | Phone | 1080 × 1920 min, up to 8 |
| Play | Feature graphic | 1024 × 500 |

Generate framed screenshots from a running simulator/emulator:

```bash
python3 scripts/make-screenshots.py --input ./raw-captures --out ./store-screenshots
```

Suggested sequence and captions:
1. **Home** — "Every organic claim, checked by a human"
2. **Product detail with the gold seal** — "See the certificate before you buy"
3. **Certificate page** — "Scan the pack. Check our work."
4. **Discover with the verified filter on** — "Filter to certified only"
5. **Cart / checkout** — "UPI, cards, or cash on delivery"

---

## 9. Pre-submission checklist

- [ ] `eas init` run, project id in `app.json`
- [ ] Apple and Play credentials filled into `eas.json`
- [ ] `EXPO_PUBLIC_API_URL` points at production
- [ ] Privacy policy and terms URLs are live
- [ ] Production API is reachable over HTTPS (Android blocks cleartext)
- [ ] Razorpay switched from test keys to live keys **on the server**
- [ ] Razorpay webhook configured against the production API
- [ ] Test the full flow on a physical device: sign in → browse → cart → pay → order
- [ ] Confirm dark mode on both platforms
- [ ] Confirm the app behaves sensibly with no network
