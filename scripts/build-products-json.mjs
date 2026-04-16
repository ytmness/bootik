import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

const imgs = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuByAMen0tmr-VDi2Kmm-C4pgYBfx3san5QlPLOYdTNiclanXKPi4TS2fTcx9bsjEntpkm5ejixD5JTXNhheV4z_ut_XCntJrpr9z5mTLUDi0E8xnaCXhGZ4iQhMh493zzQ9B5-5EfuudZ7LhgomQbDEunR0--0PRZb3Jy28P1uXehyfVx3TjmYMnhZJ0WEkeEGdXQItKBHZCDOExZvN5fwTLVldET_aF5LWkKOGWCYgkyownKGpqVyvYYX22y1m8Y010JQ2gk2fnw",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBZwK_GLhMdsqJiE8yEsCfBAhELLuO9htqxkx7WZJZfXs8ni8DXzPu3mZbco3J0Ihaxp8EnfEmq_6_ggUn9dH1CexpCsPl0gf7PQAw7P_3A67iSV_zwWtjSY3aaF05wHUTjVLB4pT07L5QFQBNaxN5MAJogb2i5xRgpc0nDZQFxnLoyr6ZiWrYTuSLCGTscE-c7aoz8uvzCp7gTkJRn5ZM_hiFYAJwqMTB5V1V-h0GawcdaiEpRpxNLzSCzDFxPu0p7Nuh8cDDlxQ",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDqj8PS-a0xqDN9U-Dp3TChBqcp6xtBoz5WtZdZj45zPPfac7NlmAes9av6UF4FO4Z07CBS3lEe4IZ_onjnQqFxW_XFcIKi0zGVaHdPxbNvrJNgTUu7xkIVjcL7CjivgoYkqJfRCp1s3MEW9xGrzE5ZPoMI1UdmC1LE5FvtvMoZR2ZDHusLDRf0wgEcedixEjo_p1HnpSYw6l8Vc2iq2DXtiFrUvF0C0sKrLSUFQP4vCv_r3NdJNMIyjpK00KEa-5afrDZyOdEa1Q",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAJlu-PAPQM1lXZUJxjFiXnKh-qfHAx4ZEl3kB-AXl8aVRdRMXp1yjGLZv8clY8X0W82Q2_tj8K301eu2L4E6NNjVf0Sf_J356_0RK4uSdnxbpy3jbUNFDDNdNfkjmkB9nAgF5ZUkRvdUngqWGD9c3h2DwV8Yvnw5rzNaRLZRfoybnwzH_Y7bHnf4kDevutxBl6PnKXR2oC9zndJjSiIvOHC2ocowr7GOmU7DIseJsXhdGgXF5Nziv_f6m5wkHvnkQlKJbts6vT5g",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD7Ca23to9TQGVO08fRdEx2txF92xrPVEPkuipMu3f7Og7qkm3jknez-aSzVCr-GUiCdXvr6YbUNZEptGX_bT_JYGvowbV7mR6IrfeQnmFzLgDkXamCAYxyfId2Tkw1XETSJEZuOQ0R_uiy86WV30VfMqzrLHdvY6Z7axZumvvA2Ito88finqWPruLbpPJyHoXR3v-YDzFKNjUUydRsZfqkfqJeuIGQyJkiCNTR0p07O0w1UnV7304brrbkYQWdf1TJbUxO_G4x1g",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCDXkB7p4USPiP_ZhIvZrsgsuY6zZawptF5NujbHqDj592YKD8zqfY339ib_U17dFsX98ExEIVUb0mWzJNYEUQleWH7j8b5TIdjcDS74rZ9TsGGp3YVLrcw8XvOlZnwnrKtVBo6gvNExju2F9Ut48xVIiivUMX7L6Ym5TsbqR1fuNj2t4gbqq_oKYLq5z1d0m-HEuohncVNV6dX85pLFclaIezYAa1x1W-277qIOYduHWMjE8Pgk_3JYNdFVmw1lJniEL97FSFdtA"
];

const ph = "assets/1.png";

