import { readFile, writeFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const resourcesPath = new URL("resources/resources.json", root);
const timeZone = "Asia/Shanghai";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function todayInTimeZone() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

function githubHeaders(accept = "application/vnd.github+json") {
  const headers = {
    Accept: accept,
    "User-Agent": "awesome-zhuiju-free"
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

async function fetchRepo(fullName) {
  const response = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers: githubHeaders()
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub API failed for ${fullName}: ${response.status} ${body}`);
  }

  return response.json();
}

async function fetchStargazersPage(fullName, page) {
  const response = await fetch(
    `https://api.github.com/repos/${fullName}/stargazers?per_page=100&page=${page}`,
    {
      headers: githubHeaders("application/vnd.github.star+json")
    }
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`GitHub stargazers API failed for ${fullName}: ${response.status} ${body}`);
  }

  return {
    items: await response.json(),
    link: response.headers.get("link") ?? ""
  };
}

function lastPageFromLink(link) {
  const lastLink = link
    .split(",")
    .map((part) => part.trim())
    .find((part) => part.endsWith('rel="last"'));
  return Number(lastLink?.match(/[?&]page=(\d+)/)?.[1] ?? 1);
}

async function fetchWeeklyStars(fullName, currentValue) {
  if (!process.env.GITHUB_TOKEN) {
    console.log(`${fullName}: weekly stars require GITHUB_TOKEN, keep pending value`);
    return currentValue ?? null;
  }

  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const firstPage = await fetchStargazersPage(fullName, 1);
  if (firstPage.items.length === 0) {
    return 0;
  }

  const firstDates = firstPage.items
    .map((item) => Date.parse(item.starred_at ?? ""))
    .filter((timestamp) => !Number.isNaN(timestamp));
  const newestFirst = firstDates[0] >= firstDates.at(-1);

  if (newestFirst) {
    let count = 0;
    let page = 1;
    let currentPage = firstPage;
    while (currentPage.items.length > 0) {
      const dates = currentPage.items
        .map((item) => Date.parse(item.starred_at ?? ""))
        .filter((timestamp) => !Number.isNaN(timestamp));
      count += dates.filter((timestamp) => timestamp >= cutoff).length;
      if (Math.min(...dates) < cutoff) {
        break;
      }
      page += 1;
      currentPage = await fetchStargazersPage(fullName, page);
    }
    return count;
  }

  let count = 0;
  for (let page = lastPageFromLink(firstPage.link); page >= 1; page -= 1) {
    const currentPage = page === 1 ? firstPage : await fetchStargazersPage(fullName, page);
    const dates = currentPage.items
      .map((item) => Date.parse(item.starred_at ?? ""))
      .filter((timestamp) => !Number.isNaN(timestamp));
    count += dates.filter((timestamp) => timestamp >= cutoff).length;
    if (Math.max(...dates) < cutoff) {
      break;
    }
  }
  return count;
}

function replaceGithubStatsBlock(resourcesText, fullName, stats) {
  const pattern = new RegExp(
    `^([ \\t]*)"github":\\s*{\\r?\\n\\s*"full_name":\\s*"${escapeRegExp(fullName)}",\\r?\\n\\s*"stars":\\s*\\d+,\\r?\\n(?:\\s*"weekly_stars":\\s*(?:\\d+|null),\\r?\\n)?\\s*"pushed_at":\\s*"[^"]+"\\r?\\n\\s*}`,
    "m"
  );
  const match = resourcesText.match(pattern);
  if (!match) {
    throw new Error(`${fullName}: cannot locate github stats block`);
  }

  const indent = match[1];
  const replacement = `${indent}"github": {
${indent}  "full_name": "${fullName}",
${indent}  "stars": ${stats.stars},
${indent}  "weekly_stars": ${stats.weeklyStars},
${indent}  "pushed_at": "${stats.pushedAt}"
${indent}}`;
  return resourcesText.replace(pattern, replacement);
}

let resourcesText = await readFile(resourcesPath, "utf8");
const resourcesData = JSON.parse(resourcesText);
let changed = false;

for (const resource of resourcesData.resources) {
  if (resource.category !== "open_source") {
    continue;
  }

  const fullName = resource.github?.full_name;
  if (!fullName) {
    throw new Error(`${resource.id}: open source resource must have github.full_name`);
  }

  const repo = await fetchRepo(fullName);
  const stars = repo.stargazers_count;
  const pushedAt = repo.pushed_at;
  const weeklyStars = await fetchWeeklyStars(fullName, resource.github.weekly_stars);

  if (
    resource.github.stars !== stars ||
    resource.github.weekly_stars !== weeklyStars ||
    resource.github.pushed_at !== pushedAt
  ) {
    resourcesText = replaceGithubStatsBlock(resourcesText, fullName, {
      stars,
      weeklyStars,
      pushedAt
    });
    changed = true;
    const weeklyText = weeklyStars === null ? "pending weekly stars" : `+${weeklyStars} this week`;
    console.log(`${fullName}: ${stars} stars, ${weeklyText}, pushed at ${pushedAt}`);
  } else {
    console.log(`${fullName}: already up to date`);
  }
}

if (changed) {
  resourcesText = resourcesText.replace(
    /("updated_at":\s*)"\d{4}-\d{2}-\d{2}"/,
    `$1"${todayInTimeZone()}"`
  );
  await writeFile(resourcesPath, resourcesText, "utf8");
  console.log("Open source stats updated.");
} else {
  console.log("Open source stats are already up to date.");
}
