class Energie {
    constructor() {
        this.pos = createVector(random(width), random(height)); // Position aléatoire
        this.color = random(["purple", "brown", "orange"]); // Couleur aléatoire
        this.r = 7; // Rayon initial de l'energie

        this.vel = createVector(0, 0); // Vitesse
        this.acc = createVector(0, 0); // Accélération
        this.maxSpeed = 3; // Vitesse maximale
        this.maxForce = 0.2; // Force maximale

        // Ajouter un effet de zoom et dézoom pour les Pantagones
        this.zoomSpeed = 0.05; // Vitesse du zoom
        this.zoomingOut = false; // Indique si on est en phase de dézoom
        this.maxRadius = 7; // Rayon maximal
        this.minRadius = 3;  // Rayon minimal
    }

    seek(target) {
        // on calcule la direction vers la cible
        // se diriger vers une cible
        let force = p5.Vector.sub(target, this.pos);
        // le pilotage (comment on se dirige vers la cible)
        // on limite ce vecteur à la longueur maxSpeed
        force.setMag(this.maxSpeed);
        // on calcule la force à appliquer pour atteindre la cible
        force.sub(this.vel);
        // on limite cette force à la longueur maxForce
        force.limit(this.maxForce);
        // on applique la force au véhicule
        this.applyForce(force);
    }

    applyForce(force) {
        // Ajouter une force à l'accélération
        this.acc.add(force);
      }

    update() {
        // Modifier dynamiquement le rayon pour créer l'effet de zoom/dézoom
        if (this.zoomingOut) {
            this.r -= this.zoomSpeed; // Rétrécit
            if (this.r <= this.minRadius) {
                this.zoomingOut = false; // Inverse la direction
            }
        } else {
            this.r += this.zoomSpeed; // Agrandit
            if (this.r >= this.maxRadius) {
                this.zoomingOut = true; // Inverse la direction
            }
        }
        this.vel.add(this.acc);  // Mise à jour de la vitesse
        this.vel.limit(this.maxSpeed); // Limiter la vitesse
        this.pos.add(this.vel);  // Mise à jour de la position
        this.acc.set(0, 0);      // Réinitialiser l'accélération
    }

    show() {
        push();
        fill(this.color); // Utilise la couleur aléatoire
        noStroke(); // sans bordure
        beginShape(); // Créer un pentagone
        for (let j = 0; j < 5; j++) { 
            let angle = TWO_PI / 5 * j;
            let vx = this.pos.x + cos(angle) * this.r;
            let vy = this.pos.y + sin(angle) * this.r;
            vertex(vx, vy);
        }
        endShape(CLOSE);
        pop();
    }
}