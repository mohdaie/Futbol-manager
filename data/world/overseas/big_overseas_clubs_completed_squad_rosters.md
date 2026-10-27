# Big Overseas Clubs: Completed 25-Man Squad Database (2026/27)

This file contains the 280 completed first-team squad slots (14 per club across 20 clubs) to complete each roster to 25 players at the start of the 2026/27 season.
It is the repaired version of the original draft: see the change log at the end.

### Standardized Database Schema
* **Registration Metadata:** `squad_no`, `eu_status` (EU / Non-EU), `hg_status` (HGC / HGN / Non-HG), `u21_elig` (Yes / No), `reg_status` (Registered / U21 Exempt).
* **Ability Ratings:** `ca` (Current Ability, 1–100 scale derived via position-weighted vector), `pa` (Potential Ability, 1–100 scale).
* **Attribute Order (1–20 scale, 26 Stats):** `fin, pas, dri, fir, cro, tck, mar, hea, vis, dec, pos, wor, cmp, ldr, pac, sta, str, agi, ref, han, one, kic, ant, otb, fla, tea`.
* **Names:** every `name_in_game` is fictional and unique across all overseas squads. `inspired_by` is the real-world archetype only.
* **EU status:** EU/EEA passports are EU. English, Scottish, Swiss, Turkish and other nationalities are Non-EU. Dual nationals are noted.
* **Zero Duplications:** no overlap with the Premier League master dataset and no repeated names.

---

## 1. La Liga

### Castilla CF (Real Madrid CF)
**Reputation:** 91 | **CA Band:** 75–84 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Castilla CF,13,Bohdan Marchenko,-,GK,-,27,UKR,Non-EU,Non-HG,No,Registered,81,83,Right,191,80,2,13,4,11,2,3,3,4,12,16,16,11,16,11,10,10,13,16,17,16,15,17,16,2,3,14,generated,inspiration already used elsewhere in the game
Castilla CF,25,Jesús Aguilera,Fran González,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,75,86,Right,199,89,2,10,3,9,2,3,3,5,10,15,14,10,14,9,11,10,15,15,16,15,15,15,14,2,2,13,sure,-
Castilla CF,23,Valentin Rousseau,-,DL,-,31,FRA,EU,Non-HG,No,Registered,81,81,Left,180,73,6,16,16,14,15,17,16,13,11,15,16,16,14,11,17,16,16,15,2,2,2,2,16,13,9,16,generated,inspiration already used elsewhere in the game
Castilla CF,22,Yannick Kessler,-,DC,-,33,GER,EU,Non-HG,No,Registered,84,84,Right,190,85,5,13,9,12,5,18,17,17,11,15,17,17,15,17,15,15,18,12,2,2,2,2,17,7,6,16,generated,capped by band; inspiration already used elsewhere in the game
Castilla CF,35,Gonzalo Camacho,-,DC,DR,23,ESP,EU,HGC,No,Registered,76,82,Right,184,77,4,13,9,12,6,15,15,15,11,16,15,15,15,11,16,14,15,12,2,2,2,2,15,6,5,15,generated,inspiration already used elsewhere in the game
Castilla CF,2,Nacho Maldonado,Dani Carvajal,DR,-,34,ESP,EU,HGC,No,Registered,83,83,Right,173,73,7,17,17,14,16,17,16,12,13,16,17,17,16,17,16,16,14,13,2,2,2,2,17,13,10,17,sure,-
Castilla CF,28,Nacho Negrete,-,DM,MC,21,ESP,EU,HGC,Yes,U21 Exempt,75,84,Right,190,82,5,14,10,12,5,16,15,14,15,14,16,14,14,10,11,16,15,11,2,2,2,2,15,7,6,15,generated,inspiration already used elsewhere in the game
Castilla CF,19,Álvaro Cano,Dani Ceballos,MC,AMC,29,ESP,EU,HGN,No,Registered,79,80,Right,179,70,10,17,15,16,11,14,11,7,16,16,12,15,15,11,11,15,11,14,2,2,2,2,15,14,15,16,sure,-
Castilla CF,31,Daniel Arjona,Mario Martín,MC,DM,22,ESP,EU,HGC,No,Registered,75,81,Right,177,72,7,16,12,13,8,15,14,10,14,14,14,16,15,11,13,16,13,13,2,2,2,2,15,15,8,16,sure,-
Castilla CF,5,Zak Pemberton,-,AMC,MC/ST,23,ENG,Non-EU,Non-HG,No,Registered,84,93,Right,186,75,16,16,16,16,12,14,12,15,18,18,13,18,17,15,16,18,16,17,2,2,2,2,17,18,16,17,generated,capped by band; inspiration already used elsewhere in the game
Castilla CF,21,Pedro Maldonado,Brahim Díaz,AML,AMR/AMC,26,ESP,EU,HGN,No,Registered,82,85,Either,171,68,15,15,17,16,16,6,5,6,16,14,8,15,16,10,17,14,10,17,2,2,2,2,14,15,17,14,sure,EU passport (dual national; was listed MAR)
Castilla CF,15,Salih Tekin,-,AMR,AMC,21,TUR,Non-EU,Non-HG,Yes,U21 Exempt,80,92,Left,175,69,14,17,16,17,18,6,5,5,17,14,7,13,17,9,15,13,9,16,2,2,2,2,14,14,18,14,generated,inspiration already used elsewhere in the game
Castilla CF,16,Roberto Conti,-,ST,AMR,20,ITA,EU,Non-HG,Yes,U21 Exempt,79,91,Left,173,70,17,11,15,14,6,5,4,15,10,15,6,15,14,9,17,14,15,15,2,2,2,2,15,17,13,13,generated,EU passport (dual national; was listed BRA); inspiration already used elsewhere in the game
Castilla CF,29,Jaime Calvo,-,ST,AML/AMR,22,ESP,EU,HGC,No,Registered,75,81,Right,182,76,16,11,15,14,8,5,4,15,10,15,6,15,14,10,14,14,15,13,2,2,2,2,14,16,10,14,generated,inspiration already used elsewhere in the game
```

### Blaugrana (FC Barcelona)
**Reputation:** 90 | **CA Band:** 71–80 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Blaugrana,1,Lukas Winkler,-,GK,-,34,GER,EU,Non-HG,No,Registered,80,80,Right,187,85,2,13,4,11,2,4,3,4,12,15,16,11,16,16,9,10,13,15,16,16,16,17,16,2,3,14,generated,capped by band; inspiration already used elsewhere in the game
Blaugrana,13,Enrique Montero,Iñaki Peña,GK,-,27,ESP,EU,HGC,No,Registered,75,76,Right,184,78,2,11,3,9,2,3,3,5,10,15,15,10,15,11,9,10,11,14,15,15,15,15,15,2,2,13,sure,-
Blaugrana,35,Miguel Fajardo,Gerard Martín,DL,DC,24,ESP,EU,HGC,No,Registered,75,78,Left,186,77,6,15,15,13,14,15,15,13,12,14,15,16,13,10,15,15,13,13,2,2,2,2,15,12,10,15,sure,-
Blaugrana,4,Víctor Peralta,-,DC,DR,27,URU,Non-EU,Non-HG,No,Registered,80,82,Right,188,81,5,12,9,12,6,17,16,16,10,15,16,16,14,15,15,15,17,13,2,2,2,2,16,7,6,16,generated,capped by band; inspiration already used elsewhere in the game
Blaugrana,24,Carlos Olmedo,Eric García,DC,DM/DR,25,ESP,EU,HGC,No,Registered,77,81,Right,182,76,5,15,11,14,7,16,16,13,14,17,16,14,16,12,16,14,13,13,2,2,2,2,15,8,8,16,sure,-
Blaugrana,32,Nacho Aguilera,Héctor Fort,DR,DL,19,ESP,EU,HGC,Yes,U21 Exempt,74,86,Right,185,76,6,15,15,13,14,15,14,11,12,13,14,16,13,9,15,15,12,14,2,2,2,2,15,12,11,15,sure,-
Blaugrana,28,Ismael Peláez,Marc Bernal,DM,MC,19,ESP,EU,HGC,Yes,U21 Exempt,74,88,Left,191,83,7,14,12,14,8,14,15,13,15,14,14,15,14,11,12,16,15,13,2,2,2,2,15,9,11,16,sure,-
Blaugrana,6,Ivo Toledo,Gavi,MC,AMC,21,ESP,EU,HGC,Yes,U21 Exempt,80,88,Right,173,70,11,16,15,15,10,16,13,10,15,15,14,18,16,14,15,17,13,15,2,2,2,2,16,16,13,17,sure,capped by band
Blaugrana,16,Mario Crespo,Fermin López,MC,AMC,23,ESP,EU,HGC,No,Registered,78,84,Right,174,69,13,17,14,15,11,16,11,10,14,14,13,17,16,10,15,16,13,15,2,2,2,2,15,15,13,16,sure,-
Blaugrana,20,Miguel Valdés,Dani Olmo,AMC,AML/MC,28,ESP,EU,HGC,No,Registered,80,80,Right,179,72,15,16,16,16,13,9,8,9,16,17,10,15,16,12,14,14,12,16,2,2,2,2,15,16,16,16,sure,capped by band
Blaugrana,7,Lucas Arjona,-,AML,AMR/ST,26,ESP,EU,HGN,No,Registered,78,81,Right,184,77,15,13,17,14,16,7,6,12,16,14,8,15,15,10,17,15,13,14,2,2,2,2,15,16,14,15,generated,inspiration already used elsewhere in the game
Blaugrana,30,Gonzalo Salcedo,Toni Fernández,AMR,AMC/ST,18,ESP,EU,HGC,Yes,U21 Exempt,71,85,Left,172,65,12,13,16,14,12,5,4,6,13,12,6,12,12,8,15,12,9,15,2,2,2,2,13,13,15,13,sure,-
Blaugrana,17,Paulo Rezende,Vitor Roque,ST,AML,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,77,85,Right,172,73,17,11,14,14,8,6,5,15,11,14,7,15,14,9,16,15,14,15,2,2,2,2,14,17,13,14,sure,-
Blaugrana,18,Cristian Cabrera,Pau Víctor,ST,AMR/AML,24,ESP,EU,HGN,No,Registered,75,79,Right,184,76,17,12,14,14,9,6,5,15,12,14,7,14,14,9,14,14,14,14,2,2,2,2,14,16,12,15,sure,-
```

