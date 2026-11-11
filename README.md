# Angelwood: Add Task from Page

A small browser extension for [Angelwood](https://angelwood.io), the client portal and client operations platform for
agencies and service businesses. It does one thing: turns the page you are on into a task in one of your Angelwood
projects, with the page title as the task name and the link in the notes.

## Use it

1. In Angelwood, open **Settings** and create an API key with **write** permission.
   No account yet? [Start a 14-day free trial](https://app.angelwood.io/sign-up).
2. Open the extension's settings, paste the key and choose **Save and test**.
3. On any page, click the Angelwood button, pick a project, adjust the task name if you want, and choose **Add task**.

## What it sends, and where

- It talks only to Angelwood's API at `angelwood-api-uzil.onrender.com`.
- Your API key is stored in this browser's extension storage and sent only to Angelwood.
- The current page's title and address are read when you open the popup and sent only when you choose **Add task**.
  You can edit or clear both first.
- No analytics, no tracking, no background activity. Nothing runs until you click the button.

## Build

There is no build step and no bundled or minified code. The files in this folder are the extension.

```bash
npx web-ext lint          # validate
npx web-ext build         # produces web-ext-artifacts/*.zip for addons.mozilla.org
```

To try it in Firefox: open `about:debugging`, choose **This Firefox**, **Load Temporary Add-on**, and pick
`manifest.json`.

## Links

- [Angelwood](https://angelwood.io) · [Pricing](https://angelwood.io/pricing) ·
  [Privacy](https://angelwood.io/privacy) · support@angelwood.io
- Licence: MIT
