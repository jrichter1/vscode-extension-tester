'use strict';

import { CodeUtil, ReleaseQuality } from './util/codeUtil';
import { DriverUtil } from './util/driverUtil';
import * as fs from 'fs-extra';
import * as path from 'path';

export { MochaOptions } from 'mocha';
export * from 'monaco-page-objects';

/**
 * VSCode Extension Tester
 */
export class ExTester {
    private code: CodeUtil;
    private chrome: DriverUtil;

    constructor(storageFolder: string = 'test-resources', extensionsDir?: string) {
        this.code = new CodeUtil(storageFolder, extensionsDir);
        this.chrome = new DriverUtil(storageFolder);
    }

    /**
     * Download VSCode of given version and release quality stream
     * @param version version to download, default latest
     * @param quality quality stream, only acceptable values are 'stable' and 'insider', default stable
     */
    async downloadCode(version: string = 'latest', quality: string = 'stable'): Promise<void> {
        const quality1 = quality === 'insider' ? ReleaseQuality.Insider : ReleaseQuality.Stable;

        return this.code.downloadVSCode(version, quality1);
    }

    /**
     * Install the extension into the test instance of VS Code
     * @param vsixFile path to extension .vsix file. If not set, default vsce path will be used
     * @param useYarn when true run `vsce package` with the `--yarn` flag
     */
    installVsix({vsixFile, useYarn}: {vsixFile?: string, useYarn?: boolean} = {}): void {
        if (!vsixFile) {
            this.code.packageExtension(useYarn);
        } else if (!fs.existsSync(vsixFile)) {
            throw new Error(`File ${vsixFile} does not exist`);
        }
        return this.code.installExtension(vsixFile);
    }

    /**
     * Download the matching chromedriver for a given VS Code version
     * @param vscodeVersion selected versio nof VSCode, default latest
     * @param vscodeStream VSCode release stream, default stable
     */
    async downloadChromeDriver(vscodeVersion: string = 'latest', vscodeStream: string = 'stable'): Promise<void> {
        const quality = vscodeStream === 'insider' ? ReleaseQuality.Insider : ReleaseQuality.Stable;
        const chromiumVersion = await this.code.getChromiumVersion(vscodeVersion, quality);
        await this.chrome.downloadChromeDriverForChromiumVersion(chromiumVersion);
    }

    /**
     * Performs all necessary setup: getting VSCode + ChromeDriver 
     * and packaging/installing extension into the test instance
     * 
     * @param vscodeVersion version of VSCode to test against, default latest
     * @param vscodeStream whether to use stable or insiders build, default stable
     * @param useYarn when true run `vsce package` with the `--yarn` flag
     */
    async setupRequirements(vscodeVersion: string = 'latest', vscodeStream: string = 'stable', useYarn?: boolean): Promise<void> {
        const quality = vscodeStream === 'insider' ? ReleaseQuality.Insider : ReleaseQuality.Stable;
        await this.downloadCode(vscodeVersion, quality);
        await this.downloadChromeDriver(vscodeVersion, vscodeStream);
        this.installVsix({useYarn});
    }

    /**
     * Performs requirements setup and runs extension tests
     * 
     * @param vscodeVersion version of VSCode to test against, default latest
     * @param vscodeStream whether to use stable or insiders build, default stable
     * @param testFilesPattern glob pattern for test files to run
     * @param settings path to a custom vscode settings json file
     * @param useYarn when true run `vsce package` with the `--yarn` flag
     * @param cleanup true to uninstall the tested extension after the run, false otherwise
     */
    async setupAndRunTests(vscodeVersion: string = 'latest', vscodeStream: string = 'stable', testFilesPattern: string, settings: string = '', useYarn?: boolean, cleanup?: boolean, config?: string): Promise<void> {
        await this.setupRequirements(vscodeVersion, vscodeStream, useYarn);
        await this.runTests(testFilesPattern, vscodeVersion, vscodeStream, settings, cleanup, config);
    }

    /**
     * Runs the selected test files in VS Code using mocha and webdriver
     * @param testFilesPattern glob pattern for selected test files
     * @param vscodeStream whether to use stable or insiders build, default stable
     * @param settings path to a custom vscode settings json file
     * @param vscodeVersion version of VSCode to test against, default latest
     * @param cleanup true to uninstall the tested extension after the run, false otherwise
     */
    async runTests(testFilesPattern: string, vscodeVersion: string = 'latest', vscodeStream: string = 'stable', settings: string = '', cleanup?: boolean, config?: string): Promise<void> {
        this.installVsix({ vsixFile: path.join(__dirname, '..', 'resources', 'api-handler.vsix')});
        let stream = ReleaseQuality.Stable;
        if (vscodeStream === 'insider') {
            stream = ReleaseQuality.Insider;
        }
        await this.code.runTests(testFilesPattern, vscodeVersion, stream, settings, cleanup, config);
    }
}