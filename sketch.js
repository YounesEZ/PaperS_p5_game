let vehicule; // vehicule leader
let miniVehicules = []; // vehicules followers
let mode = "folow"; // le mode des miniVehicules
let missiles = []; // les missiles tirés par le leader
let obstacles = []; // les obstacles (ronds de differentes tailles)
let energies = []; // les energies récoltes par le leader pour generer des miniVehicules (Pantagones qui font zoomer et dézoomer)
let gatheredEnergies = 0; // le nombre d'energies recoltes par le leader
let enemie; // l'ennemi à eviter sinon gamover
let gameOver = false; // l'_etat de fin de jeu
let score = 0; // le score du joueur

function preload() {
    backgroundImage = loadImage("assets/grille.png"); // charger l'image de fond
}

function setup() {
    //Initialisation du jeu
    createCanvas(windowWidth, windowHeight); // Créer le canevas avec les dimensions de l'ordinateur
    vehicule = new Vehicule(width / 2, height / 2); // Créer le véhicule leader
    createMiniVehicules(10); //Créer 10 miniVehicules au départ
    createObstacle(5, true);  // Créer 5 obstacles avec une position random
    enemie = new Enemie(0, 0); // Créer l'ennemi dans la position (0,0) avec un comportement warder
}

// fonction pour créer des miniVehicules selon le nombre souhaité
function createMiniVehicules(nbr) {
    for (let i = 0; i < nbr; i++) {
        miniVehicules.push(new MiniVehicule(random(width), random(height)));
    }
}

// fonction pour tirer un missile
function createMissile() {
    // Initialisation de la cible avec la position du véhicule
    let missile = new Missile(vehicule.pos.x, vehicule.pos.y);
    missile.moveToFront(vehicule); // Diriger la cible vers l'avant du véhicule
    missiles.push(missile); // Ajouter le missile à la liste
}

// fonction pour créer des obstacles soit avec une position random soit avec la position de la souris
function createObstacle(nbrObstacles, randomPosition = false) {
    if (randomPosition) {
        for (let i = 0; i < nbrObstacles; i++) {
            // Créer un obstacle avec une position random
            let obstacle = new Obstacle(random(width * 0.7), random(height * 0.7));
            //Si l'obstacle est trop proche d'un autre obstacle on le recrée
            obstacles.forEach(obs => {
                let distance = p5.Vector.dist(obs.pos, obstacle.pos);
                if (distance < obs.r + obstacle.r) {
                    obstacle = new Obstacle(random(width * 0.7), random(height * 0.7));
                }
            });
            obstacles.push(obstacle); // Ajouter l'obstacle à la liste
        }
    } else {
        for (let i = 0; i < nbrObstacles; i++) {
            // Créer un obstacle avec la position de la souris
            let obstacle = new Obstacle(mouseX, mouseY);
            obstacles.push(obstacle); // Ajouter l'obstacle à la liste
        }
    }
}

