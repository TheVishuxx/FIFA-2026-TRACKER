const TOTAL = 980;

const TEAMS = [
  {name:"Argentina",flag:"🇦🇷",code:"ARG",n:18},
  {name:"Brasil",flag:"🇧🇷",code:"BRA",n:18},
  {name:"Francia",flag:"🇫🇷",code:"FRA",n:18},
  {name:"España",flag:"🇪🇸",code:"ESP",n:18},
  {name:"Alemania",flag:"🇩🇪",code:"GER",n:18},
  {name:"Portugal",flag:"🇵🇹",code:"POR",n:18},
  {name:"Inglaterra",flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿",code:"ENG",n:18},
  {name:"México",flag:"🇲🇽",code:"MEX",n:18},
  {name:"Uruguay",flag:"🇺🇾",code:"URU",n:18},
  {name:"Colombia",flag:"🇨🇴",code:"COL",n:18},
  {name:"Chile",flag:"🇨🇱",code:"CHI",n:18},
  {name:"Ecuador",flag:"🇪🇨",code:"ECU",n:18},
  {name:"Perú",flag:"🇵🇪",code:"PER",n:18},
  {name:"Bolivia",flag:"🇧🇴",code:"BOL",n:18},
  {name:"Paraguay",flag:"🇵🇾",code:"PAR",n:18},
  {name:"Venezuela",flag:"🇻🇪",code:"VEN",n:18},
  {name:"EE.UU.",flag:"🇺🇸",code:"USA",n:18},
  {name:"Canadá",flag:"🇨🇦",code:"CAN",n:18},
  {name:"Japón",flag:"🇯🇵",code:"JPN",n:18},
  {name:"Marruecos",flag:"🇲🇦",code:"MAR",n:18},
  {name:"Senegal",flag:"🇸🇳",code:"SEN",n:18},
  {name:"Nigeria",flag:"🇳🇬",code:"NGA",n:18},
  {name:"Corea del Sur",flag:"🇰🇷",code:"KOR",n:18},
  {name:"Australia",flag:"🇦🇺",code:"AUS",n:18},
  {name:"Croacia",flag:"🇭🇷",code:"CRO",n:18},
  {name:"Países Bajos",flag:"🇳🇱",code:"NED",n:18},
  {name:"Bélgica",flag:"🇧🇪",code:"BEL",n:18},
  {name:"Suiza",flag:"🇨🇭",code:"SUI",n:18},
  {name:"Panamá",flag:"🇵🇦",code:"PAN",n:18},
  {name:"Ghana",flag:"🇬🇭",code:"GHA",n:18},
  {name:"Chequia",flag:"🇨🇿",code:"CZE",n:18},
  {name:"Polonia",flag:"🇵🇱",code:"POL",n:18},
  {name:"Arabia Saudita",flag:"🇸🇦",code:"KSA",n:18},
  {name:"Irán",flag:"🇮🇷",code:"IRN",n:18},
  {name:"Nueva Zelanda",flag:"🇳🇿",code:"NZL",n:18},
  {name:"Costa Rica",flag:"🇨🇷",code:"CRC",n:18},
  {name:"Honduras",flag:"🇭🇳",code:"HON",n:18},
  {name:"Jamaica",flag:"🇯🇲",code:"JAM",n:18},
  {name:"El Salvador",flag:"🇸🇻",code:"SLV",n:18},
  {name:"Túnez",flag:"🇹🇳",code:"TUN",n:18},
  {name:"Camerún",flag:"🇨🇲",code:"CMR",n:18},
  {name:"Argelia",flag:"🇩🇿",code:"ALG",n:18},
  {name:"Costa de Marfil",flag:"🇨🇮",code:"CIV",n:18},
  {name:"Sudáfrica",flag:"🇿🇦",code:"RSA",n:18},
  {name:"Egipto",flag:"🇪🇬",code:"EGY",n:18},
  {name:"Turquía",flag:"🇹🇷",code:"TUR",n:18},
  {name:"Escocia",flag:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",code:"SCO",n:18},
  {name:"Dinamarca",flag:"🇩🇰",code:"DEN",n:18},
  {name:"Austria",flag:"🇦🇹",code:"AUT",n:18},
];

const ESPECIALES = [
  {name:"Láminas Especiales",flag:"⭐",code:"SPEC",n:20,
   stickers:Array.from({length:20},(_,i)=>"E-"+(i+1))}
];

const CRACKS = [
  {name:"Los Cracks",flag:"⚽",code:"CRK",n:24,
   stickers:Array.from({length:24},(_,i)=>"CRK-"+(i+1))}
];

// Build sticker arrays for teams
TEAMS.forEach(t => {
  t.stickers = Array.from({length: t.n}, (_, i) => t.code + "-" + (i+1));
});
