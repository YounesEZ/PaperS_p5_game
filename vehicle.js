class Vehicule {
  static debug = false
  constructor(x, y) {
    this.pos = createVector(x, y); // Position actuelle
    this.vel = createVector(0, 0); // Vitesse
    this.acc = createVector(0, 0); // Accélération
    this.maxSpeed = 3; // Vitesse maximale
    this.maxForce = 0.2; // Force maximale
    this.r = 16; // Rayon du cercle
    this.rayonZoneDeFreinage = 100; // Rayon de la zone de freinage
  }

  update() {
    // Mise à jour de la vélocité et position
    this.vel.add(this.acc);
    this.vel.limit(this.maxSpeed);// Limiter la vitesse maximale
    this.pos.add(this.vel);

    // Réinitialisation de l'accélération après chaque frame
    this.acc.mult(0);
  }

  // Application des comportements (forces) sur le vehicule (arrive (sur le curseur normalement), avoidObstacle)
  applyBehaviors(target, obstacles) {
    let forceV = this.arrive(target, 10);
    this.applyForce(forceV);
    let forceA = this.avoidObstacle(obstacles);
    forceA.mult(4); // Multiplication de la force
    this.applyForce(forceA)
    // Affichage du vehicule leader
    this.update();
    this.show();
  }

  applyForce(force) {
    // Ajouter une force à l'accélération
    this.acc.add(force);
  }

  arrive(target, d = 0) {
    // 1nd argument target is the target position of a vehicle
    // 2rd argumlent d is the distance behind the target
    // for "snake" and "follow" behavior
    return this.seek(target, true, d);
  }

  // Fonction pour suivre une cible
  seek(target, arrival, d = 0) {
    let desiredSpeed = p5.Vector.sub(target, this.pos);
    let desiredSpeedMagnitude = this.maxSpeed;
    
    if (arrival) {
      // on dessine un cercle de rayon 100 
      // centré sur le point d'arrivée

      if (Vehicule.debug) {
        noFill();
        stroke("white")
        circle(target.x, target.y, this.rayonZoneDeFreinage)
      }

      // on calcule la distance du véhicule
      // par rapport au centre du cercle
      const dist = p5.Vector.dist(this.pos, target);

      if (dist < this.rayonZoneDeFreinage) {
        // on va diminuer de manière proportionnelle à
        // la distance, la vitesse
        // on va utiliser la fonction map(...) de P5
        // qui permet de modifier une valeur dans un 
        // intervalle initial, vers la même valeur dans un
        // autre intervalle
        // newVal = map(value, start1, stop1, start2, stop2, [withinBounds])
        desiredSpeedMagnitude = map(dist, d, this.rayonZoneDeFreinage, 0, this.maxSpeed)
      }
    }

    // equation force = vitesseDesiree - vitesseActuelle
    desiredSpeed.setMag(desiredSpeedMagnitude);
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    // et on limite la force
    force.limit(this.maxForce);
    return force
  }

  avoidObstacle(obstacles) {
    // je chercher l'obstacle le plus proche
    let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);

    if (obstacleLePlusProche == undefined) {
      return createVector(0, 0);
    }
    // Distance entre la position du vehicule et l'obstacle
    let distanceVehiculeObstacle = p5.Vector.dist(this.pos, obstacleLePlusProche.pos);

    let desiredSpeed;
    let force;
    // Si l'obstacle est trop proche
    if (distanceVehiculeObstacle < obstacleLePlusProche.r) {
      desiredSpeed = p5.Vector.sub(this.pos, obstacleLePlusProche.pos);

      if (Vehicule.debug) {
        // dessiner le vecteur de repulsion
        this.drawVector(obstacleLePlusProche.pos, desiredSpeed, "pink");
      }

      //On applique la force de repulsion

      desiredSpeed.setMag(this.maxSpeed);
      force = p5.Vector.sub(desiredSpeed, this.vel);
      force.limit(0.1);

      return force;
    }
    return createVector(0, 0);
  }

  // Chercher l'obstacle le plus proche
  getObstacleLePlusProche(obstacles) {
    let plusPetiteDistance = 100000000;
    let obstacleLePlusProche = undefined;

    obstacles.forEach(o => {
      // Je calcule la distance entre le vehicule et l'obstacle
      const distance = this.pos.dist(o.pos);

      if (distance < plusPetiteDistance) {
        plusPetiteDistance = distance;
        obstacleLePlusProche = o;
      }
    });

    return obstacleLePlusProche;
  }

  // Fonction pour dessiner un vecteur
  drawVector(pos, v, color) {
    push();
    // Dessin du vecteur vitesse
    // Il part du centre du véhicule et va dans la direction du vecteur vitesse
    strokeWeight(3);
    stroke(color);
    line(pos.x, pos.y, pos.x + v.x, pos.y + v.y);
    // dessine une petite fleche au bout du vecteur vitesse
    let arrowSize = 5;
    translate(pos.x + v.x, pos.y + v.y);
    rotate(v.heading());
    translate(-arrowSize / 2, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    pop();
  }

  show() {
    // Calculer l'angle vers la cible
    let angle = this.vel.heading();

    push();
    translate(this.pos.x, this.pos.y); // Déplacer à la position du véhicule
    rotate(angle); // Tourner pour pointer vers la direction de déplacement

    // Dessiner le rectangle (arrière-plan)
    fill(100, 150, 255);
    rectMode(CENTER);
    rect(this.r, 0, this.r * 2, this.r);

    // Dessiner le cercle (avant-plan)
    fill(100, 150, 255);
    stroke(0);
    ellipse(0, 0, this.r * 2);

    pop();
  }
}

