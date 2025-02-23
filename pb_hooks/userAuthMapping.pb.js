/// <reference path="../pb_data/types.d.ts" />

onRecordCreateRequest((e) => {
    e.record.set('user', e.auth.id);
    return e.next();
}, 'note', 'task');