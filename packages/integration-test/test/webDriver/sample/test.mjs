import { expect } from 'expect';
import { afterEach, beforeEach, it } from 'mocha';
import { Browser, Builder } from 'selenium-webdriver';

/** @type {import("selenium-webdriver").WebDriver} */
let driver;

beforeEach(async () => {
  driver = await new Builder().forBrowser(Browser.CHROME).usingServer('http://localhost:4444/wd/hub').build();
});

afterEach(() => driver?.quit());

it('should work', async () => {
  await driver.get('http://web/test/sample/');

  // @ts-expect-error
  await driver.executeAsyncScript(done =>
    document.readyState === 'loading' ? window.addEventListener('DOMContentLoaded', done) : done()
  );

  await expect(driver.executeScript(() => document.querySelector('h1')?.textContent)).resolves.toEqual('Hello, World!');
});