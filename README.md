# GYGB Tompkins: Admin Web Panel

## Setup

1. Install Node with _Node Version Manager_:

- macOS, Linux, and WSL: https://github.com/nvm-sh/nvm
- WindowS: https://github.com/coreybutler/nvm-windows

After installing set your Node version to be "v12"

```sh
nvm install v12
nvm use v12
```

2. Install dependencies.

```sh
# Execute *in* the project directory.
npm install
```

## Running Locally

```
# Runs a development server!
npm run start
```

### Https Proxy

To test and develop authentication, you must run the panel over HTTPS.

To do so first configure the HTTPS proxy:

```sh
./configureHttps.sh
```

Next run the HTTPS proxy:
```sh
./runHttps.sh
```

Now the client is accessible over HTTPS at `https://localhost:3003` as long as `npm run start` is running.


### Build for production

```
# Build for production
npm run build
```