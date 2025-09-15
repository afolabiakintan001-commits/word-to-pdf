document.getElementById("convertBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("wordFile");
    const file = fileInput.files[0];
    const spinner = document.getElementById("spinner");
    const resultDiv = document.getElementById("result");

    resultDiv.innerHTML = "";
    if (!file) {
        alert("Please select a Word file first.");
        return;
    }

    spinner.style.display = "block";
    const startTime = Date.now();

    try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;

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

        // Ensure spinner is visible at least 5s
        const elapsed = Date.now() - startTime;
        const MIN_TIME = 5000;
        if (elapsed < MIN_TIME) {
            await new Promise(resolve => setTimeout(resolve, MIN_TIME - elapsed));
        }

        const originalName = file.name.replace(/\.[^/.]+$/, "");
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${originalName}.pdf`;
        link.textContent = "Download PDF";
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
            <p style="color:red; font-weight:600;">Error converting file. Please reload and try again.</p>
            <button onclick="location.reload()" style="
                padding:12px 20px;
                margin-top:10px;
                font-size:16px;
                border:none;
                border-radius:8px;
                background:#e74c3c;
                color:#fff;
                cursor:pointer;
            ">Reload Page</button>
        `;
    } finally {
        spinner.style.display = "none";
    }

    // Safety timeout: stop spinner after 15s if still running
    setTimeout(() => {
        spinner.style.display = "none";
        if (!resultDiv.hasChildNodes()) {
            resultDiv.innerHTML = `
                <p style="color:red; font-weight:600;">Conversion timed out. Please reload and try again.</p>
                <button onclick="location.reload()" style="
                    padding:12px 20px;
                    margin-top:10px;
                    font-size:16px;
                    border:none;
                    border-radius:8px;
                    background:#e74c3c;
                    color:#fff;
                    cursor:pointer;
                ">Reload Page</button>
            `;
        }
    }, 15000);
});
