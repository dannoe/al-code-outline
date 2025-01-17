import * as vscode from 'vscode';
import { DevToolsExtensionContext } from "../devToolsExtensionContext";
import { AZSymbolInformation } from '../symbollibraries/azSymbolInformation';
import { TextRange } from '../symbollibraries/textRange';
import { TextEditorHelper } from '../tools/textEditorHelper';
import { ISyntaxModifierResult } from './iSntaxModifierResult';

export class SyntaxModifier {
    protected _context: DevToolsExtensionContext;
    protected _showProgress: boolean;
    protected _progressMessage: string;
    name: string;
    modifiedFilesOnly: boolean;

    constructor(context: DevToolsExtensionContext, newName: string) {
        this._context = context;
        this._showProgress = true;
        this._progressMessage = "Processing project files. Please wait...";
        this.name = newName;
        this.modifiedFilesOnly = false;
    }

    async runForWorkspace() {
        let confirmation = await this.confirmRunForWorkspace();
        if (!confirmation)
            return;

        let workspaceUri = TextEditorHelper.getActiveWorkspaceFolderUri();
        vscode.workspace.saveAll();
        if (!workspaceUri)
            return;

        let cont = await this.askForParameters(workspaceUri);
        if (!cont) {
            vscode.window.showInformationMessage("Command cancelled");
            return;
        }

        let result = await this.runForWorkspaceWithoutUI(workspaceUri);

        if ((result) && (result.message)) {
            if (result.success)
                vscode.window.showInformationMessage(result.message);
            else
                vscode.window.showErrorMessage(result.message);
        }
    }

    async runForWorkspaceWithoutUI(workspaceUri: vscode.Uri): Promise<ISyntaxModifierResult | undefined> {
        return undefined;
    }

    protected async confirmRunForWorkspace(): Promise<boolean> {
        let confirmation = await vscode.window.showInformationMessage(
            'Do you want to run this command for all files in the current project folder?',
            'Yes', 'No');
        return (confirmation === 'Yes');
    }

    protected getParameters(uri: vscode.Uri): any {
        let values: any = {};
        if (this.modifiedFilesOnly)
            values.modifiedFilesOnly = true;
        return values;
    }

    async runForActiveEditor() {
        if (!vscode.window.activeTextEditor)
            return;
        await this.runForDocument(vscode.window.activeTextEditor.document, undefined, true);
    }

    async runForDocumentSymbol(document: vscode.TextDocument, symbol: AZSymbolInformation, withUI: boolean) {
        await this.runForDocument(document, symbol.range, withUI);
    }

    async runForDocument(document: vscode.TextDocument, range: TextRange | undefined, withUI: boolean) {
        let text = document.getText();

        if (!text)
            return;

        let workspaceUri = TextEditorHelper.getActiveWorkspaceFolderUri();
        if ((!workspaceUri) || (!document.uri) || (!document.uri.fsPath))
            return;

        let cont = await this.askForParameters(document.uri);
        if (!cont) {
            vscode.window.showInformationMessage("Command cancelled");
            return;
        }

        let result = await this.runForDocumentWithoutUI(text, workspaceUri, document.uri, range);

        if (result) {
            if (!result.success) {
                if ((withUI) && (result.message))
                    vscode.window.showErrorMessage(result.message);
            } else {
                if ((result.source) && (result.source != text)) {
                    text = result.source;
                    const edit = new vscode.WorkspaceEdit();
                    var firstLine = document.lineAt(0);
                    var lastLine = document.lineAt(document.lineCount - 1);
                    var textRange = new vscode.Range(0,
                        firstLine.range.start.character,
                        document.lineCount - 1,
                        lastLine.range.end.character);
                    edit.replace(document.uri, textRange, text);
                    await vscode.workspace.applyEdit(edit);
                }
                if ((withUI) && (result.message))
                    vscode.window.showInformationMessage(result.message);
            }
        } else if (withUI)
            vscode.window.showInformationMessage('There was nothing to change.');
    }

    protected loadDefaultParameters(uri: vscode.Uri | undefined): boolean {
        return false;
    }

    async runForDocumentWithoutUI(text: string, workspaceUri: vscode.Uri, documentUri: vscode.Uri, range: TextRange | undefined): Promise<ISyntaxModifierResult | undefined> {
        return undefined;
    }

    async loadDefaultOrAskForParameters(uri: vscode.Uri | undefined): Promise<boolean> {
        if (this.loadDefaultParameters(uri))
            return true;
        return await this.askForParameters(uri);
    }

    async askForParameters(uri: vscode.Uri | undefined): Promise<boolean> {
        return true;
    }

    hideProgress() {
        this._showProgress = false;
    }

}
