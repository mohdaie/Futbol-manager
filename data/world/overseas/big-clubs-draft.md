# Big Overseas Clubs: Completed 25-Man Squad Database (2026/27)

This file contains the 280 completed first-team squad slots (14 per club across 20 clubs) to complete each roster to 25 players at the start of the 2026/27 season.

### Standardized Database Schema
* **Registration Metadata:** `squad_no`, `eu_status` (EU / Non-EU), `hg_status` (HGC / HGN / Non-HG), `u21_elig` (Yes / No), `reg_status` (Registered / U21 Exempt).
* **Ability Ratings:** `ca` (Current Ability, 1–100 scale derived via position-weighted vector), `pa` (Potential Ability, 1–100 scale).
* **Attribute Order (1–20 scale, 26 Stats):** `fin, pas, dri, fir, cro, tck, mar, hea, vis, dec, pos, wor, cmp, ldr, pac, sta, str, agi, ref, han, one, kic, ant, otb, fla, tea`.
* **Zero Duplications:** No overlapping player assignments with the Premier League master dataset.

---

## 1. La Liga

### Castilla CF (Real Madrid CF)
**Reputation:** 91 | **CA Band:** 75–84 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Castilla CF,13,Bohdan Kravets,Andriy Lunin,GK,-,27,UKR,Non-EU,Non-HG,No,Registered,81,83,Right,191,80,2,13,4,11,2,3,3,4,12,15,16,11,16,11,10,10,13,14,17,16,15,14,16,2,3,14,sure,-
Castilla CF,25,Mateo Torrecilla,Fran González,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,72,86,Right,199,89,2,10,3,9,2,3,3,5,10,13,14,10,14,9,11,10,15,13,15,14,14,12,14,2,2,13,sure,-
Castilla CF,23,Mamadou Camara,Ferland Mendy,DL,-,31,FRA,EU,Non-HG,No,Registered,81,81,Left,180,73,6,13,14,14,12,17,16,13,11,15,16,16,14,11,17,16,16,15,2,2,2,2,16,13,9,15,sure,-
Castilla CF,22,Matthias Becker,Antonio Rüdiger,DC,-,33,GER,EU,Non-HG,No,Registered,84,84,Right,190,85,5,13,9,12,5,18,17,17,11,16,17,17,15,17,16,15,18,12,2,2,2,2,17,7,6,16,sure,capped by band
Castilla CF,35,Javier Monasterio,Raúl Asencio,DC,DR,23,ESP,EU,HGC,No,Registered,76,82,Right,184,77,4,13,9,12,6,15,15,15,11,14,15,15,14,11,14,14,15,12,2,2,2,2,15,6,5,15,sure,-
Castilla CF,2,Álvaro Berenguer,Dani Carvajal,DR,-,34,ESP,EU,HGC,No,Registered,83,83,Right,173,73,7,14,13,14,15,16,16,12,13,16,17,17,16,17,13,14,14,13,2,2,2,2,17,13,10,17,sure,-
Castilla CF,28,Ignacio Valderrama,Chema Andrés,DM,MC,21,ESP,EU,HGC,Yes,U21 Exempt,74,84,Right,190,82,5,14,10,12,5,15,14,14,13,14,15,14,14,10,11,14,15,11,2,2,2,2,15,7,6,15,sure,-
Castilla CF,19,Lucas Benavídez,Dani Ceballos,MC,AMC,29,ESP,EU,HGN,No,Registered,79,80,Right,179,70,10,16,15,16,11,12,11,7,16,15,12,14,15,11,11,13,11,14,2,2,2,2,15,13,15,15,sure,-
Castilla CF,31,Marcos Solana,Mario Martín,MC,DM,22,ESP,EU,HGC,No,Registered,74,81,Right,177,72,7,14,12,13,8,15,14,10,13,14,14,16,14,11,13,16,13,13,2,2,2,2,15,11,8,16,sure,-
Castilla CF,5,Kieran Ashfield,Jude Bellingham,AMC,MC/ST,23,ENG,Non-EU,Non-HG,No,Registered,84,93,Right,186,75,16,16,16,16,12,14,12,15,16,16,13,18,16,15,16,18,16,15,2,2,2,2,17,18,15,17,sure,capped by band
Castilla CF,21,Karim Benali,Brahim Díaz,AML,AMR/AMC,26,MAR,Non-EU,HGN,No,Registered,82,85,Either,171,68,13,15,17,16,13,6,5,6,15,14,8,15,14,10,16,14,10,17,2,2,2,2,14,15,17,14,sure,-
Castilla CF,15,Emre Kaan,Arda Güler,AMR,AMC,21,TUR,Non-EU,Non-HG,Yes,U21 Exempt,80,92,Left,175,69,14,17,16,17,13,6,5,5,17,14,7,13,15,9,14,13,9,16,2,2,2,2,14,14,18,14,sure,-
Castilla CF,16,Danilo Silveira,Endrick,ST,AMR,20,BRA,Non-EU,Non-HG,Yes,U21 Exempt,79,91,Left,173,70,15,11,14,14,6,5,4,13,10,13,6,15,14,9,17,14,15,15,2,2,2,2,15,16,13,13,sure,-
Castilla CF,29,Pablo Monasterio,Gonzalo García,ST,AML/AMR,22,ESP,EU,HGC,No,Registered,75,81,Right,182,76,14,11,12,13,8,5,4,14,10,13,6,15,13,10,14,14,14,13,2,2,2,2,14,15,10,14,sure,-
```

### Blaugrana (FC Barcelona)
**Reputation:** 90 | **CA Band:** 71–80 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Blaugrana,1,Hendrik Voss,Marc-André ter Stegen,GK,-,34,GER,EU,Non-HG,No,Registered,80,80,Right,187,85,2,13,4,11,2,4,3,4,12,15,16,11,16,16,9,10,13,15,16,16,16,17,16,2,3,14,sure,capped by band
Blaugrana,13,Mikel Arana,Iñaki Peña,GK,-,27,ESP,EU,HGC,No,Registered,75,76,Right,184,78,2,11,3,9,2,3,3,5,10,14,15,10,15,11,9,10,11,14,15,15,15,15,15,2,2,13,sure,-
Blaugrana,35,Jordi Soler,Gerard Martín,DL,DC,24,ESP,EU,HGC,No,Registered,75,78,Left,186,77,6,13,13,13,14,14,14,13,12,14,14,15,13,10,14,15,13,13,2,2,2,2,14,12,10,15,sure,-
Blaugrana,4,Diego Valverde,Ronald Araújo,DC,DR,27,URU,Non-EU,Non-HG,No,Registered,80,82,Right,188,81,5,12,9,12,6,17,16,16,10,15,16,16,14,15,16,15,17,13,2,2,2,2,16,7,6,16,sure,capped by band
Blaugrana,24,Pol Montilla,Eric García,DC,DM/DR,25,ESP,EU,HGC,No,Registered,77,81,Right,182,76,5,15,11,14,7,15,15,13,14,15,15,14,15,12,13,14,13,13,2,2,2,2,15,8,8,16,sure,-
Blaugrana,32,Oriol Puig,Héctor Fort,DR,DL,19,ESP,EU,HGC,Yes,U21 Exempt,74,86,Right,185,76,6,13,13,13,14,14,14,11,12,13,13,15,13,9,15,15,12,14,2,2,2,2,14,12,11,15,sure,-
Blaugrana,28,Pau Riba,Marc Bernal,DM,MC,19,ESP,EU,HGC,Yes,U21 Exempt,74,88,Left,191,83,7,14,12,14,8,14,14,13,14,14,14,15,14,11,12,14,15,13,2,2,2,2,15,9,11,16,sure,-
Blaugrana,6,Borja Alarcón,Gavi,MC,AMC,21,ESP,EU,HGC,Yes,U21 Exempt,80,88,Right,173,70,11,15,15,15,10,14,13,10,15,15,14,18,15,14,15,17,13,15,2,2,2,2,16,14,13,17,sure,capped by band
Blaugrana,16,Manuel Campillo,Fermin López,MC,AMC,23,ESP,EU,HGC,No,Registered,78,84,Right,174,69,13,15,14,15,11,12,11,10,14,14,13,17,14,10,15,16,13,15,2,2,2,2,15,15,13,16,sure,-
Blaugrana,20,Carles Terrades,Dani Olmo,AMC,AML/MC,28,ESP,EU,HGC,No,Registered,80,80,Right,179,72,15,16,16,16,13,9,8,9,16,15,10,15,15,12,14,14,12,15,2,2,2,2,15,16,16,16,sure,capped by band
Blaugrana,7,Sergi Beltrán,Ferran Torres,AML,AMR/ST,26,ESP,EU,HGN,No,Registered,78,81,Right,184,77,14,13,15,14,13,7,6,12,13,14,8,15,14,10,15,15,13,14,2,2,2,2,15,16,13,15,sure,-
Blaugrana,30,Guillem Casals,Toni Fernández,AMR,AMC/ST,18,ESP,EU,HGC,Yes,U21 Exempt,70,85,Left,172,65,12,13,15,14,11,5,4,6,13,12,6,12,12,8,14,12,9,15,2,2,2,2,13,13,15,13,sure,-
Blaugrana,17,Caio Paulino,Vitor Roque,ST,AML,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,77,85,Right,172,73,14,11,13,13,8,6,5,12,11,13,7,15,13,9,16,15,14,15,2,2,2,2,14,16,13,14,sure,-
Blaugrana,18,Roger Valls,Pau Víctor,ST,AMR/AML,24,ESP,EU,HGN,No,Registered,75,79,Right,184,76,14,12,13,14,9,6,5,12,12,13,7,14,14,9,14,14,13,14,2,2,2,2,14,15,12,15,sure,-
```

