var sqlite3_open = Module.findExportByName(null, 'sqlite3_open');
var sqlite3_key = Module.findExportByName(null, 'sqlite3_key');

console.log("dump_keys.js loaded");

Interceptor.attach(sqlite3_open, {
    onEnter: function(args) {
        console.log('sqlite3_open: ' + args[0].readUtf8String());
    }
});

Interceptor.attach(sqlite3_key, {
    onEnter: function(args) {
        var size = args[2].toInt32();
        var key = args[1].readUtf8String(size);
        console.log('sqlite3_key: ' + key);
    }
});