class MiniVehicule extends Vehicule {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 3
    this.maxForce = 0.3
    this.sante = 1; // Santé du mini-vehicule
    this.color = color(100, 150, 255) // Couleur du mini-vehicule
  }

  applyBehaviors(target, miniVehicules, obstacles) {

    let seekForce = this.arrive(target.pos, this.r * 4);
    this.avoid(target);
    let separateForce = this.separate(miniVehicules);
    let boudariesForce = this.boundaries();
    let avoidObstacleForce = this.avoidObstacle(obstacles);

    seekForce.mult(0.2);
    separateForce.mult(0.2);
    avoidObstacleForce.mult(3);
    boudariesForce.mult(3);

    this.applyForce(seekForce);
    this.applyForce(separateForce);
    this.applyForce(avoidObstacleForce);
    this.applyForce(boudariesForce);
  }

  update() {
    this.vel.add(this.acc);  // Mise à jour de la vitesse
    this.vel.limit(this.maxSpeed); // Limiter la vitesse
    this.pos.add(this.vel);  // Mise à jour de la position
    this.acc.set(0, 0);      // Réinitialiser l'accélération
  }

  // Appliquer le comportement "snake" au mini-vehicule (avec avoidObstacle)
  applyBehaviorsSnacke(target, obstacle) {

    let seekForce = this.arrive(target, this.r * 2);
    let avoidObstacleForce = this.avoidObstacle(obstacle);
    let boudariesForce = this.boundaries();

    seekForce.mult(0.2);
    avoidObstacleForce.mult(3);
    boudariesForce.mult(3);

    this.applyForce(seekForce);
    this.applyForce(avoidObstacleForce);
    this.applyForce(boudariesForce);
  }

  avoidObstacle(obstacles) {
    //Ajoute des vecteurs du ahead et du milieu du ahead
    let ahead = this.vel.copy();
    ahead.mult(50);

    let middle_ahead = this.vel.copy();
    middle_ahead.mult(25);

    if (Vehicule.debug) {
      // on dessine le vecteur vitesse en jaune
      this.drawVector(this.pos, ahead, "yellow");
      this.drawVector(this.pos, middle_ahead, "lightblue");
    }

    // Pour le dessiner, il faut lui ajouter la position du véhicule
    ahead.add(this.pos);
    middle_ahead.add(this.pos);

    // on le dessine en rouge
    if (Vehicule.debug) {
      fill("red");
      circle(ahead.x, ahead.y, 10);

      fill("green");
      circle(middle_ahead.x, middle_ahead.y, 10);
    }


    let obstacleLePlusProche = this.getObstacleLePlusProche(obstacles);

    if (obstacleLePlusProche == undefined) {
      return createVector(0, 0);
    }

    let distanceAheadObstacle = p5.Vector.dist(ahead, obstacleLePlusProche.pos);
    let distanceMiddleAheadObstacle = p5.Vector.dist(middle_ahead, obstacleLePlusProche.pos);
    let distanceVehiculeObstacle = p5.Vector.dist(this.pos, obstacleLePlusProche.pos);

    let distanceDominante;
    distanceDominante = min(distanceAheadObstacle, distanceMiddleAheadObstacle);
    distanceDominante = min(distanceDominante, distanceVehiculeObstacle);

    let desiredSpeed;
    let force;

    if (distanceDominante < obstacleLePlusProche.r / 1.5) {
      if (distanceDominante == distanceAheadObstacle) {
        desiredSpeed = p5.Vector.sub(ahead, obstacleLePlusProche.pos);
      } else if (distanceDominante == distanceMiddleAheadObstacle) {
        desiredSpeed = p5.Vector.sub(middle_ahead, obstacleLePlusProche.pos);
      } else {
        desiredSpeed = p5.Vector.sub(this.pos, obstacleLePlusProche.pos);
      }

      if (Vehicule.debug) {
        this.drawVector(obstacleLePlusProche.pos, desiredSpeed, "pink");
      }

      desiredSpeed.setMag(this.maxSpeed);
      force = p5.Vector.sub(desiredSpeed, this.vel);
      force.limit(this.maxForce);

      return force;
    }
    return createVector(0, 0);
  }

  
  avoid(obstacle) {
    let d = p5.Vector.dist(this.pos, obstacle.pos);

    let desiredSpeed;
    if (d < obstacle.r * 3) {
      desiredSpeed = p5.Vector.sub(this.pos, obstacle.pos);
      desiredSpeed.setMag(this.maxSpeed);
      let force = p5.Vector.sub(desiredSpeed, this.vel);
      force.limit(this.maxForce * 20);
      this.acc.add(force);
    }
  }

  // Comportement de separation entre les vehicules
  separate(boids) {
    let desiredseparation = this.r * 2;
    let steer = createVector(0, 0, 0);
    let count = 0;
    // On examine les autres boids pour voir s'ils sont trop près
    for (let i = 0; i < boids.length; i++) {
      let other = boids[i];
      let d = p5.Vector.dist(this.pos, other.pos);
      // Si la distance est supérieure à 0 et inférieure à une valeur arbitraire (0 quand on est soi-même)
      if (d > 0 && d < desiredseparation) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.pos, other.pos);
        diff.normalize();
        diff.div(d); // poids en fonction de la distance. Plus le voisin est proche, plus le poids est grand
        steer.add(diff);
        count++; // On compte le nombre de voisins
      }
    }
    // On moyenne le vecteur steer en fonction du nombre de voisins
    if (count > 0) {
      steer.div(count);
    }

    // si la force de répulsion est supérieure à 0
    if (steer.mag() > 0) {
      // On implemente : Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.velocity);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  // Comportement de poursuite de l'enemie normalement
  seekAttack(target) {
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
    return force;
  }

  // On cherche le vehicule le plus proche
  getVehiculeLePlusProche(miniVehicules, leader) {
    let plusPetiteDistance = Infinity;
    let vehiculeLePlusProche;

    miniVehicules.forEach(v => {
      if (v != this) {
        // Je calcule la distance entre le vaisseau et le vehicule
        const distance = this.pos.dist(v.pos);
        const distanceLeader = this.pos.dist(leader.pos)

        let distanceDominante = min(distance, distanceLeader)

        if (distanceDominante < plusPetiteDistance) {
          plusPetiteDistance = distanceDominante;
          vehiculeLePlusProche = v;
        }
      }
    });


    return vehiculeLePlusProche;
  }

  // comportement d'evitement des bords de l'ecran
  boundaries() {
    const d = 25;

    let desired = null;

    // si le véhicule est trop à gauche ou trop à droite
    if (this.pos.x < d) {
      desired = createVector(this.maxSpeed, this.vel.y);
    } else if (this.pos.x > width - d) {
      desired = createVector(-this.maxSpeed, this.vel.y);
    }

    if (this.pos.y < d) {
      desired = createVector(this.vel.x, this.maxSpeed);
    } else if (this.pos.y > height - d) {
      desired = createVector(this.vel.x, -this.maxSpeed);
    }

    if (desired !== null) {
      desired.normalize();
      desired.mult(this.maxSpeed);
      const steer = p5.Vector.sub(desired, this.vel);
      steer.limit(this.maxForce);
      return steer;
    }
    return createVector(0, 0);
  }

  show() {
    // Afficher le véhicule (triangle)
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    fill(this.color);
    stroke(0);
    strokeWeight(1);
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);
    pop();
  }

}

