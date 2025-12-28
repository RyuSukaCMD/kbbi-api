import { load } from "cheerio";

const POLA_KELAS_KATA =
  /^(n|v|a|adv|num|pron|prep|konj|p|kp|cak|ark|kl)\b/i;

export default async function handler(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Gunakan parameter ?q=kata"
      });
    }

    const url = `https://kbbi.kemdikbud.go.id/entri/${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!response.ok) {
      return res.status(500).json({
        error: "Gagal mengambil data KBBI"
      });
    }

    const html = await response.text();
    const $ = load(html);

    const arti = [];

    $(".container.body-content li").each((_, el) => {
      const text = $(el)
        .text()
        .replace(/\s+/g, " ")
        .trim();

      // HANYA ambil yang benar-benar arti
      if (POLA_KELAS_KATA.test(text)) {
        arti.push(text);
      }
    });

    if (arti.length === 0) {
      return res.status(404).json({
        kata: q,
        arti: [],
        message: "Kata tidak ditemukan"
      });
    }

    return res.status(200).json({
      kata: q,
      arti,
      sumber: "KBBI Kemendikbud"
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
}
