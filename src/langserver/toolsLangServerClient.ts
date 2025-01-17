'use strict';

import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as rpc from 'vscode-jsonrpc';
import { ToolsDocumentSymbolsRequest } from './toolsDocumentSymbolsRequest';
import { ToolsDocumentSymbolsResponse } from './toolsDocumentSymbolsResponse';
import { ToolsPackageSymbolsRequest } from './toolsPackageSymbolsRequest';
import { ToolsPackageSymbolsResponse } from './toolsPackageSymbolsResponse';
import { ToolsProjectSymbolsRequest } from './toolsProjectSymbolsRequest';
import { ToolsProjectSymbolsResponse } from './toolsProjectSymbolsResponse';
import { ToolsLibrarySymbolsDetailsRequest } from './toolsLibrarySymbolsDetailsRequest';
import { ToolsLibrarySymbolsDetailsResponse } from './toolsLibrarySymbolsDetailsResponse';
import { ToolsCloseSymbolsLibraryRequest } from './toolsCloseSymbolsLibraryRequest';
import { ToolsGetSyntaxTreeRequest } from './toolsGetSyntaxTreeRequest';
import { ToolsGetSyntaxTreeResponse } from './toolsGetSyntaxTreeResponse';
import { ToolsGetSyntaxTreeSymbolResponse } from './toolsGetSyntaxTreeSymbolResponse';
import { ToolsGetSyntaxTreeSymbolsRequest } from './toolsGetSyntaxTreeSymbolRequest';
import { ToolsCloseSyntaxTreeRequest } from './toolsCloseSyntaxTreeRequest';
import { ToolsGetCodeAnalyzersRulesRequest } from './toolsGetCodeAnalyzersRulesRequest';
import { ToolsGetCodeAnalyzersRulesResponse } from './toolsGetCodeAnalyzersRulesResponse';
import { ToolsGetFullSyntaxTreeRequest } from './toolsGetFullSyntaxTreeRequest';
import { ToolsGetFullSyntaxTreeResponse } from './toolsGetFullSyntaxTreeResponse';
import { ALFullSyntaxTreeHelper } from '../symbollibraries/alFullSyntaxTreeHelper';
import { ToolsWorkspaceCommandRequest } from './toolsWorkspaceCommandRequest';
import { ToolsWorkspaceCommandResponse } from './toolsWorkspaceCommandResponse';
import { Version } from '../tools/version';
import { ToolsWorkspaceFoldersChangeRequest } from './toolsWorkspaceFoldersChangeRequest';
import { ToolsDocumentChangeRequest } from './toolsDocumentChangeRequest';
import { ToolsFilesRequest } from './toolsFilesRequest';
import { ToolsFilesRenameRequest } from './toolsFilesRenameRequest';
import { ToolsGetTableFieldsListRequest } from './symbolsinformation/toolsGetTableFieldsListRequest';
import { ToolsSymbolInformationRequest } from './symbolsinformation/toolsSymbolInformationRequest';
import { ToolsGetTablesListResponse } from './symbolsinformation/toolsGetTablesListResponse';
import { ToolsGetCodeunitsListResponse } from './symbolsinformation/toolsGetCodeunitsListResponse';
import { ToolsGetEnumsListResponse } from './symbolsinformation/toolsGetEnumsListResponse';
import { ToolsGetInterfacesListResponse } from './symbolsinformation/toolsGetInterfacesListResponse';
import { ToolsFileSystemFileChangeRequest } from './toolsFileSystemFileChangeRequest';
import { ToolsGetTableFieldsListResponse } from './symbolsinformation/toolsGetTableFieldsListResponse';
import { ToolsGetPageDetailsRequest } from './symbolsinformation/toolsGetPageDetailsRequest';
import { ToolsGetPageDetailsResponse } from './symbolsinformation/toolsGetPageDetailsResponse';
import { ToolsDocumentContentChangeRequest } from './toolsDocumentContentChangeRequest';
import { ToolsDocumentContentChangeResponse } from './toolsDocumentContentChangeResponse';
import { ToolsGetXmlPortTableElementDetailsRequest } from './symbolsinformation/toolsGetXmlPortTableElementDetailsRequest';
import { toolsGetXmlPortTableElementDetailsResponse } from './symbolsinformation/toolsGetXmlPortTableElementDetailsResponse';
import { ToolsGetReportDataItemDetailsRequest } from './symbolsinformation/toolsGetReportDataItemDetailsRequest';
import { ToolsGetReportDataItemDetailsResponse } from './symbolsinformation/toolsGetReportDataItemDetailsResponse';
import { ToolsGetQueryDataItemDetailsRequest } from './symbolsinformation/toolsGetQueryDataItemDetailsRequest';
import { ToolsGetQueryDataItemDetailsResponse } from './symbolsinformation/toolsGetQueryDataItemDetailsResponse';
import { ToolsGetPagesListResponse } from './symbolsinformation/toolsGetPagesListResponse';
import { ToolsGetReportsListResponse } from './symbolsinformation/toolsGetReportsListResponse';
import { ToolsGetQueriesListResponse } from './symbolsinformation/toolsGetQueriesListResponse';
import { ToolsGetXmlPortsListResponse } from './symbolsinformation/toolsGetXmlPortsListResponse';
import { ToolsGetProjectSettingsRequest } from './toolsGetProjectSettingsRequest';
import { ToolsGetProjectSettingsResponse } from './toolsGetProjectSettingsResponse';
import { ToolsGetLibrarySymbolLocationRequest } from './toolsGetLibrarySymbolLocationRequest';
import { ToolsGetLibrarySymbolLocationResponse } from './toolsGetLibrarySymbolLocationResponse';
import { ToolsGetALAppContentRequest } from './toolsGetALAppContentRequest';
import { ToolsGetALAppContentResponse } from './toolsGetALAppContentResponse';
import { ToolsGetImagesRequest } from './languageInformation/toolsGetImagesRequest';
import { ToolsGetImagesResponse } from './languageInformation/toolsGetImagesResponse';
import { ToolsGetProjectSymbolLocationRequest } from './toolsGetProjectSymbolLocationRequest';
import { ToolsGetProjectSymbolLocationResponse } from './toolsGetProjectSymbolLocationResponse';
import { ToolsGetNextObjectIdRequest } from './symbolsinformation/toolsGetNextObjectIdRequest';
import { ToolsGetNextObjectIdResponse } from './symbolsinformation/toolsGetNextObjectIdResponse';
import { ToolsGetObjectsListRequest } from './symbolsinformation/toolsGetObjectsListRequest';
import { ToolsGetObjectsListResponse } from './symbolsinformation/toolsGetObjectsListResponse';
import { ToolsGetPermissionSetsListResponse } from './symbolsinformation/toolsGetPermissionSetsListResponse';
import { ToolsGetReportDetailsRequest } from './symbolsinformation/toolsGetReportDetailsRequest';
import { ToolsGetReportDetailsResponse } from './symbolsinformation/toolsGetReportDetailsResponse';
import { toolsGetInterfaceMethodsListRequest } from './symbolsinformation/toolsGetInterfaceMethodsListRequest';
import { ToolsGetInterfaceMethodsListResponse } from './symbolsinformation/toolsGetInterfaceMethodsListResponse';
import { ToolsGetDependenciesListRequest } from './symbolsinformation/toolsGetDependenciesListRequest';
import { ToolsGetDependenciesListResponse } from './symbolsinformation/toolsGetDependenciesListResponse';
import { ToolsGetPageFieldAvailableToolTipsRequest } from './symbolsinformation/toolsGetPageFieldAvailableToolTipsRequest';
import { ToolsGetPageFieldAvailableToolTipsResponse } from './symbolsinformation/toolsGetPageFieldAvailableToolTipsResponse';

