/*

MIT Licence

Copyright 2018 Bjørn Reemer

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const filewatcher = require('chokidar');

function StartWatcher(path, fn) {
      var chokidar = require("chokidar");

      watcher = chokidar.watch(path, {
          persistent: true
      });

	  //           ignored: /[\/\\]\./,

      function onWatcherReady(){
          console.info('From here can you check for real changes, the initial scan has been completed.');
      }

      // Declare the listeners of the watcher
	  watcher
		  .on('ready', onWatcherReady)
		  .on('raw', function(event, path, details) {
			  // This event should be triggered everytime something happens.
			  console.log('Raw event info:', event, path, details);
			  // fn();
		  });
}