### Colchoneros (Atlético de Madrid)
**Reputation:** 86 | **CA Band:** 69–78 | **Registration Rule:** Max 3 Non-EU players.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Colchoneros,1,Franco Roldán,Juan Musso,GK,-,32,ARG,Non-EU,Non-HG,No,Registered,76,76,Right,191,93,2,12,4,9,2,3,3,4,11,15,15,10,15,12,9,9,14,14,15,15,15,14,15,2,3,13,sure,-
Colchoneros,13,Sergio Salcedo,Antonio Gomis,GK,-,23,ESP,EU,HGC,No,Registered,71,77,Right,187,80,2,10,3,9,2,3,3,4,10,13,14,10,13,10,9,9,12,13,14,14,14,13,14,2,2,12,sure,-
Colchoneros,23,Armando Cossa,Reinildo Mandava,DL,DC,32,MOZ,Non-EU,Non-HG,No,Registered,77,77,Left,180,75,5,12,12,13,12,17,17,15,10,14,16,17,14,12,16,17,16,14,2,2,2,2,16,11,7,16,sure,-
Colchoneros,20,Julien De Smet,Axel Witsel,DC,DM,37,BEL,EU,Non-HG,No,Registered,75,75,Right,186,81,6,15,11,15,6,15,15,15,14,17,17,14,18,15,9,12,15,10,2,2,2,2,16,7,8,17,sure,-
Colchoneros,3,Xabier Zubieta,César Azpilicueta,DC,DR/DL,36,ESP,EU,HGN,No,Registered,75,75,Right,178,76,6,14,11,14,11,16,16,14,13,16,17,16,16,18,11,13,14,12,2,2,2,2,17,8,7,18,sure,-
Colchoneros,16,Facundo Tenaglia,Nahuel Molina,DR,MR,28,ARG,Non-EU,Non-HG,No,Registered,78,78,Right,175,70,10,14,15,14,16,14,14,11,13,14,14,17,13,11,18,18,13,16,2,2,2,2,15,15,13,16,sure,-
Colchoneros,4,Aaron Tierney,Conor Gallagher,DM,MC,26,ENG,Non-EU,Non-HG,No,Registered,78,78,Right,182,74,11,14,13,14,10,15,14,12,13,15,14,19,14,13,15,19,15,14,2,2,2,2,15,14,10,18,sure,capped by band
Colchoneros,5,Marcos Pires,Johnny Cardoso,DM,MC,24,USA,Non-EU,Non-HG,No,Registered,77,80,Right,186,79,8,14,12,14,8,16,15,14,13,15,15,16,15,11,13,16,15,13,2,2,2,2,16,10,9,16,sure,-
Colchoneros,11,Rodrigue Beauvue,Thomas Lemar,MC,AMC/AML,30,FRA,EU,Non-HG,No,Registered,75,75,Left,172,63,11,16,16,17,13,10,9,6,16,15,12,14,15,9,13,13,10,16,2,2,2,2,15,13,16,15,sure,-
Colchoneros,18,Jarno De Ridder,Arthur Vermeeren,MC,DM,21,BEL,EU,Non-HG,Yes,U21 Exempt,76,83,Right,176,68,8,15,14,14,10,13,12,8,15,15,13,16,15,10,13,16,11,14,2,2,2,2,15,12,12,16,sure,-
Colchoneros,17,Pablo Meléndez,Rodrigo Riquelme,AMC,AML/MC,26,ESP,EU,HGC,No,Registered,77,78,Right,174,68,13,15,16,15,13,8,7,7,15,14,9,15,14,9,15,15,11,16,2,2,2,2,15,15,15,15,sure,-
Colchoneros,12,Wendel Caetano,Samuel Lino,AML,ML/DL,26,BRA,Non-EU,Non-HG,No,Registered,78,78,Right,178,69,13,14,16,15,14,10,9,9,14,14,9,17,14,10,17,17,12,17,2,2,2,2,15,16,16,15,sure,capped by band
Colchoneros,21,Jorge Alarcón,Carlos Martín,AMR,ST/AML,24,ESP,EU,HGC,No,Registered,75,77,Right,180,72,13,13,14,14,12,7,6,11,12,13,8,15,13,9,15,15,13,15,2,2,2,2,14,15,13,14,sure,-
Colchoneros,10,Lucas Barovero,Ángel Correa,ST,AMR/AMC,31,ARG,Non-EU,Non-HG,No,Registered,77,77,Right,171,70,15,14,16,15,11,7,6,9,14,14,7,16,15,12,15,15,12,16,2,2,2,2,15,16,15,16,sure,-
```

### Lions of Bilbao (Athletic Club)
**Reputation:** 81 | **CA Band:** 67–76 | **Registration Rule:** Basque-origin players only.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lions of Bilbao,13,Unai Otxoa,Julen Agirrezabala,GK,-,25,ESP,EU,HGC,No,Registered,76,78,Right,187,82,2,11,4,10,2,3,3,4,10,14,15,10,15,11,9,9,13,14,16,15,15,14,15,2,3,13,sure,-
Lions of Bilbao,1,Iker Elizalde,Alex Padilla,GK,-,22,MEX,Non-EU,HGC,No,Registered,72,77,Right,190,83,2,10,3,9,2,3,3,4,9,13,14,10,14,9,9,9,12,13,15,14,14,13,14,2,2,12,sure,-
Lions of Bilbao,17,Ousmane Diallo,Adama Boiro,DL,ML,24,ESP,EU,HGC,No,Registered,74,76,Left,183,76,6,13,14,13,14,14,14,12,11,13,14,16,13,9,16,16,14,15,2,2,2,2,14,13,11,15,sure,-
Lions of Bilbao,5,Gorka Zubeldia,Yeray Álvarez,DC,-,31,ESP,EU,HGC,No,Registered,76,76,Right,182,78,4,13,9,12,5,16,16,16,10,15,16,15,14,14,13,14,16,12,2,2,2,2,16,7,6,16,sure,-
Lions of Bilbao,4,Asier Mendizabal,Aitor Paredes,DC,-,26,ESP,EU,HGC,No,Registered,76,76,Right,186,80,5,13,10,13,6,16,15,16,11,15,16,15,14,12,14,14,16,12,2,2,2,2,16,7,6,16,sure,-
Lions of Bilbao,18,Mikel Goikoetxea,Óscar de Marcos,DR,WBR/MR,37,ESP,EU,HGC,No,Registered,72,72,Right,182,76,8,14,13,14,14,14,14,11,13,14,15,17,14,17,12,14,12,13,2,2,2,2,15,14,11,18,sure,-
Lions of Bilbao,16,Jon Guridi,Iñigo Ruiz de Galarreta,DM,MC,32,ESP,EU,HGC,No,Registered,75,75,Right,175,69,7,16,13,15,10,14,14,9,15,16,15,16,16,13,12,14,11,13,2,2,2,2,16,10,11,17,sure,-
Lions of Bilbao,24,Eneko Kortabarria,Beñat Prados,MC,DM/DR,25,ESP,EU,HGC,No,Registered,76,76,Right,180,72,8,15,13,15,9,15,14,11,14,15,15,18,15,11,14,17,13,14,2,2,2,2,16,12,10,17,sure,-
Lions of Bilbao,20,Xabier Alkiza,Unai Gómez,MC,AMC,23,ESP,EU,HGC,No,Registered,75,76,Left,183,75,12,14,14,14,11,13,12,12,14,14,13,18,14,10,14,17,15,13,2,2,2,2,15,15,12,16,sure,-
Lions of Bilbao,21,Ibon Larrazabal,Ander Herrera,MC,DM,36,ESP,EU,HGC,No,Registered,72,72,Right,182,73,9,16,13,15,10,13,12,8,16,16,14,14,16,15,10,12,11,12,2,2,2,2,16,11,12,17,sure,-
Lions of Bilbao,7,Gaizka Ibarguren,Álex Berenguer,AML,AMR/ST,31,ESP,EU,HGN,No,Registered,75,75,Right,175,73,14,14,16,15,14,8,7,8,14,14,8,15,14,11,15,15,12,16,2,2,2,2,15,15,15,15,sure,-
Lions of Bilbao,11,Buba Sangaré,Álvaro Djaló,AMR,AML/ST,26,ESP,EU,HGN,No,Registered,76,76,Right,175,70,14,13,16,15,13,6,5,8,13,13,7,14,13,9,17,15,12,17,2,2,2,2,14,15,16,14,sure,-
Lions of Bilbao,12,Koldo Aranzabal,Asier Villalibre,ST,-,28,ESP,EU,HGC,No,Registered,74,74,Left,184,86,15,10,12,13,6,5,4,16,9,13,6,14,13,11,13,14,18,11,2,2,2,2,15,16,9,15,sure,-
Lions of Bilbao,19,Aritz Bengoetxea,Javier Martón,ST,-,27,ESP,EU,HGN,No,Registered,73,73,Right,183,76,15,10,12,13,6,5,4,15,9,13,6,15,13,9,14,14,15,12,2,2,2,2,14,16,9,14,sure,-
```

