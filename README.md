MoovCheckout Workbench
---

Made by [@pt-br](https://github.com/pt-br)

Thanks to [William Lima](https://github.com/williammustaffa) and [Douglas Hipolito](https://github.com/douglashipolito) for the support.

What is this tool?
---
Workbench is an UI tool to work on [MoovCheckout](http://www.moovweb.com/moovcheckout/).

Feel free to check out some [Screenshots](http://imgur.com/a/cqV6W).

Features
---
- Disable Actions from original site (Disable <a>, inputs and buttons)
- Get Selector by click
- Map and Export widgets

Dependencies
---
To use Workbench, you'll need the following tools:
 - [Node.js](http://www.liquidweb.com/kb/how-to-install-node-js-via-nvm-node-version-manager-on-ubuntu-14-04-lts/)
 - [MoovCheckout Script Loader](https://github.com/intelimen/moovweb/tree/moovcheckout/tools/mc-loader)
 - Permission to clone [moovcheckout-research](https://github.com/moovweb/moovcheckout-research) repository.

Installation
---

- Install [Node.js](http://www.liquidweb.com/kb/how-to-install-node-js-via-nvm-node-version-manager-on-ubuntu-14-04-lts/) (if you already have Node.js, just ignore this step).
- Install and configure [MoovCheckout Script Loader](https://github.com/intelimen/moovweb/tree/moovcheckout/tools/mc-loader) (installation instructions inside of its repository).

- Clone [moovcheckout-research](https://github.com/moovweb/moovcheckout-research).

- Clone [MoovCheckout Workbench](https://github.com/pt-br/mc-workbench) - Be sure to have write permissions on the folder you are cloning it.

- Open the folder you cloned [MoovCheckout Workbench](https://github.com/pt-br/mc-workbench) into, and edit the file `server.js`.

- Search for a variable called `widgetListBasePath`, you'll have to change its value to match the folder you cloned [moovcheckout-research](https://github.com/moovweb/moovcheckout-research) into. There's a comment on `server.js` file explaning how the value should look.

- Open the folder you cloned [MoovCheckout Workbench](https://github.com/pt-br/mc-workbench) on a terminal and run
`npm install`

- Once your `server.js` is modified to track your [moovcheckout-research](https://github.com/moovweb/moovcheckout-research) local repository, be sure to mark it as `assume-unchanged`, so, git will "ignore" your change to `server.js`. To set this configuration, just run:

`git update-index --assume-unchanged server.js` (on mc-workbench folder)

- Done!

Using the Workbench
---
- Open the folder you cloned [MoovCheckout Workbench](https://github.com/pt-br/mc-workbench) on a terminal and run
`npm start` everytime you need to start Workbench. (It will run a Node.js server, so you can leave it opened while you are working between projects)

- Start your `dev-server` from MoovCheckout normally.

- Open [MoovCheckout Script Loader](https://github.com/intelimen/moovweb/tree/moovcheckout/tools/mc-loader) on your browser and active the option 'Inject Workbench'.

- If you are having troubles to see the Workbench, check the `console` logs and be sure to accept the `SSL certificate`.

Developing new Features
---
When developing new features, be aware to create a new branch. When the feature is ready, open a pull request to `moovcheckout` branch.

If you need to make some improvement to `server.js`, just undo the `assume-unchanged` configuration by running:

`git update-index --no-assume-unchanged server.js`



