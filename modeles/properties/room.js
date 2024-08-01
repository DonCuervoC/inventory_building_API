async function CreateProperty(req, res) {
    try {
        const propertyData = req.body;
        const token = req.headers.authorization.replace("Bearer ", "");
        const myToken = jwt.decoded(token);

        if (!token) {
            return res.status(400).json({ msg: "Le Token n'est pas fourni" });
        }
        // Validation des champs de la requête
        await validateFields(req);
        // Vérification des erreurs de validation
        const validationErrors = validationResult(req);
        // Vérification des erreurs de validation
        if (!validationErrors.isEmpty()) {
            return res.status(400).json({ errors: validationErrors.array() });
        }


        // Rechercher l'utilisateur par son ID
        const userFound = await ownerCollection.findOne({ _id: myToken.user_id });
        // Vérifier si l'utilisateur existe
        if (!userFound) {
            return res.status(400).json({ msg: "Utilisateur introuvable" });
        }

        // // // Vérifier si le nom de la propriété existe déjà dans la base de données
        // Exécuter les deux requêtes simultanément en utilisant Promise.all
        const [propertyWithName, propertyWithAddress] = await Promise.all([
            propertyCollection.findOne({ name: propertyData.name.toLowerCase() }),
            propertyCollection.findOne({ address: propertyData.address.toLowerCase() })
        ]);
        // Vérifier si une propriété avec le même nom ou la même adresse est trouvée
        if (propertyWithName || propertyWithAddress) {
            // supprimer les fichiers récemment téléchargés
            deleteUploadedFiles(req.files);
            return res.status(400).json({ msg: "La propriété existe déjà sous le même nom ou la même adresse." });
        }


        // Obtenez le nom des images et stockez-les dans le tableau s'il y en a
        if (req.files && Object.keys(req.files).length > 0) {
            // Initialiser un tableau pour les photos si des fichiers sont présents dans la requête
            let photos_ = [];
            // Parcourir les photos envoyées dans la requête et les ajouter au tableau de photos
            for (let i = 1; i <= 6; i++) {
                if (req.files[`photo${i}`]) {
                    const myImagePathName = filePath.getFileName(req.files[`photo${i}`]);
                    photos_.push(myImagePathName);
                }
            }
            propertyData.photos = photos_;
        }

        // Créer une nouvelle propriété avec les données fournies
        const newProperty = new Property({
            // owners: userFound._id,
            owners: [myToken.user_id], // Almacena el ObjectId real del usuario como referencia
            address: propertyData.address.toLowerCase(),
            name: propertyData.name.toLowerCase(),
            type: propertyData.type.toLowerCase(),
            description: propertyData.description.toLowerCase(),
            // stateOfPlace: propertyData.stateOfPlace.toLowerCase(),
            photos: propertyData.photos || undefined
        });


        // Insérer la nouvelle propriété dans la collection des propriétés
        // et mettre à jour la collection des utilisateurs avec la nouvelle propriété
        await Promise.all([
            propertyCollection.insertOne(newProperty),
            ownerCollection.updateOne(
                { _id: userFound._id },
                { $addToSet: { properties: newProperty._id } }
            )
        ]);

        // Supprimer le cache du Owner existant
        // only id owner
        const cacheKeyOwner = `propertiesByOwner_${myToken.user_id}`;
        myCache.del(cacheKeyOwner);

        // Ajouter les données mises en cache pour les futures requêtes
        // const cacheKeyProperty = `properties_${newProperty._id}`;
        const cacheKeyProperty = `${newProperty._id}`;
        myCache.set(cacheKeyProperty, newProperty);

        logger.info(`PROPERTY POST: La propriété ${newProperty._id} a été ajoutée avec succès`);
        res.status(200).json({ msg: "Nouvelle propriété ajoutée avec succès", id: newProperty._id });

    } catch (error) {
        console.error(error);
        logger.error('PROPERTY POST: Une erreur s\'est produite lors de la création d\'une propriété', { error: error, request: req.body });
        return res.status(500).json({ msg: "Erreur interne du serveur", error: error });
    }
}