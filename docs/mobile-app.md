# SwasthyaAI — Flutter Mobile App Specification

## Overview

Flutter (Dart) cross-platform mobile app for Android and iOS. Primary audience: rural and semi-urban users in India with varying literacy levels. The app is one of five channels alongside WhatsApp, SMS, Voice, and Web.

**Key design principles:**
- Voice-first: every input screen has a mic button
- Low-bandwidth friendly: cache aggressively, compress all uploads
- Multilingual: full UI in English, Hindi, Kannada, Telugu
- Medical safety: every AI response shows a disclaimer; emergency symptoms show a red emergency banner

**What the mobile app does directly (no backend):**
- All AI responses (chatbot, symptom checker, quiz analysis) → **OpenAI API** called directly from the app
- Nearby hospitals discovery + map → **Google Maps SDK + Google Places API** called directly from the app

**What the mobile app delegates to the backend:**
- Auth (phone OTP / anonymous session)
- User profile management
- Vaccination records and schedule
- Health alerts and news
- Image analysis (Amazon Rekognition via backend)
- Voice transcription (Amazon Transcribe via backend)

---

## Tech Stack

| Category | Package | Notes |
|----------|---------|-------|
| Framework | Flutter (stable channel) | Dart |
| Navigation | `go_router: ^14` | Declarative URL-based routing |
| State | `flutter_riverpod: ^2` + `riverpod_annotation` | Code-gen providers |
| HTTP | `dio: ^5` | Interceptors for auth + logging |
| Secure storage | `flutter_secure_storage: ^9` | JWT token, OpenAI key |
| Preferences | `shared_preferences: ^2` | Language pref, region, non-sensitive |
| Maps | `google_maps_flutter: ^2` | Map widget |
| Location | `geolocator: ^12` | Device GPS |
| Places | `flutter_google_places_sdk: ^0.13` | Hospital search autocomplete |
| Audio recording | `record: ^5` | mic → m4a/aac |
| Audio playback | `just_audio: ^0.9` | TTS mp3 playback |
| Image picker | `image_picker: ^1` | Camera + gallery |
| Image compress | `flutter_image_compress: ^2` | Resize to 1024px, quality 0.8 |
| Push notifications | `firebase_messaging: ^15` + `flutter_local_notifications: ^17` | FCM |
| URL launcher | `url_launcher: ^6` | Phone dialer, open Maps app |
| Fonts | `google_fonts: ^6` | Noto Sans (Indian scripts) |
| Date formatting | `intl: ^0.19` | |
| Image caching | `cached_network_image: ^3` | |
| Lottie animations | `lottie: ^3` | Voice recording pulse animation |

---

## Environment Configuration

Create `lib/config/env.dart`. Values are set at build time via `--dart-define`.

```dart
class Env {
  static const apiBaseUrl   = String.fromEnvironment('API_BASE_URL',   defaultValue: 'http://10.0.2.2:3000/v1');
  static const openAiKey    = String.fromEnvironment('OPENAI_API_KEY',  defaultValue: '');
  static const googleMapsKey= String.fromEnvironment('GOOGLE_MAPS_KEY', defaultValue: '');
  static const openAiModel  = String.fromEnvironment('OPENAI_MODEL',    defaultValue: 'gpt-4o-mini');
}
```

**Run locally:**
```bash
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000/v1 \
  --dart-define=OPENAI_API_KEY=sk-... \
  --dart-define=GOOGLE_MAPS_KEY=AIza...
```

Add the Google Maps key to `android/app/src/main/AndroidManifest.xml` (meta-data tag) and `ios/Runner/AppDelegate.swift` as well.

---

## Project Structure

```
lib/
├── main.dart
├── config/
│   ├── env.dart                  # --dart-define constants
│   ├── theme.dart                # app-wide ThemeData, colors, text styles
│   └── router.dart               # go_router route definitions
├── l10n/
│   ├── strings.dart              # i18n key-value map for en/hi/kn/te
│   └── l10n_provider.dart        # currentLanguage Riverpod provider
├── core/
│   ├── api/
│   │   ├── dio_client.dart       # Dio singleton with auth interceptor
│   │   ├── auth_api.dart
│   │   ├── users_api.dart
│   │   ├── vaccination_api.dart
│   │   ├── alerts_api.dart
│   │   ├── news_api.dart
│   │   ├── image_api.dart
│   │   └── voice_api.dart
│   ├── openai/
│   │   └── openai_client.dart    # OpenAI chat completions (health AI)
│   ├── models/
│   │   ├── user.dart
│   │   ├── session.dart
│   │   ├── vaccination.dart
│   │   ├── alert.dart
│   │   ├── news_article.dart
│   │   ├── facility.dart
│   │   └── chat_message.dart
│   └── providers/
│       ├── auth_provider.dart    # session token, userId
│       ├── user_provider.dart    # current user profile
│       ├── chat_provider.dart    # conversation history (in-memory)
│       └── vaccination_provider.dart
├── features/
│   ├── onboarding/
│   │   ├── welcome_screen.dart
│   │   ├── language_select_screen.dart
│   │   └── phone_input_screen.dart
│   ├── home/
│   │   └── home_screen.dart
│   ├── chat/
│   │   ├── chat_screen.dart
│   │   └── voice_input_screen.dart
│   ├── symptom_checker/
│   │   └── symptom_checker_screen.dart
│   ├── vaccination/
│   │   ├── vaccination_screen.dart
│   │   └── add_vaccination_screen.dart
│   ├── alerts/
│   │   └── alerts_screen.dart
│   ├── education/
│   │   ├── education_screen.dart
│   │   └── topic_detail_screen.dart
│   ├── quiz/
│   │   └── quiz_screen.dart
│   ├── hospitals/
│   │   └── hospitals_screen.dart
│   └── profile/
│       └── profile_screen.dart
└── widgets/
    ├── mic_button.dart
    ├── chat_bubble.dart
    ├── disclaimer_banner.dart
    ├── emergency_banner.dart
    ├── alert_card.dart
    ├── vaccination_card.dart
    ├── facility_card.dart
    ├── language_picker_sheet.dart
    └── loading_overlay.dart
```

---

## Navigation

Uses `go_router`. Shell route wraps the bottom nav. Onboarding stack shown when no session token exists.

```
/                          → redirect to /home (if authed) or /onboarding/welcome
/onboarding/welcome        → WelcomeScreen
/onboarding/language       → LanguageSelectScreen
/onboarding/phone          → PhoneInputScreen
/home                      → HomeScreen              [bottom nav tab 0]
/chat                      → ChatScreen              [bottom nav tab 1]
/chat/voice                → VoiceInputScreen        [pushed from ChatScreen]
/symptom-checker           → SymptomCheckerScreen    [from HomeScreen tile]
/vaccination               → VaccinationScreen       [bottom nav tab 2]
/vaccination/add           → AddVaccinationScreen
/education                 → EducationScreen         [bottom nav tab 3]
/education/:topicId        → TopicDetailScreen
/education/quiz            → QuizScreen
/hospitals                 → HospitalsScreen         [from HomeScreen tile]
/alerts                    → AlertsScreen            [from HomeScreen banner]
/profile                   → ProfileScreen           [header icon from HomeScreen]
```

