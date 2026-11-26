# Survey-led Westminster reconstruction

This is a separate development branch, not a replacement of the live game. The existing game uses compressed, largely orthogonal coordinates. Never mix these coordinates with the new geographic frame without a deliberate migration.

## Pilot order
1. St James's / Pall Mall
2. Piccadilly / Jermyn Street
3. Whitehall
4. St James's Park / The Mall
5. Victoria Street

The bounding boxes in build.mjs are provisional acquisition envelopes, not street boundaries. The overlaps are intentional. Deduplicate stable source feature IDs across pilots before assembling the complete city.

## Required inputs
- Authoritative detailed OS topography / NGD building, road and land features, where the product licence permits public game redistribution. OS OpenMap Local is a generalized open-data fallback, not survey-quality detail.
- Environment Agency 1m DSM and DTM (2022 composite). Check acquisition date and ground/eaves/roof readings per building; DSM minus DTM is an estimate until checked. Trees and rooftop plant can distort the readings.
- Independently licensed survey/orthophotography and facade references. Historic England listing descriptions help identify features but do not establish exact dimensions.
- Store source IDs, dates, licence and redistribution clearance for every layer. Keep private/uncleared source data out of this public repository. Do not scrape Google Street View imagery or assume permission to redistribute it.
- Export GIS vector geometry in British National Grid EPSG:27700 and vertical heights in Ordnance Datum Newlyn (ODN). Use a correct OSTN15/OSGM15 transformation when converting geographic coordinates where required. Validate polygon topology (including holes and self-intersections), cross-layer gaps/overlaps, line connectivity, and source metadata in GIS before export.

Sources:
- https://www.ordnancesurvey.co.uk/products/os-ngd
- https://www.ordnancesurvey.co.uk/products/os-building-features
- https://docs.os.uk/os-downloads/products/maps-and-imagery-portfolio/os-openmap-local/os-openmap-local-overview
- https://environment.data.gov.uk/dataset/13787b9a-26a4-4775-8523-806d13af58fc
- https://environment.data.gov.uk/dataset/9ba4d5ac-d596-445a-9056-dae3ddec0178
- https://historicengland.org.uk/listing/the-list/

## Import format
A JSON object with crs="EPSG:27700", verticalDatum="ODN", sources array, features array of GeoJSON Features (stable id, properties.kind, properties.sourceId, properties.method: survey/mapped/estimated), and referenceChecks array. Sources have id, title, url, date, license and redistributable boolean. Each check records featureId, metric, errorM (maximum observed absolute error across the sampled points, not average), referenceSourceId, method and samples. References must be independent of the primary source; the tool checks IDs but cannot establish true independence. It does not generate these comparisons itself. The input is an explicitly projected GIS export, not standard WGS84 web GeoJSON. Optional building attributes: groundODN, roofODN, eavesODN, heightM, levels, facadeReference. Optional road/pavement attributes: widthM. Retain unknown values as absent; never invent heights or widths.

Run:
    node survey/build.mjs --self-test
    node survey/build.mjs st-jamess-pall-mall input.json output.json

Exit 3 means output was produced but requires correction or further independent measurement. A pass only means the supplied checks meet the configured tolerance; it does not certify completeness or survey accuracy. Independently audit coverage and sampling density before approval.

## Engine integration contract
One shared origin E530000/N180000; x=easting-origin, z=origin-northing, y in metres relative to an agreed ODN vertical origin. No horizontal scaling or arbitrary rotation. The origin is a convenient grid reference, not a surveyed landmark. Retain every vertex and courtyard; use polygons for building/collision geometry and measured carriageway/pavement polygons for the road surface. A centreline alone is not proof of kerb accuracy. Each feature has one owner tile and references from other intersected tile bounding boxes; these are conservative indices, not clipped geometry. A runtime streamer must package assets by owner, keep referenced assets resident while any dependent tile is visible, prefetch around the player, and release unused GPU resources safely. The current compiler creates the tile index; runtime streaming is not yet implemented.

Before replacing the old city, implement polyline navigation, polygon colliders, continuous terrain and a shared minimap, then migrate landmarks, signals, missions and entrances into the new coordinates. Keep texture and display resolution intact. Validate the actual generated meshes against the GIS geometry, not only the imported data.

## Acceptance
- Horizontal positions/road alignment <=1m max sampled deviation; widths <=0.5m; heights <=1m; facade control points <=0.5m.
- Sample all street segments including corners, bends and transitions; verify coverage against the reference source and log missing features.
- Use independent measurement, not visual resemblance or data checking against itself.
- Test navigation, walking, collisions, loading memory and mobile frame time before merging.
- No pilot is complete until it has an audited source dataset, coverage report, rendered geometry overlay and a real-device test.

## Current status
Compiler implemented and synthetic fixture checks passed. No authoritative Westminster geometry or LiDAR rasters have been downloaded or imported yet; the data endpoint was unavailable in the execution environment. No live road/building change or measured accuracy claim is made.
