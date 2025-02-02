require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./db'); // Importer la connexion MySQL

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true })); 

// 🔹 Servir les fichiers statiques du dossier upload_images
app.use('/upload_images', express.static(path.join(__dirname, 'upload_images')));

// Vérifier et créer le dossier d'upload s'il n'existe pas
const uploadDir = path.join(__dirname, 'upload_images');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware de vérification du Token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    
    if (!token || !token.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Accès refusé. Aucun token fourni." });
    }

    try {
        const decoded = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Token invalide." });
    }
};

// Configuration du stockage des fichiers uploadés
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Limiter la taille des fichiers (10MB max)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // ✅ AJOUT DE LA VIRGULE ICI
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error("❌ Type de fichier non supporté !"));
        }
    }
});


// 🔹 **Route d'upload d'image (Protégée par JWT)**
app.post('/upload', verifyToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }
    const fileUrl = `http://localhost:${port}/upload_images/${req.file.filename}`;
    res.json({ message: "Image uploadée avec succès !", fileUrl });
});

// 🔹 **Route pour recevoir une image en Base64 (Protégée par JWT)**
app.post('/upload-base64', verifyToken, (req, res) => {
    const { image } = req.body;
    if (!image) {
        return res.status(400).json({ message: "Aucun fichier Base64 reçu." });
    }

    try {
        const buffer = Buffer.from(image, 'base64');
        const filename = `image-${Date.now()}.jpg`;
        const filePath = path.join(uploadDir, filename);

        fs.writeFileSync(filePath, buffer);
        const fileUrl = `http://localhost:${port}/upload_images/${filename}`;

        res.json({ message: "Image enregistrée en Base64 !", fileUrl });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'enregistrement de l'image.", error: err.message });
    }
});

// 🔹 **Route pour récupérer la liste des images**
app.get('/images', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Erreur lors de la récupération des fichiers." });
        }
        const fileUrls = files.map(file => `http://localhost:${port}/upload_images/${file}`);
        res.json({ images: fileUrls });
    });
});

// 🔹 **Route pour enregistrer un utilisateur**
app.post('/register', async (req, res) => {
    const { email, password, type } = req.body;
    if (!email || !password || !type) {
        return res.status(400).json({ error: "Tous les champs sont obligatoires." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "CALL addUser(?, ?, ?)";
        db.query(sql, [email, hashedPassword, type], (err, results) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Utilisateur ajouté avec succès !" });
        });

    } catch (error) {
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});

// 🔹 **Route pour la connexion et la génération de JWT**
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email et mot de passe requis." });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: "Utilisateur non trouvé." });

        const user = results[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // 🔥 **Générer un token JWT**
        const token = jwt.sign(
            { id: user.ID, email: user.email, type: user.type },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Connexion réussie !", token });
    });
});

// 🔹 **Gestion des erreurs globales**
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: "Fichier trop volumineux. Max: 10MB." });
    } else if (err) {
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
    next();
});

// 🔹 **Démarrer le serveur**
app.listen(port, () => {
    console.log(` Serveur en cours d'exécution sur http://localhost:${port}`);
});
