import { ALObjectWizard } from "./alObjectWizard";
import { DevToolsExtensionContext } from "../../devToolsExtensionContext";
import { ALObjectWizardSettings } from "./alObjectWizardSettings";
import { ALReportExtWizardPage } from "./alReportExtWizardPage";
import { ALReportExtWizardData } from "./alReportExtWizardData";

export class ALReportExtWizard extends ALObjectWizard {

    constructor(toolsExtensionContext : DevToolsExtensionContext, newLabel: string, newDescription : string, newDetails: string) {
        super(toolsExtensionContext, newLabel, newDescription, newDetails);
    }

    run(settings: ALObjectWizardSettings) {
        super.run(settings);
        this.runAsync(settings);
    }

    protected async runAsync(settings: ALObjectWizardSettings) {
        let objectId : number = await this._toolsExtensionContext.toolsLangServerClient.getNextObjectId(settings.getDestDirectoryPath(), "reportextension");

        let wizardData : ALReportExtWizardData = new ALReportExtWizardData();
        wizardData.objectId = objectId.toString();
        wizardData.objectName = '';
        wizardData.baseReport = '';
        let wizardPage : ALReportExtWizardPage = new ALReportExtWizardPage(this._toolsExtensionContext, settings, wizardData);
        wizardPage.show();
    }

}