### Colchoneros (Atlético de Madrid)
**Reputation:** 86 | **CA Band:** 69–78 | **Registration Rule:** Max 3 Non-EU players.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Colchoneros,1,Unai Gallardo,Juan Musso,GK,-,32,ESP,EU,Non-HG,No,Registered,76,76,Right,191,93,2,12,4,9,2,3,3,4,11,16,15,10,15,12,9,9,14,15,15,15,15,16,15,2,3,13,sure,EU passport (dual national; was listed ARG)
Colchoneros,13,Tomás Naranjo,Antonio Gomis,GK,-,23,ESP,EU,HGC,No,Registered,71,77,Right,187,80,2,10,3,9,2,3,3,4,10,15,14,10,14,10,9,9,12,14,14,14,14,15,14,2,2,12,sure,-
Colchoneros,23,João Zeca,-,DL,DC,32,MOZ,Non-EU,Non-HG,No,Registered,77,77,Left,180,75,5,12,12,13,12,17,17,15,10,14,16,17,14,12,16,17,16,14,2,2,2,2,16,11,7,16,generated,inspiration already used elsewhere in the game
Colchoneros,20,Maxime Van Acker,Axel Witsel,DC,DM,36,BEL,EU,Non-HG,No,Registered,75,75,Right,186,81,6,15,11,15,6,15,15,15,14,14,17,14,15,15,9,12,15,10,2,2,2,2,16,7,8,15,sure,-
Colchoneros,3,Gonzalo Cabrera,César Azpilicueta,DC,DR/DL,36,ESP,EU,HGN,No,Registered,75,75,Right,178,76,6,14,11,14,11,15,16,14,13,14,16,16,15,18,11,13,14,12,2,2,2,2,17,8,7,15,sure,-
Colchoneros,16,Vincenzo Conti,Nahuel Molina,DR,MR,28,ITA,EU,Non-HG,No,Registered,78,78,Right,175,70,10,14,15,14,16,14,14,11,13,14,14,17,13,11,18,18,13,16,2,2,2,2,15,15,13,16,sure,EU passport (dual national; was listed ARG); capped by band
Colchoneros,4,Tyler Bates,-,DM,MC,26,ENG,Non-EU,Non-HG,No,Registered,78,78,Right,182,74,11,14,13,14,10,15,14,12,13,15,14,19,14,13,15,19,15,14,2,2,2,2,15,14,10,18,generated,capped by band; inspiration already used elsewhere in the game
Colchoneros,5,Ben Walsh,Johnny Cardoso,DM,MC,24,USA,Non-EU,Non-HG,No,Registered,77,80,Right,186,79,8,14,12,14,8,16,15,14,14,15,15,16,15,11,13,16,15,13,2,2,2,2,16,10,9,16,sure,-
Colchoneros,11,Florian Fournier,Thomas Lemar,MC,AMC/AML,30,FRA,EU,Non-HG,No,Registered,75,75,Left,172,63,11,16,16,17,13,10,9,6,16,15,12,14,15,9,13,13,10,16,2,2,2,2,15,13,16,15,sure,-
Colchoneros,18,Thomas Wouters,Arthur Vermeeren,MC,DM,21,BEL,EU,Non-HG,Yes,U21 Exempt,76,83,Right,176,68,8,15,14,14,10,15,12,8,15,15,13,16,15,10,13,16,11,14,2,2,2,2,15,15,12,16,sure,-
Colchoneros,17,Diego Sanchís,Rodrigo Riquelme,AMC,AML/MC,26,ESP,EU,HGC,No,Registered,77,78,Right,174,68,13,15,16,15,13,8,7,7,16,17,9,15,16,9,15,15,11,16,2,2,2,2,15,16,15,15,sure,-
Colchoneros,12,Renato Loureiro,-,AML,ML/DL,26,POR,EU,Non-HG,No,Registered,78,78,Right,178,69,13,14,16,15,14,10,9,9,14,14,9,17,14,10,17,17,12,17,2,2,2,2,15,16,16,15,generated,EU passport (dual national; was listed BRA); capped by band; inspiration already used elsewhere in the game
Colchoneros,21,Raúl Ferrer,Carlos Martín,AMR,ST/AML,24,ESP,EU,HGC,No,Registered,75,77,Right,180,72,14,13,16,14,15,7,6,11,15,13,8,15,14,9,16,15,13,15,2,2,2,2,14,15,14,14,sure,-
Colchoneros,10,Nicola Gallo,Ángel Correa,ST,AMR/AMC,31,ITA,EU,Non-HG,No,Registered,77,77,Right,171,70,17,14,16,15,11,7,6,14,14,14,7,16,15,12,15,15,13,16,2,2,2,2,15,16,15,16,sure,EU passport (dual national; was listed ARG)
```

### Lions of Bilbao (Athletic Club)
**Reputation:** 81 | **CA Band:** 67–76 | **Registration Rule:** Basque-origin players only.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lions of Bilbao,13,Mikel Olaizola,Julen Agirrezabala,GK,-,25,ESP,EU,HGC,No,Registered,76,78,Right,187,82,2,11,4,10,2,3,3,4,10,15,15,10,15,11,9,9,13,14,16,15,15,15,15,2,3,13,sure,capped by band
Lions of Bilbao,1,Endika Arrieta,Alex Padilla,GK,-,22,ESP,EU,HGC,No,Registered,72,77,Right,190,83,2,10,3,9,2,3,3,4,9,15,14,10,14,9,9,9,12,14,15,14,14,15,14,2,2,12,sure,-
Lions of Bilbao,17,Ousmane Diallo,-,DL,ML,24,ESP,EU,HGC,No,Registered,74,76,Left,183,76,6,14,15,13,14,14,14,12,11,13,14,16,13,9,16,16,14,15,2,2,2,2,14,13,11,15,generated,inspiration already used elsewhere in the game
Lions of Bilbao,5,Egoitz Bilbao,Yeray Álvarez,DC,-,31,ESP,EU,HGC,No,Registered,76,76,Right,182,78,4,13,9,12,5,16,16,16,10,12,16,15,13,14,12,14,16,12,2,2,2,2,16,7,6,13,sure,capped by band
Lions of Bilbao,4,Eneko Landa,Aitor Paredes,DC,-,26,ESP,EU,HGC,No,Registered,76,76,Right,186,80,5,13,10,13,6,16,15,16,11,13,16,15,13,12,13,14,16,12,2,2,2,2,16,7,6,14,sure,capped by band
Lions of Bilbao,18,Oier Berasategi,Óscar de Marcos,DR,WBR/MR,36,ESP,EU,HGC,No,Registered,72,72,Right,182,76,8,14,14,14,14,14,14,11,13,14,15,17,14,17,12,14,12,13,2,2,2,2,15,14,11,18,sure,-
Lions of Bilbao,16,Beñat Aldekoa,Iñigo Ruiz de Galarreta,DM,MC,32,ESP,EU,HGC,No,Registered,75,75,Right,175,69,7,16,13,15,10,14,13,9,14,16,15,16,16,13,12,13,11,13,2,2,2,2,16,10,11,17,sure,-
Lions of Bilbao,24,Koldo Bilbao,Beñat Prados,MC,DM/DR,25,ESP,EU,HGC,No,Registered,76,76,Right,180,72,8,15,13,15,9,15,14,11,14,15,15,18,15,11,14,17,13,14,2,2,2,2,16,12,10,17,sure,capped by band
Lions of Bilbao,20,Kepa Iturralde,Unai Gómez,MC,AMC,23,ESP,EU,HGC,No,Registered,75,76,Left,183,75,12,14,14,14,11,16,12,12,14,14,13,18,15,10,14,17,15,13,2,2,2,2,15,15,12,16,sure,-
Lions of Bilbao,21,Egoitz Elorza,Ander Herrera,MC,DM,36,ESP,EU,HGC,No,Registered,72,72,Right,182,73,9,14,13,15,10,13,12,8,16,16,14,13,13,15,10,12,11,12,2,2,2,2,14,11,12,17,sure,-
Lions of Bilbao,7,Ibon Artola,Álex Berenguer,AML,AMR/ST,31,ESP,EU,HGN,No,Registered,75,75,Right,175,73,14,14,16,15,14,8,7,8,14,14,8,15,14,11,15,15,12,16,2,2,2,2,15,15,15,15,sure,-
Lions of Bilbao,11,Ousmane Diarra,Álvaro Djaló,AMR,AML/ST,26,ESP,EU,HGN,No,Registered,76,76,Right,175,70,14,13,16,15,12,6,5,8,12,13,7,14,13,9,17,15,12,17,2,2,2,2,14,15,16,14,sure,capped by band
Lions of Bilbao,12,Urko Landa,Asier Villalibre,ST,-,28,ESP,EU,HGC,No,Registered,74,74,Left,184,86,15,10,15,13,6,5,4,16,9,15,6,14,13,11,13,14,18,11,2,2,2,2,15,16,9,15,sure,-
Lions of Bilbao,19,Josu Garmendia,Javier Martón,ST,-,27,ESP,EU,HGN,No,Registered,73,73,Right,183,76,15,10,15,13,6,5,4,15,9,15,6,15,13,9,14,14,15,12,2,2,2,2,14,16,9,14,sure,-
```

