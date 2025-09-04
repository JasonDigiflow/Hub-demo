#!/bin/bash
# sync_base.sh - Script idempotent pour extraire la base landing + socle UI/UX
# Source: /Users/jasonsotoca/Developer/digiflow-hub-0209
# Cible: /Users/jasonsotoca/Developer/DH-v4-0209

set -e

SOURCE_DIR="/Users/jasonsotoca/Developer/digiflow-hub-0209"
TARGET_DIR="/Users/jasonsotoca/Developer/DH-v4-0209"
SCRIPT_DIR="$TARGET_DIR/scripts"

echo "🔄 Synchronisation de la base landing + socle UI/UX"
echo "📁 Source: $SOURCE_DIR"
echo "📁 Cible: $TARGET_DIR"
echo ""

# Vérifier que la source existe
if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ Erreur: Le dossier source n'existe pas: $SOURCE_DIR"
    exit 1
fi

# Créer la cible si elle n'existe pas
if [ ! -d "$TARGET_DIR" ]; then
    echo "📂 Création du dossier cible..."
    mkdir -p "$TARGET_DIR"
fi

# Préserver .git si présent
if [ -d "$TARGET_DIR/.git" ]; then
    echo "💾 Préservation du dossier .git existant..."
    mv "$TARGET_DIR/.git" "/tmp/.git_backup_$$"
fi

# Nettoyer la cible (sauf scripts/)
echo "🧹 Nettoyage du dossier cible (sauf scripts/)..."
find "$TARGET_DIR" -mindepth 1 -maxdepth 1 ! -name "scripts" -exec rm -rf {} \;

# Restaurer .git si sauvegardé
if [ -d "/tmp/.git_backup_$$" ]; then
    echo "♻️ Restauration du dossier .git..."
    mv "/tmp/.git_backup_$$" "$TARGET_DIR/.git"
fi

# Copie manuelle des fichiers et dossiers nécessaires
echo "📦 Copie des fichiers de la whitelist..."

# Fichiers de config à la racine
for file in package.json package-lock.json next.config.js tailwind.config.js postcss.config.js jsconfig.json; do
    if [ -f "$SOURCE_DIR/$file" ]; then
        cp "$SOURCE_DIR/$file" "$TARGET_DIR/" 2>/dev/null && echo "   ✓ $file"
    fi
done

# Créer les dossiers nécessaires
mkdir -p "$TARGET_DIR/app"
mkdir -p "$TARGET_DIR/components/ui"
mkdir -p "$TARGET_DIR/components/home"
mkdir -p "$TARGET_DIR/components/layout"
mkdir -p "$TARGET_DIR/components/chat"
mkdir -p "$TARGET_DIR/components/three"
mkdir -p "$TARGET_DIR/components/icons"
mkdir -p "$TARGET_DIR/lib"
mkdir -p "$TARGET_DIR/public"
mkdir -p "$TARGET_DIR/styles"

# Copier les fichiers app
if [ -f "$SOURCE_DIR/app/page.js" ]; then
    cp "$SOURCE_DIR/app/page.js" "$TARGET_DIR/app/" && echo "   ✓ app/page.js"
fi
if [ -f "$SOURCE_DIR/app/layout.js" ]; then
    cp "$SOURCE_DIR/app/layout.js" "$TARGET_DIR/app/" && echo "   ✓ app/layout.js"
fi
if [ -f "$SOURCE_DIR/app/globals.css" ]; then
    cp "$SOURCE_DIR/app/globals.css" "$TARGET_DIR/app/" && echo "   ✓ app/globals.css"
fi

# Copier les pages marketing si elles existent
if [ -d "$SOURCE_DIR/app/privacy" ]; then
    cp -r "$SOURCE_DIR/app/privacy" "$TARGET_DIR/app/" && echo "   ✓ app/privacy/"
fi
if [ -d "$SOURCE_DIR/app/terms" ]; then
    cp -r "$SOURCE_DIR/app/terms" "$TARGET_DIR/app/" && echo "   ✓ app/terms/"
fi

# Copier les composants UI
for comp in Button GlassCard Input; do
    if [ -f "$SOURCE_DIR/components/ui/$comp.jsx" ]; then
        cp "$SOURCE_DIR/components/ui/$comp.jsx" "$TARGET_DIR/components/ui/" && echo "   ✓ components/ui/$comp.jsx"
    fi
done

# Copier les composants home
for comp in TestimonialsSection FAQSection; do
    if [ -f "$SOURCE_DIR/components/home/$comp.jsx" ]; then
        cp "$SOURCE_DIR/components/home/$comp.jsx" "$TARGET_DIR/components/home/" && echo "   ✓ components/home/$comp.jsx"
    fi
