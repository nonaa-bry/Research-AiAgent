import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function readPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; ResearchAgent/1.0)",
      },
      timeout: 10000,
    });

    if (!res.ok) {
      return `Failed to fetch page. Status: ${res.status}`;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Remove noise
    $("script, style, nav, footer, header, iframe, img").remove();

    // Get main content
    let text = $("article, main, .content, .post, body")
      .first()
      .text();

    // Clean up whitespace
    text = text
      .replace(/\s+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    // Limit to ~3000 chars to avoid token overload
    if (text.length > 3000) {
      text = text.substring(0, 3000) + "\n\n[...page truncated...]";
    }

    return text || "Could not extract readable content from this page.";
  } catch (err) {
    return `Error reading page: ${err.message}`;
  }
}