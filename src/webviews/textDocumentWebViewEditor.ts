import * as vscode from 'vscode';
import { BaseWebViewEditor } from "./baseWebViewEditor";
import { DevToolsExtensionContext } from '../devToolsExtensionContext';

export class TextDocumentWebViewEditor extends BaseWebViewEditor {
    public document: vscode.TextDocument | undefined;
    protected _devToolsContext: DevToolsExtensionContext; 
    protected _inUpdateMode: boolean;

    constructor(devToolsContext : DevToolsExtensionContext, title : string | undefined) {
        super(devToolsContext.vscodeExtensionContext, title);
        this._devToolsContext = devToolsContext;
        this.document = undefined;
        this._inUpdateMode = false;
    }

    public resolveCustomTextEditor(document: vscode.TextDocument, webviewPanel: vscode.WebviewPanel) {
        this.document = document;
        this.attachToWebView(webviewPanel);
        
        //register document events
        this._disposables.push(vscode.workspace.onDidChangeTextDocument(e => {
			if ((this.document) && (e.document.uri.toString() === this.document.uri.toString())) {
                if (!this._inUpdateMode)
				    this.onTextDocumentChanged();
			}
		}));
    }

    protected onTextDocumentChanged() {
    }

    protected async updateTextDocument(newText: string): Promise<boolean> {
        let success: boolean = true;
        if (this.document) {
            const edit = new vscode.WorkspaceEdit();

            // Just replace the entire document every time for this example extension.
            // A more complete extension should compute minimal edits instead.
            edit.replace(
                this.document.uri,
                new vscode.Range(0, 0, this.document.lineCount, 0),
                newText);
            
            this._inUpdateMode = true;
            success = await vscode.workspace.applyEdit(edit);
            this._inUpdateMode = false;
        }
        return success;
    }

    protected getTextDocumentAsJson(withError: boolean): any {
        if (!this.document)
            return undefined;
        
        const text = this.document.getText();
		if (text.trim().length === 0)
			return {};
		try {
			return JSON.parse(text);
		} catch {
            if (withError)
                throw new Error('Could not get document as json. Content is not valid json');
        }
        return {};
    }
 
    protected updateTextDocumentFromJson(json: any) {
        this.updateTextDocument(JSON.stringify(json, null, 2));
    }

}