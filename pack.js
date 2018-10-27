'use strict';
var packager = require('electron-packager');
var options = {
    'arch': 'ia32',
    'platform': 'win32',
    'dir': './',
    'app-copyright': 'Bjørn Reemer',
    'app-version': '0.0.7',
    'asar': true,
    'name': 'BlueStone Script',
    'out': './releases',
    'overwrite': true,
    'prune': true,
    'version': '0.0.7',
    'version-string': {
        'CompanyName': 'rster2002',
        'FileDescription': 'Compiler for .mcfunctions', /* This is what display windows on task manager, shortcut and process */
        'OriginalFilename': 'BSS',
        'ProductName': 'BlueStone Script',
        'InternalName': 'BlueStone Script'
    }
};
packager(options, function done_callback(err, appPaths) {
    console.log("Error: ", err);
    console.log("appPaths: ", appPaths);
});