### Yellow Submarine (Villarreal CF)
**Reputation:** 80 | **CA Band:** 66–75 | **Registration Rule:** Max 3 Non-EU players.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Yellow Submarine,13,Adrián Montero,Diego Conde,GK,-,27,ESP,EU,HGN,No,Registered,74,75,Right,188,80,2,11,4,10,2,3,3,4,11,14,15,10,15,11,9,9,12,14,15,15,15,14,15,2,3,13,sure,-
Yellow Submarine,1,Jordi Mestre,Iker Álvarez,GK,-,24,ESP,EU,HGC,No,Registered,72,74,Right,190,83,2,10,3,9,2,3,3,4,9,13,14,10,14,9,9,9,12,13,14,14,14,13,14,2,2,12,sure,-
Yellow Submarine,24,Borja Carmona,Alfonso Pedraza,DL,ML/AML,30,ESP,EU,HGC,No,Registered,75,75,Left,184,73,9,13,15,14,15,14,13,11,13,13,13,16,13,11,16,16,13,15,2,2,2,2,14,15,13,15,sure,-
Yellow Submarine,3,Marcos Sendra,Raúl Albiol,DC,-,40,ESP,EU,HGN,No,Registered,71,71,Right,190,82,4,12,8,12,4,15,15,16,10,16,17,12,16,18,8,10,15,9,2,2,2,2,16,6,5,17,sure,-
Yellow Submarine,2,Jamiro Monteiro,Logan Costa,DC,-,25,CPV,Non-EU,Non-HG,No,Registered,75,75,Right,190,86,4,11,9,11,5,16,16,16,9,14,16,14,13,11,14,14,17,11,2,2,2,2,15,6,5,15,sure,-
Yellow Submarine,17,Vicente Mas,Kiko Femenía,DR,WBR,35,ESP,EU,HGN,No,Registered,72,72,Right,176,65,6,13,13,13,14,14,14,10,11,13,14,15,13,12,14,14,11,13,2,2,2,2,14,13,11,15,sure,-
Yellow Submarine,14,Oriol Sendra,Ramón Terrats,DM,MC,25,ESP,EU,HGC,No,Registered,74,75,Left,180,72,7,15,13,14,9,15,14,11,14,15,15,16,14,10,13,15,13,13,2,2,2,2,15,10,10,16,sure,-
Yellow Submarine,18,Marc Vidal,Gerard Gumbau,MC,DM,31,ESP,EU,HGN,No,Registered,73,73,Left,188,77,8,15,12,14,10,14,13,12,14,14,14,15,14,11,11,14,15,11,2,2,2,2,15,10,10,16,sure,-
Yellow Submarine,6,Brais Fontán,Denis Suárez,MC,AMC/AML,32,ESP,EU,HGN,No,Registered,74,74,Right,176,72,11,16,16,16,12,9,8,6,16,14,11,13,15,10,12,12,10,15,2,2,2,2,14,13,16,15,sure,-
Yellow Submarine,16,Santi Campaña,Álex Baena,AMC,AML/MC,25,ESP,EU,HGC,No,Registered,75,75,Right,174,70,14,16,16,16,14,9,8,7,17,15,10,16,15,11,14,15,11,15,2,2,2,2,15,15,16,16,sure,capped by band
Yellow Submarine,22,Juanjo Morales,Ayoze Pérez,AML,ST/AMC,33,ESP,EU,HGN,No,Registered,75,75,Right,178,72,15,14,16,15,12,7,6,11,14,14,8,15,15,11,14,14,12,15,2,2,2,2,15,16,14,15,sure,-
Yellow Submarine,11,Tarik Amrani,Ilias Akhomach,AMR,AML,22,MAR,Non-EU,HGN,No,Registered,74,75,Left,175,68,12,13,17,15,12,6,5,5,14,12,6,13,12,8,16,13,9,17,2,2,2,2,13,13,17,13,sure,-
Yellow Submarine,7,Carlos Triguero,Gerard Moreno,ST,AMR/AMC,34,ESP,EU,HGC,No,Registered,75,75,Left,180,77,16,15,15,16,11,6,5,13,15,15,7,14,16,14,12,13,13,14,2,2,2,2,16,16,15,16,sure,-
Yellow Submarine,19,Gervais Traoré,Nicolas Pépé,ST,AMR,31,CIV,Non-EU,Non-HG,No,Registered,75,75,Left,183,73,15,13,16,15,11,5,4,10,13,13,6,12,14,10,16,13,12,16,2,2,2,2,14,16,16,13,sure,-
```

---

## 2. Serie A

### Nerazzurri (FC Internazionale Milano)
**Reputation:** 88 | **CA Band:** 71–80

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Nerazzurri,13,Jaime Barcia,Josep Martínez,GK,-,28,ESP,EU,Non-HG,No,Registered,78,78,Right,191,80,2,13,5,11,2,4,3,4,12,15,15,10,16,11,10,10,12,14,16,15,15,16,15,2,3,13,sure,-
Nerazzurri,12,Gianluca Marrone,Raffaele Di Gennaro,GK,-,32,ITA,EU,HGC,No,Registered,72,72,Right,187,82,2,10,3,9,2,3,3,4,9,14,14,10,14,10,8,9,12,13,14,14,14,13,14,2,2,12,sure,-
Nerazzurri,30,Renan Campelo,Carlos Augusto,DL,DC/ML,27,BRA,Non-EU,Non-HG,No,Registered,80,80,Left,184,78,9,14,15,15,16,15,15,13,13,14,15,18,14,11,17,18,15,15,2,2,2,2,15,15,12,16,sure,-
Nerazzurri,15,Marco Vianello,Francesco Acerbi,DC,-,38,ITA,EU,HGN,No,Registered,76,76,Left,192,88,4,14,8,12,4,17,17,17,11,16,18,13,16,16,9,11,17,9,2,2,2,2,17,6,5,17,sure,-
Nerazzurri,36,Andrea Rinaldi,Matteo Darmian,DR,DL/DC,36,ITA,EU,HGN,No,Registered,75,75,Right,183,70,7,14,13,14,13,16,16,13,12,16,17,17,15,14,13,14,13,13,2,2,2,2,17,12,8,18,sure,-
Nerazzurri,2,Denzel Kluivert,Denzel Dumfries,DR,MR/AMR,30,NED,EU,Non-HG,No,Registered,79,79,Right,188,80,11,13,14,14,15,15,14,16,12,13,14,18,13,13,18,19,17,14,2,2,2,2,15,16,11,16,sure,-
Nerazzurri,21,Erion Hysaj,Kristjan Asllani,DM,MC,24,ALB,Non-EU,HGN,No,Registered,79,80,Right,175,69,8,16,14,15,11,14,13,9,16,16,15,15,15,10,13,15,12,14,2,2,2,2,16,10,12,16,sure,-
Nerazzurri,7,Pawel Szymanski,Piotr Zieliński,MC,AMC,32,POL,EU,HGN,No,Registered,78,78,Either,180,76,12,17,16,17,12,11,10,8,17,16,12,14,16,11,13,14,11,15,2,2,2,2,15,14,16,16,sure,-
Nerazzurri,16,Lorenzo Berti,Davide Frattesi,AMC,MC,26,ITA,EU,HGN,No,Registered,80,80,Right,178,74,14,15,14,15,11,12,11,11,14,14,12,18,14,11,16,18,14,15,2,2,2,2,15,17,12,17,sure,-
Nerazzurri,14,Marco Castrovilli,Federico Chiesa,AML,AMR/ST,28,ITA,EU,HGN,No,Registered,80,80,Right,175,70,15,14,17,16,14,7,6,8,14,14,8,16,14,11,17,15,13,17,2,2,2,2,14,16,16,15,sure,-
Nerazzurri,45,Tomás Palacios,Valentín Carboni,AML,AMC,21,ARG,Non-EU,HGC,Yes,U21 Exempt,77,85,Left,185,75,13,15,16,16,12,6,5,10,15,13,7,14,13,8,15,14,13,15,2,2,2,2,13,14,16,14,sure,-
Nerazzurri,11,Facundo Ferreyra,Joaquín Correa,AMR,AML/ST,31,ARG,Non-EU,Non-HG,No,Registered,75,75,Right,188,77,14,14,16,16,12,5,4,9,14,13,7,12,14,10,15,13,13,15,2,2,2,2,14,15,15,14,sure,-
Nerazzurri,47,Bakary Fofana,Issiaka Kamate,AMR,WBR,21,FRA,EU,HGC,Yes,U21 Exempt,73,80,Left,186,75,11,13,15,14,13,8,7,9,13,12,7,14,12,7,16,14,13,15,2,2,2,2,13,13,14,14,sure,-
Nerazzurri,8,Zlatan Stanković,Marko Arnautović,ST,-,37,AUT,EU,HGN,No,Registered,74,74,Right,192,83,15,14,14,15,9,5,4,15,13,14,6,12,15,13,11,12,16,11,2,2,2,2,15,15,14,14,sure,-
```

### Old Lady (Juventus FC)
**Reputation:** 86 | **CA Band:** 69–78

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Old Lady,29,Stefano Montipò,Michele Di Gregorio,GK,-,28,ITA,EU,HGN,No,Registered,78,78,Right,187,82,2,14,4,12,2,4,3,4,13,16,16,11,16,12,10,10,13,15,17,16,16,16,16,2,3,14,sure,capped by band
Old Lady,1,Federico Consigli,Mattia Perin,GK,-,33,ITA,EU,HGN,No,Registered,77,77,Right,188,77,2,11,4,10,2,3,3,4,10,14,15,10,15,12,9,10,12,14,16,15,15,14,15,2,2,13,sure,-
Old Lady,32,Brayan Lucumí,Juan David Cabal,DL,DC,25,COL,Non-EU,Non-HG,No,Registered,77,78,Left,186,79,5,13,12,13,12,16,15,15,11,14,15,16,13,10,16,16,16,13,2,2,2,2,15,11,8,15,sure,-
Old Lady,40,Hampus Nilsson,Jonas Rouhi,DL,ML,22,SWE,EU,HGC,No,Registered,72,78,Left,183,76,5,13,13,13,14,14,14,11,11,13,14,16,13,8,16,16,13,14,2,2,2,2,14,12,10,15,sure,-
Old Lady,33,Gonçalo Veiga,Tiago Djaló,DC,DR/DL,26,POR,EU,Non-HG,No,Registered,76,78,Right,190,83,4,13,10,12,6,16,16,16,10,14,16,14,14,10,16,15,16,13,2,2,2,2,16,7,6,15,sure,-
Old Lady,37,Daniele Donati,Nicolò Savona,DR,DC,23,ITA,EU,HGC,No,Registered,75,81,Right,192,84,5,13,11,13,12,16,15,15,11,14,15,16,14,9,15,16,16,13,2,2,2,2,15,11,8,16,sure,-
Old Lady,22,Jordan Harkes,Timothy Weah,DR,WBR/AMR,26,USA,Non-EU,Non-HG,No,Registered,77,78,Right,183,76,11,13,15,14,15,13,12,10,12,13,13,16,13,10,18,18,13,16,2,2,2,2,14,15,13,15,sure,-
Old Lady,26,Danilo Neves,Douglas Luiz,DM,MC,28,BRA,Non-EU,Non-HG,No,Registered,78,78,Right,177,75,11,16,15,16,12,15,14,10,16,15,15,16,16,11,13,16,14,14,2,2,2,2,16,12,14,17,sure,capped by band
Old Lady,21,Tommaso Bianchi,Nicolò Fagioli,MC,DM/AMC,25,ITA,EU,HGC,No,Registered,77,81,Right,178,70,9,17,16,17,12,12,11,8,17,16,13,14,16,10,13,14,11,15,2,2,2,2,16,13,16,17,sure,-
Old Lady,8,Guus Veldman,Teun Koopmeiners,AMC,MC/DM,28,NED,EU,Non-HG,No,Registered,78,78,Left,184,77,15,16,14,16,13,13,12,12,16,16,12,17,16,13,13,17,15,13,2,2,2,2,16,16,13,17,sure,capped by band
Old Lady,10,Baran Demir,Kenan Yıldız,AML,AMC/ST,21,TUR,Non-EU,HGC,Yes,U21 Exempt,78,87,Right,185,76,14,15,17,16,12,6,5,9,15,14,7,15,14,10,16,14,12,17,2,2,2,2,14,15,18,14,sure,-
Old Lady,7,Nuno Lourenço,Francisco Conceição,AMR,AML,23,POR,EU,Non-HG,No,Registered,77,83,Left,170,64,12,14,18,16,13,6,5,5,14,13,6,15,13,8,17,14,9,19,2,2,2,2,13,14,18,13,sure,-
Old Lady,11,Lautaro Barreto,Nicolás González,AMR,AML/ST,28,ARG,Non-EU,Non-HG,No,Registered,78,78,Left,180,72,14,14,15,15,14,10,9,16,13,14,9,17,14,12,16,17,14,15,2,2,2,2,15,16,14,16,sure,-
Old Lady,14,Bartosz Wlodarczyk,Arkadiusz Milik,ST,-,32,POL,EU,Non-HG,No,Registered,76,76,Left,186,78,16,13,12,15,8,5,4,15,12,14,6,12,15,11,11,12,16,11,2,2,2,2,16,16,12,14,sure,-
```

### Partenopei (SSC Napoli)
**Reputation:** 85 | **CA Band:** 68–77

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Partenopei,12,Matteo Ravaglia,Elia Caprile,GK,-,24,ITA,EU,HGN,No,Registered,76,77,Right,191,84,2,11,4,10,2,3,3,4,10,14,15,10,15,11,9,9,13,14,16,15,15,14,15,2,3,13,sure,-
Partenopei,14,Simone Farelli,Nikita Contini,GK,-,30,ITA,EU,HGC,No,Registered,71,71,Right,190,82,2,10,3,9,2,3,3,4,9,13,14,10,13,9,8,9,12,13,14,14,14,13,14,2,2,12,sure,-
Partenopei,37,Davide Zanon,Leonardo Spinazzola,DL,WBL/ML,33,ITA,EU,HGN,No,Registered,76,76,Right,186,75,9,14,16,15,15,13,12,10,13,13,13,15,14,11,16,14,12,16,2,2,2,2,14,15,14,15,sure,-
Partenopei,5,Rodrigo Moledo,Juan Jesus,DC,DL,35,BRA,Non-EU,Non-HG,No,Registered,73,73,Left,185,83,4,12,8,12,5,15,15,15,9,14,15,14,14,14,11,12,16,11,2,2,2,2,15,6,5,15,sure,-
Partenopei,16,Pablo Ramón,Rafa Marín,DC,-,24,ESP,EU,Non-HG,No,Registered,76,77,Right,191,85,4,13,9,12,5,16,15,16,10,14,16,14,14,11,13,14,17,11,2,2,2,2,15,6,5,15,sure,-
Partenopei,30,Fabio Depaoli,Pasquale Mazzocchi,DR,DL/WBR,30,ITA,EU,HGN,No,Registered,75,75,Right,183,76,7,13,14,13,14,14,14,11,11,13,14,18,13,11,16,17,14,15,2,2,2,2,14,13,11,16,sure,-
Partenopei,6,Ross Campbell,Billy Gilmour,DM,MC,25,SCO,Non-EU,Non-HG,No,Registered,77,77,Right,170,64,7,17,15,16,11,14,13,7,16,16,15,16,16,11,13,16,10,16,2,2,2,2,16,11,13,17,sure,capped by band
Partenopei,90,Chuka Obinna,Michael Folorunsho,MC,AMC/DM,28,ITA,EU,HGN,No,Registered,76,76,Right,187,83,12,14,13,14,10,15,13,14,13,14,13,18,13,12,15,18,17,13,2,2,2,2,15,14,11,16,sure,-
Partenopei,70,Jacopo Fazzini,Gianluca Gaetano,MC,AMC,26,ITA,EU,HGC,No,Registered,75,76,Right,183,75,11,15,14,15,11,11,10,9,15,14,12,15,14,10,13,14,12,14,2,2,2,2,14,13,13,15,sure,-
Partenopei,81,Simone Edera,Giacomo Raspadori,AMC,ST/AML,26,ITA,EU,HGN,No,Registered,77,77,Either,172,69,15,15,16,16,12,6,5,8,15,14,8,16,15,10,15,15,11,17,2,2,2,2,15,16,15,16,sure,-
Partenopei,23,Luca Zanimacchia,Alessio Zerbin,AML,WBL/ML,27,ITA,EU,HGC,No,Registered,73,73,Right,182,75,11,13,14,14,14,10,9,9,12,13,8,16,13,9,15,16,13,14,2,2,2,2,13,14,12,15,sure,-
Partenopei,7,Lucas Piazon,David Neres,AMR,AML,29,BRA,Non-EU,Non-HG,No,Registered,77,77,Left,175,69,14,14,17,16,13,6,5,6,15,13,7,13,14,9,16,13,10,18,2,2,2,2,14,14,18,13,sure,-
Partenopei,18,Agustín Fontana,Giovanni Simeone,ST,-,31,ARG,Non-EU,Non-HG,No,Registered,75,75,Right,180,81,15,11,12,13,7,7,6,15,10,13,7,18,14,12,14,17,15,13,2,2,2,2,15,17,10,16,sure,-
Partenopei,26,Isaac Mbenza,Cyril Ngonge,ST,AMR,26,BEL,EU,Non-HG,No,Registered,75,76,Left,181,74,14,13,15,14,12,6,5,11,13,13,7,14,13,9,16,14,13,15,2,2,2,2,14,15,14,14,sure,-
```

