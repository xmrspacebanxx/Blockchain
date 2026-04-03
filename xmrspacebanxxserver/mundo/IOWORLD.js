// Coordenadas de origen google en formato decimal
const latG = 4 + 36/60 + 22.07/3600; // Latitud de la base   4°36'22.48"N
const lonG = 74 + 10/60 + 18.78/3600; // Longitud de la base  74°10'18.38"O

// Coordendas de destino google en formato decimal
const latDestino = 32 + 45/60 + 6.04/3600; // Latitud del destino  32°45'6.04"N
const lonDestino = 114 + 45/60 + 55.85/3600; // Longitud del destino 114°45'55.85"O


// Coordenadas de minecraft para localizar el punto
const x = 294;
const z = 92;

// Punto de referencia (ejemplo: base en Minecraft y su posición real en Google Earth)
const reference = {
    mcX: 388, // Coordenada X en Minecraft
    mcZ: 92, // Coordenada Z en Minecraft
    lat: latG,   // Latitud del punto real
    lon: lonG   // Longitud del punto real
  };
  
  // Escala: 1 bloque de Minecraft ≈ 1 metro
  // Aproximadamente, 1 grado de latitud son ~111,000 metros
  const metersPerDegree = 111000;
  const scale = 1; // bloques por metro
  
  function minecraftToGeo(mcX, mcZ) {
    const dx = mcX - reference.mcX;
    const dz = mcZ - reference.mcZ;
  
    const deltaLat = -(dz / scale) / metersPerDegree;
    const deltaLon = -(dx / scale) / (metersPerDegree * Math.cos(reference.lat * Math.PI / 180));
  
    const lat = reference.lat + deltaLat;
    const lon = reference.lon + deltaLon;
  
    return { lat, lon };
  }

    // Ejemplo de uso
    const result = minecraftToGeo(x, z);
    //console.log(result); // { lat: ..., lon: ... }

  function toDMS(deg, isLat){
    const absDeg = Math.abs(deg);
    const degrees = Math.floor(absDeg);
    const minutesFloat = (absDeg - degrees) * 60;
    const minutes = Math.floor(minutesFloat);
    const seconds = ((minutesFloat - minutes) * 60).toFixed(2);

    const direction = deg >= 0
        ? (isLat ? 'N' : 'E')
        : (isLat ? 'S' : 'W');
    return `${degrees}° ${minutes}' ${seconds}" ${direction}`;
  }

    const latN = result.lat;
    const lonE = result.lon;

    console.log("Latitud:", toDMS(latN, true));
    console.log("Longitud:", toDMS(lonE, false));

    function geoToMinecraft(lat, lon) {
      // Diferencia frente al punto de referencia real
      const deltaLat = lat - reference.lat;
      const deltaLon = lon - reference.lon;

      // Norte/Sud (positivo/negativo en Z)
      const dz = -(deltaLat * metersPerDegree * scale);

      // Este/Oeste (positivo/negativo en X)
      const dx = -(deltaLon * (metersPerDegree * Math.cos(reference.lat * Math.PI / 180)) * scale);

      const mcX = reference.mcX + dx;
      const mcZ = reference.mcZ + dz;

      return { x: Math.round(mcX), z: Math.round(mcZ) };
    }

    const minecraftPoint = geoToMinecraft(latDestino, lonDestino);

    console.log("Coordenadas en Minecraft:", minecraftPoint); // { x: ..., z: ... }


  //geth -datadir ~/ETH removedb
  //geth --datadir ~/ETH init ~/ETH/genesis.json
  //geth --datadir ~/ETH --networkid 1 --http --http.api eth,web3,net,miner,txpool,admin --http.addr 0.0.0.0 --http.port 8545 --http.corsdomain "*" --ws -ws.addr 0.0.0.0 --ws.port 8546 --ws.api eth,web3,net,txpool,admin --syncmode full
  //npx localtunnel --port 5006 --subdomain=etherscan
  //geth attach http://localhost:8545
  //node ethServer.js
  //


  //REGISTRO DE LUGARES
  //HOME 326 73 40
  //ELCENTRO -4490952 -3124064

  