function draw() {
    // Initialisation du fond avec une image
    background(backgroundImage);
    
    // Affichage de l'etat de fin de jeu si le jeu est fini
    if (gameOver) {
        textSize(32);
        fill(0);
        textAlign(CENTER, CENTER);
        text('Game Over', width / 2, height / 2 - 40);
        textSize(16);
        text('Click and Try Again', width / 2, height / 2 + 20)
        textSize(16);
        text('Score: ' + score, width / 2, height / 2 + 40);

        // Si l'utilisateur clique sur la souris, relancer le jeu
        if (mouseIsPressed) {
            resetGame(); // Réinitialiser le jeu
            gameOver = false; // Réinitialiser l'état de fin de jeu
            loop(); // Relancer le jeu
        }
    } else {
        
        // Appliquer les comportements de l'ennemi
        enemie.applyBehaviors(obstacles);
        enemie.update();
        enemie.edges();
        enemie.show();

        // Creation des energies tant que la liste est inferieur a 20 et que la probabilité est faible
        if (random(1) < 0.01 && energies.length < 20) {
            let energie = new Energie();
            //Si l'energie est trop proche d'un obstacle on le recrée
            obstacles.forEach(obstacle => {
                let distanceO = p5.Vector.dist(obstacle.pos, energie.pos);
                if (distanceO < obstacle.r * 1.8) {
                    energie = new Energie();
                }
            })
            energies.push(energie); // Ajouter l'energie à la liste
        }

        // Affichage des energies
        for (let i = energies.length - 1; i >= 0; i--) {
            if(p5.Vector.dist(energies[i].pos, vehicule.pos) < vehicule.r + energies[i].r *2) {
                energies[i].seek(vehicule.pos);
            }
            else {
                energies[i].vel = createVector(0, 0);
                energies[i].acc = createVector(0, 0);
            }
            energies[i].update(); // Boucle à l'envers
            energies[i].show();
            // Si l'énergie est trop proche du véhicule, on la supprime de la liste et on augmente le compteur des energies récoltés
            let distanceV = p5.Vector.dist(energies[i].pos, vehicule.pos);
            if (distanceV < energies[i].r + vehicule.r) {
                energies.splice(i, 1); // Supprimer l'énergie du tableau
                gatheredEnergies++; // Incrémenter le compteur
            }
        }

        // Création d'un miniVehicule si le compteur des energies récoltés est arrivé au minimum à 5
        if (gatheredEnergies >= 5) {
            createMiniVehicules(1);
            gatheredEnergies = 0; // Réinitialiser après avoir ajouté un mini-véhicule
        }

        // Obtenir la position du curseur comme cible du leader
        let target = createVector(mouseX, mouseY);

        // Le véhicule suit le curseur et evite les obstacles
        vehicule.applyBehaviors(target, obstacles);

        // Afficher les obstacles
        obstacles.forEach(obstacle => {
            obstacle.show(); 
        });

        // Afficher chaque missile de la liste
        for (let i = missiles.length - 1; i >= 0; i--) {  // Boucle à l'envers pour pouvoir supprimer sans perturbation
            let missile = missiles[i];
            missile.update();
            missile.show();
            
            // Si la cible touche un obstacle, la retirer de la liste
            if (missile.checkCollisionObstacles(obstacles)) {
                missiles.splice(i, 1);  // Supprimer la cible si collision
            }

            // Si la cible touche l'ennemi, la retirer de la liste
            if (missile.checkCollisionEnemies(enemie)) {
                missiles.splice(i, 1); // Supprimer la cible si collision
            }

            // Si la cible touche un bord, la retirer de la liste
            if (missile.edges()) {
                missiles.splice(i, 1);  // Supprime la cible de la liste
            }
        }

        // Iterer sur la liste des obstacles et supprimer ceux dont la sante est <= 0
        for (let i = obstacles.length - 1; i >= 0; i--) { // Boucle à partir de la fin pour pouvoir supprimer sans perturbation
            let obstacle = obstacles[i];
            if (obstacle.sante <= 0) {
                score += floor(obstacle.r); // floor pour arrondir et on augmente le score du joueur
                obstacles.splice(i, 1);  // Supprimer l'obstacle si sante <= 0
            }
        }

        // Si la sante de l'ennemi est <= 0, augmenter le score et créer un nouvel ennemi à la place du precedant et on repasse en mode folow
        if (enemie.sante <= 0) {
            score += 300;
            mode = "folow";
            enemie = new Enemie();
        }

        // Créations de 4 obstacles randoms si il n'y en a plus d'obstacle
        if (obstacles.length === 0) {
            createObstacle(4, true);
        }

        // Affichage des miniVehicules selon le mode
        switch (mode) {
            case "snake":
                // Affichage des miniVehicules en snake 
                for (let i = 0; i < miniVehicules.length; i++) {
                    miniVehicules[i].color = color(100, 150, 255);
                    if (i === 0) {
                        // le premier suit le leader
                        miniVehicules[i].applyBehaviorsSnacke(vehicule.pos, obstacles);
                    } else {
                        // le miniVehicule suit le miniVehicule précedent
                        miniVehicules[i].applyBehaviorsSnacke(miniVehicules[i - 1].pos, obstacles);
                    }
                    // Affichage des miniVehicules
                    miniVehicules[i].update();
                    miniVehicules[i].show();
                }
                // Si un miniVehicule touche l'ennemi, il est détruit et l'ennemi ne perd pas de la santé car il n'est pas en mode attack
                for (let i = 0; i < miniVehicules.length; i++) {
                    if (p5.Vector.dist(miniVehicules[i].pos, enemie.pos) < enemie.r) { 
                        miniVehicules.splice(i, 1); // Suppression du miniVehicule de la liste
                    }
                }
                break;

            case "folow":
                // Affichage des miniVehicules en follow , on applique arrive sur les miniVehicules qui suivent tous le leader avec un comportement de separation entre eux
                miniVehicules.forEach(miniVehicule => {
                    miniVehicule.color = color(100, 150, 255);
                    miniVehicule.applyBehaviors(vehicule, miniVehicules, obstacles);
                    miniVehicule.update();
                    miniVehicule.show();
                })
                // Si un miniVehicule touche l'ennemi, il est détruit et l'ennemi ne perd pas de la santé car il n'est pas en mode attack
                for (let i = 0; i < miniVehicules.length; i++) {
                    if (p5.Vector.dist(miniVehicules[i].pos, enemie.pos) < enemie.r) {// L'ennemi perd de la santé
                        miniVehicules.splice(i, 1); // Suppression du miniVehicule de la liste
                    }
                }
                break;
            case "attack":
                // On parcourt le tableau des miniVehicules à l'envers pour éviter des problèmes lors de la suppression
                // le mode attack s'applique sur tous les miniVehicules qui suivent l'ennemi pour le toucher et le détruire tout en evitant les obstacles
                // on effectue un comportement de separation entre les miniVehicules
                for (let i = miniVehicules.length - 1; i >= 0; i--) {
                    // Sa couleur devient rouge
                    miniVehicules[i].color = "red";

                    // On applique les forces suivantes
                    // suite l'ennemi avec un vitesse plus rapide
                    let forceSeek = miniVehicules[i].seekAttack(enemie.pos);
                    miniVehicules[i].maxspeed = 50;
                    miniVehicules[i].maxforce = 1;
                    miniVehicules[i].applyForce(forceSeek);

                    // force pour eviter les obstacles
                    let forceA = miniVehicules[i].avoidObstacle(obstacles);
                    forceA.mult(3);
                    miniVehicules[i].applyForce(forceA);

                    // force pour separation entre les miniVehicules
                    let forceSeparate = miniVehicules[i].separate(miniVehicules);
                    forceSeparate.mult(0.2);
                    miniVehicules[i].applyForce(forceSeparate);
                    
                    // force pour eviter les bords de la fenetre
                    let forceB = miniVehicules[i].boundaries();
                    forceB.mult(3);
                    miniVehicules[i].applyForce(forceB);

                    //on affiche les miniVehicules
                    miniVehicules[i].update();
                    miniVehicules[i].show();

                    // Si un miniVehicule touche l'ennemi, il est détruit et l'ennemi perd de la santé
                    for (let i = 0; i < miniVehicules.length; i++) {
                        if (p5.Vector.dist(miniVehicules[i].pos, enemie.pos) < miniVehicules[i].r + enemie.r) {
                            enemie.sante -= 2; // L'ennemi perd de la santé
                            miniVehicules.splice(i, 1); // Suppression du miniVehicule de la liste
                        }
                    }
                }
                break;
        }
         
        // Si le leader touche l'ennemi, c'est la fin du jeu
        if (p5.Vector.dist(vehicule.pos, enemie.pos) < vehicule.r + enemie.r) {
            //finir le jeu
            gameOver = true;
        }

        // il n'y a plus de miniVehicules on repasse en mode follow
        if (miniVehicules.length === 0) {
            mode = "folow";
        }
    }

    // Afficher le score en haut de la fenetre au milieu
    textSize(16);
    fill(0);
    textAlign(CENTER, CENTER);
    text('Score: ' + score, width / 2, 20);

    displayInstructions();
}


