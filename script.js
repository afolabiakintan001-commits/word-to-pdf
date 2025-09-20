const fileInput = document.getElementById("wordFile");
const convertBtn = document.getElementById("convertBtn");
const spinner = document.getElementById("spinner");
const resultDiv = document.getElementById("result");

// Handle drag & drop
document.body.addEventListener("dragover", e => {
  e.preventDefault();
  document.body.style.background = "#f0f8ff";
});
document.body.addEventListener("dragleave", () => {
  document.body.style.background = "";
});
document.body.addEventListener("drop", e => {
  e.preventDefault();
  document.body.style.background = "";
  if (e.dataTransfer.files.length > 0) {
    fileInput.files = e.dataTransfer.files;
  }
});

convertBtn.addEventListener("click", async () => {
  const file = fileInput.files[0];
  resultDiv.innerHTML = "";

  if (!file) {
    resultDiv.innerHTML = `<p style="color:red;font-weight:600;">⚠️ Please select or drop a Word file first.</p>`;
    return;
  }

  spinner.style.display = "block";
  const startTime = Date.now();

  try {
    // Read file
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const text = result.value;

    // Create PDF
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;

    page.drawText(text, {
      x: 50,
      y: height - 50,
      size: fontSize,
      color: rgb(0, 0, 0),
      maxWidth: width - 100
    });

    const pdfBytes = await pdfDoc.save();

    // Ensure spinner shows for at least 5s
    const elapsed = Date.now() - startTime;
    const MIN_TIME = 5000;
    if (elapsed < MIN_TIME) {
      await new Promise(resolve => setTimeout(resolve, MIN_TIME - elapsed));
    }

    // Download link
    const originalName = file.name.replace(/\.[^/.]+$/, "");
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${originalName}.pdf`;
    link.textContent = "⬇️ Download PDF";
    link.style.display = "inline-block";
    link.style.padding = "14px 24px";
    link.style.backgroundColor = "#007BFF";
    link.style.color = "#fff";
    link.style.borderRadius = "10px";
    link.style.textDecoration = "none";
    link.style.fontWeight = "600";

    resultDiv.innerHTML = "";
    resultDiv.appendChild(link);

  } catch (err) {
    resultDiv.innerHTML = `
      <p style="color:red;font-weight:600;">❌ Error converting file. Please reload and try again.</p>
      <button onclick="location.reload()" style="
        padding:12px 20px;
        margin-top:10px;
        font-size:16px;
        border:none;
        border-radius:8px;
        background:#e74c3c;
        color:#fff;
        cursor:pointer;
      ">🔄 Reload Page</button>
    `;
  } finally {
    spinner.style.display = "none";
  }

  // Fallback safety timeout
  setTimeout(() => {
    spinner.style.display = "none";
    if (!resultDiv.hasChildNodes()) {
      resultDiv.innerHTML = `
        <p style="color:red;font-weight:600;">⚠️ Conversion timed out. Please reload and try again.</p>
        <button onclick="location.reload()" style="
          padding:12px 20px;
          margin-top:10px;
          font-size:16px;
          border:none;
          border-radius:8px;
          background:#e74c3c;
          color:#fff;
          cursor:pointer;
        ">🔄 Reload Page</button>
      `;
    }
  }, 15000);
});
