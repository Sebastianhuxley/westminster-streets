# Westminster Streets

An open-world Westminster in the browser (Three.js). Play: https://sebastianhuxley.github.io/westminster-streets/

## Rifle

You carry a Lee-Enfield Mk1, slung across your back.

- **Q**: draw or sling the rifle
- **Hold the right mouse button**: aim over the shoulder
- **Left click** while aiming: fire
- **R**: reload

The magazine holds ten rounds. You work the bolt by hand after each shot, and reloading uses two five-round chargers. On touch screens, use the RIFLE, AIM, FIRE and RELOAD buttons.

Gunfire makes people scatter. Shooting someone brings the police, and shooting a police officer brings them faster.

Model: Lee-Enfield Mk1 from CGTrader, optimised into `wpn_lee_enfield.glb` (10k triangles, 1K PBR textures, with the bolt as a separate part so it can move).

## Police cars

Nearby police cars use the [BMW Touring British Police Traffic Car](https://sketchfab.com/3d-models/bmw-touring-british-police-traffic-car-509f7dbf94514d1f9b91b188e1084436) by [David_Holiday](https://sketchfab.com/David_Holiday), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

The game asset removes construction lines, merges geometry by material, adjusts scale and orientation, and gives each wheel its own pivot for steering and rotation. Geometry and textures are optimised for browser loading. The game uses its simpler police car model at a distance or if the BMW fails to load.
