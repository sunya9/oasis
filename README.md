<div style="text-align: center">
<img src="https://github.com/sunya9/oasis/wiki/oasis.png" alt="oasis" width="128" height="128">
</div>
# oasis

[![Build Status](https://travis-ci.org/sunya9/oasis.svg?branch=master)](https://travis-ci.org/sunya9/oasis)

WIP.

This project was inspired by [mookjp/pool](https://github.com/mookjp/pool).

## Requirements

* Docker
* Git repository that have Dockerfile at project root.

## Usage[WIP]

```sh
$ docker run -e PROVIDER_TOKEN=<YOUR_TOKEN> -e REPO=<owner>/<repository> -e TARGET_PORT=3000 -d -p 5121:5121 sunya/oasis
```

### Environment variables

\* required.

* `PORT`: oasis port.
* `HOST`*: Your server domain.
* `PROVIDER`*: Git hosting services. choose one among the below:
  * `github`
* `REPO`*: target preview repository(`<owner>/<repository>`).
* `PROVIDER_TOKEN`: Require token if you preview private repository.
* `TARGET_PORT`(WIP): Your project's port. oasis predicts port number from inspect command. Rrequire this variables if you use Docker Compose.

## Development
* Node.js >= 7.7


