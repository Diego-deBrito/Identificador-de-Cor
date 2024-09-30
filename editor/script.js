document.getElementById('upload-doc').addEventListener('change', handleFile);
document.getElementById('detect-colors').addEventListener('click', detectColors);

let canvas = document.getElementById('doc-canvas');
let ctx = canvas.getContext('2d');

// Função para lidar com o upload de arquivos
function handleFile(e) {
    const file = e.target.files[0];

    // Verificar se é uma imagem ou um PDF
    if (file.type.startsWith('image/')) {
        loadImage(file);
    } else if (file.type === 'application/pdf') {
        loadPdf(file);
    }
}

// Função para carregar e desenhar uma imagem no canvas
function loadImage(file) {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = function(event) {
        img.src = event.target.result;
    };

    img.onload = function() {
        canvas.style.display = 'block';
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    reader.readAsDataURL(file);
}

// Função para carregar e renderizar um PDF no canvas
function loadPdf(file) {
    const reader = new FileReader();
    reader.onload = function(event) {
        const typedArray = new Uint8Array(event.target.result);
        pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
            pdf.getPage(1).then(function(page) {
                const viewport = page.getViewport({ scale: 1.5 });
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                page.render({
                    canvasContext: ctx,
                    viewport: viewport
                });
            });
        });
    };
    reader.readAsArrayBuffer(file);
}

// Função para detectar as cores no canvas
function detectColors() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    const colorMap = {};

    // Processar cada pixel e contar as cores
    for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const hexColor = rgbToHex(r, g, b);  // Converte para hexadecimal

        if (colorMap[hexColor]) {
            colorMap[hexColor]++;
        } else {
            colorMap[hexColor] = 1;
        }
    }

    // Ordenar as cores pelo número de ocorrências
    const sortedColors = Object.keys(colorMap).sort((a, b) => colorMap[b] - colorMap[a]);

    // Exibir as cores no DOM
    displayColors(sortedColors.slice(0, 10));  // Mostra as 10 cores mais comuns
}

// Função para converter RGB para Hexadecimal
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

// Função auxiliar para converter componente RGB em hex
function componentToHex(c) {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

// Função para exibir as cores detectadas
function displayColors(colors) {
    const colorList = document.getElementById('color-list');
    colorList.innerHTML = '';

    colors.forEach(color => {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;

        const colorCode = document.createElement('div');
        colorCode.className = 'color-code';
        colorCode.innerText = color;

        colorBox.appendChild(colorCode);
        colorList.appendChild(colorBox);
    });
}