### Yellow Submarine (Villarreal CF)
**Reputation:** 80 | **CA Band:** 66–75 | **Registration Rule:** Max 3 Non-EU players.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Yellow Submarine,13,César Medina,Diego Conde,GK,-,27,ESP,EU,HGN,No,Registered,74,75,Right,188,80,2,11,4,10,2,3,3,4,11,14,15,10,15,11,9,9,12,14,15,15,15,14,15,2,3,13,sure,-
Yellow Submarine,1,Víctor Tapia,Iker Álvarez,GK,-,24,ESP,EU,HGC,No,Registered,72,74,Right,190,83,2,10,3,9,2,3,3,4,9,15,14,10,14,9,9,9,12,14,15,14,14,15,14,2,2,12,sure,-
Yellow Submarine,24,Yeray Camacho,Alfonso Pedraza,DL,ML/AML,30,ESP,EU,HGC,No,Registered,75,75,Left,184,73,9,16,16,14,15,14,13,11,13,13,13,16,13,11,16,16,13,15,2,2,2,2,16,15,13,16,sure,capped by band
Yellow Submarine,3,Jaime Naranjo,Raúl Albiol,DC,-,36,ESP,EU,HGN,No,Registered,71,71,Right,190,82,4,12,8,12,4,14,14,16,10,14,14,12,14,18,8,10,15,9,2,2,2,2,16,6,5,15,sure,-
Yellow Submarine,2,Francisco Bento,Logan Costa,DC,-,25,CPV,Non-EU,Non-HG,No,Registered,75,75,Right,190,86,4,11,9,11,5,15,16,16,9,12,16,14,12,11,12,14,17,11,2,2,2,2,15,6,5,13,sure,capped by band
Yellow Submarine,17,Leandro Sanchís,Kiko Femenía,DR,WBR,35,ESP,EU,HGN,No,Registered,72,72,Right,176,65,6,15,15,13,14,14,14,10,11,13,14,16,13,12,14,14,11,13,2,2,2,2,15,13,11,15,sure,-
Yellow Submarine,14,Dídac Camacho,Ramón Terrats,DM,MC,25,ESP,EU,HGC,No,Registered,74,75,Left,180,72,7,15,13,14,9,15,14,11,14,15,15,16,14,10,13,13,13,13,2,2,2,2,15,10,10,16,sure,-
Yellow Submarine,18,Marc Robles,Gerard Gumbau,MC,DM,31,ESP,EU,HGN,No,Registered,73,73,Left,188,77,8,15,12,14,10,14,13,12,14,14,14,15,14,11,11,14,15,11,2,2,2,2,15,14,10,16,sure,-
Yellow Submarine,6,Lucas Cano,Denis Suárez,MC,AMC/AML,32,ESP,EU,HGN,No,Registered,74,74,Right,176,72,11,16,16,16,12,12,8,6,16,14,11,13,15,10,12,13,10,15,2,2,2,2,14,13,16,15,sure,-
Yellow Submarine,16,David Ibáñez,Álex Baena,AMC,AML/MC,25,ESP,EU,HGC,No,Registered,75,75,Right,174,70,14,16,16,16,14,9,8,7,15,13,10,16,14,11,14,15,11,14,2,2,2,2,15,14,16,16,sure,capped by band
Yellow Submarine,22,Ismael Lara,Ayoze Pérez,AML,ST/AMC,33,ESP,EU,HGN,No,Registered,75,75,Right,178,72,15,14,16,15,15,7,6,11,14,14,8,15,15,11,14,14,12,15,2,2,2,2,15,16,14,15,sure,capped by band
Yellow Submarine,11,Hicham Benali,Ilias Akhomach,AMR,AML,22,MAR,Non-EU,HGN,No,Registered,74,75,Left,175,68,12,13,17,15,12,6,5,5,12,12,6,13,12,8,16,13,9,17,2,2,2,2,13,13,17,13,sure,-
Yellow Submarine,7,Jorge Izquierdo,Gerard Moreno,ST,AMR/AMC,34,ESP,EU,HGC,No,Registered,75,75,Left,180,77,16,15,15,16,11,6,5,13,15,15,7,14,16,14,12,13,13,14,2,2,2,2,16,16,15,16,sure,capped by band
Yellow Submarine,19,Lamine Sylla,Nicolas Pépé,ST,AMR,31,CIV,Non-EU,Non-HG,No,Registered,75,75,Left,183,73,15,13,16,15,11,5,4,14,13,13,6,12,14,10,16,13,14,16,2,2,2,2,14,16,16,13,sure,capped by band
```

## 2. Serie A

### Nerazzurri (FC Internazionale Milano)
**Reputation:** 88 | **CA Band:** 71–80 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Nerazzurri,13,Sergio Alcázar,Josep Martínez,GK,-,28,ESP,EU,Non-HG,No,Registered,78,78,Right,191,80,2,13,5,11,2,4,3,4,12,16,15,10,16,11,10,10,12,16,16,15,15,16,15,2,3,13,sure,-
Nerazzurri,12,Luca Moretti,Raffaele Di Gennaro,GK,-,32,ITA,EU,HGC,No,Registered,72,72,Right,187,82,2,10,3,9,2,3,3,4,9,15,14,10,14,10,8,9,12,14,15,14,14,15,14,2,2,12,sure,-
Nerazzurri,30,Felipe Xavier,Carlos Augusto,DL,DC/ML,27,BRA,Non-EU,Non-HG,No,Registered,80,80,Left,184,78,9,15,15,15,16,15,15,13,13,14,15,18,14,11,17,18,15,15,2,2,2,2,15,15,12,16,sure,capped by band
Nerazzurri,15,Giacomo Villa,Francesco Acerbi,DC,-,36,ITA,EU,HGN,No,Registered,76,76,Left,192,88,4,14,8,12,4,15,15,17,11,13,16,13,14,16,9,11,17,9,2,2,2,2,17,6,5,14,sure,-
Nerazzurri,36,Francesco Barone,Matteo Darmian,DR,DL/DC,36,ITA,EU,HGN,No,Registered,75,75,Right,183,70,7,14,13,14,13,16,16,13,12,16,17,17,15,14,13,14,13,13,2,2,2,2,17,12,8,17,sure,-
Nerazzurri,2,Bram Van den Heuvel,-,DR,MR/AMR,30,NED,EU,Non-HG,No,Registered,79,79,Right,188,80,11,14,14,14,15,15,14,16,12,13,14,18,13,13,18,19,17,14,2,2,2,2,15,16,11,16,generated,inspiration already used elsewhere in the game
Nerazzurri,21,Valon Mehmeti,Kristjan Asllani,DM,MC,24,ALB,Non-EU,HGN,No,Registered,79,80,Right,175,69,8,16,14,15,11,16,15,9,16,16,15,15,15,10,13,16,16,14,2,2,2,2,16,10,12,16,sure,-
Nerazzurri,7,Kamil Lewandowicz,Piotr Zieliński,MC,AMC,32,POL,EU,HGN,No,Registered,78,78,Either,180,76,12,17,16,17,12,11,10,8,17,16,12,14,15,11,13,14,11,15,2,2,2,2,15,14,16,16,sure,-
Nerazzurri,16,Leonardo Bellini,Davide Frattesi,AMC,MC,26,ITA,EU,HGN,No,Registered,80,80,Right,178,74,15,16,16,15,11,12,11,11,17,17,12,18,16,11,16,18,14,16,2,2,2,2,15,17,15,17,sure,capped by band
Nerazzurri,14,Giacomo Fontana,-,AML,AMR/ST,28,ITA,EU,HGN,No,Registered,80,80,Right,175,70,15,14,17,16,14,7,6,8,14,14,8,16,14,11,17,15,13,17,2,2,2,2,14,16,16,15,generated,capped by band; inspiration already used elsewhere in the game
Nerazzurri,45,Héctor Rivero,Valentín Carboni,AML,AMC,21,ARG,Non-EU,HGC,Yes,U21 Exempt,77,85,Left,185,75,13,15,16,16,16,6,5,10,16,13,7,14,15,8,16,14,13,15,2,2,2,2,13,14,16,14,sure,-
Nerazzurri,11,Joaquín Acosta,Joaquín Correa,AMR,AML/ST,31,ARG,Non-EU,Non-HG,No,Registered,75,75,Right,188,77,14,14,16,16,13,5,4,9,14,13,7,12,14,10,15,13,13,15,2,2,2,2,14,15,15,14,sure,-
Nerazzurri,47,Mathis Blanchet,Issiaka Kamate,AMR,WBR,21,FRA,EU,HGC,Yes,U21 Exempt,73,80,Left,186,75,13,13,15,14,15,8,7,9,15,12,7,14,15,7,16,14,13,15,2,2,2,2,13,13,14,14,sure,-
Nerazzurri,8,Marcel Schober,Marko Arnautović,ST,-,36,AUT,EU,HGN,No,Registered,74,74,Right,192,83,15,14,16,15,9,5,4,16,13,15,6,12,15,13,11,12,16,11,2,2,2,2,15,15,14,14,sure,-
```

### Old Lady (Juventus FC)
**Reputation:** 86 | **CA Band:** 69–78 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Old Lady,29,Michele Rossetti,-,GK,-,28,ITA,EU,HGN,No,Registered,78,78,Right,187,82,2,14,4,12,2,4,3,4,13,15,16,11,15,12,10,10,13,15,16,16,16,15,15,2,3,14,generated,capped by band; inspiration already used elsewhere in the game
Old Lady,1,Leonardo Bianco,Mattia Perin,GK,-,33,ITA,EU,HGN,No,Registered,77,77,Right,188,77,2,11,4,10,2,3,3,4,10,16,15,10,15,12,9,10,12,15,16,15,15,16,15,2,2,13,sure,-
Old Lady,32,Leandro Maidana,Juan David Cabal,DL,DC,25,COL,Non-EU,Non-HG,No,Registered,77,78,Left,186,79,5,15,16,13,14,16,15,15,11,14,15,16,13,10,16,16,16,13,2,2,2,2,15,11,8,15,sure,-
Old Lady,40,Viktor Strömberg,Jonas Rouhi,DL,ML,22,SWE,EU,HGC,No,Registered,72,78,Left,183,76,5,13,13,13,14,14,14,11,11,13,14,15,13,8,16,16,13,14,2,2,2,2,14,12,10,15,sure,-
Old Lady,33,Cláudio Valente,Tiago Djaló,DC,DR/DL,26,POR,EU,Non-HG,No,Registered,76,78,Right,190,83,4,13,10,12,6,15,16,16,10,13,16,14,13,10,13,15,16,13,2,2,2,2,16,7,6,14,sure,-
Old Lady,37,Andrea Serra,-,DR,DC,23,ITA,EU,HGC,No,Registered,75,81,Right,192,84,5,14,15,13,12,16,15,15,11,14,15,16,14,9,15,16,16,13,2,2,2,2,15,11,8,16,generated,inspiration already used elsewhere in the game
Old Lady,22,Ryan Maddox,Timothy Weah,DR,WBR/AMR,26,USA,Non-EU,Non-HG,No,Registered,77,78,Right,183,76,11,16,16,14,15,14,13,10,12,13,13,16,13,10,18,18,13,16,2,2,2,2,16,15,13,15,sure,-
Old Lady,26,Matheus Cavalcanti,Douglas Luiz,DM,MC,28,BRA,Non-EU,Non-HG,No,Registered,78,78,Right,177,75,11,16,15,16,12,15,14,10,16,15,15,16,16,11,13,16,14,14,2,2,2,2,16,12,14,17,sure,capped by band
Old Lady,21,Nicolò Costa,Nicolò Fagioli,MC,DM/AMC,25,ITA,EU,HGC,No,Registered,77,81,Right,178,70,9,17,16,17,12,12,11,8,17,16,13,13,13,10,13,13,11,15,2,2,2,2,14,13,16,17,sure,-
Old Lady,8,Daan Franken,Teun Koopmeiners,AMC,MC/DM,28,NED,EU,Non-HG,No,Registered,78,78,Left,184,77,15,16,14,16,13,13,12,12,16,17,12,17,17,13,13,17,15,17,2,2,2,2,16,17,13,17,sure,capped by band
Old Lady,10,Berkay Acar,Kenan Yıldız,AML,AMC/ST,21,TUR,Non-EU,HGC,Yes,U21 Exempt,78,87,Right,185,76,14,15,17,16,12,6,5,9,13,14,7,15,14,10,16,14,12,17,2,2,2,2,14,15,18,14,sure,capped by band
Old Lady,7,Eduardo Vilaça,-,AMR,AML,23,POR,EU,Non-HG,No,Registered,77,83,Left,170,64,12,14,17,16,11,6,5,5,11,13,6,15,12,8,17,14,9,19,2,2,2,2,13,14,18,13,generated,inspiration already used elsewhere in the game
Old Lady,11,Miguel Zabaleta,Nicolás González,AMR,AML/ST,28,ARG,Non-EU,Non-HG,No,Registered,78,78,Left,180,72,14,14,17,15,16,10,9,16,16,14,9,17,16,12,16,17,14,15,2,2,2,2,15,16,14,16,sure,capped by band
Old Lady,14,Jakub Wójcik,Arkadiusz Milik,ST,-,32,POL,EU,Non-HG,No,Registered,76,76,Left,186,78,16,13,16,15,8,5,4,16,12,15,6,12,15,11,11,12,16,11,2,2,2,2,16,16,12,14,sure,-
```

### Partenopei (SSC Napoli)
**Reputation:** 85 | **CA Band:** 68–77 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Partenopei,12,Edoardo Gentile,Elia Caprile,GK,-,24,ITA,EU,HGN,No,Registered,76,77,Right,191,84,2,11,4,10,2,3,3,4,10,15,15,10,15,11,9,9,13,14,16,15,15,15,15,2,3,13,sure,-
Partenopei,14,Gianluca Farina,Nikita Contini,GK,-,30,ITA,EU,HGC,No,Registered,71,71,Right,190,82,2,10,3,9,2,3,3,4,9,15,14,10,14,9,8,9,12,14,14,14,14,15,14,2,2,12,sure,-
Partenopei,37,Giovanni Silvestri,Leonardo Spinazzola,DL,WBL/ML,33,ITA,EU,HGN,No,Registered,76,76,Right,186,75,9,16,16,15,15,15,14,10,13,13,14,17,14,11,16,14,12,16,2,2,2,2,16,15,14,16,sure,-
Partenopei,5,Thiago Sampaio,Juan Jesus,DC,DL,35,BRA,Non-EU,Non-HG,No,Registered,73,73,Left,185,83,4,12,8,12,5,15,15,15,9,13,15,14,14,14,11,12,16,11,2,2,2,2,15,6,5,14,sure,-
Partenopei,16,Martín Rebollo,Rafa Marín,DC,-,24,ESP,EU,Non-HG,No,Registered,76,77,Right,191,85,4,13,9,12,5,16,15,16,10,13,16,14,13,11,13,14,17,11,2,2,2,2,15,6,5,14,sure,-
Partenopei,30,Samuele Costa,Pasquale Mazzocchi,DR,DL/WBR,30,ITA,EU,HGN,No,Registered,75,75,Right,183,76,7,14,14,13,14,14,14,11,11,13,14,18,13,11,16,17,14,15,2,2,2,2,14,13,11,16,sure,-
Partenopei,6,Elliot Cameron,Billy Gilmour,DM,MC,25,SCO,Non-EU,Non-HG,No,Registered,77,77,Right,170,64,7,17,15,16,11,14,13,7,16,16,15,16,16,11,13,16,10,16,2,2,2,2,16,11,13,17,sure,capped by band
Partenopei,90,Edoardo Ferrara,Michael Folorunsho,MC,AMC/DM,28,ITA,EU,HGN,No,Registered,76,76,Right,187,83,12,15,13,14,10,16,13,14,13,14,13,18,16,12,15,18,17,13,2,2,2,2,15,15,11,16,sure,-
Partenopei,70,Simone Messina,Gianluca Gaetano,MC,AMC,26,ITA,EU,HGC,No,Registered,75,76,Right,183,75,11,16,14,15,11,15,10,9,15,14,12,15,15,10,13,15,12,14,2,2,2,2,14,14,13,15,sure,-
Partenopei,81,Stefano De Luca,Giacomo Raspadori,AMC,ST/AML,26,ITA,EU,HGN,No,Registered,77,77,Either,172,69,15,15,16,16,12,6,5,8,15,14,8,16,15,10,15,15,11,17,2,2,2,2,15,16,15,16,sure,capped by band
Partenopei,23,Valerio Ferrara,Alessio Zerbin,AML,WBL/ML,27,ITA,EU,HGC,No,Registered,73,73,Right,182,75,13,13,16,14,16,10,9,9,16,13,8,16,15,9,15,16,13,14,2,2,2,2,13,14,13,15,sure,-
Partenopei,7,Yuri Guimarães,David Neres,AMR,AML,29,BRA,Non-EU,Non-HG,No,Registered,77,77,Left,175,69,14,14,17,16,11,6,5,6,12,13,7,13,12,9,16,13,10,18,2,2,2,2,14,14,18,13,sure,capped by band
Partenopei,18,Lucas Aguirre,Giovanni Simeone,ST,-,31,ARG,Non-EU,Non-HG,No,Registered,75,75,Right,180,81,15,11,15,13,7,7,6,16,10,15,7,18,14,12,14,17,15,13,2,2,2,2,15,17,10,16,sure,-
Partenopei,26,Xander Maes,Cyril Ngonge,ST,AMR,26,BEL,EU,Non-HG,No,Registered,75,76,Left,181,74,16,13,15,14,12,6,5,15,13,14,7,14,13,9,16,14,14,15,2,2,2,2,14,16,14,14,sure,-
```