**Bottom navigation tabs (4 items — matching PDF mockup):**

| Index | Label | Icon | Route |
|-------|-------|------|-------|
| 0 | Chatbot | `chat_bubble` | `/chat` |
| 1 | Vaccination | `vaccines` | `/vaccination` |
| 2 | Education | `menu_book` | `/education` |
| 3 | Hospitals | `local_hospital` | `/hospitals` |

The `/home` screen is the initial route shown via a splash/home overlay or as the shell's default body before the user selects a tab. A floating "Talk to AI" button on the home screen navigates to `/chat/voice`.

---

## Auth & Session Flow

1. App starts → `AuthProvider` checks `flutter_secure_storage` for `session_token`.
2. No token → redirect to `/onboarding/welcome`.
3. `LanguageSelectScreen` completes → store `preferredLanguage` in `shared_preferences`.
4. `PhoneInputScreen`:
   - "Continue" → `POST /v1/auth/session` with phone number → store JWT in secure storage.
   - "Skip" → `POST /v1/auth/session` with no identifier → store anonymous JWT.
5. All API calls attach `Authorization: Bearer <token>` via Dio interceptor.
6. `401` response → clear token → redirect to `/onboarding/welcome`.

---

## OpenAI Integration

All AI features call OpenAI's Chat Completions API directly from the app.

**File:** `lib/core/openai/openai_client.dart`

```dart
class OpenAIClient {
  static const _endpoint = 'https://api.openai.com/v1/chat/completions';

  final Dio _dio = Dio(BaseOptions(
    baseUrl: 'https://api.openai.com',
    headers: {
      'Authorization': 'Bearer ${Env.openAiKey}',
      'Content-Type': 'application/json',
    },
  ));

  Future<String> healthChat({
    required String userMessage,
    required String language,
    List<Map<String, String>> history = const [],
  }) async {
    final messages = [
      {'role': 'system', 'content': _systemPrompt(language)},
      ...history,
      {'role': 'user', 'content': userMessage},
    ];

    final res = await _dio.post('/v1/chat/completions', data: {
      'model': Env.openAiModel,
      'messages': messages,
      'max_tokens': 600,
      'temperature': 0.2,
    });

    return res.data['choices'][0]['message']['content'] as String;
  }

  String _systemPrompt(String language) => '''
You are SwasthyaAI, a public health education assistant for rural India.
Respond in $language.
Rules:
- Provide ONLY preventive healthcare education and general health information.
- NEVER diagnose any condition.
- NEVER prescribe medications.
- If asked for a diagnosis, say you cannot provide one and recommend seeing a doctor.
- If emergency symptoms are described (chest pain, difficulty breathing, loss of consciousness,
  severe bleeding, signs of stroke), immediately say:
  "EMERGENCY: Please call 108 or go to the nearest hospital immediately." and nothing else.
- Always end your response with: "⚠️ This is health education only — not a substitute for
  professional medical advice. Please consult a qualified doctor for personal health concerns."
- Keep responses concise (under 200 words) and use simple language.
- Source information from WHO and MoHFW guidelines only.
''';
}
```

**Helper — detect emergency in response:**
```dart
bool isEmergencyResponse(String response) {
  return response.toUpperCase().contains('EMERGENCY:') ||
         response.toUpperCase().contains('CALL 108');
}
```

---

## Google Maps Integration

**File:** `lib/features/hospitals/hospitals_screen.dart`

Uses `google_maps_flutter` for the map widget and `geolocator` + Google Places HTTP API for finding nearby hospitals.

**Setup:**
1. Add API key to `AndroidManifest.xml`:
   ```xml
   <meta-data android:name="com.google.android.geo.API_KEY"
              android:value="YOUR_GOOGLE_MAPS_KEY"/>
   ```
2. Add to `ios/Runner/AppDelegate.swift`:
   ```swift
   GMSServices.provideAPIKey("YOUR_GOOGLE_MAPS_KEY")
   ```

**Finding nearby hospitals:**
```dart
// Direct HTTP call to Google Places Nearby Search
Future<List<PlaceResult>> findNearbyHospitals(LatLng location) async {
  final url = Uri.parse(
    'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
    '?location=${location.latitude},${location.longitude}'
    '&radius=5000'
    '&type=hospital'
    '&key=${Env.googleMapsKey}'
  );
  final res = await http.get(url);
  final json = jsonDecode(res.body);
  return (json['results'] as List).map(PlaceResult.fromJson).toList();
}
```

Markers are placed at each hospital. Tapping a marker opens a bottom sheet with name, address, rating, and an "Open in Maps" button (`url_launcher` to Google Maps / Apple Maps).

---

## Screens

---

### Onboarding

#### `WelcomeScreen` (`/onboarding/welcome`)

Full-screen. Shows SwasthyaAI logo (health cross + leaf), app name, tagline: "Your Health, Your Language". Large "Get Started" button → navigates to `/onboarding/language`.

---

#### `LanguageSelectScreen` (`/onboarding/language`)

**Purpose:** User picks UI language. Most important onboarding step.

4 large tappable cards, one per language, each labeled in that language:
- English
- हिन्दी
- ಕನ್ನಡ
- తెలుగు

Selected card highlights with primary-color border and checkmark. "Continue" button activates when one is selected.

**On continue:** Save to `shared_preferences` key `preferred_language`. Navigate to `/onboarding/phone`.

---

#### `PhoneInputScreen` (`/onboarding/phone`)

Optional. Country code +91 pre-filled. Text field for 10-digit mobile number. "Continue" and "Skip for now" buttons.

- **Continue:** Validate format (`^[6-9]\d{9}$`). Call `POST /v1/auth/session` with phone. On success → store token → navigate to `/home`.
- **Skip:** Call `POST /v1/auth/session` with no identifier. Store anonymous token → navigate to `/home`.

---

### HomeScreen (`/home`)

This is the default landing screen. It is a full-page widget shown before the user selects a bottom nav tab.

**Layout (top to bottom):**

1. **Header row**: App logo + "SwasthyaAI" title on left. Profile avatar icon on right → `/profile`.

2. **Active alert banner** (conditional): Yellow/red `Container` if any alerts exist for the user's region. Shows first alert title + "View All" link → `/alerts`. Dismissable with `X` button.

3. **Quick access grid (2×2)**:

   | Tile | Icon | Action |
   |------|------|--------|
   | Chatbot | `chat_bubble_outline` | Navigate to `/chat` |
   | Symptom Checker | `search` (magnifying glass + body) | Navigate to `/symptom-checker` |
   | Vaccination | `vaccines` | Navigate to `/vaccination` |
   | Hospitals | `local_hospital` | Navigate to `/hospitals` |

4. **Upcoming vaccination reminder card** (conditional): If any vaccine due within 14 days, show a `Card` with vaccine name, due date, and "View Schedule" button.

5. **Latest news snippet** (optional): Single `Card` showing most recent news headline. "View All" → `/alerts`.

6. **Floating Action Button**: Large mic icon, label "Talk to AI", positioned at bottom center → `/chat/voice`.

