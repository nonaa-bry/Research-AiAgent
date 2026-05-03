import fetch from "node-fetch";

export async function searchWeb(query) {
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1&no_html=1`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const results = [];

    // Abstract (top summary)
    if (data.AbstractText) {
      results.push({
        title: data.Heading || "Abstract",
        snippet: data.AbstractText,
        url: data.AbstractURL || "",
      });
    }

    // Related topics
    if (data.RelatedTopics) {
      for (const topic of data.RelatedTopics.slice(0, 5)) {
        if (topic.Text && topic.FirstURL) {
          results.push({
            title: topic.Text.substring(0, 60),
            snippet: topic.Text,
            url: topic.FirstURL,
          });
        }
      }
    }

    if (results.length === 0) {
      return "No results found for: " + query;
    }

    return results
      .map((r, i) => `[${i + 1}] ${r.title}\n    ${r.snippet}\n    URL: ${r.url}`)
      .join("\n\n");
  } catch (err) {
    return `Search failed: ${err.message}`;
  }
}