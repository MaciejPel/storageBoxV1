## Stack 📦

This app is using **T3 stack** (Next, tRPC, TypeScript, Prisma, Tailwind, NextAuth), however packeges were installed one by one (not with `npx create-t3-app@latest`). App also uses MongoDB as database (only free db option) and BunnyCDN for media storage.

## Overview 👀

The app is intended for private use (CDN is a paid service, Mongo as well at some point), but you can provide your own environemnt variables (check `.envexample`) and play around. At first glance app might remind you of social media app, but it count likes differently & focuses on serving most used images.

## Installation ⌨

1. Provide your own services & secrets in `.envexample`
2. Install dependencies- `npm i`
3. Generate schema- `npx prisma generate`
4. Run `npm run dev` to start project locally

## Known problems ❌

- some UI elements are overflowing, position/z-index colliding (most likely)
- user verification in session is done by calling unstable function on every page load, this should be done with middleware, but multiple problems occured during making that part
- compression of big images slows experience

## Contributing 👩🏽‍⚕️

Feel free to suggest changes or `README.MD` errors, however schema will most likely stay the same, unless there is good reason to change it.