**Data:**
- Alerts: `GET /v1/alerts?regionCode=<stored>` via `AlertsProvider`.
- Vaccination reminder: from `VaccinationProvider` (cached from last fetch).
- News: `GET /v1/news?limit=1` via `NewsProvider`.

---

### Chat

#### `ChatScreen` (`/chat`)

Standard chat UI.

**Layout:**
- `AppBar`: "Chatbot" title. Language selector icon (top-right) → opens `LanguagePickerSheet`.
- `ListView` of `ChatBubble` widgets, reverse scroll.
- Input bar at bottom: text field + mic icon button + send button.

**Message types:**
- `user`: right-aligned bubble, user's preferred color.
- `assistant`: left-aligned bubble with robot avatar. Shows:
  - Response text
  - `DisclaimerBanner` (always)
  - `EmergencyBanner` if `isEmergency == true`
  - "🔊 Speak" icon button → POST `/v1/voice/synthesize` → play audio via `just_audio`

**On send text:**
1. Add user message to `ChatProvider` immediately.
2. Add a `loading` bubble (animated dots).
3. Call `OpenAIClient.healthChat(message, language, history)`.
4. Replace loading bubble with assistant response.
5. Check `isEmergencyResponse(response)` → set emergency flag on message.
6. On error: replace loading bubble with error message + retry button.

**On mic button:** Navigate to `/chat/voice` (push).

**On screen load:** The `ChatProvider` holds messages in memory. No backend fetch needed for conversation history (session-scoped in memory).

---

#### `VoiceInputScreen` (`/chat/voice`)

Full-screen voice mode.

**States:**

| State | UI |
|-------|----|
| `idle` | Large mic `FloatingActionButton`, "Tap to speak" label below |
| `recording` | Lottie pulse animation, red mic button, "Listening..." label, waveform bars, "Stop" button |
| `transcribing` | `CircularProgressIndicator`, "Transcribing..." |
| `thinking` | Spinner, "Thinking..." |
| `result` | Transcript text (gray italic), response text (bold), auto-plays audio, "Speak Again" + "Back to Chat" buttons |
| `error` | Error message, "Try Again" button |

**Flow:**
1. Tap mic → request mic permission via `record` package.
2. Start recording → `AudioRecorder().start(config, path: tempPath)`.
3. Tap stop (or 30s auto-stop) → `AudioRecorder().stop()` → returns file path.
4. State → `transcribing`. POST file to `POST /v1/voice/transcribe`. Returns `{ transcript, detectedLanguage }`.
5. State → `thinking`. Call `OpenAIClient.healthChat(transcript, detectedLanguage)`.
6. State → `result`. Display transcript + response.
7. Auto-call `POST /v1/voice/synthesize` with response text → get `audioUrl` → play via `just_audio`.
8. "Back to Chat" → pop, add exchange to `ChatProvider`.

---

### SymptomCheckerScreen (`/symptom-checker`)

**Header:** "Symptom Checker"

**Section 1 — Common Symptoms:**
Horizontal `Wrap` of tappable `FilterChip` widgets. Tapping toggles selection (highlighted). Common symptoms list:
`Fever`, `Headache`, `Cough`, `Sore Throat`, `Body Ache`, `Fatigue`, `Nausea`, `Diarrhoea`, `Rash`, `Shortness of Breath`, `Chest Pain`, `Vomiting`.

**Section 2 — Additional Symptoms:**
`TextField` multiline: "Describe any other symptoms you're experiencing..."

**"Analyse Symptoms" button** (disabled until at least 1 chip selected or text entered):
1. Combine selected chips + text into a prompt.
2. Call `OpenAIClient.healthChat` with a symptom analysis system prompt (same safety rules, but framed as: "The user reports these symptoms: [list]. Provide educational information about what conditions these symptoms may be associated with, emphasize the need to see a doctor, and flag if any symptom is an emergency.")
3. Show result in a `BottomSheet` or push to a result sub-page with:
   - AI response text
   - `DisclaimerBanner`
   - `EmergencyBanner` if triggered
   - "Find Nearby Hospitals" button → `/hospitals`

---

### Vaccination

#### `VaccinationScreen` (`/vaccination`)

**Data source:** `VaccinationProvider` → `GET /v1/vaccination/profile`.

**If no profile yet:** Show a setup card: "Set up your vaccination profile" with a form:
- Date of birth (date picker)
- Gender (dropdown: Male / Female / Other)
- Submit → `POST /v1/vaccination/profile`

**If profile exists, show 3 sections:**

**1. Upcoming Vaccines** (`ListView`):
Each item: `VaccinationCard` → vaccine name, due date chip (color-coded by days until due: red <7d, orange 7-30d, green >30d), priority badge.

**2. My Vaccination History** (`ListView`):
Each item: vaccine name, date given, facility name (if stored). "Add Record" `FloatingActionButton` → `/vaccination/add`.

**3. Family Members** (`ExpansionTile` per member):
Name + relationship + their upcoming vaccines count. Tap to expand → shows their upcoming vaccine list.

---

#### `AddVaccinationScreen` (`/vaccination/add`)

Form:
- Vaccine name (`TextField` with autocomplete from `COMMON_VACCINES` list hardcoded in constants)
- Date administered (`DatePicker`, max today)
- For self or family member (`DropdownButton`, "Self" + family member names)
- Facility name (optional `TextField`)
- Batch number (optional `TextField`)

Submit → `POST /v1/vaccination/records`. On success: pop, invalidate `VaccinationProvider`, show `SnackBar` "Record added".

**`COMMON_VACCINES` list** (hardcode in `lib/core/constants/vaccines.dart`):
BCG, Hepatitis B, OPV (Polio), DPT, Hib, PCV, Rotavirus, MMR, Varicella, Hepatitis A, Typhoid, HPV, Influenza, COVID-19, Tetanus (Td).

---

### Education

#### `EducationScreen` (`/education`)

**Header:** "Health Education"

**Topics grid (2-column `GridView`):**

| Topic | Icon |
|-------|------|
| Preventive Healthcare | `shield` |
| Healthy Diet & Nutrition | `restaurant` |
| Exercise & Fitness | `fitness_center` |
| Mental Health & Wellbeing | `psychology` |
| Sleep Hygiene | `bedtime` |
| Regular Health Checkups | `medical_services` |
| Hydration & Water | `water_drop` |
| Smoking & Alcohol Cessation | `no_smoking` |
| Hand Hygiene & Sanitation | `clean_hands` |

Each tile: icon + label. Tap → `/education/:topicId`.

**"Take Health Quiz" button** at bottom of screen → `/education/quiz`.

**Topics are static content** defined in `lib/core/constants/education_topics.dart`. No backend call needed.

---

#### `TopicDetailScreen` (`/education/:topicId`)

Shows static educational content for the selected topic:
- Topic title + icon
- `Markdown`-rendered content (use `flutter_markdown` package)
- "Ask AI about this topic" button → pre-fills ChatScreen with a question about the topic and navigates to `/chat`

Static content for all 9 topics is defined in Dart constants (strings). Content is in English by default; translated strings are in the i18n map.

---

