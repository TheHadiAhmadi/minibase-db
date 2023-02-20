export type ColumnType = 'string' | 'number' | 'boolean' | 'date';

export type Migration = {
    type: 'add-column' | 'remove-column' | 'update-column' | 'add-table' | 'remove-table' | 'rename-table',
    from: 'string',
    to: 'string',
    schema: ColumnType
}

export type Schema = {
    [x: string]: {
        [y: string]: ColumnType
    }
}

export type Column = {
    name: string,
    type: ColumnType
}