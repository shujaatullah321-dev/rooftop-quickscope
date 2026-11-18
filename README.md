# Rooftop Quickscope for Android

This folder is the complete Android app. The game is inside it, so solo play works offline.
GitHub builds it for you for free, so you do not need Android Studio.

You also need the second ZIP, **rooftop-quickscope-signing-key.zip**. It holds your upload key.

## 1. Put the project on GitHub (free)

1. Make a free account at github.com.
2. Click **New repository**. Name it `rooftop-quickscope`, choose **Private**, and click **Create repository**.
3. Open **Settings → Secrets and variables → Actions → New repository secret** and add two secrets:
   - Name `KEYSTORE_BASE64`. For the value, paste everything in `KEYSTORE_BASE64.txt`.
   - Name `KEYSTORE_PASSWORD`. For the value, paste the password in `KEYSTORE_PASSWORD.txt`.
4. Go back to the **Code** tab, click **uploading an existing file**, and drag in everything from this folder, including the `.github` folder. Click **Commit changes**.
   - On a Mac the `.github` folder is hidden. Press **Cmd + Shift + .** in Finder to show it.

## 2. Get the app files

1. Open the **Actions** tab. A build called **Build Android app** starts by itself and takes about 5 minutes.
2. When it shows a green tick, open it and download **rooftop-quickscope-android** under **Artifacts**.
3. Unzip it. Inside are:
   - `app-release.apk`: copy it to your Android phone and open it to install and test. Allow "install unknown apps" when asked.
   - `app-release.aab`: this is the file you upload to Google Play.

If the build fails, open it, copy the red error text, and send it to Claude.

## 3. Publish on Google Play

1. Go to play.google.com/console and create a developer account. It costs US$25 once, and Google checks your identity.
2. Click **Create app** and fill in the store listing. The icon, feature graphic, screenshots and texts are in `rooftop-quickscope-store-assets.zip`.
3. Complete the **App content** forms. The app uses the internet only for online play. It sends a player nickname and in-game position to Firebase while playing online, and uses an anonymous sign-in with no email or account. Answer the content rating questions honestly: it is a shooting game with human enemies. Do not select children's age groups.
4. New personal accounts must run a **closed test** first: under **Testing → Closed testing**, upload `app-release.aab`, add at least 12 testers by email, and keep them opted in for 14 days in a row.
5. After the 14 days, click **Apply for production**. Google reviews the app, then it goes live.

## Updating the game later

1. Replace `app/src/main/assets/www/index.html` with the new game file.
2. In `app/build.gradle`, add 1 to `versionCode` and change `versionName`, for example `versionCode = 2` and `versionName = '1.1'`.
3. Upload the changed files on GitHub. A new build starts, and you upload the new `.aab` to Google Play.

## Good to know

- The app ID is `com.shujaatdigital.rooftopquickscope`. Once the app is on Google Play this can never change. To use a different one, change it in `app/build.gradle` before your first upload.
- Online play uses your free Firebase project `rooftop-quickscope` (Google). Friends who type the same room code play together. Solo play works offline.
- Every build also updates the web version at https://shujaatullah321-dev.github.io/rooftop-quickscope/ and the phone download link at https://github.com/shujaatullah321-dev/rooftop-quickscope/releases/download/latest-build/rooftop-quickscope.apk
- Credits: three.js (MIT license) and the Teko and Rajdhani fonts (SIL Open Font License). Their license files are in `app/src/main/assets/www`.
