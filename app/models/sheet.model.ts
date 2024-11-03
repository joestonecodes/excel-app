export interface SheetData {
    id: string;
    name: string;
    keyValuePairs: { key: string; value: any }[];
}

export class SheetModel implements SheetData {
    id: string;
    name: string;
    keyValuePairs: { key: string; value: any }[];

    constructor(id: string, name: string, keyValuePairs: { key: string; value: any }[]) {
        this.id = id;
        this.name = name;
        this.keyValuePairs = keyValuePairs;
    }

    static fromRawData(name: string, data: any[]): SheetModel {
        const id = Math.random().toString(36).substring(7);
        const pairs: { key: string; value: any }[] = [];
        
        if (data.length > 0) {
            // Get all unique keys from all rows
            const keys = new Set<string>();
            data.forEach(row => {
                Object.keys(row).forEach(key => keys.add(key));
            });
            
            // Create key-value pairs from random row data
            keys.forEach(key => {
                const randomRowIndex = Math.floor(Math.random() * data.length);
                const value = data[randomRowIndex][key];
                if (value !== undefined) {
                    pairs.push({ key, value: String(value) });
                }
            });
        }

        return new SheetModel(id, name, pairs);
    }
}