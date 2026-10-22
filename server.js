import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { unlink } from 'fs/promises';
import { mergePDFs } from './merge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const upload = multer({ dest: 'uploads/' });

app.use('/static', express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

app.post('/merge', upload.array('pdfFiles', 2), async (req, res) => {
    try {
        if (!req.files || req.files.length !== 2) {
            return res.status(400).send('Please upload exactly two PDF files.');
        }

        const file1 = path.join(__dirname, 'uploads', req.files[0].filename);
        const file2 = path.join(__dirname, 'uploads', req.files[1].filename);

        const filename = `merged-${new Date().getTime()}.pdf`;

        const output = path.join(
            __dirname,
            'public',
            filename
        );

        // Merge the two PDFs
        await mergePDFs(
            file1,
            file2,
            output
        );

        // ==========================================
        // AUTOMATIC CLEANUP
        // Delete temporary uploaded PDF files
        // after successful merging
        // ==========================================

        try {

            await unlink(file1);

            console.log(
                `Deleted temporary file: ${req.files[0].filename}`
            );

        } catch (cleanupError) {

            console.error(
                'Could not delete first temporary file:',
                cleanupError.message
            );

        }


        try {

            await unlink(file2);

            console.log(
                `Deleted temporary file: ${req.files[1].filename}`
            );

        } catch (cleanupError) {

            console.error(
                'Could not delete second temporary file:',
                cleanupError.message
            );

        }


        res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">

            <meta
                name="viewport"
                content="width=device-width, initial-scale=1.0"
            >

            <title>PDF Merged Successfully</title>

            <style>

                * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }

                body {
                    min-height: 100vh;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    padding: 20px;

                    font-family:
                        Arial,
                        sans-serif;

                    background:
                        radial-gradient(
                            circle at top left,
                            #c7d2fe,
                            transparent 35%
                        ),

                        radial-gradient(
                            circle at bottom right,
                            #e9d5ff,
                            transparent 35%
                        ),

                        #f8fafc;
                }

                .card {
                    width: 100%;
                    max-width: 520px;

                    padding: 42px;

                    text-align: center;

                    background:
                        rgba(
                            255,
                            255,
                            255,
                            0.92
                        );

                    border-radius: 26px;

                    box-shadow:
                        0 25px 70px
                        rgba(
                            79,
                            70,
                            229,
                            0.15
                        ),

                        0 5px 20px
                        rgba(
                            15,
                            23,
                            42,
                            0.06
                        );
                }

                .success-icon {
                    width: 76px;
                    height: 76px;

                    margin:
                        0
                        auto
                        22px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 50%;

                    background:
                        linear-gradient(
                            135deg,
                            #dcfce7,
                            #bbf7d0
                        );

                    color: #16a34a;

                    font-size: 38px;
                    font-weight: bold;
                }

                h1 {
                    color: #111827;

                    font-size: 30px;

                    margin-bottom: 12px;
                }

                .subtitle {
                    color: #64748b;

                    font-size: 15px;

                    line-height: 1.6;

                    margin-bottom: 28px;
                }

                .file-box {
                    display: flex;
                    align-items: center;

                    gap: 14px;

                    padding: 16px;

                    text-align: left;

                    background: #f8fafc;

                    border:
                        1px solid
                        #e2e8f0;

                    border-radius: 14px;

                    margin-bottom: 22px;
                }

                .pdf-icon {
                    width: 45px;
                    height: 45px;

                    display: flex;
                    align-items: center;
                    justify-content: center;

                    border-radius: 10px;

                    background: #fee2e2;

                    color: #dc2626;

                    font-size: 12px;

                    font-weight: bold;
                }

                .filename {
                    color: #334155;

                    font-size: 14px;

                    font-weight: bold;

                    word-break: break-all;
                }

                .download {
                    display: block;

                    width: 100%;

                    padding: 15px;

                    border-radius: 12px;

                    background:
                        linear-gradient(
                            90deg,
                            #4f46e5,
                            #7c3aed
                        );

                    color: white;

                    text-decoration: none;

                    font-weight: bold;

                    font-size: 15px;

                    box-shadow:
                        0 10px 25px
                        rgba(
                            79,
                            70,
                            229,
                            0.25
                        );

                    transition: 0.2s;
                }

                .download:hover {
                    transform:
                        translateY(-2px);
                }

                .back {
                    display: block;

                    margin-top: 12px;

                    padding: 14px;

                    border:
                        1px solid
                        #e2e8f0;

                    border-radius: 12px;

                    background: white;

                    color: #475569;

                    text-decoration: none;

                    font-weight: bold;
                }

                .back:hover {
                    background: #f8fafc;
                }

                @media (max-width: 600px) {

                    .card {
                        padding:
                            28px
                            20px;
                    }

                    h1 {
                        font-size: 25px;
                    }

                }

            </style>

        </head>

        <body>

            <div class="card">

                <div class="success-icon">
                    ✓
                </div>

                <h1>
                    PDF Merged Successfully!
                </h1>

                <p class="subtitle">
                    Your PDF files have been combined successfully.
                    Your document is ready to download.
                </p>

                <div class="file-box">

                    <div class="pdf-icon">
                        PDF
                    </div>

                    <div class="filename">
                        ${filename}
                    </div>

                </div>

                <a
                    class="download"
                    href="/static/${filename}"
                    download
                >
                    ↓ Download Merged PDF
                </a>

                <a
                    class="back"
                    href="/"
                >
                    ← Merge Another PDF
                </a>

            </div>

        </body>

        </html>
        `);

    } catch (error) {

        console.error(error);

        res.status(500).send(
            'Failed to merge PDFs. Check the terminal for details.'
        );

    }
});

app.listen(port, () => {

    console.log(
        `Server running at http://localhost:${port}`
    );

});