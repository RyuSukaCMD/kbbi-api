import fetch from "node-fetch";
import { load } from "cheerio";

export default async function handler(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Parameter ?q wajib diisi"
      });
    }

    const url = `https://kbbi.kemdikbud.go.id/entri/${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KBBIScraper/1.0)"
      }
    });

    const html = await response.text();
    const $ = load(html);

    const arti = [];

    $("ul li").each((_, el) => {
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (text) arti.push(text);
    });

    if (arti.length === 0) {
      return res.status(404).json({
        kata: q,
        arti: [],
        message: "Kata tidak ditemukan"
      });
    }

    res.status(200).json({
      kata: q,
      arti
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
}