### Lombardia AC (AC Milan)
**Reputation:** 84 | **CA Band:** 72–81

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lombardia AC,57,Pierluigi Gollini,Marco Sportiello,GK,-,34,ITA,EU,HGN,No,Registered,76,76,Right,192,87,2,12,4,10,2,3,3,4,11,15,15,10,15,12,9,10,13,14,16,15,15,15,15,2,3,13,sure,-
Lombardia AC,96,Sebastiano Desplanches,Lorenzo Torriani,GK,-,21,ITA,EU,HGC,Yes,U21 Exempt,73,83,Right,197,88,2,11,3,9,2,3,3,5,10,14,14,10,14,9,9,9,13,13,15,14,14,14,14,2,2,12,sure,-
Lombardia AC,42,Giorgio Cittadini,Filippo Terracciano,DL,DR/DM,23,ITA,EU,HGN,No,Registered,76,80,Right,186,76,7,13,13,13,13,15,15,12,12,14,15,17,13,10,16,17,14,14,2,2,2,2,15,12,10,16,sure,-
Lombardia AC,31,Nikola Maksimović,Strahinja Pavlović,DC,DL,25,SRB,Non-EU,Non-HG,No,Registered,79,81,Left,194,88,5,12,9,11,5,17,17,18,9,14,16,16,13,13,15,15,19,11,2,2,2,2,16,6,5,16,sure,-
Lombardia AC,28,Armel Bella-Kotchap,Malick Thiaw,DC,-,24,GER,EU,Non-HG,No,Registered,78,81,Right,194,89,4,14,10,13,6,16,16,17,11,15,16,14,15,11,14,14,17,12,2,2,2,2,16,7,6,16,sure,-
Lombardia AC,22,Dudu,Emerson Royal,DR,WBR,27,BRA,Non-EU,Non-HG,No,Registered,78,78,Right,181,79,7,13,14,13,14,16,15,13,11,14,15,17,13,11,16,17,15,14,2,2,2,2,15,12,11,16,sure,-
Lombardia AC,29,Jean-Ricner Bellegarde,Youssouf Fofana,DM,MC,27,FRA,EU,Non-HG,No,Registered,80,81,Right,185,79,9,15,14,15,10,16,15,13,14,16,16,18,15,12,15,18,16,14,2,2,2,2,17,11,11,17,sure,-
Lombardia AC,14,Joey Veerman,Tijjani Reijnders,MC,AMC/DM,27,NED,EU,Non-HG,No,Registered,81,81,Right,185,73,12,17,16,17,12,13,12,9,17,16,13,16,16,11,15,17,13,16,2,2,2,2,16,15,15,17,sure,-
Lombardia AC,80,Tyler Boyd,Yunus Musah,MC,MR/DM,23,USA,Non-EU,Non-HG,No,Registered,77,81,Right,178,75,8,15,16,15,11,14,13,9,14,14,13,18,14,10,17,18,15,16,2,2,2,2,15,13,14,16,sure,-
Lombardia AC,8,Kasey Palmer,Ruben Loftus-Cheek,AMC,MC/DM,30,ENG,Non-EU,Non-HG,No,Registered,78,78,Right,191,88,13,15,16,16,11,12,11,14,14,15,11,14,16,11,14,14,18,14,2,2,2,2,15,15,14,16,sure,-
Lombardia AC,17,Andi Zeqiri,Noah Okafor,AML,ST,26,SUI,Non-EU,Non-HG,No,Registered,77,79,Right,185,85,15,13,16,15,12,6,5,11,13,13,7,14,14,9,18,14,15,16,2,2,2,2,14,16,15,14,sure,-
Lombardia AC,21,Chidera Ejuke,Samuel Chukwueze,AMR,AML,27,NGA,Non-EU,Non-HG,No,Registered,78,78,Left,172,70,13,13,18,15,13,5,4,5,14,12,6,13,13,8,18,13,10,19,2,2,2,2,13,14,18,12,sure,-
Lombardia AC,7,Borja Mayoral,Álvaro Morata,ST,-,33,ESP,EU,Non-HG,No,Registered,79,79,Right,190,84,16,14,13,15,9,6,5,17,13,14,7,17,15,16,15,15,15,14,2,2,2,2,16,18,12,17,sure,-
Lombardia AC,9,Dejan Joveljić,Luka Jović,ST,-,28,SRB,Non-EU,Non-HG,No,Registered,77,78,Right,182,78,16,11,13,14,6,5,4,15,11,13,6,14,14,10,14,14,15,13,2,2,2,2,15,16,11,14,sure,-
```

### La Dea (Atalanta BC)
**Reputation:** 82 | **CA Band:** 67–76

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
La Dea,28,Anthony Lopes,Rui Patrício,GK,-,38,POR,EU,Non-HG,No,Registered,73,73,Left,190,84,2,11,3,9,2,3,3,4,9,14,15,9,15,15,7,8,12,12,15,15,14,13,15,2,2,13,sure,-
La Dea,31,Alberto Paleari,Francesco Rossi,GK,-,35,ITA,EU,HGC,No,Registered,68,68,Right,187,81,2,9,3,8,2,3,3,4,8,13,13,9,13,10,7,8,11,12,14,13,13,12,13,2,2,12,sure,-
La Dea,22,Cristiano Del Grosso,Matteo Ruggeri,DL,ML/WBL,24,ITA,EU,HGC,No,Registered,76,76,Left,187,78,7,14,14,14,16,14,14,12,13,13,14,17,13,10,15,17,14,14,2,2,2,2,14,14,12,16,sure,-
La Dea,23,Ermin Bičakčić,Sead Kolašinac,DL,DC,33,BIH,Non-EU,Non-HG,No,Registered,75,75,Left,183,82,6,12,12,12,11,16,16,14,10,14,15,17,14,14,14,16,18,12,2,2,2,2,15,11,7,17,sure,-
La Dea,5,Mason Holgate,Ben Godfrey,DC,DR/DL,28,ENG,Non-EU,Non-HG,No,Registered,75,75,Right,183,79,4,11,9,11,6,16,15,15,9,13,15,15,13,10,16,15,16,13,2,2,2,2,15,6,5,15,sure,-
La Dea,77,Manuel Lazzari,Davide Zappacosta,DR,DL/WBR,34,ITA,EU,HGN,No,Registered,74,74,Right,182,73,9,13,14,14,15,14,13,11,12,13,13,17,13,12,15,16,13,14,2,2,2,2,14,14,12,16,sure,-
La Dea,45,Gabriele Ferrarini,Marco Palestra,DR,WBR/MR,21,ITA,EU,HGC,Yes,U21 Exempt,73,76,Right,185,77,6,12,13,13,13,14,13,11,11,13,13,16,12,8,16,16,13,14,2,2,2,2,13,12,11,15,sure,-
La Dea,6,Majeed Ashimeru,Ibrahim Sulemana,DM,MC,23,GHA,Non-EU,Non-HG,No,Registered,75,76,Right,180,75,6,13,12,13,7,16,15,12,11,14,15,18,13,10,14,17,15,13,2,2,2,2,15,9,8,16,sure,-
La Dea,44,Tommaso Pobega,Marco Brescianini,MC,AMC/DM,26,ITA,EU,HGN,No,Registered,76,76,Left,188,78,12,14,13,14,11,14,13,13,13,14,13,17,13,11,14,17,15,13,2,2,2,2,14,14,11,16,sure,-
La Dea,10,Filip Đuričić,Lazar Samardžić,AMC,MC,24,SRB,Non-EU,Non-HG,No,Registered,76,76,Left,184,79,14,16,16,16,13,8,7,7,16,14,9,13,15,9,14,13,12,16,2,2,2,2,14,14,17,15,sure,-
La Dea,17,Mattia Valoti,Daniel Maldini,AML,AMC/ST,24,ITA,EU,HGN,No,Registered,74,76,Right,188,78,13,14,15,15,12,7,6,11,14,13,8,14,14,9,15,14,13,15,2,2,2,2,14,15,15,14,sure,-
La Dea,7,Santiago Arias,Juan Cuadrado,AMR,WBR/DR,38,COL,Non-EU,Non-HG,No,Registered,73,73,Right,179,72,11,14,16,15,15,11,10,6,14,13,9,14,14,13,13,12,10,16,2,2,2,2,14,14,17,14,sure,-
La Dea,11,Gaetano Castrovilli,Nicolò Zaniolo,AMR,AMC/ST,27,ITA,EU,HGN,No,Registered,75,75,Left,190,86,14,13,15,14,12,9,8,14,13,12,8,15,13,10,16,14,17,14,2,2,2,2,14,15,14,13,sure,-
La Dea,9,Lucas Boyé,Mateo Retegui,ST,-,27,ITA,EU,Non-HG,No,Registered,76,76,Right,186,81,16,11,12,14,7,7,6,17,10,13,7,17,14,12,14,16,16,13,2,2,2,2,15,17,10,16,sure,-
```

