const localStorageSaveKey="GTAOnlineCompletionTrackerSave"
var saveData = {
	heists: {
		displayName: "Heists",
		ogheists: {
			displayName: "OG Heists",
			fleeca: {
				displayName: "The Fleeca Job",
				complete: false
			},
			prison: {
				displayName: "The Prison Break",
				complete: false
			},
			humanelabs: {
				displayName: "The Humane Labs Raid",
				complete: false
			},
			seriesa: {
				displayName: "Series A Funding",
				complete: false
			},
			pacificstandard: {
				displayName: "The Pacific Standard Job",
				complete: false
			}
		},
		doomsday: {
			displayName: "Doomsday Heists",
			databreaches: {
				displayName: "The Data Breaches",
				complete: false
			},
			bogdanproblem: {
				displayName: "The Bogdan Problem",
				complete: false
			},
			doomsdayscenario: {
				displayName: "The Doomsday Scenario",
				complete: false
			}
		},
		diamondcasino: {
			displayName: "The Diamond Casino Heist",
			complete: false
		},
		cayoperico: {
			displayName: "The Cayo Perico Heist",
			complete: false
		},
	}
};

function _setPathValue(o, path, value)
{
	if(o.complete != undefined)
	{
		o.complete = value;
		return;
	}

	const pathArr = path.split(".");
	if(pathArr[0] in o)
	{
		_setPathValue(o[pathArr[0]], pathArr.slice(1, pathArr.length).join("."), value);
	}
}

function setSaveValue(path, value)
{
	if(path.startsWith("tree."))
	{
		path = path.replace("tree.", "");
	}

	_setPathValue(saveData, path, value);

	storeSave();
	getCompletion(undefined, saveData);
}

function loadSave()
{
	try
	{
		const saveDataStr = window.localStorage.getItem(localStorageSaveKey);
		if(!saveDataStr)
		{
			console.log("No save data found. Starting fresh.");
		}
		else
		{
			saveData = JSON.parse(saveDataStr);
		}
	}
	catch(e)
	{
		console.error("Invalid save data. Starting over.");
	}
}

function storeSave()
{
	window.localStorage.setItem(localStorageSaveKey, JSON.stringify(saveData));
}

function setSideBarHeight()
{
	$("#sidebarWrapper").height(window.innerHeight - $("#headerWrapper").height());
}

function categoryDropDown(name, id)
{
	const el = document.createElement("div");
	el.id = id;
	el.textContent = name;
	el.style.width = "100%";
	const listEl = document.createElement("div");
	listEl.style.width = "100%"
	listEl.id = id + ".items"
	listEl.style.paddingLeft = "15px";
	el.append(listEl);
	const buttonEl = document.createElement("button");
	buttonEl.textContent = "-";
	buttonEl.addEventListener("click", (e) => {
		if(e.target.textContent == "+")
		{
			listEl.style.height = null;
			listEl.style.overflow = null;
			e.target.textContent = "-";
		}
		else
		{
			listEl.style.height = "0";
			listEl.style.overflow = "hidden";
			e.target.textContent = "+";
		}
	});
	el.prepend(buttonEl);
	return el;
}

function checklistItem(name, complete, id)
{
	const el = document.createElement("div");
	el.id = id;
	el.style.width = "100%";
	el.textContent = name;
	el.style.display = "flex";
	const checkboxEl = document.createElement("input");
	checkboxEl.type = "checkbox";
	checkboxEl.style.marginLeft = "auto";
	checkboxEl.checked = complete;
	checkboxEl.addEventListener("change", e => {
		setSaveValue(id, e.target.checked);
	});
	el.append(checkboxEl);
	return el;
}

const navTreeStack = [$("#sidebarWrapper")];

function populateSideBar(objectTree, currentPath)
{
	for(let i in objectTree)
	{
		const o = objectTree[i];
		if(typeof o == "object")
		{
			if(o.displayName != undefined && o.complete == undefined)
			{
				// Category
				const categoryEl = categoryDropDown(o.displayName, currentPath + "." + i);
				const stackTop = navTreeStack.at(-1);
				if(stackTop.find("div")[0])
				{
					stackTop.find("div")[0].append(categoryEl);
				}
				else
				{
					stackTop.append(categoryEl);
				}
				navTreeStack.push($(categoryEl));
				populateSideBar(o, currentPath + "." + i);
				navTreeStack.pop();
			}
			else if(o.displayName != undefined && o.complete != undefined)
			{
				// Checklist item
				const checklistItemEl = checklistItem(o.displayName, o.complete, currentPath + "." + i)
				navTreeStack.at(-1).find("div")[0].append(checklistItemEl);
			}
		}
		
	}
}

var completion = 0;
var total = 0;
function getCompletion(parent, objectTree)
{
	if(!parent)
	{
		completion = 0;
		total = 0;
	}

	if(objectTree.complete != undefined)
	{
		if(objectTree.complete)
		{
			completion++;
		}

		total++;
	}
	
	if(typeof objectTree == "object")
	{
		for(let i in objectTree)
		{
			const o = objectTree[i];
			getCompletion(objectTree, o);
		}
	}

	console.log((completion * 100.0 / total).toFixed(2) + "%")
	$("#percentage").text((completion * 100.0 / total).toFixed(2) + "%");
}

$(() => {
	console.log("JQuery initialized.");
	loadSave();
	setSideBarHeight();
	window.addEventListener("resize", e => {
		setSideBarHeight();
	});
	populateSideBar(saveData, "tree");
	getCompletion(undefined, saveData);
});