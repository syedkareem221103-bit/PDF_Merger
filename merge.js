import PDFMerger from 'pdf-merger-js';

const mergePDFs = async (p1, p2, outputPath) => {
    const merger = new PDFMerger();

    await merger.add(p1);
    await merger.add(p2);

    await merger.save(outputPath);
};

export { mergePDFs };