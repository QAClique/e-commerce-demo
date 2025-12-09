# front-end-tests

## Getting Started

This is a simplified set of Front End tests used for the E-Commerce demo. It requires the demo Web App included in this repo (both front-end and back-end).
It is based on [Webdriver.io](https://webdriver.io). To run the tests you need to install [Node.js](https://nodejs.org/en). Use the latest LTS version, but anything newer will work as well.

Clone the repository on your computer and in the new repo folder, do `npm run install:all`

Google Chrome is used as the default browser used in the tests, but you can change this through setting the `BROWSER` environment variable to `firefox` or other.

### Executing the tests

From the command-line do the following:

```bash
npm run test:e2e
```

You can also run individual test from the front-end test folder by doing:

```bash
npx wdio --spec <test file goes here, example: tests/addProductCart.spec.js>
```
