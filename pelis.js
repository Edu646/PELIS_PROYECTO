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

    NombreP.addEventListener("input", () => {       //Crea un input para que el usuario pueda buscar pelis
        let xhr = new XMLHttpRequest(); 
        let query = NombreP.value.trim(); // Elimina espacios en blanco

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

    // Botón para crear informe
    const crearInformeBtn = document.createElement("button");
    crearInformeBtn.textContent = "Crear Informe";

    // Estilo CSS para el botón "Crear Informe"
    crearInformeBtn.style.marginLeft = "10px";
    crearInformeBtn.style.padding = "10px 20px";
    crearInformeBtn.style.backgroundColor = "#4CAF50";
    crearInformeBtn.style.color = "white";
    crearInformeBtn.style.border = "none";
    crearInformeBtn.style.borderRadius = "5px";
    crearInformeBtn.style.cursor = "pointer";

    // Insertar el botón "Crear Informe" a la derecha del botón de búsqueda
    const searchButton = document.getElementById("search");
    searchButton.parentNode.insertBefore(crearInformeBtn, searchButton.nextSibling);

    crearInformeBtn.addEventListener("click", crearInforme);

    function crearInforme() {
        const topRated = obtenerTopPeliculas("imdbRating");
        const topGrossing = obtenerTopPeliculas("BoxOffice");
        const topVoted = obtenerTopPeliculas("imdbVotes");

        mostrarInforme(topRated, topGrossing, topVoted);
        generarGraficas(topRated, topGrossing, topVoted);
    }

    function obtenerTopPeliculas(criterio) {
        // Obtener y ordenar las películas según el criterio
        // Retornar las 5 mejores
        let peliculas = [...document.querySelectorAll(".movie-container")].map(movie => {
            let idpeli = movie.querySelector("img").idpeli;
            const url = `https://www.omdbapi.com/?i=${idpeli}&apikey=5784e290`;

            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send();

            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                return {
                    title: data.Title,
                    [criterio]: data[criterio]
                };
            } else {
                console.error("Error al obtener los detalles de la película.");
                return null;
            }
        }).filter(pelicula => pelicula !== null);

        return peliculas.sort((a, b) => b[criterio] - a[criterio]).slice(0, 5);
    }

    function mostrarInforme(topRated, topGrossing, topVoted) {
        // Crear un modal para mostrar el informe
        const informeModal = document.createElement("div");
        informeModal.style.display = "flex";
        informeModal.style.flexDirection = "column";
        informeModal.style.alignItems = "center";
        informeModal.style.justifyContent = "center";
        informeModal.style.position = "fixed";
        informeModal.style.top = "0";
        informeModal.style.left = "0";
        informeModal.style.width = "100%";
        informeModal.style.height = "100%";
        informeModal.style.background = "rgba(0, 0, 0, 0.7)";
        informeModal.style.color = "#fff";
        informeModal.style.padding = "20px";
        informeModal.style.zIndex = "1000";

        const closeButton = document.createElement("button");
        closeButton.textContent = "Cerrar";
        closeButton.style.marginBottom = "20px";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(informeModal);
        });

        const title = document.createElement("h2");
        title.textContent = "Informe de Películas";

        const topRatedList = generarListaPeliculas("Top Películas por Rating", topRated);
        const topGrossingList = generarListaPeliculas("Top Películas por Taquilla", topGrossing);
        const topVotedList = generarListaPeliculas("Top Películas por Votos", topVoted);

        informeModal.appendChild(closeButton);
        informeModal.appendChild(title);
        informeModal.appendChild(topRatedList);
        informeModal.appendChild(topGrossingList);
        informeModal.appendChild(topVotedList);

        document.body.appendChild(informeModal);
    }

    function generarListaPeliculas(titulo, peliculas) {
        const container = document.createElement("div");
        const header = document.createElement("h3");
        header.textContent = titulo;
        const list = document.createElement("ul");
        list.style.listStyle = "none";
        list.style.padding = "0";

        peliculas.forEach(pelicula => {
            const listItem = document.createElement("li");
            let dato;
            if (titulo.includes("Rating")) {
                dato = pelicula.imdbRating;
            } else if (titulo.includes("Taquilla")) {
                dato = pelicula.BoxOffice;
            } else if (titulo.includes("Votos")) {
                dato = pelicula.imdbVotes;
            }
            listItem.textContent = `${pelicula.title} - ${dato}`;
            list.appendChild(listItem);
        });

        container.appendChild(header);
        container.appendChild(list);
        return container;
    }

    // Botón para crear informe de series
    const crearInformeSeriesBtn = document.createElement("button");
    crearInformeSeriesBtn.textContent = "Crear Informe de Series";

    // Estilo CSS para el botón "Crear Informe de Series"
    crearInformeSeriesBtn.style.marginLeft = "10px";
    crearInformeSeriesBtn.style.padding = "10px 20px";
    crearInformeSeriesBtn.style.backgroundColor = "#2196F3";
    crearInformeSeriesBtn.style.color = "white";
    crearInformeSeriesBtn.style.border = "none";
    crearInformeSeriesBtn.style.borderRadius = "5px";
    crearInformeSeriesBtn.style.cursor = "pointer";

    // Insertar el botón "Crear Informe de Series" a la derecha del botón "Crear Informe"
    crearInformeBtn.parentNode.insertBefore(crearInformeSeriesBtn, crearInformeBtn.nextSibling);

    crearInformeSeriesBtn.addEventListener("click", crearInformeSeries);

    function crearInformeSeries() {
        const topRatedSeries = obtenerTopSeries("imdbRating");
        const topVotedSeries = obtenerTopSeries("imdbVotes");

        mostrarInformeSeries(topRatedSeries, topVotedSeries);
        // Aquí podrías añadir lógica para generar gráficas para series si es necesario
    }

    function mostrarInformeSeries(topRatedSeries, topVotedSeries) {
        // Crear un modal para mostrar el informe de series
        const informeSeriesModal = document.createElement("div");
        informeSeriesModal.style.display = "flex";
        informeSeriesModal.style.flexDirection = "column";
        informeSeriesModal.style.alignItems = "center";
        informeSeriesModal.style.justifyContent = "center";
        informeSeriesModal.style.position = "fixed";
        informeSeriesModal.style.top = "0";
        informeSeriesModal.style.left = "0";
        informeSeriesModal.style.width = "100%";
        informeSeriesModal.style.height = "100%";
        informeSeriesModal.style.background = "rgba(0, 0, 0, 0.7)";
        informeSeriesModal.style.color = "#fff";
        informeSeriesModal.style.padding = "20px";
        informeSeriesModal.style.zIndex = "1000";

        const closeButton = document.createElement("button");
        closeButton.textContent = "Cerrar";
        closeButton.style.marginBottom = "20px";
        closeButton.addEventListener("click", () => {
            document.body.removeChild(informeSeriesModal);
        });

        const title = document.createElement("h2");
        title.textContent = "Informe de Series";

        const topRatedSeriesList = generarListaPeliculas("Top Series por Rating", topRatedSeries);
        const topVotedSeriesList = generarListaPeliculas("Top Series por Votos", topVotedSeries);

        informeSeriesModal.appendChild(closeButton);
        informeSeriesModal.appendChild(title);
        informeSeriesModal.appendChild(topRatedSeriesList);
        informeSeriesModal.appendChild(topVotedSeriesList);

        document.body.appendChild(informeSeriesModal);
    }

    function obtenerTopSeries(criterio) {
        // Obtener y ordenar las series según el criterio
        // Retornar las 5 mejores
        let series = [...document.querySelectorAll(".series-container")].map(serie => {
            let idSerie = serie.querySelector("img").idSerie;
            const url = `https://www.omdbapi.com/?i=${idSerie}&apikey=5784e290`;

            let xhr = new XMLHttpRequest();
            xhr.open("GET", url, false);
            xhr.send();

            if (xhr.status === 200) {
                let data = JSON.parse(xhr.responseText);
                return {
                    title: data.Title,
                    [criterio]: data[criterio]
                };
            } else {
                console.error("Error al obtener los detalles de la serie.");
                return null;
            }
        }).filter(serie => serie !== null);

        return series.sort((a, b) => b[criterio] - a[criterio]).slice(0, 5);
    }
};
