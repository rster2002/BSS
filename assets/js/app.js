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
This software can't be claimed by anyone as their own property.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR
THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

const remote = require('electron').remote;
const dialog = remote.require('electron').dialog;
const ipcRenderer = require('electron').ipcRenderer;
const isDev = require('electron-is-dev');

const idCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function replaceExplit(input, replace, replaced) {
	var rtrn = "";
	var r = input.split(replace);
	for (var i = 0; i < r.length; ++i) {
		if (i !== 0) {
			let p = replaced;
			rtrn += p;
		}

		if (input[i] !== "") {
			rtrn += r[i];
		}
	}

	if (rtrn === "") {
		rtrn = input;
	}
	return rtrn;
}

if (!isDev) {
	ipcRenderer.on('updateReady', function(event, text) {
		$('.inner.blue').show();
	})
}

function randomString(characters, l) {
	var retn = "";
	for (var i = 0; i < l; i++) {
		var r = Math.floor(Math.random() * characters.length);
		retn += characters[r];
	}
	return retn;
}

Vue.component('bar-button', {
	template: "<div class='button'><div class='inner'><div class='iconWrapper'><i class='material-icons'>{{ icon }}</i></div><p><slot></slot></p></div></div>",
	props: ['text', 'icon']
})

vueApp = new Vue({
	el: "#app",
	data: {
		projects: [],
		prjById: {},
		show: {
			build: false,
			projects: false,
			add: true
		},
		newPrj: {
			name: "",
			workspaceDir: "",
			exportDir: "",
			namespace: ""
		},
		currentPrj: {
			name: "",
			workspaceDir: "",
			exportDir: "",
			namespace: "",
			id: ""
		}
	},
	methods: {
		addPrj() {
			$(".overlay.addPrj").show();
		},
		choseDir(dir) {
			var path = dialog.showOpenDialog({
				properties: ["openDirectory"]
			});
			this.newPrj[dir] = path[0];
			// $('#s-' + dir).click();
			// if (path) {
			// 	this[dir] = path;
			// }
		},
		confirmPrj() {
			var id = randomString(idCharacters, 32);
			var i = replaceExplit(vueApp.newPrj.workspaceDir, "\\", "/");
			console.log(i);
			if (i[i.length - 1] !== "/") {
				console.log(i);
				i = i + "/"
				console.log(i);
			}
			var work = i;
			console.log(i, work);
			var i = replaceExplit(vueApp.newPrj.exportDir, "\\", "/");
			if (i[i.length - 1] !== "/") {
				i += "/"
			}
			var exp = i;
			vueApp.projects.push({
				name: vueApp.newPrj.name,
				workspaceDir: work,
				exportDir: exp,
				namespace: vueApp.newPrj.namespace,
				id: id
			});

			vueApp.prjById[id] = {
				name: vueApp.newPrj.name,
				workspaceDir: work,
				exportDir: exp,
				namespace: vueApp.newPrj.namespace,
				id: id
			}

			$(".overlay.addPrj").hide();
			store("prjById", vueApp.prjById);
			store("projects", vueApp.projects);
		},
		openPrj(id) {
			vueApp.currentPrj = vueApp.prjById[id];

			this.show = {
				build: true,
				projects: true,
				add: false
			}
			$('.projects').hide();
			$('.loader').show();
		},
		openPrjs() {
			// filewatcher.close();
			this.show = {
				build: false,
				projects: false,
				add: true
			}
			$("#topTitle").text("BlueStone Script");
			$('.projects').show();
			$('.loader').hide();
		},
		build() {
			compile();
		}
	}
});

if (load("projects") === null) {
	store("projects", []);
}

if (load("prjById") === null) {
	store("prjById", {});
}

vueApp.projects = load("projects");
vueApp.prjById = load("prjById");
