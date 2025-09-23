<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Charger PHPMailer et Dotenv via Composer
require 'vendor/autoload.php';

// Charger les variables d'environnement (.env à la racine du projet)
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $prenom  = htmlspecialchars(trim($_POST["prenom"]));
    $nom     = htmlspecialchars(trim($_POST["nom"]));
    $email   = filter_var($_POST["email"], FILTER_SANITIZE_EMAIL);
    $message = htmlspecialchars(trim($_POST["message"]));

    $mail = new PHPMailer(true);

    try {
        // === Configuration SMTP Gmail ===
        $mail->isSMTP();
        $mail->Host       = $_ENV['SMTP_HOST'];
        $mail->SMTPAuth   = true;
        $mail->Username   = $_ENV['SMTP_USER'];
        $mail->Password   = $_ENV['SMTP_PASS'];
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = $_ENV['SMTP_PORT'];

        // === Expéditeur & Destinataires ===
        $mail->setFrom($_ENV['SMTP_USER'], 'La Prestige du Dolloir');

        // Gestion multi-destinataires (séparés par virgule dans .env)
        $destinataires = explode(',', $_ENV['SMTP_TO']);
        foreach ($destinataires as $dest) {
            $mail->addAddress(trim($dest));
        }

        $mail->addReplyTo($email, "$prenom $nom");

        // === Contenu ===
        $mail->isHTML(true);
        $mail->Subject = "Nouveau message depuis le site La Prestige du Dolloir";
        $mail->Body    = "
            <strong>Prénom :</strong> $prenom<br>
            <strong>Nom :</strong> $nom<br>
            <strong>Email :</strong> $email<br><br>
            <strong>Message :</strong><br>$message
        ";

        // === Envoi ===
        if ($mail->send()) {
            // Message temporaire + redirection automatique
            echo "<p style='color:green; font-size:18px;'>✅ Mail envoyé avec succès !</p>";
            echo "<p>Redirection vers la page de confirmation...</p>";
            echo "<script>setTimeout(() => { window.location.href = 'merci.html'; }, 3000);</script>";
            exit();
        } else {
            echo "<p>❌ Erreur lors de l'envoi : {$mail->ErrorInfo}</p>";
            echo "<p><a href='contact.html'>Retour au formulaire</a></p>";
        }

    } catch (Exception $e) {
        echo "❌ Exception capturée : {$mail->ErrorInfo}";
        echo "<p><a href='contact.html'>Retour au formulaire</a></p>";
    }
} else {
    echo "<p>Méthode non autorisée.</p>";
}