### Lombardia AC (AC Milan)
**Reputation:** 84 | **CA Band:** 72–81 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lombardia AC,57,Salvatore Sala,Marco Sportiello,GK,-,34,ITA,EU,HGN,No,Registered,76,76,Right,192,87,2,12,4,10,2,3,3,4,11,15,15,10,15,12,9,10,13,14,16,15,15,15,15,2,3,13,sure,-
Lombardia AC,96,Andrea Villa,-,GK,-,21,ITA,EU,HGC,Yes,U21 Exempt,73,83,Right,197,88,2,11,3,9,2,3,3,5,10,15,14,10,15,9,9,9,13,15,15,14,14,15,14,2,2,12,generated,inspiration already used elsewhere in the game
Lombardia AC,42,Alessandro Testa,-,DL,DR/DM,23,ITA,EU,HGN,No,Registered,76,80,Right,186,76,7,13,14,13,13,15,15,12,12,14,15,17,13,10,16,17,14,14,2,2,2,2,15,12,10,16,generated,inspiration already used elsewhere in the game
Lombardia AC,31,Tin Simić,-,DC,DL,25,SRB,Non-EU,Non-HG,No,Registered,79,81,Left,194,88,5,12,9,11,5,16,16,18,9,13,16,16,13,13,13,15,19,11,2,2,2,2,16,6,5,13,generated,inspiration already used elsewhere in the game
Lombardia AC,28,Noah Engel,-,DC,-,24,GER,EU,Non-HG,No,Registered,78,81,Right,194,89,4,14,10,13,6,16,16,17,11,13,16,14,14,11,13,14,17,12,2,2,2,2,16,7,6,14,generated,inspiration already used elsewhere in the game
Lombardia AC,22,Eduardo Rocha,-,DR,WBR,27,BRA,Non-EU,Non-HG,No,Registered,78,78,Right,181,79,7,15,15,13,14,16,15,13,11,14,15,17,13,11,16,17,15,14,2,2,2,2,15,12,11,16,generated,inspiration already used elsewhere in the game
Lombardia AC,29,Jason Baudry,Youssouf Fofana,DM,MC,27,FRA,EU,Non-HG,No,Registered,80,81,Right,185,79,9,15,14,15,10,16,15,13,14,16,16,18,15,12,15,15,15,14,2,2,2,2,17,11,11,17,sure,-
Lombardia AC,14,Luuk Jacobs,Tijjani Reijnders,MC,AMC/DM,27,NED,EU,Non-HG,No,Registered,81,81,Right,185,73,12,17,16,17,12,13,12,9,17,16,13,16,16,11,15,16,13,16,2,2,2,2,16,15,15,17,sure,capped by band
Lombardia AC,80,Freddie Keller,-,MC,MR/DM,23,USA,Non-EU,Non-HG,No,Registered,77,81,Right,178,75,8,15,16,15,11,16,13,9,14,14,13,18,16,10,17,18,15,16,2,2,2,2,15,15,14,16,generated,inspiration already used elsewhere in the game
Lombardia AC,8,Josh Pemberton,-,AMC,MC/DM,30,ENG,Non-EU,Non-HG,No,Registered,78,78,Right,191,88,14,15,16,16,11,12,11,14,16,17,11,14,17,11,14,14,18,16,2,2,2,2,15,16,14,16,generated,inspiration already used elsewhere in the game
Lombardia AC,17,Patrick Jäger,-,AML,ST,26,SUI,Non-EU,Non-HG,No,Registered,77,79,Right,185,85,15,13,16,15,12,6,5,11,13,13,7,14,13,9,18,14,15,16,2,2,2,2,14,16,15,14,generated,inspiration already used elsewhere in the game
Lombardia AC,21,Taiwo Eze,-,AMR,AML,27,NGA,Non-EU,Non-HG,No,Registered,78,78,Left,172,70,13,13,17,15,11,5,4,5,12,12,6,13,12,8,18,13,10,19,2,2,2,2,13,14,18,12,generated,inspiration already used elsewhere in the game
Lombardia AC,7,Aitor Ferrer,Álvaro Morata,ST,-,33,ESP,EU,Non-HG,No,Registered,79,79,Right,190,84,16,14,13,15,9,6,5,17,13,14,7,17,15,16,15,15,15,14,2,2,2,2,16,18,12,17,sure,-
Lombardia AC,9,Dino Janković,Luka Jović,ST,-,28,SRB,Non-EU,Non-HG,No,Registered,77,78,Right,182,78,17,11,16,14,6,5,4,16,11,15,6,14,14,10,14,14,16,13,2,2,2,2,15,16,11,14,sure,-
```

### La Dea (Atalanta BC)
**Reputation:** 82 | **CA Band:** 67–76 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
La Dea,28,Vítor Leite,Rui Patrício,GK,-,37,POR,EU,Non-HG,No,Registered,73,73,Left,190,84,2,11,3,9,2,3,3,4,9,14,15,9,15,15,7,8,12,13,15,15,14,13,15,2,2,13,sure,-
La Dea,31,Leonardo Barone,Francesco Rossi,GK,-,35,ITA,EU,HGC,No,Registered,68,68,Right,187,81,2,9,3,8,2,3,3,4,8,13,13,9,13,10,7,8,11,13,15,13,13,14,13,2,2,12,sure,-
La Dea,22,Leonardo Villa,-,DL,ML/WBL,24,ITA,EU,HGC,No,Registered,76,76,Left,187,78,7,15,15,14,16,14,14,12,13,13,14,17,13,10,15,17,14,14,2,2,2,2,14,14,12,16,generated,capped by band; inspiration already used elsewhere in the game
La Dea,23,Tin Lazić,Sead Kolašinac,DL,DC,33,BIH,Non-EU,Non-HG,No,Registered,75,75,Left,183,82,6,14,15,12,11,16,16,14,10,14,15,17,14,14,14,16,18,12,2,2,2,2,15,11,7,17,sure,-
La Dea,5,Matty Turnbull,-,DC,DR/DL,28,ENG,Non-EU,Non-HG,No,Registered,75,75,Right,183,79,4,11,9,11,6,16,15,15,9,13,15,15,13,10,15,15,16,13,2,2,2,2,15,6,5,15,generated,inspiration already used elsewhere in the game
La Dea,77,Diego Leone,Davide Zappacosta,DR,DL/WBR,34,ITA,EU,HGN,No,Registered,74,74,Right,182,73,9,15,15,14,15,14,13,11,12,13,13,17,13,12,15,16,13,14,2,2,2,2,15,14,12,16,sure,-
La Dea,45,Valerio Santoro,-,DR,WBR/MR,21,ITA,EU,HGC,Yes,U21 Exempt,73,76,Right,185,77,6,15,15,13,13,14,14,11,11,13,13,16,12,8,16,16,13,14,2,2,2,2,14,12,11,15,generated,inspiration already used elsewhere in the game
La Dea,6,Kofi Frimpong,Ibrahim Sulemana,DM,MC,23,GHA,Non-EU,Non-HG,No,Registered,75,76,Right,180,75,6,13,12,13,7,16,15,12,11,14,15,18,13,10,14,16,15,13,2,2,2,2,15,9,8,16,sure,-
La Dea,44,Giacomo Rizzo,Marco Brescianini,MC,AMC/DM,26,ITA,EU,HGN,No,Registered,76,76,Left,188,78,12,16,13,14,11,16,13,13,13,14,13,17,15,11,14,17,15,13,2,2,2,2,15,15,11,16,sure,capped by band
La Dea,10,Josip Stojanović,Lazar Samardžić,AMC,MC,24,SRB,Non-EU,Non-HG,No,Registered,76,76,Left,184,79,14,16,16,16,13,8,7,7,16,13,9,13,13,9,14,13,12,14,2,2,2,2,14,14,17,15,sure,capped by band
La Dea,17,Michele De Angelis,Daniel Maldini,AML,AMC/ST,24,ITA,EU,HGN,No,Registered,74,76,Right,188,78,13,14,15,15,15,7,6,11,15,13,8,14,14,9,15,14,13,15,2,2,2,2,14,15,15,14,sure,-
La Dea,7,Martín Quiroga,Juan Cuadrado,AMR,WBR/DR,36,COL,Non-EU,Non-HG,No,Registered,73,73,Right,179,72,11,14,16,15,15,11,10,6,14,13,9,14,14,13,13,12,10,16,2,2,2,2,14,14,17,14,sure,-
La Dea,11,Paolo Rizzo,Nicolò Zaniolo,AMR,AMC/ST,27,ITA,EU,HGN,No,Registered,75,75,Left,190,86,14,13,16,14,16,9,8,14,15,12,8,15,15,10,16,14,17,14,2,2,2,2,14,15,14,13,sure,-
La Dea,9,Giacomo Bellini,Mateo Retegui,ST,-,27,ITA,EU,Non-HG,No,Registered,76,76,Right,186,81,16,11,13,14,7,7,6,17,10,13,7,17,14,12,14,16,16,13,2,2,2,2,15,17,10,16,sure,capped by band
```

## 3. Bundesliga

