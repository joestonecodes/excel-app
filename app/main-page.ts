import { EventData, Page, alert, Utils, Application } from '@nativescript/core';
import { SheetsViewModel } from './view-models/sheets-view-model';
import { android as androidApp } from '@nativescript/core/application';

let viewModel: SheetsViewModel;

export function navigatingTo(args: EventData) {
    const page = <Page>args.object;
    if (!viewModel) {
        viewModel = new SheetsViewModel();
    }
    page.bindingContext = viewModel;
}

export function onUploadTap() {
    if (Application.android) {
        const activity = Application.android.foregroundActivity;
        const intent = new android.content.Intent(android.content.Intent.ACTION_GET_CONTENT);
        intent.setType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        intent.addCategory(android.content.Intent.CATEGORY_OPENABLE);
        
        const chooser = android.content.Intent.createChooser(intent, "Select Excel File");
        
        activity.startActivityForResult(chooser, 1);
        
        // Handle the result
        Application.android.on(AndroidApplication.activityResultEvent, async (args: any) => {
            const requestCode = args.requestCode;
            const resultCode = args.resultCode;
            const data = args.intent;
            
            if (requestCode === 1 && resultCode === android.app.Activity.RESULT_OK) {
                if (data.getData()) {
                    try {
                        const uri = data.getData();
                        await viewModel.handleFileUri(uri);
                    } catch (error) {
                        console.error("Error processing file:", error);
                        alert({
                            title: "Error",
                            message: "Failed to process the Excel file. Please try again.",
                            okButtonText: "OK"
                        });
                    }
                }
            }
        });
    }
}

export function onSheetTap(args: any) {
    const sheet = viewModel.sheets.getItem(args.index);
    viewModel.selectedPair = viewModel.getRandomPair(sheet.id);
}

export function onRandomTap(args: any) {
    const sheet = args.object.bindingContext;
    viewModel.selectedPair = viewModel.getRandomPair(sheet.id);
}

export function onDeleteTap(args: any) {
    const sheet = args.object.bindingContext;
    viewModel.deleteSheet(sheet.id);
    viewModel.selectedPair = null;
}