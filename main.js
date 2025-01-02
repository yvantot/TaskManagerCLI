import * as file from "fs/promises";
import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
const rl = readline.createInterface({ input, output });

// Sex is cool, but have you heard of regex?
// I avoid comments because I would rather create a readable code.
// Comments get outdated fast too, and most of the time, they don't really help me.
// However, only time will tell.

// This project taught me that I should prefer promises over callbacks.
// async/await is nice on eyes.

// I wanted to implement SHA-256 for password storing. It'd been very easy to do because SHA-256 is only one-way and I can just use libraries for implementation.
// But, nah. I'll proceed to my next practice.

// Anyway, I could've export the functions to make my file more modular, but nah. I gotta sleep
// PS: I should start learing Typescript because JS is so wonky, like, very unpredictable with its types.

main();

const jsonStructure = {
	users: [],
};

async function initData() {
	let data;
	try {
		data = (await file.readFile("data.json")).toString();
		if (data === "") {
			const newData = await file.writeFile("data.json", JSON.stringify(jsonStructure));
			data = await file.readFile("data.json");
		}
	} catch (error) {
		if (!data) {
			const newData = await file.writeFile("data.json", JSON.stringify(jsonStructure));
			data = await file.readFile("data.json");
		}
	}
	if (data) return await JSON.parse(data.toString());
}

function isCorrectInfo(userdata, username, password) {
	const index = userdata.users.findIndex((user) => user.username === username);
	if (index === -1) return false;
	const user = userdata.users[index];
	if (user.username === username && user.userpass === password) {
		return { userid: user.userid, username: user.username, userpass: user.userpass, tasks: user.tasks };
	}
	return false;
}

function isUnique(userdata, username) {
	const index = userdata.users.findIndex((user) => user.username === username);
	if (index === -1) return true;
	return false;
}

async function createUser(userdata, username, userpass) {
	if (isUnique(userdata, username)) {
		try {
			const size = userdata.users.length;
			const id = size > 0 ? userdata.users[size - 1].userid + 1 : 0;
			userdata.users.push({
				userid: id,
				username,
				userpass,
				tasks: [],
			});
			await file.writeFile("data.json", JSON.stringify(userdata));
			return { userid: id, username, userpass };
		} catch (error) {
			throw error;
		}
	} else {
		return false;
	}
}

function listTasks(user, filter = {}) {
	filter = {
		done: filter.done ?? true,
		ongoing: filter.ongoing ?? true,
		unfinished: filter.unfinished ?? true,
	};
	if (user.tasks.length === 0) {
		console.log("No tasks");
	} else {
		const { done, ongoing, unfinished } = filter;
		const doneTasks = [],
			ongoingTasks = [],
			unfinishedTasks = [];

		user.tasks.forEach((task) => {
			if (task.done) doneTasks.push(`${task.taskid} : ${task.taskname}`);
			if (task.ongoing) ongoingTasks.push(`${task.taskid} : ${task.taskname}`);
			if (task.unfinished) unfinishedTasks.push(`${task.taskid} : ${task.taskname}`);
		});

		if (ongoing) {
			ongoingTasks.length > 0 ? console.log(`\n--Doing--\n${ongoingTasks.join("\n")}`) : console.log("\nNo 'doing' tasks\n");
		}
		if (unfinished) {
			unfinishedTasks.length > 0 ? console.log(`\n--To Start--\n${unfinishedTasks.join("\n")}`) : console.log("\nNo 'todo' tasks\n");
		}
		if (done) {
			doneTasks.length > 0 ? console.log(`\n--Finished--\n${doneTasks.join("\n")}`) : console.log("\nNo 'done' tasks\n");
		}
	}
}

async function markTask(parser, command, user, mark = {}) {
	mark = {
		done: mark.done ?? false,
		ongoing: mark.ongoing ?? false,
		unfinished: mark.unfinished ?? false,
	};
	const { done, ongoing, unfinished } = mark;
	const parsed = parser.exec(command);
	if (parsed === null) return;
	const taskID = parsed[1];
	if (taskID === "") return;
	const taskIndex = user.tasks.findIndex((task) => task.taskid === parseInt(taskID));
	if (taskIndex === -1) return;
	user.tasks[taskIndex].done = done;
	user.tasks[taskIndex].ongoing = ongoing;
	user.tasks[taskIndex].unfinished = unfinished;

	return user;
}

