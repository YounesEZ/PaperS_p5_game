class Obstacle {
    constructor(x, y) {
        this.pos = createVector(x, y); // Position de l'obstacle
        this.r = random(40, 150); // Rayon du cercle
        // Choisir une couleur aléatoire dans le tableau
        const colors = ["blue", "green", "red", "yellow"];

        this.color = random(colors); // Initialisation de la couleur
        this.sante = this.r / 10; // Initialisation de la sante
    }

    show() {
        // Dessiner le cercle
        push();
        fill(this.color);
        stroke(0);
        strokeWeight(2);
        ellipse(this.pos.x, this.pos.y, this.r);
        pop();
    }
}