### Bavarians (FC Bayern München)
**Reputation:** 92 | **CA Band:** 73–82 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Bavarians,18,Roee Dahan,Daniel Peretz,GK,-,26,ISR,Non-EU,Non-HG,No,Registered,78,80,Right,190,86,2,12,4,10,2,3,3,4,11,15,15,10,15,11,9,10,13,15,16,16,16,15,15,2,3,13,sure,-
Bavarians,26,Maximilian Baumann,Sven Ulreich,GK,-,37,GER,EU,HGC,No,Registered,75,75,Right,192,87,2,10,3,9,2,3,3,4,9,15,15,10,15,13,8,9,13,14,15,15,15,15,15,2,2,13,sure,-
Bavarians,21,Taro Yamada,Hiroki Ito,DL,DC,27,JPN,Non-EU,Non-HG,No,Registered,80,81,Left,188,81,6,16,17,14,15,16,16,15,13,15,16,17,15,12,15,16,15,13,2,2,2,2,16,12,9,17,sure,-
Bavarians,3,Jun-ho Shin,Kim Min-jae,DC,-,29,KOR,Non-EU,Non-HG,No,Registered,82,82,Right,190,84,5,13,10,12,5,17,17,17,11,14,17,16,14,14,14,15,18,13,2,2,2,2,17,6,5,14,sure,capped by band
Bavarians,28,Tom Jäger,Tarek Buchmann,DC,-,21,GER,EU,HGC,Yes,U21 Exempt,75,83,Right,188,81,4,13,9,12,5,15,15,15,10,15,15,14,14,9,15,14,15,12,2,2,2,2,15,6,5,15,sure,-
Bavarians,23,Thomas Barbier,Sacha Boey,DR,WBR,25,FRA,EU,Non-HG,No,Registered,80,82,Right,178,74,6,14,14,13,14,16,16,12,11,14,15,18,13,11,18,18,14,16,2,2,2,2,15,13,12,16,sure,-
Bavarians,8,Benedikt Seidel,-,MC,DM/AMC,31,GER,EU,HGN,No,Registered,81,81,Right,189,82,14,16,14,16,11,17,14,16,15,15,14,17,17,14,15,17,17,13,2,2,2,2,16,16,12,17,generated,inspiration already used elsewhere in the game
Bavarians,16,Leandro Coelho,João Palhinha,MC,DM,31,POR,EU,Non-HG,No,Registered,81,81,Right,190,84,7,17,11,15,7,18,17,17,15,15,17,18,15,15,13,17,18,12,2,2,2,2,17,14,7,17,sure,-
Bavarians,32,Simon Brandt,Tom Bischof,MC,AMC,21,GER,EU,HGC,Yes,U21 Exempt,77,85,Left,176,68,11,16,15,16,12,14,10,7,16,15,12,14,15,9,13,15,10,15,2,2,2,2,15,14,15,16,sure,-
Bavarians,34,Jonas Friedrich,Noël Aséko Nkili,MC,DM,20,GER,EU,HGC,Yes,U21 Exempt,74,83,Right,177,72,7,15,13,14,9,15,13,10,14,14,13,16,14,9,14,15,13,14,2,2,2,2,15,14,10,16,sure,-
Bavarians,11,Antoine Lacroix,Kingsley Coman,AML,AMR,30,FRA,EU,Non-HG,No,Registered,82,82,Right,180,76,14,14,18,16,15,6,5,8,14,13,7,14,14,11,18,14,12,18,2,2,2,2,14,15,18,14,sure,capped by band
Bavarians,7,Dennis Brandt,Serge Gnabry,AMR,AML/ST,31,GER,EU,HGN,No,Registered,81,81,Right,175,77,16,14,17,16,17,7,6,10,16,14,8,14,16,11,16,14,14,16,2,2,2,2,15,16,15,14,sure,-
Bavarians,39,Axel Hamon,-,ST,AML/AMR,21,FRA,EU,Non-HG,Yes,U21 Exempt,78,88,Right,183,77,16,12,15,15,9,6,5,16,12,15,7,15,14,9,17,14,15,16,2,2,2,2,15,16,15,14,generated,inspiration already used elsewhere in the game
Bavarians,36,Brandon Maddox,Nestory Irankunda,ST,AMR/AML,20,AUS,Non-EU,Non-HG,Yes,U21 Exempt,74,85,Right,175,72,15,11,15,14,10,5,4,14,11,13,6,14,13,8,18,14,14,16,2,2,2,2,14,15,15,13,sure,-
```

### Rhein 04 (Bayer 04 Leverkusen)
**Reputation:** 85 | **CA Band:** 69–78 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Rhein 04,1,Marvin Weber,Jonas Omlin,GK,-,32,SUI,Non-EU,Non-HG,No,Registered,76,76,Right,190,84,2,11,4,10,2,3,3,4,10,15,15,10,15,13,9,10,13,14,16,15,15,15,15,2,3,13,sure,-
Rhein 04,36,Yannick Neumann,-,GK,-,32,GER,EU,HGC,No,Registered,69,69,Right,186,81,2,10,3,9,2,3,3,4,9,13,14,10,13,10,8,9,12,13,14,14,14,13,14,2,2,12,generated,inspiration already used elsewhere in the game
Rhein 04,20,David Rebollo,Álex Grimaldo,DL,WBL/ML,30,ESP,EU,Non-HG,No,Registered,78,78,Left,171,68,12,16,17,16,17,15,15,7,16,14,15,17,15,12,14,15,10,15,2,2,2,2,16,15,15,16,sure,capped by band
Rhein 04,13,Kauã Araújo,Arthur,DL,DR/WBL,23,BRA,Non-EU,Non-HG,No,Registered,75,80,Right,174,71,5,15,15,12,15,15,15,9,11,12,15,15,12,8,15,15,11,14,2,2,2,2,15,12,11,14,sure,-
Rhein 04,44,Enzo Gaillard,-,DC,DL,21,FRA,EU,Non-HG,Yes,U21 Exempt,76,82,Left,183,76,4,13,10,12,7,16,16,14,11,16,16,13,15,8,15,13,13,12,2,2,2,2,14,6,6,15,generated,inspiration already used elsewhere in the game
Rhein 04,30,Quinten Bakker,-,DR,AMR/WBR,25,NED,EU,Non-HG,No,Registered,78,78,Right,171,64,12,16,17,14,15,15,14,6,13,12,14,16,13,10,18,16,9,18,2,2,2,2,16,16,16,15,generated,capped by band; inspiration already used elsewhere in the game
Rhein 04,8,Fabian Friedrich,-,DM,MC/DC,31,GER,EU,HGN,No,Registered,77,77,Right,187,83,9,14,11,13,8,16,15,14,12,15,15,17,14,16,12,16,17,11,2,2,2,2,16,10,8,16,generated,inspiration already used elsewhere in the game
Rhein 04,24,Samuel Tapia,-,MC,DM,29,ESP,EU,Non-HG,No,Registered,78,78,Right,173,68,10,17,13,16,12,13,12,9,17,16,14,14,16,13,11,14,11,13,2,2,2,2,16,11,13,16,generated,capped by band; inspiration already used elsewhere in the game
Rhein 04,10,Benedikt Hartmann,-,MC,AMC/AML,23,GER,EU,HGN,No,Registered,78,89,Right,177,70,15,17,17,17,13,8,7,7,18,16,10,14,15,11,15,14,11,16,2,2,2,2,15,15,17,16,generated,capped by band; inspiration already used elsewhere in the game
Rhein 04,32,Bilal Tazi,Ayman Aourir,MC,AMC,21,MAR,Non-EU,HGC,Yes,U21 Exempt,74,78,Right,175,68,9,17,13,15,10,13,9,6,16,15,10,13,13,7,13,13,10,13,2,2,2,2,13,12,12,15,sure,-
Rhein 04,7,Elias Pohl,-,AMC,AMR/MC,34,GER,EU,HGN,No,Registered,75,76,Right,176,73,14,14,14,14,13,9,8,8,17,16,11,15,16,12,12,13,11,16,2,2,2,2,15,15,14,16,generated,inspiration already used elsewhere in the game
Rhein 04,11,Loïc Brunet,-,AML,AMC/ST,29,FRA,EU,Non-HG,No,Registered,77,77,Right,184,73,15,14,17,14,15,8,7,11,15,14,9,14,15,10,17,14,13,14,2,2,2,2,14,15,14,14,generated,inspiration already used elsewhere in the game
Rhein 04,22,Ramon Yakubu,-,ST,-,25,NGA,Non-EU,Non-HG,No,Registered,78,78,Right,190,85,17,12,15,14,7,5,4,16,12,15,6,14,14,10,14,13,17,13,2,2,2,2,15,17,14,14,generated,capped by band; inspiration already used elsewhere in the game
Rhein 04,38,Leon Weber,Ken Izekor,ST,AML,19,GER,EU,HGC,Yes,U21 Exempt,71,82,Right,182,75,16,9,13,13,5,4,3,13,9,13,5,13,13,6,15,12,13,14,2,2,2,2,13,15,12,12,sure,-
```

