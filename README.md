# PioneerDJ Rekordbox Database Decryption

[Rekordbox](https://rekordbox.com) v6 has an encrypted `master.db` database file. The database file is encrypted with [sqlcipher](https://www.zetetic.net/sqlcipher/sqlcipher-api/#sqlcipher_export).

## How to Decrypt?

First you need to install `sqlcipher`, you can do this on MacOS with:

```
brew install sqlcipher
```

You can then decrypt your `master.db` file to `master_decrypted.db` with the following commands:

```
sqlcipher master.db
PRAGMA key = '402fd482c38817c35ffa8ffb8c7d93143b749e7d315df7a81732a1ff43608497';
ATTACH DATABASE 'master_decrypted.db' AS master_decrypted KEY '';
SELECT sqlcipher_export('master_decrypted');
DETACH DATABASE master_decrypted;
```

## How to get Key?

As seen above, the key is:

```
402fd482c38817c35ffa8ffb8c7d93143b749e7d315df7a81732a1ff43608497
```

But how do we get the key?

We can dump the keys used for encryption by using [Frida](https://frida.re) to inject some code into Rekordbox while it's running.

First, install `frida`, you can do this with:

```
pip install frida-tools
```


Then, create a file named `dump_keys.js` with the following:

```
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
```

Then launch Rekordbox. Once Rekordbox has launched, inject the above script with:

```
frida -l dump_keys.js rekordbox
```

Perform a Library backup via `File > Library > Backup Library`. Once the backup is complete, you will see some output from the `dump_keys.js` script:

```
sqlite3_open: /Users/liamcottle/Library/Caches/rekordbox/master.db
sqlite3_key: 402fd482c38817c35ffa8ffb8c7d93143b749e7d315df7a81732a1ff43608497
```

The value for `sqlite3_key` is the key for the database file. You can use this key to decrypt the `master.db` file that you unzip from your Library Backup.