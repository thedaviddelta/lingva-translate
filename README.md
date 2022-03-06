# Lingva Translate

<img src="public/logo.svg" width="128" align="right">

[![Travis Build](https://travis-ci.com/TheDavidDelta/lingva-translate.svg?branch=main)](https://travis-ci.com/TheDavidDelta/lingva-translate)
[![Vercel Status](https://img.shields.io/github/deployments/TheDavidDelta/lingva-translate/Production?label=vercel&logo=vercel&color=f5f5f5)](https://lingva.ml/)
[![Cypress Tests](https://img.shields.io/endpoint?url=https://dashboard.cypress.io/badge/simple/qgjdyd&style=flat&logo=cypress)](https://dashboard.cypress.io/projects/qgjdyd/runs)
[![License](https://img.shields.io/github/license/TheDavidDelta/lingva-translate)](./LICENSE)
[![Awesome Humane Tech](https://raw.githubusercontent.com/humanetech-community/awesome-humane-tech/main/humane-tech-badge.svg?sanitize=true)](https://github.com/humanetech-community/awesome-humane-tech)
[<img src="https://www.datocms-assets.com/31049/1618983297-powered-by-vercel.svg" alt="Powered by Vercel" height="20">](https://vercel.com?utm_source=lingva-team&utm_campaign=oss)

Alternative front-end for Google Translate, serving as a Free and Open Source translator with over a hundred languages available


## How does it work?

Inspired by projects like [NewPipe](https://github.com/TeamNewPipe/NewPipe), [Nitter](https://github.com/zedeus/nitter), [Invidious](https://github.com/iv-org/invidious) or [Bibliogram](https://git.sr.ht/~cadence/bibliogram), *Lingva* scrapes through GTranslate and retrieves the translation without using any Google-related service, preventing them from tracking.

For this purpose, *Lingva* is built, among others, with the following Open Source resources:

+ [TypeScript](https://www.typescriptlang.org/), the JavaScript superset, as the language.
+ [React](https://reactjs.org/) as the main front-end framework.
+ [Next.js](https://nextjs.org/) as the complementary React framework, that provides Server-Side Rendering, Static Site Generation or serverless API endpoints.
+ [ChakraUI](https://chakra-ui.com/) for the in-component styling.
+ [Jest](https://jestjs.io/), [Testing Library](https://testing-library.com/) & [Cypress](https://www.cypress.io/) for unit, integration & E2E testing.
+ [Apollo Server](https://www.apollographql.com/docs/apollo-server/) for handling the GraphQL endpoint.
+ [Inkscape](https://inkscape.org/) for designing both the logo and the banner.


## Deployment

As *Lingva* is a [Next.js](https://nextjs.org/) project you can deploy your own instance anywhere Next is supported.

The only requirement is to set an environment variable called `NEXT_PUBLIC_SITE_DOMAIN` with the domain you're deploying the instance under. This is used for the canonical URL and the meta tags.

Optionally, there's another environment variable available called `DEFAULT_DARK_THEME` for selecting dark as the default page theme on the first load. The theme will be light by default unless this variable is set to `true`.

### Docker

An [official Docker image](https://hub.docker.com/r/thedaviddelta/lingva-translate) is available to ease the deployment using Compose, Kubernetes or similar technologies. Remember to also include the environment variables (simplified to `site_domain` and `dark_theme`) when running the container.

#### Docker Compose:

```
version: '3'

services:

  lingva:
    container_name: lingva
    image: thedaviddelta/lingva-translate:latest
    restart: unless-stopped
    environment:
      - site_domain=lingva.ml
      - dark_theme=false
      - default_source_lang=auto
      - default_target_lang=en
    ports:
      - 3000:3000
```

#### Docker Run

```bash
docker run -p 3000:3000 -e site_domain=lingva.ml -e dark_theme=false -e default_source_lang=auto -e default_target_lang=en thedaviddelta/lingva-translate:latest
```

### Vercel

Another easy way is to use the Next.js creators' own platform, [Vercel](https://vercel.com/), where you can deploy it for free with the following button.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https%3A%2F%2Fgithub.com%2FTheDavidDelta%2Flingva-translate%2Ftree%2Fmain&env=NEXT_PUBLIC_SITE_DOMAIN&envDescription=Your%20domain&utm_source=lingva-team&utm_campaign=oss)


## Instances

These are the currently known *Lingva* instances. Feel free to make a Pull Request including yours (please remember to add `[skip ci]` to the last commit).

| Domain                                                              | Hosting                                   | SSL Provider                                                                                 |
|:-------------------------------------------------------------------:|:-----------------------------------------:|:--------------------------------------------------------------------------------------------:|
| [lingva.ml](https://lingva.ml/) (Official)                          | [Vercel](https://vercel.com/)             | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=lingva.ml)                    |
| [translate.alefvanoon.xyz](https://translate.alefvanoon.xyz)        | [Vercel](https://vercel.com/)             | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=translate.alefvanoon.xyz)     |
| [translate.igna.rocks](https://translate.igna.rocks)                | [Vercel](https://vercel.com/)             | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=translate.igna.rocks)         |
| [lingva.pussthecat.org](https://lingva.pussthecat.org)              | [Hetzner](https://hetzner.com/)           | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=lingva.pussthecat.org)        |
| [translate.datatunnel.xyz](https://translate.datatunnel.xyz)        | [Hetzner](https://hetzner.com/)           | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=translate.datatunnel.xyz)     |
| [lingva.esmailelbob.xyz](https://lingva.esmailelbob.xyz/)           | [Kimsufi](https://kimsufi.com/)           | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=lingva.esmailelbob.xyz)       |
| [translate.plausibility.cloud](https://translate.plausibiity.cloud) | [Hetzner](https://hetzner.com/)           | [Let's Encrypt](https://www.ssllabs.com/ssltest/analyze.html?d=translate.plausibility.cloud) |

## Public APIs

Nearly all the *Lingva* instances should supply a pair of public developer APIs: a RESTful one and a GraphQL one.

*Note: both APIs return the translation audio as a `Uint8Array` (served as `number[]` in JSON and `[Int]` in GraphQL) with the contents of the audio buffer.*

### REST API v1

+ GET `/api/v1/:source/:target/:query`
```typescript
{
    translation: string
}
```

+ GET `/api/v1/audio/:lang/:query`
```typescript
{
    audio: number[]
}
```

+ GET `/api/v1/languages/?:(source|target)`
```typescript
{
    languages: [
        {
            code: string,
            name: string
        }
    ]
}
```

In addition, every endpoint can return an error message with the following structure instead.
```typescript
{
    error: string
}
```

### GraphQL API

+ `/api/graphql`
```graphql
query {
    translation(source: String target: String query: String!) {
        source: {
            lang: {
                code: String!
                name: String!
            }
            text: String!
            audio: [Int]!
        }
        target: {
            lang: {
                code: String!
                name: String!
            }
            text: String!
            audio: [Int]!
        }
    }
    audio(lang: String! query: String!) {
        lang: {
            code: String!
            name: String!
        }
        text: String!
        audio: [Int]!
    }
    languages(type: SOURCE|TARGET) {
        code: String!
        name: String!
    }
}
```


## Related projects

+ [SimplyTranslate](https://sr.ht/~metalune/SimplyTranslate/) - Very simple translation front-end with multi-engine support
+ [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) - FOSS translation service that uses the open [Argos](https://github.com/argosopentech/argos-translate) engine
+ [Lentil for Android](https://github.com/yaxarat/lingvaandroid) - Unofficial native client for Android that uses Lingva's public API


## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://thedaviddelta.com/"><img src="https://avatars.githubusercontent.com/u/6679900?v=4?s=100" width="100px;" alt=""/><br /><sub><b>David</b></sub></a><br /><a href="#a11y-TheDavidDelta" title="Accessibility">️️️️♿️</a> <a href="https://github.com/TheDavidDelta/lingva-translate/commits?author=TheDavidDelta" title="Code">💻</a> <a href="https://github.com/TheDavidDelta/lingva-translate/commits?author=TheDavidDelta" title="Documentation">📖</a> <a href="#design-TheDavidDelta" title="Design">🎨</a> <a href="https://github.com/TheDavidDelta/lingva-translate/commits?author=TheDavidDelta" title="Tests">⚠️</a></td>
    <td align="center"><a href="https://github.com/mhmdanas"><img src="https://avatars.githubusercontent.com/u/32234660?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Mohammed Anas</b></sub></a><br /><a href="https://github.com/TheDavidDelta/lingva-translate/commits?author=mhmdanas" title="Code">💻</a></td>
    <td align="center"><a href="https://PussTheCat.org/"><img src="https://avatars.githubusercontent.com/u/47571719?v=4?s=100" width="100px;" alt=""/><br /><sub><b>TheFrenchGhosty</b></sub></a><br /><a href="https://github.com/TheDavidDelta/lingva-translate/commits?author=TheFrenchGhosty" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!


## License

[![](https://www.gnu.org/graphics/agplv3-with-text-162x68.png)](https://www.gnu.org/licenses/agpl-3.0.html)

Copyright © 2021 [TheDavidDelta](https://github.com/TheDavidDelta) & contributors.  
This project is [GNU AGPLv3](./LICENSE) licensed.
