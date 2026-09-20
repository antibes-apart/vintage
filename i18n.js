// Translations for the static page templates (see templates/ + build.js).
// Runtime strings rendered by js/app.js live in that file's STRINGS map instead.

// Company / host details — identical in both languages (only labels are translated).
const legal = {
  legalOwnerName: 'Rednic Mircea',
  legalTradeName: 'Vintage French',
  legalSiren: '107691016',
  legalRcs: '107 691 016 R.C.S. Paris',
  legalAddress: '173 rue de Courcelles 75017 Paris',
  legalEmail: 'cookandtravelcontact@gmail.com',
  legalPhone: '+33 6 27 33 54 34',
  legalHostName: 'GitHub, Inc.',
  legalHostPhone: '+1 877 448 4820'
};

const en = {
  ...legal,
  // nav / shared
  navCollection: 'Collection',
  navShipping: 'Shipping',
  navAbout: 'About',
  legal: 'Legal notice',
  loading: 'Loading...',
  ariaWhatsApp: 'Contact us on WhatsApp',
  ariaMessenger: 'Contact us on Messenger',
  ariaLanguage: 'Language',
  // home
  homeDocTitle: 'Cook & Collect',
  homeMetaDesc: 'Browse our curated collection of vintage treasures',
  homeTitle: 'Available Items',
  homeSubtitle: 'Browse our curated collection of vintage treasures',
  searchPlaceholder: 'Search by brand, type, color, or description...',
  shipBannerStrong: 'International shipping available',
  shipBannerText: '— Shipping costs are at the buyer’s expense and vary by destination.',
  shipBannerLink: 'See our rates',
  shipBannerAfter: 'or contact us for a quote!',
  ctaHeading: 'Looking for something specific?',
  ctaText: 'What you see here is only a selection of our collection. If you’re looking for a particular item or want to see everything we have, don’t hesitate to reach out!',
  // curated selection page
  curatedDocTitle: 'Curated Selection | French Vintage Design & Copperware | Cook & Collect',
  curatedMetaDesc: 'A curated selection of French vintage copperware, collectible champagne objects, 20th-century design and exceptional decorative pieces from Cook & Collect by Vintage French.',
  curatedTitle: 'Curated Selection',
  curatedHeroSubtitle: 'French Design, Copperware & Collectible Objects',
  curatedHeroIntro: 'An evolving selection of distinctive French objects chosen for their craftsmanship, design and heritage. From traditional French copperware and historic culinary makers to collectible champagne objects and significant pieces of 20th-century design.',
  curatedCatHeading: 'Areas of focus',
  curatedCat1Title: 'French Copperware',
  curatedCat1Text: 'Professional and domestic French copper cookware, including pieces associated with makers and retailers such as Mauviel and E. Dehillerin.',
  curatedCat1GuideLink: 'Read our collector’s guide to vintage French copper cookware',
  curatedCat2Title: 'Champagne & Wine Objects',
  curatedCat2Text: 'Vintage champagne coolers, ice buckets and related objects from French houses such as Moët & Chandon, Veuve Clicquot and Pommery.',
  curatedCat2GuideLink: 'Read our collector’s guide to vintage French champagne buckets',
  curatedCat3Title: 'French Design & Decorative Objects',
  curatedCat3Text: 'Interesting French tableware, serving objects, decorative pieces and 20th-century design.',
  curatedCat4Title: 'Rare Cast Iron',
  curatedCat4Text: 'Only historically interesting, unusual, designer or particularly collectible French cast-iron pieces.',
  curatedGalleryHeading: 'The selection',
  curatedEmpty: 'New pieces are being prepared for this selection. Please check back soon.',
  curatedPhilosophyHeading: 'Selected by Vintage French',
  curatedPhilosophyText: 'Cook & Collect is operated by Vintage French, a professional French vintage dealer specialising in collectible cookware, design and decorative objects. Each piece is individually sourced, examined and described with particular attention to maker, materials, condition and historical context.',
  // track record — edit these freely once verified figures are available
  curatedTrackHeading: 'Experience',
  curatedTrackText: 'We have extensive experience sourcing and selling vintage French objects to collectors and enthusiasts internationally.',
  curatedTrackStat1Value: '',
  curatedTrackStat1Label: 'Pieces sold',
  curatedTrackStat2Value: '',
  curatedTrackStat2Label: 'Customer rating',
  curatedTrackStat3Value: '',
  curatedTrackStat3Label: 'Countries shipped to',
  curatedEnquiryHeading: 'Collection Enquiries',
  curatedEnquiryText: 'For information about a piece from the Curated Selection, or to enquire about a particular French vintage object, please contact us.',
  curatedEnquiryEmailLabel: 'Email',
  // curated selection object detail labels
  selMaker: 'Maker',
  selDesigner: 'Designer',
  selOrigin: 'Origin',
  selPeriod: 'Period',
  selMaterials: 'Materials',
  selDimensions: 'Dimensions',
  selMarks: 'Marks & signatures',
  selCondition: 'Condition',
  selStatus: 'Status',
  selClose: 'Close',
  selPrev: 'Previous image',
  selNext: 'Next image',
  selNoPhotos: 'No photos available',
  // ── Guide #1: Vintage French Champagne Buckets ──
  // (Editorial collector guide. Conservative wording; no invented dates or makers.)
  guideChampagneDocTitle: 'Vintage French Champagne Buckets: A Collector\u2019s Guide | Cook & Collect',
  guideChampagneMetaDesc: 'A dealer\u2019s guide to vintage French champagne buckets and wine coolers \u2014 materials, maker marks, house branding, dating and condition, with examples from the Cook & Collect collection.',
  guideChampagneOgTitle: 'Vintage French Champagne Buckets: A Collector\u2019s Guide',
  guideChampagneOgDesc: 'How to read the materials, maker marks and branding of vintage French champagne buckets \u2014 an editorial guide from Cook & Collect.',
  guideChampagneBreadcrumbGuides: 'Guides',
  guideChampagneBreadcrumbCurrent: 'Vintage French Champagne Buckets',
  guideChampagneEyebrow: 'Champagne & Barware \u00b7 Collector\u2019s Guide',
  guideChampagneH1: 'Vintage French Champagne Buckets: A Collector\u2019s Guide',
  guideChampagneIntro: 'Few objects capture French table culture as directly as the champagne bucket. Practical by design and often decorative by intention, these coolers accompanied celebrations in restaurants, bars and private homes across the twentieth century. This guide looks at how they were made, how French Champagne houses and tableware makers shaped their appearance, and how a collector can approach identification, dating and condition with care.',

  guideChampagneS1Heading: 'From Champagne Service to Collectible Design',
  guideChampagneS1P1: 'A champagne bucket has one job: to keep a bottle cold at the table. Yet the way that job was met in France reflects far more than function. The form sits at the meeting point of hospitality, industrial design and branding \u2014 a small object asked to look correct on a well-set table while surviving daily use in a busy dining room.',
  guideChampagneS1P2: 'That double life is why vintage examples are collected today. Some were made as refined tableware; others were produced for or on behalf of Champagne houses and carry their names and emblems. Between those poles lies a wide range of materials, shapes and finishes, which is exactly what makes the category rewarding to study rather than simply to buy.',

  guideChampagneS2Heading: 'Champagne Houses and Their Branded Buckets',
  guideChampagneS2P1: 'The best-known vintage buckets are those associated with French Champagne houses. Branded coolers were used in hospitality settings and have become recognisable objects in their own right, carrying house names, emblems and colours. It is worth being precise about what such branding tells us: a house name identifies the brand the object was made for or used by, not necessarily the workshop that produced it.',
  guideChampagneS2P2: 'The <strong>Veuve Clicquot</strong> Ponsardin example in the Cook & Collect collection illustrates how colour and material can serve a brand. Its translucent orange body creates an immediate visual connection with the distinctive yellow-orange palette associated with Veuve Clicquot, set off by large black lettering and the repeated anchor emblem. It is a strongly sculptural object, and a useful reminder that branded barware was not limited to metal.',
  // V.C.P. + anchor subsection (Veuve Clicquot).
  guideChampagneVcpHeading: 'Reading the mark: V.C.P. and the anchor',
  guideChampagneVcpText: 'The initials V.C.P. stand for Veuve Clicquot Ponsardin. Together with the anchor emblem, they belong to the historic visual identity of the Champagne house and can be traced back to the era of Madame Clicquot. For collectors, however, an important distinction must be made. On a Champagne serving object, the <strong>Veuve Clicquot</strong> name and V.C.P. anchor identify the Maison for which the object was produced, but they do not necessarily identify the manufacturer of the bucket itself. Establishing the maker requires a separate manufacturer\u2019s mark, catalogue reference or other documentary evidence.',
  guideChampagneS2P3: 'The <strong>Mo\u00ebt & Chandon</strong> aluminium bucket in the collection makes a related point about markings, and is discussed in detail below.',

  guideChampagneS3Heading: 'French Makers and Tableware Design',
  guideChampagneS3P1: 'French champagne service was never limited to promotional buckets produced for Champagne houses. Tableware manufacturers and orf\u00e8vrerie-inspired makers also produced sophisticated wine and champagne coolers intended for the table rather than for a brand. These pieces are identified by a maker\u2019s mark rather than a house emblem, and they reward attention to proportion, finish and detailing.',
  guideChampagneS3P2: 'The <strong>Jean Couzon</strong> cooler in the collection is a documented example of this tradition. The underside is marked \u201cJean Couzon Orf\u00e8vre\u201d and \u201cINOX \u2013 18/10\u201d, indicating polished 18/10 stainless steel. Its flared upper rim, pedestal base with beaded and ribbed detailing, and two articulated ring handles reflect a considered French table-service design rather than a promotional object. We have not assigned it a specific model or an exact decade, as neither is documented.',

  guideChampagneS4Heading: 'Materials and Construction',
  guideChampagneS4P1: 'Material is one of the first things a collector reads. Vintage French champagne buckets appear in aluminium, stainless steel, acrylic and other synthetic materials, and \u2014 where historically appropriate \u2014 silver plate and other metals. Each behaves differently over time, which affects both appearance and how a piece should be assessed.',
  guideChampagneS4P2: 'Aluminium, as in the <strong>Mo\u00ebt & Chandon</strong> example, is light and takes engraved or ribbed decoration well; it tends to show oxidation and use marks, particularly inside. Stainless steel, such as the 18/10 used by <strong>Jean Couzon</strong>, is more resistant and holds a polished surface, though it still carries light scratches from use. Acrylic and synthetic bodies, like the <strong>Veuve Clicquot</strong> bucket, allow strong colour and bold branding but are more prone to wear around rims and where metal handles meet the body.',
  guideChampagneS4P3: 'Construction details repay close looking: how handles are attached, whether a base is a separate pedestal or formed with the body, and how decorative elements such as ribbing or beading are executed. These details are often more informative than a single mark.',

  guideChampagneS5Heading: 'How to Identify a Vintage French Champagne Bucket',
  guideChampagneS5P1: 'Identification is best approached as a combination of clues rather than a single answer. Useful evidence includes maker marks, house logos, typography, applied labels or plaques, handle construction, base construction, the material itself, manufacturing marks, and \u2014 where available \u2014 period catalogues and advertisements.',
  guideChampagneS5P2: 'Two distinctions are worth stating plainly. First, a Champagne-house logo identifies the branded client or house; it does not by itself identify the manufacturer. Second, a \u201cMade in France\u201d mark confirms the country of origin but does not, on its own, name the maker. Treating these as separate pieces of information keeps an identification honest.',

  guideChampagneS6Heading: 'Dating Vintage Champagne Buckets',
  guideChampagneS6P1: 'A single clue rarely settles a date. Markings, construction methods, the evolution of a house logo, typography, materials and comparison with documented examples each contribute part of the picture, and a material or a logo can suggest only a broad period. Where the evidence is not conclusive, we prefer cautious wording \u2014 for example \u201c20th century\u201d or \u201cmid-20th century\u201d \u2014 or we note that dating is still being researched. For a marketplace listing this may seem overly careful; for a dealer building a considered collection, it is the point.',

  guideChampagneS7Heading: 'Condition, Patina and Restoration',
  guideChampagneS7P1: 'These objects were used. Scratches, oxidation and general wear are to be expected on pieces that spent their working lives in restaurants, bars and homes, and such traces are part of an object\u2019s history rather than simply flaws. The <strong>Mo\u00ebt & Chandon</strong> bucket, for instance, shows visible wear and interior oxidation consistent with genuine use, which we describe openly.',
  guideChampagneS7P2: 'We would caution against aggressive polishing that removes original surface character or erases marks. Sympathetic cleaning is reasonable; stripping a piece back to an artificial shine is not, and it can destroy the very evidence a collector relies on.',

  // Object titles — used as figcaptions beside each object's photographs.
  guideChampagneObj1Title: 'Jean Couzon Orf\u00e8vre \u2013 Stainless Steel 18/10',
  guideChampagneObj2Title: 'Veuve Clicquot Ponsardin \u2013 Orange Champagne Bucket',
  guideChampagneObj3Title: 'Mo\u00ebt & Chandon \u2013 Aluminium, Made in France',

  // Per-object dating blocks, shown alongside that object's photograph.
  // EDIT THESE as research progresses: record what is actually observed on the
  // piece (marks, construction, typography, comparable documented examples) and
  // only narrow the date when the evidence supports it.
  guideChampagneObj1DatingHeading: 'Dating the Jean Couzon cooler',
  guideChampagneObj1DatingText: 'The underside of this cooler provides valuable identification evidence. It is clearly signed \u201cJean Couzon Orf\u00e8vre\u201d and \u201cINOX 18/10\u201d, identifying both the French maker and the stainless-steel specification. Its polished stainless-steel construction, pedestal form and articulated decorative ring handles are consistent with <strong>Jean Couzon</strong> table and barware produced during the later 20th century. However, no period catalogue or manufacturer documentation identifying this exact model has yet been located. For this reason, Cook & Collect conservatively describes the piece as a late-20th-century French <strong>Jean Couzon</strong> champagne cooler, without assigning an unsupported model name or precise production year.',
  guideChampagneObj1NoteLabel: 'Collector\u2019s note',
  guideChampagneObj1NoteText: 'A maker\u2019s mark establishes authorship more securely than age. \u201cJean Couzon Orf\u00e8vre\u201d identifies the maker, while \u201cINOX 18/10\u201d identifies the stainless-steel specification. Neither inscription alone provides a manufacturing date.',
  guideChampagneObj2DatingHeading: 'Dating this Veuve Clicquot champagne bucket',
  guideChampagneObj2DatingText: 'Dating vintage Champagne barware requires caution. Comparable orange <strong>Veuve Clicquot</strong> buckets have been attributed to different periods within the second half of the 20th century, but such market attributions are rarely accompanied by period catalogues or manufacturer documentation. The historic V.C.P. anchor cannot date the bucket by itself. The emblem predates the object by many decades and identifies the Champagne house rather than the manufacturer or production date of the serving object. No manufacturer\u2019s mark or period documentary reference identifying this exact model has yet been established. Cook & Collect therefore describes this example conservatively as 20th-century French <strong>Veuve Clicquot</strong> barware rather than assigning an unsupported precise production date.',
  // Material note for the Veuve Clicquot body (no confirmed polymer mark on our example).
  guideChampagneObj2MaterialNote: 'The body is a translucent moulded synthetic material, often described as acrylic in comparable examples; no material mark confirming the exact polymer has been identified on this piece.',
  // Moët & Chandon: reading the object, the Made-in-France mark, and dating.
  guideChampagneMoetReadingHeading: 'Reading the Mo\u00ebt & Chandon bucket',
  guideChampagneMoetReadingText: 'This aluminium <strong>Mo\u00ebt & Chandon</strong> bucket belongs to a recognisable family of French Champagne-service objects produced during the second half of the 20th century. Its characteristic details include a tapered body, horizontal decorative bands, articulated ring handles and a contrasting black Mo\u00ebt & Chandon plaque with a red central seal. Comparable surviving examples show closely related proportions, construction and decorative treatment. These comparisons are useful for placing the object within the broader tradition of later-20th-century French Champagne barware, but they do not establish the manufacturer or an exact production year.',
  guideChampagneMoetMadeInHeading: 'What \u201cMade in France\u201d tells us',
  guideChampagneMoetMadeInText: 'The base of the Cook & Collect example carries a simple \u201cMADE IN FRANCE\u201d mark. This provides useful evidence of French manufacture, but it should not be interpreted as a manufacturer\u2019s signature. This distinction is particularly important with branded Champagne barware. The Champagne-house identity belongs to <strong>Mo\u00ebt & Chandon</strong>, while the physical object may have been manufactured by a separate specialist producer. Similar Champagne buckets can survive with specific manufacturer marks, but visual similarity alone is not sufficient evidence to transfer one of those attributions to an example carrying only a country-of-origin mark. Cook & Collect therefore records the manufacturer of this example as currently unidentified.',
  guideChampagneMoetNoteLabel: 'Collector\u2019s note',
  guideChampagneMoetNoteText: '\u201cMade in France\u201d establishes country of manufacture, not maker. A specific manufacturer should only be assigned when supported by a physical maker\u2019s mark, period catalogue, advertisement, manufacturer documentation or another reliable documentary source.',
  guideChampagneObj3DatingHeading: 'Dating the Mo\u00ebt & Chandon bucket',
  guideChampagneObj3DatingText: 'The aluminium construction, ring-handle format, graphic Champagne-house plaque and overall design place this bucket within the vocabulary of French Champagne barware of the second half of the 20th century. Comparable surviving examples are frequently associated with the 1970s and 1980s. This provides useful comparative evidence for the probable period of the Cook & Collect example, but in the absence of a period catalogue or manufacturer documentation for this exact model, it should not be treated as a precise date. On the evidence currently available, Cook & Collect describes the object as: France, second half of the 20th century, probably 1970s\u20131980s; manufacturer unidentified.',

  // Methodology subsection (sits within the "How to Identify" section).
  guideChampagneMethodHeading: 'How Cook & Collect dates an object',
  guideChampagneMethodP1: 'A date attached to another surviving example is a starting point, not a conclusion. We compare maker\u2019s marks, materials, construction, typography, house logos and documented examples, then look for period catalogues, advertisements and archival references whenever possible.',
  guideChampagneMethodP2: 'An important part of this process is separating the different kinds of evidence an object can provide. A Champagne-house logo may identify the client or Maison, a manufacturer\u2019s stamp may identify the maker, and a country-of-origin mark may establish where an object was produced. None of these necessarily provides a manufacturing date on its own.',
  guideChampagneMethodP3: 'When the available evidence supports only a period rather than a precise year, we prefer the broader attribution. For collectors, understanding the limits of the available evidence is part of understanding the object.',

  // Research & References (discreet; authoritative sources only).
  guideChampagneRefHeading: 'Research & References',
  guideChampagneRefIntro: 'Our research combines the physical evidence found on each object with official Maison histories, manufacturer information, archival material, period documentation and comparative examples. Comparative objects can help establish recurring forms, dimensions and construction details, but they are not treated as proof of an exact production date.',
  guideChampagneRefVcpLabel: 'Veuve Clicquot',
  guideChampagneRefVcpText: 'Maison history and the legacy of Madame Clicquot Ponsardin, with the historic V.C.P. identity and anchor emblem:',
  guideChampagneRefVcpLink1Text: 'Veuve Clicquot \u2014 Madame Clicquot (official Maison history)',
  guideChampagneRefVcpLink1Url: 'https://www.veuveclicquot.com/en-int/madameclicquot.html',
  guideChampagneRefVcpLink2Text: 'Union des Maisons de Champagne \u2014 Veuve Clicquot',
  guideChampagneRefVcpLink2Url: 'https://maisons-champagne.com/en/house/veuve-clicquot',
  guideChampagneRefMoetLabel: 'Mo\u00ebt & Chandon',
  guideChampagneRefMoetText: 'Maison history of the house founded in 1743:',
  guideChampagneRefMoetLink1Text: 'Mo\u00ebt & Chandon \u2014 the House (official history)',
  guideChampagneRefMoetLink1Url: 'https://www.moet.com/en-int/house-moet-chandon',
  guideChampagneRefCouzonLabel: 'Jean Couzon',
  guideChampagneRefCouzonText: 'For the Jean Couzon cooler, the primary evidence remains the physical \u201cJean Couzon Orf\u00e8vre / INOX 18/10\u201d marking on the object itself. We have not located an institutional or archival source documenting this exact model, and we prefer to rely on the object\u2019s own mark rather than attribute it on the basis of marketplace listings.',

  guideChampagneS9Heading: 'Collecting French Champagne Barware Today',
  guideChampagneS9P1: 'French champagne buckets remain approachable to collect and easy to live with. They suit a considered interior, work as serving objects, and reward the collector who reads materials and marks carefully rather than trusting a name alone. As a category they sit naturally alongside French copperware and other objects of the table.',
  guideChampagneS9CtaText: 'Explore our curated Champagne & Barware selection.',

  // Image alt text
  guideChampagneObj1Alt: 'Vintage Jean Couzon French stainless steel champagne cooler with ring handles',
  guideChampagneObj1MarkAlt: 'Jean Couzon Orf\u00e8vre INOX 18/10 maker\u2019s mark on the underside',
  guideChampagneObj2Alt: 'Vintage orange Veuve Clicquot Ponsardin champagne bucket',
  guideChampagneObj2DetailAlt: 'Detail of the translucent orange body and anchor emblem on the Veuve Clicquot champagne bucket',
  guideChampagneObj3Alt: 'Vintage Mo\u00ebt & Chandon aluminium champagne bucket Made in France',
  guideChampagneObj3MarkAlt: 'Mo\u00ebt & Chandon black plaque and red seal on the aluminium champagne bucket',

  // Listing card (shown on the Collector's Guides index).
  guideChampagneCardEyebrow: 'Champagne & Barware',
  guideChampagneCardTitle: 'Vintage French Champagne Buckets',
  guideChampagneCardSummary: 'A collector\u2019s guide to vintage French Champagne buckets, exploring Veuve Clicquot, Mo\u00ebt & Chandon and Jean Couzon through maker\u2019s marks, materials, construction and dating.',
  guideChampagneCardImageAlt: 'Vintage French Champagne buckets by Veuve Clicquot, Mo\u00ebt & Chandon and Jean Couzon',
  // Contextual cross-link to the copper guide, appended to the closing section.
  guideChampagneS9CopperLink: 'For another perspective on French craftsmanship and identification, explore our <a href="vintage-french-copper-cookware.html">collector\u2019s guide to vintage French copper cookware</a>.',

  // ── Collector's Guides index (landing page) ──
  guidesIndexDocTitle: 'Collector\u2019s Guides to Vintage French Cookware & Design | Cook & Collect',
  guidesIndexMetaDesc: 'Explore Cook & Collect\u2019s collector\u2019s guides to vintage French cookware, barware and design, with research on makers, marks, materials, construction and dating.',
  guidesIndexOgTitle: 'Collector\u2019s Guides to Vintage French Cookware & Design',
  guidesIndexBreadcrumbCurrent: 'Collector\u2019s Guides',
  guidesIndexEyebrow: 'Cook & Collect \u00b7 Research & Collector\u2019s Guides',
  guidesIndexTitle: 'Collector\u2019s Guides',
  guidesIndexIntro: 'Explore the history, makers and details behind collectible French objects. Our guides draw on pieces sourced and examined by Cook & Collect, combining physical evidence, maker\u2019s marks and original labels with documented historical research.',
  guidesIndexCardCta: 'Read the guide',

  // Copper guide listing card (shown on the Collector's Guides index).
  guideCopperCardEyebrow: 'French Copper Cookware',
  guideCopperCardTitle: 'Vintage French Copper Cookware',
  guideCopperCardSummary: 'Explore vintage French copper through pieces by E. Dehillerin, Mauviel and L. Lecellier, with a closer look at maker\u2019s marks, construction, linings, patina and dating.',
  guideCopperCardImageAlt: 'Vintage French copper cookware by E. Dehillerin, Mauviel and L. Lecellier',

  // Label shown in place of a photograph that has not been supplied yet
  // (rendered by <g-figure> in build-guides.js).
  guidePhotoPending: 'Photograph to come',

  // ── Guide #2: Vintage French Copper Cookware (pillar guide) ──
  // Factual discipline: no invented dates, makers, models, materials,
  // provenance or techniques. Historical statements are limited to what the
  // cited sources actually say; everything else is described as physical
  // evidence, attribution or research still in progress.
  guideCopperDocTitle: 'Vintage French Copper Cookware: Makers, Marks & Dating | Cook & Collect',
  guideCopperMetaDesc: 'A collector\u2019s guide to vintage French copper cookware, exploring E. Dehillerin, Mauviel, L. Lecellier, Villedieu, maker\u2019s marks, construction, tin lining and dating.',
  guideCopperOgTitle: 'Vintage French Copper Cookware: A Collector\u2019s Guide',
  guideCopperOgDesc: 'How to read the marks, construction, thickness, lining and wear of vintage French copper cookware \u2014 an editorial guide from Cook & Collect.',
  guideCopperBreadcrumbGuides: 'Guides',
  guideCopperBreadcrumbCurrent: 'Vintage French Copper Cookware',
  guideCopperEyebrow: 'French Copper Cookware \u00b7 Collector\u2019s Guide',
  guideCopperH1: 'Vintage French Copper Cookware: A Collector\u2019s Guide',
  guideCopperIntro: 'French copper was made to be used. A sauté pan, a saucepan or a preserving pan was bought to work in a kitchen, and the way it was built \u2014 the gauge of its copper, the lining inside it, the handle bolted to its side, the rivets holding that handle, the marks stamped into the metal \u2014 was a response to that job. Those same features are what a collector reads today. This guide is built around pieces sourced and examined by Cook & Collect, and it is as explicit about what the evidence does not tell us as about what it does.',

  // ── The French copper tradition ──
  guideCopperS1Heading: 'The French Copper Tradition',
  guideCopperS1P1: 'Copper conducts heat quickly and evenly, and it can be raised, hammered and turned into deep, complex shapes by hand. For French professional kitchens that combination made it the standard material for serious cookware long before stainless steel existed, and the trades that supplied it \u2014 chaudronnerie (coppersmithing and boilermaking), dinanderie (decorative copper and brass work) and \u00e9tamage (tinning) \u2014 were distinct crafts with their own workshops.',
  guideCopperS1P2: 'One town is inseparable from that history: <strong>Villedieu-les-Po\u00eales</strong>, in the Manche department of Normandy. Its name records the trade, and copperworking remains its documented heritage: the town\u2019s municipal museum, the Maison du Patrimoine Sourdin, devotes one of its permanent spaces to the copper craft alongside lacemaking, Norman furniture and contemporary copper and brass production by workshops still active in the area. <strong>Mauviel</strong>, founded there in 1830 according to the company\u2019s own history, is the best known of those workshops, and <strong>L. Lecellier</strong> \u2014 whose \u201cCuivralec\u201d mark appears on a graduated saucepan set in our archive \u2014 also carried the Villedieu name on its products.',
  guideCopperS1P3: 'The other pole of the story is Paris, and specifically the food trade around Les Halles, where professional kitchens were supplied. <strong>E. Dehillerin</strong> grew out of that district and still trades on rue Coquilli\u00e8re. Understanding that French copper reached kitchens through both provincial manufacturing towns and Parisian professional suppliers is the key to reading its marks, because those two roles leave different kinds of evidence on an object.',

  // ── E. Dehillerin and professional French cookware ──
  guideDehillerinS2Heading: 'E. Dehillerin and Professional French Cookware',
  guideDehillerinS2P1: 'According to the firm\u2019s own published history, E. Dehillerin has its origins in the Halles district of Paris, where Eug\u00e8ne de Hillerin acquired a hardware and household goods store and a boilermaker\u2019s workshop during the 1880s, together with a set of complementary businesses that included a tinning workshop and an older shop opened in 1820 \u2014 the date the house now dates its bicentenary from. In 1890 the shop moved to rue Coquilli\u00e8re, where it still stands.',
  guideDehillerinS2P2: 'One detail of that history matters a great deal when reading a Dehillerin mark. The same source records that manufacturing was concentrated in workshops in the 15th arrondissement, where copper and tinned cookware was made for restaurants and where tinsmiths, scourers and scrapers worked until the 1960s. E. Dehillerin was therefore both a supplier of professional kitchen equipment and, historically, a producer in its own workshops. That is precisely why an \u201cE. DEHILLERIN / PARIS\u201d mark should be treated as identifying the house associated with the object rather than as a shortcut to a single workshop or a production year.',

  // Compact specification block for the sauté pan (measured data only).
  guideDehillerinSpecTitle: 'Specifications as measured',
  guideDehillerinSpecDiameterLabel: 'Diameter',
  guideDehillerinSpecDiameterValue: '29 cm',
  guideDehillerinSpecWeightLabel: 'Weight',
  guideDehillerinSpecWeightValue: '4.655 kg',
  guideDehillerinSpecWallLabel: 'Copper wall',
  guideDehillerinSpecWallValue: 'Approximately 3 mm',
  guideDehillerinSpecConstructionLabel: 'Construction',
  guideDehillerinSpecConstructionValue: 'Tinned copper',
  guideDehillerinSpecHandleLabel: 'Handle',
  guideDehillerinSpecHandleValue: 'Massive iron handle',
  guideDehillerinSpecAttachmentLabel: 'Attachment',
  guideDehillerinSpecAttachmentValue: 'Three large rivets',
  guideDehillerinSpecMarkLabel: 'Mark',
  guideDehillerinSpecMarkValue: 'E. DEHILLERIN / PARIS',
  guideDehillerinSpecRivetLabel: 'Rivet stamps',
  guideDehillerinSpecRivetValue: 'Each of the three interior rivet heads bears the stamped number \u201c18\u201d',
  guideDehillerinSpecNote: 'Measured and weighed by Cook & Collect. These are observations, not a date: none of these figures assigns a year of manufacture.',

  guideDehillerinObj1Title: 'E. Dehillerin, Paris \u2014 29 cm tinned copper saut\u00e9 pan, 4.655 kg',
  guideDehillerinObj1MarkCaption: 'E. Dehillerin Paris maker\u2019s mark on a heavy-gauge tinned copper saut\u00e9 pan.',
  guideDehillerinObj1WallCaption: 'Approximately 3 mm copper wall on a 29 cm E. Dehillerin saut\u00e9 pan weighing 4.655 kg.',
  guideDehillerinObj1HandleCaption: 'Massive iron handle on the 29 cm E. Dehillerin saut\u00e9 pan.',
  guideDehillerinObj1RivetsCaption: 'Three large rivets securing the iron handle; each interior rivet head bears the stamped number \u201c18\u201d.',
  guideDehillerinObj1InteriorCaption: 'Tinned interior of the 29 cm E. Dehillerin saut\u00e9 pan.',

  guideDehillerinObj1WallHeading: 'What 29 cm, 4.655 kg and 3 mm actually describe',
  guideDehillerinObj1WallText: 'This is heavy-gauge professional copper. At 29 cm across, with a wall of approximately 3 mm and a weight of 4.655 kg, the pan is built for the thermal stability a working kitchen needs rather than for domestic convenience \u2014 it is genuinely difficult to handle one-handed when full. That tells us about the intended use and the class of cookware. It does not tell us when the pan was made. Heavy-gauge copper was produced over a long period and is still produced today, so thickness and weight describe specification, not age.',
  guideDehillerinObj1MarkHeading: 'Reading the mark and the rivets',
  guideDehillerinObj1MarkText: 'The pan carries an \u201cE. DEHILLERIN / PARIS\u201d mark, which identifies the Parisian house associated with the object. Each of the three interior rivet heads bears the stamped number \u201c18\u201d; its workshop significance has not been established. We record it because it is physical evidence, and we resist the temptation to explain it: a plausible-sounding interpretation of a stamp is not the same as a documented one.',
  guideDehillerinObj1NoteText: 'A maker\u2019s or retailer\u2019s mark can identify a maker or a house; it does not automatically provide a manufacturing date. Thickness, weight, handle type and rivet construction help us understand how an object was built and used, but none of them should be used on its own to assign a date.',
  guideDehillerinObj1DatingHeading: 'Dating this saut\u00e9 pan',
  guideDehillerinObj1DatingText: 'We have not assigned an exact manufacturing date to this pan, and we will not do so on the evidence currently available. What we can say is documented and limited: the object carries an E. DEHILLERIN / PARIS mark; it is tinned heavy-gauge copper of approximately 3 mm; it has an iron handle fixed with three large rivets; and each interior rivet head is stamped \u201c18\u201d. The house itself has traded since the nineteenth century and operated its own tinning and boilermaking workshops into the 1960s, which frames the object without dating it. Narrowing the period would require a period catalogue, an invoice, an advertisement or another documentary record matching this pattern \u2014 and that research is still open.',

  // ── Makers and suppliers: concise introductions that hand off to the three
  // specialist guides. The full case studies live on those pages; nothing here
  // should duplicate them. ──
  guideCopperMakersHeading: 'Makers, Suppliers and Where to Read Further',
  guideCopperMakersP1: 'Three names recur in the French copper we handle, and each one teaches a different lesson about how these objects should be read. Below is a short introduction to each, with a link to the guide where the objects, marks and measurements are examined in full.',
  guideCopperDehillerinIntroHeading: 'E. Dehillerin \u2014 the Parisian professional supplier',
  guideCopperDehillerinIntroText: 'E. Dehillerin grew out of the food trade around Les Halles and still trades on rue Coquilli\u00e8re. It matters to collectors because it occupied both sides of a distinction that is easy to blur: it supplied professional kitchens and, by its own account, also produced in its own boilermaking and tinning workshops. A piece marked \u201cE. DEHILLERIN / PARIS\u201d is therefore firmly associated with the house, without that mark alone settling who formed the metal or when. Our heavy 29 cm tinned copper saut\u00e9 pan, weighing 4.655 kg with a wall of approximately 3 mm, is the object we use to work through that reasoning.',
  guideCopperDehillerinIntroCta: 'Explore our guide to E. Dehillerin copper cookware',
  guideCopperMauvielIntroHeading: 'Mauviel \u2014 the Villedieu manufacturer',
  guideCopperMauvielIntroText: 'Mauviel is the best-documented of the Villedieu-les-Po\u00eales workshops, and a Mauviel mark is about as clear an identification as French copper offers: it names a manufacturer. What it does not name is a date, a gauge or a lining. The Mauviel pieces that have passed through our hands \u2014 including a confiturier that carries both Mauviel and E. Dehillerin references \u2014 are the ones we use to separate maker from supplier, and mark from conclusion.',
  guideCopperMauvielIntroCta: 'Explore our guide to vintage Mauviel copper cookware',
  guideCopperLecellierIntroHeading: 'L. Lecellier and Cuivralec \u2014 when the label outlives the metal',
  guideCopperLecellierIntroText: 'L. Lecellier also worked at Villedieu-les-Po\u00eales and sold under the registered \u201cCuivralec\u201d name. The graduated set of five saucepans in our archive is unusual because several pieces still carry their original paper labels \u2014 and those labels state something the metal cannot, including the words \u201csans \u00e9tamage\u201d, without tinning. It is the clearest example we own of documentary evidence surviving on the object itself.',
  guideCopperLecellierIntroCta: 'Explore our guide to L. Lecellier & Cuivralec',


  // ── Reading a French copper pan ──
  guideCopperS3Heading: 'Reading a French Copper Pan',
  guideCopperS3P1: 'When a copper pan arrives, we work through it in a fixed order, and we write down what we see before we form an opinion about what it means. The sequence matters, because it keeps physical evidence separate from interpretation.',
  guideCopperS3aHeading: 'Marks, dimensions and weight',
  guideCopperS3aText: 'First, the marks: a maker\u2019s or house name, a town, a country-of-origin stamp, size numbers, and any stamped digits on rivets, handles or the base. Each is recorded exactly as it appears, including where it sits on the object. Then the measurements \u2014 diameter, height, wall thickness and weight \u2014 taken and noted rather than estimated, because they are the part of the description that can be checked by anyone later.',
  guideCopperS3bHeading: 'Handle, rivets and construction',
  guideCopperS3bText: 'Next the construction: the material and form of the handle, how it is attached, the number, size and placement of the rivets, whether rivet heads are domed or flattened, and how the body has been raised or formed. Also the base \u2014 whether it is flat or slightly domed, and how it has worn. These details describe a workshop practice and a class of object, and they are most useful when they are read together rather than one at a time.',
  guideCopperS3cHeading: 'Lining and interior surface',
  guideCopperS3cText: 'Then the inside: whether the pan is tinned, and if so whether the tin is original, worn, patchy or has been renewed; whether the interior is a different material altogether; and how the interior surface relates to the rest of the object. Where the lining is not obviously tin, we say so and leave the material unidentified until it is documented rather than guessing.',
  guideCopperS3dHeading: 'Wear, repairs and restoration',
  guideCopperS3dText: 'Finally the history written on the surface: utensil scratches, heat marks, dents, oxidation on iron fittings, polished-out areas, evidence of retinning, and any repair. Wear from professional use is information, not simply damage, and a piece that has clearly been reworked is described as such.',
  guideCopperS3Note: 'None of these observations is a date on its own. They combine into a description of how an object was made and used, which is the basis on which a cautious attribution can later be built.',

  // ── Thickness and weight ──
  guideCopperS4Heading: 'Thickness and Weight: What They Tell Us',
  guideCopperS4P1: 'Copper thickness is the single most useful specification on a French pan, because it is what the object was chosen for. Heavier gauges hold and spread heat more steadily and stay flat under hard use; lighter gauges heat faster, cost less and are easier to lift. The two sets of pieces we refer to throughout illustrate the range plainly: the <a href="e-dehillerin-copper-cookware.html">E. Dehillerin saut\u00e9 pan</a> has a wall of approximately 3 mm and weighs 4.655 kg, while the <a href="lecellier-cuivralec.html">L. Lecellier saucepans</a> are approximately 1.5 mm. Those are different tools for different kitchens.',
  guideCopperS4P2: 'What thickness and weight cannot do is date a pan. Heavy professional gauges and lighter domestic gauges were made alongside each other, and both are still made now. The same applies to weight, which is simply thickness multiplied by size. Where a gauge is useful for dating is as one element among several \u2014 combined with marks, labels, construction and, ideally, a period catalogue or advertisement that shows which gauges a given maker or supplier offered and when.',
  guideCopperS4Note: 'We avoid rules of the form \u201c3 mm means nineteenth century\u201d or \u201ciron handles mean antique\u201d. Such shortcuts are common in the trade and they are not supported by the evidence; they conflate specification and period.',

  // ── Handles, rivets and construction ──
  guideCopperS5Heading: 'Handles, Rivets and Construction',
  guideCopperS5P1: 'Handles on French copper appear in iron, brass, bronze, cast metal and, on later pieces, stainless steel, and their shape follows their purpose: long straight handles for stove work, short ears and side handles on large vessels that need two hands, ring handles for hanging. A heavy iron handle on a heavy pan is a matched pair \u2014 the handle has to carry the weight of a full vessel, and the joint is where a pan fails first.',
  guideCopperS5P2: 'That is why rivets repay attention. Their number, diameter, spacing, and whether their heads are left domed or hammered flush, all reflect how a workshop solved the problem of anchoring a handle to a curved copper wall. The heavy <a href="e-dehillerin-copper-cookware.html">E. Dehillerin saut\u00e9 pan</a> in our archive is a good illustration \u2014 its iron handle is held by three large rivets, each interior head carrying a stamped number \u2014 and we examine that construction in detail in the guide devoted to it.',
  guideCopperS5P3: 'Read together, handle material, handle form, rivet pattern and the way a body has been raised can place an object within a recognisable family of French copper production and can support or undermine a proposed attribution. Read individually, they prove very little \u2014 and in particular an iron handle is not evidence of age, since iron was used across a very long period and for straightforwardly practical reasons.',

  // ── Tin lining, wear and restoration ──
  guideCopperS6Heading: 'Tin Lining, Wear and Restoration',
  guideCopperS6P1: 'Traditional French copper cookware is lined with tin. The interior is coated with a thin layer of tin over the copper, which is why \u00e9tamage was a specialist trade with its own workshops \u2014 large Parisian suppliers ran their own tinning shops, as the <a href="e-dehillerin-copper-cookware.html">E. Dehillerin</a> company history records. Tin is soft and does not last forever, so a working pan was expected to be retinned periodically. Retinning is therefore part of normal French copper practice rather than a modern intervention.',
  guideCopperS6P2: 'On a surviving piece, the lining is one of the more informative surfaces. Original tin usually shows a dulled, slightly mottled grey with utensil marks and thinning where heat and stirring concentrated; copper showing through at the base or on the walls indicates genuine use. A uniformly bright, unmarked interior on an otherwise well-used pan generally indicates professional retinning, which is a legitimate and often desirable treatment \u2014 we simply say when we believe it has happened, and we do not present a relined pan as an untouched original surface.',
  guideCopperS6P3: 'We describe linings, not cooking. Whether a particular vintage piece should be used for food is a decision for its owner, informed by the actual condition of the lining and, where appropriate, by a professional retinner \u2014 and we would rather point someone to a retinning workshop than offer reassurance we are not in a position to give.',

  // ── Mauviel and Villedieu-les-Poêles ──
  guideMauvielS7Heading: 'Mauviel and Villedieu-les-Po\u00eales',
  guideMauvielS7P1: 'Mauviel\u2019s own published history states that Ernest Mauviel established his workshop at Villedieu-les-Po\u00eales, in Normandy, in 1830, and that the house has remained in the same family across seven generations, still manufacturing in the town today. The same company timeline records a move to a larger production unit in 1965, a first bilaminated copper line combining 90% copper with 10% stainless steel in 1989, and multi-ply stainless steel developed for induction in 1995.',
  guideMauvielS7P2: 'For a collector, the value of that timeline is that it is documented and dated by the manufacturer. It provides genuine reference points \u2014 for instance, a copper-and-stainless bilaminated construction belongs to the company\u2019s later product history rather than to its nineteenth-century output \u2014 while saying nothing about any individual unmarked pan. It is historical context, not a dating key.',
  guideMauvielObj2Title: 'Mauviel copper saut\u00e9 pan \u2014 from the Cook & Collect archive',
  guideMauvielObj2MarkCaption: 'Mauviel / Made in France maker\u2019s mark on a copper saut\u00e9 pan previously sourced by Cook & Collect.',
  guideMauvielObj2DetailCaption: 'Handle and rivet detail on the Mauviel saut\u00e9 pan, Cook & Collect archive.',
  guideMauvielObj2Heading: 'A Mauviel mark on an archive saut\u00e9 pan',
  guideMauvielObj2Text: 'This copper saut\u00e9 pan (sauteuse), previously sourced by Cook & Collect, carries a visible \u201cMauviel / Made in France\u201d mark. That is a firm piece of evidence: it identifies the maker, and it places manufacture in France. It is the clearest kind of identification a French copper pan can offer, and it is exactly why we photograph marks close up.',
  guideMauvielObj2NoteText: 'A Mauviel mark identifies the maker. It does not, by itself, establish the date, the copper thickness, the lining or the collection to which a piece belonged. We have not assigned any of those to this pan, and we will only do so if the object is measured and the specification documented.',

  // ── Maker, retailer and attribution ──
  guideMauvielS8Heading: 'Maker, Retailer and Attribution',
  guideMauvielS8P1: 'French copper marks reward careful reading because the names on an object can play different roles. A name may belong to the workshop that raised and finished the piece, to the house that commissioned or supplied it, to a trademark, or to a retailer whose clientele it was made for. These roles overlap in practice \u2014 E. Dehillerin\u2019s own history describes a house that supplied professional kitchens and also ran its own boilermaking and tinning workshops \u2014 so \u201cmaker\u201d and \u201cretailer\u201d cannot be treated as interchangeable labels, nor as mutually exclusive ones.',
  guideMauvielS8P2: 'The practical consequence is a discipline about wording. We record which name appears, where it appears, and how it is applied \u2014 stamped, engraved, printed on a label \u2014 and we describe the relationship between those names only when documentation supports it. Two names on one object are a research question, not a conclusion.',
  guideMauvielObj3Title: 'Confiturier sourced by Cook & Collect \u2014 marks under examination',
  guideMauvielObj3MarkCaption: 'Marks on the confiturier sourced by Cook & Collect, photographed for examination.',
  guideMauvielObj3Heading: 'Case study: a confiturier bearing Mauviel and E. Dehillerin references',
  guideMauvielObj3Text: 'A copper confiturier \u2014 a wide, shallow preserving pan \u2014 sourced by Cook & Collect is reserved for this section because it raises the maker-and-retailer question directly. Its measurements, construction details and the precise form and placement of its markings are being recorded, and its original photography will be added here.',

  // ── L. Lecellier and Cuivralec ──
  guideLecellierS9Heading: 'L. Lecellier and Cuivralec',
  guideLecellierS9P1: 'The second principal group in this guide is a graduated set of five French saucepans \u2014 12, 14, 16, 18 and 20 cm \u2014 with an approximate copper thickness of 1.5 mm. The largest saucepan carries an <strong>L. Lecellier / Cuivralec / Villedieu</strong> maker\u2019s mark; the other pieces carry size markings. Several retain their original paper labels.',
  guideLecellierS9P2: 'The mark ties the set to Villedieu-les-Po\u00eales, the Norman copper town discussed above, and \u201cCuivralec\u201d is presented on the label as a registered trademark (\u201cmarque d\u00e9pos\u00e9e\u201d). Beyond that, we are deliberately brief: we have not yet consulted a documentary source for the firm\u2019s history or production period, and so we do not offer one.',
  guideLecellierObj4SetCaption: 'Graduated 12\u201320 cm L. Lecellier Cuivralec saucepan set.',
  guideLecellierObj4MarkCaption: 'L. Lecellier / Cuivralec / Villedieu maker\u2019s mark on the largest saucepan of the set.',
  guideLecellierObj4LabelCaption: 'Original Cuivralec paper label preserved inside an L. Lecellier saucepan, Villedieu-les-Po\u00eales.',
  guideLecellierObj4DetailCaption: 'Construction detail on the L. Lecellier Cuivralec saucepans \u2014 approximately 1.5 mm copper.',
  guideLecellierObj4LabelHeading: 'Why an original label matters',
  guideLecellierObj4LabelText: 'A surviving paper label can state things the metal cannot. A stamped mark gives a name; a label can give the product range, the trade the pieces were sold for, a trademark claim and, crucially, a statement about how the pieces were finished. Labels are also fragile \u2014 they are washed off, scrubbed away or simply worn out \u2014 so a set that retains several of them preserves evidence that is usually the first thing to disappear.',
  guideLecellierObj4NoteText: 'Because labels are printed rather than stamped, they describe how a product was sold. That is a different kind of evidence from the object\u2019s construction, and both are worth recording separately.',
  guideLecellierObj4SetHeading: 'A graduated set of five saucepans',
  guideLecellierObj4SetText: 'The five sizes run 12, 14, 16, 18 and 20 cm, with a copper thickness of approximately 1.5 mm \u2014 a lighter gauge than the Dehillerin saut\u00e9 pan, and a range of sizes that makes sense as a working progression rather than as a display arrangement. We describe it as a graduated set of five saucepans, not as a complete five-piece set: whether five was the original commercial configuration is a question a period catalogue could settle, and until one does, claiming completeness would overstate what we know.',
  guideLecellierObj4DatingHeading: 'Dating the Cuivralec set',
  guideLecellierObj4DatingText: 'No production date is assigned to these saucepans. The physical evidence is the L. Lecellier / Cuivralec / Villedieu mark, the size markings, the approximately 1.5 mm copper and the surviving labels with their \u201cmarque d\u00e9pos\u00e9e\u201d and \u201csans \u00e9tamage\u201d wording. A trademark registration record would give a documented reference point for the mark, and a period catalogue or advertisement would do the same for the range; neither has been consulted yet. Until then the set is described by its marks and measurements alone.',

  // ── "Sans étamage" ──
  guideLecellierS10Heading: '\u201cSans \u00c9tamage\u201d',
  guideLecellierS10P1: 'The most interesting wording on the Cuivralec labels is the phrase \u201csans \u00e9tamage\u201d. Transcribed in full, the label reads:',
  guideLecellierLabelTitle: 'Original label, transcribed',
  guideLecellierLabelText: 'Cuivres \u00b7 Articles Grande Cuisine \u00b7 Cuivralec \u00b7 Marque D\u00e9pos\u00e9e \u00b7 Sans \u00c9tamage \u00b7 L. Lecellier \u2013 Villedieu',
  guideLecellierLabelNote: 'Transcribed from the original paper labels surviving on the set. The wording is quoted exactly as printed.',
  guideLecellierS10P2: '\u201c\u00c9tamage\u201d is tinning, so \u201csans \u00e9tamage\u201d means literally \u201cwithout tinning\u201d. Read plainly, the label tells us these saucepans were sold without the traditional tin lining, and that this was presented to the buyer as a feature of the product rather than as an omission. For a set of copper \u201carticles grande cuisine\u201d, that is a genuinely informative statement: it means the interior finish was intended to be something other than tin, and that retinning was not part of their expected maintenance.',
  guideLecellierS10Note: 'What the label does not say is what the interior material is. We are not identifying it here. Published claims about untinned French copper linings exist, but we have not verified any of them against a manufacturer document, a period catalogue or laboratory analysis of these pieces, and an unverified material claim on a cooking surface is exactly the kind of statement that should not be guessed.',

  // ── "Made in France" is not a maker ──
  guideCopperS11Heading: '\u201cMade in France\u201d Is Not a Maker',
  guideCopperS11P1: 'A \u201cMade in France\u201d stamp is country-of-origin information. It confirms where an object was manufactured and it is genuinely useful \u2014 it separates French production from the large quantity of copper cookware made elsewhere \u2014 but it names no workshop. On the <a href="mauviel-vintage-copper-cookware.html">Mauviel piece in our archive</a> the two appear together, with the maker\u2019s name and the country-of-origin mark doing different jobs; on a great many surviving French pans, only the country mark is present.',
  guideCopperS11P2: 'Such pieces are perfectly collectable. They are simply unattributed, and they should be described that way: French copper, maker unidentified, with whatever measurements and construction details can be recorded. That is an honest description, and it leaves room for a later attribution if documentary evidence appears.',
  guideCopperS11Note: 'We do not attribute unsigned French copper to Mauviel, L. Lecellier, Gaillard or any other maker on the basis of visual similarity. Shapes, handle patterns and rivet arrangements were shared across the trade and repeated over long periods; resemblance is a reason to research, not a reason to attribute.',

  // ── Condition, patina and restoration ──
  guideCopperS12Heading: 'Condition, Patina and Restoration',
  guideCopperS12P1: 'Copper changes constantly. Exposed to air it darkens, and over decades it develops a patina ranging from warm brown to nearly black, sometimes with green oxidation where moisture has sat. Iron handles rust lightly and darken. Tin dulls and wears through at the points of heaviest contact. A pan that came out of a professional kitchen carries utensil scratches across the base, heat marks and often small dents \u2014 a record of the work it did.',
  guideCopperS12P2: 'All of that can be polished away, and a brightly polished copper pan photographs well. But polishing is abrasive: it removes metal, softens the edges of stamped marks, and can erase shallow markings altogether. Aggressive cleaning of an interior can likewise remove what is left of an original lining. The evidence a collector depends on is thin \u2014 often a few tenths of a millimetre deep \u2014 and it does not come back.',
  guideCopperS12P3: 'Cook & Collect therefore prefers to preserve historically informative surfaces rather than automatically return a piece to a new appearance. We clean sympathetically, we leave marks, labels and original linings alone, and where a piece has been retinned or reworked we say so. A buyer who wants a mirror finish can always create one; a removed mark or a stripped label cannot be restored.',

  // ── Methodology ──
  guideCopperS13Heading: 'How Cook & Collect Researches French Copper',
  guideCopperS13P1: 'Our method runs in one direction: physical evidence first, then measurements, then construction, then marks and labels, then comparison with documented examples, then manufacturer and institutional sources, then period catalogues and advertisements \u2014 and only then a cautious attribution. Working in that order keeps interpretation downstream of observation, which is where it belongs.',
  guideCopperS13P2: 'It also means separating kinds of evidence as we go. What is physically present on the object, what is documented in a published or archival source, what is an attribution we are proposing, and what is comparative evidence from another surviving piece are four different things, and we try to make clear in our descriptions which one we are relying on.',
  guideCopperS13Principle: 'A date attached to another surviving example is a starting point, not a conclusion.',
  guideCopperS13P3: 'Where the evidence supports only a broad period, we give the broad period. Where it supports no period at all, we say that too \u2014 as with the Dehillerin saut\u00e9 pan and the Cuivralec set above. For a listing, that restraint can look like a missed opportunity. For a collection built to be trusted, it is the point.',

  // ── Research & References (only sources actually consulted) ──
  guideCopperRefHeading: 'Research & References',
  guideCopperRefIntro: 'Our research combines the physical evidence recorded on each object with official manufacturer histories, museum and institutional sources, and \u2014 where we can locate them \u2014 period catalogues and advertisements. The sources below are those actually consulted for this guide. Where we have not yet consulted a source, we say so rather than listing a plausible one.',
  guideDehillerinRefDehillerinLabel: 'E. Dehillerin',
  guideDehillerinRefDehillerinText: 'The house\u2019s own published history, used here for the Halles origins, the 1880s acquisitions (including a tinning workshop and the older shop opened in 1820), the 1890 move to rue Coquilli\u00e8re, and the firm\u2019s own boilermaking and tinning workshops operating until the 1960s:',
  guideDehillerinRefDehillerinLink1Text: 'E. Dehillerin \u2014 \u201cFrom the origins\u201d (official house history)',
  guideDehillerinRefDehillerinLink1Url: 'https://www.edehillerin.fr/en/blog/history/from-the-origins',
  guideMauvielRefMauvielLabel: 'Mauviel',
  guideMauvielRefMauvielText: 'The company\u2019s own history and dated timeline, used here for the 1830 foundation by Ernest Mauviel at Villedieu-les-Po\u00eales, the family continuity across seven generations, continued manufacture in Normandy, the 1965 production unit, the 1989 bilaminated copper line (90% copper / 10% stainless steel) and the 1995 multi-ply stainless steel:',
  guideMauvielRefMauvielLink1Text: 'Mauviel1830 \u2014 \u201cLa maison Mauviel1830\u201d (official company history)',
  guideMauvielRefMauvielLink1Url: 'https://www.mauviel-1830.com/fr/content/18-la-maison-mauviel1830',
  guideCopperRefVilledieuLabel: 'Villedieu-les-Po\u00eales',
  guideCopperRefVilledieuText: 'For the town\u2019s copper heritage we rely on its municipal museum, the Maison du Patrimoine Sourdin, whose permanent displays cover the copper craft alongside lacemaking, Norman furniture and contemporary copper and brass work from local workshops. Listed in the R\u00e9seau des mus\u00e9es de Normandie:',
  guideCopperRefVilledieuLink1Text: 'R\u00e9seau des mus\u00e9es de Normandie \u2014 Maison du Patrimoine Sourdin, Villedieu-les-Po\u00eales',
  guideCopperRefVilledieuLink1Url: 'https://www.musees-normandie.fr/musees-normandie/maison-du-patrimoine-sourdin/',
  guideCopperRefVilledieuLink2Text: 'Maison du Patrimoine Sourdin \u2014 museum website',
  guideCopperRefVilledieuLink2Url: 'https://mps.villedieu-les-poeles.fr/',
  // Maker-specific sources are cited on the guide whose claims they support.
  guideCopperRefMakersLabel: 'Maker-specific sources',
  guideCopperRefMakersText: 'References for individual makers and suppliers are listed on the guide whose claims they support, so that each statement sits beside its source: <a href="e-dehillerin-copper-cookware.html">E. Dehillerin</a>, <a href="mauviel-vintage-copper-cookware.html">Mauviel</a> and <a href="lecellier-cuivralec.html">L. Lecellier / Cuivralec</a>. Where research is still open \u2014 as it is for Cuivralec and for the confiturier \u2014 those guides say so rather than offering a source we have not consulted.',
  guideLecellierRefLecellierLabel: 'L. Lecellier / Cuivralec',
  guideLecellierRefLecellierText: 'Research in progress. Our evidence at this stage is entirely physical: the L. Lecellier / Cuivralec / Villedieu mark on the largest saucepan, the size markings on the others, and the surviving original labels with their \u201cmarque d\u00e9pos\u00e9e\u201d and \u201csans \u00e9tamage\u201d wording. We have not consulted a manufacturer, archival or museum source for the firm\u2019s history or production period, and we have not verified the trademark registration; the INPI historical trademark archives are the avenue we intend to pursue. We deliberately list no source here rather than cite marketplace listings.',
  guideMauvielRefConfiturierLabel: 'The confiturier',
  guideMauvielRefConfiturierText: 'Research in progress. Its markings, measurements and construction are still being recorded, and no documentary source has been consulted for it. No relationship between the names it carries is asserted in this guide.',

  // ── Closing ──
  guideCopperS14Heading: 'Collecting Vintage French Copper Today',
  guideCopperS14P1: 'French copper remains one of the most rewarding fields a collector can enter, partly because so much of it survives and partly because it can still be used. Heavy professional pieces and lighter domestic sets sit at opposite ends of the same tradition, and both can be read \u2014 marks, gauge, handles, rivets, lining and wear all tell part of the story. The discipline that makes the difference is being willing to leave the parts of the story that are not yet documented unwritten.',
  guideCopperS14P2: 'This guide is the starting point for our French copper research. The makers and suppliers introduced above each have their own guide, where the objects, marks and measurements are examined in full, and those pages will grow as the research does.',
  guideCopperS14ChampagneLinkText: 'Read our collector\u2019s guide to vintage French Champagne buckets',
  guideCopperS14AboutLinkText: 'Learn how Cook & Collect sources and documents its pieces',
  guideCopperS14CtaText: 'Explore our curated French copperware selection.',

  // ══════════════════════════════════════════════════════════════════════
  // Guide #3: E. Dehillerin Copper Cookware (specialist guide)
  // Prefix: guideDehillerin… — keys marked "(moved)" came verbatim from the
  // copper pillar guide when the topic was split; see the guide registry in
  // build-guides.js. Factual discipline as on the pillar page.
  // ══════════════════════════════════════════════════════════════════════
  guideDehillerinDocTitle: 'E. Dehillerin Copper Cookware: Marks, Construction & Dating | Cook & Collect',
  guideDehillerinMetaDesc: 'How to read E. Dehillerin copper cookware \u2014 the E. DEHILLERIN / PARIS mark, heavy-gauge tinned copper, iron handles, rivets and the limits of dating, through a 29 cm saut\u00e9 pan examined by Cook & Collect.',
  guideDehillerinOgTitle: 'E. Dehillerin Copper Cookware: Marks, Construction & Dating',
  guideDehillerinOgDesc: 'A collector\u2019s guide to E. Dehillerin copper cookware, built around a heavy 29 cm tinned copper saut\u00e9 pan from the Cook & Collect archive.',
  guideDehillerinBreadcrumbGuides: 'Guides',
  guideDehillerinBreadcrumbCurrent: 'E. Dehillerin Copper Cookware',
  guideDehillerinEyebrow: 'E. Dehillerin \u00b7 Collector\u2019s Guide',
  guideDehillerinH1: 'E. Dehillerin Copper Cookware: Marks, Construction & Dating',
  guideDehillerinIntro: 'An \u201cE. DEHILLERIN / PARIS\u201d mark is one of the most recognisable things a collector can find on French copper, and one of the most frequently over-interpreted. This guide sets out what the mark establishes, what it does not, and how the rest of a piece \u2014 gauge, weight, handle, rivets and lining \u2014 should be read alongside it. It is built around a heavy tinned copper saut\u00e9 pan measured and weighed by Cook & Collect, and it forms part of our wider guide to <a href="vintage-french-copper-cookware.html">vintage French copper cookware</a>.',
  guideDehillerinNoteLabel: 'Collector\u2019s note',
  guideDehillerinResearchLabel: 'Research in progress',

  // Retailer / maker caution — specific to reading the Dehillerin name.
  guideDehillerinRetailerHeading: 'Retailed by, or made by?',
  guideDehillerinRetailerP1: 'Because the house both supplied and produced, the safest description of a marked piece is that it was retailed by E. Dehillerin. That wording is accurate in every case: the object reached a kitchen through the house. Saying it was manufactured by E. Dehillerin is a stronger claim, and it needs support \u2014 a documented workshop attribution, a period catalogue entry, an invoice \u2014 rather than the mark alone.',
  guideDehillerinRetailerP2: 'This distinction is not pedantry. Professional suppliers in Paris sold cookware from a range of workshops, and a supplier\u2019s name applied to an object tells us who stood behind it commercially. Our own archive contains an object that makes the point physically: a confiturier carrying both Mauviel and E. Dehillerin references, which we examine in the <a href="mauviel-vintage-copper-cookware.html">guide to vintage Mauviel copper cookware</a>.',
  guideDehillerinRetailerNote: 'We describe pieces bearing this mark as \u201cretailed by E. Dehillerin\u201d unless documentation supports a manufacturing attribution. Where a piece was demonstrably made in the firm\u2019s own workshops, we say so and cite the evidence.',

  // Object section headings for the saut\u00e9 pan case study.
  guideDehillerinObjectHeading: 'Case study: a 29 cm tinned copper saut\u00e9 pan',
  guideDehillerinObjectP1: 'This pan is the heaviest single piece of copper we have handled, and it is a useful teacher precisely because everything about it is measurable. The figures below were taken by us; nothing in them is inferred.',
  guideDehillerinConditionHeading: 'Condition, lining and restoration on professional copper',
  guideDehillerinConditionP1: 'Pieces of this class were bought to work, and their surfaces record that work: utensil scratches across the base, heat colour on the walls, light oxidation on the iron handle, and tin that has thinned or worn through where contact was heaviest. Tin was always a consumable \u2014 the company\u2019s own history records tinning workshops operating within the firm until the 1960s \u2014 so periodic retinning belongs to the normal life of such a pan rather than to its restoration.',
  guideDehillerinConditionP2: 'We describe what is present and resist improving it. Aggressive polishing rounds the edges of a stamped mark and can erase shallow rivet stamps altogether, which on a piece like this would remove the most informative evidence it carries. Where a lining has clearly been renewed, we say so rather than presenting a bright interior as an original surface.',
  guideDehillerinDatingLimitsHeading: 'What can and cannot date a Dehillerin piece',
  guideDehillerinDatingLimitsP1: 'The house has traded since the nineteenth century, moved to rue Coquilli\u00e8re in 1890 and ran its own workshops into the 1960s. That frames a long period, and almost every physical feature of a heavy professional pan \u2014 thick copper, an iron handle, large rivets, a tinned interior \u2014 was produced across most of it. None of those features narrows the period on its own, and combining several of them does not make the reasoning stronger if each is individually uninformative.',
  guideDehillerinDatingLimitsP2: 'What would narrow it is documentary: a dated catalogue showing the pattern and gauge, an advertisement, an invoice, an institutional record, or a piece with a documented commission. Until such a source is located for a given object, we describe the object by its marks and measurements and leave the date open.',
  guideDehillerinDatingStatus: 'Date of manufacture: not established for this pan. It is described by its mark and its measurements until a documentary source is located.',
  guideDehillerinBackHeading: 'Where this fits in our French copper research',
  guideDehillerinBackP1: 'Reading the Dehillerin mark is one part of a wider method \u2014 marks, dimensions, weight, gauge, handles, rivets, lining, base, wear and restoration, examined in that order and kept separate from interpretation. That method, and the general history of French copper, are set out in our pillar guide.',
  guideDehillerinBackCta: 'Read the main guide to vintage French copper cookware',
  guideDehillerinCtaText: 'Explore our curated French copperware selection.',
  // Listing card (Collector's Guides index).
  guideDehillerinCardEyebrow: 'E. Dehillerin',
  guideDehillerinCardTitle: 'E. Dehillerin Copper Cookware',
  guideDehillerinCardSummary: 'Reading the E. DEHILLERIN / PARIS mark, heavy-gauge tinned copper, iron handles and rivets \u2014 and why the mark does not date the pan \u2014 through a 29 cm saut\u00e9 pan from our archive.',
  guideDehillerinCardImageAlt: 'Heavy-gauge E. Dehillerin tinned copper saut\u00e9 pan from the Cook & Collect archive',
  guideDehillerinRefIntro: 'The sources below are those actually consulted for this guide. Physical evidence recorded on the object comes first; documentary sources are cited where they exist, and gaps are stated rather than filled.',
  guideDehillerinRefHeading: 'Research & References',

  // ══════════════════════════════════════════════════════════════════════
  // Guide #4: Mauviel Vintage Copper Cookware (specialist guide)
  // Prefix: guideMauviel… — primary location for the Mauviel / E. Dehillerin
  // confiturier case study. The Dehillerin guide only mentions it and links.
  // ══════════════════════════════════════════════════════════════════════
  guideMauvielDocTitle: 'Mauviel Vintage Copper Cookware: Marks, Construction & Identification | Cook & Collect',
  guideMauvielMetaDesc: 'Identifying vintage Mauviel copper cookware \u2014 Mauviel and Made in France marks, Villedieu-les-Po\u00eales history, construction, and the manufacturer-versus-retailer question, through pieces from the Cook & Collect archive.',
  guideMauvielOgTitle: 'Mauviel Vintage Copper Cookware: Marks, Construction & Identification',
  guideMauvielOgDesc: 'A collector\u2019s guide to vintage Mauviel copper, from Villedieu-les-Po\u00eales history to reading marks \u2014 including a confiturier carrying both Mauviel and E. Dehillerin references.',
  guideMauvielBreadcrumbGuides: 'Guides',
  guideMauvielBreadcrumbCurrent: 'Mauviel Vintage Copper Cookware',
  guideMauvielEyebrow: 'Mauviel \u00b7 Collector\u2019s Guide',
  guideMauvielH1: 'Mauviel Vintage Copper Cookware: Marks, Construction & Identification',
  guideMauvielIntro: 'Mauviel is the most thoroughly documented of the Villedieu-les-Po\u00eales copper workshops, which makes a Mauviel mark unusually informative \u2014 and makes it unusually tempting to read more into it than it says. This guide works through what the mark establishes, what the company\u2019s own documented history does and does not allow us to infer, and how a second name on the same object changes the question. It draws on pieces previously sourced and examined by Cook & Collect, and forms part of our wider guide to <a href="vintage-french-copper-cookware.html">vintage French copper cookware</a>.',
  guideMauvielNoteLabel: 'Collector\u2019s note',
  guideMauvielResearchLabel: 'Research in progress',
  guideMauvielArchiveNote: 'The objects in this guide have passed through our hands and are recorded here as research, not as stock. They are no longer available.',

  // Reading a Mauviel mark.
  guideMauvielMarkHeading: 'Reading a Mauviel mark',
  guideMauvielMarkP1: 'A Mauviel mark names the manufacturer. That is more than most French copper offers, and it is worth being precise about how much further it takes us: not to a date, not to a gauge, not to a lining specification, and not to a product line. Those are separate questions answered by measurement and documentation, not by the presence of a name.',
  guideMauvielMarkP2: 'We photograph marks closely and transcribe them exactly as they appear, including their position on the object and whether they are stamped, engraved or printed. Where a mark sits alongside a country-of-origin stamp, we record the two as separate pieces of information.',
  // Made in France on Mauviel pieces.
  guideMauvielMifHeading: '\u201cMade in France\u201d on a Mauviel piece',
  guideMauvielMifP1: 'On the archive piece, a \u201cMade in France\u201d stamp appears together with the maker\u2019s name. The two do different work: one identifies who made the object, the other where it was made. Neither is a date. Country-of-origin marking practice changed over time and across export markets, and that is an area where we would want documentary evidence before drawing any chronological conclusion \u2014 so we draw none.',
  guideMauvielMifNote: 'A country-of-origin mark is not a dating mark. We have not established a Mauviel marking chronology, and we do not use the presence or wording of \u201cMade in France\u201d to place a piece in a period.',
  // Construction.
  guideMauvielConstructionHeading: 'Construction: what we can say, and what we measure',
  guideMauvielConstructionP1: 'Mauviel copper has been made in a wide range of gauges, forms and linings, and the company\u2019s own timeline shows the material vocabulary changing over time \u2014 bilaminated copper and stainless steel from 1989, multi-ply stainless for induction from 1995. That documented sequence is useful in one direction only: a construction the company introduced at a given date cannot belong to an earlier period. It does not work in reverse, and it says nothing about where within a long period an ordinary tinned copper piece belongs.',
  guideMauvielConstructionP2: 'For the pieces in our archive we therefore record what we can measure \u2014 form, dimensions, handle material and fixing, rivet arrangement, the state of the interior \u2014 and we do not state a copper thickness, a lining specification or a product line unless the object has been measured or a document supports it.',
  // Dating.
  guideMauvielDatingHeading: 'Dating vintage Mauviel copper',
  guideMauvielDatingP1: 'There is no shortcut. The company\u2019s documented history gives firm anchors for certain constructions and for the manufacture continuing at Villedieu-les-Po\u00eales, but a simplified \u201cmark chronology\u201d of the kind often circulated for collectable cookware would require primary evidence we have not seen: dated catalogues, dated advertisements, or archival records tying specific mark forms to specific years.',
  guideMauvielDatingP2: 'Our practice is to describe a Mauviel piece by its maker, its physical evidence and, where the evidence supports it, a broad period \u2014 and otherwise to record the date as not established. A date attached to another surviving example is a starting point, not a conclusion.',
  // Confiturier case study (primary location).
  guideMauvielConfituHeading: 'Case study: a confiturier carrying Mauviel and E. Dehillerin references',
  guideMauvielConfituP1: 'A confiturier \u2014 the wide, shallow preserving pan used for jam \u2014 sourced by Cook & Collect carries references to both Mauviel and E. Dehillerin. Two names on one object is the most interesting situation in French copper, and also the one most often resolved too quickly.',
  guideMauvielConfituP2: 'The possibilities are not equivalent, and the object alone does not choose between them: a piece made by one house and sold by the other; a piece made for a supplier\u2019s own range; a later addition of a retailer\u2019s mark; or an arrangement we have no record of. Establishing which applies needs documentation \u2014 a catalogue, an invoice, a trade record \u2014 and we have not located one.',
  guideMauvielConfituResearchText: 'No conclusion has been drawn about this object. We are not asserting a manufacturing, supply, licensing or exclusivity arrangement between the two houses, and we are not treating the two marks as establishing a production date or a provenance. Its markings, measurements and construction are still being recorded, and this section will be revised only when documentation supports a statement. It is deliberately empty of history rather than filled with a plausible account.',
  guideMauvielConfituP3: 'For how the Dehillerin name itself should be read \u2014 supplier, producer, or both \u2014 see <a href="e-dehillerin-copper-cookware.html">our guide to E. Dehillerin copper cookware</a>.',
  // Back-link section.
  guideMauvielBackHeading: 'Where this fits in our French copper research',
  guideMauvielBackP1: 'Marks are only one layer of evidence. Gauge, weight, handles, rivets, lining, wear and restoration all contribute, and the order in which they are read is what keeps an identification honest. That method, together with the history of the French copper trade and of Villedieu-les-Po\u00eales, is set out in our pillar guide.',
  guideMauvielBackCta: 'Read the main guide to vintage French copper cookware',
  guideMauvielCtaText: 'Explore our curated French copperware selection.',
  // Listing card.
  guideMauvielCardEyebrow: 'Mauviel',
  guideMauvielCardTitle: 'Mauviel Vintage Copper Cookware',
  guideMauvielCardSummary: 'Villedieu-les-Po\u00eales history, reading Mauviel and Made in France marks, construction and dating limits \u2014 including a confiturier that carries E. Dehillerin references as well.',
  guideMauvielCardImageAlt: 'Vintage Mauviel copper cookware from the Cook & Collect archive',
  guideMauvielRefIntro: 'The sources below are those actually consulted for this guide. The company\u2019s own published history is used for documented dates and is described as such; where the evidence stops, the guide stops.',
  guideMauvielRefHeading: 'Research & References',

  // ══════════════════════════════════════════════════════════════════════
  // Guide #5: L. Lecellier & Cuivralec (specialist guide)
  // Prefix: guideLecellier… — the original paper labels are the key evidence.
  // No production period is established; do not add dates without a source.
  // ══════════════════════════════════════════════════════════════════════
  guideLecellierDocTitle: 'L. Lecellier & Cuivralec: A Collector\u2019s Guide | Cook & Collect',
  guideLecellierMetaDesc: 'L. Lecellier copper and the Cuivralec mark from Villedieu-les-Po\u00eales \u2014 maker\u2019s marks, surviving original labels, \u201csans \u00e9tamage\u201d, construction and dating limits, through a graduated set of five saucepans.',
  guideLecellierOgTitle: 'L. Lecellier & Cuivralec: A Collector\u2019s Guide',
  guideLecellierOgDesc: 'Reading L. Lecellier copper and the Cuivralec label \u2014 including the words \u201csans \u00e9tamage\u201d \u2014 through a graduated set of five saucepans examined by Cook & Collect.',
  guideLecellierBreadcrumbGuides: 'Guides',
  guideLecellierBreadcrumbCurrent: 'L. Lecellier & Cuivralec',
  guideLecellierEyebrow: 'L. Lecellier & Cuivralec \u00b7 Collector\u2019s Guide',
  guideLecellierH1: 'L. Lecellier & Cuivralec: A Collector\u2019s Guide',
  guideLecellierIntro: 'Most vintage French copper reaches a collector stripped of its paperwork, which is why the graduated set of five saucepans in our archive is worth a guide of its own: several pieces still carry their original Cuivralec labels, and those labels state things the metal cannot. This guide sets out the physical evidence on the set, reads the label in full, and is explicit that no production period has yet been established. It forms part of our wider guide to <a href="vintage-french-copper-cookware.html">vintage French copper cookware</a>.',
  guideLecellierNoteLabel: 'Collector\u2019s note',
  guideLecellierResearchLabel: 'Research in progress',
  // Marks on the set.
  guideLecellierMarksHeading: 'Which pieces are marked',
  guideLecellierMarksP1: 'Only the largest saucepan, the 20 cm, carries the <strong>L. Lecellier / Cuivralec / Villedieu</strong> maker\u2019s mark. The remaining four carry size markings rather than a maker\u2019s name. That pattern is worth stating precisely, because a set is easily described as \u201call marked\u201d once one piece is: the four smaller saucepans are attributed to the same range by the marked piece, the surviving labels and their shared construction \u2014 which is an attribution, not a mark.',
  guideLecellierMarksNote: 'One piece of the five is maker-stamped. The others are attributed on the basis of the marked saucepan, the original labels and matching construction, and we describe them that way rather than implying five maker\u2019s marks.',
  // Physical evidence vs attribution.
  guideLecellierEvidenceHeading: 'Physical evidence and historical attribution',
  guideLecellierDatingStatus: 'Production period: not established. We have not consulted a period catalogue, an advertisement or a trademark registration for Cuivralec, and we do not offer a date in their absence.',
  guideLecellierEvidenceP1: 'It is worth separating the two plainly. The physical evidence here is strong and checkable: the mark on the 20 cm saucepan, the size markings on the others, an approximate copper thickness of 1.5 mm, the construction, and the surviving printed labels. The historical attribution \u2014 who L. Lecellier was, when the Cuivralec range was made and sold, how it was positioned in the trade \u2014 rests on documentation we have not yet consulted.',
  guideLecellierEvidenceP2: 'Both belong in a description, clearly labelled. A set can be precisely documented as an object and still be undated as a product, and saying so is more useful to a collector than a confident period that no source supports.',
  // Back-link section.
  guideLecellierBackHeading: 'Where this fits in our French copper research',
  guideLecellierBackP1: 'Gauge, handles, rivets, linings and wear are read the same way on a Villedieu saucepan as on a Parisian saut\u00e9 pan, and the broader history of the French copper trade \u2014 including Villedieu-les-Po\u00eales itself \u2014 is set out in our pillar guide.',
  guideLecellierBackCta: 'Read the main guide to vintage French copper cookware',
  guideLecellierCtaText: 'Explore our curated French copperware selection.',
  // Listing card.
  guideLecellierCardEyebrow: 'L. Lecellier & Cuivralec',
  guideLecellierCardTitle: 'L. Lecellier & Cuivralec',
  guideLecellierCardSummary: 'The Cuivralec mark from Villedieu-les-Po\u00eales, surviving original paper labels, the words \u201csans \u00e9tamage\u201d and honest dating limits \u2014 through a graduated set of five saucepans.',
  guideLecellierCardImageAlt: 'Graduated set of five L. Lecellier Cuivralec copper saucepans from Villedieu-les-Po\u00eales',
  guideLecellierRefIntro: 'The evidence for this guide is primarily the object itself: its mark, its size markings and its surviving original labels. Documentary research is still open, and the entry below says so rather than citing a source we have not consulted.',
  guideLecellierRefHeading: 'Research & References',

  // about page
  aboutDocTitle: 'About us — Cook & Collect',
  aboutMetaDesc: 'Cook & Collect — vintage French pieces with a story to tell.',
  aboutTitle: 'About us',
  aboutP1: 'Cook & Collect was born from a passion for vintage French cookware and timeless objects that combine craftsmanship, design and history.',
  aboutP2: 'We carefully select distinctive vintage pieces, with a particular interest in iconic French brands such as Le Creuset, Cousances, Staub, Fontignac and other makers that have shaped France’s culinary heritage.',
  aboutP3: 'Each piece is individually selected and presented with detailed photographs and an honest description of its condition. As vintage objects, our items may show signs of their history and previous use — part of what makes each one unique.',
  aboutP4: 'Our aim is simple: to give beautiful vintage objects a new life and help collectors and enthusiasts discover pieces worth preserving. Giving vintage pieces a new life also means preserving their history while embracing a more responsible approach to consumption.',
  aboutTagline: 'Cook & Collect — pieces with a story to tell.',
  // shipping page
  shippingDocTitle: 'Shipping Information — Cook & Collect',
  shippingMetaDesc: 'Approximate shipping costs for our vintage collection',
  shippingTitle: 'Shipping Information',
  shippingSubtitle: 'We ship worldwide! Here are approximate costs for a 7kg parcel (typical for a cocotte)',
  shippingSubtitleHidden: 'We ship worldwide!',
  shipContactMessage: 'Shipping costs depend on the destination and the item, and are at the buyer’s expense. Please contact us with your delivery address and the item(s) you’re interested in, and we’ll send you an exact shipping quote.',
  shipEuropeTitle: 'Europe',
  shipEurope1Label: 'France, Netherlands, Belgium',
  shipEurope2Label: 'Rest of EU',
  shipEurope3Label: 'Rest of Europe',
  shipUSTitle: 'United States',
  shipUS1Label: 'Standard (2-3 weeks)',
  shipUS1Price: 'from 65€',
  shipUS2Label: 'Express (1-2 weeks)',
  shipUS2Price: 'from 80€',
  shipAUTitle: 'Australia',
  shipAU1Label: 'Standard (3-4 weeks)',
  shipAU1Price: 'from 75€',
  shipAU2Label: 'Express (1-2 weeks)',
  shipAU2Price: 'from 95€',
  shipNoteTitle: 'Note:',
  shipNote1: 'These prices are approximate estimates for a typical 7kg parcel.',
  shipNote2: 'Actual costs may be lower for lighter items or delivery to a pickup point.',
  shipNote3: 'Multiple shipping options will be presented to you, and you also have the possibility to provide your own shipping label.',
  shipNote4: 'For an exact shipping quote, please contact us with your delivery address.',
  shipCtaHeading: 'Need an exact quote?',
  shipCtaText: 'Contact us with your delivery address and the item(s) you’re interested in, and we’ll provide you with an accurate shipping cost.',
  // item page (static shell; dynamic content is in app.js)
  itemDocTitle: 'Item — Cook & Collect',
  lightboxClose: 'Close',
  lightboxPrev: 'Previous image',
  lightboxNext: 'Next image',
  lightboxAlt: 'Full size view',
  // sold page (hidden / reactivation)
  soldDocTitle: 'Sold Items — Cook & Collect',
  soldMetaDesc: 'Previously sold items from our vintage collection',
  soldTitle: 'Sold Items',
  soldSubtitle: 'A look back at treasures that found a new home',
  navSold: 'Sold',
  // legal page
  legalDocTitle: 'Legal notice — Cook & Collect',
  legalMetaDesc: 'Legal notice — Cook & Collect',
  legalTitle: 'Legal notice',
  legalSubtitle: 'Legal information about the site publisher',
  legalOwnerHeading: 'Owner',
  legalIndividual: 'Individual entrepreneur',
  legalTradeNameLabel: 'Trade name',
  legalSirenLabel: 'SIREN',
  legalRcsLabel: 'RCS Paris',
  legalAddressLabel: 'Address',
  legalEmailLabel: 'Email',
  legalPhoneLabel: 'Phone',
  legalHostHeading: 'Site host',
  legalHostAddress: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA',
  legalHostPhoneLabel: 'Phone'
};

