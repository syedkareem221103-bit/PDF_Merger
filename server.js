import express from 'express';
import path from 'path';
import multer from 'multer';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { unlink, readFile } from 'fs/promises';

import { mergePDFs } from './merge.js';


// =====================================================
// BASIC SETUP
// =====================================================

const app = express();

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// =====================================================
// FOLDERS
// =====================================================

const uploadFolder = path.join(__dirname, 'uploads');
const publicFolder = path.join(__dirname, 'public');
const templateFolder = path.join(__dirname, 'template');


// =====================================================
// SECURITY SETTINGS
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 2;


// =====================================================
// SECURITY HEADERS
// =====================================================

app.use(
    helmet({
        contentSecurityPolicy: false
    })
);


// =====================================================
// RATE LIMITING
// =====================================================

// Protect the merge endpoint from excessive requests.

const mergeLimiter = rateLimit({

    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 20, // maximum 20 merge requests

    standardHeaders: true,

    legacyHeaders: false,

    message: {
        error: 'Too many requests. Please try again later.'
    }
});


// =====================================================
// MULTER CONFIGURATION
// =====================================================

const upload = multer({

    dest: uploadFolder,

    limits: {
        fileSize: MAX_FILE_SIZE,
        files: MAX_FILES
    },

    fileFilter: (req, file, cb) => {

        const extension =
            path.extname(file.originalname).toLowerCase();

        if (
            file.mimetype === 'application/pdf' &&
            extension === '.pdf'
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF files are allowed.'));
        }
    }
});


// =====================================================
// FILE CLEANUP
// =====================================================

const cleanupFiles = async (files = []) => {

    for (const file of files) {

        try {

            await unlink(file.path);

            console.log(
                `Deleted temporary file: ${file.filename}`
            );

        } catch {

            // Ignore cleanup errors.
        }
    }
};


// =====================================================
// ACTUAL PDF SIGNATURE VALIDATION
// =====================================================

// A genuine PDF normally starts with:
//
// %PDF-
//
// MIME type and file extension can be faked,
// so we check the actual file contents.

const isRealPDF = async (filePath) => {

    try {

        const buffer = await readFile(filePath);

        if (buffer.length < 5) {
            return false;
        }

        const header =
            buffer.subarray(0, 5).toString('ascii');

        return header === '%PDF-';

    } catch {

        return false;
    }
};


// =====================================================
// HOME PAGE
// =====================================================

app.get('/', (req, res) => {

    res.sendFile(
        path.join(templateFolder, 'index.html')
    );
});


// =====================================================
// MERGE PDF ROUTE
// =====================================================

