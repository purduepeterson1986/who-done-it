/* Who Done It? - draws each suspect as a simple SVG character.
   Picture is 100 wide and 120 tall. The eyes are always at y=50 and the mouth
   around y=64-74, so glasses and expressions line up on every character.
   Each animal has its own head shape, ears and muzzle so they are easy to tell apart. */
var WhoArt = (function () {
  'use strict';

  var uid = 0;

  var BODY = {
    Fox: '#f08a3c', Bear: '#6b4120', Owl: '#a7784a', Rabbit: '#fbf8f4', Cat: '#9aa3b8', Dog: '#e8b767',
    'Red Clown': '#e5484d', 'Blue Clown': '#3d7bdc', 'Green Clown': '#3fb36b',
    'Yellow Clown': '#f2c230', 'Purple Clown': '#9a5fd6', 'Orange Clown': '#f58a2a'
  };
  var DARK = {
    Fox: '#b8581e', Bear: '#33190a', Owl: '#6e5232', Rabbit: '#e2b8c4', Cat: '#6b7388', Dog: '#9a6a2e',
    'Red Clown': '#a52a2e', 'Blue Clown': '#245aa6', 'Green Clown': '#23814a',
    'Yellow Clown': '#b38c12', 'Purple Clown': '#6a3aa0', 'Orange Clown': '#b75c12'
  };

  var SHIRT = {
    'Solid Red': '#e5484d', 'Solid Blue': '#3d7bdc', 'Striped': '#3d7bdc',
    'Polka-dot': '#3fb36b', 'Star Shirt': '#9a5fd6'
  };

  function isClown(species) { return /Clown/.test(species); }

  /* ---------- ears and hair (drawn behind the head) ----------
     Ears sit out to the sides, so a hat in the middle of the head never hides them. */
  function ears(species, dark, body, t) {
    if (isClown(species)) {
      if (t.curly) {
        // Curly hair: bunches of round puffs on each side and on top
        return '<circle cx="20" cy="34" r="11" fill="' + body + '"/><circle cx="80" cy="34" r="11" fill="' + body + '"/>' +
               '<circle cx="14" cy="47" r="8" fill="' + body + '"/><circle cx="86" cy="47" r="8" fill="' + body + '"/>' +
               '<circle cx="50" cy="20" r="9" fill="' + body + '"/>' +
               '<circle cx="20" cy="34" r="4" fill="' + dark + '"/><circle cx="80" cy="34" r="4" fill="' + dark + '"/>' +
               '<circle cx="14" cy="47" r="3" fill="' + dark + '"/><circle cx="86" cy="47" r="3" fill="' + dark + '"/>';
      }
      // Spiky hair: big pointed tufts on each side (they show even under a hat) and one on top
      return '<polygon points="0,20 34,30 20,46" fill="' + body + '"/><polygon points="100,20 66,30 80,46" fill="' + body + '"/>' +
             '<polygon points="0,50 26,36 24,58" fill="' + body + '"/><polygon points="100,50 74,36 76,58" fill="' + body + '"/>' +
             '<polygon points="40,26 50,4 60,26" fill="' + body + '"/>';
    }
    switch (species) {
      case 'Fox':
        // tall, sharp ears with dark tips, set wide on the head
        return '<polygon points="16,44 16,3 42,26" fill="' + body + '"/>' +
               '<polygon points="84,44 84,3 58,26" fill="' + body + '"/>' +
               '<polygon points="16,3 16,16 26,14" fill="' + dark + '"/>' +
               '<polygon points="84,3 84,16 74,14" fill="' + dark + '"/>' +
               '<polygon points="20,30 20,14 32,26" fill="#fff3e0"/>' +
               '<polygon points="80,30 80,14 68,26" fill="#fff3e0"/>';
      case 'Cat':
        // short ears with pink insides
        return '<polygon points="24,40 26,18 44,30" fill="' + body + '"/>' +
               '<polygon points="76,40 74,18 56,30" fill="' + body + '"/>' +
               '<polygon points="29,33 30,24 38,30" fill="#f5b5c0"/>' +
               '<polygon points="71,33 70,24 62,30" fill="#f5b5c0"/>';
      case 'Bear':
        // big round ears
        return '<circle cx="22" cy="30" r="13" fill="' + body + '"/><circle cx="78" cy="30" r="13" fill="' + body + '"/>' +
               '<circle cx="22" cy="30" r="6.5" fill="#a8774c"/><circle cx="78" cy="30" r="6.5" fill="#a8774c"/>';
      case 'Rabbit':
        // long ears, set apart so a hat fits between them
        return '<ellipse cx="33" cy="16" rx="7" ry="18" fill="' + body + '" stroke="#b9aca0" stroke-width="2.5" transform="rotate(-8 33 16)"/>' +
               '<ellipse cx="67" cy="16" rx="7" ry="18" fill="' + body + '" stroke="#b9aca0" stroke-width="2.5" transform="rotate(8 67 16)"/>' +
               '<ellipse cx="33" cy="18" rx="3" ry="11" fill="#f5b5c0" transform="rotate(-8 33 16)"/>' +
               '<ellipse cx="67" cy="18" rx="3" ry="11" fill="#f5b5c0" transform="rotate(8 67 16)"/>';
      case 'Dog':
        // long floppy ears hanging down past the cheeks (drawn in front of the head, see dogEars)
        return '';
      case 'Owl':
        // feather tufts, darker and set wide
        return '<polygon points="18,38 14,2 40,24" fill="' + dark + '"/>' +
               '<polygon points="82,38 86,2 60,24" fill="' + dark + '"/>';
      default:
        return '';
    }
  }

  /* ---------- head shapes ---------- */
  function head(species, body) {
    if (isClown(species)) return '<ellipse cx="50" cy="52" rx="30" ry="27" fill="#fff7ef"/>';
    switch (species) {
      case 'Fox':
        // narrow head that comes to a point at the chin
        return '<path d="M18,40 Q50,20 82,40 Q80,60 66,72 Q58,80 50,81 Q42,80 34,72 Q20,60 18,40 Z" fill="' + body + '"/>';
      case 'Bear':
        // wide, round head
        return '<ellipse cx="50" cy="53" rx="34" ry="28" fill="' + body + '"/>';
      case 'Owl':
        // tall egg-shaped head
        return '<ellipse cx="50" cy="53" rx="27" ry="30" fill="' + body + '"/>';
      case 'Cat':
        return '<ellipse cx="50" cy="53" rx="31" ry="26" fill="' + body + '"/>';
      case 'Rabbit':
        return '<ellipse cx="50" cy="53" rx="28" ry="27" fill="' + body + '" stroke="#b9aca0" stroke-width="2.5"/>';
      default:
        return '<ellipse cx="50" cy="52" rx="30" ry="27" fill="' + body + '"/>';
    }
  }

  /* ---------- muzzles, noses and markings (drawn on the head, under the eyes) ---------- */
  function snout(species, body, dark) {
    if (isClown(species)) {
      // a round patch of face paint around the mouth in the clown's own color (a plain shape,
      // so it never makes a grumpy clown look like it is smiling), and a red nose
      return '<ellipse cx="50" cy="69" rx="13" ry="8.5" fill="' + body + '" opacity=".55"/>' +
             '<circle cx="50" cy="58" r="5.5" fill="#e5484d"/><circle cx="48" cy="56" r="1.6" fill="#fff" opacity=".7"/>';
    }
    switch (species) {
      case 'Fox':
        // white cheek fluff sticking out at the sides, white muzzle, small black nose
        return '<polygon points="22,48 6,66 34,70" fill="' + body + '"/><polygon points="78,48 94,66 66,70" fill="' + body + '"/>' +
               '<polygon points="24,56 13,65 32,67" fill="#fff3e0"/><polygon points="76,56 87,65 68,67" fill="#fff3e0"/>' +
               '<path d="M34,60 Q50,56 66,60 Q62,74 50,80 Q38,74 34,60 Z" fill="#fff3e0"/>' +
               '<ellipse cx="50" cy="60" rx="3.5" ry="3" fill="#222"/>';
      case 'Cat':
        // forehead stripes, pink nose, long whiskers
        return '<path d="M50,29 L50,37 M43,30 L44,37 M57,30 L56,37" stroke="#4a5263" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
               '<polygon points="46,56 54,56 50,62" fill="#ff8fa3"/>' +
               '<path d="M12,55 L36,59 M12,64 L36,62 M88,55 L64,59 M88,64 L64,62" stroke="#333" stroke-width="1.4" fill="none"/>';
      case 'Bear':
        // one big round light snout and a big black nose
        return '<ellipse cx="50" cy="65" rx="16" ry="12" fill="#d9b98a"/><ellipse cx="50" cy="58" rx="6" ry="4.2" fill="#111"/>';
      case 'Dog':
        // brown patch over one eye, two round cheeks (jowls) and a big nose
        return '<ellipse cx="61" cy="48" rx="10" ry="9" fill="' + dark + '" opacity=".75"/>' +
               '<circle cx="43" cy="65" r="8" fill="#fbeedd"/><circle cx="57" cy="65" r="8" fill="#fbeedd"/>' +
               '<ellipse cx="50" cy="58" rx="6.5" ry="4.5" fill="#222"/>';
      case 'Owl':
        // little feather marks, big white eye rings, small beak between the eyes
        return '<path d="M41,30 l3,3 l3,-3 M47,27 l3,3 l3,-3 M53,30 l3,3 l3,-3" stroke="' + dark + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
               '<circle cx="40" cy="50" r="11" fill="#ffffff"/><circle cx="60" cy="50" r="11" fill="#ffffff"/>' +
               '<polygon points="46,54 54,54 50,63" fill="#f0a030"/>';
      case 'Rabbit':
        // round puffy muzzle and pink nose
        return '<circle cx="45.5" cy="63" r="5.5" fill="#f1eaea"/><circle cx="54.5" cy="63" r="5.5" fill="#f1eaea"/>' +
               '<ellipse cx="50" cy="59" rx="4" ry="3" fill="#f08aa0"/>';
      default:
        return '';
    }
  }

  // Drawn after the face: the dog's floppy ears hang over the sides of the head,
  // and the rabbit's buck teeth show under its mouth.
  function frontBits(species, dark) {
    if (species === 'Dog') {
      return '<ellipse cx="17" cy="56" rx="9" ry="21" fill="' + dark + '" transform="rotate(12 17 56)"/>' +
             '<ellipse cx="83" cy="56" rx="9" ry="21" fill="' + dark + '" transform="rotate(-12 83 56)"/>';
    }
    if (species === 'Rabbit') {
      return '<rect x="46.4" y="72" width="3.4" height="5" rx=".8" fill="#fff" stroke="#b9aca0" stroke-width=".8"/>' +
             '<rect x="50.2" y="72" width="3.4" height="5" rx=".8" fill="#fff" stroke="#b9aca0" stroke-width=".8"/>';
    }
    return '';
  }

  /* ---------- hats (narrow, so they sit between the ears) ---------- */
  function headwear(kind) {
    switch (kind) {
      case 'Crown':
        return '<polygon points="37,29 39,10 44,20 50,5 56,20 61,10 63,29" fill="#f6c453" stroke="#c98a10" stroke-width="2" stroke-linejoin="round"/>' +
               '<circle cx="50" cy="20" r="2.5" fill="#e5484d"/>';
      case 'Party Hat':
        return '<polygon points="41,29 50,-1 59,29" fill="#ff7ab6"/>' +
               '<polygon points="44.5,19 55.5,19 50,7" fill="#ffe36b"/>' +
               '<circle cx="50" cy="-1" r="4" fill="#54d1db"/>';
      case 'Wizard Hat':
        return '<polygon points="38,28 53,-6 62,28" fill="#4a3fb0"/>' +
               '<ellipse cx="50" cy="28" rx="16" ry="4" fill="#362d8a"/>' +
               '<text x="52" y="17" font-size="9" text-anchor="middle" fill="#ffe36b">&#9733;</text>';
      case 'Baseball Cap':
        return '<path d="M35,31 Q36,11 50,11 Q64,11 65,31 Z" fill="#e5484d"/>' +
               '<path d="M33,31 Q52,26 74,30 Q72,35 60,35 L42,35 Q34,35 33,31 Z" fill="#b8323a"/>' +
               '<circle cx="50" cy="12" r="2" fill="#b8323a"/>';
      default:
        return '';
    }
  }

  function eyewear(kind) {
    switch (kind) {
      case 'Sunglasses':
        return '<rect x="30" y="44" width="17" height="12" rx="5" fill="#222"/>' +
               '<rect x="53" y="44" width="17" height="12" rx="5" fill="#222"/>' +
               '<line x1="47" y1="48" x2="53" y2="48" stroke="#222" stroke-width="2"/>' +
               '<line x1="33" y1="47" x2="38" y2="47" stroke="#fff" stroke-width="1.5" opacity=".5"/>' +
               '<line x1="56" y1="47" x2="61" y2="47" stroke="#fff" stroke-width="1.5" opacity=".5"/>';
      case 'Round Glasses':
        return '<circle cx="39" cy="50" r="8" fill="none" stroke="#333" stroke-width="2.5"/>' +
               '<circle cx="61" cy="50" r="8" fill="none" stroke="#333" stroke-width="2.5"/>' +
               '<line x1="47" y1="50" x2="53" y2="50" stroke="#333" stroke-width="2.5"/>';
      case 'Monocle':
        return '<circle cx="61" cy="50" r="8" fill="none" stroke="#f6c453" stroke-width="2.5"/>' +
               '<path d="M61,58 Q64,70 58,84" fill="none" stroke="#f6c453" stroke-width="1.5"/>';
      default:
        return '';
    }
  }

  /* ---------- expressions ----------
     Each one has its own mouth, so you can still tell them apart when sunglasses hide the eyes:
     happy = smile, surprised = round "O", grumpy = frown. Grumpy also has eyebrows slanted down,
     drawn above where sunglasses sit so they still show. */
  function face(expression) {
    var eyes, mouth;
    if (expression === 'Surprised') {
      eyes = '<circle cx="40" cy="50" r="4.5" fill="#222"/><circle cx="60" cy="50" r="4.5" fill="#222"/>' +
             '<circle cx="41.5" cy="48.5" r="1.3" fill="#fff"/><circle cx="61.5" cy="48.5" r="1.3" fill="#fff"/>';
      mouth = '<ellipse cx="50" cy="69" rx="4" ry="5.5" fill="#222"/>';
    } else if (expression === 'Grumpy') {
      eyes = '<circle cx="40" cy="51" r="3.2" fill="#222"/><circle cx="60" cy="51" r="3.2" fill="#222"/>' +
             '<path d="M31,37 L46,42 M69,37 L54,42" stroke="#222" stroke-width="3" stroke-linecap="round" fill="none"/>';
      mouth = '<path d="M40,73 Q50,62 60,73" fill="none" stroke="#222" stroke-width="2.8" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="40" cy="50" r="3.5" fill="#222"/><circle cx="60" cy="50" r="3.5" fill="#222"/>' +
             '<circle cx="41.2" cy="48.8" r="1.1" fill="#fff"/><circle cx="61.2" cy="48.8" r="1.1" fill="#fff"/>';
      mouth = '<path d="M41,65 Q50,73 59,65" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>';
    }
    return eyes + mouth;
  }

  function shirtFill(kind, id) {
    if (kind === 'Striped') {
      return { defs: '<pattern id="' + id + '" width="12" height="12" patternUnits="userSpaceOnUse">' +
                     '<rect width="12" height="12" fill="#ffffff"/><rect width="12" height="6" fill="#3d7bdc"/></pattern>',
               fill: 'url(#' + id + ')' };
    }
    if (kind === 'Polka-dot') {
      return { defs: '<pattern id="' + id + '" width="14" height="14" patternUnits="userSpaceOnUse">' +
                     '<rect width="14" height="14" fill="#ffffff"/><circle cx="7" cy="7" r="3" fill="#e5484d"/></pattern>',
               fill: 'url(#' + id + ')' };
    }
    if (kind === 'Star Shirt') {
      return { defs: '<pattern id="' + id + '" width="18" height="18" patternUnits="userSpaceOnUse">' +
                     '<rect width="18" height="18" fill="#9a5fd6"/>' +
                     '<text x="9" y="13" font-size="10" text-anchor="middle" fill="#ffe36b">&#9733;</text></pattern>',
               fill: 'url(#' + id + ')' };
    }
    return { defs: '', fill: SHIRT[kind] || SHIRT['Solid Blue'] };
  }

  /* ---------- held items ----------
     The holding hand is at (85,100) on the right, or (15,100) on the left for the balloon.
     Every item is drawn so the hand grips it. */
  var HAND = { x: 85, y: 100 };
  var LEFT_HAND = { x: 15, y: 100 };
  function leftHanded(item) { return item === 'Balloon'; }

  function heldItem(kind) {
    switch (kind) {
      case 'Balloon':
        // held in the LEFT hand, so the flip badge in the card's top-right corner never hides it;
        // outlined so it shows even next to red hair
        return '<path d="M15,98 Q18,70 10,44" fill="none" stroke="#666" stroke-width="1.2"/>' +
               '<ellipse cx="10" cy="31" rx="9" ry="11" fill="#e5484d" stroke="#8a1c24" stroke-width="1.5"/>' +
               '<polygon points="8,42 12,42 10,45" fill="#8a1c24"/>' +
               '<ellipse cx="7" cy="27" rx="2" ry="3.5" fill="#fff" opacity=".55"/>';
      case 'Magnifying Glass':
        return '<line x1="85" y1="101" x2="89" y2="91" stroke="#8a5a2b" stroke-width="4" stroke-linecap="round"/>' +
               '<circle cx="91" cy="83" r="8.5" fill="#cfeeff" fill-opacity=".75" stroke="#555" stroke-width="2.8"/>' +
               '<path d="M87,79 Q89,77 92,77" stroke="#fff" stroke-width="1.5" fill="none" stroke-linecap="round"/>';
      case 'Ice Cream Cone':
        return '<polygon points="79,86 93,86 86,106" fill="#d9a46a" stroke="#a87638" stroke-width="1"/>' +
               '<path d="M81,90 L91,90 M83,95 L89,95" stroke="#a87638" stroke-width="1"/>' +
               '<circle cx="86" cy="80" r="8.5" fill="#ff9fc9"/>' +
               '<circle cx="83" cy="78" r="1" fill="#54d1db"/><circle cx="88" cy="76" r="1" fill="#ffe36b"/><circle cx="89" cy="82" r="1" fill="#3fb36b"/>';
      case 'Book':
        // a big green book with a spine, white pages and a star on the cover
        return '<rect x="73" y="82" width="25" height="21" rx="2" fill="#2f9e6b" stroke="#1d6b47" stroke-width="1.5"/>' +
               '<rect x="73" y="82" width="4.5" height="21" fill="#1d6b47"/>' +
               '<rect x="95" y="84" width="2" height="17" fill="#ffffff"/>' +
               '<text x="86.5" y="96" font-size="10" text-anchor="middle" fill="#ffe36b">&#9733;</text>';
      case 'Flashlight':
        // a flashlight pointing up with a yellow beam
        return '<polygon points="80,81 90,81 96,56 74,56" fill="#ffd84d" opacity=".55"/>' +
               '<rect x="81" y="87" width="8" height="18" rx="2" fill="#555"/>' +
               '<polygon points="78,80 92,80 89,88 81,88" fill="#777"/>' +
               '<rect x="79" y="79" width="12" height="2.5" rx="1" fill="#fff3a0"/>' +
               '<rect x="83.5" y="92" width="3" height="5" rx="1" fill="#e5484d"/>';
      default:
        return '';
    }
  }

  /* ---------- arms and hands ----------
     Short sleeves in the shirt's color. The right arm reaches out when holding something. */
  // holding: 'right', 'left' or false
  function arms(shirt, holding) {
    var left = holding === 'left' ? 'M31,84 L' + (LEFT_HAND.x + 2) + ',' + (LEFT_HAND.y - 2) : 'M31,84 L24,106';
    var right = holding === 'right' ? 'M69,84 L' + (HAND.x - 2) + ',' + (HAND.y - 2) : 'M69,84 L76,106';
    var path = left + ' ' + right;
    return '<path d="' + path + '" stroke="rgba(0,0,0,.18)" stroke-width="11" stroke-linecap="round" fill="none"/>' +
           '<path d="' + path + '" stroke="' + shirt + '" stroke-width="8.5" stroke-linecap="round" fill="none"/>';
  }

  function hands(species, body, dark, holding) {
    var fill = isClown(species) ? '#ffffff' : body;   // clowns wear white gloves
    var edge = isClown(species) ? '#b9aca0' : species === 'Rabbit' ? '#b9aca0' : dark;
    var rx = holding === 'right' ? HAND.x : 77, ry = holding === 'right' ? HAND.y : 108;
    var lx = holding === 'left' ? LEFT_HAND.x : 23, ly = holding === 'left' ? LEFT_HAND.y : 108;
    return '<circle cx="' + lx + '" cy="' + ly + '" r="5.5" fill="' + fill + '" stroke="' + edge + '" stroke-width="1.3"/>' +
           '<circle cx="' + rx + '" cy="' + ry + '" r="5.5" fill="' + fill + '" stroke="' + edge + '" stroke-width="1.3"/>';
  }

  /* Returns SVG markup for one suspect. */
  function suspect(s) {
    var t = s.traits;
    var species = t.species;
    var body = BODY[species] || '#888';
    var dark = DARK[species] || '#555';
    var id = 'pat' + (++uid);
    var shirt = shirtFill(t.shirt, id);
    var holding = !t.item || t.item === 'None' ? false : leftHanded(t.item) ? 'left' : 'right';
    var cheek = t.stars
      // clowns with painted stars on their cheeks
      ? '<text x="28" y="68" font-size="13" text-anchor="middle" fill="' + dark + '">&#9733;</text>' +
        '<text x="72" y="68" font-size="13" text-anchor="middle" fill="' + dark + '">&#9733;</text>'
      : '<ellipse cx="31" cy="61" rx="4" ry="2.5" fill="#ff8fa3" opacity=".5"/>' +
        '<ellipse cx="69" cy="61" rx="4" ry="2.5" fill="#ff8fa3" opacity=".5"/>';
    // a big yellow bow tie under the chin
    var bowtie = t.bowtie
      ? '<polygon points="34,74 50,82 34,90" fill="#f6c453" stroke="#c98a10" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<polygon points="66,74 50,82 66,90" fill="#f6c453" stroke="#c98a10" stroke-width="1.5" stroke-linejoin="round"/>' +
        '<circle cx="50" cy="82" r="4" fill="#e39b1c"/>'
      : '';

    return '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
      '<defs>' + shirt.defs + '</defs>' +
      arms(shirt.fill, holding) +
      // body and shirt; shirts with white in them get a faint outline so they show on a white background
      '<path d="M26,84 Q26,76 36,76 L64,76 Q74,76 74,84 L76,120 L24,120 Z" fill="' + shirt.fill + '"' +
      (t.shirt === 'Striped' || t.shirt === 'Polka-dot' ? ' stroke="#b9aca0" stroke-width="1.5"' : '') + '/>' +
      ears(species, dark, body, t) +
      head(species, body) +
      snout(species, body, dark) +
      cheek +
      bowtie +
      face(t.expression) +
      frontBits(species, dark) +
      eyewear(t.eyewear) +
      headwear(t.headwear) +
      heldItem(t.item) +
      hands(species, body, dark, holding) +
      '</svg>';
  }

  return { suspect: suspect };
})();
