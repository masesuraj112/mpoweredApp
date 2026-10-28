# Installing the MPowered test app

**Audience:** testers, including the client, assessors and team members. This is a test version, not a store release.

## Android

**You need:** an Android phone running Android 7 or newer, and a Wi-Fi connection. The download is about 113 MB, so keep a few hundred MB of storage free.

1. On the phone, open the APK link you were sent. The latest build is on the Builds page of the Expo dashboard: https://expo.dev/accounts/mpowered-mha/projects/mpowered-app/builds
2. Download the file when asked.
3. Tap the downloaded file. If Android asks, allow your browser or file manager to install apps from this source, go back, and tap **Install**.
4. Open the app. It appears as **mpowered-app**, with a default Expo icon.

**Updates:** the app downloads new versions by itself when you open it, and applies them the next time you open it. To get the latest changes, close the app fully and reopen it. This only works for builds made after the runtime-version fix (see [deployment.md](deployment.md), Releasing); install the newest build.

**If it says "App not installed":**
- Free up storage, restart the phone, then tap the file again from the **My Files** or **Files** app (Downloads folder).
- If it still fails, install from a computer: on the phone, turn on **USB debugging** (Settings, About phone, tap Build number 7 times, then Developer options), plug it into the computer, and run `adb install -r mpowered.apk`.

## iPhone

**You need:** an iPhone, the free **Expo Go** app, and an internet connection.

**Why not a normal install:** iPhones only install apps signed through Apple's paid Developer Program, so a direct install isn't possible without that membership. Instead, the test version opens inside Expo Go, which is already approved by Apple.

1. Install **Expo Go** from the App Store. Use the latest version.
2. Open the link, or scan the QR code, you were sent. To scan, point the iPhone **Camera** at the QR code and tap the banner that appears.
3. The app opens inside Expo Go.

**Known limits:**
- Voice dictation is not available in Expo Go.
- The iPhone version has not been fully tested. Please report anything that looks wrong.
- If Expo Go asks you to sign in, or says it can't open the project, tell the team. You may need to be invited to the project.
- If Expo Go says the project needs a different version, update Expo Go from the App Store and try again. If it still fails, tell the team.

## Reporting a problem

Send the team a screenshot, what you were doing, and your phone model and Android or iOS version.
