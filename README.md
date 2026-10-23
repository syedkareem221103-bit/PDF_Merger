# 📄 PDF Merger Online

A simple and user-friendly web application that allows users to **upload, reorder, merge, and download PDF files online**.

The application is built using **Node.js, Express.js, HTML, CSS, and JavaScript**, with PDF processing handled by `pdf-merger-js`.

---

## 🚀 Features

- 📤 Upload PDF files
- 🖱️ Drag & drop PDF files
- 🔄 Reorder PDFs before merging
- 📱 Mobile-friendly interface
- 👀 Preview the first page of PDFs
- 📄 Display PDF page count
- ❌ Remove individual PDFs
- 🧹 Clear all selected files
- 🔐 Server-side PDF validation
- 📦 Merge PDF files in the selected order
- ⬇️ Download the merged PDF
- 🔗 Copy the download link
- 🌙 Dark mode
- 🛡️ Security headers using Helmet
- 🚦 Rate limiting for merge requests
- 🗑️ Automatic cleanup of temporary uploaded files
- ☁️ Deployable on Render

---

## 🛠️ Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript
- PDF.js

### Backend

- Node.js
- Express.js
- Multer
- pdf-merger-js
- Helmet
- Express Rate Limit

### Deployment

- GitHub
- Render

---

## 📂 Project Structure

```text
PDF_Merge_Project/
│
├── node_modules/
│
├── public/
│   └── generated merged PDFs
│
├── template/
│   └── index.html
│
├── uploads/
│   └── temporary uploaded PDFs
│
├── merge.js
├── server.js
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/PDF_Merger.git
```

### 2. Open the project

```bash
cd PDF_Merger
```

### 3. Install dependencies

```bash
npm install
```

---

## ▶️ Run the Application

Start the server using:

```bash
node server.js
```

The application will run on:

```text
http://localhost:3000
```

Open the URL in your browser.

---

## 📄 How to Use

1. Open the PDF Merger website.
2. Upload two PDF files.
3. Reorder the files if required.
4. Preview the selected PDFs.
5. Click **Merge PDFs**.
6. Wait for the PDF to be processed.
7. Download the merged PDF.

The PDFs are merged in the exact order selected by the user.

---

## 🔐 Security

The application includes several security measures:

- PDF MIME-type validation
- `.pdf` extension validation
- PDF signature validation using `%PDF-`
- Maximum file size of **10 MB**
- Maximum of **2 PDF files per merge**
- Safe server-generated filenames
- Path traversal protection
- Temporary file cleanup
- Helmet security headers
- Rate limiting on the merge endpoint
- Controlled download route
- Internal server paths are not exposed to users

---

## 🧩 PDF Processing

The project uses `pdf-merger-js` to combine the uploaded PDF files.

Example:

```js
const merger = new PDFMerger();

await merger.add(p1);
await merger.add(p2);

await merger.save(outputPath);
```

---

## 🌐 Deployment

The application can be deployed using **Render**.

### Render configuration

```text
Runtime: Node
Branch: main
Build Command: npm install
Start Command: node server.js
```

The server automatically uses Render's assigned port:

```js
const PORT = process.env.PORT || 3000;
```

and listens on:

```js
app.listen(PORT, '0.0.0.0');
```

---

## ⚠️ Important Note About Free Hosting

This project can run on Render's free service for testing and demonstrations.

However, free hosting environments may have limitations such as:

- Services going to sleep after inactivity
- Temporary filesystem storage
- Generated PDFs not being permanent after a restart or redeployment

For a production application requiring permanent PDF storage, an external object-storage service should be considered.

---

## 🔮 Future Improvements

Possible future improvements include:

- Merge more than two PDFs
- PDF page selection
- Delete individual PDF pages
- PDF compression
- PDF splitting
- PDF rotation
- Custom PDF ordering
- User accounts
- Cloud PDF storage
- Custom domain
- Advanced analytics
- Improved SEO and Google Search visibility

---

## 🎯 Purpose

The main purpose of this project is to provide a **simple, fast, and easy-to-use online PDF merging tool** without requiring users to install additional software.

---

## 👨‍💻 Author

**Syed Kareem**

GitHub: `https://github.com/YOUR-USERNAME`

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

## 📜 License

This project is available for educational and personal use.
