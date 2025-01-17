import * as vscode from 'vscode';
import { DevToolsExtensionContext } from "../devToolsExtensionContext";
import { TextRange } from '../symbollibraries/textRange';
import { WorkspaceCommandSyntaxModifier } from './workspaceCommandSyntaxModifier';

export class OnDocumentSaveModifier extends WorkspaceCommandSyntaxModifier {
    protected _commandsList: string | undefined;

    constructor(context: DevToolsExtensionContext) {
        super(context, "Run Multiple Commands", "runMultiple");
        this._showProgress = false;
        this._context = context;
        this._commandsList = undefined;
    }

    private getCommandsList(uri: vscode.Uri) {
        this._commandsList = '';
        let actionsList = vscode.workspace.getConfiguration('alOutline', uri).get<string[]>('codeActionsOnSave');
        if ((actionsList) && (actionsList.length > 0)) {
            for (let i=0; i<actionsList.length; i++) {
                let name = actionsList[i];
                name = name.substring(0,1).toLowerCase() + name.substring(1);
                if (i > 0)
                    this._commandsList = this._commandsList + ',' + name;
                else
                    this._commandsList = name;
            }
        }
    }

    protected getParameters(uri: vscode.Uri): any {
        return {
            commandsList: this._commandsList,
            skipFormatting: 'true'
        }
    }

    async runForDocument(document: vscode.TextDocument, range: TextRange | undefined, withUI: boolean) {
        this.getCommandsList(document.uri);
        if ((this._commandsList) && (this._commandsList != ''))
            await super.runForDocument(document, range, withUI);
    }
}