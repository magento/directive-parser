# PWA Studio Directive Parser

[![CircleCI](https://circleci.com/gh/magento-research/directive-parser.svg?style=svg&circle-token=07b4a55f82851cfbde23aa606a61028b403bdf13)](https://circleci.com/gh/magento-research/directive-parser)

A _Directive_ in Magento PWA Studio is an inline comment within a source file that signals additional metadata that should be processed by the PWA Studio tooling.

If you're a user of Magento PWA Studio, it's unlikely you're looking to depend on this package directly. The primary use-case for this library is to be consumed by other PWA Studio tools.

## Goals

The primary goals of this project are:

* Parse all JavaScript comments within a source file, and return descriptors for every comment that conforms to the Magento Directive syntax
* Run significantly faster than a parser that parses the entire ECMAScript grammar
* Provide actionable warnings/errors with location info

## Install

```sh
npm install @magento/directive-parser
```

## Usage

```js
const parseDirectives = require('@magento/directive-parser');
const { directives, errors } = parseDirectives(someSourceFileString);
```

## Example Directive (Kitchen Sink)

```js
/**
 * @RootComponent
 * pageTypes = some_page, some_other_page
 * description = "Some description here"
 */
```