function displayInstructions() {
    fill(0); // Couleur blanche pour le texte
    textSize(16); // Taille du texte
    textStyle(BOLD);
    textAlign(LEFT, TOP); // Aligner le texte en haut à gauche

    // L'ensemble de instructions c'est à dire (les touches clavier)
    let instructions = [
        "'S' : Mode Snacke",
        "'F' : Mode Follow",
        "'D' : Activer/Désactiver Debug",
        "'C' : Lancer Missile",
        "'A' : Mode Attack"
    ];

    // Afficher chaque ligne d'instruction
    for (let i = 0; i < instructions.length; i++) {
        text(instructions[i], 10, 10 + windowHeight / 1.25 + i * 20); // Position verticale augmentée pour chaque ligne
    }
}


// Créer un obstacle lorsque la souris est cliquée
function mousePressed() {
    createObstacle(1);
}

// Fonction pour réinitialiser le jeu et recommencer
function resetGame() {
    miniVehicules = [];
    obstacles = [];
    cibles = [];
    energies = [];
    enemie = undefined
    vehicule = undefined
    gatheredEnergies = 0;
    mode = "folow";
    score = 0;
    setup();
    gameOver = false;
}

// Ensembles des touches clavier qui permettent de modifier le jeu
function keyPressed() {
    if (key === 's') {
        mode = "snake"
    }
    else if (key === 'f') {
        mode = "folow"
    }
    else if (key === 'd') {
        Vehicule.debug = !Vehicule.debug
    }
    else if (key === 'c') {
        createMissile();
    }
    else if (key === 'a') {
        mode = "attack";
    }

}