### Black and Yellows (Borussia Dortmund)
**Reputation:** 85 | **CA Band:** 69–78 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Black and Yellows,33,Leon Vogel,Alexander Meyer,GK,-,35,GER,EU,HGN,No,Registered,75,75,Right,195,90,2,13,5,11,2,3,3,4,12,15,15,10,15,12,9,9,14,14,15,15,15,15,15,2,3,14,sure,-
Black and Yellows,35,Maciej Dudek,Marcel Lotka,GK,-,25,POL,EU,Non-HG,No,Registered,76,76,Right,190,84,2,11,4,10,2,3,3,4,10,15,14,10,15,9,9,9,13,15,17,15,14,15,15,2,2,13,sure,-
Black and Yellows,42,Yannick Giesler,-,DL,WBL,20,GER,EU,HGC,Yes,U21 Exempt,74,82,Left,186,78,6,15,15,13,14,14,14,12,11,13,14,16,13,8,16,15,14,14,2,2,2,2,15,12,10,15,generated,inspiration already used elsewhere in the game
Black and Yellows,25,Alexander Bergmann,Niklas Süle,DC,DR,30,GER,EU,HGN,No,Registered,78,78,Right,195,95,5,14,10,13,6,15,16,17,11,13,16,13,13,12,13,13,19,10,2,2,2,2,16,7,6,14,sure,capped by band
Black and Yellows,39,Salvatore Farina,-,DC,DR,21,ITA,EU,Non-HG,Yes,U21 Exempt,75,81,Right,188,80,4,12,9,12,5,15,15,15,10,15,15,14,14,9,15,14,15,12,2,2,2,2,15,6,5,15,generated,inspiration already used elsewhere in the game
Black and Yellows,2,Willian Moreira,Yan Couto,DR,WBR/MR,24,BRA,Non-EU,Non-HG,No,Registered,78,80,Right,168,62,8,16,17,15,16,14,14,7,14,13,13,17,13,9,18,16,9,18,2,2,2,2,16,15,16,16,sure,capped by band
Black and Yellows,23,Elias Kessler,Emre Can,DM,DC/MC,32,GER,EU,HGN,No,Registered,77,78,Right,186,83,9,15,12,14,9,16,14,15,13,15,16,16,15,17,13,13,14,12,2,2,2,2,17,10,9,17,sure,-
Black and Yellows,6,Yiğit Polat,-,MC,DM/AMC,35,TUR,Non-EU,HGN,No,Registered,77,77,Right,181,75,11,14,13,16,15,13,12,9,18,17,14,14,14,15,10,14,12,12,2,2,2,2,15,13,12,18,generated,inspiration already used elsewhere in the game
Black and Yellows,38,Marcel Kessler,Kjell Wätjen,MC,AMC,20,GER,EU,HGC,Yes,U21 Exempt,76,83,Right,183,74,9,16,14,15,10,15,11,8,15,14,12,15,15,9,14,15,12,14,2,2,2,2,15,14,13,16,sure,-
Black and Yellows,10,Florian Ehrlich,-,AMC,MC/AML,30,GER,EU,HGC,No,Registered,78,78,Right,185,82,14,17,16,17,14,9,8,10,16,14,10,15,14,13,14,15,13,15,2,2,2,2,16,15,16,17,generated,capped by band; inspiration already used elsewhere in the game
Black and Yellows,43,Kieran Sharpe,Jamie Bynoe-Gittens,AML,AMR,21,ENG,Non-EU,Non-HG,Yes,U21 Exempt,77,84,Right,179,73,13,13,17,15,11,5,4,6,11,12,6,14,11,8,18,14,11,18,2,2,2,2,13,14,18,13,sure,-
Black and Yellows,37,James Caldwell,-,AMR,AML,20,USA,Non-EU,Non-HG,Yes,U21 Exempt,73,80,Left,176,69,12,12,16,14,12,5,4,5,13,12,6,13,12,7,17,13,10,16,2,2,2,2,12,13,16,13,generated,inspiration already used elsewhere in the game
Black and Yellows,14,Benedikt Reuter,-,ST,AML/AMR,23,GER,EU,HGN,No,Registered,78,82,Right,185,76,15,12,15,14,9,6,5,16,12,15,7,17,14,10,18,16,15,16,2,2,2,2,15,17,13,15,generated,capped by band; inspiration already used elsewhere in the game
Black and Yellows,18,Marvin Vogel,Paris Brunner,ST,AML,20,GER,EU,HGC,Yes,U21 Exempt,76,83,Right,186,79,16,11,15,13,7,5,4,15,10,15,6,14,14,9,16,14,15,14,2,2,2,2,15,16,13,13,sure,-
```

### Red Bulls (RB Leipzig)
**Reputation:** 83 | **CA Band:** 69–78 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Red Bulls,26,Gilles Lambrecht,-,GK,-,24,BEL,EU,Non-HG,No,Registered,77,81,Right,192,86,2,13,4,11,2,4,3,4,12,16,15,10,15,11,10,10,13,15,16,15,15,16,15,2,3,13,generated,inspiration already used elsewhere in the game
Red Bulls,1,Felix Wagner,Leopold Zingerle,GK,-,32,GER,EU,HGN,No,Registered,70,70,Right,186,80,2,10,3,9,2,3,3,4,9,14,14,10,13,10,8,9,12,14,14,14,14,14,14,2,2,12,sure,-
Red Bulls,16,Jonas Hartmann,Lukas Klostermann,DL,DC/DR,30,GER,EU,HGN,No,Registered,77,77,Right,189,83,5,13,14,13,12,16,16,15,11,14,16,16,14,13,17,16,16,13,2,2,2,2,16,11,7,16,sure,-
Red Bulls,5,Clément Gaillard,-,DC,DL,21,FRA,EU,Non-HG,Yes,U21 Exempt,76,84,Left,196,96,4,13,9,12,5,15,15,16,10,13,15,14,13,9,14,13,19,10,2,2,2,2,15,6,5,15,generated,inspiration already used elsewhere in the game
Red Bulls,22,Roko Đorđević,Kosta Nedeljković,DC,DR,20,SRB,Non-EU,Non-HG,Yes,U21 Exempt,74,81,Right,184,77,4,12,10,12,6,15,14,14,9,16,15,15,15,8,16,15,14,13,2,2,2,2,15,7,6,15,sure,-
Red Bulls,3,Tygo Meijer,Lutsharel Geertruida,DR,DC/DM,26,NED,EU,Non-HG,No,Registered,78,78,Right,184,80,7,15,16,15,13,16,16,15,13,16,16,16,16,14,15,16,16,13,2,2,2,2,16,12,10,17,sure,capped by band
Red Bulls,13,Marvin Zauner,-,DM,MC,21,AUT,EU,Non-HG,Yes,U21 Exempt,77,83,Right,176,68,7,16,13,15,9,15,14,10,15,15,15,16,15,10,13,16,12,14,2,2,2,2,16,10,11,17,generated,inspiration already used elsewhere in the game
Red Bulls,8,Amadou Yattara,Amadou Haidara,DM,MC,28,MLI,Non-EU,Non-HG,No,Registered,77,77,Right,175,72,10,15,14,15,10,16,14,11,14,15,15,18,14,12,14,13,13,14,2,2,2,2,16,12,11,17,sure,-
Red Bulls,44,Ivan Radić,Kevin Kampl,MC,DM,35,SVN,EU,Non-HG,No,Registered,74,74,Right,178,68,9,15,15,16,11,12,11,7,16,16,13,13,14,15,12,13,10,15,2,2,2,2,14,12,15,17,sure,-
Red Bulls,18,Christian Richter,Assan Ouédraogo,MC,AMC,20,GER,EU,HGC,Yes,U21 Exempt,75,85,Right,191,82,11,15,15,15,10,14,12,12,15,14,12,16,14,9,15,16,15,14,2,2,2,2,15,14,14,16,sure,-
Red Bulls,7,Sam Jacobs,-,AML,AMC/AMR,23,NED,EU,Non-HG,No,Registered,78,78,Right,179,70,15,16,14,17,13,8,7,8,14,15,8,16,14,12,15,16,12,18,2,2,2,2,15,17,18,16,generated,capped by band; inspiration already used elsewhere in the game
Red Bulls,24,Lazar Simić,Eljif Elmas,AMR,AMC/AML,26,MKD,Non-EU,Non-HG,No,Registered,77,77,Right,182,74,14,15,17,15,16,10,9,10,15,14,9,16,15,11,16,16,13,15,2,2,2,2,15,15,14,16,sure,-
Red Bulls,14,Yannick Haider,-,ST,-,23,AUT,EU,Non-HG,No,Registered,78,78,Right,195,85,16,13,14,15,7,5,4,15,12,14,7,16,15,11,17,15,15,14,2,2,2,2,15,17,13,15,generated,capped by band; inspiration already used elsewhere in the game
Red Bulls,9,Søren Dalsgaard,Yussuf Poulsen,ST,AMR,32,DEN,EU,Non-HG,No,Registered,74,74,Right,192,84,14,12,16,13,8,9,8,17,11,15,8,19,13,16,14,17,17,12,2,2,2,2,15,16,10,18,sure,-
```

### Frankfurt Eagles (Eintracht Frankfurt)
**Reputation:** 81 | **CA Band:** 67–76 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Frankfurt Eagles,33,Benedikt Jäger,Jens Grahl,GK,-,37,GER,EU,HGN,No,Registered,70,70,Right,193,88,2,10,3,9,2,3,3,4,9,14,14,10,13,11,7,8,13,14,14,14,14,14,14,2,2,12,sure,-
Frankfurt Eagles,40,Marcel Sauer,Nils Ramming,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,72,78,Right,190,83,2,10,3,8,2,3,3,4,8,14,13,9,14,8,8,9,12,14,16,14,14,15,14,2,2,12,sure,-
Frankfurt Eagles,29,Baptiste Lambert,Niels Nkounkou,DL,WBL/ML,25,FRA,EU,Non-HG,No,Registered,75,76,Left,184,78,8,16,16,14,15,13,12,11,12,12,13,16,12,9,18,17,14,16,2,2,2,2,15,14,13,15,sure,-
Frankfurt Eagles,35,Marcelo Pacheco,Tuta,DC,DR/DM,27,BRA,Non-EU,Non-HG,No,Registered,76,76,Right,185,81,5,13,10,12,6,16,15,15,10,14,16,15,14,11,14,15,15,13,2,2,2,2,16,7,6,15,sure,capped by band
Frankfurt Eagles,5,Yannick Pohl,-,DC,-,22,SUI,Non-EU,Non-HG,No,Registered,75,80,Right,197,93,3,11,8,11,4,15,15,16,9,13,15,14,13,9,13,13,18,10,2,2,2,2,15,6,4,14,generated,inspiration already used elsewhere in the game
Frankfurt Eagles,34,Sebastian Sauer,-,DR,DC,22,GER,EU,HGN,No,Registered,75,76,Right,191,84,5,15,15,12,13,15,14,14,9,13,14,15,12,8,18,16,16,14,2,2,2,2,14,11,9,15,generated,inspiration already used elsewhere in the game
Frankfurt Eagles,16,Viktor Bergström,-,MC,DM,22,SWE,EU,Non-HG,No,Registered,76,76,Right,187,78,10,15,14,16,11,14,13,11,15,15,14,16,15,11,15,15,13,14,2,2,2,2,16,13,12,17,generated,capped by band; inspiration already used elsewhere in the game
Frankfurt Eagles,8,Florian Sauer,Mahmoud Dahoud,MC,DM,30,GER,EU,HGN,No,Registered,75,75,Right,178,69,10,16,15,16,11,12,11,7,16,15,12,14,15,10,13,14,11,15,2,2,2,2,15,12,15,16,sure,-
Frankfurt Eagles,6,Morten Dalsgaard,-,MC,DM,21,DEN,EU,Non-HG,Yes,U21 Exempt,75,76,Right,184,76,9,15,13,14,10,15,12,10,14,14,13,17,15,9,14,16,13,14,2,2,2,2,15,15,11,16,generated,inspiration already used elsewhere in the game
Frankfurt Eagles,19,Selim Yılmaz,-,AML,AMC/ST,20,TUR,Non-EU,HGC,Yes,U21 Exempt,75,85,Right,186,77,15,14,16,16,11,6,5,12,12,13,7,14,12,9,15,14,13,16,2,2,2,2,14,16,16,14,generated,inspiration already used elsewhere in the game
Frankfurt Eagles,27,Tom Blanchet,-,AML,AMC,21,FRA,EU,Non-HG,Yes,U21 Exempt,74,80,Right,180,72,12,13,16,15,14,5,4,7,13,12,6,13,13,8,16,13,11,16,2,2,2,2,13,13,16,13,generated,inspiration already used elsewhere in the game
Frankfurt Eagles,36,Jonas Winkler,Ansgar Knauff,AMR,AML/WBR,24,GER,EU,HGC,No,Registered,75,76,Right,180,73,13,12,16,14,14,8,7,8,12,12,8,16,12,9,18,16,12,17,2,2,2,2,13,15,14,14,sure,-
Frankfurt Eagles,11,Antoine Arnaud,Elye Wahi,ST,AML,24,FRA,EU,Non-HG,No,Registered,76,76,Right,189,75,15,14,16,15,10,5,4,15,14,14,7,14,14,9,16,14,14,16,2,2,2,2,15,16,16,14,sure,capped by band
Frankfurt Eagles,9,Zvonimir Horvat,Igor Matanović,ST,-,23,CRO,EU,Non-HG,No,Registered,75,76,Right,194,88,16,10,15,13,6,6,5,17,10,15,6,15,13,10,13,14,18,11,2,2,2,2,15,16,9,15,sure,-
```

## 4. Ligue 1

### Lutece SG (Paris Saint-Germain FC)
**Reputation:** 91 | **CA Band:** 74–83 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lutece SG,39,Maksym Tkachenko,Matvei Safonov,GK,-,27,RUS,Non-EU,Non-HG,No,Registered,80,83,Right,192,85,2,13,4,10,2,3,3,4,11,16,15,10,15,13,9,10,14,16,17,16,16,16,15,2,3,13,sure,-
Lutece SG,80,Yeray Izquierdo,Arnau Tenas,GK,-,25,ESP,EU,Non-HG,No,Registered,76,80,Right,185,78,2,13,5,11,2,3,3,4,12,16,14,10,15,10,10,10,12,15,17,14,14,16,15,2,3,13,sure,-
Lutece SG,35,Jean Macedo,-,DL,DC,22,BRA,Non-EU,Non-HG,No,Registered,79,86,Left,182,76,5,15,15,14,15,16,16,13,13,15,16,16,16,10,16,16,13,13,2,2,2,2,15,9,9,16,generated,inspiration already used elsewhere in the game
Lutece SG,21,Damien Lacroix,-,DC,DL,30,FRA,EU,HGN,No,Registered,81,81,Left,184,79,5,13,10,12,7,17,16,15,10,17,16,16,17,14,17,14,15,12,2,2,2,2,16,6,5,16,generated,inspiration already used elsewhere in the game
Lutece SG,3,Thomas Mercier,Presnel Kimpembe,DC,-,30,FRA,EU,HGC,No,Registered,78,78,Left,189,82,4,12,8,11,4,16,16,15,9,16,15,14,15,14,16,13,16,11,2,2,2,2,15,5,4,15,sure,-
Lutece SG,42,Romain Carpentier,Yoram Zague,DR,DL,20,FRA,EU,HGC,Yes,U21 Exempt,74,83,Right,176,68,6,14,15,12,14,15,15,10,10,12,14,15,12,8,16,15,11,15,2,2,2,2,14,12,11,14,sure,-
Lutece SG,4,Davi Xavier,-,DM,MC,25,BRA,Non-EU,Non-HG,No,Registered,81,83,Right,182,77,5,13,11,13,6,17,16,12,16,15,15,18,14,11,14,18,16,13,2,2,2,2,17,8,7,17,generated,inspiration already used elsewhere in the game
Lutece SG,33,Clément Dufour,-,MC,DM/DR,20,FRA,EU,HGC,Yes,U21 Exempt,82,92,Right,178,74,11,17,14,15,10,17,13,10,16,15,14,18,16,12,15,18,14,14,2,2,2,2,16,16,12,17,generated,inspiration already used elsewhere in the game
Lutece SG,24,Nolan Poirier,-,MC,AMC,20,FRA,EU,HGC,Yes,U21 Exempt,74,84,Right,180,72,11,17,14,14,10,14,10,8,14,14,11,15,14,8,14,15,12,14,2,2,2,2,14,13,13,15,generated,inspiration already used elsewhere in the game
Lutece SG,19,Ji-hoon Shin,Lee Kang-in,AMC,AMR/MC,25,KOR,Non-EU,Non-HG,No,Registered,81,83,Left,173,68,13,16,17,17,13,7,6,5,17,15,8,14,15,10,13,14,11,17,2,2,2,2,14,14,18,15,sure,-
Lutece SG,29,Valentin Vidal,-,AML,AMR/ST,23,FRA,EU,HGN,No,Registered,82,87,Right,186,75,15,13,17,15,16,5,4,8,16,13,7,15,15,9,18,14,12,17,2,2,2,2,14,16,16,14,generated,inspiration already used elsewhere in the game
Lutece SG,11,Sergio Negrete,Marco Asensio,AMR,AMC/AML,30,ESP,EU,Non-HG,No,Registered,80,80,Left,182,76,15,15,17,15,17,6,5,9,17,14,7,12,17,11,17,12,12,15,2,2,2,2,14,15,15,14,sure,-
Lutece SG,23,Adrien Chauvin,Randal Kolo Muani,ST,AMR/AML,27,FRA,EU,HGN,No,Registered,81,82,Right,187,77,17,12,15,16,9,6,5,15,12,15,6,16,16,10,17,15,15,15,2,2,2,2,14,17,14,14,sure,-
Lutece SG,38,Brahim El Fassi,Naoufel El Hannach,DR,DC,19,MAR,Non-EU,HGC,Yes,U21 Exempt,74,81,Right,181,73,5,14,14,12,14,15,15,11,10,12,15,14,12,8,16,15,12,13,2,2,2,2,14,11,10,14,sure,-
```