---

## 3. Bundesliga

### Bavarians (FC Bayern München)
**Reputation:** 92 | **CA Band:** 73–82

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Bavarians,18,Boris Klaiman,Daniel Peretz,GK,-,26,ISR,Non-EU,Non-HG,No,Registered,78,80,Right,190,86,2,12,4,10,2,3,3,4,11,15,15,10,15,11,9,10,13,14,16,16,16,15,15,2,3,13,sure,-
Bavarians,26,Michael Rensing,Sven Ulreich,GK,-,37,GER,EU,HGC,No,Registered,75,75,Right,192,87,2,10,3,9,2,3,3,4,9,14,15,10,15,13,8,9,13,13,15,15,15,14,15,2,2,13,sure,-
Bavarians,21,Daiki Hashioka,Hiroki Ito,DL,DC,27,JPN,Non-EU,Non-HG,No,Registered,80,81,Left,188,81,6,15,12,14,14,16,16,15,13,15,16,16,15,12,15,16,15,13,2,2,2,2,16,12,9,17,sure,-
Bavarians,3,Park Ji-soo,Kim Min-jae,DC,-,29,KOR,Non-EU,Non-HG,No,Registered,82,82,Right,190,84,5,13,10,12,5,18,17,17,11,15,17,16,14,14,16,15,18,13,2,2,2,2,17,6,5,17,sure,capped by band
Bavarians,28,Colin Kleine-Bekel,Tarek Buchmann,DC,-,21,GER,EU,HGC,Yes,U21 Exempt,75,83,Right,188,81,4,13,9,12,5,15,15,15,10,14,15,14,14,9,14,14,15,12,2,2,2,2,15,6,5,15,sure,-
Bavarians,23,Valentin Gendrey,Sacha Boey,DR,WBR,25,FRA,EU,Non-HG,No,Registered,80,82,Right,178,74,6,13,14,13,14,16,16,12,11,14,15,18,13,11,18,18,14,16,2,2,2,2,15,13,12,16,sure,-
Bavarians,8,Maximilian Eggestein,Leon Goretzka,MC,DM/AMC,31,GER,EU,HGN,No,Registered,81,81,Right,189,82,14,16,14,16,11,15,14,16,15,15,14,17,15,14,15,17,17,13,2,2,2,2,16,16,12,17,sure,-
Bavarians,16,William Carvalho,João Palhinha,MC,DM,31,POR,EU,Non-HG,No,Registered,81,81,Right,190,84,7,14,11,13,7,18,17,17,12,15,17,18,14,15,13,17,18,12,2,2,2,2,17,8,7,17,sure,-
Bavarians,32,Paul Wanner,Tom Bischof,MC,AMC,21,GER,EU,HGC,Yes,U21 Exempt,77,85,Left,176,68,11,16,15,16,12,11,10,7,16,15,12,14,15,9,13,14,10,15,2,2,2,2,15,13,15,16,sure,-
Bavarians,34,Frans Krätzig,Noël Aséko Nkili,MC,DM,20,GER,EU,HGC,Yes,U21 Exempt,74,83,Right,177,72,7,15,13,14,9,14,13,10,14,14,13,16,14,9,14,15,13,14,2,2,2,2,15,11,10,16,sure,-
Bavarians,11,Georges-Kévin Nkoudou,Kingsley Coman,AML,AMR,30,FRA,EU,Non-HG,No,Registered,82,82,Right,180,76,14,14,18,16,15,6,5,8,14,13,7,14,14,11,18,14,12,18,2,2,2,2,14,15,18,14,sure,-
Bavarians,7,Karim Bellarabi,Serge Gnabry,AMR,AML/ST,31,GER,EU,HGN,No,Registered,81,81,Right,175,77,16,14,16,16,13,7,6,10,14,14,8,14,15,11,16,14,14,16,2,2,2,2,15,16,15,14,sure,-
Bavarians,39,Alan Virginius,Mathys Tel,ST,AML/AMR,21,FRA,EU,Non-HG,Yes,U21 Exempt,78,88,Right,183,77,16,12,15,15,9,6,5,13,12,13,7,15,14,9,17,14,14,16,2,2,2,2,15,16,15,14,sure,-
Bavarians,36,Garang Kuol,Nestory Irankunda,ST,AMR/AML,20,AUS,Non-EU,Non-HG,Yes,U21 Exempt,74,85,Right,175,72,15,11,15,14,10,5,4,11,11,12,6,14,13,8,18,14,13,16,2,2,2,2,14,15,15,13,sure,-
```

### Rhein 04 (Bayer 04 Leverkusen)
**Reputation:** 85 | **CA Band:** 69–78

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Rhein 04,1,Yvon Mvogo,Jonas Omlin,GK,-,32,SUI,Non-EU,Non-HG,No,Registered,76,76,Right,190,84,2,11,4,10,2,3,3,4,10,15,15,10,15,13,9,10,13,14,16,15,15,15,15,2,3,13,sure,-
Rhein 04,36,Markus Miller,Niklas Lomb,GK,-,32,GER,EU,HGC,No,Registered,69,69,Right,186,81,2,10,3,9,2,3,3,4,9,13,14,10,13,10,8,9,12,13,14,14,14,13,14,2,2,12,sure,-
Rhein 04,20,Aarón Martín,Álex Grimaldo,DL,WBL/ML,30,ESP,EU,Non-HG,No,Registered,78,78,Left,171,68,12,16,15,16,17,12,11,7,16,14,12,15,15,12,14,15,10,15,2,2,2,2,15,15,15,15,sure,capped by band
Rhein 04,13,Natanael,Arthur,DL,DR/WBL,23,BRA,Non-EU,Non-HG,No,Registered,75,80,Right,174,71,5,12,13,12,13,13,13,9,11,12,12,15,12,8,15,15,11,14,2,2,2,2,13,12,11,14,sure,-
Rhein 04,44,Castello Lukeba,Jeanuël Belocian,DC,DL,21,FRA,EU,Non-HG,Yes,U21 Exempt,76,82,Left,183,76,4,13,10,12,7,14,14,13,11,13,14,13,13,8,14,13,13,12,2,2,2,2,14,6,6,14,sure,-
Rhein 04,30,Ki-Jana Hoever,Jeremie Frimpong,DR,AMR/WBR,25,NED,EU,Non-HG,No,Registered,78,78,Right,171,64,12,13,17,14,15,12,11,6,13,12,11,15,13,10,18,16,9,18,2,2,2,2,14,16,16,14,sure,capped by band
Rhein 04,8,Christoph Kramer,Robert Andrich,DM,MC/DC,31,GER,EU,HGN,No,Registered,77,77,Right,187,83,9,14,11,13,8,16,15,14,12,15,15,17,14,16,12,16,17,11,2,2,2,2,16,10,8,16,sure,-
Rhein 04,24,Denis Suárez,Aleix García,MC,DM,29,ESP,EU,Non-HG,No,Registered,78,78,Right,173,68,10,17,13,16,12,13,12,9,17,16,14,14,16,13,11,14,11,13,2,2,2,2,16,11,13,16,sure,-
Rhein 04,10,Malik Tillman,Florian Wirtz,MC,AMC/AML,23,GER,EU,HGN,No,Registered,78,89,Right,177,70,15,17,17,17,13,8,7,7,18,16,10,15,16,11,15,14,11,16,2,2,2,2,16,17,17,16,sure,capped by band
Rhein 04,32,Bilal El Khannouss,Ayman Aourir,MC,AMC,21,MAR,Non-EU,HGC,No,Registered,74,78,Right,175,68,9,13,13,13,10,10,9,6,13,12,10,13,12,7,13,13,10,13,2,2,2,2,13,11,12,14,sure,-
Rhein 04,7,Lars Stindl,Jonas Hofmann,AMC,AMR/MC,34,GER,EU,HGN,No,Registered,75,76,Right,176,73,13,14,13,14,13,9,8,8,15,15,11,15,15,12,12,13,11,13,2,2,2,2,15,15,12,16,sure,-
Rhein 04,11,Ludovic Blas,Martin Terrier,AML,AMC/ST,29,FRA,EU,Non-HG,No,Registered,77,77,Right,184,73,15,14,14,14,12,8,7,11,13,14,9,14,14,10,14,14,13,14,2,2,2,2,14,15,13,14,sure,-
Rhein 04,22,Terem Moffi,Victor Boniface,ST,-,25,NGA,Non-EU,Non-HG,No,Registered,78,78,Right,190,85,15,12,14,14,7,5,4,15,12,13,6,14,14,10,14,13,17,13,2,2,2,2,14,16,14,14,sure,-
Rhein 04,38,Nelson Weiper,Ken Izekor,ST,AML,19,GER,EU,HGC,Yes,U21 Exempt,71,82,Right,182,75,12,9,12,12,5,4,3,12,9,11,5,13,11,6,15,12,12,14,2,2,2,2,12,14,12,12,sure,-
```

