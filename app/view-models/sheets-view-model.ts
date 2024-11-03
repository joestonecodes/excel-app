import { Observable, ObservableArray, File, Utils } from '@nativescript/core';
import { SheetData, SheetModel } from '../models/sheet.model';
import * as XLSX from 'xlsx';

export class SheetsViewModel extends Observable {
    private _sheets: ObservableArray<SheetData>;
    private _selectedPair: { key: string; value: any } | null;

    constructor() {
        super();
        this._sheets = new ObservableArray<SheetData>();
        this._selectedPair = null;
    }

    get sheets(): ObservableArray<SheetData> {
        return this._sheets;
    }

    get selectedPair(): { key: string; value: any } | null {
        return this._selectedPair;
    }

    set selectedPair(value: { key: string; value: any } | null) {
        if (this._selectedPair !== value) {
            this._selectedPair = value;
            this.notifyPropertyChange('selectedPair', value);
        }
    }

    async handleFileUri(uri: android.net.Uri): Promise<void> {
        try {
            const context = Utils.android.getApplicationContext();
            const contentResolver = context.getContentResolver();
            const inputStream = contentResolver.openInputStream(uri);
            
            // Read the file content
            const chunks: Array<number> = [];
            const buffer = Array.create("byte", 8192);
            let bytesRead;
            
            while ((bytesRead = inputStream.read(buffer)) !== -1) {
                for (let i = 0; i < bytesRead; i++) {
                    chunks.push(buffer[i]);
                }
            }
            
            inputStream.close();
            
            // Convert to Uint8Array for XLSX
            const data = new Uint8Array(chunks);
            const workbook = XLSX.read(data, { type: 'array' });
            
            workbook.SheetNames.forEach(sheetName => {
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                if (jsonData.length > 0) {
                    const sheet = SheetModel.fromRawData(sheetName, jsonData);
                    this._sheets.push(sheet);
                }
            });

            this.notifyPropertyChange('sheets', this._sheets);
        } catch (error) {
            console.error('Error processing file:', error);
            throw error;
        }
    }

    deleteSheet(sheetId: string): void {
        const index = this._sheets.findIndex(sheet => sheet.id === sheetId);
        if (index !== -1) {
            this._sheets.splice(index, 1);
            this.notifyPropertyChange('sheets', this._sheets);
        }
    }

    getRandomPair(sheetId: string): { key: string; value: any } | null {
        const sheet = this._sheets.find(s => s.id === sheetId);
        if (!sheet || !sheet.keyValuePairs.length) return null;
        
        const randomIndex = Math.floor(Math.random() * sheet.keyValuePairs.length);
        return sheet.keyValuePairs[randomIndex];
    }
}