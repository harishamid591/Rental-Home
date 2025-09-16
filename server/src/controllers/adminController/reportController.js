// backend/controllers/reportController.js
import puppeteer from "puppeteer";
import { generateReportHtml } from "../../templates/reportTemplate.js";
import { getMonthlyAggregates } from "../../helpers/dashboardHelper.js";



export const getReport = async (req, res) => {
  try {
    const { month, year, villaId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }

    const { reportData, totals } = await getMonthlyAggregates(Number(month), Number(year), villaId);

    return res.json({ reportData, totals });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const exportReportPdf = async (req, res) => {
  try {
    const { month, year, villaId } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year required" });
    }

    const { reportData, totals } = await getMonthlyAggregates(Number(month), Number(year), villaId);

    const html = generateReportHtml(reportData, totals, month, year);

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
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


