import * as vscode from 'vscode';
import { DevToolsExtensionContext } from '../devToolsExtensionContext';
import { ALAddPageFieldsCodeCommand } from './addFields/alAddPageFieldsCodeCommand';
import { ALAddQueryFieldsCodeCommand } from './addFields/alAddQueryFieldsCodeCommand';
import { ALAddReportFieldsCodeCommand } from './addFields/alAddReportFieldsCodeCommand';
import { ALAddXmlPortFieldsCodeCommand } from './addFields/alAddXmlPortFieldsCodeCommand';
import { ALSortProceduresCodeCommand } from './sortSymbols/alSortProceduresCodeCommand';
import { ALSortReportColumnsCommand } from './sortSymbols/alSortReportColumnsCommand';
import { ALSortPropertiesCommand } from './sortSymbols/alSortPropertiesCommand';
import { ALCreateInterfaceCodeCommand } from './alCreateInterfaceCodeCommand';
import { AZDocumentSymbolsLibrary } from '../symbollibraries/azDocumentSymbolsLibrary';
import { ALCodeAction } from './alCodeAction';

export class ALCodeActionsProvider implements vscode.CodeActionProvider {
    protected _toolsExtensionContext : DevToolsExtensionContext;
    protected _codeCommands: ALCodeAction[];

    constructor(context : DevToolsExtensionContext) {
        this._toolsExtensionContext = context;
        this._codeCommands = [
            new ALAddPageFieldsCodeCommand(this._toolsExtensionContext),
            new ALAddQueryFieldsCodeCommand(this._toolsExtensionContext),
            new ALAddReportFieldsCodeCommand(this._toolsExtensionContext),
            new ALAddXmlPortFieldsCodeCommand(this._toolsExtensionContext, 'fieldelement', 'Add multiple field elements'),
            new ALAddXmlPortFieldsCodeCommand(this._toolsExtensionContext, 'fieldattribute', 'Add multiple field attributes'),
            new ALSortProceduresCodeCommand(this._toolsExtensionContext),
            new ALSortReportColumnsCommand(this._toolsExtensionContext),
            new ALSortPropertiesCommand(this._toolsExtensionContext),
            new ALCreateInterfaceCodeCommand(this._toolsExtensionContext)];
    }

    provideCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext, token: vscode.CancellationToken): vscode.ProviderResult<(vscode.Command | vscode.CodeAction)[]> {
        return this.collectCodeActions(document,range, context);
    }

    protected async collectCodeActions(document: vscode.TextDocument, range: vscode.Range | vscode.Selection, context: vscode.CodeActionContext): Promise<vscode.CodeAction[]> {
        let actions: vscode.CodeAction[] = []; 

        if (this._toolsExtensionContext.alLangProxy.version.major < 1)
            return actions;

        let docSymbols = await this.getDocumentSymbolsAsync(document);
        let symbol = docSymbols.findSymbolInRange(range);

        for (let i=0; i<this._codeCommands.length; i++) {
            this._codeCommands[i].collectCodeActions(docSymbols, symbol, document, range, context, actions);
        }

        return actions;
    }

    protected async getDocumentSymbolsAsync(document: vscode.TextDocument): Promise<AZDocumentSymbolsLibrary> {
        if ((vscode.window.activeTextEditor) && 
            (vscode.window.activeTextEditor.document) &&
            (vscode.window.activeTextEditor.document.uri.fsPath == document.uri.fsPath)) 
            return this._toolsExtensionContext.activeDocumentSymbols;
        
        //parse document
        let source = document.getText();

        //get document symbols
        let library = new AZDocumentSymbolsLibrary(this._toolsExtensionContext, document.uri, document);
        await library.loadAsync(false);

        return library;
    }

}