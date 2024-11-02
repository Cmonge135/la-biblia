// Listas de libros para los Testamentos
const booksAT = ["genesis", "exodo", "levitico", "numeros", "deuteronomio", "josue", "jueces", "rut", "primeraSamuel", "segundaSamuel",
    "primeraReyes", "segundaReyes", "primeraCronicas", "segundaCronicas", "esdras", "nehemias", "ester", "job", "salmos", "proverbios",
    "eclesiastes", "cantares", "isaias", "jeremias", "lamentaciones", "ezequiel", "daniel", "oseas", "joel", "amos",
    "abdias", "jonas", "miqueas", "nahum", "habacuc", "sofonias", "hageo", "zacarias", "malaquias"];

const booksNT = ["mateo", "marcos", "lucas", "juan", "hechos", "romanos", "primeraCorintios", "segundaCorintios",
    "galatas", "efesios", "filipenses", "colosenses", "primeraTesalonicenses", "segundaTesalonicenses",
    "primeraTimoteo", "segundaTimoteo", "tito", "filemon", "hebreos", "santiago", "primeraPedro", "segundaPedro",
    "primeraJuan", "segundaJuan", "terceraJuan", "judas", "apocalipsis"];

// Función para convertir nombres de libros al formato solicitado
function formatBookName(book) {
    if (book.startsWith("primera")) {
        return "1 " + capitalize(book.slice(7));
    } else if (book.startsWith("segunda")) {
        return "2 " + capitalize(book.slice(7));
    } else if (book.startsWith("tercera")) {
        return "3 " + capitalize(book.slice(7));
    }
    return capitalize(book);
}

// Función auxiliar para capitalizar la primera letra de un libro
function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

// Función para cargar un archivo de JavaScript de un libro específico
function cargarLibro(libro) {
    return new Promise((resolve, reject) => {
        if (window[libro]) {
            resolve(); // Si el libro ya está cargado, no hace falta volver a cargarlo
            return;
        }

        const script = document.createElement("script");
        script.src = `libros/${libro}.js`;
        script.onload = resolve;
        script.onerror = () => reject(new Error(`No se pudo cargar el libro ${libro}`));
        document.head.appendChild(script);
    });
}

// Función para cargar los libros según el testamento seleccionado
function loadBooks() {
    const testament = document.getElementById("testament").value;
    const bookSelect = document.getElementById("book");
    bookSelect.innerHTML = "<option value='' disabled selected>Seleccionar...</option>";

    const books = testament === "at" ? booksAT : booksNT;
    books.forEach(book => {
        const option = document.createElement("option");
        option.value = book;
        option.textContent = formatBookName(book);
        bookSelect.appendChild(option);
    });
}

// Función para cargar capítulos
async function loadChapters() {
    const chapterSelect = document.getElementById("chapter");
    chapterSelect.innerHTML = "<option value='' disabled selected>Seleccionar...</option>";

    const book = document.getElementById("book").value;
    await cargarLibro(book);

    const bookData = window[book];
    if (bookData) {
        for (let i = 1; i <= bookData.length; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `Capítulo ${i}`;
            chapterSelect.appendChild(option);
        }
    }
}

// Función para cargar versículos
async function loadVerses() {
    const verseSelect = document.getElementById("verse");
    verseSelect.innerHTML = "<option value='' disabled selected>Seleccionar...</option>";

    const allOption = document.createElement("option");
    allOption.value = 0;
    allOption.textContent = "Todo el capítulo";
    verseSelect.appendChild(allOption);

    const book = document.getElementById("book").value;
    const chapter = parseInt(document.getElementById("chapter").value) - 1;
    await cargarLibro(book);

    const bookData = window[book];
    if (bookData && bookData[chapter]) {
        for (let i = 1; i <= bookData[chapter].length; i++) {
            const option = document.createElement("option");
            option.value = i;
            option.textContent = `Versículo ${i}`;
            verseSelect.appendChild(option);
        }
    }
    displayChapter();  // Mostrar el contenido del capítulo o versículo seleccionado
}

// Función para mostrar el versículo seleccionado o el capítulo completo
function displayVerse() {
    const verse = parseInt(document.getElementById("verse").value);
    const navigationControls = document.getElementById("navigation-controls");

    if (verse === 0) {
        navigationControls.style.display = "flex";  // Mostrar navegación solo para "Todo el capítulo"
        displayChapter();
    } else {
        navigationControls.style.display = "none";  // Ocultar navegación al mostrar un solo versículo
        const book = document.getElementById("book").value;
        const chapter = parseInt(document.getElementById("chapter").value) - 1;

        const bookData = window[book];
        if (bookData && bookData[chapter] && bookData[chapter][verse - 1]) {
            document.getElementById("verse-display").innerHTML = 
                `<p class="verse"><span class="verse-number">${verse}</span> ${bookData[chapter][verse - 1]}</p>`;
        } else {
            document.getElementById("verse-display").innerHTML = "<p>Versículo no encontrado.</p>";
        }
    }
}


