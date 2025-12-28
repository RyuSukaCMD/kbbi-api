import cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        error: "Query parameter ?q=kata wajib diisi"
      });
    }

    const url = `https://kbbi.kemdikbud.go.id/entri/${encodeURIComponent(q)}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; KBBIScraper/1.0; +https://vercel.com)"
      }
    });

    if (!response.ok) {
      return res.status(500).json({
        error: "Gagal mengambil data dari KBBI"
      });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const hasil = [];

    $(".container.body-content .row .col-md-8 ul li").each((_, el) => {
      const teks = $(el)
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (teks) hasil.push(teks);
    });

    if (hasil.length === 0) {
      return res.status(404).json({
        kata: q,
        arti: [],
        message: "Kata tidak ditemukan di KBBI"
      });
    }

    return res.status(200).json({
      kata: q,
      arti: hasil,
      sumber: "KBBI Kemendikbud"
    });
  } catch (err) {
    return res.status(500).json({
      error: "Internal Server Error",
      detail: err.message
    });
  }
}