done

# Copier ApplicationCard
if [ -f "$SOURCE_DIR/components/ApplicationCard.jsx" ]; then
    cp "$SOURCE_DIR/components/ApplicationCard.jsx" "$TARGET_DIR/components/" && echo "   ✓ components/ApplicationCard.jsx"
fi

# Copier PremiumFooter
if [ -f "$SOURCE_DIR/components/layout/PremiumFooter.jsx" ]; then
    cp "$SOURCE_DIR/components/layout/PremiumFooter.jsx" "$TARGET_DIR/components/layout/" && echo "   ✓ components/layout/PremiumFooter.jsx"
fi

# Copier SimpleChatbot
if [ -f "$SOURCE_DIR/components/chat/SimpleChatbot.jsx" ]; then
    cp "$SOURCE_DIR/components/chat/SimpleChatbot.jsx" "$TARGET_DIR/components/chat/" && echo "   ✓ components/chat/SimpleChatbot.jsx"
fi

# Copier HeroSphere
if [ -f "$SOURCE_DIR/components/three/HeroSphere.jsx" ]; then
    cp "$SOURCE_DIR/components/three/HeroSphere.jsx" "$TARGET_DIR/components/three/" && echo "   ✓ components/three/HeroSphere.jsx"
fi

# Copier les icônes si elles existent
if [ -f "$SOURCE_DIR/components/icons/AppIcons.jsx" ]; then
    cp "$SOURCE_DIR/components/icons/AppIcons.jsx" "$TARGET_DIR/components/icons/" && echo "   ✓ components/icons/AppIcons.jsx"
fi
if [ -f "$SOURCE_DIR/components/icons/AppLogos.jsx" ]; then
    cp "$SOURCE_DIR/components/icons/AppLogos.jsx" "$TARGET_DIR/components/icons/" && echo "   ✓ components/icons/AppLogos.jsx"
fi

# Copier lib/premiumApplications.js
if [ -f "$SOURCE_DIR/lib/premiumApplications.js" ]; then
    cp "$SOURCE_DIR/lib/premiumApplications.js" "$TARGET_DIR/lib/" && echo "   ✓ lib/premiumApplications.js"
fi

# Copier les assets publics (sélectivement)
if [ -d "$SOURCE_DIR/public" ]; then
    # Copier favicon
    [ -f "$SOURCE_DIR/public/favicon.ico" ] && cp "$SOURCE_DIR/public/favicon.ico" "$TARGET_DIR/public/"
    # Copier dossiers marketing/images s'ils existent
    [ -d "$SOURCE_DIR/public/marketing" ] && cp -r "$SOURCE_DIR/public/marketing" "$TARGET_DIR/public/" && echo "   ✓ public/marketing/"
    [ -d "$SOURCE_DIR/public/images" ] && cp -r "$SOURCE_DIR/public/images" "$TARGET_DIR/public/" && echo "   ✓ public/images/"
    [ -d "$SOURCE_DIR/public/fonts" ] && cp -r "$SOURCE_DIR/public/fonts" "$TARGET_DIR/public/" && echo "   ✓ public/fonts/"
fi

# Copier styles si existants
if [ -f "$SOURCE_DIR/styles/landing.css" ]; then
    cp "$SOURCE_DIR/styles/landing.css" "$TARGET_DIR/styles/" && echo "   ✓ styles/landing.css"
fi

# Compter les fichiers copiés
echo ""
echo "✅ Synchronisation terminée!"
echo "📊 Statistiques:"
echo "   - Fichiers .js/.jsx: $(find "$TARGET_DIR" -name "*.js" -o -name "*.jsx" | grep -v node_modules | grep -v ".next" | wc -l)"
echo "   - Fichiers .css: $(find "$TARGET_DIR" -name "*.css" | grep -v node_modules | grep -v ".next" | wc -l)"
echo "   - Fichiers de config: $(ls -1 "$TARGET_DIR"/*.json "$TARGET_DIR"/*.js 2>/dev/null | grep -v "/scripts/" | wc -l)"
echo "   - Total (hors node_modules): $(find "$TARGET_DIR" -type f | grep -v node_modules | grep -v ".next" | grep -v ".git" | wc -l)"

echo ""
echo "📋 Prochaines étapes:"
echo "   1. cd $TARGET_DIR"
echo "   2. npm install"
echo "   3. Configurer les variables d'environnement (.env.local)"
echo "   4. npm run dev"