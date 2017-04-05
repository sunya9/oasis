# oasis

[![Build Status](https://travis-ci.org/sunya9/oasis.svg?branch=master)](https://travis-ci.org/sunya9/oasis)

WIP.

This project was inspired by [mookjp/pool](https://github.com/mookjp/pool).

## Requirement

* Docker
* Git repository that have Dockerfile at project root.

## Usage

* `docker run -e GITHUB=<owner>/<repository> -d -p 5121:5121 sunya9/oasis`

### Environment variables

* `PORT`: oasis port(default: 5121).
* `GITHUB`: target preview repository(`<owner>/<repository>`).
* `TOKEN`: require token for private repository.

## Optional

* Putting `.oasis.env`  to root of target repository, it is able to determine oasis behavior.

### `.oasis.env` example

```
OASIS_PORT=3000
```

#### `.oasis.env` environment variables

* `OASIS_PORT`: Published main port that your contaienr

## Development
* Node.js >= 7.7


