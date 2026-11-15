/* Who Done It? - draws each suspect as a simple SVG character. */
var WhoArt = (function () {
  'use strict';

  var uid = 0;

  var BODY = {
    Fox: '#f08a3c', Bear: '#6e4325', Owl: '#a7784a', Rabbit: '#fbf8f4', Cat: '#9aa3b8', Dog: '#e8b767',
    'Red Monster': '#e5484d', 'Blue Monster': '#3d7bdc', 'Green Monster': '#3fb36b',
    'Yellow Monster': '#f2c230', 'Purple Monster': '#9a5fd6', 'Orange Monster': '#f58a2a',
    'Red Clown': '#e5484d', 'Blue Clown': '#3d7bdc', 'Green Clown': '#3fb36b',
    'Yellow Clown': '#f2c230', 'Purple Clown': '#9a5fd6', 'Orange Clown': '#f58a2a'
  };
  var DARK = {
    Fox: '#b8581e', Bear: '#4a2c16', Owl: '#6e5232', Rabbit: '#e2b8c4', Cat: '#6b7388', Dog: '#9a6a2e',
    'Red Monster': '#a52a2e', 'Blue Monster': '#245aa6', 'Green Monster': '#23814a',
    'Yellow Monster': '#b38c12', 'Purple Monster': '#6a3aa0', 'Orange Monster': '#b75c12',
    'Red Clown': '#a52a2e', 'Blue Clown': '#245aa6', 'Green Clown': '#23814a',
    'Yellow Clown': '#b38c12', 'Purple Clown': '#6a3aa0', 'Orange Clown': '#b75c12'
  };

  var SHIRT = {
    'Solid Red': '#e5484d', 'Solid Blue': '#3d7bdc', 'Striped': '#3d7bdc',
    'Polka-dot': '#3fb36b', 'Star Shirt': '#9a5fd6'
  };

  function ears(species, dark, body) {
    if (/Clown/.test(species)) {
      // Clowns: curly hair puffs on each side of the head
      return '<circle cx="20" cy="36" r="11" fill="' + body + '"/><circle cx="80" cy="36" r="11" fill="' + body + '"/>' +
             '<circle cx="50" cy="20" r="9" fill="' + body + '"/>' +
             '<circle cx="20" cy="36" r="4" fill="' + dark + '"/><circle cx="80" cy="36" r="4" fill="' + dark + '"/>';
    }
    if (species === 'Fox') {
      // tall, sharp ears with dark tips
      return '<polygon points="24,36 28,4 48,26" fill="' + body + '"/>' +
             '<polygon points="76,36 72,4 52,26" fill="' + body + '"/>' +
             '<polygon points="28,12 30,6 38,22" fill="' + dark + '"/>' +
             '<polygon points="72,12 70,6 62,22" fill="' + dark + '"/>';
    }
    if (species === 'Cat') {
      // short, rounded ears
      return '<polygon points="27,38 30,20 44,30" fill="' + body + '"/>' +
             '<polygon points="73,38 70,20 56,30" fill="' + body + '"/>' +
             '<polygon points="31,32 33,25 39,30" fill="' + dark + '"/>' +
             '<polygon points="69,32 67,25 61,30" fill="' + dark + '"/>';
    }
    if (species === 'Bear') {
      // big round ears
      return '<circle cx="26" cy="30" r="13" fill="' + body + '"/><circle cx="74" cy="30" r="13" fill="' + body + '"/>' +
             '<circle cx="26" cy="30" r="6.5" fill="' + dark + '"/><circle cx="74" cy="30" r="6.5" fill="' + dark + '"/>';
    }
    if (species === 'Rabbit') {
      return '<ellipse cx="38" cy="16" rx="7" ry="18" fill="' + body + '" stroke="#b9aca0" stroke-width="2.5"/>' +
             '<ellipse cx="62" cy="16" rx="7" ry="18" fill="' + body + '" stroke="#b9aca0" stroke-width="2.5"/>' +
             '<ellipse cx="38" cy="18" rx="3" ry="11" fill="#f5b5c0"/><ellipse cx="62" cy="18" rx="3" ry="11" fill="#f5b5c0"/>';
    }
    if (species === 'Dog') {
      return '<ellipse cx="20" cy="50" rx="9" ry="17" fill="' + dark + '" transform="rotate(14 20 50)"/>' +
             '<ellipse cx="80" cy="50" rx="9" ry="17" fill="' + dark + '" transform="rotate(-14 80 50)"/>';
    }
    if (species === 'Owl') {
      // tall, sharp feather tufts (taller and sharper than the cat's ears)
      return '<polygon points="25,34 28,2 46,24" fill="' + dark + '"/>' +
             '<polygon points="75,34 72,2 54,24" fill="' + dark + '"/>' +
             '<polygon points="30,26 31,12 39,23" fill="' + body + '"/>' +
             '<polygon points="70,26 69,12 61,23" fill="' + body + '"/>';
    }
    // Monsters: two little horns
    return '<polygon points="28,30 22,8 40,24" fill="' + dark + '"/><polygon points="72,30 78,8 60,24" fill="' + dark + '"/>';
  }

  function headwear(kind) {
    switch (kind) {
      case 'Crown':
        return '<polygon points="32,26 35,6 43,18 50,2 57,18 65,6 68,26" fill="#f6c453" stroke="#c98a10" stroke-width="2" stroke-linejoin="round"/>' +
               '<circle cx="50" cy="16" r="2.5" fill="#e5484d"/>';
      case 'Party Hat':
        return '<polygon points="40,27 50,-2 60,27" fill="#ff7ab6"/>' +
               '<polygon points="44,18 56,18 50,6" fill="#ffe36b"/>' +
               '<circle cx="50" cy="-3" r="4" fill="#54d1db"/>';
      case 'Wizard Hat':
        return '<polygon points="34,27 52,-6 66,27" fill="#4a3fb0"/>' +
               '<ellipse cx="50" cy="27" rx="20" ry="4.5" fill="#362d8a"/>' +
               '<text x="52" y="14" font-size="9" text-anchor="middle" fill="#ffe36b">&#9733;</text>';
      case 'Baseball Cap':
        return '<path d="M30,30 Q32,8 50,8 Q68,8 70,30 Z" fill="#e5484d"/>' +
               '<path d="M26,30 Q50,24 74,30 Q70,35 56,35 L44,35 Q30,35 26,30 Z" fill="#b8323a"/>';
      default:
        return '';
    }
  }

  function eyewear(kind) {
    switch (kind) {
      case 'Sunglasses':
        return '<rect x="30" y="44" width="17" height="12" rx="5" fill="#222"/>' +
               '<rect x="53" y="44" width="17" height="12" rx="5" fill="#222"/>' +
               '<line x1="47" y1="48" x2="53" y2="48" stroke="#222" stroke-width="2"/>';
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

  function face(expression) {
    var eyes, mouth;
    if (expression === 'Surprised') {
      eyes = '<circle cx="40" cy="50" r="4.5" fill="#222"/><circle cx="60" cy="50" r="4.5" fill="#222"/>';
      mouth = '<ellipse cx="50" cy="66" rx="4" ry="5.5" fill="#222"/>';
    } else if (expression === 'Winking') {
      eyes = '<circle cx="40" cy="50" r="3.5" fill="#222"/>' +
             '<path d="M55,50 Q60,44 65,50" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>';
      mouth = '<path d="M40,64 Q50,74 60,64" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="40" cy="50" r="3.5" fill="#222"/><circle cx="60" cy="50" r="3.5" fill="#222"/>';
      mouth = '<path d="M40,64 Q50,74 60,64" fill="none" stroke="#222" stroke-width="2.5" stroke-linecap="round"/>';
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

  function heldItem(kind) {
    switch (kind) {
      case 'Balloon':
        return '<line x1="84" y1="92" x2="88" y2="36" stroke="#666" stroke-width="1.2"/>' +
               '<ellipse cx="88" cy="28" rx="9" ry="11" fill="#e5484d"/>' +
               '<polygon points="86,38 90,38 88,41" fill="#e5484d"/>';
      case 'Magnifying Glass':
        return '<line x1="82" y1="104" x2="74" y2="112" stroke="#8a5a2b" stroke-width="3.5" stroke-linecap="round"/>' +
               '<circle cx="86" cy="94" r="8" fill="#cfeeff" fill-opacity=".7" stroke="#555" stroke-width="2.5"/>';
      case 'Ice Cream Cone':
        return '<polygon points="80,92 92,92 86,112" fill="#d9a46a"/>' +
               '<circle cx="86" cy="88" r="8" fill="#ff9fc9"/>';
      case 'Book':
        return '<rect x="78" y="88" width="18" height="14" rx="1.5" fill="#3d7bdc"/>' +
               '<rect x="80" y="90" width="14" height="10" fill="#ffffff"/>';
      case 'Flashlight':
        return '<rect x="78" y="92" width="16" height="7" rx="2" fill="#444" transform="rotate(-30 86 95)"/>' +
               '<polygon points="92,84 100,78 100,90" fill="#fff3a0" opacity=".8"/>';
      default:
        return '';
    }
  }

  // Each animal's snout and nose, so they are easy to tell apart. Drawn over the head.
  function snout(species) {
    if (/Clown/.test(species)) return '<circle cx="50" cy="58" r="5" fill="#e5484d"/>';
    if (/Monster/.test(species)) return '';
    switch (species) {
      case 'Fox':
        // pale, pointed muzzle with a black nose
        return '<polygon points="34,54 66,54 50,76" fill="#fff3e0"/><circle cx="50" cy="55" r="3.5" fill="#222"/>';
      case 'Cat':
        // pink triangle nose and whiskers
        return '<path d="M50,27 L50,35 M43,28 L44,35 M57,28 L56,35" stroke="#4a5263" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
               '<polygon points="46,55 54,55 50,62" fill="#ff8fa3"/>' +
               '<path d="M22,56 L36,58 M22,63 L36,61 M78,56 L64,58 M78,63 L64,61" stroke="#333" stroke-width="1.4" fill="none"/>';
      case 'Bear':
        // round light snout with a big black nose
        return '<ellipse cx="50" cy="63" rx="15" ry="11" fill="#e3c9a2"/><ellipse cx="50" cy="57" rx="5" ry="3.8" fill="#222"/>';
      case 'Dog':
        // floppy-eared pup with a cream muzzle and black nose
        return '<ellipse cx="50" cy="63" rx="13" ry="9" fill="#fbeedd"/><ellipse cx="50" cy="57" rx="6" ry="4.5" fill="#222"/>';
      case 'Owl':
        // big white eye rings and a little orange beak
        return '<circle cx="40" cy="50" r="11" fill="#ffffff"/><circle cx="60" cy="50" r="11" fill="#ffffff"/>' +
               '<ellipse cx="50" cy="63" rx="10" ry="7" fill="#f3e2c4"/><polygon points="46,59 54,59 50,67" fill="#f0a030"/>';
      case 'Rabbit':
        // small pink nose
        return '<ellipse cx="50" cy="60" rx="4" ry="3" fill="#f08aa0"/>';
      default:
        return '';
    }
  }

  /* Returns SVG markup for one suspect. */
  function suspect(s) {
    var t = s.traits;
    var species = t.species;
    var body = BODY[species] || '#888';
    var dark = DARK[species] || '#555';
    var id = 'pat' + (++uid);
    var shirt = shirtFill(t.shirt, id);
    var cheek = '<ellipse cx="32" cy="60" rx="4" ry="2.5" fill="#ff8fa3" opacity=".5"/>' +
                '<ellipse cx="68" cy="60" rx="4" ry="2.5" fill="#ff8fa3" opacity=".5"/>';

    return '<svg viewBox="0 0 100 120" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' +
      '<defs>' + shirt.defs + '</defs>' +
      // body and shirt
      // shirts with white in them get a faint outline so they show on a white background
      '<path d="M26,84 Q26,76 36,76 L64,76 Q74,76 74,84 L76,120 L24,120 Z" fill="' + shirt.fill + '"' +
      (t.shirt === 'Striped' || t.shirt === 'Polka-dot' ? ' stroke="#b9aca0" stroke-width="1.5"' : '') + '/>' +
      // ears
      ears(species, dark, body) +
      // head (clowns have a white painted face)
      '<ellipse cx="50" cy="52" rx="30" ry="27" fill="' + (/Clown/.test(species) ? '#fff7ef' : body) + '"' +
      (species === 'Rabbit' ? ' stroke="#b9aca0" stroke-width="2.5"' : '') + '/>' +
      // snout and nose (animals, clowns; monsters have none)
      snout(species) +
      cheek +
      face(t.expression) +
      eyewear(t.eyewear) +
      headwear(t.headwear) +
      heldItem(t.item) +
      '</svg>';
  }

  return { suspect: suspect };
})();
