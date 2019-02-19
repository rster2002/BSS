/*

MIT Licence

Copyright 2018-2019 Bjørn Reemer

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

const path = require("path")
const bss = require(path.resolve("./assets/js/compiler.js"));
// const bss = require("bss-core");
const { remove, dialog, ipcRenderer } = require('electron');
const isDev = require('electron-is-dev');

console.log(`%c Compiler %c Version ${bss.version} %c`, "background: #35495e; padding: 1px; border-radius: 3px 0 0 3px; color: white", "background:#FFA500; padding: 1px; border-radius: 0 3px 3px 0; color: white;", "background: transparent;")

if (isDev && bss.version.includes("dev") === false) {
	console.log(`%c Warn %c Expected development verion but was %c ${bss.version} `, "background: #ff3030; padding: 1px; border-radius: 3px; color: white", "background: transparent;", "background:#FFA500; padding: 1px; border-radius: 3px; color: white;");
} else if (!isDev && bss.version.includes("dev") === true) {
	console.log(`%c Warn %c Expected production verion but was %c ${bss.version} `, "background: #ff3030; padding: 1px; border-radius: 3px; color: white", "background: transparent;", "background:#FFA500; padding: 1px; border-radius: 3px; color: white;")
}

const idCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

// Replace all
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

// When a update has been downloaded, show 'update' button
ipcRenderer.on('updateReady', function(event, text) {
	$('#updateButton').show();
});

// Updates the app
function update() {
	ipcRenderer.send('quitAndInstall')
}

// function for generating random strings for id's
function randomString(characters, l) {
	var retn = "";
	for (var i = 0; i < l; i++) {
		var r = Math.floor(Math.random() * characters.length);
		retn += characters[r];
	}
	return retn;
}

// registers vue component for bar buttons
Vue.component('bar-button', {
	template: "<div class='button'><div class='inner'><div class='iconWrapper'><i class='material-icons'>{{ icon }}</i></div><p><slot></slot></p></div></div>",
	props: ['text', 'icon']
});

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
		},
		error: {
			show: false
		},
		console: [
		],
		lastError: false,
		compilerMessage: "Nothing compiled yet...",
		currentCompiling: false
	},
	watch: {
		currentCompiling() {
			if (this.currentCompiling === false) {
				$("#topTitle").text("BlueStone Script");
				setTimeout(function() {
					$(".loader .bar").removeClass("active");
					$(".loader .bar .progress").css("width", "0%");
					$(".compilerMessage").addClass("show");
				}, 3000);
			} else {
				$("#topTitle").text("Rendering...");
				$(".loader .bar").add("active");
				$(".loader .bar .progress").css("width", "5%");
				$(".compilerMessage").removeClass("show");
			}
		}
	},
	methods: {
		addPrj() {
			$(".overlay.addPrj").show();
		},
		clr(type) {
			if (type === "log") {
				return "rgba(255, 255, 255, 0.6)";
			} else if (type === "warn") {
				return "rgba(251, 190, 45, 0.6)";
			} else if (type === "error") {
				return "rgba(255, 48, 48, 0.6)";
			}
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
			i = replaceExplit(i, " ", "%20");
			console.log(i);
			if (i[i.length - 1] !== "/") {
				console.log(i);
				i = i + "/"
				console.log(i);
			}
			var work = i;
			console.log(i, work);
			i = replaceExplit(vueApp.newPrj.exportDir, "\\", "/");
			i = replaceExplit(i, " ", "%20");
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

			startWatcher(vueApp.currentPrj.workspaceDir, function(event) {
				compile();
			});
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
			watcher.close();
		},
		build() {
			compile();
		},
		deleteProject() {
			if (confirm("Are you sure you want to delete this project?")) {
				let current = this.currentPrj;
				this.prjById[current.id] = null;
				this.projects.splice(this.projects.indexOf(current), 1);
				$('.projects').show();
				$('.loader').hide();
				store("projects", []);
				store("prjById", {});
				this.show = {
					build: false,
					projects: false,
					add: true
				}
			}
		},
		closeError() {
			this.error.show = false;
			$("#topTitle").text("BlueStone Script");
			$(".loader .bar .progress").css("width", "100%");
			vueApp.show = {
				build: true,
				projects: true,
				add: false
			}
		}
	}
});

window.addEventListener('error', function(e) {
	let source = e.filename.replace("file:///" + vueApp.currentPrj.workspaceDir, "workspace:");
	if (source.includes("file://")) {
		let appFiles = ["compiler", "app", "filewatcher", "index"];
		let file;
		for (var i = 0; i < appFiles.length; ++i) {
			if (source.includes(appFiles[i] + ".js")) {
				file = appFiles[i] + ".js";
			}
		}
		source = "application:" + file;
	} else if (source.includes("workspace:")) {
		setTimeout(function() {
			$(".loader .bar").removeClass("active");
			$(".loader .bar .progress").css("width", "0%");
			$(".compilerMessage").addClass("show");
		}, 5000);
	}
	var errMessage = `[ERROR @ ${source} -> ${e.lineno}:${e.colno}] ${e.message}`;
	console.error(errMessage);
	vueApp.console.push({
		type: "error",
		message: errMessage
	});

	vueApp.show = {
		build: true,
		projects: true,
		add: false
	}

	$(".loader .bar .progress").css("width", "100%");

	// vueApp.error = {
	// 	message: e.message,
	// 	source: source,
	// 	line: e.lineno,
	// 	col: e.colno,
	// 	error: e.error,
	// 	show: true
	// };
	vueApp.lastError = true;
	vueApp.currentCompiling = false;
});

function thr(err) {
	setTimeout(function(){throw new Error(err)});
}

if (load("projects") === null) {
	store("projects", []);
}

if (load("prjById") === null) {
	store("prjById", {});
}

function compile() {
	if (vueApp.currentCompiling === false) {

		vueApp.console = [];

		vueApp.currentCompiling = true;

		vueApp.lastError = false;
		// $(".loader .bar .progress").css("width", "5%");
		// $(".loader .bar").addClass("active");
		// $(".compilerMessage").removeClass("show");
		vueApp.show = {
			build: false,
			projects: false,
			add: false
		}

		var prj = Object.assign({}, vueApp.currentPrj);
		prj.logging = isDev;

		bss.compile(prj, {
			callback(c) {
				$(".loader .bar .progress").css("width", c.percentage + "%");

				vueApp.compilerMessage = `Rendered ${c.completedFiles} out of ${c.totalFiles} files`

				if (c.percentage === 100) {
					vueApp.show = {
						build: true,
						projects: true,
						add: false
					}
					$("#topTitle").text("Done!");

					vueApp.currentCompiling = false;
				}
			},
			log(e) {
				vueApp.console.push({
					type: "log",
					message: e
				});
			}
		});
	}
}



vueApp.projects = load("projects");
vueApp.prjById = load("prjById");