app.post(
    '/merge',
    mergeLimiter,
    (req, res, next) => {

        upload.array('pdfFiles', MAX_FILES)(
            req,
            res,
            async (err) => {

                // =============================================
                // MULTER ERROR
                // =============================================

                if (err) {

                    await cleanupFiles(req.files || []);

                    if (err instanceof multer.MulterError) {

                        if (err.code === 'LIMIT_FILE_SIZE') {

                            return res.status(400).send(`
                                <!DOCTYPE html>

                                <html>
                                <head>
                                    <title>File Too Large</title>

                                    <style>
                                        body {
                                            margin: 0;
                                            min-height: 100vh;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-family: Arial, sans-serif;
                                            background: #f5f7fb;
                                        }

                                        .box {
                                            width: 90%;
                                            max-width: 500px;
                                            background: white;
                                            padding: 40px;
                                            border-radius: 20px;
                                            text-align: center;
                                            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                                        }

                                        h1 {
                                            color: #dc2626;
                                        }

                                        p {
                                            color: #555;
                                            line-height: 1.6;
                                        }

                                        a {
                                            display: inline-block;
                                            margin-top: 20px;
                                            padding: 12px 22px;
                                            background: #4f46e5;
                                            color: white;
                                            text-decoration: none;
                                            border-radius: 10px;
                                        }
                                    </style>
                                </head>

                                <body>

                                    <div class="box">

                                        <h1>File Too Large</h1>

                                        <p>
                                            Each PDF must be 10 MB or smaller.
                                        </p>

                                        <a href="/">
                                            Go Back
                                        </a>

                                    </div>

                                </body>
                                </html>
                            `);
                        }


                        if (err.code === 'LIMIT_FILE_COUNT') {

                            return res.status(400).send(`
                                <!DOCTYPE html>

                                <html>
                                <head>
                                    <title>Too Many Files</title>

                                    <style>
                                        body {
                                            margin: 0;
                                            min-height: 100vh;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-family: Arial, sans-serif;
                                            background: #f5f7fb;
                                        }

                                        .box {
                                            width: 90%;
                                            max-width: 500px;
                                            background: white;
                                            padding: 40px;
                                            border-radius: 20px;
                                            text-align: center;
                                            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
                                        }

                                        h1 {
                                            color: #dc2626;
                                        }

                                        p {
                                            color: #555;
                                            line-height: 1.6;
                                        }

                                        a {
                                            display: inline-block;
                                            margin-top: 20px;
                                            padding: 12px 22px;
                                            background: #4f46e5;
                                            color: white;
                                            text-decoration: none;
                                            border-radius: 10px;
                                        }
                                    </style>
                                </head>

                                <body>

                                    <div class="box">

                                        <h1>Too Many Files</h1>

                                        <p>
                                            You can upload a maximum of 2 PDF files.
                                        </p>

                                        <a href="/">
                                            Go Back
                                        </a>

                                    </div>

                                </body>
                                </html>
                            `);
                        }

                        return res.status(400).send(`
                            <!DOCTYPE html>

                            <html>
                            <head>
                                <title>Upload Error</title>
                            </head>

                            <body>

                                <h1>Upload Error</h1>

                                <p>
                                    Please check your files and try again.
                                </p>

                                <a href="/">
                                    Go Back
                                </a>

                            </body>
                            </html>
                        `);
                    }


                    return res.status(400).send(`
                        <!DOCTYPE html>

                        <html>
                        <head>
                            <title>Invalid File</title>
                        </head>

                        <body>

                            <h1>Invalid File</h1>

                            <p>
                                Only valid PDF files are allowed.
                            </p>

                            <a href="/">
                                Go Back
                            </a>

                        </body>
                        </html>
                    `);
                }


                next();
            }
        );

    },

    async (req, res) => {

        // =================================================
        // CHECK FILE COUNT
        // =================================================

        if (!req.files || req.files.length !== 2) {

            await cleanupFiles(req.files || []);

            return res.status(400).send(`
                <!DOCTYPE html>

                <html>

                <head>
                    <title>Invalid Upload</title>
                </head>

                <body>

                    <h1>Invalid Upload</h1>

                    <p>
                        Please upload exactly 2 PDF files.
                    </p>

                    <a href="/">
                        Go Back
                    </a>

                </body>

                </html>
            `);
        }


        // =================================================
        // VERIFY ACTUAL PDF CONTENT
        // =================================================

        for (const file of req.files) {

            const validPDF =
                await isRealPDF(file.path);

            if (!validPDF) {

                await cleanupFiles(req.files);

                return res.status(400).send(`
                    <!DOCTYPE html>

                    <html>

                    <head>
                        <title>Invalid PDF</title>

                        <style>

                            body {
                                margin: 0;
                                min-height: 100vh;

                                display: flex;
                                align-items: center;
                                justify-content: center;

                                font-family: Arial, sans-serif;

                                background: #f5f7fb;
                            }

                            .box {
                                width: 90%;
                                max-width: 500px;

                                background: white;

                                padding: 40px;

                                border-radius: 20px;

                                text-align: center;

                                box-shadow:
                                    0 10px 40px
                                    rgba(0,0,0,0.1);
                            }

                            h1 {
                                color: #dc2626;
                            }

                            p {
                                color: #555;
                                line-height: 1.6;
                            }

                            a {
                                display: inline-block;

                                margin-top: 20px;

                                padding: 12px 22px;

                                background: #4f46e5;

                                color: white;

                                text-decoration: none;

                                border-radius: 10px;
                            }

                        </style>

                    </head>

                    <body>

                        <div class="box">

                            <h1>
                                Invalid PDF
                            </h1>

                            <p>
                                One of the uploaded files is
                                not a valid PDF.
                            </p>

                            <a href="/">
                                Try Again
                            </a>

                        </div>

                    </body>

                    </html>
                `);
            }
        }


        // =================================================
        // TEMPORARY FILE PATHS
        // =================================================

        const file1 = req.files[0].path;
        const file2 = req.files[1].path;


        // =================================================
        // SERVER-GENERATED OUTPUT NAME
        // =================================================

        const outputFileName =
            `merged-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 10)}.pdf`;

        const outputPath =
            path.join(publicFolder, outputFileName);


        try {

            // =================================================
            // MERGE
            // =================================================

            await mergePDFs(
                file1,
                file2,
                outputPath
            );


            // =================================================
            // DELETE TEMPORARY UPLOADS
            // =================================================

            await cleanupFiles(req.files);


            console.log(
                `PDF merge successful: ${outputFileName}`
            );


            // =================================================
            // SUCCESS PAGE
            // =================================================

            res.send(`
                <!DOCTYPE html>

                <html lang="en">

                <head>

                    <meta charset="UTF-8">

                    <meta
                        name="viewport"
                        content="width=device-width, initial-scale=1.0"
                    >

                    <title>PDF Ready</title>

                    <style>

                        * {
                            box-sizing: border-box;
                        }

                        body {
                            margin: 0;
                            min-height: 100vh;

                            display: flex;
                            align-items: center;
                            justify-content: center;

                            padding: 20px;

                            font-family:
                                -apple-system,
                                BlinkMacSystemFont,
                                "Segoe UI",
                                Arial,
                                sans-serif;

                            background:
                                linear-gradient(
                                    135deg,
                                    #667eea,
                                    #764ba2
                                );
                        }

                        .container {
                            width: 100%;
                            max-width: 520px;

                            background: white;

                            border-radius: 24px;

                            padding: 45px 35px;

                            text-align: center;

                            box-shadow:
                                0 25px 70px
                                rgba(0, 0, 0, 0.25);
                        }

                        .success-icon {

                            width: 85px;
                            height: 85px;

                            margin: 0 auto 25px;

                            display: flex;
                            align-items: center;
                            justify-content: center;

                            border-radius: 50%;

                            background: #dcfce7;

                            font-size: 42px;
                        }

                        h1 {

                            margin: 0 0 10px;

                            font-size: 32px;

                            color: #111827;
                        }

                        .subtitle {

                            margin: 0 0 25px;

                            color: #6b7280;

                            line-height: 1.6;
                        }

                        .filename {

                            background: #f3f4f6;

                            border-radius: 12px;

                            padding: 14px;

                            margin-bottom: 25px;

                            font-size: 14px;

                            color: #374151;

                            word-break: break-all;
                        }

                        .download-btn {

                            display: block;

                            width: 100%;

                            padding: 16px;

                            border-radius: 12px;

                            background:
                                linear-gradient(
                                    135deg,
                                    #667eea,
                                    #764ba2
                                );

                            color: white;

                            text-decoration: none;

                            font-size: 17px;

                            font-weight: 600;

                            margin-bottom: 12px;
                        }

                        .copy-btn {

                            width: 100%;

                            padding: 14px;

                            border: 1px solid #d1d5db;

                            border-radius: 12px;

                            background: white;

                            color: #374151;

                            font-size: 15px;

                            cursor: pointer;
                        }

                        .again-btn {

                            display: block;

                            margin-top: 18px;

                            color: #667eea;

                            text-decoration: none;

                            font-weight: 500;
                        }

                        .security {

                            margin-top: 25px;

                            padding-top: 20px;

                            border-top: 1px solid #e5e7eb;

                            color: #6b7280;

                            font-size: 13px;

                            line-height: 1.5;
                        }

                    </style>

                </head>


                <body>

                    <div class="container">

                        <div class="success-icon">
                            ✓
                        </div>

                        <h1>
                            Your PDF is Ready!
                        </h1>

                        <p class="subtitle">
                            Your two PDF files have been successfully merged.
                        </p>

                        <div class="filename">
                            ${outputFileName}
                        </div>

                        <a
                            class="download-btn"
                            href="/download/${outputFileName}"
                            download
                        >
                            Download Merged PDF
                        </a>

                        <button
                            class="copy-btn"
                            onclick="copyLink()"
                        >
                            Copy Download Link
                        </button>

                        <a
                            class="again-btn"
                            href="/"
                        >
                            ← Merge Another PDF
                        </a>

                        <div class="security">

                            🔒 Your uploaded temporary PDF files
                            were automatically removed from the server.

                        </div>

                    </div>


                    <script>

                        function copyLink() {

                            const link =
                                window.location.origin +
                                "/download/${outputFileName}";

                            navigator.clipboard
                                .writeText(link)
                                .then(() => {

                                    const button =
                                        document.querySelector(".copy-btn");

                                    button.textContent =
                                        "✓ Link Copied!";

                                    setTimeout(() => {

                                        button.textContent =
                                            "Copy Download Link";

                                    }, 2000);

                                })
                                .catch(() => {

                                    alert(
                                        "Unable to copy the link."
                                    );

                                });

                        }

                    </script>

                </body>

                </html>
            `);

        } catch (error) {

            // =================================================
            // CLEANUP ON FAILURE
            // =================================================

            await cleanupFiles(req.files);


            try {

                await unlink(outputPath);

            } catch {
                // Output may not exist.
            }


            console.error(
                'PDF merge failed:',
                error.message
            );


            res.status(500).send(`
                <!DOCTYPE html>

                <html>

                <head>
                    <title>Merge Failed</title>
                </head>

                <body>

                    <h1>
                        PDF Merge Failed
                    </h1>

                    <p>
                        Something went wrong while merging
                        your PDF files.
                    </p>

                    <a href="/">
                        Try Again
                    </a>

                </body>

                </html>
            `);
        }
    }
);