export class ToolsLangServerClient implements vscode.Disposable {
    _context : vscode.ExtensionContext;
    _childProcess : cp.ChildProcess | undefined;
    _connection : rpc.MessageConnection | undefined;
    _alExtensionPath : string;
    _alExtensionVersion : Version;
    errorLogUri : vscode.Uri | undefined;

    constructor(context : vscode.ExtensionContext, alExtensionPath : string, alExtensionVersion: Version) {
        this._context = context;
        this._childProcess = undefined;
        this._connection = undefined;
        this._alExtensionPath = alExtensionPath;
        this._alExtensionVersion = alExtensionVersion;
        this.errorLogUri = undefined;
        this.initialize();
    }

    dispose() {
        if (this._connection) {
            this.exit();
            this._connection.dispose();
            this._connection = undefined;
        }
    }

    protected initialize() {
        try {
            let os = require('os');
            let platform = os.platform();
            let langServerPath : string;

            //find binaries path
            if (this._alExtensionVersion.major <= 1) {
                langServerPath = this._context.asAbsolutePath("bin/netframeworknav2018/AZALDevToolsServer.NetFrameworkNav2018.exe");
                this.errorLogUri = vscode.Uri.file(this._context.asAbsolutePath("bin/netframeworknav2018/log.txt"));
            } else {                
                langServerPath = this._context.asAbsolutePath("bin/netcore/" + platform + "/AZALDevToolsServer.NetCore");
                this.errorLogUri = vscode.Uri.file(this._context.asAbsolutePath("bin/netcore/" + platform + "/log.txt"));
                if (platform == "darwin") {
                    let fs = require('fs');
                    fs.chmodSync(langServerPath, 0o755);
                }
            }


            //start child process
            this._childProcess = cp.spawn(langServerPath, [this._alExtensionPath]);
            if (this._childProcess) {
                let stdOutStream = this._childProcess.stdout;
                let stdInStream = this._childProcess.stdin;
                if ((stdOutStream != null) && (stdInStream != null)) {
                    this._connection = rpc.createMessageConnection(
                        new rpc.StreamMessageReader(stdOutStream),
                        new rpc.StreamMessageWriter(stdInStream));
                    this._connection.listen();
                }
            }
        }
        catch (e) {
        }
    }

