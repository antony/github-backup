## Github Backup

A tool to backup all of your organisation's github repositories.

[![CircleCI](https://circleci.com/gh/antony/github-backup.svg?style=shield)](https://circleci.com/gh/antony/github-backup) [![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

### Why?

There are a lot of tools out in the wild for the same purpose, but not a single one of them works reliably or paginates a large organisation, so you get the first 50-100 repositories and then you have to edit the code to get more...

### Pre-requisites

You [need a github token](https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line/) if you want to backup private repositories. it needs repo permissions.

### Usage

Just install the package locally and run the binary it provides:

```bash
npm i -g gh-backup
github-backup --token <your-token-from-above> --organisation <organisation> --workingDir=./some/path
```

Where:

* `token` is your github token (optional)
* `organisation` is your organisation name
* `workingDir` is where you want the repositories cloned to. If it does not exist it will be created.
