import { createRecord, recordType } from '../lib/create-record'

describe('createRecord', () => {
    const settings = {
        hostName: 'x',
        processName: 'y',
    }

    describe('Record Type: Log', () => {
        test('it should handle a new log from a string', () => {
            const record = createRecord(recordType.LOG, 'foo', settings)

            expect(record.message).toBe('foo')
            expect(record.host).toBe(settings.hostName)
            expect(record.process).toBe(settings.processName)
            expect(record.ctime).toBeNull()
            expect(record.meta).toEqual({})
        })
        
        test('it should handle a new log from an object with meta', () => {
            const ctime = new Date()
            const record = createRecord(recordType.LOG, {
                message: 'foo',
                host: 'custom-host',
                process: 'custom-process',
                ctime,
                foo: 123,
            }, settings)

            expect(record.message).toBe('foo')
            expect(record.host).toBe('custom-host')
            expect(record.process).toBe('custom-process')
            expect(record.ctime).toEqual(ctime)
            expect(record.meta).toEqual({ foo: 123 })
        })

        test('it should fail if the date is not valid', () => {
            expect(() => createRecord(recordType.LOG, {
                message: 'foo',
                ctime: 'foo',
            }, settings)).toThrow(/ctime is not a valid date/)
        })
        
        test('it should fail if there is no message', () => {
            expect(() => createRecord(recordType.LOG, {
                ctime: new Date(),
            }, settings)).toThrow(/missing log "message"/)
        })
    })

    describe('Record Type: Event', () => {
        test('it should handle a new event from name and payload', () => {
            const record = createRecord(recordType.EVENT, 'foo', { a: 1 }, settings)
            
            expect(record.host).toBe(settings.hostName)
            expect(record.process).toBe(settings.processName)
            expect(record.name).toBe('foo')
            expect(record.payload).toEqual({ a: 1 })
            expect(record.ctime).toBeNull()
            expect(record.identity).toBeNull()
        })

        test('it should handle a new event from an obnject', () => {
            const ctime = new Date()
            const record = createRecord(recordType.EVENT, {
                name: 'foo',
                identity: 9,
                host: 'custom-host',
                process: 'custom-process',
                ctime,
                a: 1,
                b: 2,
            }, settings)

            expect(record.name).toBe('foo')
            expect(record.payload).toEqual({ a: 1, b: 2 })
            expect(record.host).toBe('custom-host')
            expect(record.process).toBe('custom-process')
            expect(record.identity).toBe(9)
            expect(record.ctime).toEqual(ctime)
        })

        test('it should fail if the date is not valid', () => {
            expect(() => createRecord(recordType.EVENT, {
                name: 'foo',
                ctime: 'foo',
            }, settings)).toThrow(/ctime is not a valid date/)
        })
        
        test('it should fail if there is no name', () => {
            expect(() => createRecord(recordType.EVENT, {
                a: 1,
                b: 2,
            }, settings)).toThrow(/missing event "name"/)
        })
    })
})