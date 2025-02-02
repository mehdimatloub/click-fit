$(document).ready(function () {
    $("#loginForm").on("submit", function (event) {
        event.preventDefault();

        let email = $("#email").val();
        let password = $("#password").val();

        $.ajax({
            url: "http://localhost:3000/login",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ email, password }),
            success: function (response) {
                alert("✅ Connexion réussie !");
                
                // Stocker le JWT
                localStorage.setItem("jwt", response.token);

                // Rediriger vers la page principale
                window.location.href = "index.html";
            },
            error: function (xhr) {
                let errorMessage = "❌ Erreur de connexion.";
                if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = "❌ " + xhr.responseJSON.error;
                }
                $("#error-message").text(errorMessage);
            }
        });
    });
});