const base = [
  {
    id: "ashlar-slate-pro",
    nameEs: "Ashlar Slate Pro",
    nameEn: "Ashlar Slate Pro",
    price: "$4,850",
    image: imgs[0],
    descriptionEs: "Molde de precision para textura tipo pizarra irregular.",
    descriptionEn: "Precision mold for irregular slate-style texture.",
    modelGlb: null,
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "old-plank-timber",
    nameEs: "Old Plank Timber",
    nameEn: "Old Plank Timber",
    price: "$5,200",
    image: imgs[1],
    descriptionEs: "Textura madera envejecida para concreto estampado.",
    descriptionEn: "Aged wood texture for stamped concrete.",
    modelGlb: null,
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "european-fan",
    nameEs: "European Fan",
    nameEn: "European Fan",
    price: "$4,400",
    image: imgs[2],
    descriptionEs: "Patron abanico europeo de alta definicion.",
    descriptionEn: "High-definition European fan pattern.",
    modelGlb: null,
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "roman-slate-set",
    nameEs: "Roman Slate Set",
    nameEn: "Roman Slate Set",
    price: "$4,950",
    image: imgs[3],
    descriptionEs: "Set de losetas estilo piedra romana.",
    descriptionEn: "Roman stone-style tile set.",
    modelGlb: null,
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "geo-hex-urban",
    nameEs: "Geo Hex Urban",
    nameEn: "Geo Hex Urban",
    price: "$3,800",
    image: imgs[4],
    descriptionEs: "Patron hexagonal geometrico para espacios urbanos.",
    descriptionEn: "Geometric hex pattern for urban spaces.",
    modelGlb: null,
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "cenefa-classic",
    nameEs: "Cenefa Classic",
    nameEn: "Cenefa Classic",
    price: "$2,100",
    image: imgs[5],
    descriptionEs: "Cenefa clasica para bordes y terminaciones.",
    descriptionEn: "Classic border mold for edges and finishes.",
    modelGlb: null,
    modelOrientation: "0deg 0deg 0deg"
  }
];

const meshy = [
  {
    id: "meshy-beige-stone-block",
    nameEs: "Muro / bloque piedra beige",
    nameEn: "Beige stone block wall",
    price: "Consultar",
    image: "assets/Gemini_Generated_Image_gxuvgigxuvgigxuv.png",
    descriptionEs: "Render Meshy: bloque de piedra beige. Inspecciona el modelo 3D en la ficha.",
    descriptionEn: "Meshy render: beige stone block. Inspect the 3D model on the product page.",
    modelGlb: "assets/models/Meshy_AI_Beige_Stone_Block_Wal_0416004320_texture.glb",
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "meshy-crimson-arc-tile",
    nameEs: "Mosaico arco / loseta carmesi",
    nameEn: "Crimson arc tile mosaic",
    price: "Consultar",
    image: "assets/Gemini_Generated_Image_eeysieeeysieeeys.png",
    descriptionEs: "Render Meshy: mosaico en arco tono carmesi.",
    descriptionEn: "Meshy render: crimson arc tile mosaic.",
    modelGlb: "assets/models/Meshy_AI_Crimson_Arc_Tile_Mosa_0416004434_texture.glb",
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "meshy-stone-wall",
    nameEs: "Molde muro de piedra",
    nameEn: "Stone wall mold",
    price: "Consultar",
    image: "assets/Gemini_Generated_Image_97cbm397cbm397cb.png",
    descriptionEs: "Render Meshy: muro de piedra.",
    descriptionEn: "Meshy render: stone wall mold.",
    modelGlb: "assets/models/Meshy_AI_stone_wall_mold_0416004348_texture.glb",
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "meshy-yellow-mosaic",
    nameEs: "Mosaico piedra amarilla",
    nameEn: "Yellow stone mosaic",
    price: "Consultar",
    image: "assets/Gemini_Generated_Image_xo1uc1xo1uc1xo1u.png",
    descriptionEs: "Render Meshy: mosaico piedra amarilla.",
    descriptionEn: "Meshy render: yellow stone mosaic.",
    modelGlb: "assets/models/Meshy_AI_Yellow_Stone_Mosaic_0416004410_texture.glb",
    modelOrientation: "0deg 0deg 0deg"
  },
  {
    id: "meshy-stone-flower",
    nameEs: "Piedra floral / mandala",
    nameEn: "Stone flower / mandala",
    price: "Consultar",
    image: "assets/Gemini_Generated_Image_2b5ga52b5ga52b5g.png",
    descriptionEs: "Render Meshy: patron floral en piedra.",
    descriptionEn: "Meshy render: floral stone pattern.",
    modelGlb: "assets/models/Meshy_AI_Stone_Flower_0416011051_texture.glb",
    modelOrientation: "0deg 0deg 0deg"
  }
];

const out = {
  products: [...meshy],
  _meta: {
    note: "Fuente estatica. Con Supabase: mismo shape por fila (id, nameEs, nameEn, price, image, descriptionEs, descriptionEn, modelGlb, modelOrientation). modelGlb null = sin visor 3D en ficha."
  }
};

const dest = path.join(root, "assets", "data", "products.json");
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.writeFileSync(dest, JSON.stringify(out, null, 2), "utf8");
console.log("Wrote", dest);