### Monégasques (AS Monaco FC)
**Reputation:** 82 | **CA Band:** 68–77 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Monégasques,1,Jakub Majewski,Radosław Majecki,GK,-,26,POL,EU,Non-HG,No,Registered,76,76,Right,193,85,2,11,4,10,2,3,3,4,10,15,15,10,15,11,9,9,13,14,16,15,15,15,15,2,3,13,sure,-
Monégasques,16,Yoann Vasseur,Yann Liénard,GK,-,23,FRA,EU,HGC,No,Registered,72,75,Right,192,82,2,10,3,9,2,3,3,4,9,15,14,10,14,9,8,9,12,14,15,14,14,15,14,2,2,12,sure,-
Monégasques,20,Lucas Chauvin,Christian Mawissa,DL,DC/DR,21,FRA,EU,Non-HG,Yes,U21 Exempt,74,82,Left,182,76,5,13,14,13,13,15,15,13,11,13,14,16,13,9,16,16,14,14,2,2,2,2,14,12,10,15,sure,-
Monégasques,5,Yacouba Konaté,Wilfried Singo,DC,DR,25,CIV,Non-EU,Non-HG,No,Registered,77,77,Right,190,81,6,13,12,13,11,15,16,17,11,13,16,16,13,12,13,16,17,14,2,2,2,2,16,8,8,14,sure,capped by band
Monégasques,4,Robin Wagner,-,DC,DR/DL,29,GER,EU,Non-HG,No,Registered,76,76,Right,186,79,5,13,10,13,8,16,15,15,11,14,16,15,14,13,14,15,15,13,2,2,2,2,16,7,6,15,generated,inspiration already used elsewhere in the game
Monégasques,2,Jelle Dekker,Jordan Teze,DR,DC,26,NED,EU,Non-HG,No,Registered,76,76,Right,183,74,6,14,14,13,13,16,15,13,11,14,15,16,13,11,16,16,14,14,2,2,2,2,15,12,9,16,sure,-
Monégasques,8,Romain Pichon,-,DM,DC,22,FRA,EU,HGC,No,Registered,76,81,Right,189,81,6,14,12,13,7,16,15,14,13,14,15,16,13,10,14,16,16,13,2,2,2,2,15,9,8,16,generated,inspiration already used elsewhere in the game
Monégasques,88,Dylan Bertrand,Edan Diop,MC,MR/DM,21,FRA,EU,HGC,Yes,U21 Exempt,74,80,Right,182,74,10,15,13,14,11,15,12,11,13,13,12,17,15,9,15,17,13,14,2,2,2,2,15,14,12,16,sure,-
Monégasques,34,Enzo Gauthier,-,MC,DM,22,FRA,EU,HGC,No,Registered,74,77,Right,183,75,8,16,12,13,9,15,13,11,13,14,13,16,15,9,14,16,13,13,2,2,2,2,14,14,10,16,generated,inspiration already used elsewhere in the game
Monégasques,18,Riku Yamada,Takumi Minamino,MC,AMC/AML,31,JPN,Non-EU,Non-HG,No,Registered,77,77,Right,174,68,14,15,15,15,12,11,10,10,15,15,12,18,15,13,15,17,12,16,2,2,2,2,15,17,14,17,sure,capped by band
Monégasques,37,Corentin Tessier,Malamine Efekele,AML,AMR,21,FRA,EU,HGC,Yes,U21 Exempt,74,77,Right,178,72,13,12,16,14,14,6,5,8,14,12,6,14,14,8,16,14,11,16,2,2,2,2,13,13,15,13,sure,-
Monégasques,27,Yacouba Diop,Krépin Diatta,AMR,WBR/MR,27,SEN,Non-EU,Non-HG,No,Registered,76,76,Right,173,68,12,13,16,14,14,11,10,7,14,12,9,17,13,10,18,17,11,17,2,2,2,2,13,14,15,15,sure,-
Monégasques,36,Tom Herrmann,Breel Embolo,ST,-,29,SUI,Non-EU,Non-HG,No,Registered,77,77,Right,187,88,15,12,15,14,7,7,6,16,12,15,7,16,14,12,16,15,19,13,2,2,2,2,15,16,12,16,sure,capped by band
Monégasques,9,Yoann Guérin,George Ilenikhena,ST,-,19,FRA,EU,Non-HG,Yes,U21 Exempt,75,85,Left,185,79,16,10,15,13,6,4,3,15,9,15,6,14,13,7,16,14,15,14,2,2,2,2,14,16,11,13,sure,-
```

### Phocéens (Olympique de Marseille)
**Reputation:** 82 | **CA Band:** 67–76 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Phocéens,1,Finn Mulder,-,GK,-,34,NED,EU,Non-HG,No,Registered,76,76,Right,189,84,2,13,4,11,2,3,3,4,12,15,15,10,15,13,9,10,13,14,16,15,15,15,15,2,3,13,generated,capped by band; inspiration already used elsewhere in the game
Phocéens,16,Unai Alcázar,Rubén Blanco,GK,-,31,ESP,EU,Non-HG,No,Registered,72,72,Right,188,81,2,11,3,9,2,3,3,4,10,15,14,10,15,10,8,9,12,15,14,14,14,15,15,2,2,12,sure,-
Phocéens,6,Lars Ziegler,Ulisses Garcia,DL,ML/WBL,30,SUI,Non-EU,Non-HG,No,Registered,74,74,Left,183,78,7,16,16,13,14,14,13,11,12,13,13,16,13,11,16,16,13,14,2,2,2,2,15,13,11,15,sure,-
Phocéens,4,Elliot Reese,Derek Cornelius,DC,-,28,CAN,Non-EU,Non-HG,No,Registered,75,75,Left,188,84,4,12,9,12,5,16,15,16,10,12,16,15,12,12,12,14,17,11,2,2,2,2,15,6,5,13,sure,-
Phocéens,5,Jérémy Hamon,Lilian Brassier,DC,DL,26,FRA,EU,Non-HG,No,Registered,76,76,Left,186,79,4,13,10,12,6,16,15,15,11,14,16,15,14,11,14,15,15,12,2,2,2,2,16,7,6,15,sure,capped by band
Phocéens,29,Marcos Ferrer,Pol Lirola,DR,WBR/MR,28,ESP,EU,Non-HG,No,Registered,74,74,Right,183,77,8,16,16,14,14,14,13,10,12,13,13,16,13,10,16,16,13,14,2,2,2,2,15,14,12,15,sure,-
Phocéens,19,Guillaume Vasseur,Geoffrey Kondogbia,DM,MC/DC,33,FRA,EU,Non-HG,No,Registered,76,76,Left,188,80,7,14,12,14,7,16,14,14,12,15,16,16,15,14,12,13,14,12,2,2,2,2,17,9,9,17,sure,capped by band
Phocéens,21,Valentin Guérin,Valentin Rongier,MC,DM,31,FRA,EU,HGN,No,Registered,76,76,Right,172,67,8,14,14,15,10,15,14,9,15,16,15,16,16,16,13,16,12,14,2,2,2,2,16,11,11,18,sure,capped by band
Phocéens,7,Zakaria Zerrouki,Ismaël Bennacer,MC,DM,28,ALG,Non-EU,Non-HG,No,Registered,76,76,Left,175,70,9,15,16,16,11,14,13,8,16,16,14,15,15,12,14,14,12,16,2,2,2,2,15,12,15,17,sure,capped by band
Phocéens,11,Walid Benhaddou,Amine Harit,MC,AMC/AML,29,MAR,Non-EU,Non-HG,No,Registered,76,76,Right,180,67,11,17,17,16,12,14,8,6,16,14,10,14,14,10,15,14,10,17,2,2,2,2,14,14,17,15,sure,capped by band
Phocéens,17,Luke Thorne,Jonathan Rowe,AML,AMR,23,ENG,Non-EU,Non-HG,No,Registered,75,76,Right,180,74,13,13,16,15,13,6,5,8,13,12,7,14,13,8,17,14,12,16,2,2,2,2,13,14,15,13,sure,-
Phocéens,24,Martin Fotso,François Mughe,AMR,AML,22,CMR,Non-EU,HGC,No,Registered,73,76,Right,174,68,12,11,15,13,14,5,4,7,14,11,6,13,13,7,18,13,11,16,2,2,2,2,12,13,14,12,sure,-
Phocéens,9,Antoine Pichon,Neal Maupay,ST,-,23,FRA,EU,Non-HG,No,Registered,76,80,Right,184,74,15,12,15,14,8,5,4,15,12,14,7,15,13,9,18,14,15,16,2,2,2,2,15,16,14,13,sure,capped by band
Phocéens,14,Aurélien Nkoulou,Faris Moumbagna,ST,-,26,CMR,Non-EU,Non-HG,No,Registered,74,75,Left,185,85,14,10,15,13,6,6,5,16,10,15,6,16,13,10,15,15,18,12,2,2,2,2,14,16,9,15,sure,-
```

