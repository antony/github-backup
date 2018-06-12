#!/usr/bin/env node

'use strict'

const ora = require('ora')
const ghGot = require('gh-got')
const simpleGit = require('simple-git')
const argv = require('minimist')(process.argv.slice(2))
const Multispinner = require('multispinner')
const { dots } = require('cli-spinners/spinners.json')
const { Promise, promisify } = require('bluebird')
const { assert } = require('hoek')
const mkdirp = require('mkdirp')

const { workingDir, organisation, token } = argv

assert(workingDir, '--workingDir is required')
assert(organisation, '--organisation is required')

function findLink (links, type) {
  const nextLink = links.find(l => l.includes(`rel="${type}"`))
  if (!nextLink) { return null }
  return nextLink.match(/page=([0-9]+)/)[1]
}

async function fetchPage (page) {
  const options = token ? { token } : {}
  const res = await ghGot(`orgs/${organisation}/repos?page=${page}`, options)

  const links = res.headers.link.split(',')
  const nextPage = findLink(links, 'next')
  const repos = res.body.map(repo => ({
    url: repo.ssh_url,
    name: repo.name
  }))

  return { nextPage, repos }
}

async function init () {
  await createEnv()
  const git = simpleGit(workingDir)
  let list = []
  let nextPage = 1
  const spinner = ora('Finding repositories').start()

  while (nextPage) {
    const result = await fetchPage(nextPage)
    const repos = result.repos.map(repo => {
      spinner.text = `Found ${list.length} repositories`
      return repo
    })
    list = [].concat(list, repos)
    nextPage = result.nextPage
  }
  spinner.succeed(`Found ${list.length} repositories`)

  const multispinner = new Multispinner(list.map(l => l.name), {
    preText: 'Cloning',
    interval: dots.interval,
    frames: dots.frames
  })

  await Promise.map(list, async repo => {
    try {
      const clone = promisify(git.clone, { context: git })
      await clone(repo.url)
      multispinner.success(repo.name)
    } catch (e) {
      multispinner.error(repo.name)
    }
  }, { concurrency: 10 })

  console.info('Finished')
}

async function createEnv () {
  const mkdirPrms = promisify(mkdirp)
  await mkdirPrms(workingDir)
}

init()