### Black and Yellows (Borussia Dortmund)
**Reputation:** 85 | **CA Band:** 69–78

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Black and Yellows,33,Philipp Pentke,Alexander Meyer,GK,-,35,GER,EU,HGN,No,Registered,75,75,Right,195,90,2,13,5,11,2,3,3,4,12,15,15,10,15,12,9,9,14,13,15,15,15,15,15,2,3,14,sure,-
Black and Yellows,35,Bartlomiej Dragowski,Marcel Lotka,GK,-,25,POL,EU,Non-HG,No,Registered,76,76,Right,190,84,2,11,4,10,2,3,3,4,10,14,14,10,14,9,9,9,13,13,15,14,14,14,14,2,2,13,sure,-
Black and Yellows,42,Kostas Chantzopoulos,Almugera Kabar,DL,WBL,20,GER,EU,HGC,Yes,U21 Exempt,74,82,Left,186,78,6,13,13,13,13,14,14,12,11,13,14,15,13,8,16,15,14,14,2,2,2,2,14,12,10,15,sure,-
Black and Yellows,25,Waldemar Anton,Niklas Süle,DC,DR,30,GER,EU,HGN,No,Registered,78,78,Right,195,95,5,14,10,13,6,16,16,17,11,15,16,13,15,12,14,13,19,10,2,2,2,2,16,7,6,15,sure,-
Black and Yellows,39,Diego Coppola,Filippo Mané,DC,DR,21,ITA,EU,Non-HG,Yes,U21 Exempt,75,81,Right,188,80,4,12,9,12,5,15,15,15,10,14,15,14,13,9,14,14,15,12,2,2,2,2,15,6,5,15,sure,-
Black and Yellows,2,Vanderson,Yan Couto,DR,WBR/MR,24,BRA,Non-EU,Non-HG,No,Registered,78,80,Right,168,62,8,14,16,15,16,13,12,7,14,13,12,16,13,9,18,16,9,18,2,2,2,2,14,15,16,15,sure,-
Black and Yellows,23,Kerem Demirbay,Emre Can,DM,DC/MC,32,GER,EU,HGN,No,Registered,77,78,Right,186,83,9,15,12,14,9,16,15,15,13,15,16,17,15,17,13,16,17,12,2,2,2,2,17,10,9,17,sure,-
Black and Yellows,6,Salih Özcan,Pascal Groß,MC,DM/AMC,35,TUR,Non-EU,HGN,No,Registered,77,77,Right,181,75,11,18,13,16,15,13,12,9,18,17,14,15,17,15,10,14,12,12,2,2,2,2,17,13,12,18,sure,-
Black and Yellows,38,Assan Ouédraogo,Kjell Wätjen,MC,AMC,20,GER,EU,HGC,Yes,U21 Exempt,76,83,Right,183,74,9,15,14,15,10,12,11,8,15,14,12,15,14,9,14,15,12,14,2,2,2,2,15,12,13,16,sure,-
Black and Yellows,10,Mario Götze,Julian Brandt,AMC,MC/AML,30,GER,EU,HGC,No,Registered,78,78,Right,185,82,14,17,16,17,14,9,8,10,18,16,10,15,16,13,14,15,13,15,2,2,2,2,16,16,16,17,sure,capped by band
Black and Yellows,43,Samuel Edozie,Jamie Bynoe-Gittens,AML,AMR,21,ENG,Non-EU,Non-HG,Yes,U21 Exempt,77,84,Right,179,73,13,13,18,15,13,5,4,6,13,12,6,14,13,8,18,14,11,18,2,2,2,2,13,14,18,13,sure,-
Black and Yellows,37,Paxten Aaronson,Cole Campbell,AMR,AML,20,USA,Non-EU,Non-HG,Yes,U21 Exempt,73,80,Left,176,69,12,12,16,14,12,5,4,5,13,12,6,13,12,7,17,13,10,16,2,2,2,2,12,13,16,13,sure,-
Black and Yellows,14,Tim Kleindienst,Maximilian Beier,ST,AML/AMR,23,GER,EU,HGN,No,Registered,78,82,Right,185,76,15,12,14,14,9,6,5,13,12,14,7,17,14,10,18,16,13,16,2,2,2,2,15,17,13,15,sure,-
Black and Yellows,18,Youssoufa Moukoko,Paris Brunner,ST,AML,20,GER,EU,HGC,Yes,U21 Exempt,76,83,Right,186,79,14,11,14,13,7,5,4,14,10,12,6,14,13,9,16,14,15,14,2,2,2,2,14,15,13,13,sure,-
```

### Red Bulls (RB Leipzig)
**Reputation:** 83 | **CA Band:** 69–78

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Red Bulls,26,Tobe Leysen,Maarten Vandevoordt,GK,-,24,BEL,EU,Non-HG,No,Registered,77,81,Right,192,86,2,13,4,11,2,4,3,4,12,15,15,10,15,11,10,10,13,14,16,15,15,16,15,2,3,13,sure,-
Red Bulls,1,Daniel Batz,Leopold Zingerle,GK,-,32,GER,EU,HGN,No,Registered,70,70,Right,186,80,2,10,3,9,2,3,3,4,9,13,14,10,13,10,8,9,12,13,14,14,14,13,14,2,2,12,sure,-
Red Bulls,16,Mitchell Weiser,Lukas Klostermann,DL,DC/DR,30,GER,EU,HGN,No,Registered,77,77,Right,189,83,5,13,12,13,12,16,16,15,11,14,16,16,14,13,17,16,16,13,2,2,2,2,16,11,7,16,sure,-
Red Bulls,5,Ismaël Doukouré,El Chadaille Bitshiabu,DC,DL,21,FRA,EU,Non-HG,Yes,U21 Exempt,76,84,Left,196,96,4,13,9,12,5,15,15,16,10,13,15,14,13,9,14,13,19,10,2,2,2,2,15,6,5,15,sure,-
Red Bulls,22,Milan Gajić,Kosta Nedeljković,DC,DR,20,SRB,Non-EU,Non-HG,Yes,U21 Exempt,74,81,Right,184,77,4,12,10,12,6,15,14,14,9,13,15,15,13,8,16,15,14,13,2,2,2,2,15,7,6,15,sure,-
Red Bulls,3,Neraysho Kasanwirjo,Lutsharel Geertruida,DR,DC/DM,26,NED,EU,Non-HG,No,Registered,78,78,Right,184,80,7,15,13,15,13,16,16,15,13,16,16,16,16,14,15,16,16,13,2,2,2,2,16,12,10,17,sure,-
Red Bulls,13,Nicolas Seiwald,Arthur Vermeeren,DM,MC,21,AUT,EU,Non-HG,Yes,U21 Exempt,77,83,Right,176,68,7,16,13,15,9,15,14,10,15,15,15,16,15,10,13,16,12,14,2,2,2,2,16,10,11,17,sure,-
Red Bulls,8,Diadie Samassékou,Amadou Haidara,DM,MC,28,MLI,Non-EU,Non-HG,No,Registered,77,77,Right,175,72,10,15,14,15,10,16,15,11,14,15,15,18,14,12,14,18,14,14,2,2,2,2,16,12,11,17,sure,-
Red Bulls,44,Rene Krhin,Kevin Kampl,MC,DM,35,SVN,EU,Non-HG,No,Registered,74,74,Right,178,68,9,16,15,16,11,12,11,7,16,16,13,15,16,15,12,13,10,15,2,2,2,2,16,12,15,17,sure,-
Red Bulls,18,Sidney Raebiger,Assan Ouédraogo,MC,AMC,20,GER,EU,HGC,Yes,U21 Exempt,75,85,Right,191,82,11,15,15,15,10,13,12,12,15,14,12,16,14,9,15,16,15,14,2,2,2,2,15,14,14,16,sure,-
Red Bulls,7,Noa Lang,Xavi Simons,AML,AMC/AMR,23,NED,EU,Non-HG,No,Registered,78,78,Right,179,70,15,16,18,17,14,8,7,8,17,15,8,16,16,12,17,16,12,18,2,2,2,2,15,17,18,16,sure,capped by band
Red Bulls,24,Enis Bardhi,Eljif Elmas,AMR,AMC/AML,26,MKD,Non-EU,Non-HG,No,Registered,77,77,Right,182,74,13,15,15,15,12,10,9,10,15,14,9,16,14,11,15,16,13,15,2,2,2,2,15,15,14,16,sure,-
Red Bulls,14,Christoph Baumgartner,Benjamin Šeško,ST,-,23,AUT,EU,Non-HG,No,Registered,78,78,Right,195,85,16,13,14,15,7,5,4,17,12,14,7,16,15,11,17,15,17,14,2,2,2,2,15,17,13,15,sure,capped by band
Red Bulls,9,Andreas Cornelius,Yussuf Poulsen,ST,AMR,32,DEN,EU,Non-HG,No,Registered,74,74,Right,192,84,13,12,12,13,8,9,8,17,11,13,8,19,13,16,14,17,17,12,2,2,2,2,15,16,10,18,sure,-
```

