export function downloadArrayBuffer(filename: string, mimetype: string, bytes: ArrayBuffer) {
    var blob = new Blob([bytes], { type: mimetype });
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};
