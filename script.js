document.addEventListener("DOMContentLoaded", async e => {
	const navigationBar = document.querySelector("nav");
	navigationBar.addEventListener("click", e => {
		e.preventDefault();
		if (e.target && e.target.matches("a")) {
			const id = e.target.getAttribute("href").substr(2);
			document.getElementById(id).scrollIntoView({behavior: "smooth"});
		}
	});

	const menuButton = document.getElementById("menu");
	document.addEventListener("click", e => {
		if (menuButton.contains(e.target) || navigationBar.contains(e.target)) {
			navigationBar.classList.toggle("selected");
		}
	});
	function fromMonthYearToTimeTag(monthYear) {
		const monthDict = {
			"January": "01",
			"February": "02",
			"March": "03",
			"April": "04",
			"May": "05",
			"June": "06",
			"July": "07",
			"August": "08",
			"September": "09",
			"October": "10",
			"November": "11",
			"December": "12",
		};
		const parts = monthYear.split(" ");
		const time = document.createElement("time");
		time.textContent = monthYear;
		time.dateTime = `${parts[1]}-${monthDict[parts[0]]}`;
		return time;
	}

	const institute = document.querySelector("article.institute");
	const instituteTemplate = institute.cloneNode(true);
	institute.remove();

	const card = document.querySelector("div.card");
	const cardTemplate = card.cloneNode(true);
	card.remove();
	class CardBuilder {
		#card;
		#header;
		#headerText;

		constructor() {
			this.#card = cardTemplate.cloneNode(true);
			this.#header = this.#card.querySelector(".card-header");
			const temp = this.#header.querySelector(".card-header-text");
			this.#headerText = temp.cloneNode();
			temp.remove();
		}

		setURL(url) {
			if (url) {
				this.#header.querySelector("a").href = url;
			}
			return this;
		}

		setImage(image) {
			this.#header.querySelector("img").src = image;
			return this;
		}

		addHeaderText(className, children) {
			const headerText = this.#headerText.cloneNode();
			headerText.classList.add(className);
			if (typeof children === "string") {
				headerText.textContent = children;
			} else {
				for (const node of children) {
					headerText.appendChild(node);
				}
			}
			this.#header.querySelector(".card-header-texts").appendChild(headerText);
			return this;
		}

		setDescription(descs) {
			const description = this.#card.querySelector(".card-description > ul");
			for (const desc of descs) {
				const li = document.createElement("li");
				li.textContent = desc;
				description.appendChild(li);
			}
			return this;
		}

		build() {
			return this.#card;
		}
	}

	const project = document.querySelector("article.project");
	const projectTemplate = project.cloneNode(true);
	project.remove();

	const dataRes = await fetch("data.json");
	const dataJson = await dataRes.json();

	// Biography
	const home = document.getElementById("home").querySelector(".content");
	for (const paragraph of dataJson.summary) {
		const p = document.createElement("p");
		p.textContent = paragraph;
		home.appendChild(p);
	}

	// Education
	function applyEducation(eduJson) {
		const institute = instituteTemplate.cloneNode(true);
		institute.querySelector(".institute-header-text").textContent = eduJson.institute;
		institute.querySelector(".institute-header-logo img").src = eduJson.image;
		institute.querySelector(".institute-header-logo a").href = eduJson.url;
		const cards = institute.querySelector(".cards");
		for (const cred of eduJson.credentials) {
			const cardBuilder = new CardBuilder()
				.setImage(cred.image)
				.setURL(cred.url)
				.addHeaderText("title", cred.title)
				.addHeaderText("type", cred.type[0].toUpperCase() + cred.type.substr(1));
			if (cred.type === "certificate") {
				cardBuilder.addHeaderText("date-earned", [
					document.createTextNode("Earned: "),
					fromMonthYearToTimeTag(cred["date-earned"])
				])
				.addHeaderText("date-expires", [
					document.createTextNode("Expires: "),
					fromMonthYearToTimeTag(cred["date-expires"])
				]);
			} else if (cred.type === "degree") {
				cardBuilder.addHeaderText("date-range", [
					fromMonthYearToTimeTag(cred["date-started"]),
					document.createTextNode(" - "),
					fromMonthYearToTimeTag(cred["date-ended"])
				]);
			}
			const card = cardBuilder.build();
			cards.appendChild(card);
		}
		return institute;
	}

	const education = document.querySelector("#education");
	dataJson.education.map(applyEducation).forEach(e => education.appendChild(e));

	// Experience
	function applyExperience(expJson) {
		const card = new CardBuilder()
			.setURL(expJson.url)
			.setImage(expJson.image)
			.addHeaderText("position", expJson.position)
			.addHeaderText("company", expJson.company)
			.addHeaderText("location", expJson.location)
			.addHeaderText("date-range", [
				fromMonthYearToTimeTag(expJson["date-started"]),
				document.createTextNode(" - "),
				fromMonthYearToTimeTag(expJson["date-ended"])
			])
			.setDescription(expJson.description)
			.build()
		return card;
	}
	
	const experience = document.querySelector("#experience div.cards");
	dataJson.experience.map(applyExperience).forEach(e => experience.appendChild(e));

	// Projects
	function applyProject(projectJson) {
		const project = projectTemplate.cloneNode(true);
		project.querySelector("h2").textContent = projectJson.title;
		const stackList = project.querySelector("ul.project-stack");
		const description = project.querySelector("ul.project-description");
		for (const tech of projectJson.stack) {
			const li = document.createElement("li");
			li.textContent = tech;
			stackList.appendChild(li);
		}
		for (const desc of projectJson.description) {
			const li = document.createElement("li");
			li.textContent = desc;
			description.appendChild(li);
		}

		const figure = project.querySelector("figure");
		if (projectJson.image !== null) {
			figure.querySelector("img").src = projectJson.image;
			figure.querySelector("a").href = projectJson.image;
		} else {
			figure.remove();
		}

		const info = project.querySelector(".project-information");
		if (projectJson.url !== null) {
			const a = document.createElement("a");
			a.textContent = "View project";
			a.classList.add("project-view");
			a.href = projectJson.url;
			a.setAttribute("target", "_blank");
			a.setAttribute("rel", "noreferrer");
			info.appendChild(a);
		}

		if (projectJson.extras) {
			for (const extra of projectJson.extras) {
				const a = document.createElement("a");
				a.textContent = extra.title;
				a.href = extra.url;
				a.setAttribute("target", "_blank");
				a.setAttribute("rel", "noreferrer");
				info.appendChild(a);
			}
		}
		return project;
	}

	const projects = document.querySelector("#projects div.projects");
	dataJson.projects.map(applyProject).forEach(p => projects.appendChild(p));
	document.getElementById("loading").remove();
	document.getElementById("nonready-sections").remove();
}, { once: true });
