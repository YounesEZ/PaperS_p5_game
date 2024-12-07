class Missile {
    constructor(x, y) {
        this.pos = createVector(x, y); // Position actuelle
        this.vel = createVector(0, 0); // Vélocité
        this.acc = createVector(0, 0); // Accélération
        this.maxSpeed = 5; // Vitesse maximale
        this.r = 16; // Rayon du cercle
    }

    applyForce(force) {
        // Ajouter une force à l'accélération
        this.acc.add(force);
    }

    update() {
        // Mise à jour de la vélocité et de la position
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed); // Limiter la vitesse maximale
        this.pos.add(this.vel);

        // Réinitialiser l'accélération après le mouvement
        this.acc.mult(0);
    }
    moveToFront(vehicule) {
        // Copier la vitesse actuelle du véhicule leader qui permet d'avoir un vecteur de direction identique à celui du véhicule
        let front = vehicule.vel.copy();
    
        // Définir la magnitude du vecteur 'front' (la vitesse à laquelle le missile doit avancer), ici, on fixe une distance fixe (35) pour le décalage depuis le véhicule leader
        front.setMag(35);
    
        // Calculer la nouvelle position en ajoutant la position actuelle du véhicule leader qui place le missile à une position décalée vers l'avant du véhicule
        front.add(vehicule.pos);

        // Mettre à jour la position actuelle du missile ,le missile est déplacé à la position calculée dans 'front'
        this.pos = createVector(front.x, front.y);
    
        // Créer un vecteur de direction pour le missile basé sur la vitesse actuelle du véhicule leader qui va garantir que le missile suit la direction du véhicule
        let direction = vehicule.vel.copy();
    
        // La vitesse du missile est fixée à une magnitude spécifique (10)
        direction.setMag(10);
    
        // Affecter la nouvelle vitesse calculée au missile
        this.vel = direction;
    }
    

    // Fonction pour verifier si la cible touche un obstacle
    checkCollisionObstacles(obstacles) {
        for (let i = 0; i < obstacles.length; i++) {
            let distance = p5.Vector.dist(this.pos, obstacles[i].pos);
            if (distance < obstacles[i].r / 1.8) {
                obstacles[i].sante -= 1;
                return true;  // La cible touche un obstacle
            }
        }
        return false;  // Aucune collision
    }

    // Fonction pour verifier si la cible touche l'ennemi
    checkCollisionEnemies(enemie) {
        let distance = p5.Vector.dist(this.pos, enemie.pos);
        if (distance < enemie.r) {
            enemie.sante -= 1;
            return true;  // La cible touche l'ennemi
        }

        return false;  // Aucune collision
    }

    show() {
        // Dessiner le cercle qui represente le missile
        push();
        fill("red");
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.r); // Dessiner le cercle
        pop();
    }

    // Fonction pour verifier si la cible est en dehors des bords de l'ecran
    edges() {
        if (this.pos.x > width + this.r || this.pos.x < -this.r || this.pos.y > height + this.r || this.pos.y < -this.r) {
            return true;  // La cible est en dehors des bords
        }
        return false;
    }
}