// =====================================================
// SECURE DOWNLOAD ROUTE
// =====================================================

// We intentionally DO NOT use:
//
// app.use('/static', express.static(publicFolder))
//
// Instead, files are delivered through this controlled route.

app.get('/download/:filename', async (req, res) => {

    const filename = req.params.filename;


    // =================================================
    // SAFE FILENAME CHECK
    // =================================================

    // Only our generated filenames are accepted.

    const safeFilename =
        /^merged-\d+-[a-z0-9]+\.pdf$/i.test(filename);

    if (!safeFilename) {

        return res.status(400).send(
            'Invalid download link.'
        );
    }


    const filePath =
        path.join(publicFolder, filename);


    try {

        // Verify file exists
        await readFile(filePath);


        // Force download
        res.download(
            filePath,
            filename,
            {
                headers: {
                    'Cache-Control':
                        'no-store, no-cache, must-revalidate, private',

                    'Pragma': 'no-cache',

                    'Expires': '0'
                }
            },
            (error) => {

                if (error) {

                    console.error(
                        'Download error:',
                        error.message
                    );
                }
            }
        );

    } catch {

        return res.status(404).send(
            'PDF not found or it has expired.'
        );
    }
});


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).send(`
        <!DOCTYPE html>

        <html>

        <head>
            <title>404 - Not Found</title>
        </head>

        <body>

            <h1>404 - Not Found</h1>

            <p>
                The requested resource does not exist.
            </p>

            <a href="/">
                Go Home
            </a>

        </body>

        </html>
    `);
});


// =====================================================
// GLOBAL ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

    console.error(
        'Server error:',
        err.message
    );

    res.status(500).send(
        'Something went wrong. Please try again.'
    );
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, '0.0.0.0', () => {

    console.log(
        `PDF Merger running at http://localhost:${PORT}`
    );

});