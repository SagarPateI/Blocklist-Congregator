const defaultUrls = [
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts",
    "https://s3.amazonaws.com/lists.disconnect.me/simple_tracking.txt"
];

const firebogUrls = {
    ticked: "https://corsproxy.io/?https://v.firebog.net/hosts/lists.php?type=tick",
    nonCrossed: "https://corsproxy.io/?https://v.firebog.net/hosts/lists.php?type=nocross",
    adult: "https://corsproxy.io/?https://v.firebog.net/hosts/lists.php?type=adult",
    all: "https://corsproxy.io/?https://v.firebog.net/hosts/lists.php?type=all"
};

const customLists = [
    "https://phishing.army/download/phishing_army_blocklist.txt",
    "https://raw.githubusercontent.com/hagezi/dns-blocklists/main/domains/multi.txt"
];

const hategroupLists = [
    "https://www.github.developerdan.com/hosts/lists/hate-and-junk-extended.txt",
    "https://raw.githubusercontent.com/marktron/fakenews/master/fakenews",
    "https://raw.githubusercontent.com/StevenBlack/hosts/master/alternates/fakenews-gambling/hosts",
    "https://raw.githubusercontent.com/antifa-n/pihole/master/blocklist.txt",
    "https://raw.githubusercontent.com/antifa-n/pihole/master/blocklist-pop.txt",
    "https://raw.githubusercontent.com/antifa-n/pihole/master/blocklist-alttech.txt",
    "https://raw.githubusercontent.com/chigh/hategroup-dnsbl/master/blocklist.txt"
];

let firebogLists = { ticked: [], nonCrossed: [], adult: [], all: [] };

async function fetchBlocklists() {
    const statusElement = document.getElementById("status");
    const logElement = document.getElementById("log");

    const log = (message, type = "info") => {
        const msg = document.createElement("div");
        msg.textContent = message;
        if (type === "error") msg.style.color = "#ff4d4d";
        logElement.appendChild(msg);
        logElement.scrollTop = logElement.scrollHeight;
    };

    try {
        statusElement.textContent = "Fetching blocklists... Please wait.";
        statusElement.className = "";
        log("Starting blocklist fetching process...");
        logElement.innerHTML = "";

        for (const [key, url] of Object.entries(firebogUrls)) {
            log(`Fetching Firebog ${key} lists...`);
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch Firebog ${key}: ${response.status}`);
            firebogLists[key] = (await response.text()).trim().split("\n");
            log(`Firebog ${key} lists fetched successfully.`);
        }

        updateBlocklists();
        statusElement.textContent = "Blocklists fetched successfully!";
        statusElement.className = "success";
    } catch (error) {
        console.error("Error fetching blocklists:", error);
        statusElement.textContent = "Error fetching blocklists. Please try again.";
        statusElement.className = "error";
        log(`Error: ${error.message}`, "error");
    }
}

function updateBlocklists() {
    const outputElement = document.getElementById("output");
    const logElement = document.getElementById("log");

    const log = (message, type = "info") => {
        const msg = document.createElement("div");
        msg.textContent = message;
        if (type === "error") msg.style.color = "#ff4d4d";
        logElement.appendChild(msg);
        logElement.scrollTop = logElement.scrollHeight;
    };

    const includeDefaultUrls = document.getElementById("defaultUrlsCheckbox").checked;
    const includeFirebogUrls = document.getElementById("firebogUrlsCheckbox").checked;
    const includeCustomLists = document.getElementById("customListsCheckbox").checked;
    const includeHategroupLists = document.getElementById("hategroupListsCheckbox").checked;

    const includeFirebogTicked = document.getElementById("firebogTickedCheckbox").checked;
    const includeFirebogNonCrossed = document.getElementById("firebogNonCrossedCheckbox").checked;
    const includeFirebogAdult = document.getElementById("firebogAdultCheckbox").checked;
    const includeFirebogAll = document.getElementById("firebogAllCheckbox").checked;

    const lists = [
        { name: "Default URLs", urls: includeDefaultUrls ? defaultUrls : [] },
        { name: "Firebog Ticked", urls: includeFirebogUrls && includeFirebogTicked ? firebogLists.ticked : [] },
        { name: "Firebog Non-Crossed", urls: includeFirebogUrls && includeFirebogNonCrossed ? firebogLists.nonCrossed : [] },
        { name: "Firebog Adult", urls: includeFirebogUrls && includeFirebogAdult ? firebogLists.adult : [] },
        { name: "Firebog All", urls: includeFirebogUrls && includeFirebogAll ? firebogLists.all : [] },
        { name: "Custom Lists", urls: includeCustomLists ? customLists : [] },
        { name: "Hate-group Lists", urls: includeHategroupLists ? hategroupLists : [] }
    ];

    const urlTracker = new Map();
    const uniqueUrls = [];

    lists.forEach(({ name, urls }) => {
        urls.forEach((url) => {
            if (url.trim() === "") return;

            if (urlTracker.has(url)) {
                const duplicateSource = urlTracker.get(url);
                log(`Duplicate found: "${url}" already exists in "${duplicateSource}" and "${name}"`, "error");
            } else {
                urlTracker.set(url, name);
                uniqueUrls.push(url);
            }
        });
    });

    outputElement.textContent = uniqueUrls.join("\n");
}

function attachCheckboxListeners() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", updateBlocklists);
    });
}

function copyToClipboard() {
    const outputElement = document.getElementById("output");

    try {
        navigator.clipboard.writeText(outputElement.textContent)
            .then(() => {
                const logElement = document.getElementById("log");
                logElement.innerHTML = "<div class='success'>Blocklists copied to clipboard!</div>";
            })
            .catch((err) => {
                console.error("Error copying to clipboard: ", err);
                const logElement = document.getElementById("log");
                logElement.innerHTML = "<div class='error'>Failed to copy blocklists to clipboard.</div>";
            });
    } catch (err) {
        console.error("Error copying to clipboard: ", err);
        const logElement = document.getElementById("log");
        logElement.innerHTML = "<div class='error'>Failed to copy blocklists to clipboard.</div>";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    fetchBlocklists();
    attachCheckboxListeners();
});
