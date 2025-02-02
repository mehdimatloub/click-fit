$(document).ready(function () {

    // ✅ Effet fade-in au chargement de la page
    $(".hero, .info-section, #drop-area").css("opacity", 0).animate({ opacity: 1 }, 1500);

    // ✅ Charger une info du jour depuis l'API
    $.getJSON("http://numbersapi.com/1/30/date?json", function (data) {
        $("#random-fact").text(data.text);
    });

    // ✅ Vérifier si l'utilisateur est connecté (JWT présent)
    const jwtToken = localStorage.getItem("jwt");
    if (!jwtToken) {
        alert("❌ Vous devez être connecté pour uploader une image.");
        window.location.href = "login.html";
        return;
    }

    $("#uploadBtn").prop("disabled", true);
    let selectedFile = null;

    // ✅ Effet dynamique pour la zone de Drag & Drop
    function initializeUploadEvents() {
        console.log("🔄 Initialisation des événements...");

        let dropArea = $("#drop-area");

        dropArea.off("dragover dragleave drop"); // Supprimer événements précédents

        dropArea.on("dragover", function (event) {
            event.preventDefault();
            $(this).css({
                "background-color": "#d6ebff",
                "border": "2px solid #007bff",
                "transition": "all 0.3s ease-in-out"
            });
        });

        dropArea.on("dragleave", function () {
            $(this).css({
                "background-color": "#e3f2fd",
                "border": "2px dashed #007bff"
            });
        });

        dropArea.on("drop", function (event) {
            event.preventDefault();
            let files = event.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                selectedFile = files[0];
                console.log("📂 Fichier détecté via Drag & Drop :", selectedFile.name);

                $("#fileLabel").text(selectedFile.name).css("font-weight", "bold");
                $("#uploadBtn").prop("disabled", false);
            }
        });

        $(document).off("change", "#fileElem").on("change", "#fileElem", function () {
            if (this.files.length > 0) {
                selectedFile = this.files[0];
                console.log("📂 Fichier détecté via input :", selectedFile.name);

                $("#fileLabel").text(selectedFile.name).css("font-weight", "bold");
                $("#uploadBtn").prop("disabled", false);
            }
        });
    }

    // ✅ Effet de vague sur les boutons
    $(".btn").on("click", function (event) {
        let x = event.pageX - $(this).offset().left;
        let y = event.pageY - $(this).offset().top;
        let ripple = $("<span class='ripple'></span>").css({ top: y, left: x });
        $(this).append(ripple);
        setTimeout(() => ripple.remove(), 600);
    });

    // ✅ Animation de Slide-in pour les sections au scroll
    $(window).on("scroll", function () {
        $(".section").each(function () {
            if ($(this).offset().top < $(window).scrollTop() + $(window).height() - 50) {
                $(this).addClass("animate");
            }
        });
    });

    // ✅ Gestion des erreurs pour les liens non fonctionnels
    $("a").on("click", function(event) {
        event.preventDefault();
        alert("🚫 Cette page n'est pas encore disponible.");
    });

    
    $("#uploadBtn").on("click", function () {
        if (!selectedFile) {
            alert("❌ Veuillez sélectionner un fichier avant d’envoyer.");
            return;
        }

        console.log("📂 Fichier détecté avant envoi :", selectedFile.name);
        uploadFile(selectedFile);
    });

    // ✅ Fonction pour uploader le fichier
    function uploadFile(file) {
        let formData = new FormData();
        formData.append("image", file);

        $.ajax({
            url: "http://localhost:3000/upload",
            type: "POST",
            headers: { Authorization: "Bearer " + jwtToken },
            data: formData,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log("✅ Image envoyée :", response);
                console.log("🔗 Image URL retournée :", response.fileUrl);

                let cacheBuster = new Date().getTime(); // ✅ Éviter le cache
                let imageUrl = response.fileUrl.startsWith("http") ? response.fileUrl : window.location.origin + response.fileUrl;
                imageUrl += "?t=" + cacheBuster;

                console.log("🔗 URL corrigée de l'image :", imageUrl);

                $("#drop-area").html(`
                    <p class="text-success text-center"><strong>✅ Image uploadée avec succès !</strong></p>
                    <div class="uploaded-image-container text-center">
                        <img id="uploadedImage" class="img-fluid rounded shadow" width="300" src="${imageUrl}" />
                    </div>
                    <button id="resetUpload" class="btn btn-warning mt-3">Uploader une autre image</button>
                `);

                // ✅ Vérification si l’image charge bien
                $("#uploadedImage").on("load", function() {
                    console.log("✅ Image chargée avec succès !");
                }).on("error", function() {
                    console.error("❌ Erreur de chargement de l'image !");
                    alert("L'image n'a pas pu être chargée. Vérifiez qu'elle est bien enregistrée sur le serveur.");
                });

                $("#uploadBtn").hide();
                selectedFile = null;

                // ✅ Réinitialisation après upload
                $("#resetUpload").off("click").on("click", function () {
                    console.log("🔄 Réinitialisation du champ d'upload...");

                    $("#drop-area").html(`
                        <p>Glissez et déposez une image ici</p>
                        <input type="file" id="fileElem" accept="image/*" style="display: none;">
                        <label for="fileElem" class="btn btn-secondary">Choisir un fichier</label>
                        <span id="fileLabel">Aucun fichier choisi</span>
                    `);

                    selectedFile = null;
                    $("#uploadBtn").show().prop("disabled", true);

                    // Réattache les événements proprement
                    initializeUploadEvents();
                });
            },

            error: function (xhr) {
                console.error("❌ Erreur d'upload :", xhr);
                let errorMessage = "❌ Erreur d'upload !";

                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage += " " + xhr.responseJSON.error;
                }

                $("#drop-area").html(`<p class="text-danger text-center">${errorMessage}</p>`);
            }
        });
    }

    // ✅ Gestion de la déconnexion
    $("#logoutBtn").on("click", function () {
        localStorage.removeItem("jwt");
        alert("✅ Déconnexion réussie !");
        window.location.href = "login.html";
    });

    // ✅ Initialisation des événements au chargement
    initializeUploadEvents();
});
