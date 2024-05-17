"use client"; 
import React, { useState, useRef } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';
import html2canvas from 'html2canvas';

function TextEditor() {
    const [inputText, setInputText] = useState('');
    const printableRef = useRef();

    const handleInputChange = (e) => {
        setInputText(e.target.value);
    };

    const printHandler = async () => {
        try {
            const input = printableRef.current;
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png'); 

            console.log(imgData);

            const pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage([595, 842]); 

            const pngImage = await pdfDoc.embedPng(imgData);
            const { width, height } = pngImage.scale(1);
            page.drawImage(pngImage, {
                x: 0,
                y: page.getHeight() - height,
                width: width,
                height: height,
            });

            const logoUrl = '/logo.png';
            const logoArrayBuffer = await fetch(logoUrl).then(res => res.arrayBuffer());
            const logo = await pdfDoc.embedPng(logoArrayBuffer);
            const logoDims = logo.scale(0.5);

            page.drawImage(logo, {
                x: 10,
                y: page.getHeight() - logoDims.height - 10,
                width: logoDims.width,
                height: logoDims.height,
            });

            const fontSize = 15;
            page.drawText('Header Text', {
                x: 70,
                y: page.getHeight() - fontSize - 10,
                size: fontSize,
                color: rgb(0, 0, 0),
            });

            page.drawText('Copyright Text', {
                x: 70,
                y: 10,
                size: fontSize - 5,
                color: rgb(0, 0, 0),
            });

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'download.pdf';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error generating PDF", error);
        }
    };

    return (
        <div>
            <textarea value={inputText} onChange={handleInputChange} style={{ width: '100%', height: '200px' }} />
            <button onClick={printHandler}>Print</button>
            <div ref={printableRef} style={{ padding: '20px', backgroundColor: 'white', color: 'black', display: 'block' }}>
                <p>{inputText}</p>
            </div>
        </div>
    );
}

export default TextEditor;