#### `QuizScreen` (`/education/quiz`)

**10 static yes/no health assessment questions** hardcoded in `lib/core/constants/quiz_questions.dart`.

Sample questions:
1. Do you exercise regularly (at least 3 times a week)?
2. Do you drink at least 8 glasses of water daily?
3. Do you eat fruits and vegetables every day?
4. Do you smoke or use tobacco products?
5. Do you sleep 7–8 hours every night?
6. Have you had a full health checkup in the last year?
7. Do you wash your hands before meals and after using the toilet?
8. Do you consume more than 2 alcoholic drinks per day?
9. Do you have any chronic conditions (diabetes, hypertension, asthma)?
10. Are you up to date with your vaccinations?

**UI:**
- Progress bar at top ("Question 3 of 10")
- Question text (large font)
- Two large buttons: "Yes" / "No" (answer and auto-advance to next)
- Back arrow disabled (one-way quiz)

**On completion:**
1. Collect answers as a list.
2. Call `OpenAIClient.healthChat` with a prompt: "Based on these health assessment answers: [answers], provide a brief personalized health education summary and suggest 3 actionable improvements. Be encouraging, not alarmist."
3. Show results screen with AI response + `DisclaimerBanner` + "Retake Quiz" + "Back to Education" buttons.

---

### HospitalsScreen (`/hospitals`)

**Nearby hospitals found and displayed directly using Google Maps + Google Places API — no backend call.**

**Layout:**
- Full-screen `GoogleMap` widget as base layer.
- Custom `DraggableScrollableSheet` from bottom (hospitals list, initially collapsed to show ~3 cards).
- Filter chips at top of sheet: All / Hospitals / Clinics / Pharmacies.

**On load:**
1. Request location permission via `geolocator`.
2. If granted: get `Position` → center map on user location → call `findNearbyHospitals(latLng)` via Google Places Nearby Search.
3. If denied: show `TextField` for manual city/area input → use `Places Autocomplete` → get coordinates → search.
4. Plot red `Marker` pins for each result on the `GoogleMap`.

**Tapping a marker** → opens a `BottomSheet` (or `showModalBottomSheet`) with:
- Place name + address
- Rating stars (if available from Places)
- "Call" button (if phone number available) → `url_launcher` opens dialer
- "Get Directions" button → `url_launcher` opens Google Maps / Apple Maps with destination

**Hospital list (in draggable sheet):** `ListView` of `FacilityCard` widgets (name, distance, type badge, phone tap-to-call). Distance calculated client-side from user coords.

**`FacilityCard`** (used here and in vaccination centers):
- Name (bold)
- Type badge (colored chip)
- Distance ("~2.3 km")
- Phone number (tappable → dialer)
- "Directions" icon button

---

### AlertsScreen (`/alerts`)

**Header:** "Health Alerts & News"

**Two sections:**

**1. Active Alerts** (`GET /v1/alerts?regionCode=<user region>`):
`AlertCard` per alert. Color-coded left border: red (critical), orange (high), yellow (medium), blue (low).

**`AlertCard`:**
- Severity dot + type label (Outbreak / Weather / Health)
- Title (bold, 1 line)
- Message (3 lines max, "Read more" expands)
- Source link (if available) → `url_launcher`
- "Expires: [date]" footer

Auto-refresh every 5 minutes (`Timer.periodic`).

**2. Health News** (`GET /v1/news?language=<lang>&limit=10`):
List of `NewsCard` widgets.

**`NewsCard`:**
- Headline (bold, 2 lines)
- Source name + date (small, gray)
- Tap → `url_launcher` opens article URL

Empty state: "No active alerts in your area. Stay safe! 🌿"

---

### ProfileScreen (`/profile`)

**Data:** `GET /v1/users/me`

**Sections:**

**Account:**
- User ID (truncated, grayed out)
- Phone number (if linked) or "Anonymous" + "Link phone number" button
- Preferred language → tap → opens `LanguagePickerSheet` → `PUT /v1/users/me`

**Location:**
- Region (text, tap to edit) → `PUT /v1/users/me`

**Privacy:**
- `SwitchListTile`: Share location (on/off) → `PUT /v1/users/me` on toggle
- `SwitchListTile`: Allow health alerts (on/off) → `PUT /v1/users/me` on toggle

**Danger Zone:**
- "Delete My Data" `OutlinedButton` (red) → `AlertDialog` confirmation → `DELETE /v1/users/me` → clear token → navigate to onboarding.

---

## Reusable Widgets

### `MicButton`
```dart
MicButton({
  required VoidCallback onPressed,
  bool isRecording = false,
  double size = 64,
})
```
Circular FAB with mic icon. When `isRecording`: red background + Lottie pulse animation overlay.

### `ChatBubble`
```dart
ChatBubble({
  required ChatMessage message,
  VoidCallback? onSpeakPressed,
})
```
Renders user (right) or assistant (left) bubble. For assistant: shows `DisclaimerBanner` below text, `EmergencyBanner` if `isEmergency`, speak icon.

### `DisclaimerBanner`
```dart
DisclaimerBanner({ String? text })
```
Small gray `Container` with info icon. Default text: "Health education only — not a substitute for professional medical advice."

### `EmergencyBanner`
```dart
EmergencyBanner({ required bool visible })
```
Prominent red `Container`, visible only when `visible == true`. Text: "🚨 EMERGENCY: Call 108 immediately." Full-width, not dismissable.

### `AlertCard`
```dart
AlertCard({ required Alert alert })
```
`Card` with left border color by severity. Expandable message.

### `VaccinationCard`
```dart
VaccinationCard({ required UpcomingVaccine vaccine })
```
Shows name, due date, priority badge. Priority color: red (high), orange (medium), green (low).

### `FacilityCard`
```dart
FacilityCard({ required Facility facility, required VoidCallback onDirections })
```
Name, type, distance, phone (tappable), directions button.

### `LanguagePickerSheet`
底部 bottom sheet with 4 language tiles. Returns selected `Language` enum via callback.

### `LoadingOverlay`
Full-screen semi-transparent overlay with `CircularProgressIndicator` + optional message string.

---

## State Management (Riverpod)

### `authProvider`
```dart
@riverpod
class Auth extends _$Auth {
  Future<String?> build() async {
    return FlutterSecureStorage().read(key: 'session_token');
  }
  Future<void> setToken(String token) async { ... }
  Future<void> clearToken() async { ... }
}
```

### `userProvider`
```dart
@riverpod
Future<User> currentUser(CurrentUserRef ref) async {
  final token = await ref.watch(authProvider.future);
  if (token == null) throw UnauthorizedException();
  return UsersApi(ref.read(dioProvider)).getMe();
}
```

### `chatProvider`
```dart
@riverpod
class Chat extends _$Chat {
  List<ChatMessage> build() => [];
  void addMessage(ChatMessage msg) { state = [...state, msg]; }
  void replaceLastLoading(ChatMessage msg) { ... }
}
```

### `vaccinationProvider`
```dart
@riverpod
Future<VaccinationProfile?> vaccinationProfile(VaccinationProfileRef ref) async {
  return VaccinationApi(ref.read(dioProvider)).getProfile();
}
```