### Frankfurt Eagles (Eintracht Frankfurt)
**Reputation:** 81 | **CA Band:** 67–76

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Frankfurt Eagles,33,Tobias Sippel,Jens Grahl,GK,-,37,GER,EU,HGN,No,Registered,70,70,Right,193,88,2,10,3,9,2,3,3,4,9,13,14,10,13,11,7,8,13,12,14,14,14,13,14,2,2,12,sure,-
Frankfurt Eagles,40,Mio Backhaus,Nils Ramming,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,72,78,Right,190,83,2,10,3,8,2,3,3,4,8,13,13,9,13,8,8,9,12,13,14,13,14,13,13,2,2,12,sure,-
Frankfurt Eagles,29,Faitout Maouassa,Niels Nkounkou,DL,WBL/ML,25,FRA,EU,Non-HG,No,Registered,75,76,Left,184,78,8,13,15,14,15,13,12,11,12,12,13,16,12,9,18,17,14,16,2,2,2,2,14,14,13,15,sure,-
Frankfurt Eagles,35,Bernardo,Tuta,DC,DR/DM,27,BRA,Non-EU,Non-HG,No,Registered,76,76,Right,185,81,5,13,10,12,6,16,15,15,10,14,16,15,14,11,14,15,15,13,2,2,2,2,16,7,6,16,sure,-
Frankfurt Eagles,5,Cédric Zesiger,Aurèle Amenda,DC,-,22,SUI,Non-EU,Non-HG,No,Registered,75,80,Right,197,93,3,11,8,11,4,15,15,16,9,13,15,14,13,9,13,13,18,10,2,2,2,2,15,6,4,15,sure,-
Frankfurt Eagles,34,Jordan Torunarigha,Nnamdi Collins,DR,DC,22,GER,EU,HGN,No,Registered,75,76,Right,191,84,5,12,12,12,12,15,14,14,9,13,14,15,12,8,18,16,16,14,2,2,2,2,14,11,9,15,sure,-
Frankfurt Eagles,16,Williot Swedberg,Hugo Larsson,MC,DM,22,SWE,EU,Non-HG,No,Registered,76,76,Right,187,78,10,16,14,16,11,14,13,11,15,15,14,18,15,11,15,18,13,14,2,2,2,2,16,13,12,17,sure,-
Frankfurt Eagles,8,Nadiem Amiri,Mahmoud Dahoud,MC,DM,30,GER,EU,HGN,No,Registered,75,75,Right,178,69,10,16,15,16,11,12,11,7,16,15,12,15,15,10,13,14,11,15,2,2,2,2,15,12,15,16,sure,-
Frankfurt Eagles,6,Maurits Kjærgaard,Oscar Højlund,MC,DM,21,DEN,EU,Non-HG,Yes,U21 Exempt,75,76,Right,184,76,9,14,13,14,10,13,12,10,14,14,13,17,13,9,14,16,13,14,2,2,2,2,15,12,11,16,sure,-
Frankfurt Eagles,19,Kenan Karaman,Can Uzun,AML,AMC/ST,20,TUR,Non-EU,HGC,Yes,U21 Exempt,75,85,Right,186,77,15,14,16,16,11,6,5,12,15,13,7,14,14,9,15,14,13,16,2,2,2,2,14,16,16,14,sure,-
Frankfurt Eagles,27,Nathanaël Mbuku,Jean-Mattéo Bahoya,AML,AMC,21,FRA,EU,Non-HG,Yes,U21 Exempt,74,80,Right,180,72,12,13,16,15,12,5,4,7,13,12,6,13,12,8,16,13,11,16,2,2,2,2,13,13,16,13,sure,-
Frankfurt Eagles,36,Faride Alidou,Ansgar Knauff,AMR,AML/WBR,24,GER,EU,HGC,No,Registered,75,76,Right,180,73,13,12,16,14,14,8,7,8,12,12,8,16,12,9,18,16,12,17,2,2,2,2,13,15,14,14,sure,-
Frankfurt Eagles,11,Sekou Mara,Elye Wahi,ST,AML,24,FRA,EU,Non-HG,No,Registered,76,76,Right,189,75,15,14,16,15,10,5,4,13,14,13,7,14,14,9,16,14,12,16,2,2,2,2,15,16,16,14,sure,-
Frankfurt Eagles,9,Petar Musa,Igor Matanović,ST,-,23,CRO,EU,Non-HG,No,Registered,75,76,Right,194,88,15,10,11,13,6,6,5,17,10,13,6,15,13,10,13,14,18,11,2,2,2,2,14,16,9,15,sure,-
```

---

## 4. Ligue 1

### Lutece SG (Paris Saint-Germain FC)
**Reputation:** 91 | **CA Band:** 74–83

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lutece SG,39,Danil Krugovoy,Matvei Safonov,GK,-,27,RUS,Non-EU,Non-HG,No,Registered,80,83,Right,192,85,2,13,4,10,2,3,3,4,11,14,15,10,15,13,9,10,14,14,16,15,15,14,15,2,3,13,sure,-
Lutece SG,80,Joan García,Arnau Tenas,GK,-,25,ESP,EU,Non-HG,No,Registered,76,80,Right,185,78,2,13,5,11,2,3,3,4,12,14,14,10,14,10,10,10,12,14,15,14,14,16,14,2,3,13,sure,-
Lutece SG,35,Robert Renan,Lucas Beraldo,DL,DC,22,BRA,Non-EU,Non-HG,No,Registered,79,86,Left,182,76,5,15,12,14,10,15,15,13,13,15,15,14,16,10,14,14,13,13,2,2,2,2,15,9,9,16,sure,-
Lutece SG,21,Clément Lenglet,Lucas Hernández,DC,DL,30,FRA,EU,HGN,No,Registered,81,81,Left,184,79,5,13,10,12,7,16,16,15,10,15,16,16,14,14,15,14,15,12,2,2,2,2,16,6,5,16,sure,-
Lutece SG,3,Mouctar Diakhaby,Presnel Kimpembe,DC,-,30,FRA,EU,HGC,No,Registered,78,78,Left,189,82,4,12,8,11,4,16,15,15,9,13,15,14,13,14,13,13,16,11,2,2,2,2,15,5,4,15,sure,-
Lutece SG,42,Saël Kumbedi,Yoram Zague,DR,DL,20,FRA,EU,HGC,Yes,U21 Exempt,74,83,Right,176,68,6,12,13,12,13,14,13,10,10,12,13,15,12,8,16,15,11,15,2,2,2,2,13,12,11,14,sure,-
Lutece SG,4,Gabriel Moscardo,Manuel Ugarte,DM,MC,25,BRA,Non-EU,Non-HG,No,Registered,81,83,Right,182,77,5,13,11,13,6,17,15,12,11,15,15,18,14,11,14,18,15,13,2,2,2,2,17,8,7,17,sure,-
Lutece SG,33,Lesley Ugochukwu,Warren Zaïre-Emery,MC,DM/DR,20,FRA,EU,HGC,Yes,U21 Exempt,82,92,Right,178,74,11,15,14,15,10,14,13,10,15,15,14,18,15,12,15,18,14,14,2,2,2,2,15,14,12,17,sure,-
Lutece SG,24,Ayyoub Bouaddi,Senny Mayulu,MC,AMC,20,FRA,EU,HGC,Yes,U21 Exempt,74,84,Right,180,72,11,14,14,14,10,11,10,8,14,13,11,15,13,8,14,15,12,14,2,2,2,2,14,13,13,15,sure,-
Lutece SG,19,Jeong Woo-yeong,Lee Kang-in,AMC,AMR/MC,25,KOR,Non-EU,Non-HG,No,Registered,81,83,Left,173,68,13,16,17,17,13,7,6,5,17,15,8,14,15,10,13,14,11,17,2,2,2,2,14,14,18,15,sure,-
Lutece SG,29,Désiré Doué,Bradley Barcola,AML,AMR/ST,23,FRA,EU,HGN,No,Registered,82,87,Right,186,75,14,13,17,15,13,5,4,8,14,13,7,15,13,9,18,14,12,17,2,2,2,2,14,16,16,14,sure,-
Lutece SG,11,Pablo Sarabia,Marco Asensio,AMR,AMC/AML,30,ESP,EU,Non-HG,No,Registered,80,80,Left,182,76,15,15,15,15,13,6,5,9,15,14,7,12,15,11,12,12,12,14,2,2,2,2,14,15,15,14,sure,-
Lutece SG,23,Moussa Dembélé,Randal Kolo Muani,ST,AMR/AML,27,FRA,EU,HGN,No,Registered,81,82,Right,187,77,15,12,14,14,9,6,5,13,12,13,6,16,13,10,17,15,14,15,2,2,2,2,14,16,14,14,sure,-
Lutece SG,38,Ayoub Amraoui,Naoufel El Hannach,DR,DC,19,MAR,Non-EU,HGC,Yes,U21 Exempt,68,81,Right,181,73,5,12,11,12,11,13,13,11,10,12,13,14,12,8,15,14,12,13,2,2,2,2,13,11,10,14,sure,-
```

### Monégasques (AS Monaco FC)
**Reputation:** 82 | **CA Band:** 68–77

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Monégasques,1,Kamil Grabara,Radosław Majecki,GK,-,26,POL,EU,Non-HG,No,Registered,76,76,Right,193,85,2,11,4,10,2,3,3,4,10,14,15,10,15,11,9,9,13,14,16,15,15,14,15,2,3,13,sure,-
Monégasques,16,Stefan Bajic,Yann Liénard,GK,-,23,FRA,EU,HGC,No,Registered,72,75,Right,192,82,2,10,3,9,2,3,3,4,9,13,14,10,13,9,8,9,12,13,14,14,14,13,14,2,2,12,sure,-
Monégasques,20,Kassoum Ouattara,Christian Mawissa,DL,DC/DR,21,FRA,EU,Non-HG,Yes,U21 Exempt,74,82,Left,182,76,5,13,12,13,13,15,15,13,11,13,14,16,13,9,16,16,14,14,2,2,2,2,14,12,10,15,sure,-
Monégasques,5,Odilon Kossounou,Wilfried Singo,DC,DR,25,CIV,Non-EU,Non-HG,No,Registered,77,77,Right,190,81,6,13,12,13,11,16,16,17,11,14,16,16,14,12,17,16,17,14,2,2,2,2,16,8,8,16,sure,-
Monégasques,4,Robin Knoche,Thilo Kehrer,DC,DR/DL,29,GER,EU,Non-HG,No,Registered,76,76,Right,186,79,5,13,10,13,8,16,15,15,11,14,16,15,14,13,15,15,15,13,2,2,2,2,16,7,6,16,sure,-
Monégasques,2,Deyovaisio Zeefuik,Jordan Teze,DR,DC,26,NED,EU,Non-HG,No,Registered,76,76,Right,183,74,6,13,12,13,13,16,15,13,11,14,15,16,13,11,16,16,14,14,2,2,2,2,15,12,9,16,sure,-
Monégasques,8,Andy Diouf,Soungoutou Magassa,DM,DC,22,FRA,EU,HGC,No,Registered,76,81,Right,189,81,6,14,12,13,7,16,15,14,12,14,15,16,13,10,14,16,16,13,2,2,2,2,15,9,8,16,sure,-
Monégasques,88,Felix Lemaréchal,Edan Diop,MC,MR/DM,21,FRA,EU,HGC,Yes,U21 Exempt,74,80,Right,182,74,10,14,13,14,11,13,12,11,13,13,12,17,13,9,15,17,13,14,2,2,2,2,14,13,12,16,sure,-
Monégasques,34,Habib Keïta,Mamadou Coulibaly,MC,DM,22,FRA,EU,HGC,No,Registered,74,77,Right,183,75,8,14,12,13,9,14,13,11,13,14,13,16,13,9,14,16,13,13,2,2,2,2,14,11,10,16,sure,-
Monégasques,18,Ritsu Doan,Takumi Minamino,MC,AMC/AML,31,JPN,Non-EU,Non-HG,No,Registered,77,77,Right,174,68,14,15,15,15,12,11,10,10,15,15,12,18,15,13,15,17,12,16,2,2,2,2,15,17,14,17,sure,-
Monégasques,37,Alan Virginius,Malamine Efekele,AML,AMR,21,FRA,EU,HGC,Yes,U21 Exempt,74,77,Right,178,72,12,12,15,14,12,6,5,8,12,12,6,14,12,8,16,14,11,16,2,2,2,2,13,13,15,13,sure,-
Monégasques,27,Pathé Ciss,Krépin Diatta,AMR,WBR/MR,27,SEN,Non-EU,Non-HG,No,Registered,76,76,Right,173,68,12,13,16,14,14,11,10,7,13,12,9,17,13,10,18,17,11,17,2,2,2,2,13,14,15,15,sure,-
Monégasques,36,Michael Frey,Breel Embolo,ST,-,29,SUI,Non-EU,Non-HG,No,Registered,77,77,Right,187,88,15,12,14,14,7,7,6,15,12,13,7,16,14,12,16,15,19,13,2,2,2,2,15,16,12,16,sure,-
Monégasques,9,Eli Junior Kroupi,George Ilenikhena,ST,-,19,FRA,EU,Non-HG,Yes,U21 Exempt,75,85,Left,185,79,15,10,13,13,6,4,3,14,9,12,6,14,12,7,16,14,15,14,2,2,2,2,14,16,11,13,sure,-
```

### Phocéens (Olympique de Marseille)
**Reputation:** 82 | **CA Band:** 67–76

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Phocéens,1,Jeffrey de Lange,Gerónimo Rulli,GK,-,34,NED,EU,Non-HG,No,Registered,76,76,Right,189,84,2,13,4,11,2,3,3,4,12,15,15,10,15,13,9,10,13,14,16,15,15,15,15,2,3,13,sure,-
Phocéens,16,Dani Cárdenas,Rubén Blanco,GK,-,31,ESP,EU,Non-HG,No,Registered,72,72,Right,188,81,2,11,3,9,2,3,3,4,10,14,14,10,14,10,8,9,12,13,14,14,14,14,14,2,2,12,sure,-
Phocéens,6,Ricardo Rodríguez,Ulisses Garcia,DL,ML/WBL,30,SUI,Non-EU,Non-HG,No,Registered,74,74,Left,183,78,7,13,14,13,14,14,13,11,12,13,13,16,13,11,16,16,13,14,2,2,2,2,14,13,11,15,sure,-
Phocéens,4,Kamal Miller,Derek Cornelius,DC,-,28,CAN,Non-EU,Non-HG,No,Registered,75,75,Left,188,84,4,12,9,12,5,16,15,16,10,14,16,15,13,12,13,14,17,11,2,2,2,2,15,6,5,16,sure,-
Phocéens,5,Christopher Wooh,Lilian Brassier,DC,DL,26,FRA,EU,Non-HG,No,Registered,76,76,Left,186,79,4,13,10,12,6,16,15,15,11,14,16,15,14,11,14,15,15,12,2,2,2,2,16,7,6,16,sure,-
Phocéens,29,Sergi Gómez,Pol Lirola,DR,WBR/MR,28,ESP,EU,Non-HG,No,Registered,74,74,Right,183,77,8,13,14,14,14,14,13,10,12,13,13,16,13,10,16,16,13,14,2,2,2,2,14,14,12,15,sure,-
Phocéens,19,Giannelli Imbula,Geoffrey Kondogbia,DM,MC/DC,33,FRA,EU,Non-HG,No,Registered,76,76,Left,188,80,7,14,12,14,7,17,16,14,12,15,16,16,15,14,12,15,17,12,2,2,2,2,17,9,9,17,sure,-
Phocéens,21,Benjamin André,Valentin Rongier,MC,DM,31,FRA,EU,HGN,No,Registered,76,76,Right,172,67,8,16,14,15,10,15,14,9,15,16,15,18,16,16,13,18,12,14,2,2,2,2,17,11,11,18,sure,-
Phocéens,7,Haris Belkebla,Ismaël Bennacer,MC,DM,28,ALG,Non-EU,Non-HG,No,Registered,76,76,Left,175,70,9,16,16,16,11,14,13,8,16,16,14,16,16,12,14,16,12,16,2,2,2,2,16,12,15,17,sure,-
Phocéens,11,Sofiane Boufal,Amine Harit,MC,AMC/AML,29,MAR,Non-EU,Non-HG,No,Registered,76,76,Right,180,67,11,15,17,16,12,9,8,6,16,14,10,14,14,10,15,14,10,17,2,2,2,2,14,14,17,15,sure,-
Phocéens,17,Jesurun Rak-Sakyi,Jonathan Rowe,AML,AMR,23,ENG,Non-EU,Non-HG,No,Registered,75,76,Right,180,74,13,13,16,15,13,6,5,8,13,12,7,14,13,8,17,14,12,16,2,2,2,2,13,14,15,13,sure,-
Phocéens,24,Regis Mughe,François Mughe,AMR,AML,22,CMR,Non-EU,HGC,No,Registered,73,76,Right,174,68,11,11,15,13,12,5,4,7,11,11,6,13,11,7,18,13,11,16,2,2,2,2,12,13,14,12,sure,-
Phocéens,9,Neal Maupay,Elye Wahi,ST,-,23,FRA,EU,Non-HG,No,Registered,76,80,Right,184,74,15,12,15,14,8,5,4,12,12,13,7,15,13,9,18,14,13,16,2,2,2,2,15,16,14,13,sure,-
Phocéens,14,Ignatius Ganago,Faris Moumbagna,ST,-,26,CMR,Non-EU,Non-HG,No,Registered,74,75,Left,185,85,14,10,12,13,6,6,5,16,10,13,6,16,13,10,15,15,18,12,2,2,2,2,14,16,9,15,sure,-
```

