window.onload = () => {
    let buscador = document.getElementById("search");
    let NombreP = document.getElementById("Nombre_p");
    let paginaActual = 1;
    let isLoading = false;
    const noImagePlaceholder = "./lead-nuclear-power-human-error-homer-simpson-1.jpg";

    const filterRadios = document.getElementsByName("filter"); // Obtiene los filtros
    let selectedFilter = "all"; // Filtro por defecto

    // Escuchar cambios en el filtro
    filterRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            selectedFilter = radio.value;
            paginaActual = 1; // Reiniciar a la primera página
            peticionModerna(); // Actualizar la búsqueda
        });
    });

    NombreP.addEventListener("input", () => {
        let xhr = new XMLHttpRequest();
        let query = NombreP.value.trim();

        if (query.length < 3) {
            document.getElementById("suggestions").innerHTML = "";
            return;
        }

        xhr.open("GET", `https://www.omdbapi.com/?apikey=5784e290&s=${query}&page=1`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                let suggestionsBox = document.getElementById("suggestions");

                suggestionsBox.innerHTML = "";

                if (data.Response === "True") {
                    data.Search.forEach((item) => {
                        let suggestion = document.createElement("div");
                        suggestion.textContent = item.Title;
                        suggestion.className = "suggestion-item";

                        suggestion.addEventListener("click", () => {
                            NombreP.value = item.Title;
                            suggestionsBox.innerHTML = "";
                            peticionModerna();
                        });

                        suggestionsBox.appendChild(suggestion);
                    });
                }
            }
        };
        xhr.onerror = function () {
            console.log("Error al obtener las sugerencias.");
        };
        xhr.send();
    });

    buscador.addEventListener("click", () => {
        paginaActual = 1;
        peticionModerna();
    });

    document.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            paginaActual = 1;
            peticionModerna();
        }
    });

    window.addEventListener("scroll", () => {
        if (isLoading) return;
        const nearBottom = (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 300;
        if (nearBottom) {
            peticionModerna();
        }
    });

    function peticionModerna() {
        isLoading = true;

        // Generar el parámetro "type" según el filtro seleccionado
        let typeFilter = selectedFilter === "all" ? "" : `&type=${selectedFilter}`;

        let xhr = new XMLHttpRequest();
        xhr.open("GET", `https://www.omdbapi.com/?apikey=5784e290&s=${NombreP.value}&page=${paginaActual}${typeFilter}`, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let datosRecibidos = JSON.parse(xhr.responseText);
                if (datosRecibidos.Response === "True") {
                    if (paginaActual === 1) {
                        mostrarTotalResultados(datosRecibidos.totalResults);
                        document.getElementById("movies-list").innerHTML = "";
                    }

                    datosRecibidos.Search.forEach(item => {
                        let subLista = document.createElement("div");
                        let img = document.createElement("img");

                        subLista.className = "movie-container";
                        img.idpeli = item.imdbID;
                        img.src = item.Poster !== "N/A" ? item.Poster : noImagePlaceholder;
                        img.alt = item.Title;
                        img.style.cursor = "pointer";

                        img.addEventListener("click", () => toggleDetalle(item.imdbID, subLista));
                        subLista.appendChild(img);

                        document.getElementById("movies-list").appendChild(subLista);
                    });

                    paginaActual++;
                } else {
                    console.error("No se encontraron resultados.");
                    mostrarTotalResultados(0);
                }
            } else {
                console.log("Error al obtener los datos.");
            }
            isLoading = false;
        };
        xhr.onerror = function () {
            console.log("Error en la solicitud AJAX.");
            isLoading = false;
        };
        xhr.send();
    }

    function mostrarTotalResultados(total) {
        let resultadosExistentes = document.getElementById("totalResultados");
        if (resultadosExistentes) {
            resultadosExistentes.textContent = `Películas encontradas: ${total}`;
        } else {
            let resultados = document.createElement("h3");
            resultados.id = "totalResultados";
            resultados.textContent = `Películas encontradas: ${total}`;
            document.body.prepend(resultados);
        }
    }

    function toggleDetalle(idpeli, container) {
        let detallesExistente = container.querySelector(".detalles");
        if (detallesExistente) {
            detallesExistente.remove();
        } else {
            mostrarDetalles(idpeli, container);
        }
    }

    function mostrarDetalles(idpeli, container) {
        const url = `https://www.omdbapi.com/?i=${idpeli}&apikey=5784e290`;

        let xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.onload = function () {
            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                const modal = document.getElementById("modal");
                const modalDetails = document.getElementById("modal-details");

                modalDetails.innerHTML = "";

                let p1 = document.createElement("p");
                let p2 = document.createElement("p");
                let p3 = document.createElement("p");
                let p4 = document.createElement("p");
                let p5 = document.createElement("p");
                let p6 = document.createElement("p");

                p1.innerHTML = "Título: " + data.Title;
                p2.innerHTML = "Año: " + data.Year;
                p3.innerHTML = "Género: " + data.Genre;
                p4.innerHTML = "Director: " + data.Director;
                p5.innerHTML = "Actores: " + data.Actors;
                p6.innerHTML = "Descripción: " + data.Plot;

                let posterImg = document.createElement("img");
                posterImg.src = data.Poster !== "N/A" ? data.Poster : noImagePlaceholder;
                posterImg.alt = "Póster de la película";

                modalDetails.appendChild(posterImg);
                modalDetails.appendChild(p1);
                modalDetails.appendChild(p2);
                modalDetails.appendChild(p3);
                modalDetails.appendChild(p4);
                modalDetails.appendChild(p5);
                modalDetails.appendChild(p6);

                modal.style.display = "flex";

                const closeModalBtn = document.querySelector(".close-btn");
                closeModalBtn.onclick = () => {
                    modal.style.display = "none";
                };

                window.onclick = (event) => {
                    if (event.target === modal) {
                        modal.style.display = "none";
                    }
                };
            } else {
                console.error("Error al obtener los detalles de la película.");
            }
        };
        xhr.onerror = function () {
            console.log("Error en la solicitud AJAX.");
        };
        xhr.send();
    }

    
};