const fr = {
  ...legal,
  // nav / shared
  navCollection: 'Collection',
  navShipping: 'Livraison',
  navAbout: 'À propos',
  legal: 'Mentions légales',
  loading: 'Chargement…',
  ariaWhatsApp: 'Contactez-nous sur WhatsApp',
  ariaMessenger: 'Contactez-nous sur Messenger',
  ariaLanguage: 'Langue',
  // home
  homeDocTitle: 'Cook & Collect',
  homeMetaDesc: 'Découvrez notre collection d’objets vintage',
  homeTitle: 'Articles disponibles',
  homeSubtitle: 'Découvrez notre collection d’objets vintage soigneusement sélectionnés',
  searchPlaceholder: 'Rechercher par marque, type, couleur ou description…',
  shipBannerStrong: 'Livraison internationale disponible',
  shipBannerText: '— Les frais de livraison sont à la charge de l’acheteur et varient selon la destination.',
  shipBannerLink: 'Voir nos tarifs',
  shipBannerAfter: 'ou contactez-nous pour un devis !',
  ctaHeading: 'Vous cherchez quelque chose de précis ?',
  ctaText: 'Ce que vous voyez ici n’est qu’une sélection de notre collection. Si vous recherchez un article particulier ou souhaitez tout voir, n’hésitez pas à nous contacter !',
  // curated selection page
  curatedDocTitle: 'Sélection organisée | Design vintage français & cuivre | Cook & Collect',
  curatedMetaDesc: 'Une sélection d’objets vintage français : cuivres, objets de champagne de collection, design du XXᵉ siècle et pièces décoratives d’exception, par Cook & Collect / Vintage French.',
  curatedTitle: 'Sélection organisée',
  curatedHeroSubtitle: 'Design français, cuivres & objets de collection',
  curatedHeroIntro: 'Une sélection évolutive d’objets français distinctifs, choisis pour leur savoir-faire, leur design et leur histoire. Des cuivres français traditionnels et des grandes maisons culinaires aux objets de champagne de collection et aux pièces marquantes du design du XXᵉ siècle.',
  curatedCatHeading: 'Domaines de prédilection',
  curatedCat1Title: 'Cuivres français',
  curatedCat1Text: 'Cuivres de cuisine français professionnels et domestiques, dont des pièces associées à des fabricants et maisons tels que Mauviel et E. Dehillerin.',
  curatedCat1GuideLink: 'Lire notre guide du collectionneur sur les cuivres de cuisine français vintage',
  curatedCat2Title: 'Objets de champagne & de vin',
  curatedCat2Text: 'Seaux à champagne, seaux à glace et objets vintage des maisons françaises telles que Moët & Chandon, Veuve Clicquot et Pommery.',
  curatedCat2GuideLink: 'Lire notre guide du collectionneur sur les seaux à champagne vintage français',
  curatedCat3Title: 'Design & objets décoratifs français',
  curatedCat3Text: 'Arts de la table français, objets de service, pièces décoratives et design du XXᵉ siècle.',
  curatedCat4Title: 'Fonte rare',
  curatedCat4Text: 'Uniquement des pièces de fonte françaises historiquement intéressantes, inhabituelles, signées ou particulièrement recherchées.',
  curatedGalleryHeading: 'La sélection',
  curatedEmpty: 'De nouvelles pièces sont en préparation pour cette sélection. Revenez bientôt.',
  curatedPhilosophyHeading: 'Sélectionné par Vintage French',
  curatedPhilosophyText: 'Cook & Collect est géré par Vintage French, un professionnel français du vintage spécialisé dans les ustensiles de collection, le design et les objets décoratifs. Chaque pièce est sourcée, examinée et décrite individuellement, avec une attention particulière portée au fabricant, aux matériaux, à l’état et au contexte historique.',
  curatedTrackHeading: 'Expérience',
  curatedTrackText: 'Nous possédons une solide expérience dans le sourcing et la vente d’objets vintage français auprès de collectionneurs et de passionnés à l’international.',
  curatedTrackStat1Value: '',
  curatedTrackStat1Label: 'Pièces vendues',
  curatedTrackStat2Value: '',
  curatedTrackStat2Label: 'Évaluation clients',
  curatedTrackStat3Value: '',
  curatedTrackStat3Label: 'Pays livrés',
  curatedEnquiryHeading: 'Demandes de renseignements',
  curatedEnquiryText: 'Pour toute information sur une pièce de la Sélection organisée, ou pour toute demande concernant un objet vintage français en particulier, contactez-nous.',
  curatedEnquiryEmailLabel: 'E-mail',
  // curated selection object detail labels
  selMaker: 'Fabricant',
  selDesigner: 'Designer',
  selOrigin: 'Origine',
  selPeriod: 'Période',
  selMaterials: 'Matériaux',
  selDimensions: 'Dimensions',
  selMarks: 'Marques & signatures',
  selCondition: 'État',
  selStatus: 'Statut',
  selClose: 'Fermer',
  selPrev: 'Image précédente',
  selNext: 'Image suivante',
  selNoPhotos: 'Aucune photo disponible',
  // ── Guide n°1 : Seaux à champagne vintage français ──
  // (Guide éditorial de collectionneur. Formulations prudentes ; aucune date ni fabricant inventés.)
  guideChampagneDocTitle: 'Seaux à champagne vintage français : guide du collectionneur | Cook & Collect',
  guideChampagneMetaDesc: 'Le guide d’un professionnel sur les seaux à champagne et rafraîchissoirs vintage français : matériaux, marques de fabricant, marquage des maisons, datation et état, avec des exemples de la collection Cook & Collect.',
  guideChampagneOgTitle: 'Seaux à champagne vintage français : guide du collectionneur',
  guideChampagneOgDesc: 'Comment lire les matériaux, les marques et le marquage des seaux à champagne vintage français — un guide éditorial signé Cook & Collect.',
  guideChampagneBreadcrumbGuides: 'Guides',
  guideChampagneBreadcrumbCurrent: 'Seaux à champagne vintage français',
  guideChampagneEyebrow: 'Champagne & objets de bar · Guide du collectionneur',
  guideChampagneH1: 'Seaux à champagne vintage français : guide du collectionneur',
  guideChampagneIntro: 'Peu d’objets incarnent aussi directement l’art de la table à la française que le seau à champagne. Utilitaire par conception et souvent décoratif par intention, ces rafraîchissoirs ont accompagné les célébrations dans les restaurants, les bars et les maisons privées tout au long du XXᵉ siècle. Ce guide examine leur fabrication, la manière dont les maisons de champagne et les fabricants d’arts de la table français en ont façonné l’apparence, et comment un collectionneur peut aborder l’identification, la datation et l’état avec rigueur.',

  guideChampagneS1Heading: 'Du service du champagne à l’objet de design',
  guideChampagneS1P1: 'Un seau à champagne n’a qu’une fonction : maintenir une bouteille au frais à table. Pourtant, la manière dont cette fonction a été traitée en France révèle bien davantage. La forme se situe au croisement de l’hospitalité, du design industriel et de l’image de marque — un petit objet auquel on demande de paraître juste sur une table bien dressée tout en résistant à un usage quotidien en salle.',
  guideChampagneS1P2: 'Cette double vie explique l’intérêt des exemplaires vintage aujourd’hui. Certains ont été conçus comme des arts de la table raffinés ; d’autres ont été produits pour le compte de maisons de champagne et portent leurs noms et emblèmes. Entre ces deux pôles s’étend une grande variété de matériaux, de formes et de finitions, et c’est précisément ce qui rend cette catégorie intéressante à étudier plutôt qu’à simplement acheter.',

  guideChampagneS2Heading: 'Les maisons de champagne et leurs seaux marqués',
  guideChampagneS2P1: 'Les seaux vintage les plus connus sont ceux associés aux maisons de champagne françaises. Ces rafraîchissoirs marqués étaient utilisés dans le cadre de la restauration et sont devenus des objets identifiables à part entière, portant noms de maisons, emblèmes et couleurs. Il convient d’être précis sur ce que ce marquage nous apprend : un nom de maison identifie la marque pour laquelle ou par laquelle l’objet a été utilisé, et non nécessairement l’atelier qui l’a fabriqué.',
  guideChampagneS2P2: 'L’exemplaire <strong>Veuve Clicquot</strong> Ponsardin de la collection Cook & Collect illustre la façon dont la couleur et le matériau peuvent servir une marque. Son corps orange translucide crée un lien visuel immédiat avec la palette jaune-orangé caractéristique associée à Veuve Clicquot, rehaussé par un large lettrage noir et la répétition de l’emblème de l’ancre. C’est un objet très sculptural, et un rappel utile que les objets de bar marqués ne se limitaient pas au métal.',
  // Sous-section V.C.P. + ancre (Veuve Clicquot).
  guideChampagneVcpHeading: 'Lire la marque : V.C.P. et l’ancre',
  guideChampagneVcpText: 'Les initiales V.C.P. signifient Veuve Clicquot Ponsardin. Associées à l’emblème de l’ancre, elles appartiennent à l’identité visuelle historique de la maison de champagne et remontent à l’époque de Madame Clicquot. Pour le collectionneur, une distinction importante s’impose toutefois. Sur un objet de service du champagne, le nom <strong>Veuve Clicquot</strong> et l’ancre V.C.P. identifient la Maison pour laquelle l’objet a été produit, mais ils n’identifient pas nécessairement le fabricant du seau lui-même. Établir le fabricant exige une marque de fabricant distincte, une référence de catalogue ou une autre preuve documentaire.',
  guideChampagneS2P3: 'Le seau en aluminium <strong>Moët & Chandon</strong> de la collection soulève une question voisine à propos des marquages ; il est examiné en détail ci-dessous.',

  guideChampagneS3Heading: 'Fabricants français et arts de la table',
  guideChampagneS3P1: 'Le service du champagne en France ne s’est jamais limité aux seaux promotionnels produits pour les maisons de champagne. Des fabricants d’arts de la table et des maisons d’inspiration orfèvrerie ont également produit des rafraîchissoirs à vin et à champagne sophistiqués, destinés à la table plutôt qu’à une marque. Ces pièces s’identifient par une marque de fabricant plutôt que par un emblème de maison, et récompensent l’attention portée aux proportions, à la finition et aux détails.',
  guideChampagneS3P2: 'Le rafraîchissoir <strong>Jean Couzon</strong> de la collection est un exemple documenté de cette tradition. Le dessous porte les mentions « Jean Couzon Orfèvre » et « INOX – 18/10 », indiquant un acier inoxydable 18/10 poli. Son bord supérieur évasé, sa base sur piédouche à décor de perles et de cannelures, ainsi que ses deux anses annulaires articulées relèvent d’un véritable design de service de table français plutôt que d’un objet promotionnel. Nous ne lui attribuons ni modèle précis ni décennie exacte, faute de documentation.',

  guideChampagneS4Heading: 'Matériaux et construction',
  guideChampagneS4P1: 'Le matériau est l’un des premiers éléments que lit un collectionneur. Les seaux à champagne vintage français se rencontrent en aluminium, en acier inoxydable, en acrylique et autres matériaux synthétiques, et — lorsque cela est historiquement pertinent — en métal argenté et autres métaux. Chacun évolue différemment dans le temps, ce qui influe à la fois sur l’apparence et sur la manière d’évaluer une pièce.',
  guideChampagneS4P2: 'L’aluminium, comme sur l’exemplaire <strong>Moët & Chandon</strong>, est léger et se prête bien au décor gravé ou cannelé ; il tend à présenter une oxydation et des traces d’usage, particulièrement à l’intérieur. L’acier inoxydable, tel que le 18/10 employé par <strong>Jean Couzon</strong>, est plus résistant et conserve une surface polie, tout en portant de légères rayures d’usage. Les corps en acrylique et en matériaux synthétiques, comme le seau <strong>Veuve Clicquot</strong>, permettent des couleurs franches et un marquage affirmé, mais s’usent plus volontiers autour du bord et aux points de fixation des anses métalliques.',
  guideChampagneS4P3: 'Les détails de construction méritent un examen attentif : la façon dont les anses sont fixées, si la base constitue un piédouche distinct ou est formée avec le corps, et la manière dont les éléments décoratifs comme les cannelures ou les perles sont exécutés. Ces détails sont souvent plus instructifs qu’une marque isolée.',

  guideChampagneS5Heading: 'Comment identifier un seau à champagne vintage français',
  guideChampagneS5P1: 'L’identification s’aborde au mieux comme un faisceau d’indices plutôt que comme une réponse unique. Les éléments utiles comprennent les marques de fabricant, les logos de maisons, la typographie, les étiquettes ou plaques appliquées, la construction des anses, celle de la base, le matériau lui-même, les marques de fabrication et — lorsqu’ils sont disponibles — les catalogues et publicités d’époque.',
  guideChampagneS5P2: 'Deux distinctions méritent d’être énoncées clairement. Premièrement, un logo de maison de champagne identifie le client ou la maison commanditaire ; il n’identifie pas en soi le fabricant. Deuxièmement, une mention « Made in France » confirme le pays d’origine mais ne désigne pas, à elle seule, le fabricant. Traiter ces informations séparément est ce qui garantit l’honnêteté d’une identification.',

  guideChampagneS6Heading: 'Datation des seaux à champagne vintage',
  guideChampagneS6P1: 'Un seul indice règle rarement une datation. Marquages, méthodes de construction, évolution du logo d’une maison, typographie, matériaux et comparaison avec des exemplaires documentés apportent chacun une partie du tableau, et un matériau ou un logo ne peut suggérer qu’une période large. Lorsque les éléments ne sont pas concluants, nous préférons des formulations prudentes — par exemple « XXᵉ siècle » ou « milieu du XXᵉ siècle » — ou nous indiquons que la datation fait encore l’objet de recherches. Pour une annonce sur une place de marché, cela peut sembler excessivement prudent ; pour un professionnel qui construit une collection réfléchie, c’est précisément l’essentiel.',

  guideChampagneS7Heading: 'État, patine et restauration',
  guideChampagneS7P1: 'Ces objets ont servi. Rayures, oxydation et usure générale sont à prévoir sur des pièces qui ont passé leur vie utile dans des restaurants, des bars et des maisons, et ces traces relèvent de l’histoire de l’objet plutôt que du simple défaut. Le seau <strong>Moët & Chandon</strong>, par exemple, présente une usure visible et une oxydation intérieure cohérentes avec un usage réel, que nous décrivons ouvertement.',
  guideChampagneS7P2: 'Nous mettons en garde contre un polissage agressif qui effacerait le caractère d’origine de la surface ou les marques. Un nettoyage respectueux est raisonnable ; ramener une pièce à un éclat artificiel ne l’est pas, et peut détruire les indices mêmes sur lesquels s’appuie un collectionneur.',

  // Titres d’objets — utilisés comme légendes à côté des photographies.
  guideChampagneObj1Title: 'Jean Couzon Orfèvre – Acier inoxydable 18/10',
  guideChampagneObj2Title: 'Veuve Clicquot Ponsardin – Seau à champagne orange',
  guideChampagneObj3Title: 'Moët & Chandon – Aluminium, Made in France',

  // Blocs de datation par objet, affichés à côté de la photographie de l’objet.
  // À MODIFIER au fil des recherches : consigner ce qui est réellement observé
  // sur la pièce (marques, construction, typographie, exemplaires documentés
  // comparables) et ne resserrer la date que lorsque les éléments le permettent.
  guideChampagneObj1DatingHeading: 'Datation du rafraîchissoir Jean Couzon',
  guideChampagneObj1DatingText: 'Le dessous de ce rafraîchissoir fournit de précieux éléments d’identification. Il est clairement signé « Jean Couzon Orfèvre » et « INOX 18/10 », ce qui identifie à la fois le fabricant français et la nuance d’acier inoxydable. Sa construction en acier inoxydable poli, sa forme sur piédouche et ses anses annulaires décoratives articulées sont cohérentes avec les arts de la table et objets de bar <strong>Jean Couzon</strong> produits durant la seconde moitié du XXᵉ siècle. Toutefois, aucun catalogue d’époque ni document de fabricant identifiant ce modèle précis n’a encore été localisé. Pour cette raison, Cook & Collect décrit prudemment la pièce comme un rafraîchissoir à champagne français <strong>Jean Couzon</strong> de la fin du XXᵉ siècle, sans lui attribuer un nom de modèle non étayé ni une année de production précise.',
  guideChampagneObj1NoteLabel: 'Note du collectionneur',
  guideChampagneObj1NoteText: 'Une marque de fabricant établit la paternité de l’objet plus sûrement que son âge. « Jean Couzon Orfèvre » identifie le fabricant, tandis que « INOX 18/10 » identifie la nuance d’acier inoxydable. Aucune de ces inscriptions ne fournit à elle seule une date de fabrication.',
  guideChampagneObj2DatingHeading: 'Datation de ce seau à champagne Veuve Clicquot',
  guideChampagneObj2DatingText: 'La datation des objets de bar champenois vintage exige de la prudence. Des seaux <strong>Veuve Clicquot</strong> orange comparables ont été attribués à différentes périodes de la seconde moitié du XXᵉ siècle, mais ces attributions de marché sont rarement accompagnées de catalogues d’époque ou d’une documentation de fabricant. L’ancre historique V.C.P. ne peut à elle seule dater le seau. L’emblème précède l’objet de plusieurs décennies et identifie la maison de champagne plutôt que le fabricant ou la date de production de l’objet de service. Aucune marque de fabricant ni référence documentaire d’époque identifiant ce modèle précis n’a encore été établie. Cook & Collect décrit donc prudemment cet exemplaire comme un objet de bar français <strong>Veuve Clicquot</strong> du XXᵉ siècle, plutôt que de lui attribuer une date de production précise non étayée.',
  guideChampagneObj2MaterialNote: 'Le corps est un matériau synthétique moulé translucide, souvent décrit comme acrylique dans des exemplaires comparables ; aucune marque de matériau confirmant le polymère exact n’a été identifiée sur cette pièce.',
  guideChampagneMoetReadingHeading: 'Lire le seau Moët & Chandon',
  guideChampagneMoetReadingText: 'Ce seau <strong>Moët & Chandon</strong> en aluminium appartient à une famille reconnaissable d’objets français de service du champagne produits durant la seconde moitié du XXᵉ siècle. Ses détails caractéristiques comprennent un corps fuselé, des bandes décoratives horizontales, des anses annulaires articulées et une plaque contrastée Moët & Chandon noire avec un sceau central rouge. Des exemplaires comparables présentent des proportions, une construction et un traitement décoratif étroitement apparentés. Ces comparaisons sont utiles pour situer l’objet dans la tradition plus large des objets de bar champenois français de la fin du XXᵉ siècle, mais elles n’établissent ni le fabricant ni une année de production exacte.',
  guideChampagneMoetMadeInHeading: 'Ce que « Made in France » nous apprend',
  guideChampagneMoetMadeInText: 'La base de l’exemplaire Cook & Collect porte une simple mention « MADE IN FRANCE ». Elle constitue une preuve utile de fabrication française, mais ne doit pas être interprétée comme une signature de fabricant. Cette distinction est particulièrement importante pour les objets de bar champenois marqués. L’identité de maison de champagne appartient à <strong>Moët & Chandon</strong>, tandis que l’objet physique peut avoir été fabriqué par un producteur spécialisé distinct. Des seaux à champagne similaires peuvent subsister avec des marques de fabricant précises, mais la seule ressemblance visuelle ne suffit pas à transférer l’une de ces attributions à un exemplaire ne portant qu’une marque de pays d’origine. Cook & Collect enregistre donc le fabricant de cet exemplaire comme actuellement non identifié.',
  guideChampagneMoetNoteLabel: 'Note du collectionneur',
  guideChampagneMoetNoteText: '« Made in France » établit le pays de fabrication, et non le fabricant. Un fabricant précis ne devrait être attribué que lorsqu’il est étayé par une marque de fabricant physique, un catalogue d’époque, une publicité, une documentation de fabricant ou une autre source documentaire fiable.',
  guideChampagneObj3DatingHeading: 'Datation du seau Moët & Chandon',
  guideChampagneObj3DatingText: 'La construction en aluminium, le format à anses annulaires, la plaque graphique de la maison de champagne et le dessin d’ensemble inscrivent ce seau dans le vocabulaire des objets de bar champenois français de la seconde moitié du XXᵉ siècle. Des exemplaires comparables sont fréquemment associés aux années 1970 et 1980. Cela fournit un élément comparatif utile pour la période probable de l’exemplaire Cook & Collect, mais, en l’absence de catalogue d’époque ou de documentation de fabricant pour ce modèle précis, cela ne doit pas être traité comme une date précise. Sur la base des éléments actuellement disponibles, Cook & Collect décrit l’objet ainsi : France, seconde moitié du XXᵉ siècle, probablement années 1970–1980 ; fabricant non identifié.',

  // Sous-section méthodologie (au sein de la section « Comment identifier »).
  guideChampagneMethodHeading: 'Comment Cook & Collect date un objet',
  guideChampagneMethodP1: 'Une date attachée à un autre exemplaire subsistant est un point de départ, non une conclusion. Nous comparons les marques de fabricant, les matériaux, la construction, la typographie, les logos de maisons et les exemplaires documentés, puis nous recherchons dans la mesure du possible des catalogues d’époque, des publicités et des références d’archives.',
  guideChampagneMethodP2: 'Une part importante de ce travail consiste à distinguer les différents types de preuves qu’un objet peut fournir. Un logo de maison de champagne peut identifier le client ou la Maison, une estampille de fabricant peut identifier le fabricant, et une marque de pays d’origine peut établir le lieu de fabrication. Aucun de ces éléments ne fournit nécessairement, à lui seul, une date de fabrication.',
  guideChampagneMethodP3: 'Lorsque les éléments disponibles ne soutiennent qu’une période plutôt qu’une année précise, nous préférons l’attribution la plus large. Pour le collectionneur, comprendre les limites des preuves disponibles fait partie de la compréhension de l’objet.',

  // Recherche & références (discret ; sources faisant autorité uniquement).
  guideChampagneRefHeading: 'Recherche & références',
  guideChampagneRefIntro: 'Nos recherches associent les preuves physiques relevées sur chaque objet aux histoires officielles des Maisons, aux informations de fabricants, aux archives, à la documentation d’époque et aux exemplaires comparables. Les objets comparables aident à établir des formes, des dimensions et des détails de construction récurrents, mais ils ne sont pas traités comme la preuve d’une date de production exacte.',
  guideChampagneRefVcpLabel: 'Veuve Clicquot',
  guideChampagneRefVcpText: 'Histoire de la Maison et héritage de Madame Clicquot Ponsardin, avec l’identité historique V.C.P. et l’emblème de l’ancre :',
  guideChampagneRefVcpLink1Text: 'Veuve Clicquot — Madame Clicquot (histoire officielle de la Maison)',
  guideChampagneRefVcpLink1Url: 'https://www.veuveclicquot.com/fr-fr/madameclicquot.html',
  guideChampagneRefVcpLink2Text: 'Union des Maisons de Champagne — Veuve Clicquot',
  guideChampagneRefVcpLink2Url: 'https://maisons-champagne.com/fr/maison/veuve-clicquot',
  guideChampagneRefMoetLabel: 'Moët & Chandon',
  guideChampagneRefMoetText: 'Histoire de la Maison fondée en 1743 :',
  guideChampagneRefMoetLink1Text: 'Moët & Chandon — la Maison (histoire officielle)',
  guideChampagneRefMoetLink1Url: 'https://www.moet.com/fr-fr/la-maison-moet-chandon',
  guideChampagneRefCouzonLabel: 'Jean Couzon',
  guideChampagneRefCouzonText: 'Pour le rafraîchissoir Jean Couzon, la preuve première demeure le marquage physique « Jean Couzon Orfèvre / INOX 18/10 » présent sur l’objet lui-même. Nous n’avons pas localisé de source institutionnelle ou d’archive documentant ce modèle précis, et nous préférons nous appuyer sur la marque de l’objet plutôt que de l’attribuer sur la base d’annonces de places de marché.',

  guideChampagneS9Heading: 'Collectionner les objets de bar champenois français aujourd’hui',
  guideChampagneS9P1: 'Les seaux à champagne français restent accessibles à collectionner et faciles à vivre. Ils s’accordent à un intérieur réfléchi, servent d’objets de présentation, et récompensent le collectionneur qui lit attentivement les matériaux et les marques plutôt que de se fier au seul nom. En tant que catégorie, ils s’inscrivent naturellement aux côtés des cuivres français et d’autres objets de la table.',
  guideChampagneS9CtaText: 'Découvrez notre sélection Champagne & objets de bar.',

  // Textes alternatifs des images
  guideChampagneObj1Alt: 'Rafraîchissoir à champagne vintage Jean Couzon en acier inoxydable français avec anses annulaires',
  guideChampagneObj1MarkAlt: 'Marque de fabricant Jean Couzon Orfèvre INOX 18/10 sous la base',
  guideChampagneObj2Alt: 'Seau à champagne vintage Veuve Clicquot Ponsardin orange',
  guideChampagneObj2DetailAlt: 'Détail du corps orange translucide et de l’emblème de l’ancre du seau à champagne Veuve Clicquot',
  guideChampagneObj3Alt: 'Seau à champagne vintage Moët & Chandon en aluminium Made in France',
  guideChampagneObj3MarkAlt: 'Plaque noire et sceau rouge Moët & Chandon sur le seau à champagne en aluminium',

  // Fiche listing (affichée sur l’index des Guides du collectionneur).
  guideChampagneCardEyebrow: 'Champagne & Arts du bar',
  guideChampagneCardTitle: 'Seaux à champagne français vintage',
  guideChampagneCardSummary: 'Un guide consacré aux seaux à champagne français vintage, de Veuve Clicquot à Moët & Chandon et Jean Couzon, à travers leurs marques, matériaux, fabrication et datation.',
  guideChampagneCardImageAlt: 'Seaux à champagne français vintage Veuve Clicquot, Moët & Chandon et Jean Couzon',
  // Lien contextuel vers le guide du cuivre, ajouté à la section de clôture.
  guideChampagneS9CopperLink: 'Pour poursuivre l’exploration du savoir-faire et de l’identification des objets français, découvrez notre <a href="vintage-french-copper-cookware.html">guide du collectionneur consacré aux ustensiles de cuisine français en cuivre vintage</a>.',

  // ── Index des Guides du collectionneur (page d’accueil) ──
  guidesIndexDocTitle: 'Guides du collectionneur : objets et arts de la table français vintage | Cook & Collect',
  guidesIndexMetaDesc: 'Découvrez les guides Cook & Collect consacrés aux objets français vintage : fabricants, marques, matériaux, techniques de fabrication, identification et datation.',
  guidesIndexOgTitle: 'Guides du collectionneur · Objets français vintage',
  guidesIndexBreadcrumbCurrent: 'Guides du collectionneur',
  guidesIndexEyebrow: 'Cook & Collect · Recherches & Guides du collectionneur',
  guidesIndexTitle: 'Guides du collectionneur',
  guidesIndexIntro: 'Découvrez l’histoire, les fabricants et les détails qui permettent de mieux comprendre les objets français de collection. Nos guides s’appuient sur des pièces sélectionnées et examinées par Cook & Collect, en croisant indices matériels, poinçons, étiquettes d’origine et recherches historiques documentées.',
  guidesIndexCardCta: 'Lire le guide',

  // Fiche listing du guide du cuivre (affichée sur l’index des Guides).
  guideCopperCardEyebrow: 'Cuivre culinaire français',
  guideCopperCardTitle: 'Ustensiles de cuisine français en cuivre vintage',
  guideCopperCardSummary: 'Découvrez le cuivre culinaire français vintage à travers des pièces E. Dehillerin, Mauviel et L. Lecellier, leurs marques, techniques de fabrication, revêtements, patines et éléments de datation.',
  guideCopperCardImageAlt: 'Ustensiles de cuisine français en cuivre vintage E. Dehillerin, Mauviel et L. Lecellier',

  // Mention affichée à la place d’une photographie encore manquante
  // (générée par <g-figure> dans build-guides.js).
  guidePhotoPending: 'Photographie à venir',

  // ── Guide n°2 : ustensiles de cuisine français en cuivre vintage (guide pilier) ──
  // Rigueur factuelle : aucune date, aucun fabricant, aucun modèle, aucune
  // matière, aucune provenance ni technique inventés. Les affirmations
  // historiques se limitent à ce que disent les sources citées ; tout le reste
  // est présenté comme indice matériel, attribution ou recherche en cours.
  guideCopperDocTitle: 'Cuivre culinaire français vintage : fabricants, marques et datation | Cook & Collect',
  guideCopperMetaDesc: 'Un guide du collectionneur consacré aux ustensiles de cuisine français en cuivre vintage : E. Dehillerin, Mauviel, L. Lecellier, Villedieu, marques de fabricants, fabrication, étamage et datation.',
  guideCopperOgTitle: 'Ustensiles de cuisine français en cuivre vintage : guide du collectionneur',
  guideCopperOgDesc: 'Comment lire les marques, la fabrication, l’épaisseur, le revêtement et l’usure du cuivre culinaire français vintage — un guide éditorial Cook & Collect.',
  guideCopperBreadcrumbGuides: 'Guides',
  guideCopperBreadcrumbCurrent: 'Cuivre culinaire français vintage',
  guideCopperEyebrow: 'Cuivre culinaire français · Guide du collectionneur',
  guideCopperH1: 'Ustensiles de cuisine français en cuivre vintage : guide du collectionneur',
  guideCopperIntro: 'Le cuivre français a été conçu pour servir. Une sauteuse, une casserole ou une bassine à confiture était achetée pour travailler en cuisine, et sa fabrication — l’épaisseur du cuivre, le revêtement intérieur, la queue rivetée sur le flanc, les rivets qui la maintiennent, les marques frappées dans le métal — répondait à cet usage. Ce sont ces mêmes éléments que le collectionneur lit aujourd’hui. Ce guide s’appuie sur des pièces sélectionnées et examinées par Cook & Collect, et il est aussi explicite sur ce que les indices ne nous disent pas que sur ce qu’ils établissent.',

  // ── La tradition française du cuivre ──
  guideCopperS1Heading: 'La tradition française du cuivre',
  guideCopperS1P1: 'Le cuivre conduit la chaleur rapidement et uniformément, et il peut être rétreint, martelé et formé à la main en volumes profonds et complexes. Pour les cuisines professionnelles françaises, cette combinaison en a fait le matériau de référence bien avant l’apparition de l’inox, et les métiers qui l’ont fourni — chaudronnerie, dinanderie et étamage — constituaient des savoir-faire distincts, avec leurs propres ateliers.',
  guideCopperS1P2: 'Une ville est inséparable de cette histoire : <strong>Villedieu-les-Poêles</strong>, dans la Manche, en Normandie. Son nom même porte la trace du métier, et le travail du cuivre demeure son patrimoine documenté : le musée municipal, la Maison du Patrimoine Sourdin, consacre l’un de ses espaces permanents à l’activité du cuivre, aux côtés de la dentelle, du meuble normand et des créations contemporaines en cuivre et laiton des ateliers encore en activité sur le territoire. <strong>Mauviel</strong>, fondée dans la ville en 1830 selon l’histoire publiée par l’entreprise, en est l’atelier le plus connu, et <strong>L. Lecellier</strong> — dont la marque « Cuivralec » figure sur une série graduée de casseroles de nos archives — portait également le nom de Villedieu sur ses produits.',
  guideCopperS1P3: 'L’autre pôle de cette histoire est Paris, et plus précisément le commerce alimentaire autour des Halles, où s’approvisionnaient les cuisines professionnelles. <strong>E. Dehillerin</strong> est né de ce quartier et exerce toujours rue Coquillière. Comprendre que le cuivre français est parvenu aux cuisines à la fois par des villes manufacturières de province et par des fournisseurs professionnels parisiens est la clé de la lecture de ses marques, car ces deux rôles laissent des indices de nature différente sur un objet.',

  // ── E. Dehillerin et le cuivre professionnel français ──
  guideDehillerinS2Heading: 'E. Dehillerin et le cuivre professionnel français',
  guideDehillerinS2P1: 'Selon l’histoire publiée par la maison elle-même, E. Dehillerin trouve ses origines dans le quartier des Halles, à Paris, où Eugène de Hillerin acquiert dans les années 1880 un magasin de quincaillerie et d’articles de ménage ainsi qu’un atelier de chaudronnerie, puis un ensemble d’activités complémentaires comprenant un atelier d’étamage et une ancienne boutique ouverte en 1820 — date dont la maison fait aujourd’hui le point de départ de son bicentenaire. En 1890, le magasin s’installe rue Coquillière, où il se trouve toujours.',
  guideDehillerinS2P2: 'Un détail de cette histoire compte beaucoup pour la lecture d’une marque Dehillerin. La même source indique que la fabrication fut concentrée dans des ateliers du 15e arrondissement, où l’on produisait le cuivre et les ustensiles étamés destinés aux restaurants, et où étameurs, écureurs et racleurs ont travaillé jusque dans les années 1960. E. Dehillerin était donc à la fois fournisseur de matériel de cuisine professionnel et, historiquement, producteur dans ses propres ateliers. C’est précisément pourquoi une marque « E. DEHILLERIN / PARIS » doit être comprise comme identifiant la maison associée à l’objet, et non comme un raccourci vers un atelier unique ou vers une année de fabrication.',

  // Bloc de spécifications de la sauteuse (données mesurées uniquement).
  guideDehillerinSpecTitle: 'Spécifications relevées',
  guideDehillerinSpecDiameterLabel: 'Diamètre',
  guideDehillerinSpecDiameterValue: '29 cm',
  guideDehillerinSpecWeightLabel: 'Poids',
  guideDehillerinSpecWeightValue: '4,655 kg',
  guideDehillerinSpecWallLabel: 'Paroi de cuivre',
  guideDehillerinSpecWallValue: 'Environ 3 mm',
  guideDehillerinSpecConstructionLabel: 'Fabrication',
  guideDehillerinSpecConstructionValue: 'Cuivre étamé',
  guideDehillerinSpecHandleLabel: 'Queue',
  guideDehillerinSpecHandleValue: 'Queue en fer massif',
  guideDehillerinSpecAttachmentLabel: 'Fixation',
  guideDehillerinSpecAttachmentValue: 'Trois gros rivets',
  guideDehillerinSpecMarkLabel: 'Marque',
  guideDehillerinSpecMarkValue: 'E. DEHILLERIN / PARIS',
  guideDehillerinSpecRivetLabel: 'Frappes sur rivets',
  guideDehillerinSpecRivetValue: 'Chacune des trois têtes de rivet intérieures porte le nombre frappé « 18 »',
  guideDehillerinSpecNote: 'Mesures et pesée effectuées par Cook & Collect. Ce sont des observations, non une datation : aucun de ces chiffres n’attribue une année de fabrication.',

  guideDehillerinObj1Title: 'E. Dehillerin, Paris — sauteuse en cuivre étamé de 29 cm, 4,655 kg',
  guideDehillerinObj1MarkCaption: 'Marque de la maison E. Dehillerin Paris sur une sauteuse en cuivre étamé de forte épaisseur.',
  guideDehillerinObj1WallCaption: 'Paroi de cuivre d’environ 3 mm sur une sauteuse E. Dehillerin de 29 cm pesant 4,655 kg.',
  guideDehillerinObj1HandleCaption: 'Queue en fer massif de la sauteuse E. Dehillerin de 29 cm.',
  guideDehillerinObj1RivetsCaption: 'Trois gros rivets fixant la queue en fer ; chaque tête de rivet intérieure porte le nombre frappé « 18 ».',
  guideDehillerinObj1InteriorCaption: 'Intérieur étamé de la sauteuse E. Dehillerin de 29 cm.',

  guideDehillerinObj1WallHeading: 'Ce que décrivent réellement 29 cm, 4,655 kg et 3 mm',
  guideDehillerinObj1WallText: 'Il s’agit de cuivre professionnel de forte épaisseur. Avec 29 cm de diamètre, une paroi d’environ 3 mm et un poids de 4,655 kg, cette sauteuse est conçue pour la stabilité thermique qu’exige une cuisine en activité, non pour le confort domestique — pleine, elle est réellement difficile à manier d’une seule main. Cela renseigne sur l’usage prévu et sur la catégorie d’ustensile. Cela ne dit pas quand la pièce a été fabriquée. Le cuivre de forte épaisseur a été produit sur une très longue période et l’est encore : l’épaisseur et le poids décrivent une spécification, pas un âge.',
  guideDehillerinObj1MarkHeading: 'Lire la marque et les rivets',
  guideDehillerinObj1MarkText: 'La sauteuse porte une marque « E. DEHILLERIN / PARIS », qui identifie la maison parisienne associée à l’objet. Chacune des trois têtes de rivet intérieures porte le nombre frappé « 18 » ; sa signification en atelier n’a pas été établie. Nous le consignons parce qu’il s’agit d’un indice matériel, et nous renonçons à l’expliquer : une interprétation vraisemblable d’une frappe n’équivaut pas à une interprétation documentée.',
  guideDehillerinObj1NoteText: 'La marque d’un fabricant ou d’un fournisseur peut identifier un fabricant ou une maison ; elle ne fournit pas automatiquement une date de fabrication. L’épaisseur, le poids, le type de queue et la construction des rivets aident à comprendre comment un objet a été fabriqué et utilisé, mais aucun d’eux ne doit servir seul à attribuer une date.',
  guideDehillerinObj1DatingHeading: 'Datation de cette sauteuse',
  guideDehillerinObj1DatingText: 'Nous n’attribuons pas de date de fabrication précise à cette sauteuse, et nous ne le ferons pas en l’état des indices disponibles. Ce que nous pouvons dire est documenté et limité : l’objet porte une marque E. DEHILLERIN / PARIS ; il est en cuivre étamé de forte épaisseur, environ 3 mm ; sa queue en fer est fixée par trois gros rivets ; chaque tête de rivet intérieure porte la frappe « 18 ». La maison exerce depuis le XIXe siècle et a exploité ses propres ateliers d’étamage et de chaudronnerie jusque dans les années 1960, ce qui situe l’objet sans le dater. Resserrer la période exigerait un catalogue d’époque, une facture, une publicité ou un autre document correspondant à ce modèle — cette recherche reste ouverte.',

  // ── Fabricants et maisons : introductions concises qui renvoient vers les
  // trois guides spécialisés. Les études de cas complètes vivent sur ces
  // pages ; rien ici ne doit les dupliquer. ──
  guideCopperMakersHeading: 'Fabricants, maisons et où poursuivre la lecture',
  guideCopperMakersP1: 'Trois noms reviennent dans le cuivre français que nous manipulons, et chacun enseigne une leçon différente sur la manière de lire ces objets. Voici une courte présentation de chacun, avec un lien vers le guide où les objets, les marques et les mesures sont examinés en détail.',
  guideCopperDehillerinIntroHeading: 'E. Dehillerin — la maison parisienne des professionnels',
  guideCopperDehillerinIntroText: 'E. Dehillerin est née du commerce alimentaire des Halles et exerce toujours rue Coquillière. Elle intéresse le collectionneur parce qu’elle a occupé les deux versants d’une distinction facile à brouiller : elle approvisionnait les cuisines professionnelles et, selon son propre récit, produisait aussi dans ses ateliers de chaudronnerie et d’étamage. Une pièce marquée « E. DEHILLERIN / PARIS » est donc solidement associée à la maison, sans que cette marque seule établisse qui a formé le métal ni à quelle date. Notre lourde sauteuse en cuivre étamé de 29 cm, 4,655 kg pour une paroi d’environ 3 mm, est l’objet qui nous sert à dérouler ce raisonnement.',
  guideCopperDehillerinIntroCta: 'Découvrir notre guide du cuivre E. Dehillerin',
  guideCopperMauvielIntroHeading: 'Mauviel — le fabricant de Villedieu',
  guideCopperMauvielIntroText: 'Mauviel est le mieux documenté des ateliers de Villedieu-les-Poêles, et une marque Mauviel constitue à peu près l’identification la plus claire que le cuivre français puisse offrir : elle nomme un fabricant. Ce qu’elle ne nomme pas, c’est une date, une épaisseur ou un revêtement. Les pièces Mauviel passées entre nos mains — dont un confiturier portant à la fois des références Mauviel et E. Dehillerin — sont celles qui nous servent à distinguer le fabricant de la maison, et la marque de la conclusion.',
  guideCopperMauvielIntroCta: 'Découvrir notre guide du cuivre Mauviel vintage',
  guideCopperLecellierIntroHeading: 'L. Lecellier et Cuivralec — quand l’étiquette survit au métal',
  guideCopperLecellierIntroText: 'L. Lecellier travaillait également à Villedieu-les-Poêles et vendait sous la marque déposée « Cuivralec ». La série graduée de cinq casseroles de nos archives est remarquable parce que plusieurs pièces conservent leurs étiquettes de papier d’origine — et ces étiquettes énoncent ce que le métal ne dit pas, notamment la mention « sans étamage ». C’est le plus clair exemple que nous possédions d’une preuve documentaire conservée sur l’objet lui-même.',
  guideCopperLecellierIntroCta: 'Découvrir notre guide L. Lecellier & Cuivralec',


  // ── Lire une pièce de cuivre française ──
  guideCopperS3Heading: 'Lire une pièce de cuivre française',
  guideCopperS3P1: 'Lorsqu’une pièce de cuivre nous parvient, nous l’examinons toujours dans le même ordre, et nous notons ce que nous voyons avant de nous former une opinion sur ce que cela signifie. L’ordre importe, car il maintient les indices matériels séparés de leur interprétation.',
  guideCopperS3aHeading: 'Marques, dimensions et poids',
  guideCopperS3aText: 'D’abord les marques : nom de fabricant ou de maison, nom de ville, mention de pays d’origine, indications de taille, et tout chiffre frappé sur les rivets, la queue ou le fond. Chacune est relevée telle qu’elle apparaît, en précisant son emplacement sur l’objet. Viennent ensuite les mesures — diamètre, hauteur, épaisseur de paroi et poids — relevées plutôt qu’estimées, car c’est la partie de la description que chacun peut vérifier par la suite.',
  guideCopperS3bHeading: 'Queue, rivets et fabrication',
  guideCopperS3bText: 'Puis la fabrication : matière et forme de la queue, mode de fixation, nombre, diamètre et disposition des rivets, têtes bombées ou arasées, et façon dont le corps a été formé. Le fond également — plat ou légèrement bombé, et sa manière de s’être usé. Ces détails décrivent une pratique d’atelier et une catégorie d’objet, et ils sont surtout utiles lus ensemble plutôt qu’isolément.',
  guideCopperS3cHeading: 'Revêtement et surface intérieure',
  guideCopperS3cText: 'Ensuite l’intérieur : la pièce est-elle étamée, et si oui l’étain est-il d’origine, usé, lacunaire ou refait ; l’intérieur est-il d’une autre matière ; et comment cette surface s’accorde-t-elle au reste de l’objet. Lorsque le revêtement n’est manifestement pas de l’étain, nous le disons et laissons la matière non identifiée jusqu’à documentation, plutôt que de la supposer.',
  guideCopperS3dHeading: 'Usure, réparations et restauration',
  guideCopperS3dText: 'Enfin l’histoire inscrite sur la surface : rayures d’ustensiles, traces de chaleur, chocs, oxydation des pièces en fer, zones polies, indices de réétamage et réparations éventuelles. L’usure due à un usage professionnel est une information, non un simple défaut, et une pièce visiblement reprise est décrite comme telle.',
  guideCopperS3Note: 'Aucune de ces observations ne constitue à elle seule une datation. Ensemble, elles composent la description de la fabrication et de l’usage d’un objet, base sur laquelle une attribution prudente peut ensuite être construite.',

  // ── Épaisseur et poids ──
  guideCopperS4Heading: 'Épaisseur et poids : ce qu’ils nous apprennent',
  guideCopperS4P1: 'L’épaisseur du cuivre est la spécification la plus utile sur une pièce française, parce que c’est pour elle que l’objet était choisi. Les fortes épaisseurs conservent et répartissent la chaleur plus régulièrement et restent planes sous un usage intensif ; les épaisseurs plus fines chauffent plus vite, coûtent moins cher et sont plus faciles à soulever. Les deux ensembles auxquels nous nous référons illustrent clairement cet écart : la <a href="e-dehillerin-copper-cookware.html">sauteuse E. Dehillerin</a> présente une paroi d’environ 3 mm pour 4,655 kg, tandis que les <a href="lecellier-cuivralec.html">casseroles L. Lecellier</a> sont d’environ 1,5 mm. Ce sont des outils différents pour des cuisines différentes.',
  guideCopperS4P2: 'Ce que l’épaisseur et le poids ne permettent pas, c’est de dater une pièce. Les fortes épaisseurs professionnelles et les épaisseurs domestiques plus légères ont été fabriquées en parallèle, et le sont encore. Il en va de même du poids, qui n’est que l’épaisseur multipliée par la taille. L’épaisseur devient utile à la datation comme élément parmi d’autres — associée aux marques, aux étiquettes, à la fabrication et, idéalement, à un catalogue ou une publicité d’époque indiquant quelles épaisseurs un fabricant ou un fournisseur proposait, et à quel moment.',
  guideCopperS4Note: 'Nous évitons les règles du type « 3 mm signifie XIXe siècle » ou « une queue en fer signifie ancien ». Ces raccourcis sont courants dans le commerce et ne sont pas étayés par les indices ; ils confondent spécification et période.',

  // ── Queues, rivets et fabrication ──
  guideCopperS5Heading: 'Queues, rivets et fabrication',
  guideCopperS5P1: 'Les queues et poignées du cuivre français existent en fer, laiton, bronze, métal fondu et, sur les pièces plus récentes, en inox, et leur forme suit leur fonction : longues queues droites pour le travail au fourneau, oreilles courtes et poignées latérales sur les grands récipients qui se prennent à deux mains, anneaux pour la suspension. Une queue en fer massif sur une pièce lourde forme un couple cohérent — la queue doit supporter le poids d’un récipient plein, et c’est par cet assemblage qu’une pièce cède d’abord.',
  guideCopperS5P2: 'D’où l’attention portée aux rivets. Leur nombre, leur diamètre, leur écartement, et le fait que leurs têtes soient laissées bombées ou martelées à fleur, traduisent la manière dont un atelier a résolu l’ancrage d’une queue sur une paroi de cuivre courbe. La lourde <a href="e-dehillerin-copper-cookware.html">sauteuse E. Dehillerin</a> de nos archives en est une bonne illustration — sa queue en fer est tenue par trois gros rivets, chaque tête intérieure portant un nombre frappé — et nous examinons cette construction en détail dans le guide qui lui est consacré.',
  guideCopperS5P3: 'Lus ensemble, la matière et la forme de la queue, le schéma de rivetage et la façon dont un corps a été formé peuvent situer un objet dans une famille reconnaissable de production française et appuyer ou fragiliser une attribution proposée. Lus séparément, ils prouvent très peu — et en particulier une queue en fer n’est pas une preuve d’ancienneté, le fer ayant été employé sur une très longue période et pour des raisons purement pratiques.',

  // ── Étamage, usure et restauration ──
  guideCopperS6Heading: 'Étamage, usure et restauration',
  guideCopperS6P1: 'Le cuivre culinaire français traditionnel est étamé : l’intérieur reçoit une fine couche d’étain sur le cuivre, ce qui explique que l’étamage ait été un métier spécialisé doté de ses propres ateliers — les grandes maisons parisiennes exploitaient leurs propres ateliers d’étamage, comme le rapporte l’histoire de la maison <a href="e-dehillerin-copper-cookware.html">E. Dehillerin</a>. L’étain est tendre et ne dure pas indéfiniment : une pièce en service devait être réétamée périodiquement. Le réétamage fait donc partie de la pratique française du cuivre, et non d’une intervention moderne.',
  guideCopperS6P2: 'Sur une pièce conservée, le revêtement est l’une des surfaces les plus instructives. Un étain d’origine présente en général un gris mat légèrement marbré, avec des traces d’ustensiles et un amincissement là où la chaleur et les gestes se concentraient ; un cuivre apparent au fond ou sur les parois indique un usage réel. Un intérieur uniformément brillant et intact sur une pièce par ailleurs très utilisée signale généralement un réétamage professionnel, traitement légitime et souvent souhaitable — nous indiquons simplement lorsque nous estimons que c’est le cas, et nous ne présentons pas une pièce réétamée comme une surface d’origine intacte.',
  guideCopperS6P3: 'Nous décrivons des revêtements, pas des usages culinaires. Savoir si une pièce vintage donnée peut servir à cuisiner relève de la décision de son propriétaire, éclairée par l’état réel du revêtement et, le cas échéant, par un étameur professionnel — et nous préférons orienter vers un atelier de réétamage plutôt que de donner une assurance que nous ne sommes pas en mesure de donner.',

  // ── Mauviel et Villedieu-les-Poêles ──
  guideMauvielS7Heading: 'Mauviel et Villedieu-les-Poêles',
  guideMauvielS7P1: 'L’histoire publiée par Mauviel indique qu’Ernest Mauviel installa son atelier à Villedieu-les-Poêles, en Normandie, en 1830, que la maison est restée dans la même famille sur sept générations et qu’elle fabrique toujours dans la ville. La même chronologie d’entreprise mentionne l’installation d’une nouvelle unité de production en 1965, une première ligne de cuivre bilaminé associant 90 % de cuivre et 10 % d’inox en 1989, puis un inox multicouches conçu pour l’induction en 1995.',
  guideMauvielS7P2: 'Pour un collectionneur, l’intérêt de cette chronologie est qu’elle est documentée et datée par le fabricant. Elle fournit de véritables points de repère — une construction bilaminée cuivre-inox, par exemple, appartient à l’histoire récente des produits de la maison et non à sa production du XIXe siècle — sans rien dire pour autant d’une pièce non marquée. C’est un contexte historique, non une clé de datation.',
  guideMauvielObj2Title: 'Sauteuse en cuivre Mauviel — archives Cook & Collect',
  guideMauvielObj2MarkCaption: 'Marque Mauviel / Made in France sur une sauteuse en cuivre précédemment sélectionnée par Cook & Collect.',
  guideMauvielObj2DetailCaption: 'Détail de la queue et du rivetage sur la sauteuse Mauviel, archives Cook & Collect.',
  guideMauvielObj2Heading: 'Une marque Mauviel sur une sauteuse des archives',
  guideMauvielObj2Text: 'Cette sauteuse en cuivre, précédemment sélectionnée par Cook & Collect, porte une marque « Mauviel / Made in France » visible. C’est un indice solide : il identifie le fabricant et situe la fabrication en France. C’est l’identification la plus claire qu’une pièce de cuivre française puisse offrir, et c’est exactement pour cela que nous photographions les marques en gros plan.',
  guideMauvielObj2NoteText: 'Une marque Mauviel identifie le fabricant. Elle n’établit pas, à elle seule, la date, l’épaisseur du cuivre, le revêtement ni la collection dont une pièce relevait. Nous n’attribuons aucun de ces éléments à cette pièce, et nous ne le ferons que si l’objet est mesuré et sa spécification documentée.',

  // ── Fabricant, détaillant et attribution ──
  guideMauvielS8Heading: 'Fabricant, détaillant et attribution',
  guideMauvielS8P1: 'Les marques du cuivre français méritent une lecture attentive, car les noms portés par un objet peuvent jouer des rôles différents. Un nom peut être celui de l’atelier qui a formé et fini la pièce, de la maison qui l’a commandée ou fournie, d’une marque déposée, ou d’un détaillant pour la clientèle duquel elle a été réalisée. Ces rôles se recouvrent en pratique — l’histoire d’E. Dehillerin décrit une maison qui approvisionnait les cuisines professionnelles tout en exploitant ses propres ateliers de chaudronnerie et d’étamage — de sorte que « fabricant » et « détaillant » ne peuvent être traités ni comme des étiquettes interchangeables, ni comme des catégories exclusives.',
  guideMauvielS8P2: 'La conséquence pratique est une discipline d’écriture. Nous relevons quel nom apparaît, où il apparaît et comment il est apposé — frappé, gravé, imprimé sur une étiquette — et nous ne décrivons la relation entre ces noms que lorsque la documentation l’établit. Deux noms sur un même objet constituent une question de recherche, non une conclusion.',
  guideMauvielObj3Title: 'Confiturier sélectionné par Cook & Collect — marques en cours d’examen',
  guideMauvielObj3MarkCaption: 'Marques du confiturier sélectionné par Cook & Collect, photographiées pour examen.',
  guideMauvielObj3Heading: 'Étude de cas : un confiturier portant des références Mauviel et E. Dehillerin',
  guideMauvielObj3Text: 'Un confiturier en cuivre — large bassine à confiture peu profonde — sélectionné par Cook & Collect occupe cette section parce qu’il pose directement la question du fabricant et du détaillant. Ses mesures, ses détails de fabrication et la forme exacte ainsi que l’emplacement de ses marques sont en cours de relevé, et sa photographie originale sera ajoutée ici.',

  // ── L. Lecellier et Cuivralec ──
  guideLecellierS9Heading: 'L. Lecellier et Cuivralec',
  guideLecellierS9P1: 'Le second ensemble principal de ce guide est une série graduée de cinq casseroles françaises — 12, 14, 16, 18 et 20 cm — d’une épaisseur de cuivre d’environ 1,5 mm. La plus grande casserole porte une marque <strong>L. Lecellier / Cuivralec / Villedieu</strong> ; les autres pièces portent des indications de taille. Plusieurs conservent leurs étiquettes de papier d’origine.',
  guideLecellierS9P2: 'La marque rattache l’ensemble à Villedieu-les-Poêles, la cité normande du cuivre évoquée plus haut, et « Cuivralec » est présenté sur l’étiquette comme une marque déposée. Au-delà de cela, nous restons volontairement brefs : nous n’avons pas encore consulté de source documentaire sur l’histoire de la maison ni sur sa période de production, et nous n’en proposons donc aucune.',
  guideLecellierObj4SetCaption: 'Série graduée de casseroles L. Lecellier Cuivralec de 12 à 20 cm.',
  guideLecellierObj4MarkCaption: 'Marque L. Lecellier / Cuivralec / Villedieu sur la plus grande casserole de la série.',
  guideLecellierObj4LabelCaption: 'Étiquette de papier Cuivralec d’origine conservée dans une casserole L. Lecellier, Villedieu-les-Poêles.',
  guideLecellierObj4DetailCaption: 'Détail de fabrication des casseroles L. Lecellier Cuivralec — cuivre d’environ 1,5 mm.',
  guideLecellierObj4LabelHeading: 'Pourquoi une étiquette d’origine compte',
  guideLecellierObj4LabelText: 'Une étiquette de papier conservée peut énoncer ce que le métal ne dit pas. Une marque frappée donne un nom ; une étiquette peut donner la gamme, le métier auquel les pièces étaient destinées, une revendication de marque déposée et, surtout, une indication sur leur finition. Les étiquettes sont aussi fragiles — lavées, frottées, ou simplement usées — de sorte qu’une série qui en conserve plusieurs préserve des indices qui disparaissent d’ordinaire les premiers.',
  guideLecellierObj4NoteText: 'Parce qu’elles sont imprimées et non frappées, les étiquettes décrivent la manière dont un produit était vendu. C’est un indice de nature différente de la fabrication de l’objet, et les deux méritent d’être consignés séparément.',
  guideLecellierObj4SetHeading: 'Une série graduée de cinq casseroles',
  guideLecellierObj4SetText: 'Les cinq tailles vont de 12 à 20 cm, pour une épaisseur de cuivre d’environ 1,5 mm — épaisseur plus fine que celle de la sauteuse Dehillerin, et une gamme de tailles qui s’explique comme une progression de travail plutôt que comme une présentation décorative. Nous parlons d’une série graduée de cinq casseroles, et non d’un service complet de cinq pièces : savoir si cinq correspondait à la configuration commerciale d’origine est une question qu’un catalogue d’époque pourrait trancher, et tant que ce n’est pas le cas, revendiquer une série complète dépasserait ce que nous savons.',
  guideLecellierObj4DatingHeading: 'Datation de la série Cuivralec',
  guideLecellierObj4DatingText: 'Aucune date de production n’est attribuée à ces casseroles. Les indices matériels sont la marque L. Lecellier / Cuivralec / Villedieu, les indications de taille, le cuivre d’environ 1,5 mm et les étiquettes conservées avec leurs mentions « marque déposée » et « sans étamage ». Un enregistrement de marque fournirait un point de repère documenté pour la marque, et un catalogue ou une publicité d’époque en fournirait un pour la gamme ; ni l’un ni l’autre n’a été consulté à ce stade. Jusque-là, la série est décrite par ses marques et ses mesures seules.',

  // ── « Sans étamage » ──
  guideLecellierS10Heading: '« Sans étamage »',
  guideLecellierS10P1: 'La mention la plus intéressante des étiquettes Cuivralec est « sans étamage ». Transcrite intégralement, l’étiquette porte :',
  guideLecellierLabelTitle: 'Étiquette d’origine, transcription',
  guideLecellierLabelText: 'Cuivres · Articles Grande Cuisine · Cuivralec · Marque Déposée · Sans Étamage · L. Lecellier – Villedieu',
  guideLecellierLabelNote: 'Transcrit d’après les étiquettes de papier d’origine conservées sur la série. La formulation est citée exactement telle qu’imprimée.',
  guideLecellierS10P2: 'L’étamage étant l’application d’une couche d’étain, « sans étamage » signifie littéralement « sans étain ». Lue simplement, l’étiquette nous apprend que ces casseroles ont été vendues sans le revêtement d’étain traditionnel, et que cela était présenté à l’acheteur comme une caractéristique du produit et non comme un manque. Pour un ensemble de cuivres « articles grande cuisine », c’est une indication réellement informative : la finition intérieure était destinée à être autre chose que de l’étain, et le réétamage ne faisait pas partie de l’entretien attendu.',
  guideLecellierS10Note: 'Ce que l’étiquette ne dit pas, c’est de quelle matière l’intérieur est fait. Nous ne l’identifions pas ici. Des affirmations publiées existent au sujet des revêtements de cuivre français non étamés, mais nous n’en avons vérifié aucune auprès d’un document de fabricant, d’un catalogue d’époque ou d’une analyse en laboratoire de ces pièces — et une affirmation non vérifiée sur une surface de cuisson est précisément le genre d’information qu’il ne faut pas deviner.',

  // ── « Made in France » n’est pas un fabricant ──
  guideCopperS11Heading: '« Made in France » n’est pas un fabricant',
  guideCopperS11P1: 'Une mention « Made in France » est une information de pays d’origine. Elle confirme où un objet a été fabriqué et elle est réellement utile — elle distingue la production française de la grande quantité de cuivre culinaire fabriqué ailleurs — mais elle ne nomme aucun atelier. Sur la <a href="mauviel-vintage-copper-cookware.html">pièce Mauviel de nos archives</a>, les deux figurent ensemble, le nom du fabricant et la mention de pays remplissant des fonctions différentes ; sur bien des pièces françaises conservées, seule la mention de pays est présente.',
  guideCopperS11P2: 'Ces pièces sont parfaitement collectionnables. Elles sont simplement non attribuées, et doivent être décrites comme telles : cuivre français, fabricant non identifié, avec toutes les mesures et détails de fabrication que l’on peut relever. C’est une description honnête, et elle laisse la place à une attribution ultérieure si un document apparaît.',
  guideCopperS11Note: 'Nous n’attribuons pas un cuivre français non signé à Mauviel, L. Lecellier, Gaillard ou tout autre fabricant sur la base d’une ressemblance visuelle. Les formes, les modèles de queues et les dispositions de rivets étaient partagés dans le métier et répétés sur de longues périodes ; la ressemblance est une raison de rechercher, non une raison d’attribuer.',

  // ── État, patine et restauration ──
  guideCopperS12Heading: 'État, patine et restauration',
  guideCopperS12P1: 'Le cuivre évolue sans cesse. Exposé à l’air, il se fonce, et développe au fil des décennies une patine allant du brun chaud au presque noir, parfois accompagnée d’une oxydation verte là où l’humidité a stagné. Les queues en fer se piquent légèrement et foncent. L’étain se ternit et s’use aux points de contact les plus sollicités. Une pièce sortie d’une cuisine professionnelle porte des rayures d’ustensiles sur le fond, des traces de chaleur et souvent de petits chocs — le relevé du travail accompli.',
  guideCopperS12P2: 'Tout cela peut être poli, et une pièce de cuivre brillante photographie bien. Mais le polissage est abrasif : il enlève du métal, adoucit les contours des marques frappées et peut effacer complètement les marquages peu profonds. Un nettoyage agressif de l’intérieur peut de même supprimer ce qui subsiste d’un revêtement d’origine. Les indices dont dépend un collectionneur sont minces — souvent quelques dixièmes de millimètre de profondeur — et ils ne reviennent pas.',
  guideCopperS12P3: 'Cook & Collect préfère donc préserver les surfaces historiquement informatives plutôt que de rendre automatiquement à une pièce un aspect neuf. Nous nettoyons avec mesure, nous laissons intacts les marques, les étiquettes et les revêtements d’origine, et lorsqu’une pièce a été réétamée ou reprise, nous le disons. Un acheteur qui souhaite un poli miroir peut toujours l’obtenir ; une marque effacée ou une étiquette décollée, non.',

  // ── Méthodologie ──
  guideCopperS13Heading: 'Comment Cook & Collect recherche le cuivre français',
  guideCopperS13P1: 'Notre méthode suit un seul sens : indices matériels d’abord, puis mesures, puis fabrication, puis marques et étiquettes, puis comparaison avec des exemplaires documentés, puis sources de fabricants et institutionnelles, puis catalogues et publicités d’époque — et seulement ensuite une attribution prudente. Travailler dans cet ordre place l’interprétation en aval de l’observation, là où elle doit être.',
  guideCopperS13P2: 'Cela suppose aussi de distinguer les natures d’indices à mesure. Ce qui est matériellement présent sur l’objet, ce qui est documenté par une source publiée ou archivistique, ce qui constitue une attribution que nous proposons, et ce qui relève de la comparaison avec une autre pièce conservée sont quatre choses différentes, et nous nous efforçons d’indiquer dans nos descriptions sur laquelle nous nous appuyons.',
  guideCopperS13Principle: 'Une date attachée à un autre exemplaire conservé est un point de départ, non une conclusion.',
  guideCopperS13P3: 'Lorsque les indices ne soutiennent qu’une période large, nous donnons la période large. Lorsqu’ils n’en soutiennent aucune, nous le disons également — comme pour la sauteuse Dehillerin et la série Cuivralec ci-dessus. Pour une annonce, cette retenue peut ressembler à une occasion manquée. Pour une collection destinée à inspirer confiance, c’est précisément l’essentiel.',

  // ── Recherches & références (uniquement les sources réellement consultées) ──
  guideCopperRefHeading: 'Recherches & références',
  guideCopperRefIntro: 'Nos recherches associent les indices matériels relevés sur chaque objet aux histoires officielles des fabricants, aux sources muséales et institutionnelles et — lorsque nous parvenons à les localiser — aux catalogues et publicités d’époque. Les sources ci-dessous sont celles réellement consultées pour ce guide. Lorsque nous n’avons pas encore consulté de source, nous le disons plutôt que d’en citer une vraisemblable.',
  guideDehillerinRefDehillerinLabel: 'E. Dehillerin',
  guideDehillerinRefDehillerinText: 'L’histoire publiée par la maison, utilisée ici pour les origines aux Halles, les acquisitions des années 1880 (dont un atelier d’étamage et l’ancienne boutique ouverte en 1820), l’installation rue Coquillière en 1890 et les ateliers de chaudronnerie et d’étamage de la maison en activité jusque dans les années 1960 :',
  guideDehillerinRefDehillerinLink1Text: 'E. Dehillerin — « Des origines » (histoire officielle de la maison)',
  guideDehillerinRefDehillerinLink1Url: 'https://www.edehillerin.fr/fr/module/ph_simpleblog/module-ph_simpleblog-single?rewrite=des-origines&amp;sb_category=un-peu-d-histoire',
  guideMauvielRefMauvielLabel: 'Mauviel',
  guideMauvielRefMauvielText: 'L’histoire et la chronologie datée publiées par l’entreprise, utilisées ici pour la fondation en 1830 par Ernest Mauviel à Villedieu-les-Poêles, la continuité familiale sur sept générations, la fabrication toujours normande, l’unité de production de 1965, la ligne de cuivre bilaminé de 1989 (90 % cuivre / 10 % inox) et l’inox multicouches de 1995 :',
  guideMauvielRefMauvielLink1Text: 'Mauviel1830 — « La maison Mauviel1830 » (histoire officielle de l’entreprise)',
  guideMauvielRefMauvielLink1Url: 'https://www.mauviel-1830.com/fr/content/18-la-maison-mauviel1830',
  guideCopperRefVilledieuLabel: 'Villedieu-les-Poêles',
  guideCopperRefVilledieuText: 'Pour le patrimoine cuivrier de la ville, nous nous appuyons sur son musée municipal, la Maison du Patrimoine Sourdin, dont les espaces permanents traitent de l’activité du cuivre aux côtés de la dentelle, du meuble normand et des créations contemporaines en cuivre et laiton des ateliers locaux. Référencé au Réseau des musées de Normandie :',
  guideCopperRefVilledieuLink1Text: 'Réseau des musées de Normandie — Maison du Patrimoine Sourdin, Villedieu-les-Poêles',
  guideCopperRefVilledieuLink1Url: 'https://www.musees-normandie.fr/musees-normandie/maison-du-patrimoine-sourdin/',
  guideCopperRefVilledieuLink2Text: 'Maison du Patrimoine Sourdin — site du musée',
  guideCopperRefVilledieuLink2Url: 'https://mps.villedieu-les-poeles.fr/',
  // Les sources propres à chaque fabricant sont citées sur le guide dont elles
  // étayent les affirmations.
  guideCopperRefMakersLabel: 'Sources propres aux fabricants',
  guideCopperRefMakersText: 'Les références relatives à chaque fabricant ou maison sont listées sur le guide dont elles étayent les affirmations, afin que chaque énoncé côtoie sa source : <a href="e-dehillerin-copper-cookware.html">E. Dehillerin</a>, <a href="mauviel-vintage-copper-cookware.html">Mauviel</a> et <a href="lecellier-cuivralec.html">L. Lecellier / Cuivralec</a>. Lorsque la recherche reste ouverte — comme pour Cuivralec et pour le confiturier — ces guides le disent plutôt que de proposer une source que nous n’avons pas consultée.',
  guideLecellierRefLecellierLabel: 'L. Lecellier / Cuivralec',
  guideLecellierRefLecellierText: 'Recherche en cours. Nos indices à ce stade sont entièrement matériels : la marque L. Lecellier / Cuivralec / Villedieu sur la plus grande casserole, les indications de taille sur les autres, et les étiquettes d’origine conservées avec leurs mentions « marque déposée » et « sans étamage ». Nous n’avons consulté aucune source de fabricant, d’archives ou de musée sur l’histoire de la maison ni sur sa période de production, et nous n’avons pas vérifié l’enregistrement de la marque ; les archives historiques des marques de l’INPI constituent la piste que nous entendons suivre. Nous préférons ne citer ici aucune source plutôt que de renvoyer à des annonces de places de marché.',
  guideMauvielRefConfiturierLabel: 'Le confiturier',
  guideMauvielRefConfiturierText: 'Recherche en cours. Ses marques, ses mesures et sa fabrication sont encore en cours de relevé, et aucune source documentaire n’a été consultée à son sujet. Aucune relation entre les noms qu’il porte n’est affirmée dans ce guide.',

  // ── Clôture ──
  guideCopperS14Heading: 'Collectionner le cuivre français vintage aujourd’hui',
  guideCopperS14P1: 'Le cuivre français reste l’un des domaines les plus gratifiants pour un collectionneur, en partie parce qu’il en subsiste beaucoup et en partie parce qu’il peut encore servir. Les pièces professionnelles lourdes et les séries domestiques plus légères occupent les deux extrémités d’une même tradition, et toutes deux se lisent — marques, épaisseur, queues, rivets, revêtement et usure racontent chacun une part de l’histoire. La discipline qui fait la différence consiste à accepter de laisser non écrites les parties de cette histoire qui ne sont pas encore documentées.',
  guideCopperS14P2: 'Ce guide constitue le point de départ de nos recherches sur le cuivre français. Les fabricants et maisons présentés plus haut disposent chacun de leur propre guide, où objets, marques et mesures sont examinés en détail, et ces pages s’enrichiront au fil des recherches.',
  guideCopperS14ChampagneLinkText: 'Lire notre guide du collectionneur consacré aux seaux à champagne français vintage',
  guideCopperS14AboutLinkText: 'Découvrir comment Cook & Collect sélectionne et documente ses pièces',
  guideCopperS14CtaText: 'Découvrir notre sélection de cuivres français.',

  // ══════════════════════════════════════════════════════════════════════
  // Guide n°3 : cuivre E. Dehillerin (guide spécialisé)
  // Préfixe : guideDehillerin… — les clés déplacées proviennent telles quelles
  // du guide pilier lors de la scission du sujet.
  // ══════════════════════════════════════════════════════════════════════
  guideDehillerinDocTitle: 'Cuivre E. Dehillerin : marques, fabrication et datation | Cook & Collect',
  guideDehillerinMetaDesc: 'Comment lire le cuivre E. Dehillerin : la marque E. DEHILLERIN / PARIS, le cuivre étamé de forte épaisseur, les queues en fer, les rivets et les limites de la datation, à travers une sauteuse de 29 cm examinée par Cook & Collect.',
  guideDehillerinOgTitle: 'Cuivre E. Dehillerin : marques, fabrication et datation',
  guideDehillerinOgDesc: 'Un guide du collectionneur consacré au cuivre E. Dehillerin, construit autour d’une lourde sauteuse en cuivre étamé de 29 cm issue des archives Cook & Collect.',
  guideDehillerinBreadcrumbGuides: 'Guides',
  guideDehillerinBreadcrumbCurrent: 'Cuivre E. Dehillerin',
  guideDehillerinEyebrow: 'E. Dehillerin · Guide du collectionneur',
  guideDehillerinH1: 'Cuivre E. Dehillerin : marques, fabrication et datation',
  guideDehillerinIntro: 'Une marque « E. DEHILLERIN / PARIS » est l’une des inscriptions les plus reconnaissables que l’on puisse trouver sur du cuivre français, et l’une des plus souvent surinterprétées. Ce guide expose ce que la marque établit, ce qu’elle n’établit pas, et comment lire le reste de la pièce — épaisseur, poids, queue, rivets et revêtement — à côté d’elle. Il s’appuie sur une lourde sauteuse en cuivre étamé mesurée et pesée par Cook & Collect, et s’inscrit dans notre guide plus large consacré aux <a href="vintage-french-copper-cookware.html">ustensiles de cuisine français en cuivre vintage</a>.',
  guideDehillerinNoteLabel: 'Note du collectionneur',
  guideDehillerinResearchLabel: 'Recherche en cours',

  guideDehillerinRetailerHeading: 'Vendue par, ou fabriquée par ?',
  guideDehillerinRetailerP1: 'Parce que la maison a à la fois approvisionné et produit, la description la plus sûre d’une pièce marquée est qu’elle a été vendue par E. Dehillerin. Cette formulation est exacte dans tous les cas : l’objet est parvenu à une cuisine par l’intermédiaire de la maison. Affirmer qu’elle a été fabriquée par E. Dehillerin est une affirmation plus forte, qui exige un appui — une attribution d’atelier documentée, une entrée de catalogue d’époque, une facture — et non la seule marque.',
  guideDehillerinRetailerP2: 'Cette distinction n’est pas un excès de prudence. Les fournisseurs professionnels parisiens vendaient des ustensiles provenant de plusieurs ateliers, et le nom d’une maison apposé sur un objet nous indique qui en répondait commercialement. Nos archives contiennent un objet qui l’illustre matériellement : un confiturier portant à la fois des références Mauviel et E. Dehillerin, que nous examinons dans le <a href="mauviel-vintage-copper-cookware.html">guide du cuivre Mauviel vintage</a>.',
  guideDehillerinRetailerNote: 'Nous décrivons les pièces portant cette marque comme « vendues par E. Dehillerin » tant que la documentation n’étaye pas une attribution de fabrication. Lorsqu’une pièce a manifestement été réalisée dans les ateliers de la maison, nous le disons et citons la preuve.',

  guideDehillerinObjectHeading: 'Étude de cas : une sauteuse en cuivre étamé de 29 cm',
  guideDehillerinObjectP1: 'Cette sauteuse est la pièce de cuivre la plus lourde que nous ayons manipulée, et elle instruit précisément parce que tout y est mesurable. Les chiffres ci-dessous ont été relevés par nous ; rien n’y est déduit.',
  guideDehillerinConditionHeading: 'État, revêtement et restauration du cuivre professionnel',
  guideDehillerinConditionP1: 'Les pièces de cette catégorie ont été achetées pour travailler, et leurs surfaces en portent le relevé : rayures d’ustensiles sur le fond, coloration de chauffe sur les parois, légère oxydation de la queue en fer, et un étain aminci ou usé là où le contact était le plus fort. L’étain a toujours été un consommable — l’histoire de la maison mentionne des ateliers d’étamage en activité en interne jusque dans les années 1960 — de sorte que le réétamage périodique relève de la vie normale d’une telle pièce et non de sa restauration.',
  guideDehillerinConditionP2: 'Nous décrivons ce qui est présent et renonçons à l’améliorer. Un polissage agressif arrondit les contours d’une marque frappée et peut effacer complètement des frappes de rivets peu profondes, ce qui, sur une pièce comme celle-ci, supprimerait l’indice le plus instructif qu’elle porte. Lorsqu’un revêtement a manifestement été refait, nous le disons plutôt que de présenter un intérieur brillant comme une surface d’origine.',
  guideDehillerinDatingLimitsHeading: 'Ce qui peut — et ne peut pas — dater une pièce Dehillerin',
  guideDehillerinDatingLimitsP1: 'La maison exerce depuis le XIXe siècle, s’est installée rue Coquillière en 1890 et a exploité ses propres ateliers jusque dans les années 1960. Cela délimite une longue période, et presque toutes les caractéristiques matérielles d’une lourde pièce professionnelle — cuivre épais, queue en fer, gros rivets, intérieur étamé — ont été produites sur l’essentiel de cette durée. Aucune d’elles ne resserre la période à elle seule, et en combiner plusieurs ne renforce pas le raisonnement si chacune est individuellement peu informative.',
  guideDehillerinDatingLimitsP2: 'Ce qui la resserrerait est documentaire : un catalogue daté montrant le modèle et l’épaisseur, une publicité, une facture, un document institutionnel, ou une pièce dont la commande est documentée. Tant qu’une telle source n’est pas localisée pour un objet donné, nous le décrivons par ses marques et ses mesures et laissons la date ouverte.',
  guideDehillerinDatingStatus: 'Date de fabrication : non établie pour cette sauteuse. Elle est décrite par sa marque et ses mesures tant qu’une source documentaire n’a pas été localisée.',
  guideDehillerinBackHeading: 'Où cela s’inscrit dans nos recherches sur le cuivre français',
  guideDehillerinBackP1: 'Lire la marque Dehillerin n’est qu’une partie d’une méthode plus large — marques, dimensions, poids, épaisseur, queues, rivets, revêtement, fond, usure et restauration, examinés dans cet ordre et maintenus distincts de l’interprétation. Cette méthode, ainsi que l’histoire générale du cuivre français, sont exposées dans notre guide pilier.',
  guideDehillerinBackCta: 'Lire le guide principal du cuivre culinaire français vintage',
  guideDehillerinCtaText: 'Découvrir notre sélection de cuivres français.',
  guideDehillerinCardEyebrow: 'E. Dehillerin',
  guideDehillerinCardTitle: 'Cuivre E. Dehillerin',
  guideDehillerinCardSummary: 'Lire la marque E. DEHILLERIN / PARIS, le cuivre étamé de forte épaisseur, les queues en fer et les rivets — et comprendre pourquoi la marque ne date pas la pièce — à travers une sauteuse de 29 cm de nos archives.',
  guideDehillerinCardImageAlt: 'Sauteuse en cuivre étamé de forte épaisseur E. Dehillerin, archives Cook & Collect',
  guideDehillerinRefIntro: 'Les sources ci-dessous sont celles réellement consultées pour ce guide. Les indices matériels relevés sur l’objet viennent en premier ; les sources documentaires sont citées lorsqu’elles existent, et les lacunes sont énoncées plutôt que comblées.',
  guideDehillerinRefHeading: 'Recherches & références',

  // ══════════════════════════════════════════════════════════════════════
  // Guide n°4 : cuivre Mauviel vintage (guide spécialisé)
  // Préfixe : guideMauviel… — emplacement principal de l’étude de cas du
  // confiturier Mauviel / E. Dehillerin.
  // ══════════════════════════════════════════════════════════════════════
  guideMauvielDocTitle: 'Cuivre Mauviel vintage : marques, fabrication et identification | Cook & Collect',
  guideMauvielMetaDesc: 'Identifier le cuivre Mauviel vintage : marques Mauviel et Made in France, histoire de Villedieu-les-Poêles, fabrication et question du fabricant face à la maison de vente, à travers des pièces des archives Cook & Collect.',
  guideMauvielOgTitle: 'Cuivre Mauviel vintage : marques, fabrication et identification',
  guideMauvielOgDesc: 'Un guide du collectionneur consacré au cuivre Mauviel vintage, de l’histoire de Villedieu-les-Poêles à la lecture des marques — dont un confiturier portant aussi des références E. Dehillerin.',
  guideMauvielBreadcrumbGuides: 'Guides',
  guideMauvielBreadcrumbCurrent: 'Cuivre Mauviel vintage',
  guideMauvielEyebrow: 'Mauviel · Guide du collectionneur',
  guideMauvielH1: 'Cuivre Mauviel vintage : marques, fabrication et identification',
  guideMauvielIntro: 'Mauviel est le mieux documenté des ateliers de cuivre de Villedieu-les-Poêles, ce qui rend une marque Mauviel particulièrement informative — et particulièrement tentante à surinterpréter. Ce guide examine ce que la marque établit, ce que l’histoire documentée de l’entreprise permet ou non de déduire, et comment un second nom sur le même objet change la question. Il s’appuie sur des pièces précédemment sélectionnées et examinées par Cook & Collect, et s’inscrit dans notre guide plus large consacré aux <a href="vintage-french-copper-cookware.html">ustensiles de cuisine français en cuivre vintage</a>.',
  guideMauvielNoteLabel: 'Note du collectionneur',
  guideMauvielResearchLabel: 'Recherche en cours',
  guideMauvielArchiveNote: 'Les objets présentés dans ce guide sont passés entre nos mains et sont consignés ici à titre de recherche, non comme stock. Ils ne sont plus disponibles.',

  guideMauvielMarkHeading: 'Lire une marque Mauviel',
  guideMauvielMarkP1: 'Une marque Mauviel nomme le fabricant. C’est davantage que ce qu’offre la plupart du cuivre français, et il vaut la peine de préciser jusqu’où cela nous mène : pas à une date, pas à une épaisseur, pas à une spécification de revêtement, pas à une gamme. Ce sont des questions distinctes, auxquelles répondent la mesure et la documentation, non la présence d’un nom.',
  guideMauvielMarkP2: 'Nous photographions les marques de près et les transcrivons exactement telles qu’elles apparaissent, en précisant leur emplacement sur l’objet et si elles sont frappées, gravées ou imprimées. Lorsqu’une marque voisine d’une mention de pays d’origine, nous consignons les deux comme des informations distinctes.',
  guideMauvielMifHeading: '« Made in France » sur une pièce Mauviel',
  guideMauvielMifP1: 'Sur la pièce de nos archives, une mention « Made in France » figure aux côtés du nom du fabricant. Les deux ne font pas le même travail : l’une identifie qui a fabriqué l’objet, l’autre où il l’a été. Aucune n’est une date. Les pratiques de marquage du pays d’origine ont évolué dans le temps et selon les marchés d’exportation, et c’est un domaine où nous voudrions des preuves documentaires avant d’en tirer une conclusion chronologique — nous n’en tirons donc aucune.',
  guideMauvielMifNote: 'Une mention de pays d’origine n’est pas une marque de datation. Nous n’avons pas établi de chronologie des marques Mauviel, et nous n’utilisons pas la présence ou la formulation d’un « Made in France » pour situer une pièce dans une période.',
  guideMauvielConstructionHeading: 'Fabrication : ce que nous pouvons dire, et ce que nous mesurons',
  guideMauvielConstructionP1: 'Le cuivre Mauviel a été produit dans une large gamme d’épaisseurs, de formes et de revêtements, et la chronologie publiée par l’entreprise montre ce vocabulaire de matières évoluer : cuivre bilaminé avec inox à partir de 1989, inox multicouches pour l’induction à partir de 1995. Cette séquence documentée n’est utile que dans un sens : une construction introduite par l’entreprise à une date donnée ne peut appartenir à une période antérieure. La réciproque est fausse, et elle ne dit rien de la place, au sein d’une longue période, d’une pièce ordinaire en cuivre étamé.',
  guideMauvielConstructionP2: 'Pour les pièces de nos archives, nous consignons donc ce que nous pouvons mesurer — forme, dimensions, matière et fixation de la queue, disposition des rivets, état de l’intérieur — et nous n’indiquons ni épaisseur de cuivre, ni spécification de revêtement, ni gamme, sauf si l’objet a été mesuré ou si un document l’étaye.',
  guideMauvielDatingHeading: 'Datation du cuivre Mauviel vintage',
  guideMauvielDatingP1: 'Il n’existe pas de raccourci. L’histoire documentée de l’entreprise fournit des points d’ancrage solides pour certaines constructions et pour la poursuite de la fabrication à Villedieu-les-Poêles, mais une « chronologie des marques » simplifiée, du genre souvent diffusé pour les ustensiles de collection, exigerait des preuves primaires que nous n’avons pas vues : catalogues datés, publicités datées, ou documents d’archives liant des formes de marques précises à des années précises.',
  guideMauvielDatingP2: 'Notre pratique consiste à décrire une pièce Mauviel par son fabricant, ses indices matériels et, lorsque les indices le permettent, une période large — et sinon à consigner la date comme non établie. Une date attachée à un autre exemplaire conservé est un point de départ, non une conclusion.',
  guideMauvielConfituHeading: 'Étude de cas : un confiturier portant des références Mauviel et E. Dehillerin',
  guideMauvielConfituP1: 'Un confiturier — la large bassine peu profonde utilisée pour les confitures — sélectionné par Cook & Collect porte des références à la fois à Mauviel et à E. Dehillerin. Deux noms sur un même objet constituent la situation la plus intéressante du cuivre français, et aussi celle que l’on tranche le plus vite.',
  guideMauvielConfituP2: 'Les hypothèses ne sont pas équivalentes, et l’objet seul ne choisit pas entre elles : une pièce fabriquée par une maison et vendue par l’autre ; une pièce réalisée pour la gamme propre d’un fournisseur ; l’ajout tardif d’une marque de maison ; ou un arrangement dont nous n’avons aucune trace. Établir laquelle s’applique exige une documentation — catalogue, facture, document commercial — et nous n’en avons localisé aucune.',
  guideMauvielConfituResearchText: 'Aucune conclusion n’est tirée au sujet de cet objet. Nous n’affirmons aucun arrangement de fabrication, de fourniture, de licence ou d’exclusivité entre les deux maisons, et nous ne considérons pas que les deux marques établissent une date de production ou une provenance. Ses marques, ses mesures et sa fabrication sont encore en cours de relevé, et cette section ne sera révisée que lorsqu’un document étayera un énoncé. Elle est volontairement vide d’histoire plutôt que remplie d’un récit vraisemblable.',
  guideMauvielConfituP3: 'Sur la manière de lire le nom Dehillerin lui-même — maison de vente, producteur, ou les deux — voir <a href="e-dehillerin-copper-cookware.html">notre guide du cuivre E. Dehillerin</a>.',
  guideMauvielBackHeading: 'Où cela s’inscrit dans nos recherches sur le cuivre français',
  guideMauvielBackP1: 'Les marques ne sont qu’une couche d’indices. Épaisseur, poids, queues, rivets, revêtement, usure et restauration y contribuent tous, et l’ordre dans lequel on les lit est ce qui garde une identification honnête. Cette méthode, ainsi que l’histoire du commerce du cuivre français et de Villedieu-les-Poêles, sont exposées dans notre guide pilier.',
  guideMauvielBackCta: 'Lire le guide principal du cuivre culinaire français vintage',
  guideMauvielCtaText: 'Découvrir notre sélection de cuivres français.',
  guideMauvielCardEyebrow: 'Mauviel',
  guideMauvielCardTitle: 'Cuivre Mauviel vintage',
  guideMauvielCardSummary: 'Histoire de Villedieu-les-Poêles, lecture des marques Mauviel et Made in France, fabrication et limites de la datation — dont un confiturier portant aussi des références E. Dehillerin.',
  guideMauvielCardImageAlt: 'Cuivre Mauviel vintage issu des archives Cook & Collect',
  guideMauvielRefIntro: 'Les sources ci-dessous sont celles réellement consultées pour ce guide. L’histoire publiée par l’entreprise est utilisée pour les dates documentées et présentée comme telle ; là où les indices s’arrêtent, le guide s’arrête.',
  guideMauvielRefHeading: 'Recherches & références',

  // ══════════════════════════════════════════════════════════════════════
  // Guide n°5 : L. Lecellier & Cuivralec (guide spécialisé)
  // Préfixe : guideLecellier… — les étiquettes d’origine sont l’indice clé.
  // Aucune période de production n’est établie ; ne pas ajouter de dates.
  // ══════════════════════════════════════════════════════════════════════
  guideLecellierDocTitle: 'L. Lecellier & Cuivralec : guide du collectionneur | Cook & Collect',
  guideLecellierMetaDesc: 'Le cuivre L. Lecellier et la marque Cuivralec de Villedieu-les-Poêles : marques de fabricant, étiquettes d’origine conservées, « sans étamage », fabrication et limites de datation, à travers une série graduée de cinq casseroles.',
  guideLecellierOgTitle: 'L. Lecellier & Cuivralec : guide du collectionneur',
  guideLecellierOgDesc: 'Lire le cuivre L. Lecellier et l’étiquette Cuivralec — dont la mention « sans étamage » — à travers une série graduée de cinq casseroles examinée par Cook & Collect.',
  guideLecellierBreadcrumbGuides: 'Guides',
  guideLecellierBreadcrumbCurrent: 'L. Lecellier & Cuivralec',
  guideLecellierEyebrow: 'L. Lecellier & Cuivralec · Guide du collectionneur',
  guideLecellierH1: 'L. Lecellier & Cuivralec : guide du collectionneur',
  guideLecellierIntro: 'La plupart des cuivres français vintage parviennent au collectionneur dépouillés de tout papier, et c’est pourquoi la série graduée de cinq casseroles de nos archives mérite un guide à part : plusieurs pièces conservent leurs étiquettes Cuivralec d’origine, et ces étiquettes énoncent ce que le métal ne dit pas. Ce guide expose les indices matériels relevés sur la série, lit l’étiquette intégralement, et énonce clairement qu’aucune période de production n’a encore été établie. Il s’inscrit dans notre guide plus large consacré aux <a href="vintage-french-copper-cookware.html">ustensiles de cuisine français en cuivre vintage</a>.',
  guideLecellierNoteLabel: 'Note du collectionneur',
  guideLecellierResearchLabel: 'Recherche en cours',
  guideLecellierMarksHeading: 'Quelles pièces sont marquées',
  guideLecellierMarksP1: 'Seule la plus grande casserole, celle de 20 cm, porte la marque de fabricant <strong>L. Lecellier / Cuivralec / Villedieu</strong>. Les quatre autres portent des indications de taille et non un nom de fabricant. Cette répartition mérite d’être énoncée précisément, car une série est vite décrite comme « entièrement marquée » dès qu’une pièce l’est : les quatre casseroles plus petites sont rattachées à la même gamme par la pièce marquée, les étiquettes conservées et leur fabrication commune — ce qui constitue une attribution, non une marque.',
  guideLecellierMarksNote: 'Une pièce sur cinq porte la marque du fabricant. Les autres sont rattachées à la gamme sur la base de la casserole marquée, des étiquettes d’origine et d’une fabrication identique, et nous les décrivons ainsi plutôt que de laisser entendre cinq marques de fabricant.',
  guideLecellierEvidenceHeading: 'Indices matériels et attribution historique',
  guideLecellierDatingStatus: 'Période de production : non établie. Nous n’avons consulté ni catalogue d’époque, ni publicité, ni enregistrement de marque pour Cuivralec, et nous ne proposons pas de date en leur absence.',
  guideLecellierEvidenceP1: 'Il vaut la peine de séparer clairement les deux. Les indices matériels sont ici solides et vérifiables : la marque sur la casserole de 20 cm, les indications de taille sur les autres, une épaisseur de cuivre d’environ 1,5 mm, la fabrication, et les étiquettes imprimées conservées. L’attribution historique — qui était L. Lecellier, quand la gamme Cuivralec a été fabriquée et vendue, comment elle se positionnait dans le métier — repose sur une documentation que nous n’avons pas encore consultée.',
  guideLecellierEvidenceP2: 'Les deux ont leur place dans une description, clairement distinguées. Une série peut être précisément documentée comme objet et rester non datée comme produit, et le dire est plus utile au collectionneur qu’une période affirmée qu’aucune source n’étaye.',
  guideLecellierBackHeading: 'Où cela s’inscrit dans nos recherches sur le cuivre français',
  guideLecellierBackP1: 'Épaisseur, queues, rivets, revêtements et usure se lisent de la même manière sur une casserole de Villedieu que sur une sauteuse parisienne, et l’histoire plus large du commerce du cuivre français — dont Villedieu-les-Poêles elle-même — est exposée dans notre guide pilier.',
  guideLecellierBackCta: 'Lire le guide principal du cuivre culinaire français vintage',
  guideLecellierCtaText: 'Découvrir notre sélection de cuivres français.',
  guideLecellierCardEyebrow: 'L. Lecellier & Cuivralec',
  guideLecellierCardTitle: 'L. Lecellier & Cuivralec',
  guideLecellierCardSummary: 'La marque Cuivralec de Villedieu-les-Poêles, les étiquettes de papier d’origine conservées, la mention « sans étamage » et des limites de datation assumées — à travers une série graduée de cinq casseroles.',
  guideLecellierCardImageAlt: 'Série graduée de cinq casseroles en cuivre L. Lecellier Cuivralec de Villedieu-les-Poêles',
  guideLecellierRefIntro: 'L’indice principal de ce guide est l’objet lui-même : sa marque, ses indications de taille et ses étiquettes d’origine conservées. La recherche documentaire reste ouverte, et l’entrée ci-dessous le dit plutôt que de citer une source que nous n’avons pas consultée.',
  guideLecellierRefHeading: 'Recherches & références',

  // about page
  aboutDocTitle: 'À propos — Cook & Collect',
  aboutMetaDesc: 'Cook & Collect — des pièces vintage françaises qui ont une histoire à raconter.',
  aboutTitle: 'À propos',
  aboutP1: 'Cook & Collect est né d’une passion pour les ustensiles de cuisine français vintage et les objets intemporels qui allient savoir-faire, design et histoire.',
  aboutP2: 'Nous sélectionnons avec soin des pièces vintage de caractère, avec un intérêt particulier pour les grandes maisons françaises telles que Le Creuset, Cousances, Staub, Fontignac, ainsi que d’autres fabricants qui ont marqué le patrimoine culinaire français.',
  aboutP3: 'Chaque pièce est sélectionnée individuellement et présentée avec des photographies détaillées ainsi qu’une description fidèle de son état. En tant qu’objets vintage, nos articles peuvent porter les traces de leur histoire et de leurs utilisations passées — c’est aussi ce qui rend chaque pièce unique.',
  aboutP4: 'Notre objectif est simple : donner une nouvelle vie à de beaux objets vintage et permettre aux collectionneurs et aux passionnés de découvrir des pièces qui méritent d’être préservées. Donner une nouvelle vie aux objets vintage, c’est aussi préserver leur histoire tout en favorisant une approche plus responsable de la consommation.',
  aboutTagline: 'Cook & Collect — Des pièces vintage françaises qui ont une histoire à raconter.',
  // shipping page
  shippingDocTitle: 'Informations de livraison — Cook & Collect',
  shippingMetaDesc: 'Coûts de livraison approximatifs pour notre collection vintage',
  shippingTitle: 'Informations de livraison',
  shippingSubtitle: 'Nous expédions dans le monde entier ! Voici les coûts approximatifs pour un colis de 7 kg (typique pour une cocotte)',
  shippingSubtitleHidden: 'Nous expédions dans le monde entier !',
  shipContactMessage: 'Les frais de livraison dépendent de la destination et de l’article, et sont à la charge de l’acheteur. Contactez-nous avec votre adresse de livraison et le ou les articles qui vous intéressent, et nous vous enverrons un devis de livraison exact.',
  shipEuropeTitle: 'Europe',
  shipEurope1Label: 'France, Pays-Bas, Belgique',
  shipEurope2Label: 'Reste de l’UE',
  shipEurope3Label: 'Reste de l’Europe',
  shipUSTitle: 'États-Unis',
  shipUS1Label: 'Standard (2-3 semaines)',
  shipUS1Price: 'à partir de 65€',
  shipUS2Label: 'Express (1-2 semaines)',
  shipUS2Price: 'à partir de 80€',
  shipAUTitle: 'Australie',
  shipAU1Label: 'Standard (3-4 semaines)',
  shipAU1Price: 'à partir de 75€',
  shipAU2Label: 'Express (1-2 semaines)',
  shipAU2Price: 'à partir de 95€',
  shipNoteTitle: 'Remarque :',
  shipNote1: 'Ces prix sont des estimations approximatives pour un colis type de 7 kg.',
  shipNote2: 'Les coûts réels peuvent être inférieurs pour les articles plus légers ou une livraison en point relais.',
  shipNote3: 'Plusieurs options de livraison vous seront proposées, et vous avez également la possibilité de fournir votre propre étiquette d’expédition.',
  shipNote4: 'Pour un devis de livraison exact, veuillez nous contacter avec votre adresse de livraison.',
  shipCtaHeading: 'Besoin d’un devis précis ?',
  shipCtaText: 'Contactez-nous avec votre adresse de livraison et le ou les articles qui vous intéressent, et nous vous fournirons un coût de livraison précis.',
  // item page
  itemDocTitle: 'Article — Cook & Collect',
  lightboxClose: 'Fermer',
  lightboxPrev: 'Image précédente',
  lightboxNext: 'Image suivante',
  lightboxAlt: 'Vue en taille réelle',
  // sold page
  soldDocTitle: 'Articles vendus — Cook & Collect',
  soldMetaDesc: 'Articles précédemment vendus de notre collection vintage',
  soldTitle: 'Articles vendus',
  soldSubtitle: 'Un retour sur les trésors qui ont trouvé un nouveau foyer',
  navSold: 'Vendus',
  // legal page
  legalDocTitle: 'Mentions légales — Cook & Collect',
  legalMetaDesc: 'Mentions légales — Cook & Collect',
  legalTitle: 'Mentions légales',
  legalSubtitle: 'Informations légales relatives à l’éditeur du site',
  legalOwnerHeading: 'Propriétaire',
  legalIndividual: 'Entrepreneur individuel',
  legalTradeNameLabel: 'Nom commercial',
  legalSirenLabel: 'SIREN',
  legalRcsLabel: 'RCS Paris',
  legalAddressLabel: 'Adresse',
  legalEmailLabel: 'E-mail',
  legalPhoneLabel: 'Téléphone',
  legalHostHeading: 'Hébergeur du site',
  legalHostAddress: '88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, États-Unis',
  legalHostPhoneLabel: 'Téléphone'
};

module.exports = { en, fr };
