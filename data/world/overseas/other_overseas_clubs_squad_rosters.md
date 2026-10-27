# Other Overseas Clubs: Full 25-Man Squad Database (2026/27)

Full first-team squads (25 players each) for the 56 La Liga, Serie A, Bundesliga and Ligue 1 clubs that are not in the big-club file, so every club in the four overseas leagues can be scouted.
All names are fictional and unique. `inspired_by` is `-` because these are generated players, not stand-ins for specific real people; `confidence` is `generated`.
Schema, attribute order and registration fields are identical to the big-club file. CA bands follow the same reputation curve: band minimum = 66 + 0.65 x (reputation - 80), width 10 (reputation 80 -> 66–75).
Squad-shape rules: 3 goalkeepers, 2 left backs, 4 centre backs, 2 right backs, 2 defensive midfielders, 3-4 central midfielders, wide and central attackers, 3 strikers; 4 players aged 21 or under; Spanish clubs have at most 3 Non-EU players and goalkeepers numbered 1, 13 and 25.

---

## 1. La Liga

### Txuri-Urdin (Real Sociedad de Fútbol)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Txuri-Urdin,1,Gonzalo Aguilera,-,GK,-,25,ESP,EU,HGN,No,Registered,71,71,Right,189,85,2,9,5,9,2,3,3,4,11,15,13,8,15,12,12,10,13,15,15,13,13,15,15,2,2,12,generated,-
Txuri-Urdin,3,Kasper Dalsgaard,-,DL,-,26,DEN,EU,Non-HG,No,Registered,74,76,Left,183,81,7,15,16,14,13,14,16,9,10,13,15,17,14,9,15,14,15,14,2,2,2,2,16,12,10,15,generated,capped by band
Txuri-Urdin,4,Edoardo Farina,-,DC,DL/DM,31,ITA,EU,Non-HG,No,Registered,70,70,Left,189,93,2,11,9,10,5,14,14,15,8,14,14,13,13,13,13,15,13,11,2,2,2,2,14,6,6,15,generated,-
Txuri-Urdin,5,Guillermo Cáceres,-,DC,-,32,COL,Non-EU,Non-HG,No,Registered,74,74,Right,192,87,5,14,9,12,8,15,15,16,11,12,16,15,12,12,12,12,17,10,2,2,2,2,15,7,4,13,generated,capped by band
Txuri-Urdin,2,Mathias Thomsen,-,DR,WBR/DC,23,DEN,EU,HGN,No,Registered,73,77,Left,182,77,8,15,14,12,15,15,14,12,11,12,15,14,13,10,14,16,13,14,2,2,2,2,13,12,11,15,generated,-
Txuri-Urdin,6,Chidera Balogun,-,DM,DC,27,NGA,Non-EU,Non-HG,No,Registered,70,73,Right,182,82,7,13,11,13,9,14,13,9,13,14,15,15,13,12,13,13,14,11,2,2,2,2,14,8,8,15,generated,-
Txuri-Urdin,8,Loïc Perrot,-,MC,-,28,FRA,EU,Non-HG,No,Registered,73,73,Right,172,68,11,14,14,14,10,15,11,11,14,15,12,15,15,11,14,15,13,15,2,2,2,2,15,14,12,15,generated,-
Txuri-Urdin,10,Pedro Casado,-,MC,-,21,ESP,EU,HGC,Yes,U21 Exempt,69,77,Right,177,79,9,14,14,12,9,13,11,7,14,13,11,15,15,11,12,14,13,12,2,2,2,2,13,14,11,16,generated,-
Txuri-Urdin,11,Oskar Rutkowski,-,AML,AMC,27,POL,EU,Non-HG,No,Registered,73,73,Left,179,77,14,15,17,15,14,5,7,9,13,12,8,14,13,10,13,14,11,14,2,2,2,2,14,14,16,11,generated,-
Txuri-Urdin,7,Miguel Delgado,-,AMR,MR,23,ARG,Non-EU,Non-HG,No,Registered,73,77,Right,184,79,11,13,15,15,14,6,7,9,14,14,7,13,14,9,15,15,11,15,2,2,2,2,14,16,15,13,generated,-
Txuri-Urdin,9,Jaime Aguilera,-,ST,-,24,ESP,EU,HGC,No,Registered,70,74,Right,187,83,16,10,13,13,6,6,5,15,12,13,6,15,13,10,14,15,13,11,2,2,2,2,13,14,11,12,generated,-
Txuri-Urdin,13,Nicolò Farina,-,GK,-,21,ITA,EU,HGN,Yes,U21 Exempt,65,70,Right,187,78,2,9,2,10,2,3,3,4,10,13,13,10,13,10,10,5,11,13,14,13,12,13,13,2,2,11,generated,-
Txuri-Urdin,23,Unai Ferrer,-,DL,DC,27,ESP,EU,HGC,No,Registered,69,72,Left,182,72,6,14,14,14,15,14,13,12,11,13,12,14,11,10,15,13,12,14,2,2,2,2,15,13,12,15,generated,-
Txuri-Urdin,15,Kevin Beekman,-,DC,DM,23,NED,EU,Non-HG,No,Registered,71,76,Either,186,82,4,12,7,12,5,15,14,16,11,10,16,14,11,11,10,15,15,12,2,2,2,2,16,5,5,11,generated,-
Txuri-Urdin,24,Tomás Segura,-,DC,DM,26,ESP,EU,HGC,No,Registered,66,68,Right,191,89,5,10,9,11,6,13,14,15,9,11,13,11,11,10,11,11,14,10,2,2,2,2,15,5,5,11,generated,-
Txuri-Urdin,22,Miguel Castaño,-,DR,-,20,ESP,EU,HGN,Yes,U21 Exempt,68,78,Right,183,76,7,15,15,13,13,12,12,8,10,11,12,15,14,10,14,15,11,14,2,2,2,2,15,12,10,14,generated,-
Txuri-Urdin,14,Adrián Naranjo,-,DM,-,31,ESP,EU,HGN,No,Registered,66,66,Right,181,79,7,13,12,12,7,12,14,10,14,13,12,14,12,10,12,14,14,13,2,2,2,2,11,10,11,15,generated,-
Txuri-Urdin,30,Víctor Lorente,-,MC,-,20,ESP,EU,HGC,Yes,U21 Exempt,66,71,Right,174,75,9,15,12,13,8,11,10,8,14,13,11,13,13,11,12,12,10,12,2,2,2,2,13,13,9,13,generated,-
Txuri-Urdin,17,Pablo Quintero,-,AMC,AML,30,ESP,EU,HGC,No,Registered,68,68,Right,177,76,12,14,12,14,11,9,7,8,14,15,10,14,15,10,13,13,11,15,2,2,2,2,14,15,12,15,generated,-
Txuri-Urdin,21,Aitor Lara,-,AML,ST/ML,28,ESP,EU,Non-HG,No,Registered,68,69,Left,184,80,12,13,15,14,10,7,4,7,10,11,7,11,10,8,15,13,14,16,2,2,2,2,15,13,15,14,generated,-
Txuri-Urdin,19,Adrián Maldonado,-,AMR,ST/AMC,20,ESP,EU,Non-HG,Yes,U21 Exempt,68,80,Right,179,76,11,15,13,14,15,4,7,8,15,10,8,13,15,8,13,12,9,14,2,2,2,2,13,13,15,12,generated,-
Txuri-Urdin,18,Robin Brandt,-,ST,AML,21,GER,EU,HGN,Yes,U21 Exempt,66,74,Left,184,77,14,8,13,12,7,7,4,13,8,14,5,12,11,11,12,13,14,13,2,2,2,2,12,15,12,14,generated,-
Txuri-Urdin,25,Héctor Alcázar,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,66,81,Right,186,80,2,11,5,9,2,3,3,4,9,13,14,10,13,10,6,9,13,11,14,13,14,11,14,2,2,10,generated,-
Txuri-Urdin,31,Daniel Trujillo,-,MC,DM,17,ESP,EU,HGC,Yes,U21 Exempt,65,76,Right,182,75,10,14,13,12,9,12,9,10,13,13,11,13,13,11,11,13,10,12,2,2,2,2,13,12,11,14,generated,-
Txuri-Urdin,32,Javier Segura,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,68,82,Right,186,91,14,12,14,11,8,4,4,15,12,13,6,14,13,11,14,13,15,13,2,2,2,2,13,14,8,14,generated,-
```

### Verdiblancos (Real Betis Balompié)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Verdiblancos,1,Xavi Robles,-,GK,-,25,ESP,EU,HGN,No,Registered,74,75,Right,183,83,2,12,2,9,2,3,3,4,10,16,14,11,16,10,8,11,13,16,15,13,14,16,15,2,2,14,generated,capped by band
Verdiblancos,3,José Loureiro,-,DL,DC/ML,36,POR,EU,Non-HG,No,Registered,74,74,Left,185,83,7,14,14,11,14,15,14,13,10,14,16,14,14,10,15,17,11,15,2,2,2,2,14,15,11,15,generated,capped by band
Verdiblancos,4,Christian Madsen,-,DC,DR,29,DEN,EU,Non-HG,No,Registered,73,73,Right,184,74,3,11,10,13,6,17,14,14,9,13,15,14,13,12,11,13,16,11,2,2,2,2,14,4,2,15,generated,-
Verdiblancos,5,Joaquín Fajardo,-,DC,DM,24,ESP,EU,HGN,No,Registered,74,76,Right,184,78,6,13,9,13,5,15,13,15,9,16,15,14,15,12,12,14,16,12,2,2,2,2,16,6,6,14,generated,capped by band
Verdiblancos,2,Florian Blanchet,-,DR,-,29,FRA,EU,Non-HG,No,Registered,73,73,Right,181,77,8,16,13,13,14,15,14,9,10,13,13,16,14,11,14,17,11,15,2,2,2,2,15,13,11,15,generated,-
Verdiblancos,6,Marc Cabrera,-,DM,MC,28,ESP,EU,HGC,No,Registered,73,76,Right,175,72,8,15,10,13,11,15,13,12,13,15,14,16,13,11,13,12,12,11,2,2,2,2,16,9,9,16,generated,-
Verdiblancos,8,Victor Yakubu,-,MC,DM,29,NGA,Non-EU,Non-HG,No,Registered,72,72,Right,178,75,9,16,14,16,10,11,11,8,14,13,12,14,14,11,13,13,11,14,2,2,2,2,12,14,13,16,generated,-
Verdiblancos,10,Marcos Salcedo,-,MC,AMC,22,ESP,EU,HGC,No,Registered,73,78,Right,187,87,13,16,14,15,10,13,12,9,15,15,13,14,12,12,12,14,13,14,2,2,2,2,13,13,12,16,generated,-
Verdiblancos,11,Javier Montero,-,AML,ST,26,ESP,EU,HGC,No,Registered,72,72,Left,177,72,12,13,15,13,16,7,5,9,15,12,10,14,15,9,15,13,10,12,2,2,2,2,13,14,17,13,generated,-
Verdiblancos,7,Filippo Silvestri,-,AMR,ST,27,ITA,EU,Non-HG,No,Registered,74,77,Right,180,70,13,12,16,15,15,7,5,9,15,13,8,12,15,9,15,15,12,15,2,2,2,2,13,14,14,16,generated,capped by band
Verdiblancos,9,Álvaro Castaño,-,ST,AMR,31,ESP,EU,HGC,No,Registered,74,74,Right,181,69,16,13,15,13,9,6,5,16,10,15,6,14,14,11,14,14,15,12,2,2,2,2,14,15,13,15,generated,capped by band
Verdiblancos,13,Jamie Holt,-,GK,-,23,USA,Non-EU,Non-HG,No,Registered,65,70,Right,186,78,2,12,3,8,2,3,3,4,9,13,14,7,13,11,9,9,11,12,11,14,15,13,13,2,2,11,generated,-
Verdiblancos,23,Andrés Marín,-,DL,-,23,ESP,EU,HGC,No,Registered,69,74,Right,182,77,5,14,14,12,11,16,12,11,11,13,16,13,15,10,16,13,12,13,2,2,2,2,14,11,10,13,generated,-
Verdiblancos,15,Drissa Koné,-,DC,DR,25,SEN,Non-EU,Non-HG,No,Registered,65,68,Left,184,77,3,13,9,11,7,13,13,13,9,15,12,14,14,11,15,12,11,10,2,2,2,2,13,7,4,14,generated,-
Verdiblancos,24,Hélder Rebelo,-,DC,-,26,POR,EU,Non-HG,No,Registered,66,66,Right,185,74,3,12,7,11,5,13,16,12,10,11,13,13,11,11,11,12,16,8,2,2,2,2,13,7,5,11,generated,-
Verdiblancos,22,Andrés Zamora,-,DR,-,27,ESP,EU,HGN,No,Registered,69,72,Right,182,80,7,13,13,13,15,14,14,11,9,12,13,12,10,10,16,14,13,13,2,2,2,2,13,12,9,13,generated,-
Verdiblancos,14,Martín Soriano,-,DM,-,25,ESP,EU,HGN,No,Registered,73,76,Right,190,90,9,14,11,13,7,15,12,11,12,14,14,17,14,11,14,12,12,14,2,2,2,2,17,9,9,17,generated,-
Verdiblancos,30,Guillermo Soriano,-,MC,AMC,19,ESP,EU,HGN,Yes,U21 Exempt,68,80,Right,187,87,11,14,14,14,12,12,11,10,15,14,11,12,12,10,12,12,12,12,2,2,2,2,13,13,12,15,generated,-
Verdiblancos,17,Ante Horvat,-,AMC,-,25,CRO,EU,Non-HG,No,Registered,71,74,Right,176,69,12,14,16,14,13,9,10,9,16,13,12,13,14,11,12,14,13,14,2,2,2,2,13,14,14,14,generated,-
Verdiblancos,21,Héctor Medina,-,AML,-,25,ESP,EU,HGN,No,Registered,66,69,Right,186,80,12,12,14,13,8,6,4,9,9,11,6,14,9,8,16,11,10,15,2,2,2,2,13,15,13,11,generated,-
Verdiblancos,19,Giovanni Farina,-,AMR,ST,25,ITA,EU,Non-HG,No,Registered,67,69,Right,174,71,12,11,14,13,10,7,4,9,11,12,9,12,11,9,14,12,11,15,2,2,2,2,13,16,14,10,generated,-
Verdiblancos,18,Vasco Ribeiro,-,ST,AMC,22,POR,EU,Non-HG,No,Registered,67,74,Left,187,84,13,11,14,14,8,5,5,13,11,13,8,12,12,7,15,12,13,12,2,2,2,2,13,14,11,14,generated,-
Verdiblancos,25,Raúl Varela,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,65,79,Right,183,83,2,11,4,10,2,3,3,4,11,12,13,10,12,10,9,6,10,13,15,12,13,12,13,2,2,12,generated,-
Verdiblancos,31,Hugo Cano,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,67,77,Right,179,75,10,15,10,12,10,12,12,10,13,14,12,13,13,10,10,12,14,13,2,2,2,2,13,13,11,15,generated,-
Verdiblancos,32,Marcos Alcázar,-,ST,-,19,ESP,EU,HGC,Yes,U21 Exempt,68,81,Right,173,70,14,11,12,12,8,5,5,12,11,12,6,12,16,8,16,14,12,13,2,2,2,2,12,14,10,13,generated,-
```

### Hispalenses (Sevilla FC)
**Reputation:** 77 | **CA Band:** 64–73 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Hispalenses,1,Aitor Villalba,-,GK,-,35,MEX,Non-EU,Non-HG,No,Registered,72,72,Right,194,91,2,10,3,10,2,3,3,4,11,14,14,10,13,10,9,10,14,15,15,15,14,14,15,2,2,12,generated,-
Hispalenses,3,Davi Pacheco,-,DL,-,26,BRA,Non-EU,Non-HG,No,Registered,73,73,Right,180,76,7,15,15,13,15,14,15,12,12,13,15,13,13,10,15,14,14,15,2,2,2,2,13,10,11,16,generated,capped by band
Hispalenses,4,Aitor Soriano,-,DC,-,35,ESP,EU,HGC,No,Registered,73,73,Right,189,89,4,12,8,14,5,17,13,16,10,12,14,14,12,14,12,13,16,12,2,2,2,2,17,7,8,13,generated,capped by band
Hispalenses,5,Fernando Quintero,-,DC,DL,29,ESP,EU,HGN,No,Registered,73,73,Right,183,79,3,13,10,11,5,13,15,17,9,12,16,16,12,13,12,12,17,10,2,2,2,2,15,7,7,13,generated,capped by band
Hispalenses,2,Miguel Guedes,-,DR,-,25,POR,EU,Non-HG,No,Registered,73,73,Right,179,79,6,16,15,13,12,14,16,10,12,14,14,15,15,11,13,18,12,15,2,2,2,2,13,14,10,14,generated,capped by band
Hispalenses,6,Tomás Vidal,-,DM,-,31,ESP,EU,HGN,No,Registered,73,73,Right,181,73,8,11,13,14,9,15,16,13,15,13,16,11,12,11,13,16,16,12,2,2,2,2,16,9,9,17,generated,capped by band
Hispalenses,8,Marius Constantin,-,MC,-,29,ROU,EU,Non-HG,No,Registered,72,72,Left,188,89,8,15,13,12,10,14,12,10,15,16,13,14,13,10,14,14,13,15,2,2,2,2,15,15,13,15,generated,-
Hispalenses,10,Julien Gaillard,-,MC,-,26,FRA,EU,Non-HG,No,Registered,71,71,Right,178,71,11,15,13,14,11,13,11,9,14,14,11,13,14,10,14,14,12,13,2,2,2,2,14,12,12,17,generated,-
Hispalenses,11,Dídac Escudero,-,AML,ML/AMC,32,ESP,EU,HGC,No,Registered,73,73,Left,179,76,14,15,14,15,15,7,6,8,15,13,6,13,14,9,16,12,12,14,2,2,2,2,15,13,15,14,generated,capped by band
Hispalenses,7,Dídac Robles,-,AMR,-,25,ESP,EU,HGN,No,Registered,71,73,Either,184,80,13,12,16,14,12,7,6,8,12,11,6,12,12,8,15,14,12,16,2,2,2,2,13,14,14,13,generated,-
Hispalenses,9,Marcos Izquierdo,-,ST,-,28,ESP,EU,HGC,No,Registered,73,75,Right,185,84,14,11,16,14,9,6,4,15,11,15,6,15,13,11,16,14,14,14,2,2,2,2,14,15,13,15,generated,capped by band
Hispalenses,13,Miguel Domingues,-,GK,-,24,POR,EU,Non-HG,No,Registered,69,73,Right,187,85,2,11,2,8,2,3,3,4,10,12,15,8,13,9,9,10,13,13,15,13,14,13,14,2,2,10,generated,-
Hispalenses,23,Léo Fournier,-,DL,-,25,FRA,EU,Non-HG,No,Registered,64,65,Left,185,80,7,11,11,12,13,14,13,9,9,10,12,11,11,9,16,14,13,11,2,2,2,2,11,9,9,11,generated,-
Hispalenses,30,Rubén Medina,-,DC,-,20,ESP,EU,HGN,Yes,U21 Exempt,67,79,Right,189,83,4,11,8,9,6,13,12,15,10,13,14,14,13,11,12,13,15,13,2,2,2,2,14,6,6,13,generated,-
Hispalenses,15,Lucas Casado,-,DC,DM,24,ESP,EU,HGN,No,Registered,67,70,Left,181,82,4,13,9,13,6,13,14,14,10,10,14,12,11,10,11,13,16,12,2,2,2,2,15,6,4,11,generated,-
Hispalenses,22,Rayan Blanchet,-,DR,-,20,FRA,EU,Non-HG,Yes,U21 Exempt,66,72,Left,177,79,5,13,13,11,14,12,13,9,10,11,14,12,11,10,14,14,11,14,2,2,2,2,13,12,9,13,generated,-
Hispalenses,14,Fernando Garrido,-,DM,DC,24,ESP,EU,HGN,No,Registered,65,70,Right,186,82,7,13,11,13,7,12,14,12,14,11,11,14,12,11,10,15,14,13,2,2,2,2,14,9,10,13,generated,-
Hispalenses,16,Dino Horvat,-,MC,DM,24,CRO,EU,Non-HG,No,Registered,65,67,Left,181,83,10,11,14,12,11,14,10,9,13,14,11,14,13,9,12,14,11,13,2,2,2,2,13,13,10,14,generated,-
Hispalenses,17,Marcin Sadowski,-,AMC,-,24,POL,EU,Non-HG,No,Registered,66,72,Right,181,79,11,11,15,14,10,8,7,6,14,13,9,12,12,12,12,13,12,14,2,2,2,2,12,14,14,13,generated,-
Hispalenses,21,Hicham Boukhari,-,AML,AMC,25,MAR,Non-EU,Non-HG,No,Registered,66,66,Left,180,73,11,11,13,14,11,6,4,9,11,10,6,12,11,10,14,11,12,15,2,2,2,2,12,14,15,14,generated,-
Hispalenses,19,Cristian Peláez,-,AMR,-,20,ESP,EU,HGC,Yes,U21 Exempt,67,79,Right,172,64,11,12,13,15,11,7,4,8,11,11,8,13,12,7,14,14,9,14,2,2,2,2,11,15,15,12,generated,-
Hispalenses,18,Rúben Pinheiro,-,ST,AML,27,POR,EU,Non-HG,No,Registered,65,66,Left,180,74,13,10,12,13,7,5,7,11,9,12,5,12,14,9,14,14,12,13,2,2,2,2,12,14,11,12,generated,-
Hispalenses,25,Ivo Ortuño,-,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,64,72,Left,193,88,2,8,2,8,2,3,3,4,10,12,14,9,11,10,8,10,9,12,10,16,15,12,13,2,2,10,generated,-
Hispalenses,31,Samuel Sanchís,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,67,76,Either,180,86,11,14,13,14,9,13,12,9,13,13,12,13,13,11,12,12,11,13,2,2,2,2,13,13,11,15,generated,-
Hispalenses,32,Julián Varela,-,ST,AMC,17,ESP,EU,HGC,Yes,U21 Exempt,67,78,Right,189,85,12,10,13,14,7,6,6,13,8,13,7,16,15,9,15,10,13,13,2,2,2,2,14,13,10,14,generated,-
```

### Bats (Valencia CF)
**Reputation:** 77 | **CA Band:** 64–73 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Bats,1,Łukasz Kaczmarek,-,GK,-,24,POL,EU,Non-HG,No,Registered,70,75,Left,185,81,2,11,5,7,2,3,3,4,10,14,13,11,13,11,6,9,14,14,14,16,13,15,13,2,2,13,generated,-
Bats,3,Joaquín Lara,-,DL,-,25,ESP,EU,HGN,No,Registered,73,73,Right,188,84,8,14,15,15,13,14,13,12,10,14,15,14,15,10,16,17,11,13,2,2,2,2,15,11,12,15,generated,capped by band
Bats,4,Boubacar Diop,-,DC,DM,28,SEN,Non-EU,Non-HG,No,Registered,71,73,Right,193,87,4,13,8,11,7,12,16,12,10,13,15,12,13,10,13,13,15,11,2,2,2,2,16,8,5,14,generated,-
Bats,5,Marc Bustos,-,DC,-,27,ESP,EU,HGC,No,Registered,72,75,Right,191,82,7,11,9,12,7,14,15,16,10,11,15,15,11,11,11,13,17,12,2,2,2,2,16,6,4,12,generated,-
Bats,2,Andrea Bruni,-,DR,-,31,ITA,EU,Non-HG,No,Registered,73,73,Right,185,79,8,12,14,12,16,15,15,12,13,13,15,13,12,10,15,15,12,14,2,2,2,2,14,12,13,14,generated,capped by band
Bats,6,Mario Peláez,-,DM,DC,28,ESP,EU,HGC,No,Registered,73,74,Left,180,77,8,14,11,13,9,14,13,11,13,15,16,16,14,11,12,15,13,13,2,2,2,2,14,9,10,15,generated,capped by band
Bats,8,Javier Naranjo,-,MC,-,25,ESP,EU,HGN,No,Registered,73,76,Right,182,82,9,13,11,16,10,13,12,10,17,14,13,14,14,11,12,13,13,15,2,2,2,2,14,14,13,17,generated,capped by band
Bats,10,Jaime Ibáñez,-,MC,AMC,35,ESP,EU,HGC,No,Registered,73,73,Left,179,83,12,14,14,15,11,13,13,9,15,16,13,14,14,11,14,13,13,13,2,2,2,2,14,15,11,16,generated,capped by band
Bats,11,Nicolae Popescu,-,AML,-,27,ROU,EU,Non-HG,No,Registered,71,74,Left,176,70,12,14,16,18,10,4,5,8,10,12,7,14,11,9,14,13,13,15,2,2,2,2,14,14,16,13,generated,-
Bats,7,Sorin Georgescu,-,AMR,-,21,ROU,EU,Non-HG,Yes,U21 Exempt,70,79,Right,184,86,12,12,14,15,12,6,5,8,12,11,7,13,12,10,15,14,10,14,2,2,2,2,12,16,15,11,generated,-
Bats,9,Kévin Fabre,-,ST,AMC,28,FRA,EU,Non-HG,No,Registered,73,75,Right,183,81,16,12,15,12,8,6,3,16,11,15,6,15,13,11,12,13,16,16,2,2,2,2,15,16,13,15,generated,capped by band
Bats,13,Julián Segura,-,GK,-,29,ESP,EU,Non-HG,No,Registered,67,67,Right,191,87,2,11,3,10,2,3,3,4,8,14,12,9,14,10,8,7,12,14,13,14,13,14,14,2,2,11,generated,-
Bats,23,Mateo Crespo,-,DL,WBL,27,ESP,EU,Non-HG,No,Registered,65,65,Left,185,78,5,12,12,12,12,13,13,13,11,13,14,13,10,9,13,14,11,13,2,2,2,2,13,12,9,14,generated,-
Bats,30,Jorge Fajardo,-,DC,-,19,ESP,EU,HGN,Yes,U21 Exempt,65,79,Left,183,78,3,9,11,9,6,14,12,15,9,11,14,11,12,9,11,12,14,11,2,2,2,2,12,5,7,12,generated,-
Bats,15,Hélder Ribeiro,-,DC,-,25,POR,EU,Non-HG,No,Registered,66,67,Right,189,79,2,12,8,11,5,14,16,12,10,11,12,11,12,13,11,13,15,10,2,2,2,2,13,7,5,12,generated,-
Bats,22,Óscar Garrido,-,DR,-,27,ESP,EU,Non-HG,No,Registered,67,67,Right,184,80,6,13,12,12,13,14,14,12,10,11,12,13,12,12,15,14,11,14,2,2,2,2,13,12,11,14,generated,-
Bats,14,Victor Olesen,-,DM,-,19,DEN,EU,Non-HG,Yes,U21 Exempt,65,74,Right,174,70,5,14,13,13,8,14,10,9,10,15,12,14,13,11,10,9,10,11,2,2,2,2,13,9,9,16,generated,-
Bats,16,Sunday Balogun,-,MC,-,26,NGA,Non-EU,Non-HG,No,Registered,67,67,Left,177,70,8,15,12,12,11,12,11,9,14,14,14,14,13,12,15,12,10,13,2,2,2,2,12,12,11,14,generated,-
Bats,17,Pietro Piras,-,AMC,AMR,31,ITA,EU,Non-HG,No,Registered,68,68,Right,176,69,12,15,13,14,11,9,8,10,15,12,10,13,13,11,11,13,11,13,2,2,2,2,13,13,14,15,generated,-
Bats,21,Jack Walsh,-,AML,-,33,USA,Non-EU,Non-HG,No,Registered,66,66,Left,188,92,12,11,16,13,10,6,5,8,10,11,8,12,10,8,14,10,10,15,2,2,2,2,12,12,14,13,generated,-
Bats,19,Miguel Salcedo,-,AMR,ST,28,ESP,EU,HGC,No,Registered,68,68,Left,181,77,12,14,15,14,11,7,8,8,11,12,8,14,12,9,15,14,8,15,2,2,2,2,16,15,12,12,generated,-
Bats,18,Filipe Freitas,-,ST,-,31,POR,EU,Non-HG,No,Registered,66,66,Right,181,81,15,13,12,12,6,6,4,12,10,11,4,13,13,9,15,12,12,14,2,2,2,2,12,14,12,13,generated,-
Bats,25,Álvaro Ferrer,-,GK,-,19,ESP,EU,Non-HG,Yes,U21 Exempt,67,80,Right,186,81,2,11,4,9,2,3,3,4,10,14,14,9,14,10,9,8,13,13,12,12,15,14,14,2,2,12,generated,-
Bats,31,Héctor Cano,-,MC,-,17,ESP,EU,HGC,Yes,U21 Exempt,67,77,Left,182,78,8,14,12,14,9,13,10,7,13,13,12,13,12,8,12,13,12,13,2,2,2,2,13,11,12,16,generated,-
Bats,32,Álvaro Aguilera,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,65,77,Right,186,84,13,9,12,12,8,7,5,12,9,12,5,12,13,8,14,13,12,10,2,2,2,2,12,15,11,13,generated,-
```

### Celestes (RC Celta de Vigo)
**Reputation:** 74 | **CA Band:** 62–71 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Celestes,1,Lazaros Antoniou,-,GK,-,25,GRE,EU,Non-HG,No,Registered,65,67,Right,191,85,2,12,3,10,2,3,3,4,10,13,11,10,12,11,8,8,10,13,14,16,12,13,12,2,2,13,generated,-
Celestes,3,Sotiris Kalogeros,-,DL,DC/WBL,24,GRE,EU,Non-HG,No,Registered,70,73,Left,180,79,7,13,13,13,12,15,16,11,11,14,13,13,11,8,15,16,12,12,2,2,2,2,13,11,9,13,generated,-
Celestes,4,Carlos Montero,-,DC,-,30,ESP,EU,HGC,No,Registered,70,70,Right,196,91,5,11,9,11,4,14,14,13,10,14,14,13,15,10,13,13,15,12,2,2,2,2,14,7,6,13,generated,-
Celestes,5,Sunday Olawale,-,DC,-,31,NGA,Non-EU,Non-HG,No,Registered,71,71,Either,188,83,5,12,8,12,4,15,15,15,10,15,14,13,11,11,11,13,16,12,2,2,2,2,13,8,6,12,generated,capped by band
Celestes,2,Aitor Olmedo,-,DR,WBR,30,ESP,EU,HGC,No,Registered,70,70,Right,179,75,8,14,13,14,14,16,12,10,11,10,13,14,13,10,15,14,14,13,2,2,2,2,15,14,10,15,generated,-
Celestes,6,Paolo Bruni,-,DM,DC,28,ITA,EU,Non-HG,No,Registered,70,72,Right,183,80,6,15,10,12,9,14,14,11,13,15,13,14,13,11,11,13,13,12,2,2,2,2,15,7,8,14,generated,-
Celestes,8,Óscar Rueda,-,MC,DM/AMC,30,ESP,EU,HGC,No,Registered,71,71,Right,181,79,9,16,12,15,12,14,10,11,14,13,12,13,13,13,13,13,11,16,2,2,2,2,14,12,12,16,generated,capped by band
Celestes,10,Fernando Palomo,-,MC,-,32,ESP,EU,HGN,No,Registered,68,68,Right,178,79,8,14,14,15,10,12,11,10,14,14,12,12,12,12,11,12,13,12,2,2,2,2,13,13,11,15,generated,-
Celestes,11,Tomás Peixoto,-,AML,ML,29,POR,EU,Non-HG,No,Registered,68,68,Left,171,66,10,13,14,11,17,7,4,7,15,12,7,13,15,9,16,15,10,14,2,2,2,2,16,13,12,13,generated,-
Celestes,7,Chinedu Chukwuma,-,AMR,-,27,NGA,Non-EU,Non-HG,No,Registered,71,72,Right,177,70,12,13,16,14,12,7,7,6,12,14,7,12,13,10,16,13,12,15,2,2,2,2,14,13,15,13,generated,capped by band
Celestes,9,Enrique Zamora,-,ST,-,26,ESP,EU,HGC,No,Registered,66,69,Left,183,81,14,11,13,13,5,6,5,12,11,12,7,14,14,10,13,12,12,12,2,2,2,2,13,14,11,13,generated,-
Celestes,13,Valentin Royer,-,GK,-,27,FRA,EU,Non-HG,No,Registered,62,65,Right,191,88,2,6,5,9,2,3,3,4,10,11,13,11,12,8,9,8,10,12,13,12,13,12,12,2,2,11,generated,-
Celestes,23,Vítor Vilaça,-,DL,-,26,POR,EU,Non-HG,No,Registered,65,65,Left,180,73,7,13,12,12,12,13,12,11,10,11,15,13,12,8,13,14,11,12,2,2,2,2,13,11,11,13,generated,-
Celestes,15,Fernando Cano,-,DC,DL,27,ESP,EU,HGC,No,Registered,66,66,Right,183,77,4,11,7,11,6,14,14,13,9,11,13,12,11,11,11,12,15,12,2,2,2,2,14,8,5,12,generated,-
Celestes,24,Oussama Rahmani,-,DC,-,23,MAR,Non-EU,Non-HG,No,Registered,63,67,Right,194,88,3,8,7,11,7,13,14,12,7,12,13,12,10,9,11,9,13,10,2,2,2,2,13,6,5,12,generated,-
Celestes,22,Dídac Cano,-,DR,DC,24,ESP,EU,HGC,No,Registered,66,68,Right,178,70,8,12,15,11,13,12,13,10,9,13,13,14,11,10,15,13,11,16,2,2,2,2,15,12,10,12,generated,-
Celestes,14,Elias Weber,-,DM,DC/MC,21,GER,EU,Non-HG,Yes,U21 Exempt,65,77,Right,182,82,7,12,11,11,9,13,13,12,13,12,13,14,13,10,12,15,14,12,2,2,2,2,12,9,7,13,generated,-
Celestes,16,Jaime Camacho,-,MC,-,29,ESP,EU,HGC,No,Registered,63,63,Left,180,74,9,12,12,12,10,12,8,7,13,13,10,12,12,8,12,12,12,11,2,2,2,2,11,12,10,16,generated,-
Celestes,17,Gonzalo Valdés,-,AMC,-,26,ESP,EU,HGC,No,Registered,63,66,Right,179,75,11,13,15,14,10,7,6,8,12,10,10,14,11,10,13,12,11,11,2,2,2,2,12,11,15,13,generated,-
Celestes,21,Nicolae Stoica,-,AML,-,21,ROU,EU,Non-HG,Yes,U21 Exempt,62,72,Left,182,75,12,13,14,15,9,5,4,6,10,11,8,12,10,8,14,10,12,12,2,2,2,2,11,11,12,11,generated,-
Celestes,19,Julián Escudero,-,AMR,MR,27,ESP,EU,HGC,No,Registered,65,66,Right,182,81,13,12,14,13,10,6,6,6,10,9,8,12,10,9,14,13,11,15,2,2,2,2,12,13,13,13,generated,-
Celestes,30,Jorge Marín,-,ST,-,17,ESP,EU,HGC,Yes,U21 Exempt,62,78,Right,182,80,12,9,12,12,7,4,8,12,11,12,7,14,14,8,13,10,12,12,2,2,2,2,11,13,10,12,generated,-
Celestes,25,Raúl Alcázar,-,GK,-,19,ESP,EU,HGC,Yes,U21 Exempt,63,79,Left,183,78,2,9,4,10,2,3,3,4,8,13,11,8,13,8,8,9,11,12,15,11,12,13,11,2,2,12,generated,-
Celestes,31,Jesús Barrios,-,MC,AMC,20,ESP,EU,HGC,Yes,U21 Exempt,62,68,Left,182,79,10,12,14,14,9,14,10,8,11,10,12,13,12,10,11,13,11,10,2,2,2,2,12,11,11,15,generated,-
Celestes,32,Ismael Segura,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,62,73,Right,184,80,12,9,12,12,8,4,5,11,10,12,7,11,12,6,15,14,12,11,2,2,2,2,12,13,11,13,generated,-
```

### Franjirrojos (Rayo Vallecano de Madrid)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Franjirrojos,1,Carlos Loureiro,-,GK,-,23,POR,EU,Non-HG,No,Registered,67,72,Right,190,85,2,9,1,10,2,3,3,4,7,14,12,9,13,11,7,7,13,11,14,13,15,14,14,2,2,12,generated,-
Franjirrojos,3,Javier Ibarra,-,DL,ML/DC,33,ARG,Non-EU,Non-HG,No,Registered,68,68,Right,187,83,7,15,15,12,13,12,13,12,10,11,13,15,13,9,14,13,12,9,2,2,2,2,15,13,8,14,generated,-
Franjirrojos,4,David Crespo,-,DC,-,28,ESP,EU,HGC,No,Registered,65,65,Right,187,82,5,12,7,10,5,13,12,13,11,14,12,13,14,9,14,10,14,9,2,2,2,2,13,8,5,13,generated,-
Franjirrojos,5,Jesús Robles,-,DC,-,23,ESP,EU,HGC,No,Registered,69,76,Right,191,83,5,10,9,13,7,15,14,15,11,12,15,11,11,11,12,14,15,11,2,2,2,2,12,6,8,13,generated,capped by band
Franjirrojos,2,Adrián Montiel,-,DR,-,25,ARG,Non-EU,Non-HG,No,Registered,65,66,Left,183,74,9,12,13,11,14,13,13,10,10,12,12,13,11,9,14,13,12,12,2,2,2,2,13,12,12,13,generated,-
Franjirrojos,6,Magnus Eriksen,-,DM,MC,29,DEN,EU,Non-HG,No,Registered,64,64,Either,188,86,7,10,11,13,8,15,14,11,13,11,12,15,10,8,12,13,13,11,2,2,2,2,12,10,9,13,generated,-
Franjirrojos,8,Dennis Brouwer,-,MC,-,27,NED,EU,Non-HG,No,Registered,67,69,Left,180,70,9,13,14,14,8,13,11,8,14,12,12,14,14,10,11,14,10,11,2,2,2,2,14,13,12,14,generated,-
Franjirrojos,10,Jakub Chmielewski,-,MC,DM,33,POL,EU,Non-HG,No,Registered,63,63,Right,179,70,10,14,11,11,9,12,10,7,13,13,11,12,12,9,12,12,10,12,2,2,2,2,12,13,10,13,generated,-
Franjirrojos,11,Xavi Gallardo,-,AML,ML,24,ESP,EU,HGC,No,Registered,65,71,Right,180,80,11,11,14,13,11,7,6,7,11,10,5,12,12,8,14,14,9,15,2,2,2,2,11,11,15,13,generated,-
Franjirrojos,7,Jaime Rueda,-,AMR,-,29,ESP,EU,HGC,No,Registered,69,69,Right,179,70,11,16,17,14,10,7,7,7,11,12,6,11,11,9,17,12,12,15,2,2,2,2,13,13,12,13,generated,capped by band
Franjirrojos,9,Rubén Salcedo,-,ST,-,22,ESP,EU,HGC,No,Registered,65,71,Left,176,70,14,10,12,12,7,7,3,11,7,12,9,12,15,9,13,11,11,12,2,2,2,2,12,14,9,12,generated,-
Franjirrojos,13,Salvatore Fontana,-,GK,-,31,ITA,EU,Non-HG,No,Registered,60,60,Left,194,89,2,8,2,8,2,3,3,4,10,12,12,9,12,10,7,9,11,11,13,12,12,11,12,2,2,10,generated,-
Franjirrojos,23,Ismael Zamora,-,DL,-,25,ESP,EU,HGN,No,Registered,61,61,Right,184,78,6,12,12,10,11,13,12,9,10,8,12,12,10,9,14,13,11,12,2,2,2,2,11,11,10,12,generated,-
Franjirrojos,15,Nathan Lemaire,-,DC,-,35,FRA,EU,Non-HG,No,Registered,62,62,Either,183,80,6,10,7,10,5,14,14,12,10,10,12,11,10,10,10,12,13,10,2,2,2,2,13,5,4,11,generated,-
Franjirrojos,24,Andrés Calvo,-,DC,-,27,ESP,EU,HGN,No,Registered,60,63,Right,192,90,4,10,7,10,4,11,13,15,9,11,12,12,10,11,11,13,11,9,2,2,2,2,13,5,4,11,generated,-
Franjirrojos,22,Vítor Teixeira,-,DR,-,27,POR,EU,Non-HG,No,Registered,62,62,Right,189,88,5,12,12,11,11,15,12,11,12,12,10,12,12,10,15,13,10,11,2,2,2,2,12,10,10,12,generated,-
Franjirrojos,14,Federico Cattaneo,-,DM,MC,25,ITA,EU,Non-HG,No,Registered,64,67,Right,188,82,8,12,11,11,8,14,12,10,12,12,14,15,12,9,11,11,11,11,2,2,2,2,12,9,9,14,generated,-
Franjirrojos,30,Andrés Fajardo,-,MC,AMC/DM,20,ESP,EU,HGC,Yes,U21 Exempt,60,72,Right,179,78,9,11,13,14,10,11,8,7,11,14,11,10,11,9,13,11,10,13,2,2,2,2,11,12,13,14,generated,-
Franjirrojos,17,Pedro Alvarado,-,AMC,AMR,26,MEX,Non-EU,Non-HG,No,Registered,61,63,Left,175,72,9,13,12,13,9,9,8,7,12,14,8,12,14,10,10,11,10,14,2,2,2,2,11,14,10,11,generated,-
Franjirrojos,21,Xavi Bermejo,-,AML,ST,27,ESP,EU,HGN,No,Registered,63,66,Left,187,82,12,11,15,12,10,7,6,7,11,11,5,12,11,7,14,11,10,13,2,2,2,2,12,12,12,13,generated,-
Franjirrojos,19,Fernando Castaño,-,AMR,MR,36,ESP,EU,HGN,No,Registered,60,60,Right,173,74,12,13,13,13,8,6,6,7,8,10,6,12,9,8,13,12,9,12,2,2,2,2,12,13,13,11,generated,-
Franjirrojos,18,Javier Casado,-,ST,AMR,24,ESP,EU,HGC,No,Registered,62,64,Left,190,85,14,10,14,12,7,6,5,12,10,13,4,11,12,9,12,11,11,10,2,2,2,2,11,12,10,12,generated,-
Franjirrojos,25,Guillermo Ferrer,-,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,60,71,Right,186,80,2,8,4,8,2,3,3,4,9,11,11,8,12,9,7,7,9,11,12,14,13,11,12,2,2,11,generated,-
Franjirrojos,31,Miguel Soriano,-,MC,AMC,19,ESP,EU,HGC,Yes,U21 Exempt,62,76,Either,181,74,9,13,12,13,9,12,8,10,12,13,10,12,12,8,13,11,9,12,2,2,2,2,11,11,12,14,generated,-
Franjirrojos,32,Víctor Robles,-,ST,AML,17,ESP,EU,Non-HG,Yes,U21 Exempt,61,75,Right,183,82,13,9,11,13,6,5,2,11,10,10,5,12,14,11,13,13,11,12,2,2,2,2,8,13,10,12,generated,-
```

### Rojillos (CA Osasuna)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Rojillos,1,Vinícius Fagundes,-,GK,-,34,BRA,Non-EU,Non-HG,No,Registered,69,69,Left,189,81,2,9,3,8,2,3,3,4,9,14,13,10,14,12,9,10,11,12,14,15,14,14,14,2,2,11,generated,capped by band
Rojillos,3,Sam De Jong,-,DL,-,36,NED,EU,Non-HG,No,Registered,67,67,Left,182,77,7,13,14,13,11,15,14,10,9,11,12,13,13,9,15,13,11,11,2,2,2,2,14,12,8,13,generated,-
Rojillos,4,Gonzalo Castaño,-,DC,-,29,ESP,EU,HGC,No,Registered,69,69,Right,194,101,4,12,8,10,5,14,15,15,9,11,15,13,12,10,11,11,15,10,2,2,2,2,13,5,5,12,generated,capped by band
Rojillos,5,Nicolò Fabbri,-,DC,DL,25,ITA,EU,Non-HG,No,Registered,69,71,Right,187,79,3,9,8,12,5,13,17,12,10,13,14,12,12,13,13,13,13,10,2,2,2,2,14,5,6,13,generated,capped by band
Rojillos,2,Rafa Salcedo,-,DR,-,28,ESP,EU,HGC,No,Registered,64,65,Right,179,73,8,14,14,9,12,11,13,9,12,13,11,13,9,10,13,15,12,13,2,2,2,2,12,11,8,14,generated,-
Rojillos,6,Julián Calvo,-,DM,-,27,ESP,EU,HGC,No,Registered,63,63,Right,168,61,7,11,11,12,8,14,11,9,11,14,12,13,13,10,11,10,10,12,2,2,2,2,14,8,8,15,generated,-
Rojillos,8,Nacho Marín,-,MC,-,24,ESP,EU,Non-HG,No,Registered,68,74,Right,178,73,9,15,12,16,12,12,11,9,13,14,12,12,12,8,13,11,11,13,2,2,2,2,12,12,12,15,generated,-
Rojillos,10,Joaquín Ortuño,-,MC,-,24,ESP,EU,HGN,No,Registered,69,74,Left,180,75,8,14,14,14,11,12,11,11,15,16,11,12,12,12,12,12,11,12,2,2,2,2,13,11,12,16,generated,capped by band
Rojillos,11,Filipe Fontes,-,AML,-,27,POR,EU,Non-HG,No,Registered,69,72,Left,174,74,11,12,14,15,11,7,5,9,11,12,5,14,11,8,15,11,11,15,2,2,2,2,14,16,15,13,generated,capped by band
Rojillos,7,Héctor Sanchís,-,AMR,ST,28,ESP,EU,HGC,No,Registered,68,68,Right,172,68,12,12,15,13,12,6,4,8,11,12,8,14,12,8,14,12,11,15,2,2,2,2,13,13,16,14,generated,-
Rojillos,9,Yeray Heredia,-,ST,-,29,ESP,EU,HGC,No,Registered,69,69,Left,181,74,14,11,13,16,6,5,5,12,10,11,5,13,13,10,14,13,13,12,2,2,2,2,14,15,14,15,generated,capped by band
Rojillos,13,Thanos Zografos,-,GK,-,28,GRE,EU,Non-HG,No,Registered,60,61,Right,187,81,2,8,4,7,2,3,3,4,9,12,14,8,12,9,6,8,12,12,12,12,11,12,11,2,2,11,generated,-
Rojillos,23,Benedikt Baumann,-,DL,WBL,27,GER,EU,Non-HG,No,Registered,60,60,Left,187,85,5,12,12,12,12,10,13,8,10,11,11,12,11,8,13,13,12,12,2,2,2,2,12,8,7,13,generated,-
Rojillos,15,Jesús Cano,-,DC,-,31,ESP,EU,HGN,No,Registered,63,63,Left,187,83,5,10,9,9,6,12,12,13,8,12,13,13,12,9,12,12,14,11,2,2,2,2,14,5,6,12,generated,-
Rojillos,24,César Zamora,-,DC,DR/DL,26,ESP,EU,HGC,No,Registered,62,63,Either,184,77,6,9,8,9,4,13,13,13,8,11,12,11,12,13,11,10,13,10,2,2,2,2,13,7,5,11,generated,-
Rojillos,22,Clément Rousseau,-,DR,-,25,FRA,EU,Non-HG,No,Registered,60,63,Right,178,71,5,11,10,12,12,11,11,8,10,11,13,14,12,9,12,11,10,12,2,2,2,2,13,11,9,15,generated,-
Rojillos,14,Jesús Bustos,-,DM,-,26,ESP,EU,HGC,No,Registered,63,63,Right,182,76,7,13,9,11,8,13,10,12,10,13,13,14,14,11,10,10,10,11,2,2,2,2,14,8,9,14,generated,-
Rojillos,16,Fernando Cordero,-,MC,AMC/DM,22,ESP,EU,Non-HG,No,Registered,62,68,Right,181,81,8,12,12,14,8,12,11,9,11,15,11,12,12,10,10,12,9,10,2,2,2,2,13,11,12,12,generated,-
Rojillos,17,Dino Lovrić,-,AMC,AMR,30,CRO,EU,Non-HG,No,Registered,61,61,Right,182,77,12,12,13,13,12,7,6,7,13,11,7,13,11,9,12,12,11,11,2,2,2,2,12,11,13,13,generated,-
Rojillos,21,Carlos Insúa,-,AML,-,31,ARG,Non-EU,Non-HG,No,Registered,65,65,Left,182,78,10,12,14,16,10,6,5,9,10,11,8,12,10,10,14,12,11,14,2,2,2,2,14,15,12,12,generated,-
Rojillos,19,Achraf Fassi,-,AMR,-,21,MAR,Non-EU,Non-HG,Yes,U21 Exempt,63,69,Right,177,67,14,13,12,12,11,7,5,6,11,10,6,11,10,8,13,11,8,13,2,2,2,2,13,13,15,13,generated,-
Rojillos,30,Pedro Bustos,-,ST,-,21,ESP,EU,HGN,Yes,U21 Exempt,61,71,Right,186,86,14,9,13,10,7,4,3,11,9,10,5,11,11,7,13,12,13,11,2,2,2,2,12,13,9,12,generated,-
Rojillos,25,Jorge Palomo,-,GK,-,21,ESP,EU,HGC,Yes,U21 Exempt,61,68,Right,198,92,2,9,4,7,2,3,3,4,7,10,13,9,11,9,7,9,11,11,13,13,14,10,11,2,2,10,generated,-
Rojillos,31,Guillermo Ibáñez,-,MC,-,17,ESP,EU,HGC,Yes,U21 Exempt,62,78,Right,169,65,9,13,13,13,11,11,11,9,14,12,11,11,11,10,12,11,12,12,2,2,2,2,12,11,10,14,generated,-
Rojillos,32,Lucas Salcedo,-,ST,AMR/AMC,20,ESP,EU,HGC,Yes,U21 Exempt,61,73,Right,182,81,13,11,12,12,9,6,3,14,12,9,5,13,12,10,11,13,14,12,2,2,2,2,12,13,11,11,generated,-
```

### Azulones (Getafe CF)
**Reputation:** 69 | **CA Band:** 59–68 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Azulones,1,Guillermo Naranjo,-,GK,-,32,ESP,EU,Non-HG,No,Registered,67,67,Right,193,91,2,11,2,7,2,3,3,4,8,11,16,9,12,12,7,10,11,12,15,12,15,11,11,2,2,13,generated,-
Azulones,3,Martín Bermejo,-,DL,DC,21,ESP,EU,HGC,Yes,U21 Exempt,64,76,Left,180,77,7,13,13,13,13,12,14,10,10,12,11,15,12,10,11,13,11,13,2,2,2,2,13,12,10,14,generated,-
Azulones,4,Miguel Tapia,-,DC,DL/DR,30,ESP,EU,HGC,No,Registered,67,67,Right,185,74,3,14,10,10,7,13,11,16,9,14,15,13,13,14,13,10,13,10,2,2,2,2,12,6,5,14,generated,-
Azulones,5,Aitor Campos,-,DC,-,28,URU,Non-EU,Non-HG,No,Registered,67,69,Right,182,75,6,8,8,10,6,16,15,12,10,11,14,12,12,10,10,11,14,11,2,2,2,2,12,6,6,12,generated,-
Azulones,2,Dino Petrović,-,DR,-,23,CRO,EU,Non-HG,No,Registered,67,74,Either,181,81,8,12,13,13,12,14,14,9,10,13,14,15,12,10,13,13,14,13,2,2,2,2,13,13,11,14,generated,-
Azulones,6,Marcos Varela,-,DM,DC,30,ESP,EU,HGN,No,Registered,65,65,Right,179,75,6,14,9,14,6,13,12,9,11,13,14,14,13,12,11,11,11,11,2,2,2,2,13,9,9,14,generated,-
Azulones,8,Álvaro Soriano,-,MC,DM,26,ESP,EU,HGN,No,Registered,66,69,Right,182,79,9,14,12,15,10,11,8,10,13,12,13,12,13,9,11,12,11,12,2,2,2,2,13,13,11,15,generated,-
Azulones,10,Daniel Alcázar,-,MC,DM/AMC,27,ESP,EU,HGN,No,Registered,66,66,Right,180,77,10,13,11,15,11,11,11,9,13,13,10,13,13,10,13,15,9,12,2,2,2,2,13,12,9,14,generated,-
Azulones,11,Mateo Ortuño,-,AML,-,24,ESP,EU,HGN,No,Registered,67,71,Left,180,76,14,12,12,15,15,7,6,6,15,12,6,13,14,9,11,14,9,14,2,2,2,2,15,12,15,14,generated,-
Azulones,7,Rúben Teixeira,-,AMR,AMC,26,POR,EU,Non-HG,No,Registered,67,67,Either,178,68,11,10,15,14,10,7,5,7,10,12,5,13,11,8,16,13,10,13,2,2,2,2,14,13,15,11,generated,-
Azulones,9,Florian Vidal,-,ST,AMC,26,FRA,EU,Non-HG,No,Registered,67,70,Left,187,84,13,11,13,14,5,4,3,12,10,13,5,14,14,8,15,12,11,12,2,2,2,2,13,14,9,11,generated,-
Azulones,13,Cristian Salcedo,-,GK,-,34,ESP,EU,HGC,No,Registered,59,59,Right,185,82,2,10,2,9,2,3,3,4,9,10,14,8,10,12,8,8,10,10,13,13,11,10,11,2,2,10,generated,-
Azulones,23,Bernardo Freitas,-,DL,ML/DC,27,POR,EU,Non-HG,No,Registered,59,59,Left,185,76,7,11,12,10,13,11,12,10,9,11,10,12,11,8,11,14,9,10,2,2,2,2,12,10,9,13,generated,-
Azulones,15,Bernardo Bastos,-,DC,-,30,POR,EU,Non-HG,No,Registered,60,60,Left,184,79,6,11,5,9,5,11,12,11,8,12,13,12,11,10,10,10,13,8,2,2,2,2,12,4,7,14,generated,-
Azulones,24,Mario Aguirre,-,DC,-,28,URU,Non-EU,Non-HG,No,Registered,61,61,Right,185,78,5,10,9,11,6,11,12,14,8,12,13,12,11,11,10,10,14,9,2,2,2,2,12,6,6,11,generated,-
Azulones,22,Amine Rahmani,-,DR,-,23,MAR,Non-EU,Non-HG,No,Registered,59,65,Left,175,72,8,10,11,10,10,13,12,8,11,11,12,12,12,11,12,14,11,11,2,2,2,2,11,10,11,12,generated,-
Azulones,30,Gonzalo Marín,-,DM,DC,18,ESP,EU,HGC,Yes,U21 Exempt,59,75,Left,173,72,8,12,10,9,6,12,10,11,10,13,13,14,13,8,12,9,9,10,2,2,2,2,12,9,10,12,generated,-
Azulones,14,Gonzalo Soriano,-,MC,AMC,21,ESP,EU,HGC,Yes,U21 Exempt,61,70,Right,180,79,10,12,14,12,10,12,9,8,11,12,11,12,12,9,11,12,10,12,2,2,2,2,12,13,11,15,generated,-
Azulones,17,Xavi Ortuño,-,AMC,-,19,ESP,EU,HGC,Yes,U21 Exempt,60,70,Right,183,72,10,10,11,12,10,9,7,7,14,14,9,11,14,9,11,11,11,14,2,2,2,2,11,13,10,11,generated,-
Azulones,21,Javier Crespo,-,AML,AMC,22,ESP,EU,HGC,No,Registered,60,63,Left,177,68,11,11,14,13,8,6,5,7,8,10,8,11,9,8,14,12,10,13,2,2,2,2,11,12,11,11,generated,-
Azulones,19,Riccardo Bruni,-,AMR,MR,23,ITA,EU,Non-HG,No,Registered,60,62,Either,172,66,12,12,13,11,11,5,4,6,10,10,8,12,11,8,12,11,9,14,2,2,2,2,12,10,14,11,generated,-
Azulones,18,Víctor Cordero,-,ST,AMC,27,ESP,EU,HGN,No,Registered,59,61,Left,181,81,11,9,12,15,5,6,3,12,11,13,5,10,10,6,14,11,12,12,2,2,2,2,9,11,10,10,generated,-
Azulones,25,Mateo Segura,-,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,62,74,Right,187,88,2,8,3,9,2,3,3,4,10,12,14,7,10,11,9,7,11,9,12,15,11,13,14,2,2,12,generated,-
Azulones,31,Rafa Gallardo,-,MC,DM,20,ESP,EU,HGC,Yes,U21 Exempt,59,64,Left,182,80,9,13,13,12,10,12,9,8,13,12,10,11,11,8,9,11,10,10,2,2,2,2,10,10,11,12,generated,-
Azulones,32,Jorge Quintero,-,ST,AMC,20,ESP,EU,HGC,Yes,U21 Exempt,59,64,Right,178,77,14,8,11,11,8,7,2,11,10,11,6,15,12,8,13,12,11,12,2,2,2,2,11,11,10,10,generated,-
```

### Periquitos (RCD Espanyol de Barcelona)
**Reputation:** 67 | **CA Band:** 58–67 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Periquitos,1,Jordy Zijlstra,-,GK,-,22,NED,EU,Non-HG,No,Registered,64,66,Right,195,92,2,10,4,9,2,3,3,4,9,12,15,9,12,10,6,9,11,12,13,12,13,12,13,2,2,10,generated,-
Periquitos,3,Raúl Quintero,-,DL,-,34,ESP,EU,HGN,No,Registered,66,66,Left,183,78,6,13,13,12,11,13,12,11,9,13,13,12,12,10,16,16,11,12,2,2,2,2,13,10,11,13,generated,-
Periquitos,4,Souleymane Diakité,-,DC,-,26,SEN,Non-EU,Non-HG,No,Registered,67,70,Either,185,90,5,11,9,11,6,16,13,15,8,11,14,13,12,12,11,12,13,9,2,2,2,2,13,5,5,11,generated,capped by band
Periquitos,5,Javier Palomo,-,DC,DM/DL,28,ESP,EU,HGC,No,Registered,64,65,Right,190,85,6,12,9,10,6,15,13,12,9,10,13,15,11,12,10,11,14,12,2,2,2,2,14,7,5,11,generated,-
Periquitos,2,Sergio Castaño,-,DR,WBR/MR,26,ESP,EU,Non-HG,No,Registered,67,68,Either,181,79,7,11,13,12,13,14,13,11,10,13,12,16,11,11,15,14,12,11,2,2,2,2,12,11,10,15,generated,capped by band
Periquitos,6,Dídac Crespo,-,DM,-,22,ESP,EU,HGC,No,Registered,67,73,Right,175,71,8,13,13,12,8,13,14,9,11,15,12,14,14,13,11,15,12,11,2,2,2,2,13,11,9,15,generated,capped by band
Periquitos,8,Martín Varela,-,MC,-,31,ESP,EU,HGC,No,Registered,66,66,Either,182,70,9,14,12,14,8,12,9,9,13,15,11,13,12,8,12,12,12,13,2,2,2,2,13,12,11,13,generated,-
Periquitos,10,Hugo Aguilera,-,MC,DM/AMC,27,ESP,EU,Non-HG,No,Registered,65,68,Right,185,74,10,12,13,15,8,12,12,9,14,14,12,12,12,10,12,12,10,12,2,2,2,2,12,12,12,14,generated,-
Periquitos,11,Ismael Ledesma,-,AML,-,24,MEX,Non-EU,Non-HG,No,Registered,62,64,Right,178,72,12,10,12,13,13,6,6,7,13,10,6,12,13,9,13,11,10,12,2,2,2,2,12,11,12,12,generated,-
Periquitos,7,Javier Cordero,-,AMR,-,29,ESP,EU,HGC,No,Registered,65,65,Right,180,74,11,11,14,11,15,7,5,7,14,13,8,11,15,9,14,14,10,11,2,2,2,2,11,10,16,11,generated,-
Periquitos,9,Nico Sanchís,-,ST,-,22,ESP,EU,HGN,No,Registered,67,69,Right,179,69,15,12,12,12,8,5,4,11,12,12,7,15,13,8,14,15,11,12,2,2,2,2,12,16,11,10,generated,capped by band
Periquitos,13,Carlos Rebelo,-,GK,-,21,POR,EU,Non-HG,Yes,U21 Exempt,59,67,Right,187,80,2,11,2,7,2,3,3,4,8,11,13,8,13,10,8,7,8,13,11,10,12,12,12,2,2,10,generated,-
Periquitos,23,Valerio Sala,-,DL,-,28,ITA,EU,Non-HG,No,Registered,58,60,Left,186,75,5,12,10,12,12,11,11,10,8,12,10,12,10,8,13,13,11,11,2,2,2,2,11,9,8,13,generated,-
Periquitos,15,Xavi Maldonado,-,DC,DM/DR,25,ESP,EU,HGC,No,Registered,59,59,Right,191,82,1,12,7,9,5,12,11,12,10,11,12,12,11,10,11,11,12,10,2,2,2,2,13,4,7,11,generated,-
Periquitos,24,Thomas Arnaud,-,DC,DL,26,FRA,EU,Non-HG,No,Registered,58,61,Right,191,88,4,10,8,10,7,12,12,11,8,9,13,11,9,10,9,11,13,10,2,2,2,2,13,6,6,10,generated,-
Periquitos,22,Yeray Salcedo,-,DR,-,20,ESP,EU,HGC,Yes,U21 Exempt,62,68,Right,186,83,8,12,12,10,13,13,10,10,10,9,11,12,12,9,14,14,13,12,2,2,2,2,13,10,10,13,generated,-
Periquitos,14,Ivo Sanchís,-,DM,MC,26,ESP,EU,Non-HG,No,Registered,60,62,Right,187,89,7,11,10,11,9,13,11,9,11,11,13,12,11,11,11,12,11,11,2,2,2,2,13,8,9,13,generated,-
Periquitos,16,Rayan Bertrand,-,MC,AMC,33,FRA,EU,Non-HG,No,Registered,62,62,Either,183,81,10,13,11,11,10,13,10,7,13,14,11,12,13,12,9,12,10,10,2,2,2,2,13,10,12,12,generated,-
Periquitos,17,Mateo Maidana,-,AMC,AMR,22,COL,Non-EU,Non-HG,No,Registered,60,65,Right,176,75,11,13,13,13,9,6,7,7,13,10,7,12,11,10,10,12,10,11,2,2,2,2,12,10,12,12,generated,-
Periquitos,30,Raúl Toledo,-,AML,ML/AMC,18,ESP,EU,Non-HG,Yes,U21 Exempt,59,73,Left,181,73,13,9,13,12,10,7,5,6,11,10,6,10,7,8,13,12,8,12,2,2,2,2,12,13,10,13,generated,-
Periquitos,19,Aitor Aguilera,-,AMR,-,20,ESP,EU,Non-HG,Yes,U21 Exempt,58,67,Right,171,72,11,12,11,14,9,6,6,7,9,9,4,12,9,8,12,11,9,13,2,2,2,2,11,13,12,11,generated,-
Periquitos,18,Nacho Tapia,-,ST,AML,29,ESP,EU,HGC,No,Registered,59,59,Right,186,82,12,10,11,11,7,6,5,11,10,11,6,11,12,8,11,13,13,12,2,2,2,2,11,13,9,13,generated,-
Periquitos,25,Lucas Marín,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,61,73,Either,195,87,2,9,3,8,2,3,3,4,10,12,12,8,12,10,8,9,11,11,12,14,13,11,12,2,2,11,generated,-
Periquitos,31,Julián Naranjo,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,58,72,Right,173,71,9,12,10,11,9,11,12,9,12,11,10,11,11,9,9,11,10,11,2,2,2,2,11,11,12,14,generated,-
Periquitos,32,Marcos Almeida,-,ST,AMR,20,ESP,EU,Non-HG,Yes,U21 Exempt,58,69,Right,187,85,12,10,10,11,7,4,3,12,9,12,6,13,12,9,11,13,14,12,2,2,2,2,9,12,11,11,generated,-
```

### Babazorros (Deportivo Alavés)
**Reputation:** 66 | **CA Band:** 57–66 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Babazorros,1,Paweł Sadowski,-,GK,-,29,POL,EU,Non-HG,No,Registered,64,64,Right,188,85,2,11,4,8,2,3,3,4,8,14,15,8,12,11,8,8,13,13,12,13,12,12,13,2,2,10,generated,-
Babazorros,3,Adrián Izquierdo,-,DL,-,30,ESP,EU,HGN,No,Registered,64,64,Left,170,61,4,13,13,11,12,13,12,11,11,11,12,14,12,9,14,12,13,10,2,2,2,2,12,12,8,14,generated,-
Babazorros,4,Rui Rebelo,-,DC,-,24,POR,EU,Non-HG,No,Registered,62,65,Left,178,68,5,10,8,10,5,13,12,13,9,13,12,13,12,9,13,11,11,10,2,2,2,2,12,7,6,13,generated,-
Babazorros,5,Sergio Rueda,-,DC,-,26,ESP,EU,HGC,No,Registered,65,68,Right,185,79,5,12,8,11,5,14,14,14,11,12,14,14,11,11,11,14,13,11,2,2,2,2,11,6,5,12,generated,-
Babazorros,2,Idrissa Traoré,-,DR,-,28,SEN,Non-EU,Non-HG,No,Registered,65,67,Right,181,77,6,12,12,11,14,13,13,8,10,12,14,12,12,8,14,13,13,13,2,2,2,2,11,9,9,13,generated,-
Babazorros,6,Martín Heredia,-,DM,DC,26,ESP,EU,HGC,No,Registered,64,67,Right,188,84,8,13,12,11,7,12,12,11,12,14,14,14,13,9,10,11,11,12,2,2,2,2,14,10,11,12,generated,-
Babazorros,8,Pablo Escudero,-,MC,-,24,ESP,EU,HGN,No,Registered,66,70,Left,178,76,10,11,10,14,11,13,10,7,16,14,11,13,13,10,14,12,11,12,2,2,2,2,13,13,11,14,generated,capped by band
Babazorros,10,Andrés Negrete,-,MC,AMC,32,ESP,EU,HGC,No,Registered,63,63,Either,187,77,8,12,13,14,10,13,12,10,11,13,11,13,13,12,12,14,10,12,2,2,2,2,12,12,11,12,generated,-
Babazorros,11,Xavi Calvo,-,AML,-,28,ESP,EU,HGN,No,Registered,65,68,Left,179,72,13,11,13,13,11,7,6,8,11,11,6,11,11,8,14,13,8,14,2,2,2,2,12,13,14,12,generated,-
Babazorros,7,Leandro Vilaça,-,AMR,AMC,25,POR,EU,Non-HG,No,Registered,64,65,Right,177,76,11,12,16,12,10,6,4,6,10,12,6,11,10,6,13,10,10,15,2,2,2,2,12,12,14,12,generated,-
Babazorros,9,Ivo Garrido,-,ST,-,26,ESP,EU,HGN,No,Registered,66,67,Right,179,77,14,10,13,14,7,4,4,13,10,14,8,16,11,10,13,12,13,13,2,2,2,2,13,14,12,15,generated,capped by band
Babazorros,13,Tudor Mihai,-,GK,-,21,ROU,EU,Non-HG,Yes,U21 Exempt,57,65,Right,193,88,2,10,2,7,2,3,3,4,7,10,13,7,11,11,9,9,10,11,10,12,14,10,10,2,2,12,generated,-
Babazorros,23,Javier Alcázar,-,DL,ML,23,ESP,EU,Non-HG,No,Registered,60,67,Left,184,79,6,14,14,10,12,10,11,11,11,12,11,14,10,10,11,12,11,10,2,2,2,2,14,8,10,13,generated,-
Babazorros,15,Simone Colombo,-,DC,-,24,ITA,EU,Non-HG,No,Registered,59,62,Right,189,85,5,9,9,8,6,13,10,14,11,11,13,11,11,11,11,11,12,11,2,2,2,2,11,5,7,11,generated,-
Babazorros,24,Pedro Quiroga,-,DC,-,25,ARG,Non-EU,Non-HG,No,Registered,59,61,Right,188,79,5,10,8,10,5,11,12,13,9,12,11,14,11,10,11,12,12,9,2,2,2,2,12,6,6,13,generated,-
Babazorros,22,Álvaro Maldonado,-,DR,MR,25,ESP,EU,HGN,No,Registered,58,61,Right,182,75,7,13,12,12,10,11,11,9,9,12,12,14,9,8,12,12,12,11,2,2,2,2,11,9,9,11,generated,-
Babazorros,30,Mateo Toledo,-,DM,DC,19,ESP,EU,HGC,Yes,U21 Exempt,59,71,Right,173,70,6,10,10,10,7,13,10,8,10,10,13,14,13,8,9,11,11,9,2,2,2,2,13,8,7,12,generated,-
Babazorros,14,Daniel Palomo,-,MC,AMC,25,ESP,EU,HGN,No,Registered,61,61,Left,181,80,6,14,9,12,10,10,11,8,13,13,11,12,11,7,11,11,10,12,2,2,2,2,12,11,11,12,generated,-
Babazorros,17,Jaime Cáceres,-,AMC,-,30,COL,Non-EU,Non-HG,No,Registered,60,60,Either,179,74,12,14,11,12,11,7,9,8,13,11,9,12,11,11,11,12,12,11,2,2,2,2,10,11,12,13,generated,-
Babazorros,21,Rubén Almeida,-,AML,-,24,ESP,EU,HGC,No,Registered,57,64,Left,174,73,11,10,11,11,12,7,5,7,11,9,3,12,11,6,10,10,7,13,2,2,2,2,11,12,12,12,generated,-
Babazorros,19,Javier Negrete,-,AMR,-,26,ESP,EU,HGC,No,Registered,61,63,Left,177,74,12,11,12,14,9,6,2,6,9,11,5,13,10,7,13,10,12,13,2,2,2,2,12,11,15,12,generated,-
Babazorros,18,Nacho Calvo,-,ST,AMR/AML,35,ESP,EU,HGN,No,Registered,61,61,Right,180,73,12,9,12,13,8,6,3,12,9,10,5,12,13,9,13,12,12,14,2,2,2,2,13,12,8,12,generated,-
Babazorros,25,Rafa Barrios,-,GK,-,19,ESP,EU,HGC,Yes,U21 Exempt,58,74,Right,180,79,2,10,2,8,2,3,3,4,7,11,13,8,11,7,6,9,10,11,11,13,12,10,11,2,2,11,generated,-
Babazorros,31,Yeray Negrete,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,59,70,Right,182,83,7,13,12,11,10,11,11,7,12,12,10,11,11,7,10,11,11,12,2,2,2,2,12,11,10,13,generated,-
Babazorros,32,Aitor Varela,-,ST,AMC/AMR,19,ESP,EU,Non-HG,Yes,U21 Exempt,57,67,Right,189,85,13,10,9,12,8,5,3,9,9,10,5,11,11,9,12,10,9,8,2,2,2,2,10,13,9,10,generated,-
```

### Franjiverdes (Elche CF)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Franjiverdes,1,Adrián Trujillo,-,GK,-,29,ESP,EU,HGC,No,Registered,57,57,Either,193,86,2,10,3,8,2,3,3,4,9,10,13,6,11,9,8,9,10,10,11,13,12,10,10,2,2,10,generated,-
Franjiverdes,3,Martín Rueda,-,DL,DC,21,ESP,EU,HGC,Yes,U21 Exempt,62,74,Left,179,74,6,12,13,11,10,12,12,10,9,11,13,13,10,10,13,13,12,12,2,2,2,2,12,11,10,14,generated,-
Franjiverdes,4,Óscar Peláez,-,DC,DL,32,ESP,EU,HGC,No,Registered,63,63,Right,178,68,4,13,9,9,5,11,12,12,9,14,13,13,13,10,14,11,15,10,2,2,2,2,11,7,3,13,generated,capped by band
Franjiverdes,5,Davide Moretti,-,DC,-,25,ITA,EU,Non-HG,No,Registered,63,66,Right,189,85,5,9,9,10,3,13,13,14,9,11,12,11,11,10,11,14,14,10,2,2,2,2,13,6,6,12,generated,capped by band
Franjiverdes,2,Dario Petrović,-,DR,-,24,CRO,EU,Non-HG,No,Registered,62,69,Right,179,77,7,12,12,12,11,12,11,10,9,11,12,13,10,9,14,14,12,11,2,2,2,2,13,10,8,12,generated,-
Franjiverdes,6,Andrés Medina,-,DM,DC,29,ESP,EU,HGC,No,Registered,62,62,Right,178,76,8,13,9,11,7,14,10,12,10,12,15,12,11,11,10,9,9,11,2,2,2,2,13,7,8,14,generated,-
Franjiverdes,8,Jaime Peralta,-,MC,DM,28,COL,Non-EU,Non-HG,No,Registered,60,60,Left,174,75,8,13,12,11,10,10,10,6,12,13,9,12,13,10,12,10,11,13,2,2,2,2,11,10,10,14,generated,-
Franjiverdes,10,Duarte Fontes,-,MC,DM,31,POR,EU,Non-HG,No,Registered,62,62,Right,179,81,11,13,11,14,9,11,11,7,12,13,9,12,13,9,11,12,11,14,2,2,2,2,11,10,9,12,generated,-
Franjiverdes,11,Idrissa Diallo,-,AML,-,29,CIV,Non-EU,Non-HG,No,Registered,61,61,Left,182,75,12,11,13,13,11,6,4,8,11,11,8,12,12,8,12,13,11,12,2,2,2,2,9,11,14,10,generated,-
Franjiverdes,7,Rafa Almeida,-,AMR,-,29,ESP,EU,HGC,No,Registered,62,62,Right,186,84,12,10,13,13,12,7,4,8,10,11,5,12,10,8,13,13,11,14,2,2,2,2,12,12,12,13,generated,-
Franjiverdes,9,Nico Quintero,-,ST,AML/AMC,28,ESP,EU,HGN,No,Registered,63,65,Right,187,84,14,11,12,13,7,5,5,14,9,12,7,12,11,9,12,10,13,13,2,2,2,2,12,12,12,11,generated,capped by band
Franjiverdes,13,Gonzalo Cordero,-,GK,-,28,ESP,EU,HGC,No,Registered,56,59,Either,193,91,2,8,3,8,2,3,3,4,7,11,13,9,11,7,7,6,8,11,10,12,11,11,12,2,2,10,generated,-
Franjiverdes,23,Guillermo Arjona,-,DL,-,22,ESP,EU,HGN,No,Registered,56,59,Left,183,79,6,12,12,10,10,11,10,10,9,10,10,13,9,7,11,12,10,9,2,2,2,2,12,11,7,12,generated,-
Franjiverdes,15,Martín Crespo,-,DC,-,28,ESP,EU,HGC,No,Registered,59,61,Right,191,90,3,11,7,10,5,11,13,11,8,11,12,11,11,10,11,13,11,9,2,2,2,2,13,6,7,12,generated,-
Franjiverdes,24,Denis Radu,-,DC,DR/DL,21,ROU,EU,Non-HG,Yes,U21 Exempt,55,63,Right,183,74,5,11,7,11,7,13,10,11,9,8,13,12,9,10,8,8,13,10,2,2,2,2,10,5,5,9,generated,-
Franjiverdes,22,Andrei Barbu,-,DR,-,29,ROU,EU,Non-HG,No,Registered,54,54,Right,177,75,7,11,11,10,10,11,11,10,9,10,10,11,10,10,10,13,8,11,2,2,2,2,10,10,9,12,generated,-
Franjiverdes,30,Gonzalo Ibáñez,-,DM,-,17,ESP,EU,HGC,Yes,U21 Exempt,54,65,Right,187,82,7,11,9,9,6,11,9,9,9,11,12,10,10,9,9,9,9,11,2,2,2,2,10,9,7,15,generated,-
Franjiverdes,14,Bakary Sagna,-,MC,-,24,SEN,Non-EU,Non-HG,No,Registered,58,65,Left,176,67,8,13,12,11,9,10,9,7,11,11,10,10,12,10,13,13,9,11,2,2,2,2,11,11,10,13,generated,-
Franjiverdes,17,Yeray Olmedo,-,AMC,-,35,ESP,EU,HGN,No,Registered,56,56,Right,186,81,12,12,11,11,7,9,7,6,12,10,9,11,10,8,9,10,11,10,2,2,2,2,11,10,12,12,generated,-
Franjiverdes,21,Jorge Robles,-,AML,-,21,ESP,EU,HGC,Yes,U21 Exempt,57,64,Left,173,64,12,12,12,12,10,4,5,8,10,11,8,10,10,8,12,11,9,12,2,2,2,2,12,10,12,11,generated,-
Franjiverdes,19,Gonzalo Negrete,-,AMR,ST,27,ESP,EU,HGC,No,Registered,57,58,Right,179,76,12,9,11,13,8,7,5,6,8,9,6,11,8,6,13,11,10,13,2,2,2,2,8,10,13,11,generated,-
Franjiverdes,18,Raúl Fajardo,-,ST,AMC,26,ESP,EU,HGC,No,Registered,57,57,Right,187,90,10,9,10,16,8,4,4,10,10,11,8,10,11,7,13,11,10,10,2,2,2,2,11,11,9,9,generated,-
Franjiverdes,25,Lucas Maldonado,-,GK,-,17,ESP,EU,HGC,Yes,U21 Exempt,56,67,Right,195,94,2,10,3,9,2,3,3,4,6,12,9,8,13,8,7,7,12,11,11,11,11,12,13,2,2,9,generated,-
Franjiverdes,31,Leandro Cano,-,MC,DM/AMC,18,ESP,EU,HGC,Yes,U21 Exempt,56,71,Right,170,67,7,9,11,11,6,11,9,6,11,13,11,12,11,6,11,12,12,11,2,2,2,2,11,12,10,13,generated,-
Franjiverdes,32,Fernando Bermejo,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,57,71,Right,189,86,11,11,11,12,8,4,5,11,9,11,3,12,11,9,11,13,11,11,2,2,2,2,11,13,12,12,generated,-
```

### Granotas (Levante UD)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Granotas,1,Petros Kalogeros,-,GK,-,26,GRE,EU,Non-HG,No,Registered,61,61,Left,192,84,2,9,3,9,2,3,3,4,7,11,13,10,12,9,9,7,10,11,14,13,11,11,11,2,2,11,generated,-
Granotas,3,Adriano Gomes,-,DL,DC,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,63,74,Left,190,82,6,11,11,11,13,13,14,8,10,11,11,11,12,8,14,14,15,11,2,2,2,2,12,10,8,12,generated,capped by band
Granotas,4,Martín Palomo,-,DC,-,30,ESP,EU,HGC,No,Registered,60,60,Right,185,79,6,9,6,8,8,11,12,14,11,12,12,14,11,10,11,8,12,11,2,2,2,2,13,6,6,12,generated,-
Granotas,5,Guillermo Gallardo,-,DC,-,27,ESP,EU,HGN,No,Registered,60,63,Right,195,87,4,10,8,9,4,11,12,12,9,13,12,11,12,11,13,10,12,10,2,2,2,2,12,5,4,12,generated,-
Granotas,2,Joaquín Montiel,-,DR,WBR,27,MEX,Non-EU,Non-HG,No,Registered,61,61,Left,182,75,5,12,12,11,13,12,11,10,10,13,12,12,11,11,13,13,12,13,2,2,2,2,12,10,9,13,generated,-
Granotas,6,Rubén Soriano,-,DM,DC,27,ESP,EU,HGC,No,Registered,61,63,Right,188,86,5,13,10,10,8,12,12,11,12,12,12,13,9,11,10,12,12,10,2,2,2,2,12,9,9,11,generated,-
Granotas,8,Marcos Cabrera,-,MC,-,28,ESP,EU,HGN,No,Registered,63,64,Left,175,71,7,11,12,15,9,12,10,9,14,11,10,13,12,9,10,12,11,11,2,2,2,2,13,12,11,14,generated,capped by band
Granotas,10,Hélder Cardoso,-,MC,-,21,POR,EU,Non-HG,Yes,U21 Exempt,59,67,Left,181,79,7,11,10,12,7,11,9,10,11,14,10,13,11,9,12,13,10,11,2,2,2,2,12,11,11,12,generated,-
Granotas,11,Valentin Fournier,-,AML,-,28,FRA,EU,Non-HG,No,Registered,62,64,Left,180,74,12,12,12,12,12,6,4,7,10,11,7,13,12,8,13,13,9,11,2,2,2,2,12,15,14,12,generated,-
Granotas,7,Héctor Peláez,-,AMR,-,31,ESP,EU,HGC,No,Registered,62,62,Right,180,76,12,10,15,13,10,7,6,6,11,11,6,11,11,9,10,11,10,14,2,2,2,2,13,11,15,12,generated,-
Granotas,9,Santi Barrios,-,ST,-,25,ESP,EU,HGC,No,Registered,62,62,Right,186,78,13,12,11,13,8,3,5,11,10,11,7,12,12,7,13,12,11,10,2,2,2,2,11,14,9,12,generated,-
Granotas,13,Óscar Quiroga,-,GK,-,29,CHI,Non-EU,Non-HG,No,Registered,54,54,Right,185,74,2,9,2,9,2,3,3,4,7,9,10,7,9,8,7,6,11,9,13,12,12,9,9,2,2,9,generated,-
Granotas,23,Yeray Gallardo,-,DL,DC,27,ESP,EU,HGN,No,Registered,54,54,Left,187,84,9,10,10,9,13,12,9,9,9,8,10,9,8,7,12,12,10,9,2,2,2,2,10,11,9,10,generated,-
Granotas,30,Cristian Heredia,-,DC,-,19,ESP,EU,HGC,Yes,U21 Exempt,57,70,Right,188,82,4,9,8,11,6,11,12,12,9,9,12,9,10,9,10,10,13,10,2,2,2,2,12,6,8,10,generated,-
Granotas,15,Cláudio Alves,-,DC,-,27,POR,EU,Non-HG,No,Registered,57,58,Right,182,81,7,10,8,10,3,12,13,10,7,10,11,11,11,10,11,12,12,10,2,2,2,2,12,6,7,10,generated,-
Granotas,22,Martín Tapia,-,DR,-,21,ESP,EU,HGC,Yes,U21 Exempt,57,66,Right,181,77,6,11,11,10,12,12,11,8,10,10,11,11,10,9,12,12,8,11,2,2,2,2,11,9,10,11,generated,-
Granotas,14,Pablo Toledo,-,DM,DC,25,ESP,EU,HGN,No,Registered,55,56,Left,178,71,6,11,12,12,8,12,10,9,10,11,12,11,12,9,11,9,10,11,2,2,2,2,12,9,10,11,generated,-
Granotas,16,Samuel Montero,-,MC,-,25,ESP,EU,HGC,No,Registered,57,60,Either,183,81,7,12,11,10,8,10,9,6,13,12,12,10,11,8,10,10,9,10,2,2,2,2,11,11,10,13,generated,-
Granotas,17,Gonzalo Gallardo,-,AMC,AMR,25,ESP,EU,HGN,No,Registered,55,56,Right,180,80,10,13,11,11,9,8,9,8,10,12,8,12,11,10,11,11,9,11,2,2,2,2,10,10,11,11,generated,-
Granotas,21,Unai Aguilera,-,AML,-,27,ESP,EU,HGC,No,Registered,56,57,Right,180,77,10,9,11,10,12,5,6,8,9,11,5,11,12,6,13,9,9,13,2,2,2,2,10,11,10,11,generated,-
Granotas,19,Mathias Baert,-,AMR,-,31,BEL,EU,Non-HG,No,Registered,61,61,Either,188,83,12,10,14,11,11,7,6,6,10,10,7,10,10,9,13,13,9,10,2,2,2,2,12,12,14,12,generated,-
Granotas,18,Nacho Valdés,-,ST,-,27,ESP,EU,HGC,No,Registered,57,57,Right,185,78,12,13,11,12,6,5,4,12,8,9,7,11,11,9,13,12,12,10,2,2,2,2,10,11,9,11,generated,-
Granotas,25,Marcos Toledo,-,GK,-,21,ESP,EU,HGC,Yes,U21 Exempt,56,62,Left,196,92,2,8,3,6,2,3,3,4,8,13,12,7,12,10,8,9,9,10,11,11,11,11,10,2,2,12,generated,-
Granotas,31,Ivo Tapia,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,55,68,Right,184,71,7,13,11,9,7,10,8,7,11,12,9,10,10,8,10,10,8,10,2,2,2,2,11,10,9,12,generated,-
Granotas,32,Guillermo Segura,-,ST,AMC/AMR,18,ESP,EU,HGN,Yes,U21 Exempt,54,67,Left,187,84,12,9,10,12,6,4,4,9,7,10,5,10,10,6,12,13,9,11,2,2,2,2,10,11,10,12,generated,-
```

### Boquerones (Málaga CF)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Boquerones,1,Cláudio Loureiro,-,GK,-,34,POR,EU,Non-HG,No,Registered,61,61,Right,182,80,2,10,6,10,2,3,3,4,9,11,11,10,12,9,7,9,10,12,12,14,14,11,12,2,2,11,generated,-
Boquerones,3,Óscar Quintero,-,DL,DC,29,ESP,EU,HGN,No,Registered,61,61,Left,182,80,4,12,11,11,12,13,13,8,10,12,12,11,12,8,13,13,10,12,2,2,2,2,11,10,10,12,generated,-
Boquerones,4,Rubén Ibarra,-,DC,-,27,COL,Non-EU,Non-HG,No,Registered,60,63,Right,191,86,4,9,8,9,4,13,13,11,8,9,14,12,9,9,9,10,13,10,2,2,2,2,12,4,5,10,generated,-
Boquerones,5,Lars Vogel,-,DC,-,27,GER,EU,Non-HG,No,Registered,62,64,Right,188,82,5,11,9,8,5,13,13,13,8,10,14,12,10,11,10,12,14,10,2,2,2,2,11,7,3,11,generated,capped by band
Boquerones,2,Francisco Valente,-,DR,MR,27,POR,EU,Non-HG,No,Registered,61,64,Left,183,81,6,12,12,11,11,12,13,10,10,11,12,12,12,11,13,13,10,11,2,2,2,2,12,10,9,13,generated,-
Boquerones,6,Marc Escudero,-,DM,-,33,ESP,EU,HGN,No,Registered,60,60,Left,177,73,7,11,11,10,8,16,13,11,12,10,12,13,10,10,9,12,12,11,2,2,2,2,11,7,8,11,generated,-
Boquerones,8,César Quintero,-,MC,-,30,ESP,EU,Non-HG,No,Registered,61,61,Right,181,74,11,11,11,11,9,11,11,9,14,14,8,10,14,8,11,13,12,12,2,2,2,2,12,9,11,14,generated,-
Boquerones,10,Emanuele Rossetti,-,MC,AMC/DM,28,ITA,EU,Non-HG,No,Registered,61,61,Right,184,79,9,9,12,14,10,12,10,8,13,14,11,12,12,10,11,12,11,12,2,2,2,2,11,13,9,14,generated,-
Boquerones,11,Carlos Aguilera,-,AML,ST,29,ESP,EU,HGN,No,Registered,58,58,Left,176,72,12,12,10,12,8,5,5,9,8,11,7,12,8,6,12,10,11,14,2,2,2,2,9,15,13,10,generated,-
Boquerones,7,Wouter Smits,-,AMR,AMC,26,NED,EU,Non-HG,No,Registered,62,64,Left,175,77,10,12,12,12,11,6,6,4,12,12,6,12,12,4,14,11,9,15,2,2,2,2,12,13,12,10,generated,capped by band
Boquerones,9,Ivo Fajardo,-,ST,AMC,32,ESP,EU,Non-HG,No,Registered,62,62,Right,188,80,13,8,11,13,7,5,3,10,11,11,5,13,13,9,13,12,10,12,2,2,2,2,11,14,12,12,generated,capped by band
Boquerones,13,Gonzalo Varela,-,GK,-,28,ESP,EU,HGC,No,Registered,53,54,Right,189,84,2,8,4,8,2,3,3,4,10,10,10,9,10,8,9,9,9,10,11,12,11,10,10,2,2,11,generated,-
Boquerones,23,César Rojas,-,DL,-,27,MEX,Non-EU,Non-HG,No,Registered,54,57,Either,183,76,8,10,10,9,11,11,11,10,10,11,12,10,13,8,13,10,10,10,2,2,2,2,9,10,9,10,generated,-
Boquerones,15,Joaquín Trujillo,-,DC,DL,21,ESP,EU,HGC,Yes,U21 Exempt,53,65,Left,185,83,2,10,8,10,5,11,12,12,9,8,11,10,8,10,8,9,11,8,2,2,2,2,11,6,4,9,generated,-
Boquerones,24,Ivo Naranjo,-,DC,-,26,ESP,EU,HGC,No,Registered,55,56,Right,190,86,5,9,10,11,8,11,10,11,10,9,12,10,10,10,10,11,13,10,2,2,2,2,12,6,4,10,generated,-
Boquerones,22,Sergio Maldonado,-,DR,WBR,23,ESP,EU,HGN,No,Registered,53,58,Right,182,76,6,12,12,10,10,11,9,8,9,10,10,12,9,11,10,10,9,9,2,2,2,2,12,9,11,11,generated,-
Boquerones,30,Joaquín Camacho,-,DM,DC/MC,19,ESP,EU,HGN,Yes,U21 Exempt,53,68,Right,185,78,7,10,9,10,7,11,9,9,10,11,11,11,12,9,9,9,10,8,2,2,2,2,11,8,8,12,generated,-
Boquerones,14,Víctor Naranjo,-,MC,DM/AMC,19,ESP,EU,HGC,Yes,U21 Exempt,53,68,Left,175,67,6,10,10,10,8,10,9,7,11,12,9,10,10,7,9,9,9,10,2,2,2,2,10,10,8,13,generated,-
Boquerones,17,Unai Marín,-,AMC,-,25,ESP,EU,HGC,No,Registered,57,57,Right,185,77,10,13,12,12,10,6,7,8,14,8,10,12,9,9,11,13,9,9,2,2,2,2,11,9,12,15,generated,-
Boquerones,21,Unai Franco,-,AML,-,27,VEN,Non-EU,Non-HG,No,Registered,54,54,Right,186,87,12,10,12,9,8,7,6,5,8,10,6,10,8,6,11,12,8,11,2,2,2,2,8,13,12,10,generated,-
Boquerones,19,Tim Brandt,-,AMR,MR,23,GER,EU,Non-HG,No,Registered,54,59,Right,175,70,9,9,12,12,8,6,6,6,8,11,7,12,8,9,11,12,9,13,2,2,2,2,9,11,12,9,generated,-
Boquerones,18,Santi Olmedo,-,ST,-,30,ESP,EU,HGC,No,Registered,55,55,Right,179,79,11,8,12,9,7,6,4,11,10,12,5,12,11,8,10,13,11,12,2,2,2,2,10,13,11,13,generated,-
Boquerones,25,Unai Palomo,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,53,62,Left,187,82,2,8,3,6,2,3,3,4,10,11,9,10,11,9,8,5,10,11,9,12,12,11,12,2,2,12,generated,-
Boquerones,31,Pedro Crespo,-,MC,AMC,21,ESP,EU,HGC,Yes,U21 Exempt,54,61,Right,183,80,9,12,11,10,9,9,11,9,11,11,9,10,13,8,11,12,9,11,2,2,2,2,11,8,7,11,generated,-
Boquerones,32,Sergio Salcedo,-,ST,-,19,ESP,EU,HGC,Yes,U21 Exempt,53,65,Right,175,75,11,8,11,11,6,5,4,9,9,11,5,11,10,9,9,12,10,9,2,2,2,2,11,12,11,9,generated,-
```

### Herculinos (RC Deportivo La Coruña)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Herculinos,1,Damien Lemaire,-,GK,-,30,FRA,EU,Non-HG,No,Registered,62,62,Right,188,81,2,10,5,10,2,3,3,4,8,11,12,9,12,10,9,9,11,10,14,14,13,11,10,2,2,12,generated,capped by band
Herculinos,3,Raúl Castaño,-,DL,-,29,ESP,EU,HGC,No,Registered,62,62,Left,182,78,6,13,13,11,13,11,11,10,13,12,11,13,12,7,13,15,11,10,2,2,2,2,13,10,10,12,generated,capped by band
Herculinos,4,Jaime Zamora,-,DC,DR,28,ESP,EU,HGC,No,Registered,61,64,Right,186,82,6,12,6,9,6,10,14,15,10,10,12,12,11,10,11,11,14,12,2,2,2,2,12,6,7,11,generated,-
Herculinos,5,João Fontes,-,DC,DR,26,POR,EU,Non-HG,No,Registered,59,60,Right,192,93,4,10,8,11,5,12,12,12,6,11,12,12,11,8,11,10,13,9,2,2,2,2,12,5,4,11,generated,-
Herculinos,2,Joaquín Barrios,-,DR,-,31,ESP,EU,Non-HG,No,Registered,62,62,Left,173,71,7,11,11,11,11,14,13,10,9,11,12,11,12,10,14,14,10,12,2,2,2,2,11,12,11,12,generated,capped by band
Herculinos,6,Julián Palomo,-,DM,-,25,ESP,EU,HGC,No,Registered,61,63,Right,181,81,7,13,10,14,7,13,13,12,13,10,12,11,12,8,10,13,13,10,2,2,2,2,13,9,10,11,generated,-
Herculinos,8,Felipe Moraes,-,MC,DM,22,BRA,Non-EU,Non-HG,No,Registered,59,61,Right,179,77,8,14,12,10,9,10,10,9,13,12,11,11,11,10,11,10,11,10,2,2,2,2,11,11,10,13,generated,-
Herculinos,10,Zvonimir Bilić,-,MC,DM,31,CRO,EU,Non-HG,No,Registered,61,61,Right,178,75,8,12,9,12,8,12,10,7,13,12,11,13,12,8,10,11,12,13,2,2,2,2,12,13,11,13,generated,-
Herculinos,11,Samuel Cordero,-,AML,-,25,ESP,EU,HGC,No,Registered,62,62,Right,184,79,11,11,11,14,13,7,7,8,13,10,8,11,12,8,13,11,11,14,2,2,2,2,10,10,13,11,generated,capped by band
Herculinos,7,Jesús Sosa,-,AMR,-,29,URU,Non-EU,Non-HG,No,Registered,62,62,Right,179,69,10,11,12,14,12,6,5,7,11,10,6,13,12,9,16,12,10,13,2,2,2,2,11,10,12,13,generated,capped by band
Herculinos,9,Víctor Toledo,-,ST,AMC,24,ESP,EU,Non-HG,No,Registered,61,67,Right,178,74,13,10,11,13,6,6,3,12,11,11,6,12,11,8,11,11,13,11,2,2,2,2,11,14,10,11,generated,-
Herculinos,13,Cristian Barrios,-,GK,-,26,ESP,EU,HGC,No,Registered,55,57,Right,184,79,2,10,4,10,2,3,3,4,9,11,13,8,9,7,8,8,11,10,10,11,13,10,11,2,2,10,generated,-
Herculinos,23,Santi Segura,-,DL,-,26,ESP,EU,HGN,No,Registered,56,58,Right,180,80,8,11,10,12,11,13,9,9,10,11,12,11,11,7,10,14,11,10,2,2,2,2,11,9,10,11,generated,-
Herculinos,15,Nacho Zamora,-,DC,-,24,ESP,EU,HGC,No,Registered,56,63,Right,187,87,4,12,8,11,5,12,12,13,7,8,13,11,8,7,8,9,11,10,2,2,2,2,11,4,5,9,generated,-
Herculinos,30,Álvaro Rebollo,-,DC,-,20,ESP,EU,Non-HG,Yes,U21 Exempt,54,62,Right,186,77,3,10,7,9,5,11,11,10,8,10,12,12,10,11,10,11,11,7,2,2,2,2,11,6,5,10,generated,-
Herculinos,22,Marc Medina,-,DR,WBR,22,ESP,EU,HGN,No,Registered,53,56,Right,180,79,7,10,10,11,10,11,11,8,8,11,11,9,10,7,11,12,10,10,2,2,2,2,10,11,10,10,generated,-
Herculinos,14,Javier Ortuño,-,DM,DC,19,ESP,EU,HGC,Yes,U21 Exempt,60,74,Left,178,69,9,11,10,11,7,14,11,9,10,13,13,12,12,9,12,11,11,13,2,2,2,2,12,7,10,12,generated,-
Herculinos,16,Axel Noël,-,MC,AMC,28,FRA,EU,Non-HG,No,Registered,54,56,Right,179,67,7,12,10,10,9,9,9,7,12,11,11,10,10,9,10,10,10,11,2,2,2,2,10,10,8,12,generated,-
Herculinos,17,Ikenna Yakubu,-,AMC,-,32,NGA,Non-EU,Non-HG,No,Registered,53,53,Right,181,77,10,13,10,11,9,6,7,7,11,10,9,12,10,8,11,10,8,10,2,2,2,2,11,10,10,10,generated,-
Herculinos,21,Rafa Valdés,-,AML,ST,34,ESP,EU,HGN,No,Registered,55,55,Left,182,79,10,11,13,13,9,7,5,6,9,9,6,11,10,7,10,12,12,12,2,2,2,2,10,11,10,12,generated,-
Herculinos,19,Nuno Antunes,-,AMR,AMC,25,POR,EU,Non-HG,No,Registered,57,57,Right,177,79,9,13,13,14,9,5,5,7,9,12,6,11,10,9,11,10,8,13,2,2,2,2,10,11,12,10,generated,-
Herculinos,18,Stavros Dimitriou,-,ST,AML/AMC,23,GRE,EU,HGN,No,Registered,53,60,Right,188,82,12,9,10,10,5,5,4,10,8,9,5,11,9,8,10,10,11,12,2,2,2,2,12,11,10,10,generated,-
Herculinos,25,Samuel Zamora,-,GK,-,19,ESP,EU,HGC,Yes,U21 Exempt,53,63,Left,192,90,2,8,2,6,2,3,3,4,7,10,10,7,10,8,5,7,8,10,11,12,11,10,10,2,2,11,generated,-
Herculinos,31,Samuel Camacho,-,MC,-,18,ESP,EU,Non-HG,Yes,U21 Exempt,53,62,Right,180,77,7,11,11,9,9,7,10,8,10,12,8,12,12,8,12,11,9,9,2,2,2,2,9,10,8,12,generated,-
Herculinos,32,Santi Maldonado,-,ST,-,20,ESP,EU,HGC,Yes,U21 Exempt,55,62,Right,185,79,9,9,12,11,6,6,4,12,10,10,5,10,10,9,11,10,11,11,2,2,2,2,8,14,10,11,generated,-
```

### Montañeses (Real Racing Club de Santander)
**Reputation:** 58 | **CA Band:** 52–61 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Montañeses,1,Andrei Constantin,-,GK,-,28,ROU,EU,Non-HG,No,Registered,57,57,Right,187,82,2,9,4,9,2,3,3,4,8,12,12,7,12,8,8,6,10,10,11,11,12,11,11,2,2,10,generated,-
Montañeses,3,Cristian Arjona,-,DL,WBL,29,ESP,EU,HGC,No,Registered,60,60,Left,184,83,7,13,13,11,10,11,12,10,10,12,11,13,11,8,14,12,12,12,2,2,2,2,12,11,8,12,generated,-
Montañeses,4,Guillermo Paredes,-,DC,-,29,MEX,Non-EU,Non-HG,No,Registered,61,61,Right,185,82,3,10,8,10,5,12,12,15,10,10,12,12,11,9,11,12,13,10,2,2,2,2,13,6,5,11,generated,capped by band
Montañeses,5,Vlad Dumitru,-,DC,DM,29,ROU,EU,Non-HG,No,Registered,57,57,Left,184,79,4,11,9,7,4,12,12,12,10,9,13,12,10,11,10,10,11,7,2,2,2,2,11,6,7,10,generated,-
Montañeses,2,Santi Rebollo,-,DR,-,29,ESP,EU,HGC,No,Registered,57,57,Left,179,79,7,10,11,10,11,12,10,10,10,13,12,10,9,8,13,13,11,11,2,2,2,2,11,12,11,11,generated,-
Montañeses,6,Héctor Cabral,-,DM,MC/DC,24,ARG,Non-EU,Non-HG,No,Registered,60,65,Left,181,76,7,12,10,10,8,13,10,10,10,12,13,14,12,12,10,10,9,11,2,2,2,2,12,8,8,13,generated,-
Montañeses,8,Víctor Peláez,-,MC,-,28,ESP,EU,HGN,No,Registered,61,62,Either,187,83,8,13,12,14,8,11,9,7,12,9,9,12,12,11,9,12,12,13,2,2,2,2,11,13,9,14,generated,capped by band
Montañeses,10,Javier Sanchís,-,MC,AMC,23,ESP,EU,HGN,No,Registered,59,65,Right,175,74,8,11,11,11,8,12,8,9,10,13,10,12,13,8,10,12,8,12,2,2,2,2,12,11,11,13,generated,-
Montañeses,11,Álvaro Negrete,-,AML,-,31,ESP,EU,HGN,No,Registered,59,59,Left,182,80,11,9,13,15,10,5,6,6,11,10,3,13,11,7,11,11,8,12,2,2,2,2,10,10,13,12,generated,-
Montañeses,7,Thomas Jacquet,-,AMR,ST,27,FRA,EU,Non-HG,No,Registered,59,59,Left,179,76,9,11,12,14,10,6,5,7,11,8,7,10,12,9,13,10,10,14,2,2,2,2,11,11,11,11,generated,-
Montañeses,9,Raúl Arjona,-,ST,AML,26,ESP,EU,HGC,No,Registered,58,58,Right,176,79,12,9,10,14,7,5,4,10,9,11,8,13,10,10,13,11,10,10,2,2,2,2,11,12,11,11,generated,-
Montañeses,13,Hélder Sampaio,-,GK,-,21,POR,EU,Non-HG,Yes,U21 Exempt,54,59,Right,185,79,2,11,3,8,2,3,3,4,6,9,12,8,9,8,8,6,10,9,10,13,13,9,10,2,2,11,generated,-
Montañeses,23,Santi Casado,-,DL,DC,29,ESP,EU,HGC,No,Registered,54,54,Left,179,73,6,11,12,10,11,11,10,8,11,10,10,11,11,8,8,14,9,11,2,2,2,2,12,9,8,11,generated,-
Montañeses,30,Víctor Lara,-,DC,-,18,ESP,EU,HGC,Yes,U21 Exempt,55,67,Right,190,81,4,8,5,9,6,11,11,13,9,9,12,10,9,9,9,12,13,10,2,2,2,2,10,4,5,9,generated,-
Montañeses,15,Niels Van Leeuwen,-,DC,-,22,NED,EU,Non-HG,No,Registered,54,60,Right,195,96,5,9,9,9,3,13,11,12,7,9,10,11,8,11,9,11,11,7,2,2,2,2,12,5,5,9,generated,-
Montañeses,22,Mateo Salcedo,-,DR,-,24,ESP,EU,HGN,No,Registered,53,55,Left,183,79,6,10,10,11,10,10,11,8,9,10,11,9,11,7,11,13,11,12,2,2,2,2,10,10,8,10,generated,-
Montañeses,14,Samuel Maidana,-,DM,-,23,CHI,Non-EU,Non-HG,No,Registered,55,60,Left,181,74,5,11,8,10,7,11,10,10,11,11,11,12,10,10,9,10,10,9,2,2,2,2,12,8,6,11,generated,-
Montañeses,16,Fernando Montero,-,MC,DM,25,ESP,EU,HGN,No,Registered,54,57,Right,180,77,8,11,11,11,7,10,10,7,11,13,10,10,10,8,11,10,11,10,2,2,2,2,10,10,11,11,generated,-
Montañeses,17,Samuel Palomo,-,AMC,-,23,ESP,EU,HGC,No,Registered,52,55,Right,179,76,8,10,12,11,10,6,8,7,12,9,9,10,9,7,8,10,8,10,2,2,2,2,10,10,11,11,generated,-
Montañeses,21,Giacomo Cattaneo,-,AML,ML,23,ITA,EU,Non-HG,No,Registered,53,57,Left,174,71,11,9,10,11,8,7,4,8,8,8,7,10,9,5,10,10,10,13,2,2,2,2,8,10,14,8,generated,-
Montañeses,19,Jorge Bermejo,-,AMR,-,26,ESP,EU,HGC,No,Registered,56,58,Right,174,68,9,9,13,13,7,5,5,8,8,9,7,10,8,7,12,10,9,14,2,2,2,2,13,10,12,8,generated,-
Montañeses,18,Rubén Camacho,-,ST,-,34,ESP,EU,HGN,No,Registered,52,52,Right,186,82,11,8,10,11,4,6,5,9,8,10,5,11,10,9,9,10,10,11,2,2,2,2,10,12,12,11,generated,-
Montañeses,25,Leandro Rebollo,-,GK,-,21,ESP,EU,HGC,Yes,U21 Exempt,54,60,Right,196,87,2,10,2,9,2,3,3,4,8,10,12,7,11,8,9,9,10,10,11,10,12,10,10,2,2,7,generated,-
Montañeses,31,Víctor Barrios,-,MC,-,20,ESP,EU,HGC,Yes,U21 Exempt,53,59,Right,184,74,6,8,10,12,9,10,9,8,12,10,9,11,11,9,9,11,10,9,2,2,2,2,11,11,10,12,generated,-
Montañeses,32,Samuel Valdés,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,55,71,Right,180,74,12,11,10,10,7,4,4,10,10,10,6,13,11,9,10,12,10,9,2,2,2,2,11,13,9,9,generated,-
```

## 2. Serie A

### Giallorossi (AS Roma)
**Reputation:** 81 | **CA Band:** 67–76 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Giallorossi,1,Luca Gallo,-,GK,-,29,ITA,EU,HGC,No,Registered,75,75,Right,191,98,2,13,2,10,2,3,3,4,10,15,15,10,13,12,10,10,12,15,14,16,15,16,16,2,2,11,generated,-
Giallorossi,3,Lorenzo Costa,-,DL,ML,30,ITA,EU,HGN,No,Registered,72,72,Left,182,78,6,15,12,11,16,12,15,10,12,13,14,16,13,11,15,16,13,15,2,2,2,2,13,11,10,14,generated,-
Giallorossi,4,Gabriele Marino,-,DC,-,28,ITA,EU,HGC,No,Registered,75,78,Right,192,93,6,13,10,12,5,15,17,12,12,13,17,15,13,12,14,13,16,12,2,2,2,2,14,6,6,14,generated,-
Giallorossi,5,Patrick Kainz,-,DC,DL,30,AUT,EU,Non-HG,No,Registered,74,74,Right,185,83,4,13,9,12,5,15,16,16,10,12,16,14,12,12,12,13,17,11,2,2,2,2,14,6,6,12,generated,-
Giallorossi,2,Thanos Georgiou,-,DR,WBR/MR,28,GRE,EU,Non-HG,No,Registered,73,73,Right,184,79,9,13,13,13,17,17,13,12,11,12,14,13,14,10,16,16,14,14,2,2,2,2,12,14,12,12,generated,-
Giallorossi,6,Jamie Baxter,-,DM,-,32,ENG,Non-EU,Non-HG,No,Registered,74,74,Right,184,86,7,16,11,16,10,16,14,12,13,15,15,14,14,12,13,14,15,10,2,2,2,2,15,8,11,15,generated,-
Giallorossi,8,Tomás Alvarado,-,MC,AMC/DM,30,ARG,Non-EU,Non-HG,No,Registered,75,75,Right,180,76,12,16,14,16,9,14,10,11,15,14,11,15,15,10,13,14,13,14,2,2,2,2,14,12,13,17,generated,-
Giallorossi,10,Felix Ostermann,-,MC,-,23,SUI,Non-EU,Non-HG,No,Registered,75,79,Left,172,64,11,16,15,16,11,13,11,10,13,15,12,14,16,12,14,15,13,14,2,2,2,2,13,15,14,17,generated,-
Giallorossi,11,Riccardo Bellini,-,AML,-,30,ITA,EU,HGC,No,Registered,75,75,Left,173,70,16,13,14,15,10,6,5,9,10,13,7,16,11,9,15,16,14,17,2,2,2,2,14,19,17,13,generated,-
Giallorossi,7,Tin Lovrić,-,AMR,-,27,SVN,EU,Non-HG,No,Registered,73,73,Right,178,77,13,12,16,13,16,6,7,10,16,12,6,12,15,9,15,13,11,15,2,2,2,2,15,13,14,14,generated,-
Giallorossi,9,Marcin Sikora,-,ST,AMR,27,POL,EU,Non-HG,No,Registered,74,74,Left,188,84,15,12,13,14,9,7,4,12,11,13,6,15,18,12,15,13,12,14,2,2,2,2,13,17,15,13,generated,-
Giallorossi,13,Salvatore Carbone,-,GK,-,22,ITA,EU,HGC,No,Registered,68,75,Left,193,95,2,8,4,9,2,3,3,4,9,15,13,10,14,11,8,8,13,14,12,14,13,16,14,2,2,10,generated,-
Giallorossi,23,Giovanni Greco,-,DL,ML,26,ITA,EU,HGC,No,Registered,67,68,Left,178,73,7,14,14,12,12,15,12,11,13,13,12,12,11,10,16,14,11,12,2,2,2,2,13,11,10,13,generated,-
Giallorossi,15,Yanis Poirier,-,DC,DL,32,FRA,EU,Non-HG,No,Registered,67,67,Right,190,85,4,11,9,11,5,13,13,16,11,11,14,14,12,10,11,12,14,11,2,2,2,2,15,6,4,12,generated,-
Giallorossi,24,Tanner Walsh,-,DC,DR,30,USA,Non-EU,Non-HG,No,Registered,73,73,Left,186,84,5,12,9,10,6,17,17,14,10,12,14,14,12,11,11,16,14,9,2,2,2,2,16,8,4,12,generated,-
Giallorossi,22,Giacomo Leone,-,DR,MR,31,ITA,EU,HGC,No,Registered,69,69,Left,181,76,6,13,13,12,14,14,13,11,12,12,14,13,12,9,16,14,9,14,2,2,2,2,13,11,12,14,generated,-
Giallorossi,14,Gabriel Siqueira,-,DM,MC,30,BRA,Non-EU,Non-HG,No,Registered,69,69,Right,179,73,7,14,12,12,9,14,12,10,12,15,14,15,12,10,10,11,11,13,2,2,2,2,15,10,9,15,generated,-
Giallorossi,16,Frederik Andersen,-,MC,-,28,DEN,EU,Non-HG,No,Registered,69,69,Right,182,81,9,16,13,13,8,13,12,10,13,14,12,13,14,12,12,13,11,13,2,2,2,2,12,13,11,15,generated,-
Giallorossi,17,Nico Ferrer,-,AMC,-,20,ESP,EU,Non-HG,Yes,U21 Exempt,69,77,Right,176,71,14,14,14,13,13,8,8,9,14,13,9,15,13,9,13,13,13,13,2,2,2,2,13,13,16,13,generated,-
Giallorossi,30,Pietro Costa,-,AML,-,17,ITA,EU,HGC,Yes,U21 Exempt,69,80,Right,179,79,12,12,13,15,13,7,4,8,13,13,6,14,14,9,16,12,10,14,2,2,2,2,13,12,15,14,generated,-
Giallorossi,19,César Maldonado,-,AMR,-,24,ESP,EU,Non-HG,No,Registered,69,72,Right,177,76,12,13,13,13,16,7,6,7,15,12,6,13,12,10,15,14,9,14,2,2,2,2,14,13,15,12,generated,-
Giallorossi,18,Karlo Simić,-,ST,AML,23,SRB,Non-EU,Non-HG,No,Registered,71,77,Left,190,87,15,12,15,13,6,5,3,15,11,15,7,13,12,8,13,14,15,14,2,2,2,2,14,15,12,13,generated,-
Giallorossi,25,Paolo Caputo,-,GK,-,18,ITA,EU,HGC,Yes,U21 Exempt,70,86,Left,187,79,2,11,3,10,2,3,3,4,9,17,13,11,14,11,8,8,12,14,14,13,14,14,14,2,2,13,generated,-
Giallorossi,31,Giacomo Bruni,-,MC,AMC,19,ITA,EU,HGC,Yes,U21 Exempt,68,80,Right,181,78,11,14,12,14,10,11,9,11,14,15,13,14,11,10,14,13,11,14,2,2,2,2,13,12,12,15,generated,-
Giallorossi,32,Francesco Pellegrini,-,ST,-,19,ITA,EU,Non-HG,Yes,U21 Exempt,69,82,Right,184,79,14,12,15,13,8,5,4,16,12,15,5,12,12,8,13,14,15,13,2,2,2,2,15,13,12,12,generated,-
```

### Biancocelesti (SS Lazio)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Biancocelesti,1,Adil Ouazzani,-,GK,-,30,MAR,Non-EU,Non-HG,No,Registered,73,73,Right,190,79,2,11,2,11,2,3,3,4,8,15,12,11,15,10,7,9,13,14,16,16,14,14,15,2,2,12,generated,-
Biancocelesti,3,Vincenzo Caputo,-,DL,-,32,ITA,EU,HGC,No,Registered,73,73,Left,187,82,5,14,15,13,15,13,16,11,12,13,14,16,12,10,13,16,12,15,2,2,2,2,13,13,9,15,generated,-
Biancocelesti,4,Lucas Declercq,-,DC,-,23,BEL,EU,Non-HG,No,Registered,73,78,Right,183,74,5,12,10,11,5,12,14,17,9,14,16,14,14,11,14,12,14,11,2,2,2,2,16,7,6,14,generated,-
Biancocelesti,5,Tomás Freitas,-,DC,DR,32,POR,EU,Non-HG,No,Registered,72,72,Left,186,89,6,12,10,12,6,15,15,15,11,12,14,15,13,12,13,15,15,10,2,2,2,2,16,6,8,13,generated,-
Biancocelesti,2,Diego Bianco,-,DR,DC,26,ITA,EU,HGN,No,Registered,73,75,Right,179,77,7,12,15,13,13,15,13,11,12,14,14,15,13,10,16,16,13,16,2,2,2,2,17,12,13,14,generated,-
Biancocelesti,6,Matteo Caputo,-,DM,MC/DC,24,ITA,EU,HGC,No,Registered,73,75,Right,185,77,9,15,13,15,7,15,14,12,14,14,14,14,13,11,11,15,14,13,2,2,2,2,14,9,9,16,generated,-
Biancocelesti,8,Josip Dujmović,-,MC,-,26,SVN,EU,Non-HG,No,Registered,68,68,Right,177,75,11,13,13,13,8,13,10,9,15,13,9,13,13,10,11,13,12,13,2,2,2,2,14,13,10,16,generated,-
Biancocelesti,10,Luiz Medeiros,-,MC,DM,24,BRA,Non-EU,Non-HG,No,Registered,74,80,Left,174,73,9,17,14,15,9,14,13,9,15,15,12,14,14,11,13,14,14,14,2,2,2,2,14,12,11,15,generated,capped by band
Biancocelesti,11,Filippo Santoro,-,AML,ML/ST,33,ITA,EU,HGC,No,Registered,73,73,Either,170,68,11,14,15,13,15,5,6,8,15,12,6,14,15,9,16,14,12,14,2,2,2,2,14,16,15,14,generated,-
Biancocelesti,7,Ivan Janković,-,AMR,-,34,MKD,Non-EU,Non-HG,No,Registered,74,74,Right,182,78,11,14,16,15,14,9,6,6,14,14,6,15,16,9,14,13,14,17,2,2,2,2,12,15,15,13,generated,capped by band
Biancocelesti,9,Sergio Cordero,-,ST,-,29,ESP,EU,Non-HG,No,Registered,71,71,Left,186,78,16,10,13,11,8,6,5,13,11,14,7,15,12,11,16,11,14,13,2,2,2,2,12,17,13,13,generated,-
Biancocelesti,13,Adrien Hamon,-,GK,-,26,FRA,EU,Non-HG,No,Registered,68,70,Left,191,84,2,9,4,10,2,3,3,4,10,13,13,11,14,10,8,10,11,13,13,14,14,15,15,2,2,12,generated,-
Biancocelesti,23,Besnik Hoxha,-,DL,ML,19,ALB,Non-EU,Non-HG,Yes,U21 Exempt,68,82,Left,185,83,6,13,14,14,13,13,13,11,11,14,14,14,9,8,16,14,13,12,2,2,2,2,13,11,10,12,generated,-
Biancocelesti,15,Willian Albuquerque,-,DC,-,30,BRA,Non-EU,Non-HG,No,Registered,66,66,Left,194,90,5,10,8,10,8,13,14,14,11,11,14,13,11,11,10,12,14,10,2,2,2,2,15,7,7,11,generated,-
Biancocelesti,24,Christian Winther,-,DC,DL,22,DEN,EU,Non-HG,No,Registered,68,70,Left,192,82,5,12,7,12,8,13,13,14,7,14,14,13,14,12,14,13,15,12,2,2,2,2,12,6,7,13,generated,-
Biancocelesti,22,Karlo Tomić,-,DR,-,23,CRO,EU,Non-HG,No,Registered,67,71,Right,173,63,6,14,14,12,12,15,13,11,10,12,11,13,12,11,13,16,12,12,2,2,2,2,14,13,9,14,generated,-
Biancocelesti,30,Marco Ferrara,-,DM,DC,20,ITA,EU,HGC,Yes,U21 Exempt,68,77,Left,167,61,6,14,11,16,8,13,11,12,13,14,14,15,16,13,12,13,11,13,2,2,2,2,15,9,8,14,generated,-
Biancocelesti,14,Tommaso Farina,-,MC,-,24,ITA,EU,Non-HG,No,Registered,66,69,Right,179,75,9,12,14,17,10,12,10,8,13,14,11,12,12,9,11,11,10,12,2,2,2,2,12,11,12,16,generated,-
Biancocelesti,17,Damian Chmielewski,-,AMC,-,30,POL,EU,Non-HG,No,Registered,66,66,Right,187,82,11,13,13,13,12,6,8,9,15,13,6,13,14,10,13,14,11,14,2,2,2,2,15,14,13,15,generated,-
Biancocelesti,21,Roko Šarić,-,AML,ML,32,CRO,EU,Non-HG,No,Registered,68,68,Left,177,76,12,13,13,14,17,6,6,9,12,11,10,13,11,8,16,13,11,12,2,2,2,2,12,14,14,11,generated,-
Biancocelesti,19,Davi Rocha,-,AMR,MR,34,BRA,Non-EU,Non-HG,No,Registered,65,65,Right,185,87,11,11,14,12,13,8,6,6,13,10,5,13,13,8,14,12,11,13,2,2,2,2,13,13,13,13,generated,-
Biancocelesti,18,Mislav Dujmović,-,ST,AML,26,CRO,EU,Non-HG,No,Registered,65,65,Left,186,79,15,10,14,13,7,5,5,11,9,11,6,13,12,11,13,12,12,10,2,2,2,2,14,13,12,14,generated,-
Biancocelesti,25,Paolo De Luca,-,GK,-,18,ITA,EU,HGN,Yes,U21 Exempt,65,77,Right,194,93,2,12,4,10,2,3,3,4,10,13,13,8,12,11,9,8,9,15,12,14,13,13,12,2,2,12,generated,-
Biancocelesti,31,Stefano Orlando,-,MC,-,18,ITA,EU,HGC,Yes,U21 Exempt,65,76,Right,177,72,9,13,12,13,11,10,11,10,16,13,11,12,12,11,13,11,12,11,2,2,2,2,12,12,12,15,generated,-
Biancocelesti,32,Luca Bruni,-,ST,-,20,ITA,EU,HGC,Yes,U21 Exempt,66,76,Right,187,80,15,10,13,12,8,6,4,12,11,13,7,13,13,8,14,13,13,11,2,2,2,2,13,13,9,12,generated,-
```

### Viola (ACF Fiorentina)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Viola,1,Giacomo Rossetti,-,GK,-,25,ITA,EU,HGN,No,Registered,73,75,Right,189,84,2,14,2,8,2,3,3,4,11,14,15,9,14,12,10,8,11,14,14,16,15,14,15,2,2,12,generated,-
Viola,3,Manuel Ferrara,-,DL,DC,27,ITA,EU,HGC,No,Registered,73,76,Left,177,68,5,15,14,13,14,15,13,10,12,16,15,14,12,10,15,16,14,14,2,2,2,2,15,12,11,15,generated,-
Viola,4,Alan Freitas,-,DC,-,31,BRA,Non-EU,Non-HG,No,Registered,74,74,Right,192,86,5,13,11,13,7,15,16,14,10,12,16,14,12,11,12,15,17,11,2,2,2,2,16,5,2,12,generated,capped by band
Viola,5,Marvin Giesler,-,DC,-,27,GER,EU,Non-HG,No,Registered,74,75,Left,181,80,4,10,9,11,4,14,15,15,10,16,14,13,14,10,15,15,15,11,2,2,2,2,15,5,6,16,generated,capped by band
Viola,2,Nico Zamora,-,DR,-,31,ESP,EU,Non-HG,No,Registered,73,73,Left,183,77,8,12,14,13,12,14,13,9,12,14,17,16,12,9,17,16,13,14,2,2,2,2,13,10,11,16,generated,-
Viola,6,Noah Wimmer,-,DM,MC,27,AUT,EU,Non-HG,No,Registered,74,74,Right,174,68,8,15,12,12,8,15,14,12,14,15,15,16,13,11,14,14,14,14,2,2,2,2,15,10,10,15,generated,capped by band
Viola,8,Sam Beekman,-,MC,DM,31,NED,EU,Non-HG,No,Registered,71,71,Left,177,74,10,15,13,14,9,12,9,10,13,14,14,14,15,12,13,14,12,12,2,2,2,2,15,14,13,16,generated,-
Viola,10,Siebe Jacobs,-,MC,-,28,BEL,EU,Non-HG,No,Registered,71,73,Right,183,77,11,14,13,15,10,13,10,9,14,16,12,13,13,10,14,13,14,12,2,2,2,2,13,14,9,16,generated,-
Viola,11,Armando Zeqiri,-,AML,-,27,ALB,Non-EU,Non-HG,No,Registered,74,75,Left,184,80,12,12,16,14,15,7,4,8,11,13,7,15,15,7,16,12,10,16,2,2,2,2,15,14,17,13,generated,capped by band
Viola,7,Tin Tomić,-,AMR,-,33,SVN,EU,Non-HG,No,Registered,74,74,Left,175,76,14,12,16,17,11,8,6,8,12,13,6,13,12,11,16,13,12,15,2,2,2,2,14,15,15,15,generated,capped by band
Viola,9,Jonas Franke,-,ST,AMC,25,SUI,Non-EU,Non-HG,No,Registered,73,74,Right,189,91,15,11,13,15,8,5,4,13,11,12,8,14,14,10,16,12,14,14,2,2,2,2,14,16,12,12,generated,-
Viola,13,Davide Carbone,-,GK,-,23,ITA,EU,HGN,No,Registered,65,72,Right,189,92,2,11,3,9,2,3,3,4,9,15,12,10,14,12,8,7,12,15,12,11,13,15,14,2,2,11,generated,-
Viola,23,Javier Vidal,-,DL,ML,28,ESP,EU,Non-HG,No,Registered,68,68,Left,184,82,6,14,13,14,12,14,12,10,11,11,13,15,14,8,16,13,12,13,2,2,2,2,13,11,9,15,generated,-
Viola,15,Vincenzo Marino,-,DC,-,27,ITA,EU,HGC,No,Registered,65,65,Left,187,79,5,13,10,12,5,12,14,15,8,10,15,13,11,12,11,13,12,11,2,2,2,2,14,5,4,11,generated,-
Viola,24,Héctor Montiel,-,DC,DL,21,COL,Non-EU,Non-HG,Yes,U21 Exempt,71,82,Right,186,77,3,12,8,14,5,13,13,15,12,15,13,13,15,11,15,11,15,10,2,2,2,2,15,7,5,16,generated,-
Viola,22,Ivan Babić,-,DR,DC/WBR,19,CRO,EU,Non-HG,Yes,U21 Exempt,65,80,Right,185,83,6,13,13,11,13,13,14,8,10,12,11,13,12,12,14,14,13,11,2,2,2,2,12,12,10,13,generated,-
Viola,14,Stefano Gallo,-,DM,-,24,ITA,EU,HGC,No,Registered,69,72,Right,184,83,8,12,9,13,8,14,13,8,13,14,13,15,12,9,14,13,13,12,2,2,2,2,15,8,9,16,generated,-
Viola,16,Roberto Fabbri,-,MC,DM/AMC,27,ITA,EU,HGN,No,Registered,67,70,Right,174,69,8,12,13,13,8,14,11,7,14,12,11,14,15,11,13,14,12,11,2,2,2,2,15,13,13,14,generated,-
Viola,17,Joseph Frimpong,-,AMC,-,26,GHA,Non-EU,Non-HG,No,Registered,72,72,Right,173,67,13,15,16,15,12,10,9,10,14,14,9,16,14,9,15,13,11,14,2,2,2,2,13,14,15,14,generated,-
Viola,21,Riccardo De Angelis,-,AML,-,27,ITA,EU,HGC,No,Registered,66,67,Left,179,67,12,12,16,14,8,6,6,8,9,12,8,13,9,10,14,12,11,15,2,2,2,2,12,14,13,13,generated,-
Viola,19,Ahmet Kaya,-,AMR,ST,28,TUR,Non-EU,Non-HG,No,Registered,65,66,Left,180,82,13,13,14,12,14,8,5,5,14,11,6,11,13,10,13,13,11,12,2,2,2,2,13,12,13,14,generated,-
Viola,30,Gianluca Cattaneo,-,ST,AMC,19,ITA,EU,HGN,Yes,U21 Exempt,65,78,Right,179,71,14,10,13,11,5,5,6,13,11,13,7,12,13,11,11,12,13,13,2,2,2,2,14,14,10,11,generated,-
Viola,25,Giorgio Fontana,-,GK,-,17,ITA,EU,HGN,Yes,U21 Exempt,65,80,Left,190,95,2,9,3,9,2,3,3,4,12,12,15,9,12,10,7,8,12,13,11,14,15,12,13,2,2,12,generated,-
Viola,31,Tommaso Bruni,-,MC,-,17,ITA,EU,HGC,Yes,U21 Exempt,68,78,Right,178,70,11,14,12,13,10,12,11,10,15,14,11,14,14,10,13,12,11,13,2,2,2,2,12,12,12,15,generated,-
Viola,32,Roberto Greco,-,ST,AMC,18,ITA,EU,HGC,Yes,U21 Exempt,65,75,Right,181,79,12,9,14,10,7,6,2,14,10,14,4,13,12,10,13,12,14,13,2,2,2,2,13,15,11,13,generated,-
```

### Felsinei (Bologna FC 1909)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Felsinei,1,Michele Caputo,-,GK,-,30,ITA,EU,HGC,No,Registered,72,72,Right,187,85,2,12,3,10,2,3,3,4,9,14,15,9,13,11,9,11,13,14,14,14,16,15,13,2,2,11,generated,-
Felsinei,3,Elias Strömberg,-,DL,-,32,SWE,EU,Non-HG,No,Registered,71,71,Right,175,75,8,14,14,13,15,16,14,11,12,13,13,13,12,10,15,14,13,15,2,2,2,2,14,12,11,14,generated,-
Felsinei,4,Ivo Alcázar,-,DC,DR,26,ESP,EU,Non-HG,No,Registered,70,72,Right,189,78,4,11,7,11,6,15,14,14,10,13,14,11,13,12,13,13,15,10,2,2,2,2,14,5,4,13,generated,-
Felsinei,5,Simon Winter,-,DC,DM,31,AUT,EU,Non-HG,No,Registered,73,73,Right,191,87,4,12,9,13,5,15,15,15,11,13,15,12,12,12,12,11,16,12,2,2,2,2,15,6,5,15,generated,-
Felsinei,2,Antonio Bruni,-,DR,-,30,ITA,EU,HGC,No,Registered,72,72,Right,180,80,8,15,13,15,12,16,13,10,11,14,14,15,14,11,16,17,12,12,2,2,2,2,14,14,10,13,generated,-
Felsinei,6,Samuele Rossetti,-,DM,-,29,ITA,EU,HGC,No,Registered,74,74,Right,183,81,7,15,13,13,9,15,13,11,12,14,14,16,13,8,13,15,13,14,2,2,2,2,16,9,6,16,generated,capped by band
Felsinei,8,Rafa Palomo,-,MC,DM,31,ESP,EU,Non-HG,No,Registered,72,72,Left,177,70,9,15,12,14,9,13,10,8,16,14,13,13,14,9,13,16,11,13,2,2,2,2,14,13,12,15,generated,-
Felsinei,10,Raúl Figueroa,-,MC,DM,23,URU,Non-EU,Non-HG,No,Registered,71,75,Right,176,76,8,14,14,13,10,14,11,10,15,14,14,13,14,10,12,13,12,12,2,2,2,2,14,13,12,18,generated,-
Felsinei,11,Jelle Hendriks,-,AML,-,23,NED,EU,Non-HG,No,Registered,74,81,Left,181,71,13,13,14,15,13,6,6,8,12,13,7,16,13,9,16,15,10,19,2,2,2,2,13,14,15,15,generated,capped by band
Felsinei,7,Robbe De Smedt,-,AMR,ST,27,BEL,EU,Non-HG,No,Registered,73,76,Left,182,75,14,14,16,13,12,6,5,7,12,12,8,15,12,10,15,12,9,17,2,2,2,2,13,14,17,14,generated,-
Felsinei,9,Wouter De Jong,-,ST,-,30,NED,EU,Non-HG,No,Registered,74,74,Right,182,83,15,11,12,13,6,5,6,14,11,12,6,13,18,12,17,13,15,15,2,2,2,2,14,15,11,12,generated,capped by band
Felsinei,13,Dušan Stojanović,-,GK,-,28,BIH,Non-EU,Non-HG,No,Registered,66,67,Right,188,90,2,10,4,8,2,3,3,4,9,12,14,10,12,12,8,8,10,12,14,14,14,12,12,2,2,9,generated,-
Felsinei,23,Fatjon Lleshi,-,DL,WBL,25,ALB,Non-EU,Non-HG,No,Registered,66,66,Left,182,81,7,13,15,13,15,13,14,12,11,12,11,13,13,9,13,12,12,13,2,2,2,2,13,11,10,14,generated,-
Felsinei,15,Mathias Ahlberg,-,DC,DR,24,SWE,EU,Non-HG,No,Registered,70,73,Right,191,90,5,13,8,13,4,15,13,16,11,12,15,13,12,11,12,14,14,11,2,2,2,2,15,7,5,12,generated,-
Felsinei,24,Davi Albuquerque,-,DC,-,33,BRA,Non-EU,Non-HG,No,Registered,65,65,Right,188,83,5,11,9,11,6,13,14,14,8,11,13,13,11,10,11,11,14,8,2,2,2,2,14,9,5,11,generated,-
Felsinei,22,Oğuz Çelik,-,DR,MR,29,TUR,Non-EU,Non-HG,No,Registered,67,67,Either,176,76,6,14,14,12,13,13,12,13,11,12,14,16,16,10,13,13,13,12,2,2,2,2,14,13,9,14,generated,-
Felsinei,14,Edoardo Fontana,-,DM,-,21,ITA,EU,HGN,Yes,U21 Exempt,66,72,Right,181,74,6,13,11,13,6,14,12,10,13,11,13,14,13,10,12,14,13,11,2,2,2,2,12,10,9,15,generated,-
Felsinei,30,Davide De Angelis,-,MC,-,18,ITA,EU,HGC,Yes,U21 Exempt,68,81,Right,172,67,8,13,12,14,11,13,10,9,15,14,13,13,13,11,12,13,13,14,2,2,2,2,13,14,11,14,generated,-
Felsinei,17,Tommaso Bianco,-,AMC,MC,36,ITA,EU,HGC,No,Registered,68,68,Right,176,70,12,13,14,13,11,9,8,9,14,13,10,14,13,10,12,14,12,14,2,2,2,2,14,14,16,15,generated,-
Felsinei,21,Mert Uçar,-,AML,-,26,TUR,Non-EU,Non-HG,No,Registered,68,70,Left,182,79,14,10,14,12,13,7,5,7,13,11,8,15,12,8,13,12,12,18,2,2,2,2,13,12,13,11,generated,-
Felsinei,19,Marko Lovrić,-,AMR,-,25,SVN,EU,Non-HG,No,Registered,65,65,Right,171,73,12,13,12,13,14,6,8,8,14,12,6,10,14,8,14,11,8,13,2,2,2,2,11,11,14,12,generated,-
Felsinei,18,Pietro Carbone,-,ST,AML,33,ITA,EU,HGN,No,Registered,66,66,Left,184,81,14,9,13,14,6,6,2,14,11,12,6,15,11,11,12,11,12,13,2,2,2,2,14,15,10,14,generated,-
Felsinei,25,Filippo Villa,-,GK,-,17,ITA,EU,HGC,Yes,U21 Exempt,67,78,Right,188,81,2,10,3,8,2,3,3,4,10,15,12,9,14,11,7,7,12,14,16,11,10,15,15,2,2,11,generated,-
Felsinei,31,Giacomo Barone,-,MC,-,19,ITA,EU,HGC,Yes,U21 Exempt,68,82,Right,179,76,11,13,13,14,11,13,11,10,13,14,11,14,12,10,10,15,12,15,2,2,2,2,14,13,10,15,generated,-
Felsinei,32,Marco Farina,-,ST,-,19,ITA,EU,HGC,Yes,U21 Exempt,68,84,Right,187,85,16,12,14,14,9,5,4,16,10,13,6,14,12,12,13,13,14,14,2,2,2,2,14,11,11,13,generated,-
```

### Granata (Torino FC)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Granata,1,Jakub Olszewski,-,GK,-,36,POL,EU,Non-HG,No,Registered,70,70,Right,192,93,2,11,3,11,2,3,3,4,10,13,14,9,12,11,9,11,14,14,15,15,14,13,14,2,2,12,generated,capped by band
Granata,3,Emanuele Piras,-,DL,WBL,25,ITA,EU,Non-HG,No,Registered,70,70,Left,175,65,6,13,13,13,11,13,15,14,11,13,15,13,13,10,14,18,12,13,2,2,2,2,14,11,10,14,generated,capped by band
Granata,4,Hugo Fournier,-,DC,-,34,FRA,EU,Non-HG,No,Registered,69,69,Right,190,79,4,12,8,11,6,15,14,17,11,12,15,14,12,12,12,13,13,13,2,2,2,2,12,7,8,12,generated,-
Granata,5,Antonio Cattaneo,-,DC,DM,29,ITA,EU,Non-HG,No,Registered,69,69,Right,191,85,5,11,8,12,6,14,14,14,8,12,15,14,13,10,12,12,13,12,2,2,2,2,15,6,5,12,generated,-
Granata,2,Romain Millet,-,DR,-,27,FRA,EU,Non-HG,No,Registered,67,69,Right,182,78,7,12,12,13,14,14,14,11,10,11,14,12,13,11,14,14,10,15,2,2,2,2,12,13,11,13,generated,-
Granata,6,Ivo Figueroa,-,DM,MC,26,COL,Non-EU,Non-HG,No,Registered,68,69,Left,180,82,7,13,10,10,7,14,12,10,13,12,14,15,13,13,12,15,12,10,2,2,2,2,14,10,8,14,generated,-
Granata,8,Oğuz Güneş,-,MC,-,22,TUR,Non-EU,Non-HG,No,Registered,70,73,Right,180,77,10,13,14,16,8,12,11,8,12,14,13,14,15,12,13,14,12,14,2,2,2,2,14,13,12,17,generated,capped by band
Granata,10,Arthur Dumont,-,MC,-,30,BEL,EU,Non-HG,No,Registered,67,67,Right,177,73,8,10,11,16,10,12,10,6,14,16,13,12,13,9,13,12,13,11,2,2,2,2,13,13,12,16,generated,-
Granata,11,Tommaso Barone,-,AML,ML,23,ITA,EU,HGN,No,Registered,67,72,Left,183,85,12,12,14,15,11,6,6,9,11,11,8,14,12,6,14,14,11,16,2,2,2,2,14,12,14,11,generated,-
Granata,7,Akın Erdem,-,AMR,-,28,TUR,Non-EU,Non-HG,No,Registered,70,72,Left,174,71,14,15,13,15,10,8,5,9,10,11,8,12,10,11,14,12,10,17,2,2,2,2,14,16,16,11,generated,capped by band
Granata,9,Tom Arnaud,-,ST,AML,30,FRA,EU,Non-HG,No,Registered,68,68,Right,182,83,14,11,12,14,8,5,4,11,10,11,5,12,14,8,14,11,12,14,2,2,2,2,12,16,13,13,generated,-
Granata,13,Andrés Rojas,-,GK,-,32,COL,Non-EU,Non-HG,No,Registered,67,67,Right,188,86,2,11,2,9,2,3,3,4,10,16,11,9,13,11,11,9,11,14,14,14,13,13,13,2,2,12,generated,-
Granata,23,Jakub Nowicki,-,DL,DC,36,POL,EU,Non-HG,No,Registered,62,62,Left,183,82,6,10,13,10,14,13,11,11,11,10,14,13,12,9,10,13,12,12,2,2,2,2,12,10,10,13,generated,-
Granata,15,Vincenzo Bruni,-,DC,-,29,ITA,EU,HGN,No,Registered,62,62,Right,183,80,6,10,9,11,5,12,12,15,8,9,15,13,11,10,10,11,13,10,2,2,2,2,11,4,4,12,generated,-
Granata,24,Damien Fabre,-,DC,DR,27,FRA,EU,Non-HG,No,Registered,62,64,Right,194,86,4,10,7,10,4,13,11,13,8,10,13,11,12,9,13,13,13,11,2,2,2,2,13,4,6,13,generated,-
Granata,22,Anders Olesen,-,DR,-,34,DEN,EU,Non-HG,No,Registered,61,61,Left,178,77,8,11,12,10,13,12,13,9,10,11,10,12,13,9,13,14,11,13,2,2,2,2,12,12,8,12,generated,-
Granata,14,Gabriele De Luca,-,DM,MC,30,ITA,EU,HGC,No,Registered,61,61,Right,180,73,7,11,13,11,6,12,12,10,11,12,13,14,13,12,11,12,10,11,2,2,2,2,13,7,9,13,generated,-
Granata,30,Salvatore Silvestri,-,MC,AMC,18,ITA,EU,HGC,Yes,U21 Exempt,64,79,Right,185,84,10,14,11,12,11,11,10,8,13,14,14,12,13,11,11,13,10,13,2,2,2,2,13,9,10,14,generated,-
Granata,17,Magnus Rasmussen,-,AMC,-,22,DEN,EU,Non-HG,No,Registered,63,65,Either,173,68,11,10,14,13,10,8,7,7,14,12,8,14,12,10,13,13,9,13,2,2,2,2,14,12,14,13,generated,-
Granata,21,Ivan Simić,-,AML,ST/ML,25,BIH,Non-EU,Non-HG,No,Registered,70,70,Left,178,70,14,11,14,15,10,6,5,5,11,12,7,15,11,9,15,10,10,16,2,2,2,2,10,13,16,12,generated,capped by band
Granata,19,Javier Giménez,-,AMR,-,24,COL,Non-EU,Non-HG,No,Registered,64,69,Right,175,71,10,10,13,12,13,6,5,7,12,12,8,13,12,7,14,13,11,14,2,2,2,2,11,12,14,12,generated,-
Granata,18,Mario Matić,-,ST,-,27,CRO,EU,Non-HG,No,Registered,63,66,Right,186,85,13,8,13,13,7,3,4,12,9,11,7,15,12,9,13,11,12,10,2,2,2,2,13,13,12,13,generated,-
Granata,25,Nicolò Colombo,-,GK,-,18,ITA,EU,HGC,Yes,U21 Exempt,61,76,Right,189,82,2,11,6,8,2,3,3,4,9,14,12,8,12,10,8,9,11,12,14,11,10,12,12,2,2,11,generated,-
Granata,31,Alessandro Greco,-,MC,DM/AMC,18,ITA,EU,HGC,Yes,U21 Exempt,62,71,Right,173,69,7,13,12,12,9,11,11,7,14,10,10,13,12,9,9,11,9,13,2,2,2,2,14,12,10,14,generated,-
Granata,32,Mattia Colombo,-,ST,AML,20,ITA,EU,HGC,Yes,U21 Exempt,64,71,Right,182,76,13,11,13,12,8,5,3,12,11,12,6,13,13,10,13,11,12,14,2,2,2,2,13,14,11,15,generated,-
```

### Grifone (Genoa CFC)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Grifone,1,Roberto Orlando,-,GK,-,26,ITA,EU,HGN,No,Registered,68,71,Right,187,80,2,9,5,8,2,3,3,4,9,14,13,9,12,10,9,8,11,14,15,13,13,15,13,2,2,13,generated,-
Grifone,3,Roko Petrović,-,DL,WBL,23,SVN,EU,Non-HG,No,Registered,63,70,Left,173,70,6,13,13,11,12,12,12,11,11,9,13,14,11,9,12,13,11,13,2,2,2,2,13,11,9,12,generated,-
Grifone,4,Tomasz Kaczmarek,-,DC,DM,28,POL,EU,Non-HG,No,Registered,67,68,Right,189,85,4,12,7,11,5,14,14,15,9,11,13,11,12,12,12,12,15,10,2,2,2,2,13,6,5,12,generated,-
Grifone,5,Hugo Bouvier,-,DC,-,27,FRA,EU,Non-HG,No,Registered,65,66,Right,186,78,5,9,8,13,5,13,13,15,11,10,13,12,11,11,11,11,15,10,2,2,2,2,14,7,5,11,generated,-
Grifone,2,Domagoj Novak,-,DR,-,32,CRO,EU,Non-HG,No,Registered,69,69,Left,183,81,7,13,14,12,13,14,15,11,13,15,13,13,13,11,16,14,13,14,2,2,2,2,12,11,11,14,generated,capped by band
Grifone,6,Rúben Mendes,-,DM,-,31,POR,EU,Non-HG,No,Registered,66,66,Right,181,72,5,13,10,15,7,12,11,10,12,15,16,13,14,9,11,12,12,12,2,2,2,2,13,10,8,14,generated,-
Grifone,8,Filip Radovanović,-,MC,-,32,KOS,Non-EU,Non-HG,No,Registered,67,67,Right,176,70,11,12,14,15,10,11,10,9,13,16,12,12,13,10,15,12,12,14,2,2,2,2,13,12,12,16,generated,-
Grifone,10,Tunde Onuoha,-,MC,-,30,NGA,Non-EU,Non-HG,No,Registered,66,66,Left,177,68,10,13,14,12,11,12,11,9,16,15,12,13,13,9,12,11,11,11,2,2,2,2,14,10,11,14,generated,-
Grifone,11,Paolo Ferrara,-,AML,-,31,ITA,EU,HGC,No,Registered,69,69,Left,179,75,12,10,15,14,12,6,5,8,12,14,8,12,13,10,16,12,11,16,2,2,2,2,14,12,13,12,generated,capped by band
Grifone,7,Toni Đorđević,-,AMR,-,30,SRB,Non-EU,Non-HG,No,Registered,68,68,Left,177,78,10,13,14,12,15,7,6,6,15,10,6,10,15,8,14,13,13,14,2,2,2,2,13,13,15,12,generated,-
Grifone,9,Filip Janković,-,ST,-,27,SRB,Non-EU,Non-HG,No,Registered,67,70,Left,188,83,14,11,15,11,9,5,3,15,10,14,4,13,14,11,13,15,15,11,2,2,2,2,14,12,11,13,generated,-
Grifone,13,Nicola Sala,-,GK,-,21,ITA,EU,HGC,Yes,U21 Exempt,62,67,Either,195,86,2,8,5,7,2,3,3,4,10,12,12,9,12,10,8,8,10,10,13,14,13,12,11,2,2,11,generated,-
Grifone,23,Toni Babić,-,DL,-,33,CRO,EU,Non-HG,No,Registered,61,61,Either,190,84,7,13,13,11,12,12,11,10,9,12,10,14,10,7,13,12,13,11,2,2,2,2,13,12,8,13,generated,-
Grifone,15,Nicolae Georgescu,-,DC,DR,27,ROU,EU,Non-HG,No,Registered,67,68,Right,193,84,5,10,8,12,5,16,15,13,11,11,13,13,11,12,11,12,15,10,2,2,2,2,12,6,3,11,generated,-
Grifone,30,Samuele Leone,-,DC,-,20,ITA,EU,HGC,Yes,U21 Exempt,62,74,Right,191,89,3,10,7,10,5,13,14,14,7,10,14,10,10,10,10,10,11,11,2,2,2,2,12,4,7,10,generated,-
Grifone,22,Besnik Kastrati,-,DR,-,27,ALB,Non-EU,Non-HG,No,Registered,60,60,Left,187,80,8,11,12,12,11,12,14,8,11,9,12,12,9,10,12,12,12,10,2,2,2,2,12,11,10,12,generated,-
Grifone,14,Kai Vogel,-,DM,-,24,GER,EU,Non-HG,No,Registered,65,70,Right,190,84,6,12,10,12,9,14,13,11,12,12,13,13,13,11,11,13,13,11,2,2,2,2,13,8,9,14,generated,-
Grifone,16,Lorenzo Longo,-,MC,-,22,ITA,EU,HGC,No,Registered,60,65,Right,189,83,9,15,12,12,9,11,13,8,10,11,10,11,12,9,10,12,9,11,2,2,2,2,11,11,10,12,generated,-
Grifone,17,Lorenzo Piras,-,AMC,-,25,ITA,EU,HGN,No,Registered,60,60,Right,184,78,12,11,13,12,10,7,7,7,11,14,6,11,14,9,10,10,10,14,2,2,2,2,14,14,9,12,generated,-
Grifone,21,Philipp Sauer,-,AML,-,32,GER,EU,Non-HG,No,Registered,60,60,Left,179,80,11,10,14,13,9,7,7,9,9,11,6,11,9,7,12,11,11,13,2,2,2,2,13,12,13,11,generated,-
Grifone,19,Michele Bellini,-,AMR,ST,24,ITA,EU,HGN,No,Registered,63,68,Right,181,77,13,12,13,13,11,7,6,7,12,12,7,12,12,9,13,12,9,15,2,2,2,2,11,12,11,11,generated,-
Grifone,18,Davi Barbosa,-,ST,-,24,BRA,Non-EU,Non-HG,No,Registered,64,70,Either,188,82,14,9,11,12,7,8,6,10,8,11,8,13,13,10,14,12,11,11,2,2,2,2,11,15,10,13,generated,-
Grifone,25,Stefano Fabbri,-,GK,-,18,ITA,EU,HGC,Yes,U21 Exempt,62,77,Left,192,88,2,8,5,10,2,3,3,4,10,13,12,9,13,10,9,9,11,13,13,11,11,14,13,2,2,10,generated,-
Grifone,31,Giacomo Gallo,-,MC,DM,19,ITA,EU,HGC,Yes,U21 Exempt,60,76,Right,191,91,9,11,11,13,8,11,10,10,15,11,9,11,11,9,11,11,9,12,2,2,2,2,11,11,11,14,generated,-
Grifone,32,Manuel Colombo,-,ST,AMC,20,ITA,EU,HGC,Yes,U21 Exempt,62,72,Right,185,88,14,7,12,11,7,5,4,12,11,12,6,14,10,12,13,11,12,10,2,2,2,2,12,14,9,15,generated,-
```

### Zebrette (Udinese Calcio)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Zebrette,1,Valerio Villa,-,GK,-,26,ITA,EU,HGC,No,Registered,66,67,Left,187,88,2,11,4,10,2,3,3,4,9,14,12,8,14,12,7,10,12,14,12,13,14,14,14,2,2,12,generated,-
Zebrette,3,Mihai Lungu,-,DL,DC,27,ROU,EU,Non-HG,No,Registered,66,68,Left,182,75,6,13,13,12,14,14,13,11,11,12,13,12,11,10,14,13,12,11,2,2,2,2,13,8,11,13,generated,-
Zebrette,4,Sem Kok,-,DC,-,28,NED,EU,Non-HG,No,Registered,67,70,Right,194,93,4,11,10,11,5,14,14,14,10,13,13,13,13,13,13,13,12,9,2,2,2,2,13,7,6,13,generated,capped by band
Zebrette,5,Krzysztof Rutkowski,-,DC,-,27,POL,EU,Non-HG,No,Registered,66,68,Right,189,89,4,11,8,11,6,14,14,13,10,12,14,12,12,9,12,11,13,9,2,2,2,2,13,9,6,12,generated,-
Zebrette,2,Edoardo Bianco,-,DR,DC,25,ITA,EU,HGN,No,Registered,67,68,Left,184,78,8,14,14,11,14,13,11,12,12,13,13,14,12,9,13,15,12,13,2,2,2,2,13,12,12,14,generated,capped by band
Zebrette,6,Simone Fontana,-,DM,-,27,ITA,EU,HGN,No,Registered,67,67,Right,179,77,7,13,12,13,8,13,14,10,14,12,12,12,11,8,11,14,14,14,2,2,2,2,15,8,10,15,generated,capped by band
Zebrette,8,Alessandro Caputo,-,MC,-,21,ITA,EU,HGN,Yes,U21 Exempt,65,77,Right,170,62,9,12,12,15,9,12,9,9,13,14,12,12,13,9,11,11,11,10,2,2,2,2,13,13,11,14,generated,-
Zebrette,10,Jonas Michiels,-,MC,DM,23,BEL,EU,Non-HG,No,Registered,63,70,Right,181,77,8,12,12,13,10,13,10,9,11,12,11,14,13,10,11,13,8,10,2,2,2,2,13,13,9,13,generated,-
Zebrette,11,Pietro Monti,-,AML,AMC/ML,30,ITA,EU,HGC,No,Registered,67,67,Left,176,66,11,13,14,13,13,6,4,7,13,13,7,14,13,9,14,13,11,15,2,2,2,2,13,13,13,13,generated,capped by band
Zebrette,7,Gianluca Villa,-,AMR,-,27,ITA,EU,HGN,No,Registered,66,67,Right,180,78,11,13,12,16,11,7,6,6,13,12,8,11,13,10,14,13,8,14,2,2,2,2,12,13,13,13,generated,-
Zebrette,9,Giannis Makris,-,ST,-,27,GRE,EU,Non-HG,No,Registered,66,68,Right,180,73,13,13,13,13,8,5,5,12,11,13,6,14,15,9,13,12,12,11,2,2,2,2,13,14,10,12,generated,-
Zebrette,13,Dario Lazić,-,GK,-,30,SRB,Non-EU,Non-HG,No,Registered,58,58,Left,181,78,2,8,2,6,2,3,3,4,9,11,10,8,14,8,9,8,10,11,11,12,12,12,12,2,2,10,generated,-
Zebrette,23,Ifeanyi Chukwuma,-,DL,-,21,NGA,Non-EU,Non-HG,Yes,U21 Exempt,58,67,Left,184,85,5,11,9,13,13,10,10,9,10,11,12,13,11,9,13,12,13,12,2,2,2,2,11,9,10,12,generated,-
Zebrette,15,Roko Lazić,-,DC,-,30,SRB,Non-EU,Non-HG,No,Registered,61,61,Left,180,78,4,9,8,9,5,12,11,11,8,13,12,10,13,10,13,11,13,11,2,2,2,2,13,5,6,12,generated,-
Zebrette,24,Filippo Longo,-,DC,-,28,ITA,EU,HGC,No,Registered,58,61,Right,188,83,5,10,10,8,5,12,12,11,10,11,11,12,11,10,10,10,12,8,2,2,2,2,12,4,8,12,generated,-
Zebrette,22,Kobe Gielen,-,DR,-,23,BEL,EU,Non-HG,No,Registered,58,65,Right,185,80,6,10,13,10,13,11,10,10,10,11,11,13,10,12,12,12,10,11,2,2,2,2,12,11,8,12,generated,-
Zebrette,14,Daniel Heredia,-,DM,DC,33,ESP,EU,Non-HG,No,Registered,58,58,Right,181,78,7,10,9,11,7,12,11,10,11,11,14,11,11,10,11,10,10,9,2,2,2,2,14,9,8,12,generated,-
Zebrette,16,Armando Hoxha,-,MC,AMC,27,ALB,Non-EU,Non-HG,No,Registered,60,63,Right,178,72,8,12,12,12,10,11,9,8,11,13,12,11,11,9,10,12,10,12,2,2,2,2,13,11,11,13,generated,-
Zebrette,17,Alessandro Gallo,-,AMC,-,19,ITA,EU,HGN,Yes,U21 Exempt,62,71,Right,180,76,11,13,13,12,9,8,9,7,12,13,8,15,13,10,11,11,11,13,2,2,2,2,11,11,14,11,generated,-
Zebrette,30,Nicola Greco,-,AML,ST/AMC,18,ITA,EU,HGC,Yes,U21 Exempt,60,74,Right,186,83,11,12,13,12,9,6,5,8,9,12,6,11,9,8,15,10,10,12,2,2,2,2,11,11,13,11,generated,-
Zebrette,19,Victor Olawale,-,AMR,AMC,29,NGA,Non-EU,Non-HG,No,Registered,60,60,Right,185,72,11,10,13,12,9,7,6,8,9,10,7,12,10,8,14,12,9,11,2,2,2,2,13,14,12,11,generated,-
Zebrette,18,Jorge Navarro,-,ST,AMR,26,URU,Non-EU,Non-HG,No,Registered,58,59,Right,190,89,10,8,11,13,6,7,3,10,9,11,6,11,14,6,15,10,11,13,2,2,2,2,11,10,11,11,generated,-
Zebrette,25,Gabriele Fabbri,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,59,74,Right,189,82,2,9,2,7,2,3,3,4,7,12,12,10,11,9,7,7,10,11,13,12,11,11,12,2,2,10,generated,-
Zebrette,31,Michele Mancini,-,MC,-,18,ITA,EU,Non-HG,Yes,U21 Exempt,60,70,Left,178,69,9,13,14,12,11,9,9,8,13,12,12,14,13,8,9,12,10,10,2,2,2,2,12,11,12,10,generated,-
Zebrette,32,Marco Piras,-,ST,-,20,ITA,EU,Non-HG,Yes,U21 Exempt,61,73,Right,181,71,12,9,12,14,7,6,4,11,8,12,6,11,12,10,12,10,11,14,2,2,2,2,12,13,9,10,generated,-
```

### Lariani (Como 1907)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lariani,1,Valon Dedja,-,GK,-,26,ALB,Non-EU,Non-HG,No,Registered,63,64,Either,197,92,2,9,1,6,2,3,3,4,11,13,14,10,13,10,8,8,12,13,12,14,11,12,12,2,2,12,generated,-
Lariani,3,Zvonimir Lazić,-,DL,-,29,SRB,Non-EU,Non-HG,No,Registered,64,64,Left,172,76,7,12,11,12,14,12,12,10,10,10,14,12,14,10,13,15,11,11,2,2,2,2,12,12,7,12,generated,-
Lariani,4,Matteo Greco,-,DC,-,28,ITA,EU,HGC,No,Registered,67,68,Left,193,84,6,10,9,9,5,14,13,14,9,12,14,14,12,9,13,11,13,13,2,2,2,2,15,8,6,12,generated,capped by band
Lariani,5,Sebastian Borkowski,-,DC,DR,26,POL,EU,Non-HG,No,Registered,64,67,Right,193,87,2,13,9,10,4,13,13,15,10,10,12,11,11,11,11,13,14,11,2,2,2,2,15,6,8,11,generated,-
Lariani,2,Dino Božić,-,DR,MR/WBR,29,CRO,EU,Non-HG,No,Registered,66,66,Right,177,73,7,15,15,13,13,12,12,12,11,13,12,15,12,8,13,13,10,13,2,2,2,2,14,12,10,14,generated,-
Lariani,6,Michele Rizzo,-,DM,DC,25,ITA,EU,HGC,No,Registered,66,68,Right,184,81,8,13,8,13,8,15,11,10,12,14,13,15,13,12,12,11,11,11,2,2,2,2,14,7,8,13,generated,-
Lariani,8,Matteo Bruni,-,MC,DM,30,ITA,EU,HGC,No,Registered,67,67,Left,177,70,9,12,13,16,10,11,10,9,15,14,12,12,12,9,10,12,13,13,2,2,2,2,12,12,11,16,generated,capped by band
Lariani,10,Alessandro Zanetti,-,MC,DM,27,ITA,EU,HGC,No,Registered,64,67,Right,175,72,8,12,10,13,8,14,12,8,13,11,13,14,14,9,10,14,11,13,2,2,2,2,13,13,12,12,generated,-
Lariani,11,Wesley Tavares,-,AML,-,22,BRA,Non-EU,Non-HG,No,Registered,66,70,Left,180,76,12,11,12,14,14,7,4,9,14,12,6,12,14,9,15,15,12,13,2,2,2,2,12,12,12,12,generated,-
Lariani,7,Siebe Segers,-,AMR,ST,27,BEL,EU,Non-HG,No,Registered,65,66,Right,180,66,11,11,13,15,11,7,5,5,12,11,9,12,12,9,14,11,10,14,2,2,2,2,14,12,14,15,generated,-
Lariani,9,Aymen Chakir,-,ST,-,30,MAR,Non-EU,Non-HG,No,Registered,66,66,Right,177,69,14,10,13,12,7,6,3,12,12,13,6,13,13,10,14,12,13,13,2,2,2,2,13,14,11,13,generated,-
Lariani,13,Piotr Adamski,-,GK,-,22,POL,EU,Non-HG,No,Registered,58,60,Right,193,86,2,9,4,8,2,3,3,4,9,11,12,8,11,9,8,8,9,9,12,13,12,11,11,2,2,12,generated,-
Lariani,23,Nikola Božić,-,DL,ML,29,CRO,EU,Non-HG,No,Registered,58,58,Left,178,76,6,10,10,10,13,12,11,12,11,10,13,10,12,10,11,13,11,12,2,2,2,2,11,8,10,11,generated,-
Lariani,15,Giorgio Carbone,-,DC,DM,22,ITA,EU,Non-HG,No,Registered,60,63,Right,194,81,5,10,8,10,5,12,12,13,11,9,12,13,10,10,10,10,14,13,2,2,2,2,14,5,4,10,generated,-
Lariani,24,Ermal Dedja,-,DC,-,27,ALB,Non-EU,Non-HG,No,Registered,61,64,Right,175,71,4,12,10,9,4,14,14,11,8,10,13,11,11,9,10,10,13,7,2,2,2,2,10,6,6,11,generated,-
Lariani,22,Paolo Santoro,-,DR,-,25,ITA,EU,HGC,No,Registered,59,61,Right,177,63,5,11,13,10,12,12,13,9,10,10,10,14,10,7,10,13,9,13,2,2,2,2,11,10,11,10,generated,-
Lariani,14,Dario Vuković,-,DM,MC/DC,25,SVN,EU,Non-HG,No,Registered,58,59,Right,186,77,4,11,9,9,8,12,10,9,10,12,11,13,11,10,9,9,9,12,2,2,2,2,14,7,8,13,generated,-
Lariani,16,Morten Jørgensen,-,MC,DM,24,DEN,EU,Non-HG,No,Registered,62,67,Right,178,77,9,14,14,12,8,8,12,7,15,12,11,14,10,9,10,12,11,11,2,2,2,2,12,10,8,13,generated,-
Lariani,17,Boubacar Diallo,-,AMC,AML,29,SEN,Non-EU,Non-HG,No,Registered,63,63,Right,176,75,14,13,12,12,9,9,7,8,14,11,7,13,11,10,11,14,12,11,2,2,2,2,12,12,13,12,generated,-
Lariani,21,Filippo Rossetti,-,AML,AMC,27,ITA,EU,HGC,No,Registered,64,66,Left,176,71,11,12,14,13,10,7,6,6,9,12,6,12,10,9,14,14,9,13,2,2,2,2,11,14,15,14,generated,-
Lariani,30,Nicolò Rossetti,-,AMR,-,18,ITA,EU,HGC,Yes,U21 Exempt,60,69,Right,180,71,12,11,12,11,9,7,8,8,10,10,8,14,10,7,14,11,8,14,2,2,2,2,11,11,13,12,generated,-
Lariani,19,Filippo Colombo,-,ST,-,26,ITA,EU,HGN,No,Registered,60,63,Right,189,85,12,11,11,12,8,4,5,11,9,12,7,12,12,9,13,10,11,10,2,2,2,2,11,13,12,12,generated,-
Lariani,25,Simone Zanetti,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,59,69,Right,194,87,2,9,4,8,2,3,3,4,10,12,11,8,12,10,8,8,11,12,12,12,12,12,12,2,2,10,generated,-
Lariani,31,Roberto Bianco,-,MC,-,17,ITA,EU,HGC,Yes,U21 Exempt,61,72,Left,173,69,11,13,12,14,9,10,10,8,13,11,9,11,10,10,13,12,9,11,2,2,2,2,13,12,10,13,generated,-
Lariani,32,Leonardo Santoro,-,ST,AMC,17,ITA,EU,HGC,Yes,U21 Exempt,59,74,Right,180,73,12,11,12,13,7,5,5,12,7,11,4,11,10,8,13,13,12,10,2,2,2,2,11,11,10,12,generated,-
```

### Isolani (Cagliari Calcio)
**Reputation:** 66 | **CA Band:** 57–66 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Isolani,1,Arthur Gielen,-,GK,-,33,BEL,EU,Non-HG,No,Registered,64,64,Right,188,85,2,10,1,8,2,3,3,4,10,13,10,10,14,10,6,7,11,13,13,14,12,14,13,2,2,13,generated,-
Isolani,3,Magnus Madsen,-,DL,-,33,DEN,EU,Non-HG,No,Registered,64,64,Left,182,74,7,14,15,13,12,12,11,11,11,11,10,15,13,9,14,13,12,12,2,2,2,2,14,10,9,14,generated,-
Isolani,4,Gabriele Fontana,-,DC,DR/DL,30,ITA,EU,HGC,No,Registered,65,65,Right,188,86,5,14,8,10,5,14,13,12,10,11,13,13,13,12,10,11,14,12,2,2,2,2,13,5,6,14,generated,-
Isolani,5,Tomás Villalba,-,DC,DM,31,COL,Non-EU,Non-HG,No,Registered,62,62,Right,194,87,4,11,10,10,5,12,11,14,7,11,13,12,11,10,11,14,14,9,2,2,2,2,14,6,6,12,generated,-
Isolani,2,Kofi Darko,-,DR,-,26,GHA,Non-EU,Non-HG,No,Registered,65,66,Left,184,81,7,12,13,12,11,13,12,11,10,12,15,13,11,10,14,13,12,12,2,2,2,2,14,12,10,14,generated,-
Isolani,6,Segun Yakubu,-,DM,DC,26,NGA,Non-EU,Non-HG,No,Registered,64,67,Right,179,76,7,12,10,12,9,12,12,12,12,13,13,12,14,10,11,13,12,12,2,2,2,2,11,8,9,18,generated,-
Isolani,8,Rasmus Andersen,-,MC,AMC/DM,23,DEN,EU,Non-HG,No,Registered,62,69,Right,177,69,11,12,11,12,9,13,9,10,14,14,12,13,12,7,11,12,11,13,2,2,2,2,13,11,12,11,generated,-
Isolani,10,Samuele Piras,-,MC,-,35,ITA,EU,HGC,No,Registered,65,65,Left,180,83,9,14,13,14,9,10,9,7,12,13,13,13,13,9,12,13,11,13,2,2,2,2,12,13,11,14,generated,-
Isolani,11,Uroš Vasić,-,AML,AMC,30,SRB,Non-EU,Non-HG,No,Registered,64,64,Left,175,67,10,11,14,14,11,6,5,7,11,13,6,12,12,8,13,12,10,13,2,2,2,2,12,14,14,10,generated,-
Isolani,7,Manuel Gallo,-,AMR,ST/AMC,30,ITA,EU,HGC,No,Registered,65,65,Right,185,81,10,12,16,11,15,6,4,8,14,11,8,11,14,9,13,12,10,13,2,2,2,2,12,12,12,13,generated,-
Isolani,9,Matteo Mancini,-,ST,-,31,ITA,EU,Non-HG,No,Registered,64,64,Left,189,82,13,10,14,12,9,5,4,15,10,14,7,14,9,9,12,14,15,11,2,2,2,2,14,13,11,15,generated,-
Isolani,13,Przemysław Michalski,-,GK,-,30,POL,EU,Non-HG,No,Registered,59,59,Right,196,92,2,7,4,9,2,3,3,4,8,11,11,8,10,10,9,7,11,13,11,14,12,12,11,2,2,12,generated,-
Isolani,23,Tin Đorđević,-,DL,ML,28,BIH,Non-EU,Non-HG,No,Registered,59,59,Left,182,86,4,11,10,10,12,10,11,11,8,12,12,13,10,8,14,12,13,11,2,2,2,2,11,10,7,12,generated,-
Isolani,15,Emanuele Bellini,-,DC,-,23,ITA,EU,HGC,No,Registered,59,65,Right,192,93,6,10,8,11,6,11,13,13,9,10,14,12,11,8,10,10,11,10,2,2,2,2,11,5,6,11,generated,-
Isolani,24,Carlos Escudero,-,DC,-,24,ESP,EU,Non-HG,No,Registered,57,59,Right,191,86,4,11,6,9,6,12,13,10,10,8,13,10,8,11,8,10,14,9,2,2,2,2,12,6,3,8,generated,-
Isolani,22,Rayan Carpentier,-,DR,-,27,FRA,EU,Non-HG,No,Registered,61,64,Right,180,75,7,12,13,11,12,12,13,10,11,12,12,12,11,10,13,12,9,12,2,2,2,2,11,10,10,13,generated,-
Isolani,14,Filip Barišić,-,DM,MC/DC,29,SVN,EU,Non-HG,No,Registered,64,64,Right,184,74,5,13,9,13,7,13,12,9,11,11,13,14,11,10,11,11,12,13,2,2,2,2,14,9,7,15,generated,-
Isolani,16,Valerio Gentile,-,MC,AMC,21,ITA,EU,Non-HG,Yes,U21 Exempt,61,71,Left,176,69,8,13,11,11,7,11,12,9,12,11,9,13,13,9,13,13,12,11,2,2,2,2,11,13,10,14,generated,-
Isolani,17,Nikola Vuković,-,AMC,AMR,27,SVN,EU,Non-HG,No,Registered,63,64,Left,178,72,12,13,12,12,11,7,9,8,12,14,10,13,14,10,10,12,11,14,2,2,2,2,11,13,12,15,generated,-
Isolani,21,Yuta Miyazaki,-,AML,-,28,JPN,Non-EU,Non-HG,No,Registered,57,58,Left,183,67,10,10,11,12,9,6,5,8,9,11,5,12,9,7,12,10,9,14,2,2,2,2,11,13,12,13,generated,-
Isolani,19,Simone Pellegrini,-,AMR,AMC,26,ITA,EU,HGN,No,Registered,59,60,Left,182,80,11,10,12,13,13,7,5,7,13,8,6,11,13,10,12,11,9,11,2,2,2,2,11,10,11,10,generated,-
Isolani,30,Salvatore Piras,-,ST,AMR/AML,19,ITA,EU,Non-HG,Yes,U21 Exempt,60,71,Either,177,65,12,9,11,12,6,5,5,11,9,12,5,11,13,9,13,10,11,10,2,2,2,2,12,12,9,11,generated,-
Isolani,25,Giovanni Colombo,-,GK,-,17,ITA,EU,HGC,Yes,U21 Exempt,58,72,Right,195,96,2,9,2,7,2,3,3,4,8,11,11,10,11,10,6,7,10,11,12,11,12,13,11,2,2,9,generated,-
Isolani,31,Gabriele Piras,-,MC,DM,18,ITA,EU,HGC,Yes,U21 Exempt,60,73,Left,182,79,7,13,12,13,10,11,8,9,12,11,12,12,12,8,11,11,10,11,2,2,2,2,11,11,10,13,generated,-
Isolani,32,Nicola Rizzo,-,ST,AML,18,ITA,EU,HGC,Yes,U21 Exempt,58,68,Right,181,76,11,8,11,9,6,4,3,11,11,10,6,10,12,9,13,11,12,11,2,2,2,2,11,14,9,11,generated,-
```

### Neroverdi (US Sassuolo Calcio)
**Reputation:** 66 | **CA Band:** 57–66 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Neroverdi,1,Vincenzo Amato,-,GK,-,29,ITA,EU,HGN,No,Registered,63,63,Either,196,85,2,9,5,9,2,3,3,4,7,12,12,8,12,7,8,8,10,11,14,14,12,12,12,2,2,12,generated,-
Neroverdi,3,Zvonimir Stojanović,-,DL,DC,30,SRB,Non-EU,Non-HG,No,Registered,65,65,Either,185,75,7,14,13,12,13,14,11,10,11,11,13,13,11,11,13,13,12,12,2,2,2,2,14,12,9,12,generated,-
Neroverdi,4,Sofiane Lacroix,-,DC,DR,22,FRA,EU,Non-HG,No,Registered,66,73,Right,194,92,4,12,9,8,4,11,14,12,7,13,15,13,13,10,10,10,14,13,2,2,2,2,15,6,5,13,generated,capped by band
Neroverdi,5,Giovanni Marino,-,DC,-,27,ITA,EU,HGN,No,Registered,63,64,Right,183,74,5,11,8,10,5,12,13,13,9,14,12,11,12,10,12,13,13,9,2,2,2,2,13,6,4,11,generated,-
Neroverdi,2,Domagoj Šarić,-,DR,-,25,CRO,EU,Non-HG,No,Registered,63,66,Left,177,74,8,11,11,13,12,11,13,11,12,11,13,11,12,12,15,15,10,11,2,2,2,2,12,11,9,12,generated,-
Neroverdi,6,João Domingues,-,DM,-,25,POR,EU,Non-HG,No,Registered,65,66,Right,185,77,7,12,10,11,8,13,14,12,12,12,11,14,12,9,12,13,12,13,2,2,2,2,14,9,9,15,generated,-
Neroverdi,8,Leon Winkler,-,MC,-,31,SUI,Non-EU,Non-HG,No,Registered,63,63,Either,184,80,7,14,11,12,9,12,10,8,14,13,12,12,12,9,12,11,11,12,2,2,2,2,11,11,11,13,generated,-
Neroverdi,10,Gianluca De Luca,-,MC,-,27,ITA,EU,HGC,No,Registered,65,67,Right,182,76,11,13,13,14,8,10,9,9,13,12,12,14,13,10,13,13,11,10,2,2,2,2,13,12,10,15,generated,-
Neroverdi,11,Giacomo De Angelis,-,AML,AMC,21,ITA,EU,HGN,Yes,U21 Exempt,65,74,Right,179,76,13,11,15,14,9,8,4,8,9,10,6,12,10,9,13,13,10,13,2,2,2,2,12,13,15,13,generated,-
Neroverdi,7,Brandon Brooks,-,AMR,-,22,USA,Non-EU,Non-HG,No,Registered,63,68,Left,180,75,10,12,13,12,10,7,5,7,11,12,7,12,11,8,14,12,10,15,2,2,2,2,12,13,14,12,generated,-
Neroverdi,9,Giorgio Santoro,-,ST,AMC,27,ITA,EU,HGC,No,Registered,65,65,Right,188,86,13,8,15,10,10,3,5,15,10,15,5,14,13,9,11,11,15,12,2,2,2,2,14,13,13,13,generated,-
Neroverdi,13,Marco Conti,-,GK,-,24,ITA,EU,HGC,No,Registered,63,67,Right,192,82,2,11,5,12,2,3,3,4,8,12,12,9,13,9,6,7,11,13,12,14,13,12,13,2,2,11,generated,-
Neroverdi,23,Segun Idowu,-,DL,-,28,NGA,Non-EU,Non-HG,No,Registered,59,62,Left,181,84,6,10,11,11,12,11,10,9,11,11,11,12,12,7,14,13,11,12,2,2,2,2,11,11,9,13,generated,-
Neroverdi,30,Gianluca Gallo,-,DC,-,18,ITA,EU,HGC,Yes,U21 Exempt,59,72,Left,192,85,4,10,7,12,7,13,13,12,9,9,13,11,9,10,9,10,12,8,2,2,2,2,12,8,4,10,generated,-
Neroverdi,15,Dino Simić,-,DC,DL,32,SRB,Non-EU,Non-HG,No,Registered,57,57,Right,192,89,3,8,7,9,7,11,11,14,7,9,12,10,9,9,9,10,15,10,2,2,2,2,11,7,5,9,generated,-
Neroverdi,22,Kasper Winther,-,DR,-,26,DEN,EU,Non-HG,No,Registered,58,60,Left,194,93,5,11,12,10,11,11,12,10,8,9,10,12,10,6,12,13,11,11,2,2,2,2,11,9,8,12,generated,-
Neroverdi,14,Zak Yates,-,DM,-,26,ENG,Non-EU,Non-HG,No,Registered,58,59,Right,181,80,7,10,8,9,9,11,12,10,11,12,11,13,11,10,9,11,12,10,2,2,2,2,11,8,7,14,generated,-
Neroverdi,16,Francesco Rossetti,-,MC,DM,24,ITA,EU,HGN,No,Registered,57,60,Left,181,78,7,13,9,11,9,12,9,8,11,9,12,12,12,8,11,12,11,10,2,2,2,2,11,13,10,10,generated,-
Neroverdi,17,Diego Orlando,-,AMC,-,24,ITA,EU,HGC,No,Registered,58,65,Right,181,81,12,13,11,14,8,8,6,7,12,10,9,12,10,7,10,11,8,10,2,2,2,2,10,10,11,12,generated,-
Neroverdi,21,Tomasz Zeman,-,AML,ST,27,CZE,EU,Non-HG,No,Registered,58,61,Left,183,80,11,11,13,10,12,7,6,8,10,13,7,11,9,9,11,10,10,12,2,2,2,2,11,12,13,11,generated,-
Neroverdi,19,Mislav Knežević,-,AMR,AMC/MR,24,CRO,EU,Non-HG,No,Registered,57,62,Right,177,68,11,12,11,13,8,5,7,5,8,12,5,11,9,7,12,11,10,13,2,2,2,2,11,13,12,10,generated,-
Neroverdi,18,Oskar Chmielewski,-,ST,-,27,POL,EU,Non-HG,No,Registered,60,63,Right,181,84,14,9,9,10,8,4,6,11,9,12,7,13,11,9,15,12,11,13,2,2,2,2,12,12,11,14,generated,-
Neroverdi,25,Giorgio Fabbri,-,GK,-,19,ITA,EU,HGN,Yes,U21 Exempt,59,75,Left,196,90,2,10,3,9,2,3,3,4,9,11,12,9,10,8,8,8,11,11,13,13,11,11,12,2,2,11,generated,-
Neroverdi,31,Nicolò Santoro,-,MC,-,19,ITA,EU,HGC,Yes,U21 Exempt,58,69,Right,177,69,8,12,10,13,8,10,10,6,13,12,10,10,10,9,10,10,11,10,2,2,2,2,11,11,9,12,generated,-
Neroverdi,32,Francesco Valentini,-,ST,AMR,17,ITA,EU,HGN,Yes,U21 Exempt,57,66,Right,173,67,12,10,11,11,5,5,3,11,8,11,5,11,13,9,10,10,11,10,2,2,2,2,11,12,12,11,generated,-
```

### Crociati (Parma Calcio 1913)
**Reputation:** 65 | **CA Band:** 56–65 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Crociati,1,Przemysław Adamski,-,GK,-,30,POL,EU,Non-HG,No,Registered,64,64,Right,187,83,2,11,5,8,2,3,3,4,7,12,13,10,12,11,5,10,11,12,14,13,12,13,12,2,2,11,generated,-
Crociati,3,Gianluca Sala,-,DL,-,31,ITA,EU,HGC,No,Registered,60,60,Right,180,71,8,12,11,10,12,14,12,10,11,11,12,11,10,9,13,11,11,11,2,2,2,2,12,10,7,11,generated,-
Crociati,4,Aboubacar Bamba,-,DC,-,23,SEN,Non-EU,Non-HG,No,Registered,63,68,Right,183,76,4,11,9,9,7,14,14,12,10,11,11,11,11,9,11,10,15,9,2,2,2,2,13,6,6,11,generated,-
Crociati,5,Marco Vaz,-,DC,-,27,POR,EU,Non-HG,No,Registered,65,65,Right,190,90,5,11,10,10,8,14,14,14,9,10,15,13,10,11,8,12,13,12,2,2,2,2,13,6,7,11,generated,capped by band
Crociati,2,Valerio Zanetti,-,DR,-,28,ITA,EU,HGN,No,Registered,65,67,Right,179,75,8,13,13,11,12,14,12,9,9,14,14,12,10,10,13,14,12,15,2,2,2,2,13,13,8,13,generated,capped by band
Crociati,6,Paulo Dantas,-,DM,DC,24,BRA,Non-EU,Non-HG,No,Registered,64,66,Right,178,70,7,14,12,12,9,13,11,11,11,13,14,12,11,13,11,11,11,11,2,2,2,2,13,8,7,15,generated,-
Crociati,8,Filippo Cattaneo,-,MC,-,30,ITA,EU,HGN,No,Registered,63,63,Right,177,74,10,13,12,13,10,12,9,9,14,12,12,12,12,8,13,12,11,11,2,2,2,2,12,12,10,13,generated,-
Crociati,10,Tomasz Marek,-,MC,-,29,CZE,EU,Non-HG,No,Registered,65,65,Right,179,72,9,13,12,16,11,12,11,8,12,14,10,12,12,9,11,12,10,11,2,2,2,2,13,12,10,13,generated,capped by band
Crociati,11,Bilal Berrada,-,AML,-,31,MAR,Non-EU,Non-HG,No,Registered,64,64,Left,184,80,12,12,14,14,9,5,5,9,10,13,7,11,10,10,14,13,9,14,2,2,2,2,12,13,13,13,generated,-
Crociati,7,Samuele Cattaneo,-,AMR,-,30,ITA,EU,HGC,No,Registered,63,63,Right,179,77,13,11,11,13,10,6,5,7,11,12,7,12,11,8,14,10,11,14,2,2,2,2,11,14,13,13,generated,-
Crociati,9,Gideon Nkansah,-,ST,AMC,34,GHA,Non-EU,Non-HG,No,Registered,65,65,Either,180,78,12,8,13,14,7,5,3,13,11,13,6,13,13,9,14,13,11,14,2,2,2,2,12,14,11,14,generated,capped by band
Crociati,13,Tom Krause,-,GK,-,27,SUI,Non-EU,Non-HG,No,Registered,57,58,Right,189,82,2,9,3,8,2,3,3,4,9,12,13,7,11,10,9,8,11,12,11,11,12,9,11,2,2,10,generated,-
Crociati,23,Federico Piras,-,DL,-,21,ITA,EU,HGC,Yes,U21 Exempt,57,68,Left,179,75,5,10,11,9,12,11,12,9,8,11,13,11,10,7,11,11,12,11,2,2,2,2,11,11,9,12,generated,-
Crociati,15,Jakub Baran,-,DC,DL,28,POL,EU,Non-HG,No,Registered,60,60,Right,188,81,5,10,9,11,6,12,13,12,10,9,12,13,10,8,9,11,14,10,2,2,2,2,14,4,5,10,generated,-
Crociati,24,Edoardo Bellini,-,DC,DM,34,ITA,EU,HGN,No,Registered,57,57,Either,181,76,4,11,8,10,7,12,12,12,8,11,11,12,11,10,10,8,11,11,2,2,2,2,12,6,5,11,generated,-
Crociati,22,Lucas Fajardo,-,DR,-,34,ESP,EU,Non-HG,No,Registered,56,56,Right,184,77,7,10,9,11,12,12,10,10,8,10,13,9,8,9,13,12,10,10,2,2,2,2,10,11,10,10,generated,-
Crociati,14,Dennis Mulder,-,DM,-,23,NED,EU,Non-HG,No,Registered,58,60,Left,186,82,9,11,8,10,8,10,12,7,11,12,12,12,11,10,11,11,11,10,2,2,2,2,11,8,7,13,generated,-
Crociati,16,Nicola Messina,-,MC,AMC,28,ITA,EU,HGC,No,Registered,59,62,Either,179,69,9,14,11,12,7,11,8,9,11,12,10,11,11,10,12,11,12,11,2,2,2,2,10,12,11,12,generated,-
Crociati,17,Cătălin Lungu,-,AMC,-,27,ROU,EU,Non-HG,No,Registered,63,63,Right,182,77,13,11,12,13,9,9,7,7,14,11,9,15,12,11,12,11,10,12,2,2,2,2,12,12,14,10,generated,-
Crociati,21,Nicolò Mancini,-,AML,-,31,ITA,EU,HGC,No,Registered,58,58,Left,185,79,11,11,10,12,13,6,5,8,13,11,6,11,13,8,14,11,9,10,2,2,2,2,10,9,12,9,generated,-
Crociati,19,Raúl Godoy,-,AMR,-,27,ARG,Non-EU,Non-HG,No,Registered,57,59,Right,180,80,10,10,13,12,8,6,6,6,8,11,7,11,8,7,13,10,8,14,2,2,2,2,9,9,13,12,generated,-
Crociati,30,Federico Rizzo,-,ST,-,20,ITA,EU,HGC,Yes,U21 Exempt,58,65,Right,186,87,13,9,12,11,7,9,4,11,10,11,7,11,10,8,12,11,11,11,2,2,2,2,12,12,9,12,generated,-
Crociati,25,Valerio Farina,-,GK,-,21,ITA,EU,HGC,Yes,U21 Exempt,57,68,Right,192,89,2,8,3,8,2,3,3,4,9,9,14,7,10,9,7,7,10,11,13,11,10,10,11,2,2,12,generated,-
Crociati,31,Paolo Costa,-,MC,DM,20,ITA,EU,HGC,Yes,U21 Exempt,56,67,Right,174,69,9,11,12,13,7,10,11,8,12,10,8,12,11,7,11,11,8,10,2,2,2,2,12,11,10,11,generated,-
Crociati,32,Tommaso De Angelis,-,ST,-,19,ITA,EU,HGN,Yes,U21 Exempt,59,73,Left,182,77,13,9,11,12,6,7,6,12,8,12,6,12,12,9,10,12,12,12,2,2,2,2,12,12,9,12,generated,-
```

### Salentini (US Lecce)
**Reputation:** 64 | **CA Band:** 56–65 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Salentini,1,Dino Vuković,-,GK,-,35,CRO,EU,Non-HG,No,Registered,64,64,Right,189,86,2,10,2,8,2,3,3,4,8,12,14,10,12,9,7,9,10,11,13,13,14,12,12,2,2,14,generated,-
Salentini,3,Miloš Nikolić,-,DL,DC,27,BIH,Non-EU,Non-HG,No,Registered,64,65,Left,184,81,7,12,12,10,12,14,15,11,12,11,13,12,11,8,13,12,11,13,2,2,2,2,12,10,9,13,generated,-
Salentini,4,Giovanni Fabbri,-,DC,DL/DR,30,ITA,EU,HGN,No,Registered,65,65,Left,184,82,5,13,9,11,7,13,14,13,10,11,14,13,12,10,11,13,12,10,2,2,2,2,14,7,7,11,generated,capped by band
Salentini,5,Dren Lleshi,-,DC,-,23,ALB,Non-EU,Non-HG,No,Registered,65,67,Right,192,90,3,12,6,10,5,14,13,14,10,11,13,15,11,10,11,12,14,10,2,2,2,2,14,7,6,11,generated,capped by band
Salentini,2,Issa Sagna,-,DR,DC/MR,29,SEN,Non-EU,Non-HG,No,Registered,63,63,Right,177,71,6,11,11,13,13,13,13,9,10,10,13,11,11,10,14,13,10,12,2,2,2,2,12,10,8,12,generated,-
Salentini,6,Philipp Ziegler,-,DM,DC/MC,30,GER,EU,Non-HG,No,Registered,63,63,Left,179,74,9,10,12,11,6,14,12,9,13,12,11,14,13,9,10,12,12,11,2,2,2,2,14,9,7,13,generated,-
Salentini,8,Mislav Pavlović,-,MC,-,31,CRO,EU,Non-HG,No,Registered,63,63,Right,176,71,7,13,11,13,10,12,9,10,12,14,11,12,10,10,13,12,10,12,2,2,2,2,12,12,10,14,generated,-
Salentini,10,Marco Orlando,-,MC,-,30,ITA,EU,HGC,No,Registered,65,65,Either,182,84,10,14,13,12,9,11,11,7,14,13,9,12,12,11,12,12,10,13,2,2,2,2,12,13,11,15,generated,capped by band
Salentini,11,Filippo Testa,-,AML,-,22,ITA,EU,HGN,No,Registered,65,68,Left,177,71,12,13,13,14,12,5,5,9,12,14,6,13,12,9,13,13,11,13,2,2,2,2,13,12,15,11,generated,capped by band
Salentini,7,Marco Rossetti,-,AMR,-,29,ITA,EU,HGC,No,Registered,63,63,Right,181,80,12,11,13,13,11,5,5,8,11,13,7,13,11,9,11,13,11,15,2,2,2,2,13,13,15,12,generated,-
Salentini,9,Mario Cardozo,-,ST,AMC,21,URU,Non-EU,Non-HG,Yes,U21 Exempt,62,68,Right,191,96,13,10,13,11,7,4,3,13,9,12,4,13,12,10,12,12,14,13,2,2,2,2,13,12,12,13,generated,-
Salentini,13,Jean Araújo,-,GK,-,22,BRA,Non-EU,Non-HG,No,Registered,59,61,Right,192,91,2,9,3,10,2,3,3,4,8,11,12,6,12,9,8,8,11,12,12,11,12,12,13,2,2,10,generated,-
Salentini,23,Giacomo De Luca,-,DL,-,21,ITA,EU,HGC,Yes,U21 Exempt,57,69,Left,184,87,6,12,13,10,12,10,11,10,8,12,10,12,8,9,12,11,10,10,2,2,2,2,12,9,8,14,generated,-
Salentini,15,Federico De Angelis,-,DC,DM/DR,29,ITA,EU,HGC,No,Registered,59,59,Left,190,88,4,9,8,8,7,13,11,9,7,12,14,10,11,8,12,10,12,10,2,2,2,2,10,5,5,12,generated,-
Salentini,24,Nemanja Todorović,-,DC,-,26,SRB,Non-EU,Non-HG,No,Registered,62,63,Right,196,89,6,10,8,12,6,14,13,11,7,11,14,13,11,10,11,12,12,11,2,2,2,2,12,6,5,11,generated,-
Salentini,22,Stefano Santoro,-,DR,WBR,29,ITA,EU,HGC,No,Registered,61,61,Left,176,73,7,15,13,12,11,12,11,10,8,11,11,13,11,9,12,13,10,12,2,2,2,2,13,12,9,12,generated,-
Salentini,30,Salvatore Amato,-,DM,MC,17,ITA,EU,HGC,Yes,U21 Exempt,57,66,Right,182,75,6,11,8,14,7,12,10,10,10,13,13,10,10,9,12,9,9,10,2,2,2,2,13,9,7,12,generated,-
Salentini,14,Jan Giesler,-,MC,-,24,GER,EU,Non-HG,No,Registered,60,66,Right,181,76,8,10,10,15,8,11,9,9,14,11,11,11,11,9,10,11,13,13,2,2,2,2,11,12,10,14,generated,-
Salentini,17,Enzo Morin,-,AMC,-,27,FRA,EU,Non-HG,No,Registered,56,59,Right,183,85,10,11,12,11,11,9,6,8,11,10,8,11,12,8,11,13,10,12,2,2,2,2,12,14,11,10,generated,-
Salentini,21,Davide Amato,-,AML,-,29,ITA,EU,Non-HG,No,Registered,62,62,Left,177,70,12,12,14,13,9,5,4,7,9,10,10,11,10,7,13,10,10,13,2,2,2,2,11,13,13,11,generated,-
Salentini,19,Ante Perić,-,AMR,-,25,CRO,EU,Non-HG,No,Registered,56,58,Left,183,72,10,11,12,10,12,6,6,6,12,8,6,11,11,8,11,9,11,11,2,2,2,2,13,10,14,12,generated,-
Salentini,18,Nicolò Messina,-,ST,-,34,ITA,EU,HGC,No,Registered,58,58,Right,183,78,12,10,11,11,7,4,4,11,8,11,5,13,13,7,10,10,11,12,2,2,2,2,11,13,10,9,generated,-
Salentini,25,Giorgio Gentile,-,GK,-,18,ITA,EU,Non-HG,Yes,U21 Exempt,57,73,Right,190,90,2,10,5,9,2,3,3,4,8,11,12,6,12,8,7,7,9,11,11,12,11,11,12,2,2,10,generated,-
Salentini,31,Nicola Fabbri,-,MC,-,19,ITA,EU,HGC,Yes,U21 Exempt,59,72,Right,184,84,9,12,11,14,7,11,8,9,11,12,12,11,11,9,9,11,9,11,2,2,2,2,11,11,11,13,generated,-
Salentini,32,Valerio Fontana,-,ST,-,18,ITA,EU,HGC,Yes,U21 Exempt,57,71,Right,181,79,12,8,11,12,9,6,4,11,8,9,4,12,11,8,12,11,11,11,2,2,2,2,11,12,11,11,generated,-
```

### Brianzoli (AC Monza)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Brianzoli,1,Maxime Poirier,-,GK,-,29,FRA,EU,Non-HG,No,Registered,61,61,Left,194,94,2,10,4,9,2,3,3,4,9,11,13,7,12,8,7,8,11,12,12,12,14,11,12,2,2,12,generated,-
Brianzoli,3,Konstantinos Katsaros,-,DL,DC,30,GRE,EU,Non-HG,No,Registered,63,63,Left,185,73,7,12,14,12,11,13,12,12,10,11,12,13,12,9,12,15,11,10,2,2,2,2,12,12,9,14,generated,capped by band
Brianzoli,4,Gianluca Santoro,-,DC,DR/DM,26,ITA,EU,HGN,No,Registered,61,63,Right,181,80,5,10,8,9,5,13,11,12,9,14,10,13,13,10,14,12,13,9,2,2,2,2,12,7,5,13,generated,-
Brianzoli,5,Marco Caputo,-,DC,-,27,ITA,EU,HGC,No,Registered,62,64,Left,186,82,7,10,7,11,7,14,13,13,10,9,15,12,9,11,9,11,12,10,2,2,2,2,12,4,5,10,generated,-
Brianzoli,2,Nicola Rossetti,-,DR,DC,33,ITA,EU,HGC,No,Registered,61,61,Left,186,90,7,13,13,13,12,13,13,8,11,12,12,13,10,9,11,13,12,10,2,2,2,2,11,9,8,11,generated,-
Brianzoli,6,Giacomo Bianco,-,DM,MC/DC,26,ITA,EU,HGN,No,Registered,63,63,Right,180,71,7,12,13,13,8,13,12,10,11,12,13,14,12,11,12,11,12,10,2,2,2,2,14,8,8,13,generated,capped by band
Brianzoli,8,Abdul Kyei,-,MC,-,21,GHA,Non-EU,Non-HG,Yes,U21 Exempt,63,69,Right,187,84,7,14,13,10,8,12,10,9,16,13,9,12,12,10,11,11,10,13,2,2,2,2,12,8,10,14,generated,capped by band
Brianzoli,10,Rasmus Lindqvist,-,MC,-,31,SWE,EU,Non-HG,No,Registered,62,62,Right,178,70,10,12,11,12,7,11,9,8,14,14,10,11,12,9,11,11,10,10,2,2,2,2,12,11,11,14,generated,-
Brianzoli,11,Noah Maier,-,AML,-,31,SUI,Non-EU,Non-HG,No,Registered,61,61,Left,181,74,12,11,12,14,12,6,5,8,12,11,6,13,11,9,14,10,10,13,2,2,2,2,12,10,11,11,generated,-
Brianzoli,7,Álvaro Cáceres,-,AMR,MR,25,ARG,Non-EU,Non-HG,No,Registered,62,64,Right,176,65,13,9,14,11,10,4,7,6,10,11,7,13,10,7,13,13,10,13,2,2,2,2,11,13,13,10,generated,-
Brianzoli,9,Jonas Fischer,-,ST,AMC,24,SUI,Non-EU,Non-HG,No,Registered,58,61,Right,187,85,12,10,11,11,6,6,5,13,9,11,6,13,13,8,11,14,11,10,2,2,2,2,9,12,12,11,generated,-
Brianzoli,13,Emanuele Moretti,-,GK,-,26,ITA,EU,HGC,No,Registered,54,57,Right,182,77,2,7,4,8,2,3,3,4,7,10,11,9,10,9,7,9,11,10,12,12,10,10,10,2,2,9,generated,-
Brianzoli,23,Nicolò Greco,-,DL,-,21,ITA,EU,HGC,Yes,U21 Exempt,54,61,Left,189,87,4,9,10,10,11,11,12,8,9,12,9,10,10,9,12,12,8,11,2,2,2,2,11,10,8,11,generated,-
Brianzoli,15,Pietro De Angelis,-,DC,DR/DM,19,ITA,EU,HGN,Yes,U21 Exempt,59,72,Left,187,78,3,10,8,9,3,13,13,12,9,9,12,12,9,12,10,12,12,10,2,2,2,2,13,6,6,10,generated,-
Brianzoli,30,Emanuele Colombo,-,DC,DM,20,ITA,EU,Non-HG,Yes,U21 Exempt,56,66,Either,185,77,5,11,8,12,6,10,11,13,8,9,11,12,10,9,9,12,14,10,2,2,2,2,13,3,3,10,generated,-
Brianzoli,22,Felipe Freitas,-,DR,-,29,BRA,Non-EU,Non-HG,No,Registered,56,56,Right,182,73,5,12,11,12,12,12,11,9,7,11,10,11,12,8,11,12,9,10,2,2,2,2,11,10,10,11,generated,-
Brianzoli,14,Andrea Leone,-,DM,-,27,ITA,EU,HGN,No,Registered,56,58,Right,183,76,6,11,7,11,7,15,11,10,7,10,10,11,11,10,10,10,11,9,2,2,2,2,12,10,9,13,generated,-
Brianzoli,16,Gabriele Barone,-,MC,-,30,ITA,EU,HGN,No,Registered,57,57,Left,180,77,7,12,11,12,7,10,9,7,10,11,12,10,11,9,11,10,10,11,2,2,2,2,11,11,10,15,generated,-
Brianzoli,17,Szymon Růžička,-,AMC,AML,29,CZE,EU,Non-HG,No,Registered,57,57,Left,181,80,9,11,13,10,8,7,7,8,12,14,8,10,13,9,11,11,10,13,2,2,2,2,10,13,9,13,generated,-
Brianzoli,21,Gonzalo Quiroga,-,AML,ML,26,ARG,Non-EU,Non-HG,No,Registered,60,60,Left,180,74,10,12,14,10,14,5,4,8,14,11,7,11,13,8,12,12,11,13,2,2,2,2,12,12,9,11,generated,-
Brianzoli,19,Mario Vuković,-,AMR,AMC,28,SVN,EU,Non-HG,No,Registered,59,60,Right,184,78,9,10,13,13,10,6,4,8,10,7,5,12,10,6,13,10,8,14,2,2,2,2,11,11,12,13,generated,-
Brianzoli,18,Vlad Constantin,-,ST,AML,22,ROU,EU,Non-HG,No,Registered,60,63,Right,178,68,12,11,12,11,8,7,3,11,10,11,8,14,12,10,12,11,11,12,2,2,2,2,12,14,9,10,generated,-
Brianzoli,25,Davide Fontana,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,54,63,Right,183,78,2,9,2,7,2,3,3,4,7,11,9,7,11,8,8,9,10,10,13,10,11,10,11,2,2,10,generated,-
Brianzoli,31,Marco Bruni,-,MC,DM,18,ITA,EU,Non-HG,Yes,U21 Exempt,54,69,Left,179,86,9,12,12,10,10,9,9,7,13,12,10,9,9,9,9,9,9,9,2,2,2,2,9,10,9,12,generated,-
Brianzoli,32,Manuel Bianco,-,ST,-,17,ITA,EU,HGC,Yes,U21 Exempt,56,68,Right,184,77,14,9,11,11,8,6,3,10,10,11,5,11,11,10,9,12,11,11,2,2,2,2,9,12,10,11,generated,-
```

### Lagunari (Venezia FC)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lagunari,1,Mario Šarić,-,GK,-,29,SVN,EU,Non-HG,No,Registered,59,59,Right,191,91,2,9,3,8,2,3,3,4,10,12,13,8,12,9,9,8,9,11,12,12,11,12,11,2,2,10,generated,-
Lagunari,3,Guillermo Robles,-,DL,ML,34,ESP,EU,Non-HG,No,Registered,61,61,Left,180,76,6,14,14,12,11,12,11,8,10,10,11,14,13,8,12,11,13,12,2,2,2,2,14,10,9,14,generated,-
Lagunari,4,Matej Radovanović,-,DC,DR/DM,30,SRB,Non-EU,Non-HG,No,Registered,59,59,Right,192,86,3,11,8,11,4,12,12,11,9,11,12,12,11,10,11,10,12,11,2,2,2,2,14,6,4,11,generated,-
Lagunari,5,Marc Ortuño,-,DC,DR,27,ESP,EU,Non-HG,No,Registered,61,61,Left,193,85,6,10,9,11,3,13,12,10,9,12,13,14,11,11,13,11,12,10,2,2,2,2,13,6,6,11,generated,-
Lagunari,2,Sebastian Haas,-,DR,MR/WBR,28,GER,EU,Non-HG,No,Registered,62,63,Right,179,71,7,13,13,12,10,12,13,9,9,12,13,12,10,11,13,13,11,12,2,2,2,2,13,9,8,13,generated,capped by band
Lagunari,6,Lorenzo Conti,-,DM,DC,27,ITA,EU,HGC,No,Registered,59,60,Left,182,76,7,11,10,11,8,12,11,12,11,11,8,16,10,9,11,12,11,11,2,2,2,2,11,10,9,14,generated,-
Lagunari,8,Tommaso Colombo,-,MC,-,27,ITA,EU,HGC,No,Registered,62,65,Right,180,73,10,14,12,12,8,9,11,8,15,12,13,11,11,8,10,11,10,12,2,2,2,2,12,10,12,14,generated,capped by band
Lagunari,10,Salvatore Mancini,-,MC,DM,27,ITA,EU,HGN,No,Registered,61,62,Right,187,85,8,13,12,12,9,12,10,10,14,10,11,12,12,9,13,12,12,12,2,2,2,2,13,11,11,13,generated,-
Lagunari,11,Rachid Chakir,-,AML,-,29,MAR,Non-EU,Non-HG,No,Registered,62,62,Left,189,88,11,13,13,13,9,5,6,7,10,12,6,13,10,7,13,12,12,14,2,2,2,2,12,12,15,10,generated,capped by band
Lagunari,7,Nathan Nash,-,AMR,-,31,USA,Non-EU,Non-HG,No,Registered,61,61,Right,181,80,10,9,14,11,13,6,3,7,13,10,5,11,13,7,13,11,11,12,2,2,2,2,10,10,12,13,generated,-
Lagunari,9,Miloš Lazić,-,ST,-,27,MKD,Non-EU,Non-HG,No,Registered,59,59,Right,187,87,13,10,12,13,8,5,5,12,10,10,4,12,11,10,11,12,12,9,2,2,2,2,11,12,11,12,generated,-
Lagunari,13,Manuel Carbone,-,GK,-,29,ITA,EU,HGC,No,Registered,56,56,Left,190,87,2,9,2,7,2,3,3,4,8,12,11,7,13,9,7,7,10,10,9,12,13,12,12,2,2,11,generated,-
Lagunari,23,Jorne Jacobs,-,DL,-,21,BEL,EU,Non-HG,Yes,U21 Exempt,53,64,Left,183,73,5,11,12,10,8,12,11,10,7,9,10,12,8,10,11,9,10,11,2,2,2,2,11,9,9,11,generated,-
Lagunari,15,Gonzalo Barrera,-,DC,-,32,ARG,Non-EU,Non-HG,No,Registered,58,58,Right,180,70,2,10,7,11,5,13,12,13,8,9,13,11,10,11,9,13,11,9,2,2,2,2,11,4,5,10,generated,-
Lagunari,24,Riccardo Greco,-,DC,DM/DL,31,ITA,EU,HGN,No,Registered,57,57,Either,191,91,3,10,6,8,7,12,11,12,8,10,12,12,11,9,11,12,10,9,2,2,2,2,13,5,4,11,generated,-
Lagunari,22,Marin Božić,-,DR,-,31,CRO,EU,Non-HG,No,Registered,54,54,Left,186,85,6,11,11,9,11,12,11,10,9,10,10,10,9,9,12,11,10,9,2,2,2,2,9,11,8,10,generated,-
Lagunari,14,Antonio Messina,-,DM,-,25,ITA,EU,HGN,No,Registered,58,58,Right,183,79,6,11,10,13,6,10,10,9,12,11,11,13,11,10,8,12,11,10,2,2,2,2,12,9,10,13,generated,-
Lagunari,16,Arbër Bajrami,-,MC,-,34,ALB,Non-EU,Non-HG,No,Registered,54,54,Left,177,67,7,11,12,12,8,10,8,6,11,12,10,10,11,7,10,10,9,10,2,2,2,2,10,11,9,10,generated,-
Lagunari,17,Joaquín Aguilera,-,AMC,-,23,ESP,EU,Non-HG,No,Registered,54,56,Right,178,77,11,11,11,11,10,9,9,8,10,12,10,12,12,9,10,12,9,11,2,2,2,2,11,11,9,12,generated,-
Lagunari,21,Paolo Fontana,-,AML,ST,25,ITA,EU,HGN,No,Registered,53,56,Left,181,80,11,11,12,10,9,4,5,8,10,10,7,12,8,6,10,10,9,12,2,2,2,2,10,11,11,8,generated,-
Lagunari,19,Emanuele Rizzo,-,AMR,ST,27,ITA,EU,HGC,No,Registered,54,57,Right,168,69,11,11,12,12,8,7,6,6,9,11,4,11,9,8,13,10,9,13,2,2,2,2,9,6,11,10,generated,-
Lagunari,30,Stefano Ferrara,-,ST,-,20,ITA,EU,HGC,Yes,U21 Exempt,56,64,Right,194,93,12,12,11,12,4,6,5,10,9,11,7,11,10,8,12,11,11,9,2,2,2,2,9,12,10,9,generated,-
Lagunari,25,Alessandro Bruni,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,53,63,Left,188,90,2,10,2,6,2,3,3,4,8,10,11,6,10,7,7,7,10,10,11,10,12,10,10,2,2,10,generated,-
Lagunari,31,Nicola Pellegrini,-,MC,AMC/DM,21,ITA,EU,HGC,Yes,U21 Exempt,56,67,Right,184,83,8,10,11,12,9,11,9,9,11,12,11,12,10,11,11,11,9,11,2,2,2,2,10,12,9,13,generated,-
Lagunari,32,Salvatore Conti,-,ST,-,19,ITA,EU,Non-HG,Yes,U21 Exempt,54,65,Right,181,81,11,8,11,12,6,5,4,11,8,9,6,9,8,9,11,13,11,12,2,2,2,2,12,12,11,11,generated,-
```

### Canarini (Frosinone Calcio)
**Reputation:** 58 | **CA Band:** 52–61 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Canarini,1,Bruno Dujmović,-,GK,-,32,CRO,EU,Non-HG,No,Registered,59,59,Right,195,94,2,11,3,7,2,3,3,4,8,11,13,7,11,11,6,9,10,11,12,12,12,11,12,2,2,10,generated,-
Canarini,3,Michele Moretti,-,DL,-,25,ITA,EU,HGN,No,Registered,60,63,Right,187,80,7,11,11,10,11,14,13,9,9,10,10,11,10,10,13,13,11,10,2,2,2,2,12,9,8,12,generated,-
Canarini,4,Yeray Campos,-,DC,DL,29,COL,Non-EU,Non-HG,No,Registered,59,59,Right,186,87,4,10,11,11,7,12,12,13,8,10,12,12,11,11,10,9,12,9,2,2,2,2,13,6,6,11,generated,-
Canarini,5,Chukwu Adeyemi,-,DC,DL,29,NGA,Non-EU,Non-HG,No,Registered,61,61,Left,184,77,6,10,8,11,5,14,13,13,8,11,12,12,11,8,11,13,12,11,2,2,2,2,11,6,6,11,generated,capped by band
Canarini,2,Giovanni Piras,-,DR,MR,31,ITA,EU,HGC,No,Registered,60,60,Right,182,74,9,11,12,11,10,11,12,9,10,11,13,12,12,8,13,14,13,10,2,2,2,2,8,11,9,14,generated,-
Canarini,6,Hayato Mori,-,DM,DC,31,JPN,Non-EU,Non-HG,No,Registered,60,60,Left,191,82,7,13,9,13,6,12,11,10,8,11,13,12,12,9,10,12,11,10,2,2,2,2,14,8,8,12,generated,-
Canarini,8,Emanuele Farina,-,MC,AMC/DM,30,ITA,EU,HGC,No,Registered,61,61,Right,171,70,7,10,12,13,8,12,11,7,15,13,11,12,12,8,10,12,11,13,2,2,2,2,12,11,12,13,generated,capped by band
Canarini,10,Matheus Ramos,-,MC,DM,25,BRA,Non-EU,Non-HG,No,Registered,56,57,Right,187,86,8,10,10,11,7,10,9,8,11,12,12,14,10,10,11,10,11,10,2,2,2,2,12,9,11,13,generated,-
Canarini,11,Andrea Silvestri,-,AML,-,31,ITA,EU,HGN,No,Registered,57,57,Left,179,76,9,8,13,10,9,7,2,6,9,11,6,11,10,9,13,12,11,13,2,2,2,2,12,12,12,11,generated,-
Canarini,7,Filippo Pellegrini,-,AMR,-,28,ITA,EU,Non-HG,No,Registered,58,59,Right,179,71,12,11,14,10,10,7,5,6,10,11,4,10,10,7,12,9,9,11,2,2,2,2,11,12,12,11,generated,-
Canarini,9,Ricardo Amaral,-,ST,AML,28,POR,EU,Non-HG,No,Registered,61,63,Right,182,81,12,10,13,12,6,6,3,13,10,13,4,12,12,10,12,11,14,14,2,2,2,2,13,11,11,11,generated,capped by band
Canarini,13,Ante Vasić,-,GK,-,22,BIH,Non-EU,Non-HG,No,Registered,53,59,Right,189,88,2,12,3,8,2,3,3,4,9,11,11,8,10,8,6,9,9,11,10,12,10,10,11,2,2,9,generated,-
Canarini,23,Michele Testa,-,DL,WBL,19,ITA,EU,HGC,Yes,U21 Exempt,52,62,Right,173,76,5,11,10,10,8,11,11,10,8,12,11,10,9,9,11,12,11,10,2,2,2,2,8,8,9,11,generated,-
Canarini,15,Oliver Holm,-,DC,DR,27,DEN,EU,Non-HG,No,Registered,59,61,Right,187,82,4,12,8,8,6,14,12,12,8,10,10,10,10,10,11,11,13,9,2,2,2,2,13,6,5,11,generated,-
Canarini,24,Tommaso Greco,-,DC,-,26,ITA,EU,HGC,No,Registered,55,55,Right,188,88,5,9,7,10,7,10,11,12,9,11,11,11,10,8,10,10,12,9,2,2,2,2,11,5,4,11,generated,-
Canarini,22,Matteo Gentile,-,DR,-,23,ITA,EU,HGC,No,Registered,56,61,Right,173,67,5,10,10,11,12,12,10,9,9,11,11,10,11,9,13,13,11,10,2,2,2,2,10,11,10,10,generated,-
Canarini,30,Riccardo Testa,-,DM,-,19,ITA,EU,HGC,Yes,U21 Exempt,52,67,Right,183,81,6,9,10,13,6,11,8,8,8,11,13,13,11,10,9,8,8,10,2,2,2,2,11,8,8,10,generated,-
Canarini,14,Michał Jabłoński,-,MC,DM,27,POL,EU,Non-HG,No,Registered,56,58,Right,178,71,9,11,12,13,10,11,9,7,12,12,8,10,10,7,9,10,11,11,2,2,2,2,11,11,10,11,generated,-
Canarini,17,Federico Silvestri,-,AMC,AML,19,ITA,EU,Non-HG,Yes,U21 Exempt,54,70,Left,179,75,9,12,10,10,7,8,6,7,11,11,7,12,11,8,11,9,8,10,2,2,2,2,11,11,12,10,generated,-
Canarini,21,Bruno Petrović,-,AML,ST/ML,23,CRO,EU,Non-HG,No,Registered,56,59,Left,184,84,9,12,11,11,9,7,6,7,9,10,7,9,9,8,12,12,9,13,2,2,2,2,10,13,13,11,generated,-
Canarini,19,Aitor Camacho,-,AMR,-,28,ESP,EU,Non-HG,No,Registered,52,55,Right,166,66,11,10,11,13,8,5,5,7,9,10,7,12,9,6,10,11,7,10,2,2,2,2,12,10,11,11,generated,-
Canarini,18,Fatjon Cela,-,ST,AML,21,ALB,Non-EU,Non-HG,Yes,U21 Exempt,56,67,Right,186,78,11,9,11,11,6,5,5,10,11,10,5,10,13,8,11,10,11,10,2,2,2,2,11,12,11,11,generated,-
Canarini,25,Leonardo Pellegrini,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,53,65,Right,180,77,2,9,2,9,2,3,3,4,9,10,12,9,10,10,7,8,10,10,10,11,12,9,10,2,2,11,generated,-
Canarini,31,Diego Gentile,-,MC,DM,19,ITA,EU,HGC,Yes,U21 Exempt,53,66,Right,177,68,5,9,10,13,9,10,9,8,13,10,11,9,10,8,11,9,10,10,2,2,2,2,10,10,8,12,generated,-
Canarini,32,Antonio Serra,-,ST,AMC,20,ITA,EU,HGN,Yes,U21 Exempt,53,59,Left,187,77,12,10,10,9,6,6,5,10,8,11,6,11,10,8,12,12,10,11,2,2,2,2,9,11,11,10,generated,-
```

## 3. Bundesliga

### Swabians (VfB Stuttgart)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Swabians,1,Guy Ben-David,-,GK,-,25,ISR,Non-EU,Non-HG,No,Registered,71,71,Right,190,85,2,10,5,8,2,3,3,4,9,14,14,9,14,11,8,9,13,14,13,17,15,13,14,2,2,11,generated,-
Swabians,3,Ren Hayashi,-,DL,WBL,27,JPN,Non-EU,Non-HG,No,Registered,74,75,Left,176,72,6,15,14,15,13,14,17,11,12,14,15,14,12,11,16,16,13,13,2,2,2,2,14,11,11,14,generated,capped by band
Swabians,4,David Winter,-,DC,-,36,AUT,EU,Non-HG,No,Registered,74,74,Right,189,84,5,13,10,13,5,15,14,15,10,16,15,15,15,13,15,13,13,10,2,2,2,2,15,7,4,16,generated,capped by band
Swabians,5,Henri Aigner,-,DC,DM,23,AUT,EU,HGN,No,Registered,74,79,Right,186,86,7,13,10,11,7,13,16,17,10,16,14,16,16,10,16,13,14,13,2,2,2,2,13,4,5,15,generated,capped by band
Swabians,2,Simon Bech,-,DR,-,28,DEN,EU,Non-HG,No,Registered,72,72,Right,182,76,9,13,14,15,14,14,15,14,10,12,15,13,12,11,16,15,13,13,2,2,2,2,14,12,11,14,generated,-
Swabians,6,Raúl Bermejo,-,DM,-,25,ESP,EU,Non-HG,No,Registered,74,75,Right,174,72,9,14,15,13,8,14,14,12,14,15,15,16,16,13,12,14,14,14,2,2,2,2,15,11,10,17,generated,capped by band
Swabians,8,Lamine Diakité,-,MC,-,30,CIV,Non-EU,Non-HG,No,Registered,70,70,Right,179,76,11,16,13,13,10,13,13,8,13,14,14,13,14,11,13,12,12,11,2,2,2,2,14,11,13,17,generated,-
Swabians,10,Jannik Heinz,-,MC,DM,34,GER,EU,HGN,No,Registered,68,68,Right,181,81,12,12,13,15,10,12,11,10,14,14,12,14,14,9,11,11,12,14,2,2,2,2,14,13,12,16,generated,-
Swabians,11,Niklas Winter,-,AML,ML,31,AUT,EU,Non-HG,No,Registered,71,71,Left,180,76,13,12,17,15,11,6,3,9,12,12,6,14,11,9,14,15,10,15,2,2,2,2,15,13,16,15,generated,-
Swabians,7,Filip Dudek,-,AMR,MR/AMC,27,POL,EU,Non-HG,No,Registered,72,72,Left,176,72,13,13,15,14,12,6,8,6,12,13,5,13,12,9,16,13,11,14,2,2,2,2,12,15,17,14,generated,-
Swabians,9,Marcel Scholz,-,ST,AMR/AMC,26,GER,EU,HGC,No,Registered,74,75,Left,189,85,16,10,14,15,9,7,4,14,13,13,7,15,14,10,16,13,14,12,2,2,2,2,12,16,13,13,generated,capped by band
Swabians,13,Yuval Abutbul,-,GK,-,21,ISR,Non-EU,Non-HG,Yes,U21 Exempt,65,76,Either,191,92,2,10,3,9,2,3,3,4,8,12,14,11,14,11,8,7,12,13,15,11,12,13,12,2,2,11,generated,-
Swabians,23,Toni Marković,-,DL,ML,30,SRB,Non-EU,Non-HG,No,Registered,71,71,Right,187,81,8,14,15,12,13,14,14,10,9,11,14,15,13,9,14,15,13,14,2,2,2,2,16,14,10,15,generated,-
Swabians,15,Daichi Kikuchi,-,DC,-,28,JPN,Non-EU,Non-HG,No,Registered,70,71,Right,186,75,5,12,7,11,8,12,13,16,8,14,15,12,13,12,13,12,16,9,2,2,2,2,14,6,5,13,generated,-
Swabians,24,Moritz Scholz,-,DC,-,19,GER,EU,Non-HG,Yes,U21 Exempt,67,79,Left,179,77,3,11,10,11,5,13,14,13,11,13,12,13,14,11,13,12,14,9,2,2,2,2,14,5,5,14,generated,-
Swabians,22,Yanis Mercier,-,DR,-,20,FRA,EU,Non-HG,Yes,U21 Exempt,70,75,Right,178,69,7,13,13,12,13,15,13,9,11,11,15,13,13,11,16,14,13,13,2,2,2,2,14,11,10,14,generated,-
Swabians,14,Tom Lehmann,-,DM,-,30,GER,EU,HGC,No,Registered,66,66,Right,188,82,7,14,13,11,9,13,11,8,12,13,14,14,12,11,12,11,11,11,2,2,2,2,14,9,9,15,generated,-
Swabians,16,Moritz Vogel,-,MC,DM,27,GER,EU,HGC,No,Registered,67,67,Right,184,79,9,14,14,15,11,12,10,11,14,13,12,14,12,11,12,13,10,12,2,2,2,2,13,13,12,13,generated,-
Swabians,17,David Huber,-,AMC,-,32,AUT,EU,Non-HG,No,Registered,66,66,Right,186,80,11,15,12,14,13,8,6,8,14,12,6,13,14,9,12,13,11,13,2,2,2,2,13,14,13,12,generated,-
Swabians,21,Mikkel Ahlberg,-,AML,-,26,SWE,EU,Non-HG,No,Registered,65,65,Left,182,80,13,10,15,14,10,7,5,7,10,12,7,11,10,8,13,11,10,11,2,2,2,2,11,14,15,12,generated,-
Swabians,30,Tom Köhler,-,AMR,-,19,GER,EU,HGC,Yes,U21 Exempt,65,74,Left,177,75,11,11,16,13,10,5,6,8,10,10,6,10,10,7,12,11,10,17,2,2,2,2,10,12,14,11,generated,-
Swabians,19,Sebastian Kainz,-,ST,AMR,25,AUT,EU,Non-HG,No,Registered,66,68,Right,187,87,14,10,14,14,8,4,5,14,9,11,6,13,13,8,12,12,12,12,2,2,2,2,13,13,10,14,generated,-
Swabians,25,Dennis Scholz,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,66,81,Right,187,86,2,12,5,8,2,3,3,4,7,13,11,10,13,12,8,8,8,14,14,14,13,14,12,2,2,13,generated,-
Swabians,31,Niklas Schreiber,-,MC,AMC,17,GER,EU,HGC,Yes,U21 Exempt,67,76,Right,182,77,8,16,12,13,11,11,11,8,14,12,11,12,13,9,12,12,12,12,2,2,2,2,13,12,11,15,generated,-
Swabians,32,Lars Weber,-,ST,AMC,17,GER,EU,HGN,Yes,U21 Exempt,68,82,Right,179,76,14,11,12,15,7,6,3,12,12,12,6,13,12,10,15,13,12,13,2,2,2,2,13,15,10,15,generated,-
```

### Breisgau Brazilians (SC Freiburg)
**Reputation:** 76 | **CA Band:** 63–72 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Breisgau Brazilians,1,Miloš Marković,-,GK,-,34,BIH,Non-EU,Non-HG,No,Registered,68,68,Either,190,93,2,11,3,9,2,3,3,4,10,16,13,8,13,9,8,10,13,14,13,15,12,16,13,2,2,13,generated,-
Breisgau Brazilians,3,Máté Vörös,-,DL,-,32,HUN,EU,Non-HG,No,Registered,70,70,Left,183,79,6,14,14,14,13,15,15,12,11,14,14,13,12,11,14,15,12,13,2,2,2,2,12,10,9,14,generated,-
Breisgau Brazilians,4,Przemysław Olszewski,-,DC,-,26,POL,EU,Non-HG,No,Registered,67,69,Right,189,82,4,9,10,8,5,13,13,14,10,11,15,11,12,10,10,13,14,12,2,2,2,2,15,7,5,12,generated,-
Breisgau Brazilians,5,Finn Smit,-,DC,DR/DL,28,NED,EU,Non-HG,No,Registered,72,74,Right,185,78,4,13,9,12,5,15,15,16,11,11,16,12,12,10,12,14,14,13,2,2,2,2,15,6,7,12,generated,capped by band
Breisgau Brazilians,2,Philipp Hofer,-,DR,-,25,AUT,EU,Non-HG,No,Registered,72,73,Right,185,84,10,13,15,14,14,15,13,13,11,13,14,15,12,10,15,14,12,15,2,2,2,2,15,12,9,16,generated,capped by band
Breisgau Brazilians,6,Felix Maier,-,DM,-,27,GER,EU,Non-HG,No,Registered,72,74,Right,193,94,8,14,12,15,7,15,13,11,13,15,15,15,13,10,11,13,13,13,2,2,2,2,15,9,8,15,generated,capped by band
Breisgau Brazilians,8,Lars Wimmer,-,MC,-,25,AUT,EU,Non-HG,No,Registered,70,71,Either,182,80,9,15,13,13,9,13,11,9,15,12,11,15,13,11,13,14,9,12,2,2,2,2,14,13,11,16,generated,-
Breisgau Brazilians,10,Sofiane Bouvier,-,MC,-,24,FRA,EU,Non-HG,No,Registered,72,77,Right,185,78,11,15,12,15,12,13,11,10,14,15,11,13,14,11,12,13,11,12,2,2,2,2,14,14,14,16,generated,capped by band
Breisgau Brazilians,11,Christian Wimmer,-,AML,ST,28,AUT,EU,Non-HG,No,Registered,70,71,Left,183,77,13,13,14,16,13,7,5,9,14,12,8,14,11,9,13,13,13,14,2,2,2,2,14,17,13,14,generated,-
Breisgau Brazilians,7,Oğuz Koç,-,AMR,MR,25,TUR,Non-EU,Non-HG,No,Registered,70,71,Right,173,68,13,13,14,19,9,7,5,8,9,11,7,11,10,9,17,11,10,15,2,2,2,2,14,14,12,14,generated,-
Breisgau Brazilians,9,Florian Roth,-,ST,-,32,GER,EU,HGC,No,Registered,71,71,Right,180,72,14,12,15,13,8,7,5,15,9,15,5,14,14,12,12,13,15,13,2,2,2,2,14,16,11,13,generated,-
Breisgau Brazilians,13,Wojciech Veselý,-,GK,-,21,CZE,EU,Non-HG,Yes,U21 Exempt,68,74,Right,185,88,2,11,3,8,2,3,3,4,9,15,12,10,14,11,7,8,12,14,12,13,16,14,14,2,2,13,generated,-
Breisgau Brazilians,23,James Holt,-,DL,-,25,USA,Non-EU,Non-HG,No,Registered,65,68,Left,183,81,7,13,13,11,13,13,12,11,10,10,12,12,13,8,15,14,14,13,2,2,2,2,13,12,8,13,generated,-
Breisgau Brazilians,15,Noah Lehmann,-,DC,DM,21,GER,EU,HGC,Yes,U21 Exempt,64,74,Left,182,76,6,10,9,11,7,12,14,13,12,12,15,12,9,9,13,13,14,10,2,2,2,2,12,5,4,9,generated,-
Breisgau Brazilians,24,Ryo Hayashi,-,DC,DR/DL,26,JPN,Non-EU,Non-HG,No,Registered,66,67,Right,185,86,5,11,9,11,5,12,14,13,9,12,13,13,12,12,12,11,15,10,2,2,2,2,14,6,6,12,generated,-
Breisgau Brazilians,22,Mason Sawyer,-,DR,-,31,USA,Non-EU,Non-HG,No,Registered,65,65,Right,178,72,8,13,12,11,13,12,12,10,11,12,13,15,12,7,14,13,12,10,2,2,2,2,12,11,10,14,generated,-
Breisgau Brazilians,14,Michał Krawczyk,-,DM,MC,22,POL,EU,Non-HG,No,Registered,67,69,Right,187,83,8,15,14,14,9,13,11,12,11,13,13,15,14,9,13,11,11,13,2,2,2,2,15,8,9,15,generated,-
Breisgau Brazilians,16,Jan Kessler,-,MC,DM,23,GER,EU,HGN,No,Registered,64,68,Left,182,80,10,14,13,14,7,12,10,9,12,13,10,12,12,9,10,12,11,12,2,2,2,2,13,12,10,13,generated,-
Breisgau Brazilians,17,Oliver Bennett,-,AMC,MC,29,USA,Non-EU,Non-HG,No,Registered,67,67,Right,177,72,13,12,15,13,11,9,8,7,14,13,9,13,13,11,13,13,11,11,2,2,2,2,13,15,14,13,generated,-
Breisgau Brazilians,30,Jonas Lehmann,-,AML,-,18,GER,EU,HGC,Yes,U21 Exempt,65,80,Left,183,78,12,13,13,11,14,7,6,7,14,10,6,13,14,9,13,12,12,12,2,2,2,2,12,12,16,13,generated,-
Breisgau Brazilians,19,Mateusz Horák,-,AMR,ST,26,CZE,EU,Non-HG,No,Registered,67,67,Left,182,81,12,11,14,15,13,8,6,7,13,12,8,14,13,8,12,12,12,13,2,2,2,2,12,14,14,12,generated,-
Breisgau Brazilians,18,Tobias Ehrlich,-,ST,-,22,GER,EU,HGC,No,Registered,65,71,Right,187,84,13,9,12,14,9,4,5,11,10,12,5,14,13,10,15,12,11,12,2,2,2,2,11,14,12,12,generated,-
Breisgau Brazilians,25,Tobias Brandt,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,66,81,Right,187,83,2,9,3,9,2,3,3,4,9,13,14,7,13,9,6,10,13,14,12,15,12,13,13,2,2,10,generated,-
Breisgau Brazilians,31,Jannik Schreiber,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,63,78,Right,179,82,9,13,12,12,10,13,9,9,12,12,13,13,13,10,12,12,10,13,2,2,2,2,13,10,13,15,generated,-
Breisgau Brazilians,32,Valentin Friedrich,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,64,73,Left,184,86,12,13,13,10,7,5,5,14,10,11,5,13,13,8,15,13,13,10,2,2,2,2,12,14,10,12,generated,-
```

### Foals (Borussia Mönchengladbach)
**Reputation:** 75 | **CA Band:** 63–72 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Foals,1,Leandro Albuquerque,-,GK,-,24,BRA,Non-EU,Non-HG,No,Registered,70,75,Right,193,84,2,10,3,9,2,3,3,4,10,14,14,7,14,12,8,11,13,12,15,13,15,14,14,2,2,11,generated,-
Foals,3,Noah Bergmann,-,DL,-,32,GER,EU,HGN,No,Registered,71,71,Left,185,83,5,13,15,13,13,15,14,14,12,12,15,14,11,9,14,15,13,15,2,2,2,2,15,12,10,14,generated,-
Foals,4,Lars Pohl,-,DC,-,26,GER,EU,HGC,No,Registered,68,68,Right,187,79,5,12,8,11,5,14,12,16,9,11,15,13,11,13,11,12,15,11,2,2,2,2,15,8,4,12,generated,-
Foals,5,Morten Øien,-,DC,DM,28,FIN,EU,Non-HG,No,Registered,70,71,Left,189,81,5,12,10,12,7,16,14,13,10,13,14,12,11,11,12,12,14,12,2,2,2,2,16,6,6,13,generated,-
Foals,2,Christian Sauer,-,DR,-,26,GER,EU,HGC,No,Registered,71,72,Right,169,59,8,14,15,12,13,13,15,11,15,12,12,16,13,10,14,16,13,12,2,2,2,2,14,11,11,15,generated,-
Foals,6,Kaan Yalçın,-,DM,-,24,TUR,Non-EU,Non-HG,No,Registered,71,73,Right,185,80,7,13,13,13,9,14,14,12,14,14,14,15,14,11,13,15,15,13,2,2,2,2,14,10,10,14,generated,-
Foals,8,Marvin Lang,-,MC,AMC,29,GER,EU,HGC,No,Registered,70,70,Right,175,75,7,12,11,16,7,13,11,7,14,15,13,13,14,9,14,14,13,14,2,2,2,2,14,13,10,16,generated,-
Foals,10,Roko Brkić,-,MC,-,29,CRO,EU,Non-HG,No,Registered,72,72,Right,180,80,9,14,14,12,10,16,14,10,15,14,11,15,14,12,11,15,13,12,2,2,2,2,14,14,13,16,generated,capped by band
Foals,11,Asger Kristiansen,-,AML,-,23,DEN,EU,HGN,No,Registered,68,71,Right,181,80,12,11,14,13,14,6,7,10,14,12,9,14,14,9,13,12,11,16,2,2,2,2,12,14,12,13,generated,-
Foals,7,Jurre De Jong,-,AMR,MR,25,NED,EU,Non-HG,No,Registered,70,72,Left,171,69,12,12,15,13,12,6,8,7,13,12,7,13,13,7,18,14,11,14,2,2,2,2,9,12,14,13,generated,-
Foals,9,David Reiter,-,ST,AMC/AMR,30,AUT,EU,Non-HG,No,Registered,70,70,Right,183,79,15,11,14,12,8,6,5,15,8,14,5,16,16,11,13,13,13,12,2,2,2,2,13,14,12,15,generated,-
Foals,13,Yannick Schreiber,-,GK,-,33,GER,EU,HGN,No,Registered,63,63,Right,182,81,2,10,3,8,2,3,3,4,11,13,10,11,13,9,8,8,10,14,14,14,10,13,12,2,2,11,generated,-
Foals,23,Andrés Rebollo,-,DL,-,26,ESP,EU,Non-HG,No,Registered,64,67,Left,179,74,7,12,11,11,14,13,14,11,12,13,13,13,11,11,11,13,12,11,2,2,2,2,12,11,8,13,generated,-
Foals,15,Kerem Doğan,-,DC,DL,21,TUR,Non-EU,Non-HG,Yes,U21 Exempt,68,79,Left,185,84,4,11,9,14,7,13,12,14,11,14,15,13,13,11,12,14,15,11,2,2,2,2,14,8,7,12,generated,-
Foals,24,Florian Bauer,-,DC,-,24,AUT,EU,Non-HG,No,Registered,69,74,Right,178,76,5,10,7,12,4,13,13,17,12,11,14,13,12,12,11,11,15,13,2,2,2,2,17,6,6,12,generated,-
Foals,22,Maciej Pawlak,-,DR,-,22,POL,EU,HGN,No,Registered,65,68,Left,181,78,6,12,13,12,14,12,15,9,12,14,12,15,12,10,12,13,10,14,2,2,2,2,12,11,11,12,generated,-
Foals,14,Lars De Boer,-,DM,MC/DC,36,NED,EU,Non-HG,No,Registered,66,66,Right,188,87,8,13,10,12,6,14,13,9,12,12,13,15,12,11,10,14,13,10,2,2,2,2,13,8,9,13,generated,-
Foals,16,Yuri Ramos,-,MC,DM/AMC,28,BRA,Non-EU,Non-HG,No,Registered,63,66,Right,177,75,11,11,12,13,9,12,11,8,15,12,13,12,12,11,12,11,12,11,2,2,2,2,12,13,11,15,generated,-
Foals,17,Adebayo Lawal,-,AMC,-,21,NGA,Non-EU,Non-HG,Yes,U21 Exempt,64,69,Left,182,78,12,12,13,13,9,8,7,8,13,12,9,13,12,10,10,13,11,13,2,2,2,2,13,13,15,13,generated,-
Foals,21,Rachid Tazi,-,AML,ST,22,MAR,Non-EU,Non-HG,No,Registered,66,68,Left,180,77,13,10,14,13,12,4,7,9,13,13,7,12,12,10,14,14,12,13,2,2,2,2,12,12,13,11,generated,-
Foals,30,Fabian Hofmann,-,AMR,ST,18,GER,EU,HGC,Yes,U21 Exempt,63,73,Right,184,83,11,10,13,12,14,6,6,9,12,10,5,11,10,9,14,12,9,14,2,2,2,2,12,12,13,14,generated,-
Foals,19,Henri Bergmann,-,ST,-,27,GER,EU,HGN,No,Registered,63,66,Left,183,82,13,10,12,11,6,4,4,11,10,12,5,13,13,10,12,11,12,13,2,2,2,2,12,15,10,12,generated,-
Foals,25,Philipp Lang,-,GK,-,20,GER,EU,HGC,Yes,U21 Exempt,66,75,Right,187,92,2,9,3,9,2,3,3,4,7,13,12,10,13,9,8,8,12,13,14,13,14,13,13,2,2,12,generated,-
Foals,31,Jannik Franke,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,65,75,Left,186,80,9,14,12,14,10,12,11,8,12,12,12,13,10,8,11,12,12,12,2,2,2,2,12,13,12,16,generated,-
Foals,32,Lars Lang,-,ST,-,20,GER,EU,HGC,Yes,U21 Exempt,65,77,Right,184,79,14,10,11,13,6,5,5,11,10,11,5,12,13,8,14,12,11,11,2,2,2,2,11,15,12,14,generated,-
```

### Village Club (TSG 1899 Hoffenheim)
**Reputation:** 74 | **CA Band:** 62–71 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Village Club,1,Tomás Leite,-,GK,-,29,POR,EU,Non-HG,No,Registered,71,71,Left,186,83,2,11,6,9,2,3,3,4,10,13,14,12,15,12,9,10,15,13,13,15,16,15,14,2,2,13,generated,capped by band
Village Club,3,Florian Gruber,-,DL,ML,31,AUT,EU,Non-HG,No,Registered,67,67,Right,182,80,5,13,15,11,11,14,16,12,10,13,11,15,13,9,15,12,14,13,2,2,2,2,13,11,8,13,generated,-
Village Club,4,Niklas Pichler,-,DC,DR/DM,32,AUT,EU,Non-HG,No,Registered,66,66,Left,185,81,5,13,7,11,6,13,15,12,11,9,15,15,10,12,10,13,14,11,2,2,2,2,16,6,4,10,generated,-
Village Club,5,Jamie Maddox,-,DC,-,30,AUS,Non-EU,Non-HG,No,Registered,70,70,Right,187,86,5,13,8,11,4,14,12,14,12,15,14,15,14,12,14,13,13,10,2,2,2,2,17,7,5,14,generated,-
Village Club,2,Lars Schreiber,-,DR,DC/WBR,33,GER,EU,HGN,No,Registered,69,69,Right,174,62,7,13,14,13,13,12,16,10,9,12,11,15,12,9,14,14,12,12,2,2,2,2,15,13,9,16,generated,-
Village Club,6,Matej Tomić,-,DM,-,27,CRO,EU,Non-HG,No,Registered,71,73,Right,174,68,8,13,14,11,8,14,15,13,15,13,13,14,15,12,11,15,15,13,2,2,2,2,15,10,9,15,generated,capped by band
Village Club,8,Lukas Lang,-,MC,-,26,GER,EU,HGC,No,Registered,71,72,Right,173,64,10,14,15,15,10,14,11,9,14,14,11,13,14,11,13,13,13,15,2,2,2,2,14,13,10,17,generated,capped by band
Village Club,10,Sebastian Dudek,-,MC,-,32,POL,EU,Non-HG,No,Registered,71,71,Right,176,70,10,16,14,15,10,11,9,9,14,14,14,14,14,10,12,13,15,13,2,2,2,2,14,13,12,15,generated,capped by band
Village Club,11,Sjoerd Kuipers,-,AML,ML,28,NED,EU,Non-HG,No,Registered,65,65,Left,191,90,11,11,12,14,14,6,8,9,14,12,7,14,14,9,14,14,9,12,2,2,2,2,12,12,14,13,generated,-
Village Club,7,Nabil Fassi,-,AMR,AMC,29,MAR,Non-EU,Non-HG,No,Registered,71,71,Right,184,82,12,14,16,14,11,5,8,8,12,11,8,12,12,10,16,11,11,14,2,2,2,2,13,15,15,10,generated,capped by band
Village Club,9,Mario Todorović,-,ST,AMC,28,SRB,Non-EU,Non-HG,No,Registered,71,74,Right,176,77,15,13,15,13,9,3,3,13,12,13,6,14,15,12,14,12,14,13,2,2,2,2,14,15,13,15,generated,capped by band
Village Club,13,Idrissa Sagna,-,GK,-,23,CIV,Non-EU,Non-HG,No,Registered,64,71,Right,194,91,2,10,3,8,2,3,3,4,9,13,14,10,12,11,8,7,10,13,12,13,13,13,13,2,2,9,generated,-
Village Club,23,Abdelhak Fassi,-,DL,-,24,MAR,Non-EU,Non-HG,No,Registered,62,65,Left,183,81,8,11,11,13,12,13,14,13,9,12,13,10,13,10,12,15,12,13,2,2,2,2,11,12,7,11,generated,-
Village Club,15,David Lehmann,-,DC,-,21,GER,EU,HGC,Yes,U21 Exempt,63,69,Right,181,78,4,10,9,10,5,13,13,11,10,14,12,14,14,9,14,10,12,9,2,2,2,2,11,6,4,14,generated,-
Village Club,30,Moritz Ostermann,-,DC,-,19,GER,EU,HGC,Yes,U21 Exempt,64,75,Right,187,90,3,10,8,11,6,12,15,13,11,9,15,12,9,12,9,13,14,11,2,2,2,2,14,7,5,10,generated,-
Village Club,22,Felix Lang,-,DR,WBR/MR,26,GER,EU,HGC,No,Registered,65,68,Right,180,79,9,14,15,12,11,14,13,9,10,14,11,15,12,10,13,12,11,13,2,2,2,2,14,12,11,14,generated,-
Village Club,14,Philipp Aigner,-,DM,MC,29,AUT,EU,Non-HG,No,Registered,63,63,Right,178,75,8,12,12,12,9,13,12,8,11,12,12,13,12,12,12,14,12,11,2,2,2,2,13,10,10,13,generated,-
Village Club,16,Lars Krause,-,MC,-,30,GER,EU,HGC,No,Registered,62,62,Left,180,78,10,13,12,14,9,11,10,9,13,12,11,11,12,10,12,11,11,12,2,2,2,2,12,12,11,13,generated,-
Village Club,17,Jakob Berg,-,AMC,MC,25,FIN,EU,Non-HG,No,Registered,63,64,Left,176,77,11,14,12,12,11,8,9,10,13,14,9,12,14,9,10,11,12,13,2,2,2,2,13,13,11,13,generated,-
Village Club,21,Dino Zdravković,-,AML,-,21,BIH,Non-EU,Non-HG,Yes,U21 Exempt,71,76,Left,182,80,12,13,15,13,15,7,5,7,15,12,7,14,15,8,14,13,12,14,2,2,2,2,12,14,15,13,generated,capped by band
Village Club,19,Dennis Pohl,-,AMR,ST,22,GER,EU,HGC,No,Registered,63,69,Right,186,79,13,11,13,14,10,5,5,7,10,10,4,13,11,8,13,10,12,13,2,2,2,2,12,12,14,13,generated,-
Village Club,18,Zoltán Takács,-,ST,-,25,HUN,EU,Non-HG,No,Registered,63,65,Right,186,82,14,12,12,11,8,4,5,11,10,12,4,11,12,9,13,13,12,12,2,2,2,2,12,14,10,14,generated,-
Village Club,25,Lars Scholz,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,63,74,Right,190,91,2,10,4,7,2,3,3,4,10,11,14,9,11,9,6,10,9,11,13,14,13,11,12,2,2,10,generated,-
Village Club,31,Alexander Krause,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,64,77,Right,177,75,7,12,12,13,10,12,10,9,12,14,12,12,12,8,12,13,9,12,2,2,2,2,14,13,10,13,generated,-
Village Club,32,Kai Becker,-,ST,AMR/AML,19,GER,EU,HGC,Yes,U21 Exempt,64,77,Right,182,71,13,12,12,13,7,4,4,12,11,12,6,13,13,12,13,14,12,12,2,2,2,2,12,14,12,11,generated,-
```

### River Islanders (SV Werder Bremen)
**Reputation:** 74 | **CA Band:** 62–71 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
River Islanders,1,Nikola Milošević,-,GK,-,27,SRB,Non-EU,Non-HG,No,Registered,68,71,Left,192,91,2,11,4,9,2,3,3,4,10,14,15,11,14,7,8,8,12,13,13,14,12,14,13,2,2,13,generated,-
River Islanders,3,Woo-jin Nam,-,DL,-,30,KOR,Non-EU,Non-HG,No,Registered,69,69,Right,186,88,5,13,13,12,13,12,13,11,11,12,13,16,13,8,15,15,13,12,2,2,2,2,14,12,8,15,generated,-
River Islanders,4,Seong-min Seo,-,DC,DR,27,KOR,Non-EU,Non-HG,No,Registered,71,73,Right,194,89,7,11,8,12,6,16,15,15,9,12,12,14,12,13,12,13,17,13,2,2,2,2,15,6,4,12,generated,capped by band
River Islanders,5,Kai Sauer,-,DC,DR,23,GER,EU,HGN,No,Registered,71,75,Right,191,84,6,11,9,11,4,15,15,16,10,11,16,15,11,12,11,13,16,12,2,2,2,2,12,5,6,12,generated,capped by band
River Islanders,2,Valentin Haas,-,DR,WBR,34,GER,EU,HGC,No,Registered,69,69,Right,175,71,7,13,13,13,13,16,14,10,13,13,12,12,13,10,16,15,11,11,2,2,2,2,13,13,9,13,generated,-
River Islanders,6,Takumi Shimizu,-,DM,MC,25,JPN,Non-EU,Non-HG,No,Registered,69,72,Right,172,67,9,13,11,13,9,15,12,10,12,14,15,13,13,9,11,12,12,11,2,2,2,2,16,10,9,15,generated,-
River Islanders,8,Jason Bellanger,-,MC,AMC,31,FRA,EU,Non-HG,No,Registered,68,68,Left,180,69,10,14,12,14,8,13,13,9,14,12,14,13,14,10,12,13,13,13,2,2,2,2,11,14,12,16,generated,-
River Islanders,10,Morten Sjöberg,-,MC,AMC,30,SWE,EU,Non-HG,No,Registered,68,68,Right,181,74,9,14,14,12,10,13,12,8,13,13,14,14,13,11,11,15,13,14,2,2,2,2,13,14,13,15,generated,-
River Islanders,11,Tomasz Rutkowski,-,AML,-,28,POL,EU,Non-HG,No,Registered,71,74,Left,186,82,12,11,16,16,10,6,6,10,10,13,9,15,11,9,16,14,8,15,2,2,2,2,12,14,15,13,generated,capped by band
River Islanders,7,Dennis Ziegler,-,AMR,MR,30,GER,EU,HGC,No,Registered,68,68,Left,178,77,12,12,15,13,15,7,7,7,15,10,7,13,14,8,14,11,11,13,2,2,2,2,12,11,14,12,generated,-
River Islanders,9,Elias Brandt,-,ST,AMR,30,GER,EU,HGN,No,Registered,70,70,Right,181,76,15,13,13,16,10,5,1,13,10,13,5,13,12,9,12,11,13,12,2,2,2,2,14,16,12,12,generated,-
River Islanders,13,Marcin Pospíšil,-,GK,-,28,CZE,EU,Non-HG,No,Registered,67,67,Right,189,85,2,11,4,7,2,3,3,4,10,15,13,9,13,8,9,9,13,15,14,12,13,14,13,2,2,12,generated,-
River Islanders,23,Simon Scholz,-,DL,WBL,28,GER,EU,HGN,No,Registered,68,68,Left,189,81,6,13,13,13,13,13,13,11,12,12,13,13,11,11,17,14,12,11,2,2,2,2,13,12,8,14,generated,-
River Islanders,15,Quinten Peeters,-,DC,DR,28,NED,EU,Non-HG,No,Registered,66,69,Right,191,87,4,12,8,11,6,13,14,15,10,11,14,13,11,11,10,13,14,10,2,2,2,2,14,5,4,11,generated,-
River Islanders,30,Tobias Krause,-,DC,DL,19,GER,EU,Non-HG,Yes,U21 Exempt,65,78,Right,178,76,4,12,8,10,3,13,12,12,8,12,13,12,12,8,12,13,15,10,2,2,2,2,15,4,5,12,generated,-
River Islanders,22,Andrés Izquierdo,-,DR,-,21,ESP,EU,Non-HG,Yes,U21 Exempt,63,74,Either,175,77,7,12,12,11,12,13,12,8,11,14,13,11,10,9,14,14,11,11,2,2,2,2,12,12,12,12,generated,-
River Islanders,14,Daan Beekman,-,DM,-,32,NED,EU,Non-HG,No,Registered,63,63,Left,193,88,7,12,12,12,10,14,11,10,11,14,14,14,10,12,11,10,10,11,2,2,2,2,13,9,11,12,generated,-
River Islanders,16,Xavi Arjona,-,MC,-,24,ESP,EU,Non-HG,No,Registered,62,66,Right,184,85,8,13,12,14,10,11,10,8,10,11,11,15,12,11,11,12,10,11,2,2,2,2,13,10,11,14,generated,-
River Islanders,17,Segun Mohammed,-,AMC,-,23,NGA,Non-EU,Non-HG,No,Registered,64,66,Right,178,75,12,13,13,14,11,7,7,7,13,14,11,13,13,10,15,12,12,13,2,2,2,2,13,13,10,14,generated,-
River Islanders,21,Valentin Hofer,-,AML,-,30,AUT,EU,Non-HG,No,Registered,63,63,Left,184,77,11,13,13,14,9,6,6,9,9,11,5,13,10,7,14,12,11,15,2,2,2,2,12,13,13,11,generated,-
River Islanders,19,Robin Krause,-,AMR,AMC,30,GER,EU,HGN,No,Registered,65,65,Right,175,71,13,10,13,16,8,7,5,7,9,12,8,13,9,9,13,13,10,15,2,2,2,2,12,12,16,13,generated,-
River Islanders,18,Eduardo Farias,-,ST,-,22,BRA,Non-EU,Non-HG,No,Registered,62,66,Right,185,86,12,10,12,12,4,9,5,11,10,11,5,13,15,9,13,12,11,11,2,2,2,2,12,13,10,12,generated,-
River Islanders,25,Jonas Schreiber,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,64,75,Left,195,89,2,9,2,7,2,3,3,4,9,12,14,9,13,8,9,9,13,13,13,12,13,12,13,2,2,9,generated,-
River Islanders,31,Leon Baumann,-,MC,-,18,GER,EU,HGC,Yes,U21 Exempt,62,72,Right,182,78,8,12,10,13,8,10,12,9,14,13,11,13,11,11,13,13,11,13,2,2,2,2,13,12,13,12,generated,-
River Islanders,32,Moritz Herrmann,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,62,75,Right,183,80,13,10,11,12,10,2,4,11,9,11,7,14,13,9,11,11,11,12,2,2,2,2,12,15,13,11,generated,-
```

### Zero-Fivers (1. FSV Mainz 05)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Zero-Fivers,1,Lars Ehrlich,-,GK,-,28,GER,EU,HGN,No,Registered,68,68,Right,189,83,2,12,3,10,2,3,3,4,10,13,14,9,15,10,8,9,11,13,12,14,16,12,12,2,2,13,generated,-
Zero-Fivers,3,Ola Idowu,-,DL,ML,22,NGA,Non-EU,Non-HG,No,Registered,70,75,Right,185,77,6,13,13,11,14,15,16,12,11,12,12,12,11,11,15,16,14,13,2,2,2,2,12,13,11,13,generated,capped by band
Zero-Fivers,4,Emmanuel Darko,-,DC,DM,25,GHA,Non-EU,Non-HG,No,Registered,68,71,Left,184,86,6,11,9,10,7,16,15,15,11,10,14,14,10,11,10,11,13,10,2,2,2,2,14,6,3,11,generated,-
Zero-Fivers,5,Dawid Dudek,-,DC,-,30,POL,EU,Non-HG,No,Registered,70,70,Right,193,94,6,13,8,11,5,14,14,15,9,15,14,14,13,10,12,13,14,10,2,2,2,2,14,5,5,15,generated,capped by band
Zero-Fivers,2,Tobias Reiter,-,DR,-,29,AUT,EU,Non-HG,No,Registered,69,69,Left,181,75,8,12,14,11,12,15,14,10,10,13,15,13,13,12,14,15,13,15,2,2,2,2,13,11,10,14,generated,-
Zero-Fivers,6,Fabian Hofer,-,DM,MC,26,AUT,EU,Non-HG,No,Registered,69,72,Right,172,70,6,11,13,11,7,13,14,12,13,13,15,16,14,9,12,15,13,13,2,2,2,2,14,10,10,14,generated,-
Zero-Fivers,8,Evans Frimpong,-,MC,AMC/DM,24,GHA,Non-EU,Non-HG,No,Registered,66,71,Either,177,76,9,14,12,12,10,12,12,8,14,15,12,12,12,10,12,11,11,13,2,2,2,2,12,11,11,16,generated,-
Zero-Fivers,10,Christian Haas,-,MC,DM/AMC,25,GER,EU,HGC,No,Registered,67,68,Right,176,73,10,15,13,15,10,14,10,8,14,11,14,13,14,10,12,13,12,13,2,2,2,2,12,12,13,13,generated,-
Zero-Fivers,11,Filippo Rizzo,-,AML,-,36,ITA,EU,Non-HG,No,Registered,69,69,Left,177,74,12,12,14,14,14,6,5,8,13,9,5,13,13,9,15,12,11,14,2,2,2,2,14,13,14,14,generated,-
Zero-Fivers,7,Dawid Baran,-,AMR,-,36,POL,EU,Non-HG,No,Registered,67,67,Right,183,79,11,12,13,15,13,6,4,7,12,12,8,11,13,9,14,11,13,14,2,2,2,2,13,12,16,11,generated,-
Zero-Fivers,9,Jonas Richter,-,ST,-,29,GER,EU,HGC,No,Registered,66,66,Left,186,82,15,11,13,9,8,7,3,13,12,14,4,14,13,9,13,11,14,12,2,2,2,2,12,14,11,14,generated,-
Zero-Fivers,13,Federico Villa,-,GK,-,33,ITA,EU,Non-HG,No,Registered,62,62,Left,192,88,2,9,2,8,2,3,3,4,7,12,13,8,12,8,8,9,10,12,11,13,14,12,13,2,2,13,generated,-
Zero-Fivers,23,Yuri Lacerda,-,DL,ML/WBL,26,BRA,Non-EU,Non-HG,No,Registered,64,65,Left,185,88,4,12,11,10,13,12,14,10,9,14,15,11,12,10,13,14,13,11,2,2,2,2,11,11,11,12,generated,-
Zero-Fivers,15,Maximilian Zauner,-,DC,-,26,AUT,EU,Non-HG,No,Registered,62,63,Right,184,81,7,10,7,9,5,13,13,13,10,11,14,12,11,8,12,12,11,11,2,2,2,2,12,4,4,11,generated,-
Zero-Fivers,30,Tobias Giesler,-,DC,-,18,GER,EU,HGC,Yes,U21 Exempt,63,73,Left,182,73,4,11,8,11,3,13,12,15,10,11,13,11,11,10,11,13,13,12,2,2,2,2,13,5,7,12,generated,-
Zero-Fivers,22,Tobias Maier,-,DR,DC,30,GER,EU,HGN,No,Registered,64,64,Right,180,76,8,13,12,11,12,14,10,11,12,11,13,15,13,12,12,14,14,13,2,2,2,2,13,10,13,13,generated,-
Zero-Fivers,14,Nikolaj Sjöberg,-,DM,-,26,SWE,EU,Non-HG,No,Registered,64,66,Left,185,79,8,14,11,9,9,13,13,10,10,14,11,13,12,12,11,13,11,13,2,2,2,2,14,8,7,12,generated,-
Zero-Fivers,16,Alan Rezende,-,MC,DM,24,BRA,Non-EU,Non-HG,No,Registered,61,68,Right,185,80,6,14,12,14,9,12,10,8,13,11,11,11,12,9,13,11,8,11,2,2,2,2,12,11,10,11,generated,-
Zero-Fivers,17,Sebastian Wagner,-,AMC,-,27,GER,EU,HGC,No,Registered,62,62,Left,172,71,11,11,15,12,10,8,7,7,16,10,10,12,10,10,11,13,11,11,2,2,2,2,12,11,12,12,generated,-
Zero-Fivers,21,Marco Sequeira,-,AML,ML,25,POR,EU,Non-HG,No,Registered,62,64,Either,178,74,10,11,12,12,15,7,4,7,13,11,7,12,13,7,13,12,11,14,2,2,2,2,12,11,12,13,generated,-
Zero-Fivers,19,Marcelo Lima,-,AMR,AMC,33,BRA,Non-EU,Non-HG,No,Registered,64,64,Right,179,71,13,10,13,11,12,6,7,8,13,13,7,12,11,8,13,11,12,13,2,2,2,2,13,13,14,12,generated,-
Zero-Fivers,18,Tim Scholz,-,ST,AML,29,GER,EU,HGC,No,Registered,61,61,Right,189,85,12,9,11,13,7,7,6,10,10,11,5,11,13,8,14,11,11,12,2,2,2,2,11,13,10,12,generated,-
Zero-Fivers,25,Christian Hofmann,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,62,77,Right,187,87,2,12,5,9,2,3,3,4,7,12,12,9,12,8,7,9,10,11,14,13,12,11,12,2,2,10,generated,-
Zero-Fivers,31,Felix Weber,-,MC,-,18,GER,EU,HGN,Yes,U21 Exempt,62,74,Right,180,73,8,14,12,11,9,13,10,8,13,10,11,13,14,10,11,13,10,11,2,2,2,2,13,12,8,11,generated,-
Zero-Fivers,32,Tim Becker,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,64,73,Right,180,80,13,10,13,13,7,5,3,13,11,13,6,12,10,8,12,13,16,13,2,2,2,2,13,14,11,12,generated,-
```

### Iron Ones (1. FC Union Berlin)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Iron Ones,1,Isaac Appiah,-,GK,-,31,GHA,Non-EU,Non-HG,No,Registered,69,69,Right,192,84,2,9,4,8,2,3,3,4,10,12,14,10,14,8,7,9,12,12,15,15,13,13,14,2,2,12,generated,-
Iron Ones,3,Adam Szewczyk,-,DL,ML,22,POL,EU,HGN,No,Registered,69,76,Left,183,83,5,15,15,12,10,14,13,11,9,11,13,16,13,10,15,14,12,14,2,2,2,2,15,11,11,14,generated,-
Iron Ones,4,Roko Jovanović,-,DC,DM/DR,27,SRB,Non-EU,Non-HG,No,Registered,68,69,Right,187,86,6,10,10,10,6,13,13,14,11,13,14,12,12,11,12,14,16,10,2,2,2,2,15,5,5,13,generated,-
Iron Ones,5,Kenta Ueda,-,DC,-,26,JPN,Non-EU,Non-HG,No,Registered,69,71,Right,187,82,5,11,7,12,7,15,14,13,10,12,14,13,12,12,12,13,16,11,2,2,2,2,14,7,4,13,generated,-
Iron Ones,2,Lucas Rezende,-,DR,-,26,BRA,Non-EU,Non-HG,No,Registered,69,70,Right,174,69,5,14,13,12,15,13,14,11,11,13,13,13,10,12,15,14,13,14,2,2,2,2,14,11,11,14,generated,-
Iron Ones,6,Julian Neumann,-,DM,DC,27,GER,EU,HGC,No,Registered,70,70,Right,181,71,7,12,11,14,9,13,13,12,12,12,14,15,14,10,12,17,13,14,2,2,2,2,16,11,8,16,generated,capped by band
Iron Ones,8,Thomas Bjørnstad,-,MC,AMC,21,FIN,EU,Non-HG,Yes,U21 Exempt,69,74,Right,179,66,12,16,13,14,8,13,12,9,13,12,11,13,14,10,13,13,11,12,2,2,2,2,14,13,12,15,generated,-
Iron Ones,10,David Krause,-,MC,-,29,GER,EU,HGC,No,Registered,69,69,Right,183,75,9,15,12,13,10,14,11,9,14,12,11,14,15,9,13,14,12,14,2,2,2,2,13,13,12,15,generated,-
Iron Ones,11,Moritz Wagner,-,AML,ST,30,GER,EU,HGC,No,Registered,69,69,Right,179,69,13,12,15,14,9,7,5,9,10,12,8,11,10,10,16,14,10,15,2,2,2,2,13,14,15,14,generated,-
Iron Ones,7,Joost Van Leeuwen,-,AMR,-,24,NED,EU,Non-HG,No,Registered,65,72,Left,180,74,11,11,13,15,10,5,7,7,10,10,9,10,10,8,15,12,10,14,2,2,2,2,13,13,14,13,generated,-
Iron Ones,9,Elias Herrmann,-,ST,AML,24,GER,EU,HGC,No,Registered,68,75,Right,188,87,14,11,12,13,8,3,6,12,11,12,6,12,12,8,17,13,12,13,2,2,2,2,13,15,11,12,generated,-
Iron Ones,13,Leon Hofer,-,GK,-,24,AUT,EU,Non-HG,No,Registered,62,65,Right,182,79,2,9,4,7,2,3,3,4,11,12,14,9,13,9,8,10,12,12,10,13,14,12,13,2,2,13,generated,-
Iron Ones,23,Kelechi Chukwuma,-,DL,-,24,NGA,Non-EU,Non-HG,No,Registered,61,66,Left,180,76,7,11,14,10,10,11,10,9,9,11,13,12,11,8,15,13,11,12,2,2,2,2,13,12,9,12,generated,-
Iron Ones,15,Christian Stein,-,DC,DM/DR,30,SUI,Non-EU,Non-HG,No,Registered,62,62,Left,190,86,3,12,6,10,6,12,12,15,8,10,13,12,11,11,10,10,15,9,2,2,2,2,12,5,6,11,generated,-
Iron Ones,24,Sebastian Lewandowicz,-,DC,-,30,POL,EU,Non-HG,No,Registered,64,64,Right,190,90,5,10,11,13,6,12,14,12,8,14,12,12,13,11,14,10,13,9,2,2,2,2,12,6,5,13,generated,-
Iron Ones,22,Maximilian Richter,-,DR,DC,22,GER,EU,HGC,No,Registered,65,72,Right,184,76,6,14,15,11,13,12,12,9,12,13,12,15,12,10,12,12,11,14,2,2,2,2,14,11,11,16,generated,-
Iron Ones,14,Marvin Herrmann,-,DM,DC,32,GER,EU,HGC,No,Registered,62,62,Left,182,74,7,15,12,14,7,16,9,9,11,13,10,12,10,12,12,11,11,11,2,2,2,2,13,9,11,12,generated,-
Iron Ones,16,Jan Weber,-,MC,DM,31,GER,EU,HGC,No,Registered,66,66,Right,181,73,10,13,12,14,10,11,9,9,14,15,12,13,13,10,10,13,10,14,2,2,2,2,14,11,10,13,generated,-
Iron Ones,17,Nikos Dimitriou,-,AMC,AML,28,GRE,EU,Non-HG,No,Registered,62,65,Right,175,72,11,13,13,14,11,8,7,9,14,11,8,12,11,9,12,13,12,12,2,2,2,2,11,12,11,13,generated,-
Iron Ones,21,Unai Almeida,-,AML,ST,25,ESP,EU,Non-HG,No,Registered,65,65,Left,181,76,12,12,13,11,15,6,5,7,15,10,5,12,15,9,14,13,10,15,2,2,2,2,11,9,13,11,generated,-
Iron Ones,19,Mikkel Kristiansen,-,AMR,-,28,DEN,EU,Non-HG,No,Registered,67,68,Either,181,78,10,11,13,15,14,6,6,10,13,8,6,13,13,8,14,10,11,14,2,2,2,2,12,12,15,12,generated,-
Iron Ones,30,Fabian Roth,-,ST,AMR,21,GER,EU,Non-HG,Yes,U21 Exempt,61,73,Left,185,92,14,10,12,12,8,4,2,11,10,10,4,12,11,9,12,12,12,12,2,2,2,2,13,13,11,13,generated,-
Iron Ones,25,Robin Weber,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,61,77,Left,192,95,2,9,6,9,2,3,3,4,7,12,13,9,11,9,6,9,10,12,12,14,12,11,12,2,2,13,generated,-
Iron Ones,31,Niklas Kessler,-,MC,-,17,GER,EU,HGN,Yes,U21 Exempt,62,75,Right,174,78,9,12,12,13,10,13,11,8,9,12,11,14,13,10,13,14,9,14,2,2,2,2,13,13,10,13,generated,-
Iron Ones,32,Jannik Haas,-,ST,-,17,GER,EU,HGC,Yes,U21 Exempt,62,77,Right,182,78,13,11,12,12,8,6,3,11,11,12,5,12,12,10,14,12,12,13,2,2,2,2,11,13,10,13,generated,-
```

### Royal Blues (FC Schalke 04)
**Reputation:** 71 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Royal Blues,1,Dennis Sauer,-,GK,-,34,GER,EU,HGC,No,Registered,69,69,Right,187,83,2,11,4,8,2,3,3,4,12,15,13,9,12,10,9,8,12,12,14,15,15,13,14,2,2,10,generated,capped by band
Royal Blues,3,Petar Lazić,-,DL,DC,28,SRB,Non-EU,Non-HG,No,Registered,64,66,Left,191,87,5,13,11,11,12,13,11,11,10,13,13,13,14,9,14,14,13,12,2,2,2,2,13,12,10,12,generated,-
Royal Blues,4,Mathis Baudry,-,DC,-,30,FRA,EU,Non-HG,No,Registered,67,67,Right,194,91,4,11,10,11,7,13,13,13,10,14,13,12,14,11,14,12,14,9,2,2,2,2,13,5,6,14,generated,-
Royal Blues,5,Emil Dalsgaard,-,DC,-,25,DEN,EU,Non-HG,No,Registered,68,68,Right,193,94,5,12,9,11,4,17,14,13,11,14,13,14,11,13,12,11,14,10,2,2,2,2,12,5,4,13,generated,-
Royal Blues,2,Thomas Holm,-,DR,MR,26,DEN,EU,Non-HG,No,Registered,67,69,Right,178,73,6,12,13,11,10,14,14,10,11,14,15,12,8,11,15,15,12,15,2,2,2,2,13,13,11,13,generated,-
Royal Blues,6,Marcelo Albuquerque,-,DM,MC,32,BRA,Non-EU,Non-HG,No,Registered,69,69,Right,179,75,8,12,12,12,8,13,14,11,14,13,15,16,16,11,13,14,13,11,2,2,2,2,13,8,9,14,generated,capped by band
Royal Blues,8,Quinten Prins,-,MC,DM/AMC,24,NED,EU,Non-HG,No,Registered,65,72,Right,188,82,9,13,13,15,10,12,12,9,14,14,11,12,12,9,11,11,10,11,2,2,2,2,10,12,11,14,generated,-
Royal Blues,10,Jan Sauer,-,MC,AMC,22,GER,EU,HGC,No,Registered,68,73,Right,184,76,7,13,12,14,9,12,10,9,15,15,12,12,12,9,12,12,11,11,2,2,2,2,12,13,11,16,generated,-
Royal Blues,11,Idrissa Yattara,-,AML,-,32,CIV,Non-EU,Non-HG,No,Registered,69,69,Left,178,72,12,12,14,15,13,6,6,9,12,11,7,13,13,8,14,14,11,15,2,2,2,2,12,15,14,14,generated,capped by band
Royal Blues,7,Marcel Ostermann,-,AMR,-,35,GER,EU,HGN,No,Registered,67,67,Right,174,69,11,11,14,13,16,8,6,8,13,11,6,12,11,9,15,11,10,14,2,2,2,2,14,11,14,12,generated,-
Royal Blues,9,Mattia Mancini,-,ST,-,29,ITA,EU,Non-HG,No,Registered,69,69,Right,178,71,13,9,11,15,6,4,2,12,10,13,6,12,18,9,14,14,12,11,2,2,2,2,13,14,12,13,generated,capped by band
Royal Blues,13,Leonardo Fabbri,-,GK,-,21,ITA,EU,Non-HG,Yes,U21 Exempt,60,69,Right,190,89,2,10,3,8,2,3,3,4,11,13,12,8,12,9,8,10,11,11,14,10,12,11,12,2,2,11,generated,-
Royal Blues,23,Luuk Beekman,-,DL,ML,26,NED,EU,Non-HG,No,Registered,60,61,Right,176,75,4,12,12,10,12,12,13,10,10,12,11,11,12,7,13,12,10,12,2,2,2,2,12,11,9,12,generated,-
Royal Blues,15,Niklas Friedrich,-,DC,-,26,GER,EU,HGN,No,Registered,62,63,Right,181,73,4,10,7,11,5,11,14,12,10,12,12,10,12,9,12,10,14,9,2,2,2,2,13,6,6,12,generated,-
Royal Blues,24,Maximilian Lehmann,-,DC,DR,24,GER,EU,HGC,No,Registered,60,65,Right,180,80,5,10,8,10,6,13,12,13,7,10,14,12,10,8,10,13,12,11,2,2,2,2,11,4,5,10,generated,-
Royal Blues,22,Simon Segers,-,DR,-,22,BEL,EU,Non-HG,No,Registered,61,67,Right,185,80,7,12,11,10,11,13,11,10,10,10,14,11,10,10,13,14,12,11,2,2,2,2,11,10,9,12,generated,-
Royal Blues,14,Callum Weaver,-,DM,-,20,USA,Non-EU,Non-HG,Yes,U21 Exempt,62,72,Right,189,87,8,11,9,13,7,12,12,10,12,13,12,11,13,11,11,13,13,11,2,2,2,2,14,10,8,13,generated,-
Royal Blues,16,Leon Giesler,-,MC,AMC,27,SUI,Non-EU,Non-HG,No,Registered,60,60,Right,180,76,8,13,11,11,8,10,11,9,13,11,11,11,12,10,8,11,12,12,2,2,2,2,12,12,10,14,generated,-
Royal Blues,17,Dawid Růžička,-,AMC,-,32,CZE,EU,Non-HG,No,Registered,64,64,Right,183,79,13,12,12,14,11,9,7,9,13,12,10,13,12,11,10,12,12,13,2,2,2,2,13,13,14,11,generated,-
Royal Blues,30,Christian Baumann,-,AML,-,18,GER,EU,HGC,Yes,U21 Exempt,62,72,Left,189,80,10,10,13,12,10,5,5,6,11,12,6,13,13,9,15,11,10,13,2,2,2,2,9,12,11,10,generated,-
Royal Blues,19,Noah Schober,-,AMR,-,21,AUT,EU,Non-HG,Yes,U21 Exempt,67,75,Right,182,80,12,13,15,14,11,5,6,7,12,10,6,12,11,11,14,12,9,16,2,2,2,2,12,10,14,12,generated,-
Royal Blues,18,Brahim Bennani,-,ST,-,28,MAR,Non-EU,Non-HG,No,Registered,61,64,Left,187,84,12,9,11,12,7,6,7,11,10,11,5,13,12,8,14,12,11,11,2,2,2,2,11,14,10,12,generated,-
Royal Blues,25,Jonas Köhler,-,GK,-,20,GER,EU,HGC,Yes,U21 Exempt,61,68,Right,191,89,2,12,2,8,2,3,3,4,11,13,13,10,13,9,9,9,10,12,11,11,14,12,13,2,2,11,generated,-
Royal Blues,31,Sebastian Becker,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,62,77,Right,186,82,8,13,12,13,9,12,8,8,14,11,10,13,13,10,12,12,10,10,2,2,2,2,11,10,9,13,generated,-
Royal Blues,32,Daniel Stein,-,ST,-,19,GER,EU,HGN,Yes,U21 Exempt,60,70,Right,186,81,13,9,12,11,8,9,4,13,10,12,5,12,10,8,12,11,14,11,2,2,2,2,11,12,11,11,generated,-
```

### Red Shorts (Hamburger SV)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Red Shorts,1,Domagoj Horvat,-,GK,-,27,CRO,EU,Non-HG,No,Registered,67,70,Right,186,77,2,10,3,9,2,3,3,4,10,13,14,10,13,10,8,10,13,12,14,12,13,16,13,2,2,11,generated,-
Red Shorts,3,Daniel Moraes,-,DL,ML,27,BRA,Non-EU,Non-HG,No,Registered,67,67,Left,183,78,8,13,13,13,15,14,13,10,12,13,12,13,14,9,14,14,15,14,2,2,2,2,13,12,10,13,generated,-
Red Shorts,4,Gábor Oláh,-,DC,DL,30,HUN,EU,Non-HG,No,Registered,68,68,Right,183,80,6,11,8,10,7,14,14,15,8,10,15,13,11,13,11,11,15,12,2,2,2,2,14,8,5,11,generated,-
Red Shorts,5,Oskar Veselý,-,DC,-,26,CZE,EU,Non-HG,No,Registered,68,71,Right,188,84,4,10,10,14,7,15,13,15,9,12,12,13,13,12,12,11,16,11,2,2,2,2,14,6,5,13,generated,-
Red Shorts,2,Bruno Nikolić,-,DR,MR,26,BIH,Non-EU,Non-HG,No,Registered,68,70,Left,187,87,7,14,13,12,12,14,14,11,11,11,13,13,12,10,15,14,11,13,2,2,2,2,14,12,10,14,generated,-
Red Shorts,6,Luuk Smit,-,DM,DC,30,NED,EU,Non-HG,No,Registered,69,69,Right,176,73,8,12,12,15,9,13,12,9,13,15,14,16,13,11,11,13,14,12,2,2,2,2,14,8,8,14,generated,capped by band
Red Shorts,8,Akın Turan,-,MC,-,28,TUR,Non-EU,Non-HG,No,Registered,69,72,Right,179,68,12,16,12,14,9,13,12,8,12,13,12,12,13,11,12,12,11,13,2,2,2,2,13,13,12,17,generated,capped by band
Red Shorts,10,Csaba Takács,-,MC,DM,28,HUN,EU,Non-HG,No,Registered,69,70,Either,173,70,9,14,12,13,9,14,11,9,13,14,13,15,14,10,12,15,11,12,2,2,2,2,14,13,14,13,generated,capped by band
Red Shorts,11,Jonas Sauer,-,AML,-,26,GER,EU,HGC,No,Registered,68,69,Left,175,71,13,14,15,14,12,7,6,8,13,13,6,11,13,9,15,13,11,14,2,2,2,2,14,12,13,14,generated,-
Red Shorts,7,Tobias Neumann,-,AMR,-,28,GER,EU,HGC,No,Registered,69,72,Right,178,73,11,13,15,13,15,8,5,8,15,13,6,13,15,8,15,12,9,14,2,2,2,2,13,12,13,12,generated,capped by band
Red Shorts,9,Valentin Herrmann,-,ST,-,28,GER,EU,HGN,No,Registered,64,67,Right,176,77,12,10,13,11,8,5,6,14,10,12,8,13,14,11,14,12,13,10,2,2,2,2,12,13,12,10,generated,-
Red Shorts,13,Elias Öberg,-,GK,-,22,SWE,EU,Non-HG,No,Registered,64,71,Right,187,80,2,12,3,10,2,3,3,4,9,10,11,8,15,8,7,9,13,13,15,12,13,13,12,2,2,9,generated,-
Red Shorts,23,Marin Jovanović,-,DL,-,25,SRB,Non-EU,Non-HG,No,Registered,64,67,Left,185,80,5,12,12,14,13,14,11,10,10,12,14,12,11,10,14,14,11,12,2,2,2,2,11,12,9,12,generated,-
Red Shorts,30,Moritz Schreiber,-,DC,-,20,GER,EU,HGN,Yes,U21 Exempt,63,69,Right,190,83,4,9,9,10,5,13,13,12,8,10,12,12,12,11,11,12,16,11,2,2,2,2,13,7,5,12,generated,-
Red Shorts,15,Samuele Moretti,-,DC,-,19,ITA,EU,Non-HG,Yes,U21 Exempt,63,78,Right,185,78,3,9,9,9,6,12,13,13,9,11,13,11,11,9,11,11,15,11,2,2,2,2,13,5,4,12,generated,-
Red Shorts,22,Emanuele Caputo,-,DR,-,25,ITA,EU,Non-HG,No,Registered,64,67,Right,184,82,6,12,12,11,12,13,14,8,12,10,13,12,14,11,13,14,12,11,2,2,2,2,12,10,11,13,generated,-
Red Shorts,14,Valentin Wagner,-,DM,-,23,GER,EU,HGC,No,Registered,60,65,Right,190,90,8,11,12,11,8,12,12,10,13,11,11,13,11,9,10,9,13,9,2,2,2,2,14,8,9,13,generated,-
Red Shorts,16,Tal Dahan,-,MC,DM,21,ISR,Non-EU,Non-HG,Yes,U21 Exempt,62,70,Right,185,78,8,13,13,11,8,11,11,9,13,14,9,12,12,10,12,12,9,11,2,2,2,2,12,12,11,13,generated,-
Red Shorts,17,Elias Sauer,-,AMC,AMR,29,GER,EU,HGC,No,Registered,64,64,Right,179,72,13,12,13,14,10,8,6,9,14,11,10,11,11,10,12,13,11,11,2,2,2,2,11,12,14,14,generated,-
Red Shorts,21,Charlie Bennett,-,AML,ML/AMC,30,USA,Non-EU,Non-HG,No,Registered,67,67,Left,180,74,13,12,14,13,10,7,4,7,11,13,7,11,11,8,14,14,10,16,2,2,2,2,11,15,13,12,generated,-
Red Shorts,19,Patrick Pohl,-,AMR,-,28,GER,EU,HGC,No,Registered,66,69,Right,180,79,11,11,14,13,10,3,6,5,10,10,6,14,10,9,14,12,10,15,2,2,2,2,10,15,15,13,generated,-
Red Shorts,18,Noah Wouters,-,ST,-,24,BEL,EU,Non-HG,No,Registered,63,67,Right,176,68,13,11,13,14,8,6,2,13,9,11,8,12,12,8,12,12,12,12,2,2,2,2,12,13,14,12,generated,-
Red Shorts,25,David Gärtner,-,GK,-,17,GER,EU,HGC,Yes,U21 Exempt,62,71,Right,191,88,2,9,1,9,2,3,3,4,11,14,11,10,14,12,8,8,8,13,12,12,11,14,14,2,2,11,generated,-
Red Shorts,31,Moritz Ziegler,-,MC,AMC,19,GER,EU,HGC,Yes,U21 Exempt,60,74,Right,182,72,8,10,12,13,8,11,9,7,12,15,9,11,11,10,11,11,11,12,2,2,2,2,12,11,9,14,generated,-
Red Shorts,32,Jonas Herrmann,-,ST,-,21,GER,EU,HGN,Yes,U21 Exempt,60,68,Right,192,89,12,9,12,10,5,6,3,13,11,12,7,10,11,11,12,12,13,10,2,2,2,2,12,13,9,13,generated,-
```

### Billy Goats (1. FC Köln)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Billy Goats,1,Tom Hartmann,-,GK,-,31,GER,EU,HGN,No,Registered,65,65,Left,187,83,2,11,3,11,2,3,3,4,8,13,13,10,13,10,7,10,13,11,13,14,13,13,12,2,2,12,generated,-
Billy Goats,3,Lukas Bergmann,-,DL,WBL,25,GER,EU,Non-HG,No,Registered,64,64,Left,188,80,8,14,13,10,14,13,12,11,12,12,11,14,11,8,13,13,12,13,2,2,2,2,12,11,8,14,generated,-
Billy Goats,4,Julian Lehmann,-,DC,-,21,GER,EU,HGC,Yes,U21 Exempt,69,76,Either,179,74,5,12,7,11,7,15,14,14,10,13,14,14,13,12,13,13,13,10,2,2,2,2,13,5,7,13,generated,capped by band
Billy Goats,5,Simon Winther,-,DC,DR/DL,32,DEN,EU,Non-HG,No,Registered,69,69,Right,189,84,4,15,11,11,6,14,14,15,9,12,15,14,12,12,12,14,15,13,2,2,2,2,13,6,7,13,generated,capped by band
Billy Goats,2,Uroš Jovanović,-,DR,-,32,BIH,Non-EU,Non-HG,No,Registered,69,69,Left,184,79,7,15,16,13,11,13,13,10,12,13,13,16,11,11,12,16,10,13,2,2,2,2,15,11,13,15,generated,capped by band
Billy Goats,6,Bram Beekman,-,DM,-,30,NED,EU,Non-HG,No,Registered,69,69,Right,183,77,6,13,12,13,9,15,11,10,13,13,14,15,14,12,10,12,10,12,2,2,2,2,15,8,10,17,generated,capped by band
Billy Goats,8,Lazar Lazić,-,MC,-,25,SRB,Non-EU,Non-HG,No,Registered,68,68,Right,186,83,7,14,15,13,10,13,10,10,15,14,11,12,13,10,13,12,12,13,2,2,2,2,13,13,11,15,generated,-
Billy Goats,10,Charlie Nash,-,MC,-,27,USA,Non-EU,Non-HG,No,Registered,66,67,Right,184,82,9,13,13,13,10,13,10,9,14,14,9,13,12,10,10,13,11,13,2,2,2,2,13,13,11,14,generated,-
Billy Goats,11,Tomasz Pawlak,-,AML,-,27,POL,EU,Non-HG,No,Registered,69,72,Left,179,81,14,11,14,14,11,6,6,8,12,10,6,13,12,11,15,13,11,15,2,2,2,2,11,14,14,10,generated,capped by band
Billy Goats,7,Damien Colin,-,AMR,-,22,FRA,EU,Non-HG,No,Registered,67,70,Right,179,73,10,13,14,13,17,8,5,8,13,10,5,11,12,9,14,12,12,16,2,2,2,2,11,13,13,12,generated,-
Billy Goats,9,Jannik Aigner,-,ST,-,22,AUT,EU,HGN,No,Registered,67,72,Right,187,78,15,12,12,15,7,4,3,12,9,12,5,13,12,8,14,13,12,13,2,2,2,2,12,14,13,13,generated,-
Billy Goats,13,Sam Fisher,-,GK,-,25,USA,Non-EU,Non-HG,No,Registered,66,68,Right,192,85,2,8,4,10,2,3,3,4,11,13,12,8,14,11,5,10,11,11,15,14,13,13,12,2,2,12,generated,-
Billy Goats,23,Elias Vogel,-,DL,-,24,GER,EU,HGC,No,Registered,62,66,Left,177,70,6,12,12,12,10,14,12,11,9,11,13,12,13,10,12,15,12,12,2,2,2,2,12,10,11,12,generated,-
Billy Goats,15,Lars Pichler,-,DC,-,25,AUT,EU,Non-HG,No,Registered,62,64,Right,191,91,7,10,8,11,6,13,11,12,7,13,13,13,11,11,12,11,13,11,2,2,2,2,13,9,6,11,generated,-
Billy Goats,24,Kieran Pemberton,-,DC,-,28,ENG,Non-EU,Non-HG,No,Registered,65,66,Left,189,82,3,10,9,11,7,15,14,12,8,12,14,13,12,11,10,12,13,11,2,2,2,2,11,5,5,13,generated,-
Billy Goats,22,Ivo Marín,-,DR,-,26,ESP,EU,Non-HG,No,Registered,65,66,Right,181,78,5,14,14,10,11,13,11,9,9,13,12,15,14,9,14,13,11,10,2,2,2,2,14,10,11,15,generated,-
Billy Goats,30,Kai Ziegler,-,DM,MC,18,GER,EU,HGN,Yes,U21 Exempt,63,75,Right,191,84,8,12,13,12,7,13,10,10,11,13,13,14,12,9,11,10,11,11,2,2,2,2,14,9,8,14,generated,-
Billy Goats,14,Marvin Ostermann,-,MC,-,19,GER,EU,Non-HG,Yes,U21 Exempt,64,80,Right,183,77,9,13,13,13,10,13,10,9,13,13,13,14,14,12,11,13,12,12,2,2,2,2,11,12,13,12,generated,-
Billy Goats,17,Mahamadou Sow,-,AMC,-,24,CIV,Non-EU,Non-HG,No,Registered,60,66,Left,177,72,11,11,13,11,8,8,7,9,13,12,9,11,12,8,12,11,11,12,2,2,2,2,12,12,13,11,generated,-
Billy Goats,21,Hugo Carpentier,-,AML,-,32,FRA,EU,Non-HG,No,Registered,62,62,Left,182,80,11,12,14,10,10,5,6,6,10,11,6,11,10,8,15,12,10,14,2,2,2,2,10,13,12,11,generated,-
Billy Goats,19,Piotr Zeman,-,AMR,-,21,CZE,EU,Non-HG,Yes,U21 Exempt,66,75,Right,173,71,11,12,14,13,15,6,6,8,15,13,6,11,14,7,13,14,10,15,2,2,2,2,11,10,13,13,generated,-
Billy Goats,18,Maximilian Reuter,-,ST,AMC,24,GER,EU,HGN,No,Registered,61,66,Right,186,83,12,11,12,12,5,6,5,11,10,12,9,13,14,8,12,10,11,11,2,2,2,2,12,13,10,13,generated,-
Billy Goats,25,Tim Sauer,-,GK,-,19,GER,EU,Non-HG,Yes,U21 Exempt,62,73,Right,191,88,2,8,4,8,2,3,3,4,10,13,12,9,13,10,8,9,12,12,11,13,13,13,13,2,2,12,generated,-
Billy Goats,31,Valentin Brandt,-,MC,AMC,18,GER,EU,HGC,Yes,U21 Exempt,61,75,Right,176,72,9,14,11,12,9,10,12,12,13,10,11,12,12,10,9,11,11,13,2,2,2,2,12,10,9,15,generated,-
Billy Goats,32,Jannik Engel,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,60,71,Right,181,73,13,9,12,11,7,6,5,12,10,12,8,11,11,10,10,10,13,9,2,2,2,2,12,13,9,12,generated,-
```

### Fuggerstädter (FC Augsburg)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Fuggerstädter,1,Sebastian Schober,-,GK,-,34,AUT,EU,Non-HG,No,Registered,66,66,Either,192,90,2,10,1,8,2,3,3,4,10,13,13,10,13,8,8,10,12,13,14,12,15,12,13,2,2,13,generated,-
Fuggerstädter,3,Yaw Asante,-,DL,-,25,GHA,Non-EU,Non-HG,No,Registered,66,66,Left,189,85,8,14,14,12,10,13,14,10,12,12,14,14,13,9,13,13,13,11,2,2,2,2,14,10,10,13,generated,-
Fuggerstädter,4,Paweł Hájek,-,DC,DL,23,CZE,EU,HGN,No,Registered,65,71,Left,184,80,3,13,7,12,6,12,13,12,6,13,13,12,11,12,10,12,16,11,2,2,2,2,15,7,5,13,generated,-
Fuggerstädter,5,Rafael Medeiros,-,DC,-,28,BRA,Non-EU,Non-HG,No,Registered,67,68,Right,187,85,6,12,9,12,6,14,11,12,8,12,17,13,12,11,12,13,15,9,2,2,2,2,14,7,5,12,generated,capped by band
Fuggerstädter,2,Fabian Kessler,-,DR,-,24,GER,EU,HGC,No,Registered,65,72,Right,182,77,6,12,11,12,14,13,13,9,10,11,13,12,12,10,14,14,12,13,2,2,2,2,12,11,10,13,generated,-
Fuggerstädter,6,Lars Dumont,-,DM,DC/MC,29,BEL,EU,Non-HG,No,Registered,66,66,Either,175,71,8,12,10,14,8,13,13,10,13,13,14,14,12,14,11,12,13,10,2,2,2,2,14,9,9,14,generated,-
Fuggerstädter,8,Marvin Seidel,-,MC,AMC/DM,31,GER,EU,HGC,No,Registered,65,65,Right,177,71,9,13,11,14,9,12,10,11,12,13,10,14,12,10,10,13,10,12,2,2,2,2,13,11,11,14,generated,-
Fuggerstädter,10,Marcel Vogel,-,MC,DM,28,GER,EU,HGC,No,Registered,64,66,Right,176,68,9,14,12,11,9,10,10,7,14,12,12,13,14,9,13,13,10,12,2,2,2,2,15,12,9,13,generated,-
Fuggerstädter,11,Lukas Gärtner,-,AML,-,26,GER,EU,HGN,No,Registered,64,64,Right,171,68,12,11,13,14,13,7,5,8,10,13,6,13,12,9,14,13,9,13,2,2,2,2,11,12,12,13,generated,-
Fuggerstädter,7,Caio Pacheco,-,AMR,ST/AMC,26,BRA,Non-EU,Non-HG,No,Registered,67,67,Either,184,83,10,11,16,14,10,6,6,7,10,12,6,15,11,8,13,12,10,14,2,2,2,2,11,17,14,12,generated,capped by band
Fuggerstädter,9,Tom Kessler,-,ST,AML,21,GER,EU,HGN,Yes,U21 Exempt,65,73,Right,184,87,15,12,12,12,7,6,5,11,7,12,7,13,11,8,14,13,11,12,2,2,2,2,12,15,13,13,generated,-
Fuggerstädter,13,Christian Holmgren,-,GK,-,26,SWE,EU,Non-HG,No,Registered,60,62,Right,191,90,2,11,6,7,2,3,3,4,8,12,13,10,12,11,8,8,9,12,11,14,12,11,11,2,2,12,generated,-
Fuggerstädter,23,Drissa Kaba,-,DL,-,24,CIV,Non-EU,Non-HG,No,Registered,64,69,Left,185,82,6,13,12,11,13,14,14,9,10,12,10,13,11,7,15,12,11,11,2,2,2,2,12,13,11,13,generated,-
Fuggerstädter,15,Charalampos Kalogeros,-,DC,-,22,GRE,EU,Non-HG,No,Registered,61,65,Right,180,82,3,10,9,11,5,14,12,13,10,11,13,13,11,12,11,10,12,11,2,2,2,2,11,4,7,11,generated,-
Fuggerstädter,24,Uroš Marković,-,DC,DL/DR,27,BIH,Non-EU,Non-HG,No,Registered,62,65,Left,191,89,4,11,10,9,6,12,13,14,7,11,12,13,11,9,11,13,13,10,2,2,2,2,14,6,6,11,generated,-
Fuggerstädter,22,Corentin Leclerc,-,DR,DC,25,FRA,EU,Non-HG,No,Registered,60,62,Right,181,79,6,12,12,11,10,12,12,8,10,11,11,13,10,9,14,14,9,15,2,2,2,2,11,9,9,11,generated,-
Fuggerstädter,14,Burak Turan,-,DM,MC/DC,29,TUR,Non-EU,Non-HG,No,Registered,59,59,Right,185,76,6,13,11,11,8,11,12,12,11,11,12,14,10,12,10,12,11,11,2,2,2,2,11,7,7,12,generated,-
Fuggerstädter,16,Nikolaj Dalsgaard,-,MC,DM,22,DEN,EU,Non-HG,No,Registered,64,69,Right,179,76,7,13,12,12,9,12,10,9,12,14,13,13,12,11,10,12,12,13,2,2,2,2,13,12,11,14,generated,-
Fuggerstädter,17,Kai Gärtner,-,AMC,MC,26,GER,EU,HGC,No,Registered,60,62,Right,182,76,11,12,13,14,10,9,7,9,13,9,7,14,9,11,7,11,12,10,2,2,2,2,12,10,14,12,generated,-
Fuggerstädter,21,Sebastian Albrecht,-,AML,ST,29,GER,EU,HGN,No,Registered,58,58,Left,168,62,12,11,12,12,9,7,4,7,9,11,5,11,9,8,13,13,9,12,2,2,2,2,13,12,12,11,generated,-
Fuggerstädter,30,Christian Roth,-,AMR,MR,20,GER,EU,Non-HG,Yes,U21 Exempt,58,67,Right,175,75,10,10,13,10,10,5,5,6,10,10,6,10,13,6,14,10,10,11,2,2,2,2,10,11,12,12,generated,-
Fuggerstädter,19,Magnus Thomsen,-,ST,-,29,DEN,EU,Non-HG,No,Registered,64,64,Left,183,83,13,10,10,14,7,5,4,12,9,13,7,11,14,8,13,11,12,12,2,2,2,2,12,13,11,12,generated,-
Fuggerstädter,25,Leon Lang,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,60,72,Right,191,90,2,10,4,10,2,3,3,4,8,12,12,9,11,9,9,8,10,12,12,12,13,12,12,2,2,9,generated,-
Fuggerstädter,31,Maximilian Bergmann,-,MC,-,20,GER,EU,HGC,Yes,U21 Exempt,58,68,Right,182,84,8,9,11,14,9,11,10,8,13,10,12,12,13,9,12,12,11,12,2,2,2,2,13,10,10,13,generated,-
Fuggerstädter,32,Jan Jäger,-,ST,-,21,GER,EU,HGC,Yes,U21 Exempt,61,72,Left,185,76,13,9,12,11,6,5,4,12,11,12,7,12,12,7,12,12,12,12,2,2,2,2,13,13,10,13,generated,-
```

### Paderborn Blue-Blacks (SC Paderborn 07)
**Reputation:** 58 | **CA Band:** 52–61 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Paderborn Blue-Blacks,1,Oğuz Uçar,-,GK,-,26,TUR,Non-EU,Non-HG,No,Registered,58,58,Left,188,85,2,11,5,8,2,3,3,4,9,11,12,8,11,10,7,9,11,11,13,10,12,11,12,2,2,11,generated,-
Paderborn Blue-Blacks,3,Ren Mori,-,DL,DC,26,JPN,Non-EU,Non-HG,No,Registered,59,62,Left,186,85,3,12,12,11,11,12,12,11,9,13,12,11,10,7,12,13,11,9,2,2,2,2,11,12,10,12,generated,-
Paderborn Blue-Blacks,4,Kai Pohl,-,DC,DR,28,SUI,Non-EU,Non-HG,No,Registered,59,60,Right,184,81,4,11,6,11,6,12,12,13,9,9,15,10,9,10,9,10,11,11,2,2,2,2,12,4,3,10,generated,-
Paderborn Blue-Blacks,5,Tomás Olmedo,-,DC,-,24,ESP,EU,Non-HG,No,Registered,60,66,Right,183,80,3,11,7,12,6,12,13,11,9,13,11,13,12,10,13,12,12,9,2,2,2,2,11,5,5,13,generated,-
Paderborn Blue-Blacks,2,Dennis Richter,-,DR,-,28,GER,EU,HGN,No,Registered,60,61,Right,183,84,7,13,13,12,12,11,12,8,8,11,11,13,9,10,13,11,11,12,2,2,2,2,12,11,9,12,generated,-
Paderborn Blue-Blacks,6,Felix Lehmann,-,DM,DC,31,GER,EU,HGC,No,Registered,56,56,Right,176,70,8,11,10,9,7,10,10,9,11,12,11,11,11,10,11,10,10,11,2,2,2,2,12,8,7,14,generated,-
Paderborn Blue-Blacks,8,Dennis Giesler,-,MC,-,27,GER,EU,HGN,No,Registered,59,62,Right,182,72,9,10,12,13,10,12,11,7,12,13,10,11,12,9,11,11,12,11,2,2,2,2,11,11,10,14,generated,-
Paderborn Blue-Blacks,10,Josh Bennett,-,MC,DM,27,AUS,Non-EU,Non-HG,No,Registered,59,61,Right,176,62,9,10,13,14,9,11,9,6,12,13,9,11,11,10,11,11,10,11,2,2,2,2,11,11,10,14,generated,-
Paderborn Blue-Blacks,11,Gaëtan Sauvage,-,AML,-,30,FRA,EU,Non-HG,No,Registered,61,61,Left,172,76,10,13,12,11,13,4,6,9,13,12,6,11,12,7,14,11,11,12,2,2,2,2,11,11,13,10,generated,capped by band
Paderborn Blue-Blacks,7,Felix Ehrlich,-,AMR,ST,30,GER,EU,Non-HG,No,Registered,61,61,Right,181,81,11,11,12,14,10,5,6,9,10,10,8,10,10,8,13,11,9,13,2,2,2,2,12,12,14,12,generated,capped by band
Paderborn Blue-Blacks,9,Ryota Mori,-,ST,AMR/AMC,29,JPN,Non-EU,Non-HG,No,Registered,61,61,Either,191,84,13,9,11,12,8,3,4,11,11,11,7,10,13,9,13,10,11,11,2,2,2,2,11,13,11,12,generated,capped by band
Paderborn Blue-Blacks,13,Rodrigo Rezende,-,GK,-,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,54,64,Right,196,93,2,7,3,7,2,3,3,4,9,9,13,8,10,8,9,7,10,9,12,11,11,9,9,2,2,9,generated,-
Paderborn Blue-Blacks,23,Pascal Lehmann,-,DL,ML,20,GER,EU,HGC,Yes,U21 Exempt,54,65,Left,185,83,7,9,9,10,13,12,9,9,9,9,12,9,11,8,12,11,11,9,2,2,2,2,10,12,8,10,generated,-
Paderborn Blue-Blacks,15,Elias Stein,-,DC,-,24,GER,EU,HGC,No,Registered,55,57,Left,191,91,5,11,8,9,4,11,11,12,10,10,12,10,10,10,10,10,12,11,2,2,2,2,10,6,4,10,generated,-
Paderborn Blue-Blacks,24,Simon Holm,-,DC,DR/DL,22,DEN,EU,Non-HG,No,Registered,54,61,Left,187,85,4,9,6,11,6,11,12,11,10,9,12,11,10,8,9,10,11,10,2,2,2,2,10,5,7,10,generated,-
Paderborn Blue-Blacks,22,Benedikt Fuchs,-,DR,-,27,AUT,EU,Non-HG,No,Registered,53,54,Right,176,72,6,10,11,11,10,10,10,7,10,9,10,13,11,9,11,10,9,8,2,2,2,2,11,10,9,12,generated,-
Paderborn Blue-Blacks,14,Pascal Hofer,-,DM,DC/MC,29,AUT,EU,Non-HG,No,Registered,52,52,Right,182,78,7,9,9,9,8,10,11,8,11,11,10,10,9,11,9,12,12,9,2,2,2,2,10,10,9,10,generated,-
Paderborn Blue-Blacks,16,Fabian Scholz,-,MC,AMC/DM,24,GER,EU,HGC,No,Registered,54,57,Right,177,69,9,9,12,13,10,10,8,7,12,10,10,10,10,9,8,10,8,9,2,2,2,2,10,10,10,14,generated,-
Paderborn Blue-Blacks,17,David Winkler,-,AMC,-,19,GER,EU,Non-HG,Yes,U21 Exempt,54,70,Right,176,71,9,11,10,10,12,8,8,7,12,11,11,12,11,10,10,11,8,11,2,2,2,2,11,12,12,10,generated,-
Paderborn Blue-Blacks,30,Leon Dietrich,-,AML,-,18,GER,EU,HGC,Yes,U21 Exempt,55,68,Left,186,82,7,9,13,12,9,6,7,8,11,10,7,12,12,6,11,9,10,13,2,2,2,2,9,11,10,10,generated,-
Paderborn Blue-Blacks,19,Jan Baran,-,AMR,-,24,POL,EU,Non-HG,No,Registered,57,59,Right,181,81,9,10,13,13,8,6,5,6,8,10,5,10,9,7,12,11,8,13,2,2,2,2,10,12,12,12,generated,-
Paderborn Blue-Blacks,18,Jonas Vermeulen,-,ST,AML/AMR,21,BEL,EU,Non-HG,Yes,U21 Exempt,54,59,Right,187,84,11,10,11,11,6,6,3,10,10,11,3,12,11,8,11,10,10,12,2,2,2,2,11,11,7,10,generated,-
Paderborn Blue-Blacks,25,Lukas Krause,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,54,68,Right,187,81,2,10,5,8,2,3,3,4,8,10,12,6,11,8,8,9,9,11,9,12,12,10,11,2,2,10,generated,-
Paderborn Blue-Blacks,31,Felix Herrmann,-,MC,-,18,GER,EU,HGN,Yes,U21 Exempt,55,68,Right,178,77,7,11,9,13,10,9,7,9,13,12,8,9,9,7,8,9,10,9,2,2,2,2,9,10,11,12,generated,-
Paderborn Blue-Blacks,32,Maximilian Ostermann,-,ST,-,18,GER,EU,Non-HG,Yes,U21 Exempt,54,69,Right,184,75,11,9,12,11,7,6,5,14,8,10,7,10,10,8,10,8,10,10,2,2,2,2,11,11,11,10,generated,-
```

### Elversberg Village Club (SV 07 Elversberg)
**Reputation:** 56 | **CA Band:** 50–59 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Elversberg Village Club,1,Kaan Uçar,-,GK,-,31,TUR,Non-EU,Non-HG,No,Registered,55,55,Right,192,93,2,9,3,8,2,3,3,4,9,11,13,7,11,10,6,7,9,12,10,11,10,11,12,2,2,12,generated,-
Elversberg Village Club,3,Oskar Majewski,-,DL,ML,28,POL,EU,Non-HG,No,Registered,55,57,Left,186,81,7,11,11,12,11,10,11,8,10,8,12,11,10,9,10,13,10,11,2,2,2,2,11,10,8,10,generated,-
Elversberg Village Club,4,Tom Reuter,-,DC,-,22,GER,EU,HGC,No,Registered,58,64,Right,186,73,4,7,10,11,5,13,12,11,9,9,13,10,9,10,9,11,13,8,2,2,2,2,12,6,4,9,generated,-
Elversberg Village Club,5,Ilyas Amrani,-,DC,DM,27,MAR,Non-EU,Non-HG,No,Registered,59,62,Right,191,87,4,9,9,8,6,14,11,14,8,9,14,10,9,12,8,9,12,10,2,2,2,2,11,5,5,9,generated,capped by band
Elversberg Village Club,2,Simon Köhler,-,DR,-,26,GER,EU,Non-HG,No,Registered,54,54,Right,180,77,7,11,11,11,11,10,11,8,9,10,11,12,9,8,11,11,12,11,2,2,2,2,10,8,9,11,generated,-
Elversberg Village Club,6,Yuta Shimizu,-,DM,MC/DC,26,JPN,Non-EU,Non-HG,No,Registered,58,61,Right,178,69,4,11,9,12,8,14,11,9,10,12,9,15,10,10,11,10,11,10,2,2,2,2,13,6,7,10,generated,-
Elversberg Village Club,8,Florian Engel,-,MC,-,25,GER,EU,Non-HG,No,Registered,55,55,Either,181,78,7,11,10,12,7,10,9,8,12,10,10,10,11,6,11,10,11,10,2,2,2,2,9,11,11,13,generated,-
Elversberg Village Club,10,Pascal Franke,-,MC,-,32,GER,EU,HGN,No,Registered,58,58,Right,181,79,9,12,12,10,9,11,10,9,11,11,10,12,11,10,9,12,10,11,2,2,2,2,11,11,9,14,generated,-
Elversberg Village Club,11,Valentin Poirier,-,AML,-,27,FRA,EU,Non-HG,No,Registered,58,61,Left,172,68,12,9,11,14,10,5,6,9,10,12,4,12,9,7,10,12,8,11,2,2,2,2,11,13,15,10,generated,-
Elversberg Village Club,7,Henri Wagner,-,AMR,ST,26,GER,EU,HGC,No,Registered,57,59,Right,175,67,11,12,12,8,14,6,4,5,13,10,6,11,13,9,11,10,9,13,2,2,2,2,10,11,10,12,generated,-
Elversberg Village Club,9,Hiroki Hasegawa,-,ST,-,31,JPN,Non-EU,Non-HG,No,Registered,59,59,Right,186,85,11,10,12,12,7,5,2,13,9,12,5,10,11,11,10,10,12,12,2,2,2,2,12,13,9,12,generated,capped by band
Elversberg Village Club,13,Domagoj Ilić,-,GK,-,26,BIH,Non-EU,Non-HG,No,Registered,53,56,Right,198,89,2,7,2,7,2,3,3,4,8,11,10,9,10,8,8,8,9,11,11,10,11,11,11,2,2,11,generated,-
Elversberg Village Club,23,Tom Millet,-,DL,WBL,19,FRA,EU,Non-HG,Yes,U21 Exempt,51,62,Left,178,69,6,10,9,11,11,10,10,9,10,10,11,9,11,7,11,11,10,8,2,2,2,2,9,9,9,10,generated,-
Elversberg Village Club,30,Benedikt Albrecht,-,DC,-,19,GER,EU,HGN,Yes,U21 Exempt,51,60,Right,199,102,5,9,6,9,4,12,10,11,6,8,12,10,9,11,9,9,9,8,2,2,2,2,9,5,6,9,generated,-
Elversberg Village Club,15,Philipp Ehrlich,-,DC,DL,26,GER,EU,HGN,No,Registered,54,57,Right,189,85,3,9,10,10,4,11,11,9,8,10,11,10,10,11,11,11,13,9,2,2,2,2,11,4,5,11,generated,-
Elversberg Village Club,22,Luka Petrović,-,DR,MR,31,CRO,EU,Non-HG,No,Registered,51,51,Left,178,73,7,9,10,9,11,10,10,8,9,8,11,10,10,8,11,10,11,9,2,2,2,2,9,9,11,11,generated,-
Elversberg Village Club,14,Julian Fuchs,-,DM,-,21,GER,EU,HGC,Yes,U21 Exempt,54,64,Left,183,85,8,10,8,10,4,10,9,10,9,12,11,13,11,7,10,9,9,10,2,2,2,2,13,10,8,11,generated,-
Elversberg Village Club,16,Dylan Morin,-,MC,-,25,FRA,EU,Non-HG,No,Registered,51,52,Left,177,70,8,9,11,11,7,10,10,9,11,10,9,10,10,8,9,10,9,10,2,2,2,2,10,10,9,12,generated,-
Elversberg Village Club,17,Florian Hartmann,-,AMC,-,29,GER,EU,HGN,No,Registered,50,50,Right,178,79,10,11,10,12,10,8,6,6,9,10,7,6,11,7,9,7,7,10,2,2,2,2,10,9,9,10,generated,-
Elversberg Village Club,21,Roko Obradović,-,AML,ST,22,BIH,Non-EU,Non-HG,No,Registered,50,56,Left,175,68,8,9,10,11,10,6,4,7,9,10,6,10,11,6,10,9,9,12,2,2,2,2,7,9,10,11,generated,-
Elversberg Village Club,19,Daniel Ziegler,-,AMR,-,26,GER,EU,HGC,No,Registered,50,50,Left,176,68,10,10,10,11,7,6,5,6,8,9,7,11,8,7,10,11,10,12,2,2,2,2,10,9,12,11,generated,-
Elversberg Village Club,18,Mathias Nyberg,-,ST,-,28,SWE,EU,Non-HG,No,Registered,50,50,Right,184,80,10,10,8,9,6,6,5,8,9,9,4,9,12,8,12,9,8,11,2,2,2,2,9,11,8,11,generated,-
Elversberg Village Club,25,Valentin Winkler,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,52,63,Left,189,85,2,8,3,8,2,3,3,4,8,10,10,7,10,12,6,7,9,10,13,10,9,9,10,2,2,9,generated,-
Elversberg Village Club,31,Tim Fischer,-,MC,-,21,GER,EU,HGC,Yes,U21 Exempt,51,63,Left,184,81,8,12,8,12,9,9,8,6,10,9,9,9,9,7,10,9,11,10,2,2,2,2,10,9,10,11,generated,-
Elversberg Village Club,32,Lars Dietrich,-,ST,-,18,GER,EU,HGN,Yes,U21 Exempt,51,66,Right,181,82,9,9,11,9,6,2,6,10,9,11,4,9,11,8,11,10,11,9,2,2,2,2,10,11,9,8,generated,-
```

## 4. Ligue 1

### Aiglons (OGC Nice)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Aiglons,1,Axel Gaillard,-,GK,-,33,FRA,EU,HGN,No,Registered,71,71,Right,190,94,2,12,2,10,2,3,3,4,10,14,14,9,14,11,8,10,12,14,16,14,13,13,15,2,2,13,generated,-
Aiglons,3,Nolan Hamon,-,DL,-,28,FRA,EU,Non-HG,No,Registered,73,74,Right,193,91,8,14,14,14,14,17,14,14,11,15,13,13,13,11,17,15,13,14,2,2,2,2,14,12,9,14,generated,-
Aiglons,4,Moussa Yattara,-,DC,DR,28,GUI,Non-EU,Non-HG,No,Registered,73,76,Left,186,78,4,13,8,12,8,13,15,17,10,15,15,14,15,11,15,15,14,13,2,2,2,2,13,5,3,14,generated,-
Aiglons,5,Alexis Barbier,-,DC,-,25,FRA,EU,HGN,No,Registered,74,77,Left,189,90,3,12,10,13,6,17,16,16,12,12,16,14,12,10,12,15,14,12,2,2,2,2,14,6,6,12,generated,capped by band
Aiglons,2,Valentin Marchand,-,DR,-,24,FRA,EU,Non-HG,No,Registered,72,75,Right,180,68,6,15,15,13,13,16,13,9,12,12,13,15,12,11,14,16,14,13,2,2,2,2,15,12,12,16,generated,-
Aiglons,6,Guilherme Leite,-,DM,-,23,POR,EU,Non-HG,No,Registered,74,81,Right,186,87,7,14,13,15,9,16,13,12,13,13,17,17,13,13,12,12,12,13,2,2,2,2,16,11,7,16,generated,capped by band
Aiglons,8,Łukasz Jabłoński,-,MC,DM,24,POL,EU,Non-HG,No,Registered,74,77,Right,184,80,10,16,16,14,11,14,12,10,14,14,14,14,14,11,13,14,12,14,2,2,2,2,14,14,13,17,generated,capped by band
Aiglons,10,Drissa Ndiaye,-,MC,AMC,29,MLI,Non-EU,Non-HG,No,Registered,71,71,Right,186,76,11,15,14,13,9,13,10,10,16,15,14,13,13,10,14,13,10,13,2,2,2,2,13,13,13,16,generated,-
Aiglons,11,Tibo Goossens,-,AML,AMC/ML,26,BEL,EU,Non-HG,No,Registered,69,72,Left,182,74,13,12,14,14,10,5,5,7,10,11,7,13,11,10,15,12,11,18,2,2,2,2,14,13,15,13,generated,-
Aiglons,7,Aymen Tazi,-,AMR,ST,30,MAR,Non-EU,Non-HG,No,Registered,74,74,Right,177,78,13,13,16,13,14,9,6,7,14,12,7,14,14,9,16,15,10,15,2,2,2,2,14,14,16,14,generated,capped by band
Aiglons,9,Maxime Tessier,-,ST,AMC,25,FRA,EU,HGC,No,Registered,71,73,Right,184,74,16,12,14,15,6,7,4,13,11,11,6,14,13,10,15,14,13,12,2,2,2,2,13,15,10,15,generated,-
Aiglons,13,Bastien Sauvage,-,GK,-,27,FRA,EU,HGN,No,Registered,66,68,Right,189,79,2,10,2,7,2,3,3,4,9,13,15,9,13,12,7,10,11,11,13,13,14,13,13,2,2,12,generated,-
Aiglons,23,Wout Claes,-,DL,-,22,BEL,EU,Non-HG,No,Registered,66,68,Left,184,78,5,11,12,14,13,13,13,14,10,12,14,14,13,9,14,14,10,13,2,2,2,2,14,10,10,13,generated,-
Aiglons,15,Abdelhak Naciri,-,DC,-,26,MAR,Non-EU,Non-HG,No,Registered,68,69,Right,194,91,6,11,9,13,6,15,14,15,8,11,14,15,11,12,11,13,13,11,2,2,2,2,15,5,3,12,generated,-
Aiglons,24,Maxime Goossens,-,DC,DR/DL,33,BEL,EU,Non-HG,No,Registered,65,65,Left,195,93,5,13,9,11,7,14,13,14,10,10,15,12,10,10,10,12,14,12,2,2,2,2,13,7,4,10,generated,-
Aiglons,22,Alessandro Monti,-,DR,-,27,ITA,EU,Non-HG,No,Registered,68,69,Right,182,76,6,13,12,11,11,14,13,10,11,14,15,13,12,12,16,14,11,11,2,2,2,2,14,9,13,14,generated,-
Aiglons,14,Pablo Cabrera,-,DM,DC,24,ESP,EU,Non-HG,No,Registered,65,71,Right,188,81,8,14,11,12,9,14,11,8,11,14,13,14,12,9,12,10,11,14,2,2,2,2,13,7,7,14,generated,-
Aiglons,16,Asger Christensen,-,MC,-,23,DEN,EU,Non-HG,No,Registered,68,72,Right,180,76,9,15,11,13,9,13,11,8,13,13,12,13,13,9,12,12,11,14,2,2,2,2,13,13,13,16,generated,-
Aiglons,17,Rachid Mansouri,-,AMC,-,28,MAR,Non-EU,Non-HG,No,Registered,68,69,Left,179,78,12,13,13,14,8,10,7,10,13,15,10,12,15,11,12,12,12,14,2,2,2,2,11,15,14,15,generated,-
Aiglons,21,Sofiane Mercier,-,AML,-,27,FRA,EU,Non-HG,No,Registered,66,66,Left,176,70,15,12,12,15,11,6,4,7,11,11,7,14,11,10,13,11,10,14,2,2,2,2,12,14,14,12,generated,-
Aiglons,19,Steve Abanda,-,AMR,-,20,COD,Non-EU,Non-HG,Yes,U21 Exempt,66,77,Right,176,72,12,14,14,12,9,5,6,8,10,12,7,12,10,8,15,13,11,16,2,2,2,2,13,11,17,13,generated,-
Aiglons,30,Romain Royer,-,ST,AMC,17,FRA,EU,HGC,Yes,U21 Exempt,66,81,Left,191,93,13,10,12,14,6,4,4,12,11,12,6,12,16,12,12,12,12,11,2,2,2,2,13,14,10,14,generated,-
Aiglons,25,Adrien Marchand,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,65,81,Right,181,74,2,11,5,9,2,3,3,4,11,11,16,10,11,10,7,9,12,12,12,12,15,13,13,2,2,12,generated,-
Aiglons,31,Yoann Baudry,-,MC,-,19,FRA,EU,HGN,Yes,U21 Exempt,65,78,Right,181,78,7,13,12,13,9,11,11,8,14,14,10,12,12,11,12,12,12,13,2,2,2,2,12,12,11,15,generated,-
Aiglons,32,Alexis Baudry,-,ST,-,20,FRA,EU,HGC,Yes,U21 Exempt,66,76,Right,181,77,14,11,13,13,7,7,5,13,10,11,6,12,12,9,14,11,13,9,2,2,2,2,14,14,12,13,generated,-
```

### Rouge et Noir (Stade Rennais FC 1901)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Rouge et Noir,1,Hamza Meziane,-,GK,-,31,ALG,Non-EU,Non-HG,No,Registered,73,73,Left,196,93,2,11,4,9,2,3,3,4,11,14,13,11,15,10,10,9,14,13,15,15,15,15,16,2,2,13,generated,-
Rouge et Noir,3,Valentin Arnaud,-,DL,-,26,FRA,EU,HGC,No,Registered,74,74,Left,183,78,8,14,15,12,16,15,14,13,13,13,14,15,13,10,15,17,14,14,2,2,2,2,14,12,11,13,generated,capped by band
Rouge et Noir,4,Jorne De Smedt,-,DC,DR,21,BEL,EU,Non-HG,Yes,U21 Exempt,73,83,Right,186,84,2,15,8,10,6,15,15,17,10,13,16,14,13,12,10,15,15,13,2,2,2,2,14,6,5,13,generated,-
Rouge et Noir,5,Samuel Mbarga,-,DC,DL/DM,32,CMR,Non-EU,Non-HG,No,Registered,74,74,Right,189,85,9,13,9,14,6,15,13,16,11,16,14,15,14,11,13,14,16,12,2,2,2,2,16,7,7,16,generated,capped by band
Rouge et Noir,2,Gonçalo Rebelo,-,DR,MR/WBR,26,POR,EU,Non-HG,No,Registered,71,72,Left,177,75,7,15,15,13,13,14,14,11,11,13,14,15,13,13,15,14,13,13,2,2,2,2,15,15,11,15,generated,-
Rouge et Noir,6,Florian Janssens,-,DM,-,25,BEL,EU,Non-HG,No,Registered,74,74,Right,182,81,8,13,14,12,7,14,15,12,14,16,14,15,14,9,13,15,15,15,2,2,2,2,16,12,9,15,generated,capped by band
Rouge et Noir,8,Achraf Alaoui,-,MC,-,25,MAR,Non-EU,Non-HG,No,Registered,69,70,Left,179,78,8,13,15,14,10,12,11,9,13,16,11,14,14,10,12,14,13,12,2,2,2,2,13,12,12,15,generated,-
Rouge et Noir,10,Simon Vermeulen,-,MC,-,27,BEL,EU,Non-HG,No,Registered,72,75,Right,182,83,10,15,15,13,9,15,11,11,15,14,12,14,14,11,11,15,12,14,2,2,2,2,15,14,11,14,generated,-
Rouge et Noir,11,Romain Brunet,-,AML,-,25,FRA,EU,HGC,No,Registered,71,72,Right,178,75,11,12,15,14,15,6,7,7,15,13,8,13,14,8,15,15,10,14,2,2,2,2,14,13,15,12,generated,-
Rouge et Noir,7,Marcin Zieliński,-,AMR,AMC,29,POL,EU,Non-HG,No,Registered,73,73,Right,183,73,13,12,15,16,13,7,7,8,13,12,7,13,13,9,16,12,11,14,2,2,2,2,13,13,16,13,generated,-
Rouge et Noir,9,Rayan Bouvier,-,ST,-,34,FRA,EU,HGC,No,Registered,74,74,Either,186,77,15,11,14,15,8,6,4,14,10,13,7,18,15,10,16,14,13,15,2,2,2,2,14,16,13,15,generated,capped by band
Rouge et Noir,13,Adil Tazi,-,GK,-,25,MAR,Non-EU,Non-HG,No,Registered,68,68,Right,193,88,2,10,3,9,2,3,3,4,9,14,14,8,14,12,8,9,12,12,13,15,14,13,13,2,2,11,generated,-
Rouge et Noir,23,Filip Horvat,-,DL,DC/ML,26,CRO,EU,Non-HG,No,Registered,66,68,Left,185,86,7,14,14,11,12,13,13,10,11,13,12,14,13,9,13,13,13,13,2,2,2,2,14,10,9,15,generated,-
Rouge et Noir,15,Antoine Vasseur,-,DC,-,28,FRA,EU,HGC,No,Registered,68,70,Right,194,93,3,12,8,11,6,13,13,12,9,15,14,15,15,11,15,12,13,10,2,2,2,2,14,7,6,14,generated,-
Rouge et Noir,24,Jesús Quintero,-,DC,DM/DL,26,ESP,EU,Non-HG,No,Registered,65,67,Right,189,91,5,12,7,12,6,14,13,12,9,10,15,13,11,11,10,11,14,9,2,2,2,2,14,6,5,11,generated,-
Rouge et Noir,22,Ilyas Tazi,-,DR,WBR/MR,21,MAR,Non-EU,Non-HG,Yes,U21 Exempt,69,80,Left,184,82,8,13,13,12,16,13,14,10,14,13,14,13,15,10,14,15,13,13,2,2,2,2,13,14,10,12,generated,-
Rouge et Noir,30,Sofiane Leclerc,-,DM,-,19,FRA,EU,HGC,Yes,U21 Exempt,65,81,Right,179,71,9,13,10,13,8,15,11,10,11,14,14,14,13,12,11,10,11,10,2,2,2,2,12,7,10,14,generated,-
Rouge et Noir,14,Baptiste Colin,-,MC,DM,32,FRA,EU,HGC,No,Registered,67,67,Right,179,75,11,13,14,13,12,13,11,11,15,12,10,14,13,11,14,14,10,12,2,2,2,2,13,13,11,14,generated,-
Rouge et Noir,17,Hugo Bertrand,-,AMC,-,24,FRA,EU,HGC,No,Registered,69,75,Right,185,80,12,13,13,14,13,10,9,8,15,15,9,15,15,10,13,13,10,14,2,2,2,2,14,14,13,15,generated,-
Rouge et Noir,21,Mamadou Diabaté,-,AML,-,27,GUI,Non-EU,Non-HG,No,Registered,68,71,Left,179,81,13,13,14,10,12,6,7,10,13,13,7,13,13,8,17,12,10,13,2,2,2,2,15,13,15,13,generated,-
Rouge et Noir,19,Damien Brunet,-,AMR,-,28,FRA,EU,HGC,No,Registered,66,66,Right,176,77,14,11,14,14,10,6,4,9,11,13,8,13,11,10,14,12,11,15,2,2,2,2,11,12,13,13,generated,-
Rouge et Noir,18,Tom Dijkstra,-,ST,-,33,NED,EU,Non-HG,No,Registered,68,68,Right,189,89,15,12,14,13,6,6,8,15,9,14,7,14,12,10,11,13,14,13,2,2,2,2,14,14,10,14,generated,-
Rouge et Noir,25,Jérémy Sauvage,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,67,77,Right,188,81,2,12,3,8,2,3,3,4,9,16,13,8,13,11,7,9,12,13,13,12,15,13,13,2,2,11,generated,-
Rouge et Noir,31,Gaëtan Morin,-,MC,-,19,FRA,EU,HGC,Yes,U21 Exempt,68,84,Right,181,76,10,13,13,14,10,13,12,10,12,14,13,15,14,10,11,12,11,14,2,2,2,2,14,14,13,15,generated,-
Rouge et Noir,32,Romain Blanchet,-,ST,AMR/AMC,18,FRA,EU,HGC,Yes,U21 Exempt,66,76,Right,185,80,13,10,12,15,7,6,6,12,11,12,7,15,12,9,14,11,12,12,2,2,2,2,12,15,10,12,generated,-
```

### Sang et Or (Racing Club de Lens)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Sang et Or,1,Kamil Nowicki,-,GK,-,26,POL,EU,Non-HG,No,Registered,71,72,Right,191,92,2,12,3,10,2,3,3,4,10,14,17,10,14,11,7,8,10,13,14,12,15,14,13,2,2,15,generated,-
Sang et Or,3,Michele Barone,-,DL,ML,31,ITA,EU,Non-HG,No,Registered,74,74,Right,183,76,6,12,14,14,13,16,15,12,10,11,15,14,12,10,16,17,14,14,2,2,2,2,14,13,10,15,generated,capped by band
Sang et Or,4,Amine Brahimi,-,DC,DL/DR,25,ALG,Non-EU,Non-HG,No,Registered,67,68,Right,186,75,4,11,8,10,8,14,14,14,9,11,15,12,11,13,11,9,15,11,2,2,2,2,12,7,4,12,generated,-
Sang et Or,5,Rayan Arnaud,-,DC,-,31,FRA,EU,HGN,No,Registered,74,74,Right,184,77,4,12,9,14,7,14,16,15,9,15,15,14,15,14,14,14,16,10,2,2,2,2,13,7,5,13,generated,capped by band
Sang et Or,2,Tibo Vandenberghe,-,DR,-,34,BEL,EU,Non-HG,No,Registered,70,70,Either,182,79,7,12,13,12,13,15,13,11,12,12,15,12,13,10,16,16,10,14,2,2,2,2,13,12,11,13,generated,-
Sang et Or,6,Seydou Diallo,-,DM,MC,28,CIV,Non-EU,Non-HG,No,Registered,73,75,Right,183,77,8,13,13,14,7,16,15,11,14,14,14,15,15,11,11,16,13,12,2,2,2,2,15,7,10,16,generated,-
Sang et Or,8,Sebastian Urban,-,MC,-,25,POL,EU,Non-HG,No,Registered,72,75,Left,179,76,9,14,15,14,10,13,12,9,14,15,12,15,16,11,11,15,13,13,2,2,2,2,14,13,11,16,generated,-
Sang et Or,10,Kévin Chauvin,-,MC,AMC/DM,32,FRA,EU,HGN,No,Registered,71,71,Right,182,80,11,15,12,13,8,14,13,10,13,14,10,14,14,9,13,14,12,14,2,2,2,2,15,14,12,15,generated,-
Sang et Or,11,Sam Marsden,-,AML,AMC,24,ENG,Non-EU,Non-HG,No,Registered,71,77,Left,186,82,12,13,15,13,16,8,4,8,16,14,7,12,15,8,14,15,14,14,2,2,2,2,11,14,14,13,generated,-
Sang et Or,7,Youssef Saadi,-,AMR,-,26,ALG,Non-EU,Non-HG,No,Registered,70,73,Left,173,70,13,13,16,13,13,6,8,7,13,11,6,13,12,9,15,10,10,16,2,2,2,2,13,13,13,12,generated,-
Sang et Or,9,Benjamin Bellanger,-,ST,-,33,FRA,EU,HGC,No,Registered,74,74,Right,193,85,16,13,15,14,8,5,4,15,12,15,6,12,15,12,14,13,17,13,2,2,2,2,12,15,11,14,generated,capped by band
Sang et Or,13,Bas Bosman,-,GK,-,23,NED,EU,Non-HG,No,Registered,66,68,Right,191,89,2,11,1,8,2,3,3,4,8,13,13,8,13,10,10,9,10,14,14,12,14,12,14,2,2,11,generated,-
Sang et Or,23,Julien Colin,-,DL,ML,27,FRA,EU,HGN,No,Registered,65,66,Left,185,75,6,12,11,12,14,13,14,11,9,13,12,12,11,9,14,14,12,15,2,2,2,2,12,11,8,13,generated,-
Sang et Or,15,Baptiste Guérin,-,DC,-,32,FRA,EU,HGC,No,Registered,69,69,Right,190,85,4,10,10,12,5,14,15,13,9,14,12,12,13,12,13,15,14,11,2,2,2,2,15,7,4,14,generated,-
Sang et Or,24,Guillaume Sauvage,-,DC,DL/DR,28,FRA,EU,HGN,No,Registered,73,74,Right,192,90,4,10,8,10,6,15,13,15,11,14,15,16,14,14,14,14,15,11,2,2,2,2,16,6,5,13,generated,-
Sang et Or,22,Jakub Gajewski,-,DR,WBR,33,POL,EU,Non-HG,No,Registered,68,68,Right,178,73,6,13,13,11,13,13,14,10,13,12,13,13,13,9,14,16,12,16,2,2,2,2,14,11,10,13,generated,-
Sang et Or,14,Tomasz Adamski,-,DM,-,26,POL,EU,Non-HG,No,Registered,66,69,Right,182,77,7,11,11,12,7,13,13,11,13,13,14,14,13,11,11,13,13,11,2,2,2,2,14,8,6,13,generated,-
Sang et Or,16,Thomas Blanchet,-,MC,-,24,FRA,EU,HGC,No,Registered,67,74,Either,185,83,8,14,12,15,11,14,11,7,12,13,12,13,14,9,12,13,12,13,2,2,2,2,14,11,9,14,generated,-
Sang et Or,17,Achraf Larbi,-,AMC,-,27,ALG,Non-EU,Non-HG,No,Registered,69,69,Left,182,84,14,14,12,15,11,7,8,9,15,12,10,13,13,10,12,14,11,13,2,2,2,2,12,13,15,13,generated,-
Sang et Or,21,Paweł Kaczmarek,-,AML,-,25,POL,EU,Non-HG,No,Registered,70,72,Left,179,75,12,14,15,15,12,7,6,9,12,11,9,14,12,7,14,13,10,16,2,2,2,2,12,15,14,14,generated,-
Sang et Or,30,Guillaume Lemaire,-,AMR,-,20,FRA,EU,HGC,Yes,U21 Exempt,65,70,Right,176,72,13,13,13,13,10,6,6,7,11,12,7,12,11,7,15,13,9,14,2,2,2,2,11,12,14,12,generated,-
Sang et Or,19,Mahamadou Camara,-,ST,AML/AMC,26,GUI,Non-EU,Non-HG,No,Registered,65,65,Right,181,77,12,7,12,16,6,5,4,12,11,12,7,13,13,11,15,13,11,14,2,2,2,2,12,13,9,13,generated,-
Sang et Or,25,Bastien Carpentier,-,GK,-,19,FRA,EU,HGC,Yes,U21 Exempt,68,81,Left,189,92,2,12,4,9,2,3,3,4,10,14,13,10,14,11,8,10,11,13,13,15,13,14,13,2,2,10,generated,-
Sang et Or,31,Hugo Guérin,-,MC,-,18,FRA,EU,HGC,Yes,U21 Exempt,68,78,Right,180,77,9,14,12,15,10,14,10,12,14,13,13,14,13,10,12,13,9,13,2,2,2,2,14,12,11,13,generated,-
Sang et Or,32,Maxime Gaillard,-,ST,AMC,17,FRA,EU,HGC,Yes,U21 Exempt,68,82,Either,175,73,14,10,12,12,8,5,5,12,9,13,7,12,14,9,16,13,12,13,2,2,2,2,12,15,12,12,generated,-
```

### Racing Alsace (RC Strasbourg Alsace)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Racing Alsace,1,Oussama Fassi,-,GK,-,31,MAR,Non-EU,Non-HG,No,Registered,68,68,Left,191,95,2,10,3,9,2,3,3,4,11,13,11,10,14,10,6,8,12,13,13,15,15,16,14,2,2,11,generated,-
Racing Alsace,3,Lamine Doumbia,-,DL,WBL/ML,27,GUI,Non-EU,Non-HG,No,Registered,68,71,Left,177,75,5,12,12,15,13,14,13,12,11,13,13,14,13,10,14,14,13,13,2,2,2,2,15,12,8,15,generated,-
Racing Alsace,4,Victor Nielsen,-,DC,DM,24,DEN,EU,Non-HG,No,Registered,68,71,Right,198,98,3,10,8,11,5,14,14,14,8,13,14,12,10,10,11,12,15,11,2,2,2,2,13,8,3,13,generated,-
Racing Alsace,5,Marco Gallo,-,DC,DM,29,ITA,EU,Non-HG,No,Registered,68,68,Right,180,70,3,11,8,12,6,14,15,14,8,12,14,16,13,12,10,11,15,8,2,2,2,2,12,8,5,12,generated,-
Racing Alsace,2,Edoardo Leone,-,DR,-,23,ITA,EU,Non-HG,No,Registered,65,72,Right,176,69,7,13,11,9,11,12,13,9,11,13,14,14,10,10,13,13,12,12,2,2,2,2,16,10,10,14,generated,-
Racing Alsace,6,Tiago Vaz,-,DM,-,33,POR,EU,Non-HG,No,Registered,67,67,Left,190,87,7,13,10,13,8,15,10,12,10,15,14,15,14,11,13,10,10,12,2,2,2,2,15,10,9,14,generated,-
Racing Alsace,8,Yoann Lacroix,-,MC,-,31,FRA,EU,HGN,No,Registered,66,66,Left,187,84,11,14,13,14,11,12,11,10,15,14,13,12,12,11,12,12,11,11,2,2,2,2,13,11,11,13,generated,-
Racing Alsace,10,Lucas Dufour,-,MC,DM,36,FRA,EU,HGC,No,Registered,69,69,Right,180,75,10,12,14,16,7,13,11,10,17,13,13,13,13,10,11,13,11,12,2,2,2,2,13,13,11,15,generated,-
Racing Alsace,11,Yacouba Sidibé,-,AML,-,25,SEN,Non-EU,Non-HG,No,Registered,70,73,Right,172,65,12,14,14,14,15,5,6,6,15,11,8,13,15,8,14,13,8,15,2,2,2,2,12,13,14,14,generated,capped by band
Racing Alsace,7,Robbe Jacobs,-,AMR,-,27,BEL,EU,Non-HG,No,Registered,70,73,Right,188,85,10,12,16,14,13,6,6,6,13,12,7,12,13,9,14,12,13,15,2,2,2,2,11,16,14,12,generated,capped by band
Racing Alsace,9,Yassine Guerfi,-,ST,-,28,ALG,Non-EU,Non-HG,No,Registered,69,70,Right,180,78,14,10,14,13,7,4,4,14,10,15,7,14,13,9,14,14,15,15,2,2,2,2,12,14,11,11,generated,-
Racing Alsace,13,Jan Winkler,-,GK,-,27,GER,EU,Non-HG,No,Registered,64,66,Right,190,89,2,10,5,9,2,3,3,4,8,13,14,9,13,10,9,7,11,13,11,14,13,13,13,2,2,14,generated,-
Racing Alsace,23,Hannes Declercq,-,DL,DC,21,BEL,EU,Non-HG,Yes,U21 Exempt,66,78,Left,190,82,5,12,12,12,12,14,13,10,11,12,14,12,13,8,14,15,13,11,2,2,2,2,13,10,10,13,generated,-
Racing Alsace,15,Florian Noël,-,DC,DR,28,FRA,EU,HGN,No,Registered,62,62,Left,183,79,5,10,10,11,4,14,11,13,9,9,15,10,10,10,10,12,14,9,2,2,2,2,12,8,6,10,generated,-
Racing Alsace,24,Yanis Bellanger,-,DC,-,24,FRA,EU,HGC,No,Registered,68,75,Right,190,82,4,12,9,13,5,13,14,16,9,11,14,13,11,11,11,12,15,12,2,2,2,2,15,5,5,12,generated,-
Racing Alsace,22,Kévin Guérin,-,DR,MR/WBR,27,FRA,EU,HGN,No,Registered,63,66,Right,181,77,6,14,12,12,12,12,13,11,13,11,11,12,12,10,13,13,10,12,2,2,2,2,12,9,8,15,generated,-
Racing Alsace,14,Ifeanyi Nnamdi,-,DM,-,24,NGA,Non-EU,Non-HG,No,Registered,63,68,Right,184,78,5,11,10,10,5,12,11,9,11,16,11,12,11,10,10,11,11,12,2,2,2,2,15,9,8,15,generated,-
Racing Alsace,16,Adrien Fabre,-,MC,-,27,FRA,EU,HGC,No,Registered,65,65,Either,182,71,9,14,14,13,12,12,12,8,12,13,12,13,13,11,12,13,12,11,2,2,2,2,12,13,10,14,generated,-
Racing Alsace,17,Youssef Guerfi,-,AMC,-,25,ALG,Non-EU,Non-HG,No,Registered,70,70,Right,180,77,13,15,14,17,12,7,8,8,13,13,8,15,13,9,13,13,11,14,2,2,2,2,13,14,14,15,generated,capped by band
Racing Alsace,21,Yoann Barbier,-,AML,-,25,FRA,EU,HGN,No,Registered,62,63,Right,181,79,10,11,15,13,12,7,6,8,11,10,6,11,13,8,13,11,12,11,2,2,2,2,12,12,11,12,generated,-
Racing Alsace,30,Mathis Morin,-,AMR,-,19,FRA,EU,HGC,Yes,U21 Exempt,62,71,Right,181,78,9,13,13,13,9,6,6,7,10,12,8,11,10,9,13,11,9,15,2,2,2,2,12,13,15,12,generated,-
Racing Alsace,19,Wout Jacobs,-,ST,AML,24,BEL,EU,Non-HG,No,Registered,64,70,Right,180,78,14,12,12,10,8,5,4,11,11,12,5,13,14,10,13,11,11,11,2,2,2,2,12,15,11,13,generated,-
Racing Alsace,25,Rayan Poirier,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,64,78,Right,198,92,2,10,6,10,2,3,3,4,8,15,14,9,13,9,7,8,12,13,13,11,11,13,13,2,2,13,generated,-
Racing Alsace,31,Loïc Sauvage,-,MC,-,18,FRA,EU,HGC,Yes,U21 Exempt,64,73,Right,183,79,10,14,14,14,10,12,11,11,13,11,11,12,11,9,12,12,12,13,2,2,2,2,12,12,12,15,generated,-
Racing Alsace,32,Jérémy Fabre,-,ST,-,17,FRA,EU,HGC,Yes,U21 Exempt,61,76,Either,181,77,13,10,12,13,6,6,4,11,8,12,5,11,12,8,12,12,11,12,2,2,2,2,11,13,12,13,generated,-
```

### Pirates (Stade Brestois 29)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Pirates,1,Tommaso Serra,-,GK,-,33,ITA,EU,Non-HG,No,Registered,68,68,Right,189,87,2,12,3,9,2,3,3,4,13,14,14,10,13,11,9,10,11,13,14,13,14,13,14,2,2,13,generated,-
Pirates,3,Maxime Gielen,-,DL,ML,27,BEL,EU,Non-HG,No,Registered,69,70,Left,185,83,6,14,13,13,13,14,15,14,11,11,14,13,15,8,15,13,13,13,2,2,2,2,14,12,12,14,generated,capped by band
Pirates,4,Drissa Keïta,-,DC,-,28,SEN,Non-EU,Non-HG,No,Registered,67,70,Right,187,81,3,11,9,12,7,15,14,14,7,13,12,14,13,11,13,13,13,10,2,2,2,2,12,8,5,13,generated,-
Pirates,5,Gaëtan Barbier,-,DC,-,24,FRA,EU,HGC,No,Registered,69,76,Right,189,86,4,12,8,12,5,13,14,16,12,11,15,13,12,12,11,12,15,10,2,2,2,2,15,6,5,12,generated,capped by band
Pirates,2,Karim Bamba,-,DR,WBR,36,SEN,Non-EU,Non-HG,No,Registered,67,67,Right,183,79,7,13,14,15,13,13,13,11,10,12,14,14,11,10,13,14,12,13,2,2,2,2,14,11,9,14,generated,-
Pirates,6,Boubacar Kaba,-,DM,-,28,CIV,Non-EU,Non-HG,No,Registered,69,69,Right,176,70,7,13,9,12,9,14,13,10,13,13,14,14,14,10,12,14,13,14,2,2,2,2,15,10,10,14,generated,capped by band
Pirates,8,Bastien Rousseau,-,MC,-,28,FRA,EU,Non-HG,No,Registered,66,68,Right,180,74,9,13,12,13,12,13,10,8,14,12,10,13,14,9,11,13,10,13,2,2,2,2,12,11,12,15,generated,-
Pirates,10,Kévin Carpentier,-,MC,DM/AMC,34,FRA,EU,HGC,No,Registered,69,69,Right,186,81,9,15,10,13,11,13,12,9,14,14,11,13,14,10,12,13,12,13,2,2,2,2,14,12,14,14,generated,capped by band
Pirates,11,Georges Onana,-,AML,ST/ML,31,CMR,Non-EU,Non-HG,No,Registered,67,67,Left,185,79,13,12,14,13,14,6,6,7,14,13,6,13,14,9,15,12,10,11,2,2,2,2,12,13,12,12,generated,-
Pirates,7,Nicola Moretti,-,AMR,-,25,ITA,EU,Non-HG,No,Registered,68,68,Right,173,71,13,12,16,13,10,7,7,7,10,9,7,11,11,8,13,13,12,14,2,2,2,2,14,15,16,14,generated,-
Pirates,9,Patrick Nkoulou,-,ST,-,25,COD,Non-EU,Non-HG,No,Registered,66,67,Right,188,84,14,9,13,13,8,6,5,13,12,11,5,10,13,9,14,12,12,11,2,2,2,2,13,14,9,14,generated,-
Pirates,13,Corentin Colin,-,GK,-,22,FRA,EU,HGC,No,Registered,60,64,Right,192,98,2,9,3,9,2,3,3,4,8,13,12,7,13,9,8,6,10,13,10,11,13,13,13,2,2,10,generated,-
Pirates,23,Krzysztof Wójcik,-,DL,-,19,POL,EU,Non-HG,Yes,U21 Exempt,64,73,Right,185,76,6,13,13,11,14,13,14,11,8,11,12,13,10,10,12,13,13,11,2,2,2,2,11,10,10,13,generated,-
Pirates,15,Nolan Lemaire,-,DC,-,27,FRA,EU,HGC,No,Registered,60,60,Right,186,75,5,11,10,12,6,12,12,13,7,10,12,13,10,9,10,12,14,11,2,2,2,2,13,8,5,11,generated,-
Pirates,24,Mathias Declercq,-,DC,DL,23,BEL,EU,Non-HG,No,Registered,62,67,Right,186,81,5,10,9,11,6,12,12,14,8,10,13,11,11,10,10,12,15,10,2,2,2,2,13,6,4,11,generated,-
Pirates,22,Nolan Mercier,-,DR,WBR,22,FRA,EU,HGC,No,Registered,63,70,Right,183,77,6,12,12,11,12,13,14,10,10,11,13,11,10,10,14,12,12,13,2,2,2,2,12,12,10,12,generated,-
Pirates,30,Antoine Carpentier,-,DM,MC/DC,21,FRA,EU,HGC,Yes,U21 Exempt,63,70,Right,182,83,7,13,12,12,7,12,12,8,12,12,10,14,13,9,12,13,12,12,2,2,2,2,12,9,9,15,generated,-
Pirates,14,Hugo Tavares,-,MC,-,26,POR,EU,Non-HG,No,Registered,61,62,Right,177,73,8,10,10,14,8,11,10,8,14,13,12,11,12,10,13,11,12,12,2,2,2,2,11,11,10,15,generated,-
Pirates,17,Mehdi Touati,-,AMC,AMR,24,ALG,Non-EU,Non-HG,No,Registered,60,62,Right,183,85,9,13,11,12,11,8,7,7,13,12,9,11,12,9,11,12,10,13,2,2,2,2,13,12,13,11,generated,-
Pirates,21,Damien Poirier,-,AML,-,27,FRA,EU,Non-HG,No,Registered,62,62,Left,176,74,12,10,12,15,9,4,4,7,10,11,8,13,10,8,12,12,11,13,2,2,2,2,12,14,14,12,generated,-
Pirates,19,Maxime Lambrecht,-,AMR,AMC/ST,28,BEL,EU,Non-HG,No,Registered,65,67,Right,175,72,12,12,13,16,9,6,6,8,9,12,7,11,10,10,13,13,9,14,2,2,2,2,11,14,15,14,generated,-
Pirates,18,Benjamin Barbier,-,ST,-,28,FRA,EU,HGC,No,Registered,61,63,Either,190,86,12,10,12,14,9,6,3,11,12,12,6,13,11,7,13,12,11,11,2,2,2,2,12,13,9,11,generated,-
Pirates,25,Gaëtan Bertrand,-,GK,-,20,FRA,EU,HGC,Yes,U21 Exempt,61,66,Right,193,90,2,9,2,7,2,3,3,4,9,12,12,7,12,8,5,8,11,12,12,13,13,12,12,2,2,11,generated,-
Pirates,31,Florian Baudry,-,MC,-,21,FRA,EU,Non-HG,Yes,U21 Exempt,62,71,Right,175,68,8,12,12,12,11,12,10,8,12,13,11,12,12,12,12,12,9,10,2,2,2,2,12,10,11,16,generated,-
Pirates,32,Mathis Bouvier,-,ST,-,21,FRA,EU,HGC,Yes,U21 Exempt,60,67,Right,184,83,13,8,11,13,7,6,4,11,10,11,6,12,11,7,12,11,11,10,2,2,2,2,11,13,10,10,generated,-
```

### Violets (Toulouse FC)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Violets,1,Damien Lambert,-,GK,-,31,FRA,EU,HGN,No,Registered,61,61,Left,192,90,2,10,3,9,2,3,3,4,10,12,13,10,11,9,7,7,11,12,12,13,12,13,12,2,2,11,generated,-
Violets,3,Abdul Eze,-,DL,-,25,NGA,Non-EU,Non-HG,No,Registered,66,68,Left,186,84,5,13,13,13,14,12,13,11,10,13,13,12,12,11,15,14,11,12,2,2,2,2,13,10,9,13,generated,-
Violets,4,Gaëtan Carpentier,-,DC,-,26,FRA,EU,HGN,No,Registered,62,62,Either,193,92,5,11,9,11,5,13,12,14,12,10,14,11,9,10,10,12,13,9,2,2,2,2,13,6,6,11,generated,-
Violets,5,Reda Hamidi,-,DC,-,27,ALG,Non-EU,Non-HG,No,Registered,62,64,Either,192,97,5,11,8,10,6,13,12,11,8,13,12,13,13,9,13,10,13,11,2,2,2,2,12,8,5,12,generated,-
Violets,2,Stefano Farina,-,DR,DC/WBR,26,ITA,EU,Non-HG,No,Registered,67,70,Left,189,86,6,12,12,12,14,13,14,10,10,11,15,11,13,9,15,14,12,15,2,2,2,2,12,11,11,12,generated,capped by band
Violets,6,Jason Brunet,-,DM,DC/MC,26,FRA,EU,HGC,No,Registered,63,64,Right,177,68,5,13,12,13,10,13,14,9,11,14,10,12,14,10,11,12,13,10,2,2,2,2,13,9,9,14,generated,-
Violets,8,Aboubacar Yattara,-,MC,-,33,SEN,Non-EU,Non-HG,No,Registered,64,64,Right,180,80,9,11,13,16,10,13,9,7,12,14,10,13,12,8,12,12,13,11,2,2,2,2,13,11,12,14,generated,-
Violets,10,Kévin Bouvier,-,MC,-,24,FRA,EU,HGC,No,Registered,63,68,Right,174,74,9,13,11,13,9,10,8,8,13,14,9,12,12,10,11,11,11,12,2,2,2,2,12,11,13,14,generated,-
Violets,11,Vinícius Moraes,-,AML,ST,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,67,74,Left,176,74,12,11,13,15,11,5,6,6,11,9,7,13,12,7,13,13,12,17,2,2,2,2,11,13,15,14,generated,capped by band
Violets,7,Issa Sow,-,AMR,-,28,GUI,Non-EU,Non-HG,No,Registered,66,68,Right,180,74,11,12,15,13,10,6,6,10,10,12,4,10,11,7,14,12,8,16,2,2,2,2,13,13,14,12,generated,-
Violets,9,Valentin Fabre,-,ST,-,26,FRA,EU,HGN,No,Registered,67,70,Right,187,79,13,10,11,12,7,6,5,16,9,12,5,13,13,8,14,13,13,14,2,2,2,2,13,15,13,13,generated,capped by band
Violets,13,Max Verbeek,-,GK,-,28,NED,EU,Non-HG,No,Registered,59,60,Left,198,93,2,9,3,8,2,3,3,4,10,11,13,8,11,10,8,7,10,11,12,12,13,10,11,2,2,9,generated,-
Violets,23,Jens Lund,-,DL,-,28,DEN,EU,Non-HG,No,Registered,60,62,Either,185,81,5,12,12,11,12,12,12,10,9,10,12,11,14,12,12,13,11,12,2,2,2,2,12,8,8,12,generated,-
Violets,15,Valentin Aubry,-,DC,DM/DL,22,FRA,EU,HGC,No,Registered,61,65,Right,191,85,6,12,9,10,7,15,10,12,9,11,13,11,11,13,10,10,14,11,2,2,2,2,12,6,7,11,generated,-
Violets,30,Antoine Bertrand,-,DC,-,18,FRA,EU,Non-HG,Yes,U21 Exempt,61,73,Left,186,88,4,11,9,10,3,14,12,12,9,9,13,11,9,9,9,11,13,11,2,2,2,2,15,5,5,9,generated,-
Violets,22,Baptiste Lemaire,-,DR,WBR,29,FRA,EU,HGN,No,Registered,61,61,Right,182,73,8,10,11,12,12,14,13,11,10,10,13,11,11,11,13,12,10,10,2,2,2,2,11,10,11,12,generated,-
Violets,14,Carlos Leite,-,DM,-,27,POR,EU,Non-HG,No,Registered,60,62,Right,181,77,8,12,9,11,8,13,12,10,12,11,12,13,11,9,12,11,12,13,2,2,2,2,12,8,9,12,generated,-
Violets,16,Antoine Barbier,-,MC,-,34,FRA,EU,HGC,No,Registered,67,67,Right,180,82,9,15,13,13,10,14,11,9,15,11,11,13,14,9,10,12,12,14,2,2,2,2,12,13,12,14,generated,capped by band
Violets,17,Connor Ashworth,-,AMC,-,21,ENG,Non-EU,Non-HG,Yes,U21 Exempt,58,67,Right,175,65,12,13,12,11,8,7,8,6,11,12,9,12,10,9,11,12,10,13,2,2,2,2,12,12,11,11,generated,-
Violets,21,Giovanni Rizzo,-,AML,-,23,ITA,EU,Non-HG,No,Registered,60,64,Left,187,81,11,10,12,13,9,7,5,6,10,8,6,11,10,9,12,11,10,14,2,2,2,2,10,12,14,12,generated,-
Violets,19,Alessandro Silvestri,-,AMR,MR,25,ITA,EU,Non-HG,No,Registered,62,63,Right,178,71,12,13,13,13,8,8,6,6,8,9,6,13,8,8,14,11,10,14,2,2,2,2,12,13,14,10,generated,-
Violets,18,Léo Guérin,-,ST,AMR/AML,27,FRA,EU,HGN,No,Registered,63,66,Right,185,83,14,9,12,9,7,6,3,12,10,11,7,13,14,10,14,12,12,13,2,2,2,2,13,13,9,13,generated,-
Violets,25,Nathan Lambert,-,GK,-,20,FRA,EU,HGC,Yes,U21 Exempt,59,69,Right,185,85,2,9,2,8,2,3,3,4,7,10,12,7,11,12,7,8,11,11,13,13,12,10,11,2,2,12,generated,-
Violets,31,Yanis Sauvage,-,MC,AMC/DM,19,FRA,EU,HGC,Yes,U21 Exempt,58,68,Left,188,81,7,13,12,12,9,10,9,10,12,12,11,10,11,10,12,10,9,12,2,2,2,2,10,10,10,13,generated,-
Violets,32,Rayan Guérin,-,ST,AMR,18,FRA,EU,HGN,Yes,U21 Exempt,60,71,Right,183,80,12,9,13,11,6,3,5,13,10,12,6,12,11,8,12,12,13,13,2,2,2,2,12,12,11,10,generated,-
```

### Auxerrois (AJ Auxerre)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Auxerrois,1,Baptiste Blanchet,-,GK,-,31,FRA,EU,HGC,No,Registered,60,60,Right,191,91,2,7,4,8,2,3,3,4,8,11,13,10,11,11,5,8,11,11,12,13,13,11,11,2,2,11,generated,-
Auxerrois,3,Lucas Morin,-,DL,DC,27,FRA,EU,HGN,No,Registered,61,62,Left,186,87,4,13,13,13,11,12,12,9,10,11,11,14,13,9,11,13,11,12,2,2,2,2,13,11,9,13,generated,-
Auxerrois,4,Clément Lemaire,-,DC,DL,25,FRA,EU,HGN,No,Registered,62,63,Right,189,82,5,10,7,9,4,13,13,12,8,9,14,12,10,10,10,11,14,9,2,2,2,2,13,5,6,10,generated,-
Auxerrois,5,Emanuele Fabbri,-,DC,DR,25,ITA,EU,Non-HG,No,Registered,61,63,Right,190,89,4,11,8,12,7,12,13,10,10,9,15,11,10,12,10,11,14,10,2,2,2,2,13,4,6,10,generated,-
Auxerrois,2,Gaëtan Dufour,-,DR,WBR/DC,36,FRA,EU,HGN,No,Registered,62,62,Right,185,79,6,11,12,12,14,13,13,9,11,11,11,11,12,10,13,13,14,12,2,2,2,2,12,9,9,12,generated,-
Auxerrois,6,Jorne Dumont,-,DM,-,26,BEL,EU,Non-HG,No,Registered,61,62,Right,181,79,8,13,10,10,7,13,10,9,11,12,13,14,14,8,11,10,10,12,2,2,2,2,12,7,8,13,generated,-
Auxerrois,8,Youssouf Diakité,-,MC,AMC/DM,24,MLI,Non-EU,Non-HG,No,Registered,63,70,Left,184,81,8,14,12,15,8,11,8,8,12,13,11,11,12,9,12,11,9,11,2,2,2,2,12,10,10,13,generated,capped by band
Auxerrois,10,Tom Tessier,-,MC,AMC,30,FRA,EU,HGN,No,Registered,61,61,Right,169,69,7,11,12,13,9,11,10,9,12,15,10,12,12,10,10,11,10,12,2,2,2,2,12,12,12,13,generated,-
Auxerrois,11,Simon Michiels,-,AML,-,28,BEL,EU,Non-HG,No,Registered,62,63,Left,181,77,9,10,15,11,10,6,5,8,11,11,8,13,12,9,13,12,9,13,2,2,2,2,12,13,13,9,generated,-
Auxerrois,7,Clément Aubry,-,AMR,ST,31,FRA,EU,HGC,No,Registered,62,62,Right,180,81,12,13,12,10,13,5,6,6,12,11,7,10,12,8,13,12,10,13,2,2,2,2,11,12,14,10,generated,-
Auxerrois,9,Landry Ndzie,-,ST,AMC,27,CMR,Non-EU,Non-HG,No,Registered,63,65,Right,185,86,14,9,12,12,9,6,4,12,8,12,8,12,12,10,12,13,13,11,2,2,2,2,11,13,11,13,generated,capped by band
Auxerrois,13,Ricardo Domingues,-,GK,-,27,POR,EU,Non-HG,No,Registered,57,57,Right,191,90,2,8,5,7,2,3,3,4,9,11,15,7,11,9,9,6,11,11,11,10,11,11,11,2,2,10,generated,-
Auxerrois,23,Quentin Lemaire,-,DL,-,25,FRA,EU,HGC,No,Registered,55,57,Left,185,90,6,10,9,12,10,12,11,8,10,10,10,10,11,7,12,14,9,10,2,2,2,2,11,10,11,10,generated,-
Auxerrois,15,Léo Leclerc,-,DC,DL,24,FRA,EU,HGN,No,Registered,54,57,Right,190,80,3,11,5,10,6,10,12,13,7,9,13,11,9,10,9,11,12,8,2,2,2,2,8,6,6,9,generated,-
Auxerrois,30,Quentin Bertrand,-,DC,-,18,FRA,EU,HGC,Yes,U21 Exempt,54,64,Right,188,83,2,10,7,9,4,11,11,13,11,8,11,12,8,9,8,11,13,9,2,2,2,2,12,6,3,8,generated,-
Auxerrois,22,Olivier Biyik,-,DR,-,27,CMR,Non-EU,Non-HG,No,Registered,55,56,Right,179,74,5,11,11,10,11,11,11,11,10,9,10,11,11,8,12,12,11,11,2,2,2,2,10,11,6,11,generated,-
Auxerrois,14,Victor Obi,-,DM,MC,27,NGA,Non-EU,Non-HG,No,Registered,59,59,Left,179,76,7,12,10,12,8,12,12,8,13,11,11,12,12,10,11,11,11,11,2,2,2,2,10,9,7,14,generated,-
Auxerrois,16,Piotr Jabłoński,-,MC,AMC,26,POL,EU,Non-HG,No,Registered,57,59,Left,177,74,7,11,9,12,8,11,11,10,13,12,11,10,11,10,10,10,10,11,2,2,2,2,10,10,10,13,generated,-
Auxerrois,17,Sofiane Brunet,-,AMC,-,29,FRA,EU,HGN,No,Registered,60,60,Left,181,73,10,11,15,12,10,10,8,10,13,12,10,11,12,9,9,11,12,12,2,2,2,2,9,12,10,12,generated,-
Auxerrois,21,Gaëtan Arnaud,-,AML,-,30,FRA,EU,HGN,No,Registered,59,59,Left,177,74,11,12,11,12,13,5,4,7,12,10,6,12,12,8,13,10,9,11,2,2,2,2,10,12,11,12,generated,-
Auxerrois,19,Sam Turnbull,-,AMR,AMC/ST,21,ENG,Non-EU,Non-HG,Yes,U21 Exempt,54,61,Either,180,75,11,9,11,11,9,5,6,7,9,9,8,9,9,7,11,12,8,11,2,2,2,2,10,12,12,11,generated,-
Auxerrois,18,Martin Nguema,-,ST,-,29,CMR,Non-EU,Non-HG,No,Registered,56,56,Left,181,82,11,9,12,11,6,5,4,11,8,10,6,13,11,8,13,10,11,11,2,2,2,2,12,11,10,12,generated,-
Auxerrois,25,Loïc Leclerc,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,56,70,Right,194,98,2,11,3,8,2,3,3,4,9,9,13,8,10,8,5,7,8,11,11,12,12,10,11,2,2,11,generated,-
Auxerrois,31,Clément Pichon,-,MC,-,18,FRA,EU,HGC,Yes,U21 Exempt,54,65,Right,180,82,7,10,11,12,9,10,10,7,12,13,9,10,10,8,11,10,8,11,2,2,2,2,10,9,10,11,generated,-
Auxerrois,32,Clément Hamon,-,ST,AMR,19,FRA,EU,HGN,Yes,U21 Exempt,57,66,Right,189,84,13,10,11,12,7,4,6,12,8,12,6,12,9,9,11,10,13,13,2,2,2,2,11,11,9,10,generated,-
```

### Merlus (FC Lorient)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Merlus,1,Zakaria Mansouri,-,GK,-,33,MAR,Non-EU,Non-HG,No,Registered,63,63,Right,192,91,2,10,3,8,2,3,3,4,8,11,14,8,12,8,7,10,11,12,13,13,13,11,12,2,2,12,generated,capped by band
Merlus,3,Rui Cardoso,-,DL,-,28,POR,EU,Non-HG,No,Registered,61,64,Left,182,76,7,12,11,8,13,12,11,10,9,13,13,13,13,8,13,12,14,10,2,2,2,2,12,11,9,13,generated,-
Merlus,4,Boubacar Cissé,-,DC,DR,32,MLI,Non-EU,Non-HG,No,Registered,63,63,Right,189,76,6,11,9,11,5,13,13,13,7,10,14,13,11,11,9,12,14,9,2,2,2,2,13,6,4,11,generated,capped by band
Merlus,5,Clément Leclerc,-,DC,-,26,FRA,EU,HGN,No,Registered,62,65,Right,185,76,3,11,7,11,5,12,14,12,8,11,11,13,13,11,11,13,13,11,2,2,2,2,13,7,6,12,generated,-
Merlus,2,Gaëtan Chauvin,-,DR,DC,29,FRA,EU,HGN,No,Registered,58,58,Right,180,78,5,11,11,10,11,12,13,10,9,9,12,11,9,9,13,11,10,12,2,2,2,2,10,8,10,11,generated,-
Merlus,6,Théo Bellanger,-,DM,-,28,FRA,EU,HGN,No,Registered,63,66,Right,176,70,6,9,12,12,5,14,12,9,10,11,12,14,11,10,10,13,12,11,2,2,2,2,14,9,10,16,generated,capped by band
Merlus,8,Bartosz Kaczmarek,-,MC,-,24,POL,EU,Non-HG,No,Registered,63,69,Right,177,75,8,13,12,14,10,12,11,11,13,12,12,11,12,10,13,12,11,11,2,2,2,2,14,11,8,13,generated,capped by band
Merlus,10,Thibault Lambrecht,-,MC,DM,28,BEL,EU,Non-HG,No,Registered,62,65,Right,174,69,9,10,11,13,8,12,10,8,14,14,12,11,12,9,10,11,9,12,2,2,2,2,12,12,12,15,generated,-
Merlus,11,Sofiane Millet,-,AML,AMC,28,FRA,EU,HGC,No,Registered,59,59,Left,181,74,10,10,12,8,11,6,4,8,10,8,6,10,12,7,14,11,9,14,2,2,2,2,10,13,12,12,generated,-
Merlus,7,Wesley Dantas,-,AMR,-,22,BRA,Non-EU,Non-HG,No,Registered,60,62,Right,178,72,11,13,14,10,13,7,6,8,13,10,4,12,13,9,12,10,11,12,2,2,2,2,10,10,12,11,generated,-
Merlus,9,Luís Tavares,-,ST,-,31,POR,EU,Non-HG,No,Registered,59,59,Right,183,75,13,10,12,14,8,5,3,11,9,10,7,13,9,10,11,13,11,10,2,2,2,2,12,13,10,11,generated,-
Merlus,13,Rayan Renaud,-,GK,-,25,FRA,EU,Non-HG,No,Registered,59,60,Right,187,83,2,10,5,8,2,3,3,4,8,12,12,11,11,8,6,8,13,11,11,14,12,11,12,2,2,10,generated,-
Merlus,23,Alexis Giraud,-,DL,-,23,FRA,EU,HGC,No,Registered,59,63,Left,185,83,6,11,11,11,13,12,12,12,11,12,12,10,11,10,12,13,11,11,2,2,2,2,11,11,8,11,generated,-
Merlus,15,Lucas Aubry,-,DC,DR,27,FRA,EU,HGC,No,Registered,57,59,Left,184,80,7,10,6,9,5,11,13,12,7,9,13,11,10,8,10,9,14,7,2,2,2,2,8,6,6,10,generated,-
Merlus,24,Kévin Colin,-,DC,DR/DM,33,FRA,EU,HGC,No,Registered,56,56,Right,192,88,4,12,9,11,5,10,12,11,9,12,12,11,11,10,11,10,11,7,2,2,2,2,10,5,6,11,generated,-
Merlus,22,Corentin Barbier,-,DR,-,28,FRA,EU,HGC,No,Registered,55,56,Left,180,81,6,10,10,11,12,11,10,9,10,12,9,10,10,10,13,13,10,10,2,2,2,2,11,11,11,11,generated,-
Merlus,14,Nathan Bates,-,DM,-,24,ENG,Non-EU,Non-HG,No,Registered,58,65,Left,177,78,7,12,12,9,7,12,10,8,10,10,12,13,13,10,12,9,9,9,2,2,2,2,14,8,8,13,generated,-
Merlus,16,Mario Castaño,-,MC,-,34,ESP,EU,Non-HG,No,Registered,55,55,Right,181,77,9,14,11,9,9,9,7,6,9,11,11,10,11,8,8,11,9,11,2,2,2,2,12,9,11,12,generated,-
Merlus,17,Anthony Gaillard,-,AMC,-,23,FRA,EU,HGC,No,Registered,56,59,Left,177,74,9,11,11,12,11,9,7,8,13,10,7,11,11,8,14,10,11,11,2,2,2,2,13,11,12,11,generated,-
Merlus,21,Eren Erdem,-,AML,-,21,TUR,Non-EU,Non-HG,Yes,U21 Exempt,55,62,Left,185,83,9,10,12,11,8,7,5,7,7,9,5,9,9,7,12,11,9,13,2,2,2,2,12,13,11,12,generated,-
Merlus,19,Boubacar Bamba,-,AMR,AMC,28,MLI,Non-EU,Non-HG,No,Registered,55,55,Right,179,75,11,8,11,12,8,6,5,8,8,11,6,9,9,9,12,10,9,12,2,2,2,2,11,11,12,8,generated,-
Merlus,30,Tom Fournier,-,ST,-,19,FRA,EU,Non-HG,Yes,U21 Exempt,55,67,Right,188,84,11,9,11,10,7,5,4,11,7,10,5,12,11,10,14,10,9,10,2,2,2,2,11,11,9,11,generated,-
Merlus,25,Quentin Lacroix,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,57,69,Left,186,83,2,9,2,8,2,3,3,4,8,12,12,7,12,9,6,7,9,12,11,11,10,12,12,2,2,10,generated,-
Merlus,31,Léo Lemaire,-,MC,-,17,FRA,EU,HGC,Yes,U21 Exempt,55,65,Right,177,73,9,11,10,10,10,10,7,8,11,13,9,12,10,10,11,10,11,14,2,2,2,2,9,10,11,12,generated,-
Merlus,32,Rayan Morin,-,ST,AMC,20,FRA,EU,HGC,Yes,U21 Exempt,56,62,Either,183,78,11,11,10,14,7,6,6,9,7,10,6,11,10,10,13,13,10,10,2,2,2,2,10,12,10,12,generated,-
```

### Ciel et Marine (Le Havre AC)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Ciel et Marine,1,Mahamadou Keïta,-,GK,-,26,CIV,Non-EU,Non-HG,No,Registered,61,61,Left,194,91,2,11,4,8,2,3,3,4,9,11,14,6,12,10,8,8,11,11,14,11,12,10,12,2,2,13,generated,-
Ciel et Marine,3,Antoine Guérin,-,DL,-,28,FRA,EU,HGN,No,Registered,63,66,Left,186,82,6,13,12,11,12,12,12,11,10,11,14,12,12,8,13,13,12,12,2,2,2,2,13,11,11,13,generated,capped by band
Ciel et Marine,4,Filip Vuković,-,DC,DL,28,CRO,EU,Non-HG,No,Registered,63,65,Right,184,73,4,11,9,10,3,12,12,16,9,10,13,12,11,11,10,12,14,10,2,2,2,2,14,5,5,11,generated,capped by band
Ciel et Marine,5,Sékou Diarra,-,DC,-,26,SEN,Non-EU,Non-HG,No,Registered,62,65,Right,189,89,6,10,8,10,5,14,12,14,7,10,14,12,10,10,10,12,11,9,2,2,2,2,13,6,4,11,generated,-
Ciel et Marine,2,David Maidana,-,DR,-,26,ARG,Non-EU,Non-HG,No,Registered,62,62,Right,187,84,7,12,12,10,10,14,13,7,10,11,11,12,10,10,13,15,12,11,2,2,2,2,12,10,10,12,generated,-
Ciel et Marine,6,Julien Bellanger,-,DM,-,30,FRA,EU,HGN,No,Registered,63,63,Left,181,75,7,12,9,12,6,13,12,11,12,13,13,13,12,10,10,12,12,11,2,2,2,2,13,8,9,13,generated,capped by band
Ciel et Marine,8,Issa Keïta,-,MC,DM,21,SEN,Non-EU,Non-HG,Yes,U21 Exempt,61,72,Right,185,79,7,14,12,11,9,13,10,8,11,13,11,12,11,9,13,12,11,11,2,2,2,2,12,11,9,13,generated,-
Ciel et Marine,10,Yoann Bellanger,-,MC,DM/AMC,25,FRA,EU,HGC,No,Registered,63,66,Right,178,78,8,15,12,10,9,13,7,6,10,14,11,13,13,9,12,13,10,13,2,2,2,2,12,12,13,12,generated,capped by band
Ciel et Marine,11,Freddie Wainwright,-,AML,ST,26,ENG,Non-EU,Non-HG,No,Registered,60,60,Left,176,68,11,12,14,13,9,7,4,8,9,12,5,12,10,8,13,12,7,12,2,2,2,2,11,11,13,12,generated,-
Ciel et Marine,7,Gaëtan Giraud,-,AMR,AMC/ST,27,FRA,EU,Non-HG,No,Registered,62,63,Right,178,75,11,10,13,14,9,5,6,6,9,11,6,11,10,8,14,11,11,14,2,2,2,2,12,11,14,11,generated,-
Ciel et Marine,9,Rúben Vilaça,-,ST,-,28,POR,EU,Non-HG,No,Registered,61,62,Right,179,80,11,10,10,11,7,6,5,12,9,12,6,13,13,10,13,13,13,11,2,2,2,2,13,14,10,12,generated,-
Ciel et Marine,13,Alexis Fournier,-,GK,-,21,FRA,EU,HGC,Yes,U21 Exempt,54,64,Left,194,87,2,8,3,6,2,3,3,4,7,11,12,7,10,9,5,6,8,12,11,11,10,9,10,2,2,8,generated,-
Ciel et Marine,23,Mathis Rousseau,-,DL,ML/WBL,30,FRA,EU,HGC,No,Registered,57,57,Left,187,84,6,11,11,11,12,11,12,11,10,9,11,11,11,7,12,11,9,11,2,2,2,2,12,10,8,12,generated,-
Ciel et Marine,15,Dylan Dufour,-,DC,-,23,FRA,EU,HGN,No,Registered,54,56,Right,182,75,4,9,7,9,5,11,12,10,7,9,12,11,9,10,10,9,12,9,2,2,2,2,11,6,6,8,generated,-
Ciel et Marine,24,Loïc Dufour,-,DC,DR,21,FRA,EU,HGC,Yes,U21 Exempt,54,59,Left,197,95,4,10,8,10,6,11,11,13,6,9,11,11,9,9,9,10,12,9,2,2,2,2,11,6,5,9,generated,-
Ciel et Marine,22,Gaëtan Noël,-,DR,DC,23,FRA,EU,HGN,No,Registered,56,59,Right,180,76,8,11,11,11,10,12,13,11,10,9,11,10,10,8,13,10,9,10,2,2,2,2,11,9,12,11,generated,-
Ciel et Marine,14,Luuk Dekker,-,DM,-,25,NED,EU,Non-HG,No,Registered,55,57,Right,181,81,7,10,9,11,6,10,11,10,9,12,12,11,12,10,10,10,9,9,2,2,2,2,11,8,8,14,generated,-
Ciel et Marine,30,Thomas Aubry,-,MC,-,20,FRA,EU,HGC,Yes,U21 Exempt,57,64,Left,178,77,10,11,10,11,8,11,8,7,13,12,10,11,11,8,10,11,10,10,2,2,2,2,12,10,8,12,generated,-
Ciel et Marine,17,Adrián Peláez,-,AMC,AML,27,ESP,EU,Non-HG,No,Registered,56,58,Either,185,83,10,11,13,12,9,8,6,6,13,9,8,12,9,10,11,12,10,10,2,2,2,2,12,9,12,11,generated,-
Ciel et Marine,21,Tom Bertrand,-,AML,AMC,20,FRA,EU,Non-HG,Yes,U21 Exempt,58,68,Left,182,78,11,10,10,13,8,7,5,5,8,9,4,12,8,8,14,12,8,13,2,2,2,2,11,15,11,9,generated,-
Ciel et Marine,19,Youssouf Sow,-,AMR,-,32,GUI,Non-EU,Non-HG,No,Registered,54,54,Right,178,75,9,10,14,10,9,5,6,6,9,11,6,9,9,8,12,9,7,12,2,2,2,2,9,11,9,10,generated,-
Ciel et Marine,18,Mathis Jacquet,-,ST,-,25,FRA,EU,HGN,No,Registered,55,56,Left,186,86,12,10,11,12,7,4,4,10,6,9,4,10,10,9,9,8,10,12,2,2,2,2,11,13,9,11,generated,-
Ciel et Marine,25,Nolan Guérin,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,55,65,Left,188,82,2,10,5,6,2,3,3,4,8,11,12,7,9,9,7,8,9,11,10,12,13,9,11,2,2,10,generated,-
Ciel et Marine,31,Jason Royer,-,MC,DM,18,FRA,EU,HGC,Yes,U21 Exempt,56,66,Right,175,65,10,11,11,10,8,11,8,6,13,11,10,11,11,10,12,11,9,10,2,2,2,2,12,11,10,12,generated,-
Ciel et Marine,32,Léo Pichon,-,ST,-,19,FRA,EU,HGC,Yes,U21 Exempt,54,64,Right,185,80,12,10,10,10,6,5,5,12,9,10,5,12,11,11,11,8,10,13,2,2,2,2,10,11,8,11,generated,-
```

### Scoïstes (Angers SCO)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Scoïstes,1,Enzo Pichon,-,GK,-,35,FRA,EU,HGN,No,Registered,56,56,Right,187,84,2,9,1,9,2,3,3,4,10,11,12,8,12,8,8,7,10,12,9,11,13,12,12,2,2,9,generated,-
Scoïstes,3,Can Şahin,-,DL,-,27,TUR,Non-EU,Non-HG,No,Registered,62,63,Left,190,90,7,13,13,10,12,12,12,11,11,14,11,13,11,8,12,14,10,10,2,2,2,2,13,11,8,13,generated,capped by band
Scoïstes,4,Bilal Meziane,-,DC,-,29,ALG,Non-EU,Non-HG,No,Registered,62,62,Right,185,79,5,11,6,10,5,13,13,15,8,8,13,12,9,11,8,11,15,9,2,2,2,2,13,6,5,9,generated,capped by band
Scoïstes,5,David Aguilera,-,DC,DR,28,ESP,EU,Non-HG,No,Registered,58,60,Right,188,91,3,9,8,10,4,11,11,13,8,11,11,13,11,9,11,9,13,11,2,2,2,2,13,6,6,12,generated,-
Scoïstes,2,Pascal Neumann,-,DR,DC,30,GER,EU,Non-HG,No,Registered,62,62,Right,182,77,9,11,12,13,13,11,13,10,10,13,12,11,10,9,14,14,13,11,2,2,2,2,12,10,10,12,generated,capped by band
Scoïstes,6,Léo Giraud,-,DM,-,29,FRA,EU,HGC,No,Registered,61,61,Right,194,90,7,11,11,12,8,14,10,9,11,12,13,15,11,8,12,10,10,12,2,2,2,2,13,10,10,12,generated,-
Scoïstes,8,Lamine Kaba,-,MC,AMC,26,SEN,Non-EU,Non-HG,No,Registered,60,61,Left,180,78,12,13,11,14,10,9,10,11,13,12,11,10,10,12,11,10,11,10,2,2,2,2,10,11,9,14,generated,-
Scoïstes,10,Matty Hargreaves,-,MC,-,24,ENG,Non-EU,Non-HG,No,Registered,58,63,Right,175,68,9,9,11,12,9,10,9,6,14,14,11,10,11,9,11,10,9,10,2,2,2,2,11,11,10,14,generated,-
Scoïstes,11,Florian Sauvage,-,AML,AMC,30,FRA,EU,HGN,No,Registered,61,61,Left,179,83,13,12,13,12,9,8,5,10,10,12,6,12,10,7,13,11,9,13,2,2,2,2,9,12,13,9,generated,-
Scoïstes,7,Mert Yıldız,-,AMR,-,30,TUR,Non-EU,Non-HG,No,Registered,62,62,Right,172,73,11,9,14,12,10,7,6,6,11,10,7,11,11,7,13,12,10,13,2,2,2,2,11,13,13,11,generated,capped by band
Scoïstes,9,Nikolaj Kristiansen,-,ST,-,36,DEN,EU,Non-HG,No,Registered,61,61,Right,181,80,13,8,11,11,8,5,4,11,9,12,8,14,12,10,14,12,11,12,2,2,2,2,12,13,11,13,generated,-
Scoïstes,13,Valentin Gaillard,-,GK,-,24,FRA,EU,HGC,No,Registered,53,59,Right,188,80,2,8,3,7,2,3,3,4,8,10,11,8,11,9,8,5,11,10,12,12,9,9,9,2,2,9,generated,-
Scoïstes,23,Florian Lemaire,-,DL,ML,31,FRA,EU,HGN,No,Registered,53,53,Left,177,72,7,13,11,10,7,12,12,8,10,10,9,12,8,8,12,8,11,11,2,2,2,2,11,10,9,12,generated,-
Scoïstes,15,Gaëtan Lemaire,-,DC,DL/DR,26,FRA,EU,HGC,No,Registered,57,59,Right,193,91,3,10,5,10,6,11,12,10,7,9,12,11,11,12,10,11,13,7,2,2,2,2,12,5,5,12,generated,-
Scoïstes,24,Yeray Almeida,-,DC,-,19,ESP,EU,Non-HG,Yes,U21 Exempt,53,67,Either,179,81,4,8,6,10,4,10,12,11,9,8,11,11,11,10,8,9,10,8,2,2,2,2,12,7,6,11,generated,-
Scoïstes,22,Lucas Lemaire,-,DR,-,29,FRA,EU,HGC,No,Registered,55,55,Right,181,70,6,10,10,12,9,11,11,10,11,11,13,10,11,8,13,11,10,10,2,2,2,2,11,10,9,11,generated,-
Scoïstes,30,Jason Blanchet,-,DM,-,18,FRA,EU,HGC,Yes,U21 Exempt,53,66,Left,175,74,6,9,9,9,8,12,10,10,10,11,9,10,9,11,10,10,10,9,2,2,2,2,12,7,7,13,generated,-
Scoïstes,14,Kamil Michalski,-,MC,DM,19,POL,EU,Non-HG,Yes,U21 Exempt,53,66,Right,181,81,7,11,9,11,7,10,8,7,11,10,9,11,11,8,9,10,10,11,2,2,2,2,10,8,9,12,generated,-
Scoïstes,17,Adil Ferhat,-,AMC,-,31,ALG,Non-EU,Non-HG,No,Registered,53,53,Left,173,69,10,11,12,11,8,8,5,8,10,10,6,10,11,7,9,10,11,11,2,2,2,2,10,9,11,10,generated,-
Scoïstes,21,Benjamin Dufour,-,AML,-,22,FRA,EU,HGN,No,Registered,54,57,Left,176,77,11,10,9,13,9,4,8,7,9,9,7,10,10,5,10,12,8,12,2,2,2,2,10,12,13,10,generated,-
Scoïstes,19,Loïc Noël,-,AMR,MR,28,FRA,EU,HGC,No,Registered,56,57,Right,175,67,10,10,12,12,8,4,5,5,8,8,7,12,8,7,12,10,9,13,2,2,2,2,10,11,13,13,generated,-
Scoïstes,18,Florian Guérin,-,ST,AMC,22,FRA,EU,HGC,No,Registered,60,63,Left,179,76,12,8,12,12,7,7,5,11,9,11,6,12,13,10,13,10,11,11,2,2,2,2,12,12,9,11,generated,-
Scoïstes,25,Adrien Aubry,-,GK,-,20,FRA,EU,HGC,Yes,U21 Exempt,53,58,Right,191,90,2,9,2,9,2,3,3,4,8,10,10,8,9,9,6,7,9,10,14,8,11,10,10,2,2,10,generated,-
Scoïstes,31,Rayan Aubry,-,MC,AMC,18,FRA,EU,HGC,Yes,U21 Exempt,55,69,Left,187,77,8,12,12,12,9,9,8,9,11,12,10,9,9,8,10,9,11,12,2,2,2,2,10,10,9,13,generated,-
Scoïstes,32,Loïc Rousseau,-,ST,-,21,FRA,EU,HGN,Yes,U21 Exempt,54,60,Right,180,80,11,10,11,9,7,4,1,10,8,11,5,11,11,9,11,12,10,10,2,2,2,2,9,13,9,11,generated,-
```

### Parisiens FC (Paris FC)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Parisiens FC,1,Marcel Fuchs,-,GK,-,35,GER,EU,Non-HG,No,Registered,61,61,Right,192,83,2,11,4,8,2,3,3,4,9,11,13,9,12,10,8,7,10,11,13,12,13,11,12,2,2,10,generated,-
Parisiens FC,3,Walid Meziane,-,DL,ML,29,ALG,Non-EU,Non-HG,No,Registered,61,61,Left,184,75,4,13,13,9,10,11,12,10,10,12,14,12,10,7,13,13,11,10,2,2,2,2,12,10,9,11,generated,-
Parisiens FC,4,Vincent Ndzie,-,DC,DL,25,COD,Non-EU,Non-HG,No,Registered,60,61,Right,191,85,4,12,7,9,6,12,12,15,8,10,12,12,10,10,10,11,12,11,2,2,2,2,13,7,6,11,generated,-
Parisiens FC,5,Jason Dufour,-,DC,DM,22,FRA,EU,HGN,No,Registered,59,63,Right,192,93,5,12,6,10,7,12,12,11,8,10,13,10,10,8,10,13,13,10,2,2,2,2,13,5,5,11,generated,-
Parisiens FC,2,Nathan Millet,-,DR,-,27,FRA,EU,HGC,No,Registered,60,61,Right,179,76,7,12,12,11,10,12,12,8,12,12,12,13,12,8,14,11,11,11,2,2,2,2,14,9,8,12,generated,-
Parisiens FC,6,Kaan Tekin,-,DM,-,23,TUR,Non-EU,Non-HG,No,Registered,60,65,Left,190,91,7,12,7,12,8,12,12,9,11,12,12,13,13,10,10,11,11,11,2,2,2,2,13,7,8,12,generated,-
Parisiens FC,8,Dylan Mercier,-,MC,AMC,31,FRA,EU,HGN,No,Registered,59,59,Right,172,73,8,13,10,9,7,10,10,10,13,14,10,11,11,10,10,10,8,10,2,2,2,2,11,10,10,14,generated,-
Parisiens FC,10,Rayan Sauvage,-,MC,-,27,FRA,EU,HGN,No,Registered,62,63,Right,185,82,8,12,10,15,8,11,9,9,14,12,11,11,11,11,11,10,11,10,2,2,2,2,11,10,12,15,generated,capped by band
Parisiens FC,11,Uche Akinola,-,AML,-,30,NGA,Non-EU,Non-HG,No,Registered,62,62,Left,174,69,10,12,13,12,10,6,5,7,14,12,6,10,10,8,14,11,8,13,2,2,2,2,10,13,13,12,generated,capped by band
Parisiens FC,7,Baptiste Arnaud,-,AMR,-,27,FRA,EU,HGN,No,Registered,58,59,Either,179,78,12,8,12,13,8,7,4,7,9,10,7,11,9,7,12,10,9,13,2,2,2,2,11,12,12,10,generated,-
Parisiens FC,9,Daan Bakker,-,ST,AML,24,NED,EU,Non-HG,No,Registered,62,68,Left,175,73,12,10,13,10,9,4,4,14,9,13,5,14,12,9,12,13,14,12,2,2,2,2,13,13,10,10,generated,capped by band
Parisiens FC,13,Jérémy Bertrand,-,GK,-,28,FRA,EU,HGC,No,Registered,56,59,Right,190,89,2,9,4,8,2,3,3,4,9,13,12,8,12,10,8,7,11,11,10,11,13,10,10,2,2,10,generated,-
Parisiens FC,23,Yanis Barbier,-,DL,-,27,FRA,EU,HGN,No,Registered,55,58,Left,182,84,5,10,9,10,12,13,10,9,11,10,12,9,10,8,12,11,11,10,2,2,2,2,10,9,10,10,generated,-
Parisiens FC,15,José Amaral,-,DC,-,25,POR,EU,Non-HG,No,Registered,54,57,Right,194,83,6,10,6,10,6,11,10,11,7,9,12,10,9,9,9,10,14,8,2,2,2,2,11,6,6,9,generated,-
Parisiens FC,24,Yoann Renaud,-,DC,-,31,FRA,EU,HGC,No,Registered,60,60,Right,192,90,6,11,7,8,6,13,12,13,11,10,12,13,10,10,10,11,12,11,2,2,2,2,14,5,7,10,generated,-
Parisiens FC,22,Dries Vandenberghe,-,DR,-,21,BEL,EU,Non-HG,Yes,U21 Exempt,54,64,Right,176,69,5,11,11,9,11,12,9,8,8,10,10,11,7,8,12,11,10,12,2,2,2,2,11,10,7,11,generated,-
Parisiens FC,14,Kalidou Camara,-,DM,MC/DC,32,GUI,Non-EU,Non-HG,No,Registered,54,54,Left,188,81,6,10,11,10,7,11,9,8,9,11,11,13,10,9,9,9,9,8,2,2,2,2,11,7,8,13,generated,-
Parisiens FC,16,Jason Carpentier,-,MC,-,33,FRA,EU,HGC,No,Registered,55,55,Right,179,70,8,13,11,11,9,9,8,9,12,12,8,9,9,9,12,9,9,11,2,2,2,2,9,10,13,12,generated,-
Parisiens FC,17,Stefano Piras,-,AMC,AMR/AML,30,ITA,EU,Non-HG,No,Registered,54,54,Right,177,77,12,12,10,11,10,7,7,9,10,10,7,10,11,9,11,11,9,11,2,2,2,2,11,11,11,13,generated,-
Parisiens FC,21,Sékou Sangaré,-,AML,-,29,GUI,Non-EU,Non-HG,No,Registered,54,54,Left,183,79,7,12,12,11,12,6,6,7,12,7,5,12,11,7,11,12,8,12,2,2,2,2,9,10,10,11,generated,-
Parisiens FC,30,Lucas Lambert,-,AMR,ST,18,FRA,EU,HGN,Yes,U21 Exempt,55,66,Right,177,78,9,11,10,11,12,5,6,6,11,10,5,11,11,7,12,10,8,12,2,2,2,2,9,10,12,10,generated,-
Parisiens FC,19,Quentin Marchand,-,ST,AMC,19,FRA,EU,HGC,Yes,U21 Exempt,55,71,Right,178,77,12,8,10,10,6,4,5,9,11,10,6,12,10,9,11,11,9,9,2,2,2,2,10,14,10,12,generated,-
Parisiens FC,25,Yoann Bertrand,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,53,62,Right,193,92,2,9,4,6,2,3,3,4,8,11,8,7,12,9,6,9,9,10,9,12,13,11,12,2,2,10,generated,-
Parisiens FC,31,Léo Perrot,-,MC,-,19,FRA,EU,HGC,Yes,U21 Exempt,53,63,Right,191,81,7,11,10,9,7,11,8,6,10,12,10,12,9,11,9,11,10,10,2,2,2,2,11,9,10,11,generated,-
Parisiens FC,32,Bastien Vidal,-,ST,-,20,FRA,EU,HGC,Yes,U21 Exempt,56,63,Right,181,80,11,9,10,12,9,5,2,10,8,11,4,11,13,8,11,11,10,10,2,2,2,2,10,12,9,11,generated,-
```

### Troyens (ES Troyes AC)
**Reputation:** 56 | **CA Band:** 50–59 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Troyens,1,Lamine Diallo,-,GK,-,33,SEN,Non-EU,Non-HG,No,Registered,57,57,Right,187,82,2,10,2,8,2,3,3,4,8,10,12,9,11,7,7,8,11,10,12,13,11,10,11,2,2,12,generated,-
Troyens,3,Lucas Arnaud,-,DL,DC,26,FRA,EU,HGC,No,Registered,58,60,Left,185,84,8,10,10,12,13,12,13,9,10,10,10,10,11,8,14,12,11,13,2,2,2,2,10,10,9,10,generated,-
Troyens,4,Aboubacar Gueye,-,DC,DL,30,MLI,Non-EU,Non-HG,No,Registered,56,56,Left,186,82,6,11,8,9,6,11,13,11,8,10,11,12,10,9,10,10,12,9,2,2,2,2,12,5,5,9,generated,-
Troyens,5,Tibo Dumont,-,DC,DM,28,BEL,EU,Non-HG,No,Registered,56,59,Right,190,80,5,10,11,11,4,10,11,10,8,11,13,12,11,9,9,12,14,8,2,2,2,2,11,5,5,11,generated,-
Troyens,2,Mahamadou Konaté,-,DR,-,32,CIV,Non-EU,Non-HG,No,Registered,55,55,Either,185,70,5,11,9,11,11,11,12,8,11,11,10,10,11,8,12,12,11,10,2,2,2,2,11,10,8,11,generated,-
Troyens,6,Antoine Fabre,-,DM,-,24,FRA,EU,Non-HG,No,Registered,58,62,Right,183,86,6,12,8,12,8,10,11,10,11,9,11,14,11,9,12,13,13,9,2,2,2,2,12,9,7,13,generated,-
Troyens,8,Adrien Barbier,-,MC,-,26,FRA,EU,HGC,No,Registered,53,54,Right,181,77,7,11,10,11,10,11,7,7,10,10,10,11,10,7,10,11,11,11,2,2,2,2,11,10,9,10,generated,-
Troyens,10,Quentin Noël,-,MC,-,27,FRA,EU,HGC,No,Registered,59,60,Left,181,76,8,12,10,12,9,11,9,9,12,13,9,10,11,10,11,10,12,12,2,2,2,2,11,11,11,14,generated,capped by band
Troyens,11,Karim Yattara,-,AML,-,29,GUI,Non-EU,Non-HG,No,Registered,59,59,Left,188,87,10,8,13,11,13,6,3,6,13,12,6,14,12,11,10,10,9,12,2,2,2,2,11,12,13,12,generated,capped by band
Troyens,7,Romain Mercier,-,AMR,-,31,FRA,EU,HGC,No,Registered,59,59,Right,186,91,11,9,12,12,9,5,5,8,9,11,7,10,10,8,14,10,9,13,2,2,2,2,10,13,11,9,generated,capped by band
Troyens,9,Patrick Eboué,-,ST,AML,25,CMR,Non-EU,Non-HG,No,Registered,59,61,Right,177,74,13,8,12,11,7,4,3,12,6,12,6,12,11,8,11,12,10,12,2,2,2,2,12,13,9,12,generated,capped by band
Troyens,13,Clément Morin,-,GK,-,22,FRA,EU,HGN,No,Registered,53,55,Right,192,89,2,8,5,8,2,3,3,4,9,10,10,7,10,8,8,5,11,10,12,11,11,9,10,2,2,11,generated,-
Troyens,23,Bastien Dufour,-,DL,-,30,FRA,EU,HGC,No,Registered,52,52,Left,178,76,6,12,10,10,9,10,12,8,10,11,10,12,9,8,10,10,9,8,2,2,2,2,10,7,9,10,generated,-
Troyens,15,Samuel Negrete,-,DC,-,23,ESP,EU,Non-HG,No,Registered,52,55,Right,182,77,3,8,6,8,6,9,10,12,7,8,10,10,9,8,8,11,14,8,2,2,2,2,13,4,7,9,generated,-
Troyens,24,Jérémy Renaud,-,DC,DM,26,FRA,EU,HGN,No,Registered,50,51,Right,193,93,5,10,8,8,4,9,9,12,9,13,12,10,8,10,8,9,11,9,2,2,2,2,8,6,5,9,generated,-
Troyens,22,Cláudio Nogueira,-,DR,-,24,POR,EU,Non-HG,No,Registered,54,56,Right,178,73,6,11,10,10,11,11,9,8,11,10,11,10,12,9,12,12,11,10,2,2,2,2,11,9,8,11,generated,-
Troyens,30,Yoann Poirier,-,DM,-,17,FRA,EU,HGC,Yes,U21 Exempt,52,62,Right,185,83,7,9,8,10,8,12,9,8,8,12,11,13,12,8,10,8,9,8,2,2,2,2,10,7,5,10,generated,-
Troyens,14,Jordy Willems,-,MC,AMC,30,NED,EU,Non-HG,No,Registered,50,50,Right,188,86,7,12,9,11,7,9,9,7,10,9,9,9,9,7,10,9,8,9,2,2,2,2,10,9,8,10,generated,-
Troyens,17,Eric Atangana,-,AMC,-,19,CMR,Non-EU,Non-HG,Yes,U21 Exempt,51,60,Left,176,70,12,9,11,13,9,7,4,8,11,8,8,12,9,9,9,10,9,8,2,2,2,2,11,9,9,11,generated,-
Troyens,21,Hugo Bellanger,-,AML,-,19,FRA,EU,HGC,Yes,U21 Exempt,52,67,Left,178,69,10,9,9,13,8,6,3,6,9,8,5,9,9,7,12,10,10,11,2,2,2,2,10,10,11,10,generated,-
Troyens,19,Max Beekman,-,AMR,MR,28,NED,EU,Non-HG,No,Registered,52,53,Right,177,67,10,8,13,11,9,5,6,7,9,9,6,11,9,6,9,9,10,11,2,2,2,2,8,12,9,11,generated,-
Troyens,18,Pedro Olmedo,-,ST,-,27,ESP,EU,Non-HG,No,Registered,55,58,Left,179,72,12,9,11,9,7,4,4,10,8,11,5,11,10,9,12,10,11,11,2,2,2,2,11,12,8,11,generated,-
Troyens,25,Alexis Carpentier,-,GK,-,19,FRA,EU,HGC,Yes,U21 Exempt,53,69,Right,193,87,2,9,2,6,2,3,3,4,8,10,12,8,11,10,7,7,10,10,11,11,10,10,9,2,2,9,generated,-
Troyens,31,Yoann Leclerc,-,MC,-,21,FRA,EU,HGC,Yes,U21 Exempt,53,59,Right,180,76,10,10,10,10,7,11,9,6,11,10,9,11,11,8,10,11,8,11,2,2,2,2,10,11,8,11,generated,-
Troyens,32,Yoann Royer,-,ST,-,20,FRA,EU,HGC,Yes,U21 Exempt,50,57,Right,182,80,11,9,11,10,5,4,6,11,8,11,6,9,8,6,8,9,11,10,2,2,2,2,10,10,10,10,generated,-
```

### Sang et Or du Mans (Le Mans FC)
**Reputation:** 55 | **CA Band:** 50–59 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Sang et Or du Mans,1,Léo Arnaud,-,GK,-,28,FRA,EU,HGN,No,Registered,57,60,Right,192,91,2,7,4,5,2,3,3,4,9,11,10,8,12,9,7,9,10,10,12,12,11,11,13,2,2,10,generated,-
Sang et Or du Mans,3,Tom Vasseur,-,DL,-,36,FRA,EU,HGC,No,Registered,58,58,Left,179,80,6,11,10,12,11,13,11,10,10,9,12,10,11,9,13,13,9,12,2,2,2,2,11,10,8,10,generated,-
Sang et Or du Mans,4,Mahamadou Sangaré,-,DC,DR,29,CIV,Non-EU,Non-HG,No,Registered,56,56,Right,186,80,4,12,8,8,6,12,13,11,7,9,11,10,9,9,8,10,12,11,2,2,2,2,12,7,4,10,generated,-
Sang et Or du Mans,5,Jérémy Lambert,-,DC,-,34,FRA,EU,HGN,No,Registered,54,54,Right,190,88,3,11,6,10,6,10,12,12,7,9,9,9,10,9,10,11,12,9,2,2,2,2,12,4,6,10,generated,-
Sang et Or du Mans,2,Damien Royer,-,DR,-,35,FRA,EU,HGC,No,Registered,57,57,Right,180,67,6,11,11,11,10,12,11,7,9,10,11,11,9,10,13,12,10,14,2,2,2,2,12,10,10,12,generated,-
Sang et Or du Mans,6,Guillaume Vidal,-,DM,-,25,FRA,EU,HGC,No,Registered,58,61,Left,183,83,7,13,10,11,7,11,10,10,10,12,12,13,11,8,8,9,9,11,2,2,2,2,12,9,7,13,generated,-
Sang et Or du Mans,8,Jasper Smits,-,MC,DM,24,NED,EU,Non-HG,No,Registered,58,60,Either,182,78,9,11,12,13,8,12,9,9,10,11,10,12,12,8,10,12,9,11,2,2,2,2,12,12,10,12,generated,-
Sang et Or du Mans,10,Xander Vermeulen,-,MC,-,25,BEL,EU,Non-HG,No,Registered,59,62,Left,183,80,8,12,13,11,8,10,10,8,13,11,11,13,13,10,11,11,10,10,2,2,2,2,12,12,11,12,generated,capped by band
Sang et Or du Mans,11,Moussa Kaba,-,AML,-,34,CIV,Non-EU,Non-HG,No,Registered,56,56,Left,182,80,8,10,13,10,12,6,4,7,9,10,5,12,11,7,12,12,10,11,2,2,2,2,10,12,12,10,generated,-
Sang et Or du Mans,7,Soufiane Saadi,-,AMR,AMC/MR,28,ALG,Non-EU,Non-HG,No,Registered,58,59,Right,176,73,11,10,14,11,9,6,6,5,9,11,6,9,9,7,13,10,8,13,2,2,2,2,11,12,10,11,generated,-
Sang et Or du Mans,9,Karim Fofana,-,ST,AMR/AMC,30,MLI,Non-EU,Non-HG,No,Registered,58,58,Right,183,78,12,10,12,10,8,4,5,12,10,12,7,14,9,10,11,11,13,12,2,2,2,2,12,13,8,12,generated,-
Sang et Or du Mans,13,Bastien Arnaud,-,GK,-,31,FRA,EU,HGC,No,Registered,50,50,Right,188,83,2,9,5,7,2,3,3,4,5,9,9,8,9,7,7,8,7,9,10,11,13,9,9,2,2,9,generated,-
Sang et Or du Mans,23,Domagoj Brkić,-,DL,-,28,CRO,EU,Non-HG,No,Registered,51,52,Left,186,78,5,9,10,10,10,11,11,9,10,11,11,10,9,7,11,10,11,11,2,2,2,2,10,8,6,8,generated,-
Sang et Or du Mans,15,Piotr Wójcik,-,DC,DM,30,POL,EU,Non-HG,No,Registered,54,54,Right,193,91,6,9,7,10,7,11,11,12,7,9,11,11,9,9,9,9,12,8,2,2,2,2,12,6,5,9,generated,-
Sang et Or du Mans,24,Anthony Poirier,-,DC,-,21,FRA,EU,HGC,Yes,U21 Exempt,56,63,Left,186,87,5,9,9,9,6,13,12,14,8,8,10,13,9,9,8,9,13,10,2,2,2,2,11,6,4,8,generated,-
Sang et Or du Mans,22,Aurélien Abanda,-,DR,-,29,CMR,Non-EU,Non-HG,No,Registered,50,50,Right,186,82,7,10,10,10,11,11,7,7,9,9,9,9,11,8,11,12,8,8,2,2,2,2,10,9,7,10,generated,-
Sang et Or du Mans,30,Sofiane Aubry,-,DM,MC,18,FRA,EU,HGC,Yes,U21 Exempt,51,63,Right,185,86,5,11,10,9,8,11,9,10,9,10,8,11,12,6,10,8,9,10,2,2,2,2,12,7,8,12,generated,-
Sang et Or du Mans,14,Gaëtan Royer,-,MC,-,23,FRA,EU,HGC,No,Registered,53,60,Right,182,76,9,11,9,12,8,10,8,9,10,13,9,10,8,8,8,10,9,10,2,2,2,2,11,9,7,10,generated,-
Sang et Or du Mans,17,Enzo Millet,-,AMC,-,22,FRA,EU,Non-HG,No,Registered,50,52,Right,179,73,9,10,11,13,9,9,7,7,9,8,8,10,8,8,10,10,11,9,2,2,2,2,10,9,12,10,generated,-
Sang et Or du Mans,21,Jason Morin,-,AML,ST/AMC,25,FRA,EU,HGC,No,Registered,51,52,Left,180,75,8,9,12,11,7,6,6,7,8,9,3,9,8,8,12,8,12,12,2,2,2,2,10,9,10,9,generated,-
Sang et Or du Mans,19,Bernardo Alves,-,AMR,-,23,POR,EU,Non-HG,No,Registered,54,58,Left,170,71,12,10,10,11,9,6,5,5,9,11,4,10,10,8,11,12,10,13,2,2,2,2,11,10,12,10,generated,-
Sang et Or du Mans,18,Thiago Castro,-,ST,-,28,BRA,Non-EU,Non-HG,No,Registered,54,56,Either,181,74,12,8,10,10,8,5,6,10,8,11,4,12,10,6,9,12,10,11,2,2,2,2,11,13,9,11,generated,-
Sang et Or du Mans,25,Julien Lacroix,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,52,65,Right,188,84,2,9,1,7,2,3,3,4,8,9,10,6,9,9,6,8,11,10,11,10,13,9,10,2,2,11,generated,-
Sang et Or du Mans,31,Loïc Marchand,-,MC,-,21,FRA,EU,HGC,Yes,U21 Exempt,52,60,Right,172,70,8,11,11,12,7,9,6,8,11,10,8,9,9,7,11,9,8,9,2,2,2,2,9,10,9,12,generated,-
Sang et Or du Mans,32,Rayan Chauvin,-,ST,-,21,FRA,EU,HGC,Yes,U21 Exempt,53,63,Either,182,73,11,8,10,11,6,5,6,10,9,11,5,11,10,9,10,9,11,9,2,2,2,2,9,11,8,11,generated,-
```