class Enemie extends MiniVehicule {
  constructor(x, y) {
    super(x, y);
    this.maxSpeed = 2;
    this.maxForce = 0.1;
    this.r = 40;

    this.distanceCercle = 150; // Distance du centre du cercle devant le véhicule
    this.wanderRadius = 50; // Rayon du cercle devant le véhicule
    this.wanderTheta = 0; 
    this.displaceRange = 0.1;

    this.sante = 10; // Santé du vehicule
  }

  // Appliquer les comportements (warder et avoidObstacle)
  applyBehaviors(obstacles) {
    let forceW = this.wander();
    this.applyForce(forceW);
    let forceA = this.avoidObstacle(obstacles);
    forceA.mult(4);
    this.applyForce(forceA);
    this.update();
    this.show();
  }

  // Comportement wander
  wander() {
    // point devant le véhicule, centre du cercle

    let centreCercleDevant = this.vel.copy();
    centreCercleDevant.setMag(this.distanceCercle);
    centreCercleDevant.add(this.pos);

    if(Vehicule.debug){
      // on le dessine sous la forme d'une petit cercle rouge
      fill("red");
      circle(centreCercleDevant.x, centreCercleDevant.y, 8);

      // Cercle autour du point
      noFill();
      stroke("black");
      circle(centreCercleDevant.x, centreCercleDevant.y, this.wanderRadius * 2);

      // on dessine une ligne qui relie le vaisseau à ce point
      // c'est la ligne blanche en face du vaisseau
      line(this.pos.x, this.pos.y, centreCercleDevant.x, centreCercleDevant.y);
    }


    // On va s'occuper de calculer le point vert SUR LE CERCLE
    // il fait un angle wanderTheta avec le centre du cercle
    // l'angle final par rapport à l'axe des X c'est l'angle du vaisseau
    // + cet angle
    let wanderAngle = this.vel.heading() + this.wanderTheta;
    // on calcule les coordonnées du point vert
    let pointSurCercle = createVector(this.wanderRadius * cos(wanderAngle), this.wanderRadius * sin(wanderAngle));
    // on ajoute la position du vaisseau
    pointSurCercle.add(centreCercleDevant);

    // maintenant pointSurCercle c'est un point sur le cercle
    // on le dessine sous la forme d'un cercle vert
    if(Vehicule.debug){
      fill("lightGreen");
      circle(pointSurCercle.x, pointSurCercle.y, 8);
    }
    // on dessine le vecteur desiredSpeed qui va du vaisseau au point vert
    let desiredSpeed = p5.Vector.sub(pointSurCercle, this.pos);

    // on dessine une ligne qui va du vaisseau vers le point sur le 
    // cercle
    if(Vehicule.debug){
      line(this.pos.x, this.pos.y, pointSurCercle.x, pointSurCercle.y);
    }

    // On a donc la vitesse désirée que l'on cherche qui est le vecteur
    // allant du vaisseau au cercle vert. On le calcule :
    // ci-dessous, steer c'est la desiredSpeed directement !
    // Voir l'article de Craig Reynolds, Daniel Shiffman s'est trompé
    // dans sa vidéo, on ne calcule pas la formule classique
    // force = desiredSpeed - vitesseCourante, mais ici on a directement
    // force = desiredSpeed
    let force = p5.Vector.sub(desiredSpeed, this.vel);
    force.setMag(this.maxForce);

    // On déplace le point vert sur le cerlcle (en radians)
    this.wanderTheta += random(-this.displaceRange, this.displaceRange);

    return force;
  }
  
  edges() {
    if (this.pos.x > width + this.r) {
      this.pos.x = -this.r;
    } else if (this.pos.x < -this.r) {
      this.pos.x = width + this.r;
    }
    if (this.pos.y > height + this.r) {
      this.pos.y = -this.r;
    } else if (this.pos.y < -this.r) {
      this.pos.y = height + this.r;
    }
  }

  show() {
    // Afficher le véhicule (triangle noir)
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    fill(0);
    stroke(0);
    strokeWeight(1);
    triangle(-this.r, -this.r / 2, -this.r, this.r / 2, this.r, 0);

    fill(255); // Couleur blanche pour le texte
    noStroke(); // Pas de contour pour le texte
    textSize(12); // Taille du texte
    textAlign(CENTER, CENTER); // Centrage du texte
    text(this.sante, 0, 0); // Affiche la santé au centre (0, 0 est le centre du véhicule)
    pop();
  }
}