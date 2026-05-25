@echo off
echo Ajout des fichiers...
git add .
echo.
echo Creation du commit...
git commit -m "Mise à jour des fonctionnalités et du design de l'application Tontineo"
echo.
echo Envoi vers GitHub...
git push
echo.
echo Termine ! Appuyez sur une touche pour fermer cette fenetre.
pause