### Gones (Olympique Lyonnais)
**Reputation:** 81 | **CA Band:** 66–75

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Gones,23,Cleiton,Lucas Perri,GK,-,28,BRA,Non-EU,Non-HG,No,Registered,75,75,Right,197,98,2,12,4,10,2,3,3,4,11,14,15,10,15,12,9,9,16,13,15,15,15,15,15,2,3,13,sure,-
Gones,1,Paul Nardi,Rémy Descamps,GK,-,30,FRA,EU,HGN,No,Registered,70,70,Right,196,85,2,10,3,9,2,3,3,4,9,13,14,10,13,10,8,9,13,12,14,14,14,13,14,2,2,12,sure,-
Gones,16,Ayrton Lucas,Abner Vinícius,DL,WBL,26,BRA,Non-EU,Non-HG,No,Registered,74,74,Left,181,73,6,13,13,13,14,14,14,11,11,13,14,16,13,9,16,16,13,14,2,2,2,2,14,13,11,15,sure,-
Gones,5,Filip Uremović,Duje Ćaleta-Car,DC,-,29,CRO,EU,Non-HG,No,Registered,75,75,Right,192,89,5,13,8,12,4,16,15,16,11,14,16,13,14,13,11,12,18,10,2,2,2,2,16,6,5,16,sure,-
Gones,27,Gerzino Nyamsi,Warmed Omari,DC,-,26,FRA,EU,Non-HG,No,Registered,74,74,Right,188,77,4,13,9,12,5,15,15,14,10,14,15,14,13,10,14,14,15,12,2,2,2,2,15,7,6,15,sure,-
Gones,22,Clinton Mata,Ainsley Maitland-Niles,DR,DL/MC,28,ANG,Non-EU,Non-HG,No,Registered,75,75,Right,177,71,8,14,14,14,13,14,14,10,13,14,14,15,14,11,16,16,13,15,2,2,2,2,15,13,12,16,sure,-
Gones,6,Lucas Tousart,Maxence Caqueret,MC,DM,26,FRA,EU,HGC,No,Registered,75,75,Right,174,63,8,16,15,16,11,15,14,8,16,15,14,19,15,12,14,18,11,16,2,2,2,2,17,12,13,18,sure,-
Gones,7,Morgan Sanson,Jordan Veretout,MC,DM/AMC,33,FRA,EU,HGN,No,Registered,75,75,Right,177,67,11,16,13,15,13,14,13,10,15,15,14,17,15,14,13,16,13,13,2,2,2,2,16,13,12,17,sure,-
Gones,8,Maxime Gonalons,Corentin Tolisso,MC,DM/AMC,31,FRA,EU,HGC,No,Registered,75,75,Right,181,81,13,16,13,15,11,14,13,14,15,15,14,16,15,16,12,14,15,13,2,2,2,2,16,14,12,17,sure,-
Gones,4,Eboue Kouassi,Paul Akouokou,MC,DM,28,CIV,Non-EU,Non-HG,No,Registered,72,72,Right,181,75,6,13,11,13,7,15,14,12,11,13,14,15,13,10,13,15,16,12,2,2,2,2,15,9,8,15,sure,-
Gones,37,Ernest Nuamah,Malick Fofana,AML,AMR,21,GHA,Non-EU,Non-HG,Yes,U21 Exempt,76,82,Right,169,63,13,13,17,15,13,6,5,6,13,12,6,14,12,8,18,14,10,18,2,2,2,2,13,14,17,13,sure,-
Gones,18,Maghnes Akliouche,Rayan Cherki,AMR,AMC/AML,22,FRA,EU,HGC,No,Registered,77,83,Either,176,71,14,16,18,18,13,5,4,6,17,13,6,12,14,9,14,12,13,17,2,2,2,2,14,15,20,13,sure,-
Gones,10,Wissam Ben Yedder,Alexandre Lacazette,ST,-,35,FRA,EU,HGN,No,Registered,75,75,Right,175,73,17,14,14,16,9,6,5,13,14,15,7,14,17,17,12,13,14,14,2,2,2,2,16,17,14,17,sure,-
Gones,9,Akor Adams,Gift Orban,ST,-,24,NGA,Non-EU,Non-HG,No,Registered,75,75,Right,178,70,16,11,14,14,7,5,4,12,10,13,6,15,13,8,17,14,13,16,2,2,2,2,14,16,13,13,sure,-
```

### Dogues (Lille OSC)
**Reputation:** 80 | **CA Band:** 65–74

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Dogues,1,Nicola Leali,Vito Mannone,GK,-,38,ITA,EU,Non-HG,No,Registered,71,71,Right,188,81,2,11,3,9,2,3,3,4,10,14,15,9,14,13,8,9,12,13,15,14,14,13,14,2,2,13,sure,-
Dogues,16,Bingourou Kamara,Marc-Aurèle Caillard,GK,-,32,FRA,EU,HGN,No,Registered,68,68,Right,191,85,2,10,3,9,2,3,3,4,9,13,14,9,13,10,8,9,12,12,14,13,13,12,13,2,2,12,sure,-
Dogues,5,Ludwig Augustinsson,Gabriel Gudmundsson,DL,WBL/ML,27,SWE,EU,Non-HG,No,Registered,74,74,Left,181,77,7,13,14,13,14,14,13,11,12,13,13,16,13,10,17,16,13,14,2,2,2,2,14,13,12,15,sure,-
Dogues,4,Marlon,Bafodé Diakité,DC,DR/DL,25,BRA,Non-EU,Non-HG,No,Registered,74,74,Right,185,74,7,12,11,12,9,15,15,15,10,13,15,16,13,11,15,15,15,13,2,2,2,2,15,9,7,16,sure,-
Dogues,23,Alexsandro,Alexsandro,DC,-,26,BRA,Non-EU,Non-HG,No,Registered,74,74,Left,192,88,5,12,8,12,4,15,15,16,9,14,15,14,13,12,12,13,17,11,2,2,2,2,15,6,5,15,sure,-
Dogues,22,Tomás Esteves,Tiago Santos,DR,WBR/MR,23,POR,EU,Non-HG,No,Registered,74,74,Right,175,68,7,13,16,14,15,13,12,8,13,13,13,16,13,9,17,16,11,17,2,2,2,2,14,14,15,15,sure,-
Dogues,12,Zeki Çelik,Thomas Meunier,DR,WBR,34,TUR,Non-EU,Non-HG,No,Registered,73,73,Right,190,88,8,14,12,13,13,14,14,14,12,14,15,14,14,15,12,13,16,11,2,2,2,2,15,12,10,16,sure,-
Dogues,32,Jean Onana,Ayyoub Bouaddi,MC,DM,18,FRA,EU,HGC,Yes,U21 Exempt,74,85,Right,185,73,8,15,14,15,9,13,12,10,15,14,12,15,14,8,13,15,12,14,2,2,2,2,15,11,12,16,sure,-
Dogues,8,Sérgio Oliveira,André Gomes,MC,AMC,32,POR,EU,Non-HG,No,Registered,73,73,Right,188,84,11,16,14,16,11,11,10,10,16,15,12,12,15,11,11,11,14,13,2,2,2,2,15,12,14,16,sure,-
Dogues,6,Ngal'ayel Mukau,Ngal'ayel Mukau,MC,DM,21,COD,Non-EU,HGC,Yes,U21 Exempt,74,77,Right,188,78,7,14,12,13,8,14,13,12,12,13,13,16,13,8,14,16,15,13,2,2,2,2,14,11,10,16,sure,-
Dogues,17,Sofiane Diop,Osame Sahraoui,AML,AMR,25,MAR,Non-EU,Non-HG,No,Registered,74,74,Right,170,65,12,14,17,15,13,5,4,5,14,12,6,13,12,8,16,13,9,18,2,2,2,2,13,13,17,13,sure,-
Dogues,11,Arbër Zeneli,Edon Zhegrova,AMR,AML,27,KOS,Non-EU,Non-HG,No,Registered,74,74,Left,181,72,14,13,17,15,13,4,4,6,14,12,6,12,13,8,16,12,11,17,2,2,2,2,13,14,18,12,sure,-
Dogues,27,Aliou Badji,Mohamed Bayo,ST,-,28,GUI,Non-EU,Non-HG,No,Registered,73,73,Right,188,82,14,10,11,13,6,5,4,16,10,13,6,15,13,10,14,14,17,12,2,2,2,2,14,16,9,15,sure,-
Dogues,9,Mohamed Daramy,Matías Fernández-Pardo,ST,AML,21,DEN,EU,Non-HG,Yes,U21 Exempt,74,82,Right,184,76,14,11,14,14,8,5,4,12,11,12,6,14,12,8,16,13,12,15,2,2,2,2,13,15,13,13,sure,-
```