### Gones (Olympique Lyonnais)
**Reputation:** 81 | **CA Band:** 66–75 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Gones,23,Carlos Moraes,Lucas Perri,GK,-,28,BRA,Non-EU,Non-HG,No,Registered,75,75,Right,197,98,2,12,4,10,2,3,3,4,11,15,15,10,15,12,9,9,16,14,15,15,15,15,15,2,3,13,sure,capped by band
Gones,1,Rayan Perrot,Rémy Descamps,GK,-,30,FRA,EU,HGN,No,Registered,70,70,Right,196,85,2,10,3,9,2,3,3,4,9,14,14,10,13,10,8,9,13,14,14,14,14,14,14,2,2,12,sure,-
Gones,16,Wesley Carvalho,Abner Vinícius,DL,WBL,26,BRA,Non-EU,Non-HG,No,Registered,74,74,Left,181,73,6,14,15,13,14,14,14,11,11,13,14,16,13,9,16,16,13,14,2,2,2,2,14,13,11,15,sure,-
Gones,5,Toni Pavlović,Duje Ćaleta-Car,DC,-,29,CRO,EU,Non-HG,No,Registered,75,75,Right,192,89,5,13,8,12,4,15,15,16,11,12,16,13,12,13,11,12,18,10,2,2,2,2,16,6,5,13,sure,capped by band
Gones,27,Quentin Rousseau,Warmed Omari,DC,-,26,FRA,EU,Non-HG,No,Registered,74,74,Right,188,77,4,13,9,12,5,15,15,14,10,14,15,14,14,10,14,14,15,12,2,2,2,2,15,7,6,15,sure,-
Gones,22,Tiago Mateus,-,DR,DL/MC,28,ANG,Non-EU,Non-HG,No,Registered,75,75,Right,177,71,8,16,16,14,13,14,14,10,13,14,14,16,14,11,16,16,13,15,2,2,2,2,16,13,12,16,generated,capped by band; inspiration already used elsewhere in the game
Gones,6,Alexis Jacquet,Maxence Caqueret,MC,DM,26,FRA,EU,HGC,No,Registered,75,75,Right,174,63,8,12,15,16,11,15,14,8,16,15,14,16,15,12,14,16,11,16,2,2,2,2,16,12,13,18,sure,capped by band
Gones,7,Sofiane Dufour,Jordan Veretout,MC,DM/AMC,33,FRA,EU,HGN,No,Registered,75,75,Right,177,67,11,16,13,15,13,14,13,10,15,15,14,14,14,14,13,14,13,13,2,2,2,2,15,13,12,17,sure,capped by band
Gones,8,Axel Brunet,Corentin Tolisso,MC,DM/AMC,31,FRA,EU,HGC,No,Registered,75,75,Right,181,81,13,16,13,15,11,14,13,14,15,15,14,14,14,16,12,14,15,13,2,2,2,2,14,14,12,17,sure,capped by band
Gones,4,Drissa Sagna,Paul Akouokou,MC,DM,28,CIV,Non-EU,Non-HG,No,Registered,72,72,Right,181,75,6,16,11,13,7,15,14,12,13,13,14,15,14,10,13,15,16,12,2,2,2,2,15,14,8,15,sure,-
Gones,37,Isaac Darko,-,AML,AMR,21,GHA,Non-EU,Non-HG,Yes,U21 Exempt,75,82,Right,169,63,13,13,16,15,11,6,5,6,11,12,6,14,11,8,17,14,10,18,2,2,2,2,13,14,17,13,generated,capped by band; inspiration already used elsewhere in the game
Gones,18,Clément Blanchet,-,AMR,AMC/AML,22,FRA,EU,HGC,No,Registered,75,83,Either,176,71,14,16,14,18,12,5,4,6,12,13,6,12,13,9,13,12,13,17,2,2,2,2,14,15,20,13,generated,capped by band; inspiration already used elsewhere in the game
Gones,10,Théo Poirier,Alexandre Lacazette,ST,-,35,FRA,EU,HGN,No,Registered,75,75,Right,175,73,16,14,13,16,9,6,5,13,14,14,7,14,17,17,12,13,13,14,2,2,2,2,14,17,14,17,sure,capped by band
Gones,9,Ramon Akinola,Gift Orban,ST,-,24,NGA,Non-EU,Non-HG,No,Registered,75,75,Right,178,70,16,11,14,14,7,5,4,14,10,14,6,15,13,8,17,14,14,16,2,2,2,2,14,16,13,13,sure,capped by band
```

### Dogues (Lille OSC)
**Reputation:** 80 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Dogues,1,Luca Farina,Vito Mannone,GK,-,37,ITA,EU,Non-HG,No,Registered,71,71,Right,188,81,2,11,3,9,2,3,3,4,10,14,15,9,14,13,8,9,12,13,15,14,14,13,14,2,2,13,sure,-
Dogues,16,Thomas Lambert,Marc-Aurèle Caillard,GK,-,32,FRA,EU,HGN,No,Registered,68,68,Right,191,85,2,10,3,9,2,3,3,4,9,14,14,9,13,10,8,9,12,13,14,13,13,14,13,2,2,12,sure,-
Dogues,5,Mathias Åberg,-,DL,WBL/ML,27,SWE,EU,Non-HG,No,Registered,74,74,Left,181,77,7,15,15,13,14,14,13,11,12,13,13,16,13,10,17,16,13,14,2,2,2,2,15,13,12,15,generated,capped by band; inspiration already used elsewhere in the game
Dogues,4,Yuri Cardoso,-,DC,DR/DL,25,BRA,Non-EU,Non-HG,No,Registered,74,74,Right,185,74,7,12,11,12,9,15,15,15,10,13,15,16,13,11,15,15,15,13,2,2,2,2,15,9,7,16,generated,capped by band; inspiration already used elsewhere in the game
Dogues,23,Davi Guimarães,-,DC,-,26,BRA,Non-EU,Non-HG,No,Registered,74,74,Left,192,88,5,12,8,12,4,15,15,16,9,13,15,14,13,12,12,13,17,11,2,2,2,2,15,6,5,14,generated,capped by band; inspiration already used elsewhere in the game
Dogues,22,Vasco Carneiro,Tiago Santos,DR,WBR/MR,23,POR,EU,Non-HG,No,Registered,74,74,Right,175,68,7,16,16,14,15,13,12,8,13,13,13,16,13,9,17,16,11,17,2,2,2,2,15,14,15,15,sure,capped by band
Dogues,12,Yiğit Turan,-,DR,WBR,34,TUR,Non-EU,Non-HG,No,Registered,73,73,Right,190,88,8,15,15,13,14,14,14,14,12,14,15,16,14,15,14,14,16,11,2,2,2,2,15,12,10,16,generated,inspiration already used elsewhere in the game
Dogues,32,Lucas Rousseau,-,MC,DM,18,FRA,EU,HGC,Yes,U21 Exempt,74,85,Right,185,73,8,15,14,15,9,13,12,10,15,14,12,15,14,8,13,15,12,14,2,2,2,2,15,13,12,16,generated,capped by band; inspiration already used elsewhere in the game
Dogues,8,Filipe Tavares,André Gomes,MC,AMC,32,POR,EU,Non-HG,No,Registered,73,73,Right,188,84,11,16,14,16,11,11,10,10,16,15,12,12,14,11,11,11,14,13,2,2,2,2,15,12,14,16,sure,-
Dogues,6,Yannick Mvondo,Ngal'ayel Mukau,MC,DM,21,COD,Non-EU,HGC,Yes,U21 Exempt,74,77,Right,188,78,7,16,12,13,8,15,13,12,14,13,13,16,15,8,14,16,15,13,2,2,2,2,14,14,10,16,sure,capped by band
Dogues,17,Bilal Lahlou,Osame Sahraoui,AML,AMR,25,MAR,Non-EU,Non-HG,No,Registered,74,74,Right,170,65,12,14,17,15,11,5,4,5,11,12,6,13,12,8,16,13,9,18,2,2,2,2,13,13,17,13,sure,capped by band
Dogues,11,Domagoj Zdravković,Edon Zhegrova,AMR,AML,27,KOS,Non-EU,Non-HG,No,Registered,74,74,Left,181,72,14,13,15,15,11,4,4,6,11,12,6,12,12,8,16,12,11,17,2,2,2,2,13,14,18,12,sure,capped by band
Dogues,27,Idrissa Ndiaye,Mohamed Bayo,ST,-,28,GUI,Non-EU,Non-HG,No,Registered,73,73,Right,188,82,14,10,15,13,6,5,4,16,10,15,6,15,13,10,14,14,17,12,2,2,2,2,14,16,9,15,sure,-
Dogues,9,Simon Christensen,-,ST,AML,21,DEN,EU,Non-HG,Yes,U21 Exempt,74,82,Right,184,76,16,11,14,14,8,5,4,14,11,13,6,14,13,8,16,13,14,15,2,2,2,2,13,16,13,13,generated,capped by band; inspiration already used elsewhere in the game
```

---

## Change log

* Castilla CF: Mateo Torrecilla CA 72 -> 75 (band 75-84), attributes adjusted
* Castilla CF: Ignacio Valderrama CA 74 -> 75 (band 75-84), attributes adjusted
* Castilla CF: Marcos Solana CA 74 -> 75 (band 75-84), attributes adjusted
* Castilla CF: Karim Benali listed as ESP (dual national) to respect the Non-EU limit
* Castilla CF: Danilo Silveira listed as ITA (dual national) to respect the Non-EU limit
* Blaugrana: Guillem Casals CA 70 -> 71 (band 71-80), attributes adjusted
* Colchoneros: Franco Roldán listed as ESP (dual national) to respect the Non-EU limit
* Colchoneros: Julien De Smet age 37 -> 36
* Colchoneros: Facundo Tenaglia listed as ITA (dual national) to respect the Non-EU limit
* Colchoneros: Wendel Caetano listed as POR (dual national) to respect the Non-EU limit
* Colchoneros: Lucas Barovero listed as ITA (dual national) to respect the Non-EU limit
* Lions of Bilbao: Iker Elizalde (MEX) replaced by a Basque-born player
* Lions of Bilbao: Mikel Goikoetxea age 37 -> 36
* Yellow Submarine: Marcos Sendra age 40 -> 36
* Nerazzurri: Marco Vianello age 38 -> 36
* Nerazzurri: Zlatan Stanković age 37 -> 36
* La Dea: Anthony Lopes age 38 -> 37
* La Dea: Santiago Arias age 38 -> 36
* Lutece SG: Ayoub Amraoui CA 68 -> 74 (band 74-83), attributes adjusted
* Gones: Ernest Nuamah CA 76 -> 75 (band 66-75), attributes adjusted
* Gones: Maghnes Akliouche CA 77 -> 75 (band 66-75), attributes adjusted
* Dogues: Nicola Leali age 38 -> 37
* 80 slots kept their ability but lost their `inspired_by` link because that real person already has a player elsewhere in the game