### `alertsProvider`
```dart
@riverpod
Future<List<Alert>> alerts(AlertsRef ref) async {
  final user = await ref.watch(currentUserProvider.future);
  return AlertsApi(ref.read(dioProvider)).getAlerts(user.location?.regionCode ?? 'KA_BLR');
}
```

---

## API Client (Dio)

**File:** `lib/core/api/dio_client.dart`

```dart
final dioProvider = Provider<Dio>((ref) {
  final dio = Dio(BaseOptions(baseUrl: Env.apiBaseUrl));

  dio.interceptors.add(InterceptorsWrapper(
    onRequest: (options, handler) async {
      final token = await FlutterSecureStorage().read(key: 'session_token');
      if (token != null) options.headers['Authorization'] = 'Bearer $token';
      handler.next(options);
    },
    onError: (err, handler) {
      if (err.response?.statusCode == 401) {
        // Clear session, redirect to onboarding
        ref.read(authProvider.notifier).clearToken();
      }
      handler.next(err);
    },
  ));

  return dio;
});
```

All API classes take `Dio` as a constructor parameter. All responses follow `{ ok, data }` or `{ ok, error }` envelope.

---

## Internationalization (i18n)

**File:** `lib/l10n/strings.dart`

Simple Map-based translation. All static UI strings are defined here in 4 languages.

```dart
const Map<String, Map<String, String>> appStrings = {
  'en': {
    'app_name': 'SwasthyaAI',
    'tagline': 'Your Health, Your Language',
    'get_started': 'Get Started',
    'select_language': 'Select Your Language',
    'chatbot': 'Chatbot',
    'vaccination': 'Vaccination',
    'education': 'Education',
    'hospitals': 'Hospitals',
    'talk_to_ai': 'Talk to AI',
    'symptom_checker': 'Symptom Checker',
    'analyse_symptoms': 'Analyse Symptoms',
    'common_symptoms': 'Common Symptoms',
    'health_education': 'Health Education',
    'take_quiz': 'Take Health Quiz',
    'nearby_hospitals': 'Nearby Hospitals',
    'alerts': 'Health Alerts',
    'profile': 'Profile',
    'disclaimer': 'Health education only — not a substitute for professional medical advice.',
    'emergency_call': '🚨 EMERGENCY: Call 108 immediately.',
    'skip_for_now': 'Skip for now',
    'ask_question': 'Ask about your health...',
    'send': 'Send',
    'speak_response': 'Speak response',
    'add_record': 'Add Record',
    'upcoming_vaccines': 'Upcoming Vaccines',
    'vaccination_history': 'Vaccination History',
    'family_members': 'Family Members',
    'view_all': 'View All',
    'find_hospitals': 'Find Nearby Hospitals',
    'get_directions': 'Get Directions',
    'call': 'Call',
    'delete_my_data': 'Delete My Data',
    'confirm_delete': 'Are you sure? This will schedule deletion of all your data within 30 days.',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
  },
  'hi': {
    'app_name': 'स्वास्थ्य AI',
    'tagline': 'आपकी सेहत, आपकी भाषा',
    'get_started': 'शुरू करें',
    'select_language': 'अपनी भाषा चुनें',
    'chatbot': 'चैटबॉट',
    'vaccination': 'टीकाकरण',
    'education': 'शिक्षा',
    'hospitals': 'अस्पताल',
    'talk_to_ai': 'AI से बात करें',
    'symptom_checker': 'लक्षण जाँच',
    'analyse_symptoms': 'लक्षण विश्लेषण',
    'common_symptoms': 'सामान्य लक्षण',
    'health_education': 'स्वास्थ्य शिक्षा',
    'take_quiz': 'स्वास्थ्य प्रश्नोत्तरी',
    'nearby_hospitals': 'नजदीकी अस्पताल',
    'alerts': 'स्वास्थ्य अलर्ट',
    'profile': 'प्रोफ़ाइल',
    'disclaimer': 'यह केवल स्वास्थ्य शिक्षा है — पेशेवर चिकित्सा सलाह का विकल्प नहीं।',
    'emergency_call': '🚨 आपातकाल: तुरंत 108 पर कॉल करें।',
    'skip_for_now': 'अभी छोड़ें',
    'ask_question': 'अपने स्वास्थ्य के बारे में पूछें...',
    'send': 'भेजें',
    'speak_response': 'जवाब सुनें',
    'add_record': 'रिकॉर्ड जोड़ें',
    'upcoming_vaccines': 'आगामी टीके',
    'vaccination_history': 'टीकाकरण इतिहास',
    'family_members': 'परिवार के सदस्य',
    'view_all': 'सभी देखें',
    'find_hospitals': 'नजदीकी अस्पताल खोजें',
    'get_directions': 'दिशा निर्देश',
    'call': 'कॉल करें',
    'delete_my_data': 'मेरा डेटा हटाएं',
    'confirm_delete': 'क्या आप सुनिश्चित हैं? यह 30 दिनों के भीतर आपका सारा डेटा हटा देगा।',
    'cancel': 'रद्द करें',
    'confirm': 'पुष्टि करें',
  },
  'kn': {
    'app_name': 'ಸ್ವಾಸ್ಥ್ಯ AI',
    'tagline': 'ನಿಮ್ಮ ಆರೋಗ್ಯ, ನಿಮ್ಮ ಭಾಷೆ',
    'get_started': 'ಪ್ರಾರಂಭಿಸಿ',
    'select_language': 'ನಿಮ್ಮ ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    'chatbot': 'ಚಾಟ್‌ಬಾಟ್',
    'vaccination': 'ಲಸಿಕೆ',
    'education': 'ಶಿಕ್ಷಣ',
    'hospitals': 'ಆಸ್ಪತ್ರೆಗಳು',
    'talk_to_ai': 'AI ಜೊತೆ ಮಾತನಾಡಿ',
    'symptom_checker': 'ರೋಗಲಕ್ಷಣ ಪರೀಕ್ಷೆ',
    'analyse_symptoms': 'ರೋಗಲಕ್ಷಣ ವಿಶ್ಲೇಷಣೆ',
    'common_symptoms': 'ಸಾಮಾನ್ಯ ರೋಗಲಕ್ಷಣಗಳು',
    'health_education': 'ಆರೋಗ್ಯ ಶಿಕ್ಷಣ',
    'take_quiz': 'ಆರೋಗ್ಯ ಪ್ರಶ್ನೋತ್ತರ',
    'nearby_hospitals': 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆಗಳು',
    'alerts': 'ಆರೋಗ್ಯ ಎಚ್ಚರಿಕೆಗಳು',
    'profile': 'ಪ್ರೊಫೈಲ್',
    'disclaimer': 'ಇದು ಆರೋಗ್ಯ ಶಿಕ್ಷಣ ಮಾತ್ರ — ವೈದ್ಯಕೀಯ ಸಲಹೆಯ ಪರ್ಯಾಯ ಅಲ್ಲ.',
    'emergency_call': '🚨 ತುರ್ತು: ತಕ್ಷಣ 108 ಗೆ ಕರೆ ಮಾಡಿ.',
    'skip_for_now': 'ಈಗ ಬಿಟ್ಟುಬಿಡಿ',
    'ask_question': 'ನಿಮ್ಮ ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕೇಳಿ...',
    'send': 'ಕಳುಹಿಸಿ',
    'speak_response': 'ಉತ್ತರ ಕೇಳಿ',
    'add_record': 'ದಾಖಲೆ ಸೇರಿಸಿ',
    'upcoming_vaccines': 'ಮುಂಬರುವ ಲಸಿಕೆಗಳು',
    'vaccination_history': 'ಲಸಿಕೆ ಇತಿಹಾಸ',
    'family_members': 'ಕುಟುಂಬ ಸದಸ್ಯರು',
    'view_all': 'ಎಲ್ಲವನ್ನೂ ನೋಡಿ',
    'find_hospitals': 'ಹತ್ತಿರದ ಆಸ್ಪತ್ರೆ ಹುಡುಕಿ',
    'get_directions': 'ದಿಕ್ಕುಗಳು',
    'call': 'ಕರೆ ಮಾಡಿ',
    'delete_my_data': 'ನನ್ನ ಡೇಟಾ ಅಳಿಸಿ',
    'confirm_delete': 'ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ? ಇದು 30 ದಿನಗಳಲ್ಲಿ ನಿಮ್ಮ ಎಲ್ಲ ಡೇಟಾ ಅಳಿಸುತ್ತದೆ.',
    'cancel': 'ರದ್ದುಮಾಡಿ',
    'confirm': 'ದೃಢಪಡಿಸಿ',
  },
  'te': {
    'app_name': 'స్వాస్థ్య AI',
    'tagline': 'మీ ఆరోగ్యం, మీ భాష',
    'get_started': 'ప్రారంభించండి',
    'select_language': 'మీ భాషను ఎంచుకోండి',
    'chatbot': 'చాట్‌బాట్',
    'vaccination': 'టీకా',
    'education': 'విద్య',
    'hospitals': 'ఆస్పత్రులు',
    'talk_to_ai': 'AI తో మాట్లాడండి',
    'symptom_checker': 'లక్షణ తనిఖీ',
    'analyse_symptoms': 'లక్షణాలు విశ్లేషించండి',
    'common_symptoms': 'సాధారణ లక్షణాలు',
    'health_education': 'ఆరోగ్య విద్య',
    'take_quiz': 'ఆరోగ్య క్విజ్',
    'nearby_hospitals': 'సమీప ఆస్పత్రులు',
    'alerts': 'ఆరోగ్య హెచ్చరికలు',
    'profile': 'ప్రొఫైల్',
    'disclaimer': 'ఇది ఆరోగ్య విద్య మాత్రమే — వైద్య సలహాకు ప్రత్యామ్నాయం కాదు.',
    'emergency_call': '🚨 అత్యవసరం: వెంటనే 108 కి కాల్ చేయండి.',
    'skip_for_now': 'ఇప్పుడు దాటవేయండి',
    'ask_question': 'మీ ఆరోగ్యం గురించి అడగండి...',
    'send': 'పంపండి',
    'speak_response': 'సమాధానం వినండి',
    'add_record': 'రికార్డు జోడించండి',
    'upcoming_vaccines': 'రాబోయే టీకాలు',
    'vaccination_history': 'టీకా చరిత్ర',
    'family_members': 'కుటుంబ సభ్యులు',
    'view_all': 'అన్నీ చూడండి',
    'find_hospitals': 'సమీప ఆస్పత్రి కనుగొనండి',
    'get_directions': 'దిశలు',
    'call': 'కాల్ చేయండి',
    'delete_my_data': 'నా డేటా తొలగించండి',
    'confirm_delete': 'మీరు ఖచ్చితంగా ఉన్నారా? ఇది 30 రోజులలో మీ డేటా తొలగిస్తుంది.',
    'cancel': 'రద్దు చేయండి',
    'confirm': 'నిర్ధారించండి',
  },
};

String t(String key, String language) {
  return appStrings[language]?[key] ?? appStrings['en']?[key] ?? key;
}
```

