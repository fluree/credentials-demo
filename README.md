This project was built using [Fluree's blockchain-backed graph database](https://docs.flur.ee/).

## Introduction

The repo is built around the idea of identity & credentials management, specifically the scenario of validating university transcript records in a way that is secure, confidential, and tamper-proof.

It contains a lightweight React app that will help with visualizing some of Fluree's native data-tracing capabilities. In order to use the app, you'll need to first be running a local instance of a Fluree database. You can [download the latest version of Fluree for free here](https://fluree-releases-public.s3.amazonaws.com/fluree-latest.zip), and you can [read our documentation for starting a local instance of a Fluree database here](https://docs.flur.ee/docs/getting-started/installation).

We've also [uploaded a video](https://www.youtube.com/watch?v=OD20o-3RZk4), explaining the use case for the app and providing a walkthrough of the app within that particular use case.

### Starting your Fluree database instance

In order to use the app, you'll first need to have a local instance of Fluree running. You can do that by navigating to the directory where you downloaded Fluree and running `./fluree_start.sh` (on a Mac or Linux system -- for a Windows system, you'll have to download a Bash emulator such as [Git for Windows](https://gitforwindows.org/))

### Starting the React app

Begin by executing `npm install` in the project directory to locally install the project's dependencies.

As long as you followed to above step to run a local instance of Fluree, the app will proceed to bootstrap its own database schema and seed data upon mounting. Simply run `npm start` to locally serve the React app to [http://localhost:3000](http://localhost:3000) and open it in your browser.
