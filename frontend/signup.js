$(document).ready(function () {
    $("#signupForm").on("submit", function (e) {
        e.preventDefault();

        const name = $("#name").val().trim();
        const email = $("#email").val().trim();
        const password = $("#password").val();
        const confirmPassword = $("#confirmPassword").val();
        const type = $("#type").val();

        // Vérification des champs
        if (!name || !email || !password || !confirmPassword) {
            alert("❌ Tous les champs doivent être remplis.");
            return;
        }

        // Vérifier si l'email est valide
        if (!validateEmail(email)) {
            alert("❌ Veuillez entrer une adresse email valide.");
            return;
        }

        // Vérifier si les mots de passe correspondent
        if (password !== confirmPassword) {
            alert("❌ Les mots de passe ne correspondent pas.");
            return;
        }

        // Vérification de la longueur du mot de passe
        if (password.length < 6) {
            alert("❌ Le mot de passe doit contenir au moins 6 caractères.");
            return;
        }

        // Envoyer les données au backend
        $.ajax({
            url: "http://localhost:3000/register",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email, password, type }),
            success: function (response) {
                alert("✅ Inscription réussie ! Redirection vers la connexion.");
                window.location.href = "login.html";
            },
            error: function (xhr) {
                alert("❌ Erreur lors de l'inscription : " + xhr.responseJSON.error);
            }
        });
    });

    // Fonction de validation d'email
    function validateEmail(email) {
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return re.test(email);
    }
});
