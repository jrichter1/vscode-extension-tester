import { expect } from 'chai';
import { EditorView, TitleBar } from 'vscode-extension-tester';

describe('EditorView', () => {
    let view: EditorView;

    before(async function() {
        this.timeout(3000);
        view = new EditorView();
        await new TitleBar().select('File', 'New File');
        await new TitleBar().select('File', 'New File');
        await new Promise((res) => { setTimeout(res, 1000); });
    });

    after(async () => {
        await view.closeAllEditors();
    });

    it('openEditor works', async () => {
        const editor = await view.openEditor('Untitled-1');
        expect(editor.getTitle()).equals('Untitled-1');
    });

    it('getOpenEditorTitles works', async () => {
        const tabs = await view.getOpenEditorTitles();
        expect(tabs).not.empty;
        expect(tabs).contains('Untitled-1');
        expect(tabs).contains('Untitled-2');
    });

    it('closeEditor works', async () => {
        await view.closeEditor('Untitled-1');
        const tabs = await view.getOpenEditorTitles();
        expect(tabs).not.contains('Untitled-1');
    });
});