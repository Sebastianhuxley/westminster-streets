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

The game asset removes construction lines, merges geometry by material, corrects the mirrored livery faces, adjusts scale and orientation, and gives each wheel its own pivot for steering and rotation. The paint and Battenburg markings are tuned for the game’s daylight, and the car uses fictional UK-format registration plates. The front has revised projector and grille materials and modelled lower intake trim. Geometry and textures are optimised for browser loading. The game uses its simpler police car model at a distance or if the BMW fails to load.

Nearby BMWs sample the road height at each wheel. The body follows kerbs and cambers while retaining braking pitch and cornering roll. Each car gets its own fictional registration, and the emergency LEDs cast a short blue spill that is more visible at night and in wet weather. Police drivers leave more braking room around other vehicles and street furniture. Sirens change pitch with relative speed and are muffled behind buildings. Tyre noise changes between tarmac, paving and grass.

## Churchill monument

The Parliament Square monument uses a custom reference-based 3D sculpt of Ivor Roberts-Jones's statue. It includes the greatcoat, cane, dark bronze footing and granite plinth with the inscription cut into the mesh. The game switches between a detailed and simplified casting by distance. The sculpture uses vertex-colour patina and a tiled bump texture for the cast finish.

The sculpt follows the 3.66 m bronze and 2.44 m plinth documented by [Historic England](https://historicengland.org.uk/listing/the-list/list-entry/1392374?section=official-list-entry). The stance, coat, cane and lettering were checked against [photographs of the Parliament Square casting](https://commons.wikimedia.org/wiki/Category:Statue_of_Winston_Churchill,_Parliament_Square,_London).