// Función para mostrar el capítulo completo
async function displayChapter() {
    const book = document.getElementById("book").value;
    const chapter = parseInt(document.getElementById("chapter").value) - 1;
    await cargarLibro(book);

    const bookData = window[book];
    let displayText = "";

    if (bookData && bookData[chapter]) {
        displayText = bookData[chapter]
            .map((text, index) => `<p class="verse"><span class="verse-number">${index + 1}</span> ${text}</p>`)
            .join("");
    } else {
        displayText = "<p>Capítulo no encontrado.</p>";
    }

    document.getElementById("verse-display").innerHTML = displayText;
}


// Nueva función para navegar entre capítulos
async function navigateChapter(direction) {
    const book = document.getElementById("book").value;
    const chapterSelect = document.getElementById("chapter");
    const currentChapter = parseInt(chapterSelect.value);

    // Determina el capítulo al cual navegar
    let newChapter = direction === 'next' ? currentChapter + 1 : currentChapter - 1;
    await cargarLibro(book);  // Asegurarse de que el libro esté cargado

    const bookData = window[book];
    if (newChapter > 0 && newChapter <= bookData.length) {
        chapterSelect.value = newChapter;
        loadVerses();  // Cargar los versículos para el nuevo capítulo seleccionado
    }
}


// Función para mostrar sugerencias en la barra de búsqueda
function showSuggestions() {
    const input = document.getElementById("search").value.toLowerCase().trim();
    const suggestionsContainer = document.getElementById("suggestions");
    suggestionsContainer.innerHTML = "";

    if (input.length === 0) return;

    // Expresión regular para encontrar coincidencias de libro, capítulo y versículo
    const regex = /(\d?\s?\w+)\s*(\d*):?(\d*)/;
    const match = input.match(regex);

    if (match) {
        const [_, bookName, chapterNum, verseNum] = match;

        // Encuentra los libros que coincidan con la entrada del usuario
        const matchedBooks = booksAT.concat(booksNT).filter(book => 
            formatBookName(book).toLowerCase().startsWith(bookName)
        );

        matchedBooks.forEach(book => {
            const formattedBook = formatBookName(book);
            const chapterDisplay = chapterNum ? ` ${chapterNum}` : "";
            const verseDisplay = verseNum ? `:${verseNum}` : "";

            // Crear elemento de sugerencia
            const suggestion = document.createElement("div");
            suggestion.className = "suggestion-item";
            suggestion.textContent = `${formattedBook}${chapterDisplay}${verseDisplay}`;
            
            // Añadir evento para seleccionar la sugerencia
            suggestion.addEventListener("click", () => {
                document.getElementById("search").value = suggestion.textContent;
                suggestionsContainer.innerHTML = "";
                searchVerse();  // Llama a la función de búsqueda cuando selecciona una sugerencia
            });

            suggestionsContainer.appendChild(suggestion);
        });
    }
}

// Función de búsqueda con Enter y rango de versículos
async function searchVerse() {
    const query = document.getElementById("search").value.toLowerCase().trim();
    const suggestionsContainer = document.getElementById("suggestions");
    suggestionsContainer.innerHTML = "";  // Limpiar las sugerencias al buscar

    const regex = /(\d?\s?\w+)\s+(\d+):(\d+)(?:-(\d+))?/;
    const match = query.match(regex);

    if (match) {
        const [_, bookName, chapterNum, startVerseNum, endVerseNum] = match;
        
        // Intentar encontrar el libro con un nombre coincidente
        const book = booksAT.concat(booksNT).find(b => 
            formatBookName(b).toLowerCase() === bookName
        );

        if (book) {
            await cargarLibro(book);  // Cargar dinámicamente el libro
            const bookData = window[book];
            const chapterIndex = parseInt(chapterNum) - 1;

            if (bookData && bookData[chapterIndex]) {
                let displayText = "";
                const startVerse = parseInt(startVerseNum);
                const endVerse = endVerseNum ? parseInt(endVerseNum) : startVerse;

                if (startVerse <= endVerse && startVerse > 0 && endVerse <= bookData[chapterIndex].length) {
                    displayText = bookData[chapterIndex]
                        .slice(startVerse - 1, endVerse)
                        .map((text, index) => 
                            `<p class="verse"><span class="verse-number">${startVerse + index}</span> ${text}</p>`
                        )
                        .join("");
                } else {
                    displayText = "<p>Rango de versículos no válido.</p>";
                }

                document.getElementById("verse-display").innerHTML = displayText;
            } else {
                document.getElementById("verse-display").innerHTML = "<p>Capítulo no encontrado.</p>";
            }
        } else {
            document.getElementById("verse-display").innerHTML = "<p>Libro no encontrado.</p>";
        }
    } else {
        document.getElementById("verse-display").innerHTML = "<p>Formato de búsqueda inválido. Usa 'libro capítulo:versículo' o 'libro capítulo:versículo-versículo'.</p>";
    }
}

// Función para detectar Enter en el campo de búsqueda y ejecutar la búsqueda
document.getElementById("search").addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
        searchVerse();  // Ejecutar búsqueda al presionar Enter
    } else {
        showSuggestions();  // Mostrar sugerencias en otros casos
    }
});