async function userAction(userdata, userid, prompt) {
	let doExit = false;
	const user = userdata.users[userdata.users.findIndex((user) => user.userid === userid)];

	// SUGGESTION: Holy crap, I'm instancing RegExp Objects everytime the user chooses an action :/
	const tasksParser = new RegExp(String.raw`^[ ]*[a-zA-Z]+[\s]+[(]?[ ]*([\d]*)[ ]*[)]?[ ]*"([^"]*)"`);
	const keywordParser = new RegExp(String.raw`^[ ]*([a-zA-Z-]{3,})`);
	const listParser = new RegExp(String.raw`^[ ]*list[ ]+([a-zA-Z]*)[ ]*([a-zA-Z]*)[ ]*([a-zA-Z]*)`);
	const keywordNumParser = new RegExp(String.raw`^[ ]*[a-zA-Z-]{3,}[ ]*[(][ ]*([\d]+)[ ]*[)]$`);

	prompt.split(";").forEach((command) => {
		const input = keywordParser.exec(command);
		if (input === null) return;
		const keyword = input[1].toLowerCase();
		switch (keyword) {
			case "add":
				const task = tasksParser.exec(command)[2];
				const size = user.tasks.length;
				const taskid = size > 0 ? user.tasks[size - 1].taskid + 1 : 0;
				user.tasks.push({
					taskid: taskid,
					taskname: task,
					done: false,
					ongoing: false,
					unfinished: true,
				});
				break;
			case "update":
				const updTaskID = tasksParser.exec(command)[1];
				const newTask = tasksParser.exec(command)[2];
				if (updTaskID === "") return;
				const updTaskIndex = user.tasks.findIndex((task) => task.taskid === parseInt(updTaskID));
				if (updTaskIndex === -1) return;
				user.tasks[updTaskIndex].taskname = newTask;
				break;
			case "list":
				let listAll = false;
				const parsedFilters = listParser.exec(command);
				if (parsedFilters === null) listAll = true;
				if (listAll) {
					listTasks(user);
				} else {
					const validFilters = ["done", "doing", "todo"];
					const filters = [parsedFilters[1], parsedFilters[2], parsedFilters[3]];
					const applyFilters = new Set(filters.filter((filter) => validFilters.includes(filter)));
					listTasks(user, { done: applyFilters.has("done"), ongoing: applyFilters.has("doing"), unfinished: applyFilters.has("todo") });
				}
				break;
			case "delete":
				const delTaskID = keywordNumParser.exec(command)[1];
				if (delTaskID === "") return;
				const delTaskIndex = user.tasks.findIndex((task) => task.taskid === parseInt(delTaskID));
				if (delTaskIndex === -1) return;
				user.tasks.splice(delTaskIndex, 1);
				break;
			case "mark-done":
				markTask(keywordNumParser, command, user, { done: true });
				break;
			case "mark-todo":
				markTask(keywordNumParser, command, user, { unfinished: true });
				break;
			case "mark-doing":
				markTask(keywordNumParser, command, user, { ongoing: true });
				break;
			case "exit":
				doExit = true;
				break;
			default:
				break;
		}
	});
	if (doExit) return true;
	// SUGGESTION: Add a boolean if to write or not
	await file.writeFile("data.json", JSON.stringify(userdata));
}

function userActionUI() {
	return `
-----Choose actions-----
-> list (done|doing|todo)
-> add "task"
-> update (#) "updated task"
-> delete (#)
-> mark-done (#)
-> mark-todo (#)
-> mark-doing (#)
-> exit

Action (e.g add "Clean room"; list): `;
}

async function main() {
	const userdata = await initData();
	const isLogin = await isYesNo("Do you have an account?");
	if (isLogin) {
		const username = await askUser("Username: ", { spaces: false, minlength: 3, maxlength: 20 });
		const password = await askUser("Password: ", { spaces: false, minlength: 8 });
		const user = isCorrectInfo(userdata, username, password);
		if (user) {
			while (true) {
				const choice = await askUser(userActionUI());
				const doExit = await userAction(userdata, user.userid, choice);
				if (doExit) {
					main();
					break;
				}
			}
		}
	} else {
		const isSignin = await isYesNo("Create an account?");
		if (isSignin) {
			const username = await askUser("Username: ", { spaces: false, minlength: 3, maxlength: 20 });
			const password = await askUser("Password: ", { spaces: false, minlength: 8 });
			const user = await createUser(userdata, username, password);
			user ? console.log("\nCreated successfully\n") : console.log("\nFailed to createa an account\n");
		}
	}
	main();
}

function validateString(string, rules = {}) {
	rules = {
		letters: rules.letters ?? true,
		numbers: rules.numbers ?? true,
		underscores: rules.underscores ?? true,
		spaces: rules.spaces ?? true,
		minlength: rules.minlength ?? 0,
		maxlength: rules.maxlength ?? 0,
	};
	const { letters, numbers, underscores, spaces, minlength, maxlength } = rules;
	if (letters === false) {
		if (/[a-zA-Z]/.test(string)) return false;
	}
	if (numbers === false) {
		if (/[0-9]/.test(string)) return false;
	}
	if (underscores === false) {
		if (/[_]/.test(string)) return false;
	}
	if (spaces === false) {
		if (/[\s]/.test(string)) return false;
	}
	if (minlength !== 0) {
		if (string.length < minlength) return false;
	}
	if (maxlength !== 0) {
		if (string.length > maxlength) return false;
	}
	return true;
}

async function askUser(prompt, rules) {
	while (true) {
		const userPrompt = await rl.question(`${prompt}`);
		if (validateString(userPrompt, rules)) return userPrompt;
	}
}

async function isYesNo(prompt) {
	while (true) {
		const isLogin = await rl.question(`${prompt} (y/n): `);

		if (isLogin[0] === "y" || isLogin[0] === "Y") {
			return true;
		} else if (isLogin[0] === "n" || isLogin[0] === "N") {
			return false;
		}
	}
}
