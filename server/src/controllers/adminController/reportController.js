// backend/controllers/reportController.js
import puppeteer from "puppeteer";
import Joi from "joi";
import { generateReportHtml } from "../../templates/reportTemplate.js";
import { getMonthlyAggregates } from "../../helpers/dashboardHelper.js";


const reportSchema = Joi.object({
  month: Joi.number()
    .integer()
    .min(1)
    .max(12)
    .required()
    .messages({ "number.base": "Month required as number (1-12)" }),
  year: Joi.number().integer().min(2000).required(),
  villaId: Joi.string().optional().allow(""),
});


export const getReport = async (req, res) => {
  try {
    const { error, value } = reportSchema.validate({ month: Number(req.query.month), year: Number(req.query.year), villaId: req.query.villaId });
    if (error) return res.status(400).json({ success: false, message: error.message });

    const { month, year, villaId } = value;

    const { reportData, totals } = await getMonthlyAggregates(month, year, villaId || null);

    return res.json({ reportData, totals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const exportReportPdf = async (req, res) => {
  try {
    const { error, value } = reportSchema.validate({ month: Number(req.query.month), year: Number(req.query.year), villaId: req.query.villaId });
    if (error) return res.status(400).json({ success: false, message: error.message });

    const { month, year, villaId } = value;

    const { reportData, totals } = await getMonthlyAggregates(month, year, villaId || null);

    const html = generateReportHtml(reportData, totals, month, year);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20mm", right: "10mm", bottom: "20mm", left: "10mm" },
    });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=report-${month}-${year}.pdf`
    );
    res.send(pdfBuffer);
  } catch (err) {
    console.error("Error generating PDF:", err);
    res.status(500).json({ message: "Error generating PDF" });
  }
};