    public async getALDocumentSymbols(params : ToolsDocumentSymbolsRequest) : Promise<ToolsDocumentSymbolsResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                    
            let reqType = new rpc.RequestType<ToolsDocumentSymbolsRequest, ToolsDocumentSymbolsResponse, void, void>('al/documentsymbols');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch (e) {
            return undefined;
        }
    }

    public async getAppPackageSymbols(params : ToolsPackageSymbolsRequest) : Promise<ToolsPackageSymbolsResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                    
            let reqType = new rpc.RequestType<ToolsPackageSymbolsRequest, ToolsPackageSymbolsResponse, void, void>('al/packagesymbols');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch (e) {
            return undefined;
        }
    }

    public async getProjectSymbols(params : ToolsProjectSymbolsRequest) : Promise<ToolsProjectSymbolsResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                
            let reqType = new rpc.RequestType<ToolsProjectSymbolsRequest, ToolsProjectSymbolsResponse, void, void>('al/projectsymbols');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch (e) {
            return undefined;
        }
    }

    public async getLibrarySymbolsDetails(params : ToolsLibrarySymbolsDetailsRequest) : Promise<ToolsLibrarySymbolsDetailsResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                
            let reqType = new rpc.RequestType<ToolsLibrarySymbolsDetailsRequest, ToolsLibrarySymbolsDetailsResponse, void, void>('al/librarysymbolsdetails');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch (e) {
            return undefined;
        }
    }

    public closeSymbolsLibrary(params: ToolsCloseSymbolsLibraryRequest) {
        try {
            if (!this._connection)
                return undefined;

            let reqType = new rpc.NotificationType<ToolsCloseSymbolsLibraryRequest, void>('al/closesymbolslibrary');;
            this._connection.sendNotification(reqType, params);
        }
        catch (e) {
        }
    }

    public async getSyntaxTree(params: ToolsGetSyntaxTreeRequest) : Promise<ToolsGetSyntaxTreeResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                
            let reqType = new rpc.RequestType<ToolsGetSyntaxTreeRequest, ToolsGetSyntaxTreeResponse, void, void>('al/getsyntaxtree');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch(e) {
            return undefined;
        }
    }

    public async getSyntaxTreeSymbol(params: ToolsGetSyntaxTreeSymbolsRequest) : Promise<ToolsGetSyntaxTreeSymbolResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                
            let reqType = new rpc.RequestType<ToolsGetSyntaxTreeSymbolsRequest, ToolsGetSyntaxTreeSymbolResponse, void, void>('al/getsyntaxtreesymbol');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch(e) {
            return undefined;
        }
    }

    public closeSyntaxTree(params: ToolsCloseSyntaxTreeRequest) {
        try {
            if (!this._connection)
                return undefined;

            let reqType = new rpc.NotificationType<ToolsCloseSyntaxTreeRequest, void>('al/closesyntaxtree');;
            this._connection.sendNotification(reqType, params);
        }
        catch (e) {
        }
    }

    public async getFullSyntaxTree(params: ToolsGetFullSyntaxTreeRequest, restoreParent: boolean) : Promise<ToolsGetFullSyntaxTreeResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                
            let reqType = new rpc.RequestType<ToolsGetFullSyntaxTreeRequest, ToolsGetFullSyntaxTreeResponse, void, void>('al/getfullsyntaxtree');
            let val = await this._connection.sendRequest(reqType, params);
            if ((restoreParent) && (val) && (val.root))
                ALFullSyntaxTreeHelper.restoreNodeParent(val.root, undefined);

            return val;
        }
        catch(e) {
            return undefined;
        }
    }
    
    public async getCodeAnalyzersRules(params: ToolsGetCodeAnalyzersRulesRequest) : Promise<ToolsGetCodeAnalyzersRulesResponse|undefined> {
        try {
            if (!this._connection)
                return undefined;
                
            let reqType = new rpc.RequestType<ToolsGetCodeAnalyzersRulesRequest, ToolsGetCodeAnalyzersRulesResponse, void, void>('al/getcodeanalyzersrules');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch(e) {
            return undefined;
        }
    }

    public async workspaceCommand(params: ToolsWorkspaceCommandRequest) : Promise<ToolsWorkspaceCommandResponse | undefined> {
        try {
            if (!this._connection)
                return undefined;
            let reqType = new rpc.RequestType<ToolsWorkspaceCommandRequest, ToolsWorkspaceCommandResponse, void, void>('al/workspacecommand');
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch(e) {
            return undefined;
        }
    }

    //exit
    public exit() {
        this.sendNotification({}, 'exit');
    }

    //symbol location
    public getLibrarySymbolLocation(params: ToolsGetLibrarySymbolLocationRequest) : Promise<ToolsGetLibrarySymbolLocationResponse | undefined> {
        return this.sendRequest<ToolsGetLibrarySymbolLocationRequest, ToolsGetLibrarySymbolLocationResponse>(params, 'al/librarysymbollocation');
    }

    public getProjectSymbolLocation(params: ToolsGetProjectSymbolLocationRequest) : Promise<ToolsGetProjectSymbolLocationResponse | undefined> {
        return this.sendRequest<ToolsGetProjectSymbolLocationRequest, ToolsGetProjectSymbolLocationResponse>(params, 'al/projectsymbollocation');
    }

    public getALAppContent(params: ToolsGetALAppContentRequest) : Promise<ToolsGetALAppContentResponse | undefined> {
        return this.sendRequest<ToolsGetALAppContentRequest, ToolsGetALAppContentResponse>(params, 'al/getalappcontent');
    }

    //symbols information requests
    public getObjectsList(params: ToolsGetObjectsListRequest) : Promise<ToolsGetObjectsListResponse | undefined> {
        return this.sendRequest<ToolsGetObjectsListRequest, ToolsGetObjectsListResponse>(params, 'al/getobjectslist');
    }

    public getTablesList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetTablesListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetTablesListResponse>(params, 'al/gettableslist');
    }

    public getCodeunitsList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetCodeunitsListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetCodeunitsListResponse>(params, 'al/getcodeunitslist');
    }

    public getEnumsList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetEnumsListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetEnumsListResponse>(params, 'al/getenumslist');
    }

    public getInterfacesList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetInterfacesListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetInterfacesListResponse>(params, 'al/getinterfaceslist');
    }

    public getInterfaceMethodsList(params: toolsGetInterfaceMethodsListRequest) : Promise<ToolsGetInterfaceMethodsListResponse | undefined> {
        return this.sendRequest<toolsGetInterfaceMethodsListRequest, ToolsGetInterfaceMethodsListResponse>(params, 'al/getinterfacemethodslist');
    }   

    public getPagesList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetPagesListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetPagesListResponse>(params, 'al/getpageslist');
    }

    public getReportsList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetReportsListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetReportsListResponse>(params, 'al/getreportslist');
    }

    public getQueriesList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetQueriesListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetQueriesListResponse>(params, 'al/getquerieslist');
    }

    public getXmlPortsList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetXmlPortsListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetXmlPortsListResponse>(params, 'al/getxmlportslist');
    }

    public getPermissionSetsList(params: ToolsSymbolInformationRequest) : Promise<ToolsGetPermissionSetsListResponse | undefined> {
        return this.sendRequest<ToolsSymbolInformationRequest, ToolsGetPermissionSetsListResponse>(params, 'al/getpermissionsetslist');
    }

    public getTableFieldsList(params: ToolsGetTableFieldsListRequest) : Promise<ToolsGetTableFieldsListResponse | undefined> {
        return this.sendRequest<ToolsGetTableFieldsListRequest, ToolsGetTableFieldsListResponse>(params, 'al/gettablefieldslist');
    }

    public getPageDetails(params: ToolsGetPageDetailsRequest) : Promise<ToolsGetPageDetailsResponse | undefined> {
        return this.sendRequest<ToolsGetPageDetailsRequest, ToolsGetPageDetailsResponse>(params, 'al/getpagedetails');
    }

    public getXmlPortTableElementDetails(params: ToolsGetXmlPortTableElementDetailsRequest) : Promise<toolsGetXmlPortTableElementDetailsResponse | undefined> {
        return this.sendRequest<ToolsGetXmlPortTableElementDetailsRequest, toolsGetXmlPortTableElementDetailsResponse>(params, 'al/getxmlporttableelementdetails');
    }

    public getReportDataItemDetails(params: ToolsGetReportDataItemDetailsRequest) : Promise<ToolsGetReportDataItemDetailsResponse | undefined> {
        return this.sendRequest<ToolsGetReportDataItemDetailsRequest, ToolsGetReportDataItemDetailsResponse>(params, 'al/getreportdataitemdetails');
    }

    public getReportDetails(params: ToolsGetReportDetailsRequest) : Promise<ToolsGetReportDetailsResponse | undefined> {
        return this.sendRequest<ToolsGetReportDetailsRequest, ToolsGetReportDetailsResponse>(params, 'al/getreportdetails');
    }

    public getQueryDataItemDetails(params: ToolsGetQueryDataItemDetailsRequest) : Promise<ToolsGetQueryDataItemDetailsResponse | undefined> {
        return this.sendRequest<ToolsGetQueryDataItemDetailsRequest, ToolsGetQueryDataItemDetailsResponse>(params, 'al/getquerydataitemdetails');
    }

    public getProjectSettings(params: ToolsGetProjectSettingsRequest) : Promise<ToolsGetProjectSettingsResponse | undefined> {
        return this.sendRequest<ToolsGetProjectSettingsRequest, ToolsGetProjectSettingsResponse>(params, 'al/getprojectsettings');
    }

    public getDependenciesList(params: ToolsGetDependenciesListRequest) : Promise<ToolsGetDependenciesListResponse | undefined> {
        return this.sendRequest<ToolsGetDependenciesListRequest, ToolsGetDependenciesListResponse>(params, 'al/getdependencieslist');
    }

    public getPageFieldAvailableToolTips(params: ToolsGetPageFieldAvailableToolTipsRequest) : Promise<ToolsGetPageFieldAvailableToolTipsResponse | undefined> {
        return this.sendRequest<ToolsGetPageFieldAvailableToolTipsRequest, ToolsGetPageFieldAvailableToolTipsResponse>(params, 'al/getpagefieldtooltips');
    }

    //next available object id
    public async getNextObjectId(path: string | undefined, objectType: string) : Promise<number> {
        let response = await this.sendRequest<ToolsGetNextObjectIdRequest, ToolsGetNextObjectIdResponse>(
            new ToolsGetNextObjectIdRequest(path, objectType), 'al/getnextobjectid');
        if ((response) && (response.id))
            return response.id;
        return 0;
    }

    //language information

    public getImages(params: ToolsGetImagesRequest) : Promise<ToolsGetImagesResponse | undefined> {
        return this.sendRequest<ToolsGetImagesRequest, ToolsGetImagesResponse>(params, "al/getimages");
    }

    //workspace and file notifications

    public workspaceFolderChange(params: ToolsWorkspaceFoldersChangeRequest) {
        this.sendNotification(params, 'ws/workspaceFoldersChange');
    }

    public async documentOpen(params: ToolsDocumentChangeRequest) {
        this.sendNotification(params, "ws/documentOpen");
    }

    public async documentChange(params: ToolsDocumentContentChangeRequest) : Promise<ToolsDocumentContentChangeResponse | undefined> {
        return this.sendRequest<ToolsDocumentContentChangeRequest, ToolsDocumentContentChangeResponse>(params, "ws/documentContentChange");
    }

    public async documentSave(params: ToolsDocumentChangeRequest) {
        this.sendNotification(params, "ws/documentSave");
    }

    public documentClose(params: ToolsDocumentChangeRequest) {
        this.sendNotification(params, "ws/documentClose");
    }

    public fileCreate(params: ToolsFilesRequest) {
        this.sendNotification(params, "ws/fileCreate");
    }

    public fileDelete(params: ToolsFilesRequest) {
        this.sendNotification(params, "ws/fileDelete");
    }

    public fileRename(params: ToolsFilesRenameRequest) {
        this.sendNotification(params, "ws/fileRename");
    }

    public async fileSystemFileChange(params: ToolsFileSystemFileChangeRequest) {
        this.sendNotification(params, "ws/fsFileChange");
    }

    public async fileSystemFileCreate(params: ToolsFileSystemFileChangeRequest) {
        this.sendNotification(params, "ws/fsFileCreate");
    }

    public async fileSystemFileDelete(params: ToolsFileSystemFileChangeRequest) {
        this.sendNotification(params, "ws/fsFileDelete");
    }


    //internal communication methods

    protected sendNotification<T>(params: T, command: string) {
        try {
            if (!this._connection)
                return undefined;

            let reqType = new rpc.NotificationType<T, void>(command);
            this._connection.sendNotification(reqType, params);
        }
        catch (e) {
        }
    }

    protected async sendRequest<Req, Res>(params: Req, command: string) : Promise<Res | undefined> {
        try {
            if (!this._connection)
                return undefined;
            let reqType = new rpc.RequestType<Req, Res, void, void>(command);
            let val = await this._connection.sendRequest(reqType, params);
            return val;
        }
        catch(e) {
            return undefined;
        }
    }

    public isEnabled() : boolean {
        if (this._connection)
            return true;        
        return false;
    }

}