**Font note:** Use `google_fonts: GoogleFonts.notoSans()` as the base font family — it covers Devanagari (Hindi), Kannada, and Telugu scripts correctly.

---

## Push Notifications

Uses Firebase Cloud Messaging (FCM).

**Setup:**
1. Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) to respective directories.
2. Request notification permission on `HomeScreen` first load (after onboarding completes).
3. Get FCM token → call `PUT /v1/users/me` with `{ "fcmToken": "<token>" }`.
4. Backend stores the FCM token and uses it to send push notifications via Firebase Admin SDK.

**Notification tap handling:**
```dart
FirebaseMessaging.onMessageOpenedApp.listen((message) {
  final type = message.data['type'];
  if (type == 'alert') context.go('/alerts');
  if (type == 'vaccination_reminder') context.go('/vaccination');
});
```

**Notification types sent by backend:**
- `type: "alert"` — new health alert for user's region
- `type: "vaccination_reminder"` — vaccine due soon

---

## Data Models (Dart)

```dart
// lib/core/models/user.dart
class User {
  final String userId;
  final String? phoneNumber;
  final String preferredLanguage;  // 'en' | 'hi' | 'kn' | 'te'
  final UserLocation? location;
  final PrivacySettings privacySettings;
  final bool onboardingComplete;
  final DateTime createdAt;
  final DateTime lastActive;
}

class UserLocation {
  final String regionCode;
  final double? latitude;
  final double? longitude;
  final String? address;
}

class PrivacySettings {
  final bool shareLocation;
  final bool allowAlerts;
}

// lib/core/models/chat_message.dart
class ChatMessage {
  final String id;
  final String role;          // 'user' | 'assistant' | 'loading' | 'error'
  final String content;
  final bool isEmergency;
  final String? disclaimer;
  final DateTime timestamp;
}

// lib/core/models/vaccination.dart
class VaccinationProfile {
  final String profileId;
  final String dateOfBirth;
  final String gender;
  final List<VaccinationRecord> vaccinations;
  final List<UpcomingVaccine> upcomingVaccines;
  final List<FamilyMember> familyMembers;
}

class VaccinationRecord {
  final String vaccineId;
  final String vaccineName;
  final String dateAdministered;
  final String? facilityId;
  final String? batchNumber;
}

class UpcomingVaccine {
  final String vaccineId;
  final String vaccineName;
  final String dueDate;
  final bool reminderSent;
  final String priority;  // 'high' | 'medium' | 'low'
}

class FamilyMember {
  final String memberId;
  final String name;
  final String relationship;
  final String dateOfBirth;
  final List<UpcomingVaccine> upcomingVaccines;
}

// lib/core/models/alert.dart
class Alert {
  final String alertId;
  final String type;        // 'outbreak' | 'weather' | 'health'
  final String severity;    // 'critical' | 'high' | 'medium' | 'low'
  final String title;
  final String message;
  final String regionCode;
  final String? sourceUrl;
  final DateTime createdAt;
  final DateTime expiresAt;
}

// lib/core/models/news_article.dart
class NewsArticle {
  final String articleId;
  final String title;
  final String? summary;
  final String url;
  final String source;
  final DateTime publishedAt;
}

// lib/core/models/facility.dart  (for vaccination centers shown from backend)
class Facility {
  final String facilityId;
  final String name;
  final String facilityType;
  final double distance;
  final bool isOpen;
  final FacilityLocation location;
  final String? phoneNumber;
  final List<String> services;
  final List<String> languagesSupported;
}
```

