'use strict';
var packager = require('electron-packager');
var options = {
    'arch': 'ia32',
    'platform': 'win32',
    'dir': './',
    'app-copyright': 'rster2002',
    'app-version': '0.0.1',
    'asar': true,
    'name': 'Minecraft-Packager',
    'out': './releases',
    'overwrite': true,
    'prune': true,
    'version': '0.0.1',
    'version-string': {
        'CompanyName': 'rster2002',
        'FileDescription': 'Packages for minecraft', /* This is what display windows on task manager, shortcut and process */
        'OriginalFilename': 'Minecraft-Packager',
        'ProductName': 'Minecraft Packager',
        'InternalName': 'Minecraft-Packager'
    }
};
packager(options, function done_callback(err, appPaths) {
    console.log("Error: ", err);
    console.log("appPaths: ", appPaths);
});
