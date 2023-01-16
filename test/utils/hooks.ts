import {
  configure,
  setupBrowser,
  WebdriverIOQueries,
  WebdriverIOQueriesChainable,
} from '@testing-library/webdriverio';
import * as mocha from 'mocha';
import { remote } from 'webdriverio';

declare global {
  interface Window {
    result: unknown;
  }

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace WebdriverIO {
    interface Browser
      extends WebdriverIOQueries,
        WebdriverIOQueriesChainable<Browser> {
      openKeeperPopup: () => Promise<void>;
    }

    interface Element
      extends WebdriverIOQueries,
        WebdriverIOQueriesChainable<Element> {}
  }
}

declare module 'webdriverio' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ChainablePromiseElement<T extends WebdriverIO.Element | undefined>
    extends WebdriverIOQueriesChainable<T> {}
}

declare module 'mocha' {
  interface Context {
    nodeUrl: string;
  }
}

export const mochaHooks = () => ({
  async beforeAll(this: mocha.Context) {
    this.nodeUrl = 'http://waves-private-node:6869';

    const browser = await remote({
      logLevel: 'silent',
      capabilities: {
        browserName: 'chrome',
        'goog:chromeOptions': {
          args: ['--load-extension=/app/dist/chrome', '--disable-web-security'],
        },
        pageLoadStrategy: 'eager',
      },
      path: '/wd/hub',
      waitforTimeout: 15 * 1000,
    });

    Object.defineProperty(global, 'browser', {
      configurable: true,
      value: browser,
    });

    configure({
      asyncUtilTimeout: 15 * 1000,
    });

    setupBrowser(browser);

    global.$ = browser.$.bind(browser);
    global.$$ = browser.$$.bind(browser);

    await browser.navigateTo('chrome://system');

    let keeperExtensionId: string | undefined;

    const extensionsValue = await $('#extensions-value').getText();
    for (const ext of extensionsValue.split('\n')) {
      const [id, name] = ext.split(' : ');

      if (name.toLowerCase() === 'keeper wallet') {
        keeperExtensionId = id;
        break;
      }
    }

    if (!keeperExtensionId) {
      throw new Error('Could not find Keeper Wallet extension id');
    }

    // default clearValue doesn't produce input event for some reason ¯\_(ツ)_/¯
    // https://github.com/webdriverio/webdriverio/issues/5869#issuecomment-964012560
    browser.overwriteCommand(
      'clearValue',
      async function (this: WebdriverIO.Element) {
        // https://w3c.github.io/webdriver/#keyboard-actions
        await this.elementSendKeys(this.elementId, '\uE009a'); // Ctrl+a
        await this.elementSendKeys(this.elementId, '\uE003'); // Backspace
      },
      true
    );

    browser.addCommand(
      'openKeeperPopup',
      async function (this: WebdriverIO.Browser) {
        await this.navigateTo(
          `chrome-extension://${keeperExtensionId}/popup.html`
        );
      }
    );
  },

  async afterAll(this: mocha.Context) {
    if (typeof browser !== 'undefined') {
      browser.deleteSession();
    }
  },
});
