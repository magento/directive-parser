# PWA Studio Directive Parser

[![CircleCI](https://circleci.com/gh/magento-research/directive-parser.svg?style=svg&circle-token=07b4a55f82851cfbde23aa606a61028b403bdf13)](https://circleci.com/gh/magento-research/directive-parser)

A _Directive_ in Magento PWA Studio is an inline comment within a source file that signals additional metadata that should be processed by the PWA Studio tooling.

If you're a user of Magento PWA Studio, it's unlikely you're looking to depend on this package directly. The primary use-case for this library is to be consumed by other PWA Studio tools.

## Install

```sh
npm install @magento/directive-parser
```

## Usage

```js
const Parser = require('@magento/directive-parser');
const { ast } = new Parser(directiveString).parse();
```

## Example Directive (Kitchen Sink)

```js
/**
 * @RootComponent
 * pageTypes = some_page, some_other_page
 * description = "Some description here"
 */
```

## AST Format

Documentation unfinished. For now, see the snapshots tests in `src/__tests__/__snapshots__`
