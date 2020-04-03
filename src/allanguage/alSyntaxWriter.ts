import * as vscode from 'vscode';
import { ALSyntaxHelper } from './alSyntaxHelper';

export class ALSyntaxWriter {
    private content : string;
    private indentText : string;
    private indentPart : string;  
    private applicationArea : string;   

    constructor() {
        this.content = "";
        this.indentText = "";
        this.indentPart = "    ";
        this.applicationArea = vscode.workspace.getConfiguration('alOutline').get('defaultAppArea');
    }

    public toString() : string {
        return this.content;
    }

    public incIndent() {
        this.indentText += this.indentPart;
    }

    public decIndent() {
        if (this.indentText.length > this.indentPart.length)
            this.indentText = this.indentText.substr(0, this.indentText.length - this.indentPart.length);
        else
            this.indentText = "";
    }

    public setIndent(value : number) {
        let text : string = " ";
        this.indentText = text.repeat(value);
    }

    public writeLine(line : string) {
        this.content += (this.indentText + line + "\n");
    }

    public writeStartBlock() {
        this.writeLine("{");
        this.incIndent();
    }

    public writeEndBlock() {
        this.decIndent();
        this.writeLine("}");
    }

    public writeStartNamedBlock(name : string) {
        this.writeLine(name);
        this.writeStartBlock();
    }

    public writeStartNameSourceBlock(blockName : string, propertyName : string, propertySource : string) {
        this.writeLine(blockName + "(" + propertyName + "; " + propertySource + ")");
        this.writeStartBlock();
    }

    public writeNameSourceBlock(blockName : string, propertyName : string, propertySource : string) {
        this.writeStartNameSourceBlock(blockName, propertyName, propertySource);
        this.writeEndBlock();
    }

    public writeStartObject(type : string, id : string, name : string) {
        var objectIdText : string;
        if ((id == '') || (id == '0'))
            objectIdText = 'id';
        else
            objectIdText = id.toString();
        
        name = ALSyntaxHelper.toNameText(name);

        this.writeLine(type + " " + objectIdText + " " + name);
        this.writeStartBlock();
    }

    public writeStartCodeunit(id : string, name : string, interfaceName: string | undefined) {
        var objectIdText : string;
        if ((id == '') || (id == '0'))
            objectIdText = 'id';
        else
            objectIdText = id.toString();
        
        name = ALSyntaxHelper.toNameText(name);

        let interfaceText = "";
        if ((interfaceName) && (interfaceName.length > 0))
            interfaceText = " implements " + ALSyntaxHelper.toNameText(interfaceName);

        this.writeLine("codeunit " + objectIdText + " " + name + interfaceText);
        this.writeStartBlock();
    }


    public writeStartExtensionObject(type : string, id : string, extname : string, targetName : string) {
        var objectIdText : string;
        if ((id == '') || (id == '0'))
            objectIdText = 'id';
        else
            objectIdText = id.toString();
        
        extname = ALSyntaxHelper.toNameText(extname);
        targetName = ALSyntaxHelper.toNameText(targetName);

        this.writeLine(type + " " + objectIdText + " " + extname + " extends " + targetName);
        
        this.writeStartBlock();
    }

    public writeEndObject() {
        this.writeEndBlock();
    }

    public writeStartLayout() {
        this.writeLine("layout");
        this.writeStartBlock();
    }

    public writeEndLayout() {
        this.writeEndBlock();
    }

    public writeStartActions() {
        this.writeLine("actions");
        this.writeStartBlock();
    }

    public writeEndActions() {
        this.writeEndBlock();
    }

    public writeStartFields() {
        this.writeLine("fields");
        this.writeStartBlock();
    }

    public writeEndFields() {
        this.writeEndBlock();
    }

    public writeStartGroup(type : string, name : string) {
        this.writeLine(type + "(" + name + ")");
        this.writeStartBlock();
    }

    public writeProperty(name : string, value : string) {
        this.writeLine(name + " = " + value + ";");
    }

    public writeTableField(fieldId: string, fieldName: string, fieldDataType: string, fieldLength: string, dataClassification: string) {
        let dataType = fieldDataType.toLowerCase();
        if ((fieldLength) && ((dataType == 'text') || (dataType == 'code')))
            fieldDataType = fieldDataType + '[' + fieldLength + ']';

        this.writeLine("field(" + fieldId + "; " + ALSyntaxHelper.toNameText(fieldName) + "; " + fieldDataType + ")");
        this.writeStartBlock();
        this.writeProperty('Caption', ALSyntaxHelper.toStringText(fieldName));
        if (dataClassification)
            this.writeProperty("DataClassification", dataClassification);
        else
            this.writeProperty("DataClassification", "ToBeClassified");
        this.writeEndBlock();
    }

    public writePageField(fieldName : string) {
        this.writeStartNameSourceBlock("field", this.encodeName(fieldName), this.encodeName(fieldName));
        this.writeApplicationArea();
        this.writeEndBlock();
    }

    public writeApiPageField(fieldName : string) {
        let name : string = this.createApiName(fieldName);
        this.writeStartNameSourceBlock("field", this.encodeName(name), this.encodeName(fieldName));
        this.writeProperty("Caption", this.encodeString(name));
        this.writeApplicationArea();
        this.writeEndBlock();
    }

    public writeApplicationArea() {
        if ((this.applicationArea) && (this.applicationArea !== ""))
            this.writeProperty("ApplicationArea", this.applicationArea);
    }

    public encodeString(text : string) : string {
        return ALSyntaxHelper.toStringText(text); 
    }

    public encodeName(name : string) : string {
        return ALSyntaxHelper.toNameText(name);
    }

    public createName(source : string) : string {
        return source.replace(/\W/g, '');
    }

    public createApiName(source : string) : string {
        return source.replace(/[^A-Za-z]/g, '');
    }

}