---

## Backend API Reference

All endpoints are prefixed `/v1`. All responses use the envelope:
- Success: `{ "ok": true, "data": { ... } }`
- Error: `{ "ok": false, "error": { "code": "...", "message": "..." } }`

Authentication: `Authorization: Bearer <token>` header on all requests except `POST /v1/auth/session`.

---

### Auth

#### `POST /v1/auth/session`
Create or retrieve a user session.

**Body:**
```json
{
  "channel": "mobile",
  "identifier": "+919876543210"
}
```
`identifier` is optional (omit for anonymous session). `channel` must be `"mobile"` for Flutter app.

**Response:**
```json
{
  "ok": true,
  "data": {
    "sessionId": "sess_abc123",
    "userId": "usr_xyz789",
    "token": "<jwt>",
    "isNew": true,
    "expiresAt": "2025-01-02T12:00:00Z"
  }
}
```

---

#### `DELETE /v1/auth/session`
End current session. Clears server-side session.

**Response:** `{ "ok": true, "data": { "success": true } }`

---

### Users

#### `GET /v1/users/me`
Get current user profile.

**Response:**
```json
{
  "ok": true,
  "data": {
    "user": {
      "userId": "usr_xyz",
      "preferredLanguage": "kn",
      "channels": ["mobile"],
      "location": { "regionCode": "KA_BLR", "address": "Bengaluru, Karnataka" },
      "privacySettings": { "shareLocation": true, "allowAlerts": true },
      "onboardingComplete": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "lastActive": "2025-01-01T10:00:00Z"
    }
  }
}
```

---

#### `PUT /v1/users/me`
Update user profile. All fields optional.

**Body (any subset):**
```json
{
  "preferredLanguage": "hi",
  "location": { "regionCode": "KA_BLR", "latitude": 12.9716, "longitude": 77.5946 },
  "privacySettings": { "allowAlerts": false },
  "fcmToken": "<firebase-fcm-token>"
}
```

**Response:** Updated user object (same shape as GET).

---

#### `DELETE /v1/users/me`
Schedule deletion of all user data within 30 days.

**Response:**
```json
{
  "ok": true,
  "data": {
    "success": true,
    "deletionScheduledAt": "2025-01-01T10:00:00Z",
    "deletionCompletesBy": "2025-01-31T10:00:00Z"
  }
}
```

---

### Vaccination

#### `GET /v1/vaccination/profile`
Get full vaccination profile for the current user including family members.

**Response:**
```json
{
  "ok": true,
  "data": {
    "profile": {
      "profileId": "vp_abc",
      "userId": "usr_xyz",
      "dateOfBirth": "1990-05-15",
      "gender": "female",
      "vaccinations": [
        {
          "vaccineId": "vrec_abc",
          "vaccineName": "COVID-19 (Covishield)",
          "dateAdministered": "2021-04-01",
          "facilityId": null,
          "batchNumber": "4120Z001"
        }
      ],
      "upcomingVaccines": [
        {
          "vaccineId": "vac_flu",
          "vaccineName": "Influenza",
          "dueDate": "2025-10-01",
          "reminderSent": false,
          "priority": "medium"
        }
      ],
      "familyMembers": [
        {
          "memberId": "fm_abc",
          "name": "Arjun",
          "relationship": "child",
          "dateOfBirth": "2020-03-10",
          "upcomingVaccines": []
        }
      ],
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  }
}
```

Returns `{ "ok": true, "data": { "profile": null } }` if no profile exists yet.

---

#### `POST /v1/vaccination/profile`
Create or replace vaccination profile.

**Body:**
```json
{
  "dateOfBirth": "1990-05-15",
  "gender": "female",
  "familyMembers": [
    { "name": "Arjun", "relationship": "child", "dateOfBirth": "2020-03-10" }
  ]
}
```

`familyMembers` is optional. `relationship` values: `child`, `spouse`, `parent`, `sibling`, `other`.

**Response:** Full profile object (same as GET).

---

#### `POST /v1/vaccination/records`
Add a vaccination record for self or a family member.

**Body:**
```json
{
  "vaccineName": "MMR",
  "dateAdministered": "2024-06-15",
  "facilityId": null,
  "batchNumber": null,
  "memberId": null
}
```

`memberId`: null = self, family member ID = that member's record.

**Response:**
```json
{
  "ok": true,
  "data": {
    "record": { "vaccineId": "vrec_new", "vaccineName": "MMR", "dateAdministered": "2024-06-15" },
    "adjustedReminders": []
  }
}
```

---

#### `DELETE /v1/vaccination/records/:vaccineId`
Remove a vaccination record.

**Query params:** `?memberId=fm_abc` (omit for self)

**Response:** `{ "ok": true, "data": { "success": true } }`

---

#### `GET /v1/vaccination/schedule`
Get recommended vaccination schedule based on age/gender.

**Query params:**

| Param | Required | Example |
|-------|----------|---------|
| `dateOfBirth` | Yes | `1990-05-15` |
| `gender` | Yes | `female` |
| `language` | No | `kn` |

**Response:**
```json
{
  "ok": true,
  "data": {
    "schedule": [
      {
        "vaccineId": "vac_flu",
        "vaccineName": "Influenza",
        "recommendedAgeMonths": null,
        "dueDate": "2025-10-01",
        "status": "upcoming"
      }
    ]
  }
}
```

`status`: `completed` | `upcoming` | `overdue` | `not_applicable`

---

#### `GET /v1/vaccination/centers`
Find vaccination centers near a location (pre-filtered to `facilityType: vaccination_center`).

**Query params:** `lat`, `lng`, `radius` (km, default 10)

**Response:** Same as `GET /v1/facilities` response shape.

---

### Alerts

#### `GET /v1/alerts`
Get active health alerts for a region.

**Query params:**

| Param | Required | Notes |
|-------|----------|-------|
| `regionCode` | Yes | e.g. `KA_BLR`, `TN_CHE`, `AP_HYD` |
| `language` | No | `en` \| `hi` \| `kn` \| `te` |
| `type` | No | `outbreak` \| `weather` \| `health` |

**Response:**
```json
{
  "ok": true,
  "data": {
    "alerts": [
      {
        "alertId": "alert_abc",
        "type": "outbreak",
        "severity": "high",
        "title": "Dengue Outbreak Warning",
        "message": "Dengue cases have risen significantly in Bengaluru South...",
        "regionCode": "KA_BLR",
        "sourceUrl": "https://mohfw.gov.in/...",
        "createdAt": "2025-01-01T08:00:00Z",
        "expiresAt": "2025-01-15T08:00:00Z"
      }
    ],
    "total": 2
  }
}
```

---

### News

#### `GET /v1/news`
Get health news articles. Articles are sourced from WHO, MoHFW, and state health department feeds by the backend scheduler.

