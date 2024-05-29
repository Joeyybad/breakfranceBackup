const protectSearch = (req, res, next) => {
    const searchQuery = req.body.search;
    const regex = /^[^<>]*$/; 

    if (regex.test(searchQuery)) {
        // Si la recherche ne contient pas les caractères < et > on tolère
        next(); 
    } else {
        // Si la recherche contient les caractères < et >
        res.status(400).send("Requête invalide : Caractères non autorisés.");
    }
};
module.exports = protectSearch;