**Query params:**

| Param | Default | Notes |
|-------|---------|-------|
| `language` | `en` | `en` \| `hi` \| `kn` \| `te` |
| `limit` | `10` | Max 50 |
| `page` | `1` | |

**Response:**
```json
{
  "ok": true,
  "data": {
    "articles": [
      {
        "articleId": "news_abc",
        "title": "Waterborne disease outbreaks surge in Maharashtra",
        "summary": "Health authorities report a threefold increase in waterborne cases...",
        "url": "https://mohfw.gov.in/news/...",
        "source": "MoHFW",
        "publishedAt": "2025-01-01T06:00:00Z"
      }
    ],
    "total": 24,
    "page": 1,
    "hasMore": true
  }
}
```

---

### Voice

#### `POST /v1/voice/transcribe`
Convert uploaded audio file to text using Amazon Transcribe.

**Content-Type:** `multipart/form-data`

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `audio` | File | Yes | m4a / aac / wav / mp3, max 10MB |
| `language` | string | No | Language hint: `en` \| `hi` \| `kn` \| `te`. Auto-detected if omitted |

**Response:**
```json
{
  "ok": true,
  "data": {
    "transcript": "What medicines help with fever?",
    "detectedLanguage": "hi",
    "confidence": 0.93
  }
}
```

**Error (unclear audio):**
```json
{
  "ok": false,
  "error": {
    "code": "VOICE_UNCLEAR",
    "message": "Audio was unclear. Please speak slowly or type your question."
  }
}
```

---

#### `POST /v1/voice/synthesize`
Convert text to speech using Amazon Polly. Returns a URL to the audio file.

**Body:**
```json
{
  "text": "Dengue fever is spread by Aedes mosquitoes...",
  "language": "hi"
}
```

`language`: `en` | `hi` | `kn` | `te`. Max 3000 chars.

**Response:**
```json
{
  "ok": true,
  "data": {
    "audioUrl": "https://swasthyaai-userdata.s3.amazonaws.com/audio/resp_abc.mp3",
    "durationSeconds": 12.4,
    "format": "mp3",
    "expiresAt": "2025-01-01T11:00:00Z"
  }
}
```

---

### Image Analysis

#### `POST /v1/image/analyze`
Analyze a symptom image using Amazon Rekognition and return health education information.

**Content-Type:** `multipart/form-data`

**Fields:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `image` | File | Yes | JPEG or PNG, max 5MB. Compress client-side to ≤1024px before sending |
| `language` | string | No | Default `en` |
| `description` | string | No | User's text description, max 500 chars |

**Response:**
```json
{
  "ok": true,
  "data": {
    "analysisId": "img_abc123",
    "educationalInfo": "The image shows what appears to be a skin rash. Rashes can have many causes...",
    "similarConditions": [
      {
        "name": "Contact Dermatitis",
        "description": "Skin reaction from contact with irritants or allergens.",
        "whenToSeekCare": "If rash spreads, blisters form, or breathing is affected."
      }
    ],
    "concerningSymptoms": false,
    "recommendations": [
      "Avoid scratching the affected area",
      "Apply a cool compress for relief",
      "Consult a dermatologist if it persists"
    ],
    "disclaimers": [
      "Visual assessment CANNOT replace professional medical diagnosis. Please consult a doctor."
    ],
    "escalationRequired": false,
    "imageQualityIssue": null
  }
}
```

**Error (poor quality):**
```json
{
  "ok": false,
  "error": {
    "code": "IMAGE_QUALITY_INSUFFICIENT",
    "message": "Image is too blurry. Please take a clearer photo in good lighting."
  }
}
```

---

### Common Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `UNAUTHORIZED` | 401 | Missing or invalid session token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `VOICE_UNCLEAR` | 422 | Audio too unclear to transcribe |
| `IMAGE_QUALITY_INSUFFICIENT` | 422 | Image too blurry/dark to analyze |
| `AI_SERVICE_ERROR` | 503 | Backend AI service unavailable |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## Theme & Colors

Define in `lib/config/theme.dart`:

```dart
const Color primaryGreen    = Color(0xFF2E7D32);  // health green
const Color primaryGreenLight = Color(0xFF43A047);
const Color accentBlue      = Color(0xFF1565C0);  // trust/info blue
const Color emergencyRed    = Color(0xFFD32F2F);
const Color warningOrange   = Color(0xFFE65100);
const Color warningYellow   = Color(0xFFF9A825);
const Color backgroundWhite = Color(0xFFFAFAFA);
const Color cardWhite       = Color(0xFFFFFFFF);
const Color textPrimary     = Color(0xFF212121);
const Color textSecondary   = Color(0xFF757575);
const Color textMuted       = Color(0xFFBDBDBD);
```

Use `ThemeData` with `colorSchemeSeed: primaryGreen`, `useMaterial3: true`.

---

## Local Dev Setup

```bash
# Prerequisites: Flutter SDK (stable), Android Studio / Xcode, Google Maps API key, OpenAI API key

git clone <repo>
cd mobile

flutter pub get

# Run on Android emulator
flutter run \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000/v1 \
  --dart-define=OPENAI_API_KEY=sk-... \
  --dart-define=GOOGLE_MAPS_KEY=AIza...

# Run on iOS simulator
flutter run \
  --dart-define=API_BASE_URL=http://127.0.0.1:3000/v1 \
  --dart-define=OPENAI_API_KEY=sk-... \
  --dart-define=GOOGLE_MAPS_KEY=AIza...

# Build release APK
flutter build apk --release \
  --dart-define=API_BASE_URL=https://api.swasthyaai.com/v1 \
  --dart-define=OPENAI_API_KEY=sk-... \
  --dart-define=GOOGLE_MAPS_KEY=AIza...
```

**Note on Android localhost:** `10.0.2.2` is the Android emulator's alias for the host machine's `localhost`. Use your machine's LAN IP for physical device testing.

---

## pubspec.yaml (dependencies)

```yaml
name: swasthya_ai
description: SwasthyaAI - Multilingual AI public health platform

environment:
  sdk: ">=3.3.0 <4.0.0"
  flutter: ">=3.19.0"

dependencies:
  flutter:
    sdk: flutter
  flutter_localizations:
    sdk: flutter

  # Navigation
  go_router: ^14.0.0

  # State management
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0

  # HTTP
  dio: ^5.4.0

  # Storage
  flutter_secure_storage: ^9.2.0
  shared_preferences: ^2.2.0

  # Maps & location
  google_maps_flutter: ^2.6.0
  geolocator: ^12.0.0

  # Audio
  record: ^5.1.0
  just_audio: ^0.9.0

  # Image
  image_picker: ^1.0.0
  flutter_image_compress: ^2.1.0
  cached_network_image: ^3.3.0

  # Notifications
  firebase_messaging: ^15.0.0
  flutter_local_notifications: ^17.0.0

  # UI utilities
  google_fonts: ^6.2.0
  lottie: ^3.1.0
  url_launcher: ^6.2.0

  # Data
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  riverpod_generator: ^2.3.0
  build_runner: ^2.4.0
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/animations/
    - assets/images/
```
