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
Txuri-Urdin,1,Rafa Ferrer,-,GK,-,25,ESP,EU,HGN,No,Registered,71,71,Right,189,85,2,9,5,9,2,3,3,4,11,12,13,8,14,12,12,10,13,13,14,13,11,14,14,2,2,12,generated,-
Txuri-Urdin,3,Asger Andersen,-,DL,-,26,DEN,EU,Non-HG,No,Registered,74,76,Left,183,81,7,13,14,14,12,13,15,9,10,13,14,17,14,9,15,14,15,14,2,2,2,2,15,12,10,15,generated,capped by band
Txuri-Urdin,4,Vincenzo Piras,-,DC,DL/DM,31,ITA,EU,Non-HG,No,Registered,70,70,Left,189,93,2,11,9,10,5,14,14,15,8,14,14,13,12,13,12,15,13,11,2,2,2,2,14,6,6,16,generated,-
Txuri-Urdin,5,Hugo Cardozo,-,DC,-,32,COL,Non-EU,Non-HG,No,Registered,74,74,Right,192,87,5,14,9,12,8,17,17,16,11,15,16,15,15,12,13,12,17,10,2,2,2,2,15,7,4,15,generated,capped by band
Txuri-Urdin,2,Jens Sørensen,-,DR,WBR/DC,23,DEN,EU,HGN,No,Registered,73,77,Left,182,77,8,15,12,12,15,15,13,12,11,12,15,15,13,10,14,16,13,14,2,2,2,2,13,12,11,16,generated,-
Txuri-Urdin,6,Sunday Yakubu,-,DM,DC,27,NGA,Non-EU,Non-HG,No,Registered,70,73,Right,182,82,7,13,11,13,9,14,13,9,13,14,15,15,13,12,13,13,15,11,2,2,2,2,14,8,8,15,generated,-
Txuri-Urdin,8,Théo Pichon,-,MC,-,28,FRA,EU,Non-HG,No,Registered,73,73,Right,172,68,11,14,14,14,10,12,11,11,14,15,12,15,14,11,14,14,13,15,2,2,2,2,16,12,12,15,generated,-
Txuri-Urdin,10,Mateo Bermejo,-,MC,-,21,ESP,EU,HGC,Yes,U21 Exempt,69,77,Right,177,79,9,14,14,12,9,12,11,7,13,13,11,14,14,11,12,15,13,12,2,2,2,2,14,14,11,16,generated,-
Txuri-Urdin,11,Oskar Kowal,-,AML,AMC,27,POL,EU,Non-HG,No,Registered,73,73,Left,179,77,13,15,17,15,12,5,7,9,12,12,8,14,11,10,13,14,11,14,2,2,2,2,14,14,16,11,generated,-
Txuri-Urdin,7,Adrián Rojas,-,AMR,MR,23,ARG,Non-EU,Non-HG,No,Registered,73,77,Right,184,79,10,13,15,14,13,6,7,9,14,14,7,13,12,9,15,15,11,15,2,2,2,2,14,16,15,13,generated,-
Txuri-Urdin,9,Nico Almeida,-,ST,-,24,ESP,EU,HGC,No,Registered,70,74,Right,187,83,15,10,12,13,6,6,5,14,12,12,6,15,13,10,14,15,13,11,2,2,2,2,13,14,11,12,generated,-
Txuri-Urdin,13,Leonardo Messina,-,GK,-,21,ITA,EU,HGN,Yes,U21 Exempt,65,70,Right,187,78,2,9,2,10,2,3,3,4,10,13,13,10,13,10,10,5,11,12,14,13,12,13,13,2,2,11,generated,-
Txuri-Urdin,23,Tomás Alcázar,-,DL,DC,27,ESP,EU,HGC,No,Registered,69,72,Left,182,72,6,14,13,14,14,14,12,12,11,13,12,15,11,10,15,13,12,14,2,2,2,2,14,13,12,15,generated,-
Txuri-Urdin,15,Tim Smits,-,DC,DM,23,NED,EU,Non-HG,No,Registered,71,76,Either,186,82,4,12,7,12,5,15,14,16,11,11,16,14,14,11,12,15,15,12,2,2,2,2,16,5,5,15,generated,-
Txuri-Urdin,24,César Tapia,-,DC,DM,26,ESP,EU,HGC,No,Registered,66,68,Right,191,89,5,10,9,11,6,14,15,15,9,14,13,11,12,10,13,11,14,10,2,2,2,2,15,5,5,14,generated,-
Txuri-Urdin,22,Sergio Arjona,-,DR,-,20,ESP,EU,HGN,Yes,U21 Exempt,68,78,Right,183,76,7,12,13,13,13,12,12,8,10,11,12,13,14,10,14,15,11,14,2,2,2,2,12,12,10,13,generated,-
Txuri-Urdin,14,Nico Marín,-,DM,-,31,ESP,EU,HGN,No,Registered,66,66,Right,181,79,7,13,12,12,7,12,13,10,12,13,12,14,12,10,12,14,12,13,2,2,2,2,11,10,11,15,generated,-
Txuri-Urdin,30,Julián Izquierdo,-,MC,-,20,ESP,EU,HGC,Yes,U21 Exempt,66,71,Right,174,75,9,15,12,13,8,10,10,8,14,12,11,14,15,11,12,14,10,12,2,2,2,2,14,12,9,13,generated,-
Txuri-Urdin,17,Marcos Palomo,-,AMC,AML,30,ESP,EU,HGC,No,Registered,68,68,Right,177,76,12,14,12,14,11,9,7,8,13,13,10,14,13,10,13,13,11,13,2,2,2,2,14,13,11,15,generated,-
Txuri-Urdin,21,Adrián Aguilera,-,AML,ST/ML,28,ESP,EU,Non-HG,No,Registered,68,69,Left,184,80,12,13,15,14,12,7,4,7,12,11,7,11,13,8,14,13,14,15,2,2,2,2,15,13,15,14,generated,-
Txuri-Urdin,19,Enrique Barrios,-,AMR,ST/AMC,20,ESP,EU,Non-HG,Yes,U21 Exempt,68,80,Right,179,76,11,15,12,14,11,4,7,8,15,10,8,13,13,8,12,12,9,14,2,2,2,2,13,13,15,12,generated,-
Txuri-Urdin,18,Jan Heinz,-,ST,AML,21,GER,EU,HGN,Yes,U21 Exempt,66,74,Left,184,77,14,8,11,12,7,7,4,12,8,13,5,12,11,11,12,13,13,13,2,2,2,2,12,15,12,14,generated,-
Txuri-Urdin,25,Mario Cabrera,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,66,81,Right,186,80,2,11,5,9,2,3,3,4,9,14,14,10,14,10,6,9,13,11,13,13,14,10,14,2,2,10,generated,-
Txuri-Urdin,31,Joaquín Naranjo,-,MC,DM,17,ESP,EU,HGC,Yes,U21 Exempt,65,76,Right,182,75,10,13,13,12,9,11,9,10,13,13,11,15,13,11,11,14,10,12,2,2,2,2,14,11,11,14,generated,-
Txuri-Urdin,32,Óscar Salcedo,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,68,82,Right,186,91,14,12,12,11,8,4,4,14,12,12,6,14,13,11,14,13,14,13,2,2,2,2,12,14,8,14,generated,-
```

### Verdiblancos (Real Betis Balompié)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Verdiblancos,1,Ismael Maldonado,-,GK,-,25,ESP,EU,HGN,No,Registered,74,75,Right,183,83,2,12,2,9,2,3,3,4,10,16,14,11,14,10,8,11,13,13,14,13,14,15,15,2,2,14,generated,capped by band
Verdiblancos,3,Rodrigo Peixoto,-,DL,DC/ML,36,POR,EU,Non-HG,No,Registered,74,74,Left,185,83,7,12,13,11,14,14,14,13,10,14,15,16,14,10,15,17,11,15,2,2,2,2,14,15,11,14,generated,capped by band
Verdiblancos,4,Jens Andersen,-,DC,DR,29,DEN,EU,Non-HG,No,Registered,73,73,Right,184,74,3,11,10,13,6,17,14,14,9,14,15,14,13,12,11,13,16,11,2,2,2,2,14,4,2,16,generated,-
Verdiblancos,5,Rubén Olmedo,-,DC,DM,24,ESP,EU,HGN,No,Registered,74,76,Right,184,78,6,13,9,13,5,15,13,15,9,16,15,14,15,12,10,14,16,12,2,2,2,2,16,6,6,15,generated,capped by band
Verdiblancos,2,Mathis Fournier,-,DR,-,29,FRA,EU,Non-HG,No,Registered,73,73,Right,181,77,8,14,12,13,13,15,14,9,10,13,13,16,14,11,14,17,11,15,2,2,2,2,14,13,11,15,generated,-
Verdiblancos,6,Xavi Casado,-,DM,MC,28,ESP,EU,HGC,No,Registered,73,76,Right,175,72,8,15,10,13,11,15,14,12,13,15,14,16,13,11,13,17,13,11,2,2,2,2,16,9,9,17,generated,-
Verdiblancos,8,Victor Onuoha,-,MC,DM,29,NGA,Non-EU,Non-HG,No,Registered,72,72,Right,178,75,9,16,14,16,10,10,11,8,14,13,12,14,14,11,13,13,11,14,2,2,2,2,13,13,13,16,generated,-
Verdiblancos,10,Nico Barrios,-,MC,AMC,22,ESP,EU,HGC,No,Registered,73,78,Right,187,87,13,15,14,15,10,12,12,9,15,15,13,14,12,12,12,14,13,14,2,2,2,2,14,12,12,16,generated,-
Verdiblancos,11,Nico Trujillo,-,AML,ST,26,ESP,EU,HGC,No,Registered,72,72,Left,177,72,12,13,15,13,14,7,5,9,14,12,10,14,12,9,13,13,10,12,2,2,2,2,13,14,17,13,generated,-
Verdiblancos,7,Edoardo Bruni,-,AMR,ST,27,ITA,EU,Non-HG,No,Registered,74,77,Right,180,70,13,12,16,15,13,7,5,9,14,13,8,12,14,9,15,15,12,15,2,2,2,2,13,14,14,16,generated,capped by band
Verdiblancos,9,Lucas Ferrer,-,ST,AMR,31,ESP,EU,HGC,No,Registered,74,74,Right,181,69,15,13,14,13,9,6,5,15,10,12,6,14,14,11,14,14,14,12,2,2,2,2,14,15,13,15,generated,capped by band
Verdiblancos,13,Connor Nash,-,GK,-,23,USA,Non-EU,Non-HG,No,Registered,65,70,Right,186,78,2,12,3,8,2,3,3,4,9,12,14,7,14,11,9,9,11,11,13,14,15,14,14,2,2,11,generated,-
Verdiblancos,23,David Almeida,-,DL,-,23,ESP,EU,HGC,No,Registered,69,74,Right,182,77,5,14,14,12,11,15,11,11,11,13,15,15,15,10,17,12,12,13,2,2,2,2,15,11,10,13,generated,-
Verdiblancos,15,Issa Sangaré,-,DC,DR,25,SEN,Non-EU,Non-HG,No,Registered,65,68,Left,184,77,3,13,9,11,7,13,12,13,9,13,11,14,14,11,14,12,11,10,2,2,2,2,13,7,4,14,generated,-
Verdiblancos,24,Marco Tavares,-,DC,-,26,POR,EU,Non-HG,No,Registered,66,66,Right,185,74,3,12,7,11,5,14,16,12,10,13,13,13,12,11,14,12,16,8,2,2,2,2,13,7,5,12,generated,-
Verdiblancos,22,Yeray Bermejo,-,DR,-,27,ESP,EU,HGN,No,Registered,69,72,Right,182,80,7,12,13,13,15,13,14,11,9,12,13,16,10,10,15,14,13,13,2,2,2,2,13,12,9,13,generated,-
Verdiblancos,14,Ivo Varela,-,DM,-,25,ESP,EU,HGN,No,Registered,73,76,Right,190,90,9,14,11,13,7,16,13,11,13,14,14,18,14,11,14,15,15,14,2,2,2,2,17,9,9,17,generated,-
Verdiblancos,30,Javier Ferrer,-,MC,AMC,19,ESP,EU,HGN,Yes,U21 Exempt,68,80,Right,187,87,11,16,14,14,12,12,11,10,15,14,11,14,13,10,12,13,12,12,2,2,2,2,14,13,12,15,generated,-
Verdiblancos,17,Marko Žigić,-,AMC,-,25,CRO,EU,Non-HG,No,Registered,71,74,Right,176,69,11,14,16,14,13,9,10,9,16,12,12,13,13,11,12,14,13,14,2,2,2,2,13,16,13,14,generated,-
Verdiblancos,21,Yeray Toledo,-,AML,-,25,ESP,EU,HGN,No,Registered,66,69,Right,186,80,12,12,14,13,10,6,4,9,12,11,6,14,12,8,16,11,10,15,2,2,2,2,13,15,13,11,generated,-
Verdiblancos,19,Salvatore Cattaneo,-,AMR,ST,25,ITA,EU,Non-HG,No,Registered,67,69,Right,174,71,12,11,13,13,12,7,4,9,12,12,9,12,11,9,13,12,11,15,2,2,2,2,13,16,14,10,generated,-
Verdiblancos,18,Duarte Rebelo,-,ST,AMC,22,POR,EU,Non-HG,No,Registered,67,74,Left,187,84,14,11,13,14,8,5,5,15,11,12,8,12,12,7,15,12,14,12,2,2,2,2,13,14,11,14,generated,-
Verdiblancos,25,Mario Medina,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,65,79,Right,183,83,2,11,4,10,2,3,3,4,11,13,13,10,12,10,9,6,10,14,14,12,13,12,13,2,2,12,generated,-
Verdiblancos,31,Rafa Zamora,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,67,77,Right,179,75,10,14,10,12,10,11,12,10,13,14,12,16,14,10,10,13,14,13,2,2,2,2,13,15,11,15,generated,-
Verdiblancos,32,Ivo Camacho,-,ST,-,19,ESP,EU,HGC,Yes,U21 Exempt,68,81,Right,173,70,15,11,12,12,8,5,5,13,11,12,6,12,16,8,16,14,13,13,2,2,2,2,13,15,10,13,generated,-
```

### Hispalenses (Sevilla FC)
**Reputation:** 77 | **CA Band:** 64–73 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Hispalenses,1,Javier Rojas,-,GK,-,35,MEX,Non-EU,Non-HG,No,Registered,72,72,Right,194,91,2,10,3,10,2,3,3,4,11,15,14,10,13,10,9,10,14,14,15,15,14,13,16,2,2,12,generated,-
Hispalenses,3,Danilo Azevedo,-,DL,-,26,BRA,Non-EU,Non-HG,No,Registered,73,73,Right,180,76,7,14,13,13,15,14,14,12,12,13,15,13,13,10,15,14,14,15,2,2,2,2,12,10,11,16,generated,capped by band
Hispalenses,4,Ivo Cordero,-,DC,-,35,ESP,EU,HGC,No,Registered,73,73,Right,189,89,4,12,8,14,5,17,13,16,10,12,14,14,13,14,14,13,16,12,2,2,2,2,17,7,8,15,generated,capped by band
Hispalenses,5,Yeray Casado,-,DC,DL,29,ESP,EU,HGN,No,Registered,73,73,Right,183,79,3,13,10,11,5,13,16,17,9,17,16,16,13,13,13,12,17,10,2,2,2,2,15,7,7,15,generated,capped by band
Hispalenses,2,Nuno Carneiro,-,DR,-,25,POR,EU,Non-HG,No,Registered,73,73,Right,179,79,6,14,14,13,12,14,15,10,12,14,14,15,15,11,13,17,12,15,2,2,2,2,13,14,10,14,generated,capped by band
Hispalenses,6,Enrique Bustos,-,DM,-,31,ESP,EU,HGN,No,Registered,73,73,Right,181,73,8,10,13,14,9,15,14,13,13,13,16,11,12,11,13,15,14,12,2,2,2,2,16,9,9,17,generated,capped by band
Hispalenses,8,Tudor Bălan,-,MC,-,29,ROU,EU,Non-HG,No,Registered,72,72,Left,188,89,8,14,13,12,10,13,12,10,15,17,13,16,13,10,14,15,13,15,2,2,2,2,16,15,13,15,generated,-
Hispalenses,10,Anthony Baudry,-,MC,-,26,FRA,EU,Non-HG,No,Registered,71,71,Right,178,71,11,15,13,14,11,12,11,9,14,14,11,14,13,10,14,15,12,13,2,2,2,2,15,11,12,17,generated,-
Hispalenses,11,Jorge Calvo,-,AML,ML/AMC,32,ESP,EU,HGC,No,Registered,73,73,Left,179,76,14,15,14,15,12,7,6,8,14,13,6,13,13,9,16,12,12,14,2,2,2,2,15,13,15,14,generated,capped by band
Hispalenses,7,Hugo Arjona,-,AMR,-,25,ESP,EU,HGN,No,Registered,71,73,Either,184,80,12,12,16,14,13,7,6,8,14,11,6,12,12,8,15,14,12,16,2,2,2,2,13,14,14,13,generated,-
Hispalenses,9,Mario Arjona,-,ST,-,28,ESP,EU,HGC,No,Registered,73,75,Right,185,84,13,11,14,14,9,6,4,13,11,13,6,15,13,11,16,14,14,14,2,2,2,2,12,15,13,15,generated,capped by band
Hispalenses,13,Francisco Matos,-,GK,-,24,POR,EU,Non-HG,No,Registered,69,73,Right,187,85,2,11,2,8,2,3,3,4,10,11,15,8,12,9,9,10,13,13,15,13,14,14,14,2,2,10,generated,-
Hispalenses,23,Alexis Noël,-,DL,-,25,FRA,EU,Non-HG,No,Registered,64,65,Left,185,80,7,11,9,12,12,14,13,9,9,10,12,14,11,9,15,14,13,11,2,2,2,2,13,9,9,12,generated,-
Hispalenses,30,Diego Fajardo,-,DC,-,20,ESP,EU,HGN,Yes,U21 Exempt,67,79,Right,189,83,4,11,8,9,6,14,12,15,10,16,15,14,14,11,12,13,15,13,2,2,2,2,14,6,6,16,generated,-
Hispalenses,15,Adrián Fajardo,-,DC,DM,24,ESP,EU,HGN,No,Registered,67,70,Left,181,82,4,13,9,13,6,15,14,14,10,12,15,12,11,10,14,13,16,12,2,2,2,2,15,6,4,14,generated,-
Hispalenses,22,Yanis Baudry,-,DR,-,20,FRA,EU,Non-HG,Yes,U21 Exempt,66,72,Left,177,79,5,12,13,11,13,12,13,9,10,11,14,12,11,10,14,15,11,14,2,2,2,2,14,12,9,15,generated,-
Hispalenses,14,Julián Lorente,-,DM,DC,24,ESP,EU,HGN,No,Registered,65,70,Right,186,82,7,14,11,13,7,12,13,12,14,11,11,14,12,11,10,13,12,13,2,2,2,2,14,9,10,13,generated,-
Hispalenses,16,Toni Božić,-,MC,DM,24,CRO,EU,Non-HG,No,Registered,65,67,Left,181,83,10,10,14,12,11,10,10,9,13,14,11,14,12,9,12,12,11,13,2,2,2,2,13,10,10,14,generated,-
Hispalenses,17,Damian Lewandowicz,-,AMC,-,24,POL,EU,Non-HG,No,Registered,66,72,Right,181,79,11,11,15,14,10,8,7,6,14,12,9,12,12,12,12,13,12,13,2,2,2,2,12,14,14,13,generated,-
Hispalenses,21,Zakaria Berrada,-,AML,AMC,25,MAR,Non-EU,Non-HG,No,Registered,66,66,Left,180,73,11,11,13,14,10,6,4,9,11,10,6,12,12,10,14,11,12,15,2,2,2,2,12,14,15,14,generated,-
Hispalenses,19,Enrique Rebollo,-,AMR,-,20,ESP,EU,HGC,Yes,U21 Exempt,67,79,Right,172,64,11,12,13,15,10,7,4,8,11,11,8,13,11,7,14,14,9,14,2,2,2,2,11,15,15,12,generated,-
Hispalenses,18,Filipe Sampaio,-,ST,AML,27,POR,EU,Non-HG,No,Registered,65,66,Left,180,74,12,10,10,13,7,5,7,12,9,11,5,12,13,9,14,14,11,13,2,2,2,2,15,14,11,12,generated,-
Hispalenses,25,Miguel Robles,-,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,64,72,Left,193,88,2,8,2,8,2,3,3,4,10,12,14,9,11,10,8,10,9,13,13,16,15,14,13,2,2,10,generated,-
Hispalenses,31,Pablo Almeida,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,67,76,Either,180,86,11,13,13,14,9,12,12,9,13,13,12,14,13,11,12,14,11,13,2,2,2,2,14,13,11,15,generated,-
Hispalenses,32,Mario Garrido,-,ST,AMC,17,ESP,EU,HGC,Yes,U21 Exempt,67,78,Right,189,85,13,10,13,13,7,6,6,12,8,12,7,16,14,9,14,10,15,13,2,2,2,2,16,14,10,14,generated,-
```

### Bats (Valencia CF)
**Reputation:** 77 | **CA Band:** 64–73 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Bats,1,Paweł Jabłoński,-,GK,-,24,POL,EU,Non-HG,No,Registered,70,75,Left,185,81,2,11,5,7,2,3,3,4,10,14,13,11,11,11,6,9,14,11,14,16,13,14,13,2,2,13,generated,-
Bats,3,Fernando Trujillo,-,DL,-,25,ESP,EU,HGN,No,Registered,73,73,Right,188,84,8,13,13,15,12,13,13,12,10,14,14,14,15,10,15,17,11,13,2,2,2,2,15,11,12,14,generated,capped by band
Bats,4,Sékou Konaté,-,DC,DM,28,SEN,Non-EU,Non-HG,No,Registered,71,73,Right,193,87,4,13,8,11,7,12,16,12,10,13,15,12,12,10,13,13,15,11,2,2,2,2,16,8,5,15,generated,-
Bats,5,Joaquín Bustos,-,DC,-,27,ESP,EU,HGC,No,Registered,72,75,Right,191,82,7,11,9,12,7,14,17,16,10,13,15,15,12,11,12,13,17,12,2,2,2,2,16,6,4,15,generated,-
Bats,2,Davide Leone,-,DR,-,31,ITA,EU,Non-HG,No,Registered,73,73,Right,185,79,8,11,12,12,16,15,14,12,13,13,16,15,12,10,15,15,12,14,2,2,2,2,13,12,13,17,generated,capped by band
Bats,6,Daniel Salcedo,-,DM,DC,28,ESP,EU,HGC,No,Registered,73,74,Left,180,77,8,14,11,13,9,14,13,11,12,15,16,16,14,11,12,16,13,13,2,2,2,2,14,9,10,15,generated,capped by band
Bats,8,Julián Trujillo,-,MC,-,25,ESP,EU,HGN,No,Registered,73,76,Right,182,82,9,17,11,16,10,12,12,10,17,14,13,15,14,11,12,16,13,15,2,2,2,2,16,13,13,17,generated,capped by band
Bats,10,Rafa Casado,-,MC,AMC,35,ESP,EU,HGC,No,Registered,73,73,Left,179,83,12,14,14,15,11,12,13,9,15,16,13,17,14,11,14,13,13,13,2,2,2,2,15,15,11,16,generated,capped by band
Bats,11,Tudor Barbu,-,AML,-,27,ROU,EU,Non-HG,No,Registered,71,74,Left,176,70,12,14,16,17,12,4,5,8,13,12,7,14,13,9,14,13,13,15,2,2,2,2,14,14,16,13,generated,-
Bats,7,Denis Oprea,-,AMR,-,21,ROU,EU,Non-HG,Yes,U21 Exempt,70,79,Right,184,86,12,12,14,15,12,6,5,8,12,11,7,13,14,10,15,14,10,14,2,2,2,2,12,16,15,11,generated,-
Bats,9,Julien Rousseau,-,ST,AMC,28,FRA,EU,Non-HG,No,Registered,73,75,Right,183,81,15,12,12,11,8,6,3,12,11,12,6,15,12,11,12,13,14,16,2,2,2,2,14,15,13,15,generated,capped by band
Bats,13,Jorge Sanchís,-,GK,-,29,ESP,EU,Non-HG,No,Registered,67,67,Right,191,87,2,11,3,10,2,3,3,4,8,13,12,9,12,10,8,7,12,12,13,14,13,14,13,2,2,11,generated,-
Bats,23,Mateo Marín,-,DL,WBL,27,ESP,EU,Non-HG,No,Registered,65,65,Left,185,78,5,11,11,12,11,12,12,13,11,13,14,12,10,9,13,14,11,13,2,2,2,2,13,12,9,14,generated,-
Bats,30,Sergio Ibáñez,-,DC,-,19,ESP,EU,HGN,Yes,U21 Exempt,65,79,Left,183,78,3,9,11,9,6,14,12,15,9,13,14,11,12,9,11,12,14,11,2,2,2,2,12,5,7,12,generated,-
Bats,15,Fábio Rebelo,-,DC,-,25,POR,EU,Non-HG,No,Registered,66,67,Right,189,79,2,12,8,11,5,14,16,12,10,12,13,11,13,13,13,13,15,10,2,2,2,2,13,7,5,14,generated,-
Bats,22,Óscar Aguilera,-,DR,-,27,ESP,EU,Non-HG,No,Registered,67,67,Right,184,80,6,12,11,12,13,15,15,12,10,11,11,16,12,12,15,14,11,14,2,2,2,2,13,12,11,15,generated,-
Bats,14,Frederik Poulsen,-,DM,-,19,DEN,EU,Non-HG,Yes,U21 Exempt,65,74,Right,174,70,5,14,13,13,8,14,13,9,11,15,12,14,13,11,10,11,11,11,2,2,2,2,13,9,9,16,generated,-
Bats,16,Taiwo Mohammed,-,MC,-,26,NGA,Non-EU,Non-HG,No,Registered,67,67,Left,177,70,8,15,12,12,11,11,11,9,14,14,14,14,13,12,15,12,10,13,2,2,2,2,12,11,11,14,generated,-
Bats,17,Stefano Carbone,-,AMC,AMR,31,ITA,EU,Non-HG,No,Registered,68,68,Right,176,69,11,15,12,14,11,9,8,10,15,12,10,13,13,11,11,13,11,14,2,2,2,2,13,15,14,15,generated,-
Bats,21,Callum Hayes,-,AML,-,33,USA,Non-EU,Non-HG,No,Registered,66,66,Left,188,92,12,11,16,13,13,6,5,8,12,11,8,12,10,8,13,10,10,15,2,2,2,2,12,12,14,13,generated,-
Bats,19,Raúl Bustos,-,AMR,ST,28,ESP,EU,HGC,No,Registered,68,68,Left,181,77,12,14,16,14,14,7,8,8,13,12,8,14,12,9,15,14,8,15,2,2,2,2,16,15,12,12,generated,-
Bats,18,Renato Coelho,-,ST,-,31,POR,EU,Non-HG,No,Registered,66,66,Right,181,81,16,13,14,12,6,6,4,14,10,10,4,13,13,9,15,12,12,14,2,2,2,2,12,14,12,13,generated,-
Bats,25,Guillermo Bustos,-,GK,-,19,ESP,EU,Non-HG,Yes,U21 Exempt,67,80,Right,186,81,2,11,4,9,2,3,3,4,10,13,14,9,14,10,9,8,13,12,12,12,15,13,14,2,2,12,generated,-
Bats,31,Carlos Cabrera,-,MC,-,17,ESP,EU,HGC,Yes,U21 Exempt,67,77,Left,182,78,8,13,12,14,9,12,10,7,13,13,12,16,11,8,12,13,12,13,2,2,2,2,14,10,12,17,generated,-
Bats,32,Mateo Zamora,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,65,77,Right,186,84,13,9,13,12,8,7,5,11,9,11,5,12,13,8,14,13,12,10,2,2,2,2,13,15,11,13,generated,-
```

### Celestes (RC Celta de Vigo)
**Reputation:** 74 | **CA Band:** 62–71 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Celestes,1,Petros Papadakis,-,GK,-,25,GRE,EU,Non-HG,No,Registered,65,67,Right,191,85,2,12,3,10,2,3,3,4,10,14,11,10,12,11,8,8,10,13,15,16,12,13,12,2,2,13,generated,-
Celestes,3,Sotiris Nikolaidis,-,DL,DC/WBL,24,GRE,EU,Non-HG,No,Registered,70,73,Left,180,79,7,12,11,13,12,15,16,11,11,14,13,14,11,8,15,17,12,12,2,2,2,2,13,11,9,17,generated,-
Celestes,4,David Bermejo,-,DC,-,30,ESP,EU,HGC,No,Registered,70,70,Right,196,91,5,11,9,11,4,14,14,13,10,13,14,13,15,10,12,13,15,12,2,2,2,2,14,7,6,13,generated,-
Celestes,5,Taiwo Okafor,-,DC,-,31,NGA,Non-EU,Non-HG,No,Registered,71,71,Either,188,83,5,12,8,12,4,15,15,15,10,15,14,13,12,11,12,13,16,12,2,2,2,2,13,8,6,13,generated,capped by band
Celestes,2,Óscar Alcázar,-,DR,WBR,30,ESP,EU,HGC,No,Registered,70,70,Right,179,75,8,13,12,14,14,15,12,10,11,10,13,16,13,10,14,14,14,13,2,2,2,2,15,14,10,18,generated,-
Celestes,6,Lorenzo Rizzo,-,DM,DC,28,ITA,EU,Non-HG,No,Registered,70,72,Right,183,80,6,15,10,12,9,15,14,11,13,16,13,14,13,11,11,19,14,12,2,2,2,2,17,7,8,14,generated,-
Celestes,8,Yeray Arjona,-,MC,DM/AMC,30,ESP,EU,HGC,No,Registered,71,71,Right,181,79,9,16,12,15,12,13,10,11,14,13,12,15,13,13,13,15,11,16,2,2,2,2,14,11,12,16,generated,capped by band
Celestes,10,Rubén Vidal,-,MC,-,32,ESP,EU,HGN,No,Registered,68,68,Right,178,79,8,14,14,15,10,12,11,10,15,14,12,14,13,12,11,14,13,12,2,2,2,2,14,13,11,15,generated,-
Celestes,11,Carlos Sampaio,-,AML,ML,29,POR,EU,Non-HG,No,Registered,68,68,Left,171,66,10,13,13,11,16,7,4,7,11,12,7,13,13,9,15,15,10,14,2,2,2,2,16,13,12,13,generated,-
Celestes,7,Ola Salisu,-,AMR,-,27,NGA,Non-EU,Non-HG,No,Registered,71,72,Right,177,70,12,13,16,14,12,7,7,6,12,14,7,12,13,10,16,13,12,15,2,2,2,2,14,13,15,13,generated,capped by band
Celestes,9,Rafa Naranjo,-,ST,-,26,ESP,EU,HGC,No,Registered,66,69,Left,183,81,13,11,12,12,5,6,5,12,11,11,7,14,13,10,13,12,14,12,2,2,2,2,14,14,11,13,generated,-
Celestes,13,Florian Dufour,-,GK,-,27,FRA,EU,Non-HG,No,Registered,62,65,Right,191,88,2,6,5,9,2,3,3,4,10,11,13,11,13,8,9,8,10,11,13,12,13,13,12,2,2,11,generated,-
Celestes,23,Paulo Bastos,-,DL,-,26,POR,EU,Non-HG,No,Registered,65,65,Left,180,73,7,11,11,12,12,13,12,11,10,11,14,15,12,8,13,13,11,12,2,2,2,2,13,11,11,13,generated,-
Celestes,15,Guillermo Salcedo,-,DC,DL,27,ESP,EU,HGC,No,Registered,66,66,Right,183,77,4,11,7,11,6,14,14,13,9,13,13,12,12,11,13,12,15,12,2,2,2,2,14,8,5,13,generated,-
Celestes,24,Zakaria Lahlou,-,DC,-,23,MAR,Non-EU,Non-HG,No,Registered,63,67,Right,194,88,3,8,7,11,7,13,14,12,7,12,13,12,10,9,11,9,13,10,2,2,2,2,13,6,5,15,generated,-
Celestes,22,Carlos Peláez,-,DR,DC,24,ESP,EU,HGC,No,Registered,66,68,Right,178,70,8,10,13,11,13,12,13,10,9,13,13,14,11,10,15,13,11,16,2,2,2,2,14,12,10,12,generated,-
Celestes,14,Lars Kessler,-,DM,DC/MC,21,GER,EU,Non-HG,Yes,U21 Exempt,65,77,Right,182,82,7,12,11,11,9,13,12,12,10,12,13,14,13,10,12,15,9,12,2,2,2,2,12,9,7,13,generated,-
Celestes,16,Mateo Almeida,-,MC,-,29,ESP,EU,HGC,No,Registered,63,63,Left,180,74,9,13,12,12,10,13,8,7,12,13,10,15,12,8,12,14,12,11,2,2,2,2,11,11,10,16,generated,-
Celestes,17,Cristian Trujillo,-,AMC,-,26,ESP,EU,HGC,No,Registered,63,66,Right,179,75,11,13,15,14,10,7,6,8,13,14,10,14,11,10,13,12,11,10,2,2,2,2,12,14,14,13,generated,-
Celestes,21,Alexandru Sandu,-,AML,-,21,ROU,EU,Non-HG,Yes,U21 Exempt,62,72,Left,182,75,12,13,14,15,11,5,4,6,10,11,8,12,10,8,14,10,12,12,2,2,2,2,11,11,12,11,generated,-
Celestes,19,Ismael Cano,-,AMR,MR,27,ESP,EU,HGC,No,Registered,65,66,Right,182,81,13,12,14,13,11,6,6,6,11,9,8,12,13,9,14,13,11,15,2,2,2,2,12,12,13,13,generated,-
Celestes,30,Santi Lara,-,ST,-,17,ESP,EU,HGC,Yes,U21 Exempt,62,78,Right,182,80,15,9,13,12,7,4,8,13,11,12,7,14,14,8,13,10,13,12,2,2,2,2,11,14,10,12,generated,-
Celestes,25,Nacho Medina,-,GK,-,19,ESP,EU,HGC,Yes,U21 Exempt,63,79,Left,183,78,2,9,4,10,2,3,3,4,8,12,11,8,13,8,8,9,11,9,13,11,12,12,10,2,2,12,generated,-
Celestes,31,Raúl Ortuño,-,MC,AMC,20,ESP,EU,HGC,Yes,U21 Exempt,62,68,Left,182,79,10,12,14,14,9,13,10,8,11,10,12,14,12,10,11,13,11,10,2,2,2,2,12,10,11,15,generated,-
Celestes,32,Rubén Valdés,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,62,73,Right,184,80,12,9,11,12,8,4,5,11,10,13,7,11,12,6,14,14,14,11,2,2,2,2,13,13,11,13,generated,-
```

### Franjirrojos (Rayo Vallecano de Madrid)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Franjirrojos,1,Ricardo Machado,-,GK,-,23,POR,EU,Non-HG,No,Registered,67,72,Right,190,85,2,9,1,10,2,3,3,4,7,14,12,9,13,11,7,7,13,10,14,13,15,14,15,2,2,12,generated,-
Franjirrojos,3,Jorge Rivero,-,DL,ML/DC,33,ARG,Non-EU,Non-HG,No,Registered,68,68,Right,187,83,7,12,12,12,12,11,13,12,10,11,13,14,13,9,14,13,12,9,2,2,2,2,13,13,8,14,generated,-
Franjirrojos,4,Ivo Ibáñez,-,DC,-,28,ESP,EU,HGC,No,Registered,65,65,Right,187,82,5,12,7,10,5,13,12,13,11,12,12,13,14,9,12,10,14,9,2,2,2,2,13,8,5,14,generated,-
Franjirrojos,5,Rubén Naranjo,-,DC,-,23,ESP,EU,HGC,No,Registered,69,76,Right,191,83,5,10,9,13,7,15,14,15,11,14,15,11,11,11,12,14,15,11,2,2,2,2,12,6,8,15,generated,capped by band
Franjirrojos,2,Sergio Montiel,-,DR,-,25,ARG,Non-EU,Non-HG,No,Registered,65,66,Left,183,74,9,11,13,11,14,16,12,10,10,12,12,14,11,9,15,13,12,12,2,2,2,2,13,12,12,16,generated,-
Franjirrojos,6,Emil Bech,-,DM,MC,29,DEN,EU,Non-HG,No,Registered,64,64,Either,188,86,7,10,11,13,8,15,14,11,11,11,12,15,10,8,12,13,13,11,2,2,2,2,12,10,9,13,generated,-
Franjirrojos,8,Ruben Mulder,-,MC,-,27,NED,EU,Non-HG,No,Registered,67,69,Left,180,70,9,13,14,14,8,12,11,8,14,12,12,14,14,10,11,16,10,11,2,2,2,2,15,12,12,14,generated,-
Franjirrojos,10,Damian Wójcik,-,MC,DM,33,POL,EU,Non-HG,No,Registered,63,63,Right,179,70,10,14,11,11,9,11,10,7,13,13,11,14,12,9,12,15,10,12,2,2,2,2,13,12,10,13,generated,-
Franjirrojos,11,Mateo Medina,-,AML,ML,24,ESP,EU,HGC,No,Registered,65,71,Right,180,80,11,11,14,13,11,7,6,7,11,10,5,12,13,8,14,14,9,15,2,2,2,2,11,11,15,13,generated,-
Franjirrojos,7,Julián Rebollo,-,AMR,-,29,ESP,EU,HGC,No,Registered,69,69,Right,179,70,11,16,18,14,11,7,7,7,13,12,6,11,13,9,17,12,12,15,2,2,2,2,13,13,12,13,generated,capped by band
Franjirrojos,9,Joaquín Segura,-,ST,-,22,ESP,EU,HGC,No,Registered,65,71,Left,176,70,14,10,11,12,7,7,3,12,7,12,9,12,15,9,13,11,12,12,2,2,2,2,14,14,9,12,generated,-
Franjirrojos,13,Lorenzo Orlando,-,GK,-,31,ITA,EU,Non-HG,No,Registered,60,60,Left,194,89,2,8,2,8,2,3,3,4,10,12,12,9,12,10,7,9,11,10,13,12,12,13,13,2,2,10,generated,-
Franjirrojos,23,Tomás Salcedo,-,DL,-,25,ESP,EU,HGN,No,Registered,61,61,Right,184,78,6,11,13,10,10,12,12,9,10,8,12,12,10,9,14,13,11,12,2,2,2,2,11,11,10,13,generated,-
Franjirrojos,15,Léo Royer,-,DC,-,35,FRA,EU,Non-HG,No,Registered,62,62,Either,183,80,6,10,7,10,5,14,14,12,10,13,12,11,12,10,12,12,13,10,2,2,2,2,13,5,4,13,generated,-
Franjirrojos,24,Dídac Montero,-,DC,-,27,ESP,EU,HGN,No,Registered,60,63,Right,192,90,4,10,7,10,4,12,13,15,9,13,12,12,10,11,12,13,11,9,2,2,2,2,13,5,4,12,generated,-
Franjirrojos,22,Gonçalo Viana,-,DR,-,27,POR,EU,Non-HG,No,Registered,62,62,Right,189,88,5,12,12,11,11,16,12,11,12,12,10,14,12,10,15,13,10,11,2,2,2,2,12,10,10,13,generated,-
Franjirrojos,14,Giovanni Cattaneo,-,DM,MC,25,ITA,EU,Non-HG,No,Registered,64,67,Right,188,82,8,12,11,11,8,15,13,10,12,12,15,15,12,9,11,15,13,11,2,2,2,2,12,9,9,14,generated,-
Franjirrojos,30,Fernando Lara,-,MC,AMC/DM,20,ESP,EU,HGC,Yes,U21 Exempt,60,72,Right,179,78,9,11,13,14,10,11,8,7,11,13,11,10,12,9,13,11,10,13,2,2,2,2,14,12,13,14,generated,-
Franjirrojos,17,Guillermo Rojas,-,AMC,AMR,26,MEX,Non-EU,Non-HG,No,Registered,61,63,Left,175,72,9,13,12,13,9,9,8,7,11,12,8,12,11,10,10,11,10,12,2,2,2,2,11,13,10,11,generated,-
Franjirrojos,21,Mario Olmedo,-,AML,ST,27,ESP,EU,HGN,No,Registered,63,66,Left,187,82,12,11,15,12,9,7,6,7,11,11,5,12,11,7,14,11,10,13,2,2,2,2,12,12,12,13,generated,-
Franjirrojos,19,Andrés Barrios,-,AMR,MR,36,ESP,EU,HGN,No,Registered,60,60,Right,173,74,11,13,13,13,9,6,6,7,10,10,6,12,10,8,14,12,9,12,2,2,2,2,12,13,13,11,generated,-
Franjirrojos,18,Xavi Vidal,-,ST,AMR,24,ESP,EU,HGC,No,Registered,62,64,Left,190,85,13,10,13,12,7,6,5,11,10,12,4,11,12,9,12,11,11,10,2,2,2,2,11,12,10,12,generated,-
Franjirrojos,25,Guillermo Peláez,-,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,60,71,Right,186,80,2,8,4,8,2,3,3,4,9,12,11,8,12,9,7,7,9,11,13,14,13,11,15,2,2,11,generated,-
Franjirrojos,31,Diego Toledo,-,MC,AMC,19,ESP,EU,HGC,Yes,U21 Exempt,62,76,Either,181,74,9,13,12,13,9,11,8,10,12,13,10,13,13,8,13,13,9,12,2,2,2,2,11,11,12,14,generated,-
Franjirrojos,32,Héctor Tapia,-,ST,AML,17,ESP,EU,Non-HG,Yes,U21 Exempt,61,75,Right,183,82,13,9,10,13,6,5,2,12,10,9,5,12,14,11,13,13,11,12,2,2,2,2,8,13,10,12,generated,-
```

### Rojillos (CA Osasuna)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Rojillos,1,Douglas Queiroz,-,GK,-,34,BRA,Non-EU,Non-HG,No,Registered,69,69,Left,189,81,2,9,3,8,2,3,3,4,9,15,13,10,14,12,9,10,11,11,14,15,14,13,14,2,2,11,generated,capped by band
Rojillos,3,Tom Van den Heuvel,-,DL,-,36,NED,EU,Non-HG,No,Registered,67,67,Left,182,77,7,10,12,13,10,14,13,10,9,11,12,12,13,9,15,13,11,11,2,2,2,2,14,12,8,13,generated,-
Rojillos,4,Dídac Salcedo,-,DC,-,29,ESP,EU,HGC,No,Registered,69,69,Right,194,101,4,12,8,10,5,17,18,15,9,13,15,13,13,10,13,11,15,10,2,2,2,2,13,5,5,15,generated,capped by band
Rojillos,5,Lorenzo Barone,-,DC,DL,25,ITA,EU,Non-HG,No,Registered,69,71,Right,187,79,3,9,8,12,5,14,17,12,10,12,14,12,11,13,13,13,13,10,2,2,2,2,14,5,6,14,generated,capped by band
Rojillos,2,Martín Naranjo,-,DR,-,28,ESP,EU,HGC,No,Registered,64,65,Right,179,73,8,13,13,9,12,11,13,9,12,13,11,13,9,10,13,15,12,13,2,2,2,2,12,11,8,14,generated,-
Rojillos,6,Aitor Rebollo,-,DM,-,27,ESP,EU,HGC,No,Registered,63,63,Right,168,61,7,11,11,12,8,15,12,9,12,14,12,13,13,10,11,14,11,12,2,2,2,2,15,8,8,15,generated,-
Rojillos,8,Álvaro Casado,-,MC,-,24,ESP,EU,Non-HG,No,Registered,68,74,Right,178,73,9,16,12,16,12,11,11,9,13,14,12,15,13,8,13,14,11,13,2,2,2,2,12,12,12,15,generated,-
Rojillos,10,Yeray Montero,-,MC,-,24,ESP,EU,HGN,No,Registered,69,74,Left,180,75,8,14,14,14,11,11,11,11,15,15,11,16,12,12,12,13,11,12,2,2,2,2,15,10,12,17,generated,capped by band
Rojillos,11,Vítor Peixoto,-,AML,-,27,POR,EU,Non-HG,No,Registered,69,72,Left,174,74,11,12,15,15,12,7,5,9,13,12,5,14,12,8,14,11,11,15,2,2,2,2,14,16,14,13,generated,capped by band
Rojillos,7,Jorge Valdés,-,AMR,ST,28,ESP,EU,HGC,No,Registered,68,68,Right,172,68,11,12,15,13,13,6,4,8,11,12,8,14,14,8,14,12,11,15,2,2,2,2,13,13,16,14,generated,-
Rojillos,9,Mario Rebollo,-,ST,-,29,ESP,EU,HGC,No,Registered,69,69,Left,181,74,14,11,15,15,6,5,5,11,10,10,5,13,13,10,14,13,14,12,2,2,2,2,15,15,14,15,generated,capped by band
Rojillos,13,Petros Dimitriou,-,GK,-,28,GRE,EU,Non-HG,No,Registered,60,61,Right,187,81,2,8,4,7,2,3,3,4,9,12,14,8,12,9,6,8,12,11,12,12,11,13,11,2,2,11,generated,-
Rojillos,23,Philipp Wagner,-,DL,WBL,27,GER,EU,Non-HG,No,Registered,60,60,Left,187,85,5,12,13,12,12,10,12,8,10,11,11,12,11,8,13,14,12,12,2,2,2,2,15,8,7,13,generated,-
Rojillos,15,Aitor Zamora,-,DC,-,31,ESP,EU,HGN,No,Registered,63,63,Left,187,83,5,10,9,9,6,16,13,13,8,13,15,13,13,9,14,12,14,11,2,2,2,2,14,5,6,14,generated,-
Rojillos,24,Jesús Calvo,-,DC,DR/DL,26,ESP,EU,HGC,No,Registered,62,63,Either,184,77,6,9,8,9,4,14,13,13,8,15,12,11,12,13,11,10,13,10,2,2,2,2,13,7,5,12,generated,-
Rojillos,22,Théo Tessier,-,DR,-,25,FRA,EU,Non-HG,No,Registered,60,63,Right,178,71,5,10,9,12,12,11,11,8,10,11,13,14,12,9,11,11,10,12,2,2,2,2,13,11,9,14,generated,-
Rojillos,14,Enrique Lorente,-,DM,-,26,ESP,EU,HGC,No,Registered,63,63,Right,182,76,7,15,9,11,8,13,13,12,12,14,14,14,14,11,10,12,10,11,2,2,2,2,14,8,9,15,generated,-
Rojillos,16,Héctor Heredia,-,MC,AMC/DM,22,ESP,EU,Non-HG,No,Registered,62,68,Right,181,81,8,12,12,14,8,11,11,9,11,14,11,13,13,10,10,13,9,10,2,2,2,2,15,10,12,12,generated,-
Rojillos,17,Zvonimir Perić,-,AMC,AMR,30,CRO,EU,Non-HG,No,Registered,61,61,Right,182,77,11,12,13,13,12,7,6,7,13,11,7,13,11,9,12,12,11,13,2,2,2,2,12,11,12,13,generated,-
Rojillos,21,Lucas Cabral,-,AML,-,31,ARG,Non-EU,Non-HG,No,Registered,65,65,Left,182,78,10,12,14,15,12,6,5,9,13,11,8,12,12,10,15,12,11,14,2,2,2,2,14,15,12,12,generated,-
Rojillos,19,Mehdi Bennani,-,AMR,-,21,MAR,Non-EU,Non-HG,Yes,U21 Exempt,63,69,Right,177,67,14,13,14,12,14,7,5,6,13,10,6,11,10,8,14,11,8,13,2,2,2,2,13,13,15,13,generated,-
Rojillos,30,Gonzalo Heredia,-,ST,-,21,ESP,EU,HGN,Yes,U21 Exempt,61,71,Right,186,86,13,9,12,10,7,4,3,11,9,9,5,11,11,7,13,12,13,11,2,2,2,2,12,13,9,12,generated,-
Rojillos,25,Marcos Heredia,-,GK,-,21,ESP,EU,HGC,Yes,U21 Exempt,61,68,Right,198,92,2,9,4,7,2,3,3,4,7,9,13,9,12,9,7,9,11,11,13,13,14,11,13,2,2,10,generated,-
Rojillos,31,Pedro Gallardo,-,MC,-,17,ESP,EU,HGC,Yes,U21 Exempt,62,78,Right,169,65,9,13,13,12,11,11,11,9,14,12,11,13,11,10,12,12,12,12,2,2,2,2,12,11,10,14,generated,-
Rojillos,32,Samuel Soriano,-,ST,AMR/AMC,20,ESP,EU,HGC,Yes,U21 Exempt,61,73,Right,182,81,12,11,11,12,9,6,3,14,12,8,5,13,12,10,11,13,14,12,2,2,2,2,12,13,11,11,generated,-
```

### Azulones (Getafe CF)
**Reputation:** 69 | **CA Band:** 59–68 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Azulones,1,Ivo Crespo,-,GK,-,32,ESP,EU,Non-HG,No,Registered,67,67,Right,193,91,2,11,2,7,2,3,3,4,8,12,16,9,13,12,7,10,11,13,15,12,15,12,11,2,2,13,generated,-
Azulones,3,Víctor Ferrer,-,DL,DC,21,ESP,EU,HGC,Yes,U21 Exempt,64,76,Left,180,77,7,11,9,13,13,12,14,10,10,12,10,15,12,10,11,13,11,13,2,2,2,2,12,12,10,14,generated,-
Azulones,4,Pedro Calvo,-,DC,DL/DR,30,ESP,EU,HGC,No,Registered,67,67,Right,185,74,3,14,10,10,7,14,11,16,9,15,15,13,14,14,12,10,13,10,2,2,2,2,12,6,5,15,generated,-
Azulones,5,David Rivero,-,DC,-,28,URU,Non-EU,Non-HG,No,Registered,67,69,Right,182,75,6,8,8,10,6,16,15,12,10,13,14,12,13,10,11,11,14,11,2,2,2,2,12,6,6,14,generated,-
Azulones,2,Petar Lovrić,-,DR,-,23,CRO,EU,Non-HG,No,Registered,67,74,Either,181,81,8,11,12,13,12,14,14,9,10,13,14,15,12,10,13,13,14,13,2,2,2,2,12,13,11,14,generated,-
Azulones,6,Miguel Maldonado,-,DM,DC,30,ESP,EU,HGN,No,Registered,65,65,Right,179,75,6,14,9,14,6,13,14,9,11,13,14,14,13,12,11,14,11,11,2,2,2,2,13,9,9,14,generated,-
Azulones,8,Aitor Vidal,-,MC,DM,26,ESP,EU,HGN,No,Registered,66,69,Right,182,79,9,14,12,15,10,10,8,10,13,12,13,12,14,9,11,14,11,12,2,2,2,2,13,12,11,15,generated,-
Azulones,10,Lucas Quintero,-,MC,DM/AMC,27,ESP,EU,HGN,No,Registered,66,66,Right,180,77,10,13,11,15,11,10,11,9,13,13,10,13,13,10,13,15,9,12,2,2,2,2,14,11,9,14,generated,-
Azulones,11,Javier Almeida,-,AML,-,24,ESP,EU,HGN,No,Registered,67,71,Left,180,76,13,12,12,15,13,7,6,6,13,12,6,13,12,9,11,14,9,14,2,2,2,2,15,12,14,14,generated,-
Azulones,7,Marco Fontes,-,AMR,AMC,26,POR,EU,Non-HG,No,Registered,67,67,Either,178,68,11,10,14,14,13,7,5,7,10,12,5,13,13,8,16,13,10,13,2,2,2,2,14,13,15,11,generated,-
Azulones,9,Yoann Brunet,-,ST,AMC,26,FRA,EU,Non-HG,No,Registered,67,70,Left,187,84,13,11,15,14,5,4,3,12,10,11,5,14,14,8,15,12,11,12,2,2,2,2,14,14,9,11,generated,-
Azulones,13,Jaime Cordero,-,GK,-,34,ESP,EU,HGC,No,Registered,59,59,Right,185,82,2,10,2,9,2,3,3,4,9,11,14,8,10,12,8,8,10,11,13,13,11,10,12,2,2,10,generated,-
Azulones,23,Luís Quaresma,-,DL,ML/DC,27,POR,EU,Non-HG,No,Registered,59,59,Left,185,76,7,10,12,10,12,11,12,10,9,11,9,14,11,8,11,14,9,10,2,2,2,2,11,10,9,12,generated,-
Azulones,15,João Peixoto,-,DC,-,30,POR,EU,Non-HG,No,Registered,60,60,Left,184,79,6,11,5,9,5,11,12,11,8,12,13,12,11,10,10,10,13,8,2,2,2,2,12,4,7,15,generated,-
Azulones,24,Adrián Salinas,-,DC,-,28,URU,Non-EU,Non-HG,No,Registered,61,61,Right,185,78,5,10,9,11,6,11,12,14,8,12,13,12,11,11,10,10,14,9,2,2,2,2,12,6,6,12,generated,-
Azulones,22,Brahim Haddad,-,DR,-,23,MAR,Non-EU,Non-HG,No,Registered,59,65,Left,175,72,8,9,10,10,10,13,12,8,11,11,11,12,12,11,12,14,11,11,2,2,2,2,11,10,11,12,generated,-
Azulones,30,Leandro Alcázar,-,DM,DC,18,ESP,EU,HGC,Yes,U21 Exempt,59,75,Left,173,72,8,12,10,9,6,12,12,11,10,14,13,15,13,8,12,12,11,10,2,2,2,2,12,9,10,12,generated,-
Azulones,14,Álvaro Zamora,-,MC,AMC,21,ESP,EU,HGC,Yes,U21 Exempt,61,70,Right,180,79,10,12,14,12,10,11,9,8,11,12,11,14,12,9,11,12,10,12,2,2,2,2,12,14,11,15,generated,-
Azulones,17,Tomás Montero,-,AMC,-,19,ESP,EU,HGC,Yes,U21 Exempt,60,70,Right,183,72,10,10,11,12,10,9,7,7,13,12,9,11,13,9,11,11,11,13,2,2,2,2,11,12,10,11,generated,-
Azulones,21,Jorge Rueda,-,AML,AMC,22,ESP,EU,HGC,No,Registered,60,63,Left,177,68,11,11,14,13,12,6,5,7,9,10,8,11,10,8,16,12,10,13,2,2,2,2,11,12,11,11,generated,-
Azulones,19,Diego De Luca,-,AMR,MR,23,ITA,EU,Non-HG,No,Registered,60,62,Either,172,66,12,12,13,11,12,5,4,6,10,10,8,12,11,8,11,11,9,14,2,2,2,2,12,10,14,11,generated,-
Azulones,18,Jorge Peláez,-,ST,AMC,27,ESP,EU,HGN,No,Registered,59,61,Left,181,81,11,9,12,15,5,6,3,11,11,12,5,10,10,6,14,11,14,12,2,2,2,2,9,11,10,10,generated,-
Azulones,25,Pablo Sanchís,-,GK,-,20,ESP,EU,HGC,Yes,U21 Exempt,62,74,Right,187,88,2,8,3,9,2,3,3,4,10,12,14,7,10,11,9,7,11,8,12,15,11,12,14,2,2,12,generated,-
Azulones,31,Carlos Bustos,-,MC,DM,20,ESP,EU,HGC,Yes,U21 Exempt,59,64,Left,182,80,9,13,13,12,10,11,9,8,13,12,10,12,10,8,9,14,10,10,2,2,2,2,11,9,11,12,generated,-
Azulones,32,Ivo Salcedo,-,ST,AMC,20,ESP,EU,HGC,Yes,U21 Exempt,59,64,Right,178,77,14,8,10,11,8,7,2,11,10,10,6,15,12,8,13,12,13,12,2,2,2,2,13,11,10,10,generated,-
```

### Periquitos (RCD Espanyol de Barcelona)
**Reputation:** 67 | **CA Band:** 58–67 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Periquitos,1,Jelle Smit,-,GK,-,22,NED,EU,Non-HG,No,Registered,64,66,Right,195,92,2,10,4,9,2,3,3,4,9,11,15,9,13,10,6,9,11,12,13,12,12,11,14,2,2,10,generated,-
Periquitos,3,Andrés Vidal,-,DL,-,34,ESP,EU,HGN,No,Registered,66,66,Left,183,78,6,12,14,12,10,13,12,11,9,13,12,15,12,10,16,16,11,12,2,2,2,2,12,10,11,13,generated,-
Periquitos,4,Cheick Diop,-,DC,-,26,SEN,Non-EU,Non-HG,No,Registered,67,70,Either,185,90,5,11,9,11,6,16,13,15,8,12,14,13,14,12,11,12,13,9,2,2,2,2,13,5,5,12,generated,capped by band
Periquitos,5,Jesús Valdés,-,DC,DM/DL,28,ESP,EU,HGC,No,Registered,64,65,Right,190,85,6,12,9,10,6,15,13,12,9,12,13,15,11,12,12,11,14,12,2,2,2,2,14,7,5,13,generated,-
Periquitos,2,Carlos Sanchís,-,DR,WBR/MR,26,ESP,EU,Non-HG,No,Registered,67,68,Either,181,79,7,10,12,12,13,14,13,11,10,13,12,16,11,11,15,14,12,11,2,2,2,2,11,11,10,15,generated,capped by band
Periquitos,6,Pedro Ortuño,-,DM,-,22,ESP,EU,HGC,No,Registered,67,73,Right,175,71,8,13,13,12,8,13,14,9,11,15,12,14,14,13,11,16,12,11,2,2,2,2,13,11,9,15,generated,capped by band
Periquitos,8,Rafa Montero,-,MC,-,31,ESP,EU,HGC,No,Registered,66,66,Either,182,70,9,15,12,14,8,11,9,9,13,15,11,14,12,8,12,15,12,13,2,2,2,2,15,11,11,13,generated,-
Periquitos,10,Yeray Palomo,-,MC,DM/AMC,27,ESP,EU,Non-HG,No,Registered,65,68,Right,185,74,10,14,13,15,8,11,12,9,14,14,12,14,12,10,12,13,10,12,2,2,2,2,14,12,12,14,generated,-
Periquitos,11,Leandro Escobar,-,AML,-,24,MEX,Non-EU,Non-HG,No,Registered,62,64,Right,178,72,12,10,12,13,11,6,6,7,10,10,6,12,10,9,13,11,10,12,2,2,2,2,12,11,11,12,generated,-
Periquitos,7,Joaquín Alcázar,-,AMR,-,29,ESP,EU,HGC,No,Registered,65,65,Right,180,74,11,11,13,11,9,7,5,7,11,13,8,11,14,9,14,14,10,11,2,2,2,2,11,10,15,11,generated,-
Periquitos,9,Marcos Ortuño,-,ST,-,22,ESP,EU,HGN,No,Registered,67,69,Right,179,69,15,12,10,12,8,5,4,13,12,13,7,15,12,8,14,15,11,12,2,2,2,2,13,15,11,10,generated,capped by band
Periquitos,13,Eduardo Amaral,-,GK,-,21,POR,EU,Non-HG,Yes,U21 Exempt,59,67,Right,187,80,2,11,2,7,2,3,3,4,8,10,13,8,12,10,8,7,8,12,11,10,12,12,12,2,2,10,generated,-
Periquitos,23,Tommaso Longo,-,DL,-,28,ITA,EU,Non-HG,No,Registered,58,60,Left,186,75,5,11,9,12,12,11,11,10,8,12,10,13,10,8,13,13,11,11,2,2,2,2,10,9,8,14,generated,-
Periquitos,15,Samuel Fajardo,-,DC,DM/DR,25,ESP,EU,HGC,No,Registered,59,59,Right,191,82,1,12,7,9,5,12,11,12,10,11,12,12,11,10,9,11,12,10,2,2,2,2,13,4,7,12,generated,-
Periquitos,24,Lucas Leclerc,-,DC,DL,26,FRA,EU,Non-HG,No,Registered,58,61,Right,191,88,4,10,8,10,7,12,14,11,8,11,13,11,11,10,11,11,13,10,2,2,2,2,13,6,6,13,generated,-
Periquitos,22,Dídac Aguilera,-,DR,-,20,ESP,EU,HGC,Yes,U21 Exempt,62,68,Right,186,83,8,11,12,10,12,13,10,10,10,9,11,14,12,9,15,14,13,12,2,2,2,2,13,10,10,14,generated,-
Periquitos,14,Héctor Fajardo,-,DM,MC,26,ESP,EU,Non-HG,No,Registered,60,62,Right,187,89,7,11,10,11,9,13,11,9,11,11,13,12,11,11,11,14,11,11,2,2,2,2,13,8,9,13,generated,-
Periquitos,16,Baptiste Bouvier,-,MC,AMC,33,FRA,EU,Non-HG,No,Registered,62,62,Either,183,81,10,13,11,11,10,12,10,7,13,14,11,12,13,12,9,14,10,10,2,2,2,2,13,9,12,12,generated,-
Periquitos,17,Santi Paredes,-,AMC,AMR,22,COL,Non-EU,Non-HG,No,Registered,60,65,Right,176,75,11,13,13,12,9,6,7,7,13,11,7,12,11,10,10,12,10,11,2,2,2,2,12,10,12,12,generated,-
Periquitos,30,Julián Crespo,-,AML,ML/AMC,18,ESP,EU,Non-HG,Yes,U21 Exempt,59,73,Left,181,73,12,9,13,12,10,7,5,6,12,10,6,10,7,8,12,12,8,12,2,2,2,2,12,13,10,13,generated,-
Periquitos,19,Miguel Peláez,-,AMR,-,20,ESP,EU,Non-HG,Yes,U21 Exempt,58,67,Right,171,72,11,12,12,14,11,6,6,7,11,9,4,12,10,8,12,11,9,13,2,2,2,2,11,12,12,11,generated,-
Periquitos,18,Santi Valdés,-,ST,AML,29,ESP,EU,HGC,No,Registered,59,59,Right,186,82,12,10,10,11,7,6,5,10,10,10,6,11,11,8,11,13,13,12,2,2,2,2,11,13,9,13,generated,-
Periquitos,25,Martín Cabrera,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,61,73,Either,195,87,2,9,3,8,2,3,3,4,10,12,12,8,12,10,8,9,11,11,12,14,13,12,12,2,2,11,generated,-
Periquitos,31,Gonzalo Segura,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,58,72,Right,173,71,9,13,10,11,9,13,12,9,12,11,10,13,12,9,9,13,10,11,2,2,2,2,11,10,12,14,generated,-
Periquitos,32,Joaquín Cano,-,ST,AMR,20,ESP,EU,Non-HG,Yes,U21 Exempt,58,69,Right,187,85,12,10,9,11,7,4,3,11,9,11,6,13,12,9,11,13,14,12,2,2,2,2,9,12,11,11,generated,-
```

### Babazorros (Deportivo Alavés)
**Reputation:** 66 | **CA Band:** 57–66 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Babazorros,1,Wojciech Sikora,-,GK,-,29,POL,EU,Non-HG,No,Registered,64,64,Right,188,85,2,11,4,8,2,3,3,4,8,13,14,8,12,11,8,8,13,12,12,13,12,12,13,2,2,10,generated,-
Babazorros,3,Hugo Gallardo,-,DL,-,30,ESP,EU,HGN,No,Registered,64,64,Left,170,61,4,9,10,11,11,12,12,11,11,11,12,14,12,9,14,11,13,10,2,2,2,2,10,12,8,14,generated,-
Babazorros,4,Hugo Viana,-,DC,-,24,POR,EU,Non-HG,No,Registered,62,65,Left,178,68,5,10,8,10,5,13,12,13,9,12,12,13,12,9,12,11,11,10,2,2,2,2,12,7,6,14,generated,-
Babazorros,5,Unai Trujillo,-,DC,-,26,ESP,EU,HGC,No,Registered,65,68,Right,185,79,5,12,8,11,5,14,14,14,11,13,14,14,11,11,11,14,13,11,2,2,2,2,11,6,5,13,generated,-
Babazorros,2,Youssouf Diallo,-,DR,-,28,SEN,Non-EU,Non-HG,No,Registered,65,67,Right,181,77,6,11,14,11,13,13,13,8,10,12,14,13,12,8,14,13,13,13,2,2,2,2,11,9,9,14,generated,-
Babazorros,6,Tomás Soriano,-,DM,DC,26,ESP,EU,HGC,No,Registered,64,67,Right,188,84,8,13,12,11,7,12,13,11,12,14,14,15,13,9,10,15,13,12,2,2,2,2,15,10,11,12,generated,-
Babazorros,8,Cristian Rebollo,-,MC,-,24,ESP,EU,HGN,No,Registered,66,70,Left,178,76,10,15,10,14,11,13,10,7,16,14,11,15,14,10,14,12,11,12,2,2,2,2,14,12,11,14,generated,capped by band
Babazorros,10,César Aguilera,-,MC,AMC,32,ESP,EU,HGC,No,Registered,63,63,Either,187,77,8,10,13,14,10,11,12,10,11,13,11,12,10,12,12,14,10,12,2,2,2,2,11,10,11,12,generated,-
Babazorros,11,Miguel Quintero,-,AML,-,28,ESP,EU,HGN,No,Registered,65,68,Left,179,72,12,11,13,13,11,7,6,8,13,11,6,11,12,8,14,13,8,14,2,2,2,2,12,13,14,12,generated,-
Babazorros,7,Carlos Coelho,-,AMR,AMC,25,POR,EU,Non-HG,No,Registered,64,65,Right,177,76,11,12,16,12,13,6,4,6,11,12,6,11,9,6,13,10,10,15,2,2,2,2,12,12,14,12,generated,-
Babazorros,9,Marcos Rebollo,-,ST,-,26,ESP,EU,HGN,No,Registered,66,67,Right,179,77,15,10,12,14,7,4,4,14,10,13,8,16,11,10,13,12,14,13,2,2,2,2,13,15,12,15,generated,capped by band
Babazorros,13,Răzvan Neagu,-,GK,-,21,ROU,EU,Non-HG,Yes,U21 Exempt,57,65,Right,193,88,2,10,2,7,2,3,3,4,7,12,13,7,11,11,9,9,10,11,12,12,13,11,10,2,2,12,generated,-
Babazorros,23,Nico Izquierdo,-,DL,ML,23,ESP,EU,Non-HG,No,Registered,60,67,Left,184,79,6,11,12,10,11,10,11,11,11,12,11,14,10,10,11,12,11,10,2,2,2,2,11,8,10,13,generated,-
Babazorros,15,Vincenzo Testa,-,DC,-,24,ITA,EU,Non-HG,No,Registered,59,62,Right,189,85,5,9,9,8,6,14,10,14,11,13,13,11,11,11,12,11,12,11,2,2,2,2,11,5,7,13,generated,-
Babazorros,24,Ismael Duarte,-,DC,-,25,ARG,Non-EU,Non-HG,No,Registered,59,61,Right,188,79,5,10,8,10,5,11,12,13,9,11,12,14,9,10,11,12,12,9,2,2,2,2,12,6,6,14,generated,-
Babazorros,22,Ivo Valdés,-,DR,MR,25,ESP,EU,HGN,No,Registered,58,61,Right,182,75,7,12,11,12,9,10,11,9,9,12,12,14,9,8,11,12,12,11,2,2,2,2,10,9,9,11,generated,-
Babazorros,30,Aitor Quintero,-,DM,DC,19,ESP,EU,HGC,Yes,U21 Exempt,59,71,Right,173,70,6,10,10,10,7,13,10,8,9,10,13,14,13,8,9,11,11,9,2,2,2,2,13,8,7,12,generated,-
Babazorros,14,Nacho Quintero,-,MC,AMC,25,ESP,EU,HGN,No,Registered,61,61,Left,181,80,6,14,9,12,10,9,11,8,13,13,11,13,11,7,11,11,10,12,2,2,2,2,15,10,11,12,generated,-
Babazorros,17,Ismael Acosta,-,AMC,-,30,COL,Non-EU,Non-HG,No,Registered,60,60,Either,179,74,11,14,11,12,11,7,9,8,13,13,9,12,11,11,11,12,12,11,2,2,2,2,10,12,12,13,generated,-
Babazorros,21,Cristian Soriano,-,AML,-,24,ESP,EU,HGC,No,Registered,57,64,Left,174,73,11,10,11,11,10,7,5,7,10,9,3,12,10,6,10,10,7,13,2,2,2,2,11,12,12,12,generated,-
Babazorros,19,Marcos Casado,-,AMR,-,26,ESP,EU,HGC,No,Registered,61,63,Left,177,74,12,11,14,14,12,6,2,6,12,11,5,13,10,7,14,10,12,13,2,2,2,2,12,11,15,12,generated,-
Babazorros,18,Fernando Olmedo,-,ST,AMR/AML,35,ESP,EU,HGN,No,Registered,61,61,Right,180,73,13,9,12,13,8,6,3,14,9,9,5,12,13,9,13,12,13,14,2,2,2,2,13,11,8,12,generated,-
Babazorros,25,Nacho Bustos,-,GK,-,19,ESP,EU,HGC,Yes,U21 Exempt,58,74,Right,180,79,2,10,2,8,2,3,3,4,7,11,13,8,12,7,6,9,10,11,13,13,12,12,13,2,2,11,generated,-
Babazorros,31,Marc Sanchís,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,59,70,Right,182,83,7,12,12,11,10,11,11,7,12,12,10,11,12,7,10,12,11,12,2,2,2,2,12,10,10,13,generated,-
Babazorros,32,Pedro Lara,-,ST,AMC/AMR,19,ESP,EU,Non-HG,Yes,U21 Exempt,57,67,Right,189,85,12,10,10,11,8,5,3,11,9,9,5,11,11,9,12,10,11,8,2,2,2,2,10,13,9,10,generated,-
```

### Franjiverdes (Elche CF)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Franjiverdes,1,Cristian Ferrer,-,GK,-,29,ESP,EU,HGC,No,Registered,57,57,Either,193,86,2,10,3,8,2,3,3,4,9,11,12,6,12,9,8,9,10,9,12,13,12,11,10,2,2,10,generated,-
Franjiverdes,3,Samuel Lara,-,DL,DC,21,ESP,EU,HGC,Yes,U21 Exempt,62,74,Left,179,74,6,11,9,11,9,12,11,10,9,11,13,12,10,10,13,13,12,12,2,2,2,2,11,11,10,14,generated,-
Franjiverdes,4,Raúl Calvo,-,DC,DL,32,ESP,EU,HGC,No,Registered,63,63,Right,178,68,4,13,9,9,5,12,12,13,9,14,13,13,12,10,12,11,15,10,2,2,2,2,11,7,3,13,generated,capped by band
Franjiverdes,5,Samuele Orlando,-,DC,-,25,ITA,EU,Non-HG,No,Registered,63,66,Right,189,85,5,9,9,10,3,13,13,14,9,12,12,11,11,10,12,14,14,10,2,2,2,2,13,6,6,13,generated,capped by band
Franjiverdes,2,Marin Šarić,-,DR,-,24,CRO,EU,Non-HG,No,Registered,62,69,Right,179,77,7,10,11,12,11,12,11,10,9,11,12,13,10,9,13,14,12,11,2,2,2,2,12,10,8,11,generated,-
Franjiverdes,6,Mario Almeida,-,DM,DC,29,ESP,EU,HGC,No,Registered,62,62,Right,178,76,8,13,9,11,7,14,13,12,9,12,15,12,11,11,10,13,11,11,2,2,2,2,13,7,8,14,generated,-
Franjiverdes,8,Cristian Vera,-,MC,DM,28,COL,Non-EU,Non-HG,No,Registered,60,60,Left,174,75,8,13,12,11,10,9,10,6,12,13,9,12,13,10,12,10,11,13,2,2,2,2,11,9,10,14,generated,-
Franjiverdes,10,Rui Esteves,-,MC,DM,31,POR,EU,Non-HG,No,Registered,62,62,Right,179,81,11,13,11,14,9,9,11,7,12,13,9,12,13,9,11,12,11,14,2,2,2,2,11,9,9,12,generated,-
Franjiverdes,11,Kalidou Doumbia,-,AML,-,29,CIV,Non-EU,Non-HG,No,Registered,61,61,Left,182,75,12,11,13,13,10,6,4,8,11,11,8,12,11,8,12,13,11,12,2,2,2,2,9,11,14,10,generated,-
Franjiverdes,7,Martín Valdés,-,AMR,-,29,ESP,EU,HGC,No,Registered,62,62,Right,186,84,12,10,13,12,11,7,4,8,11,11,5,12,10,8,13,13,11,14,2,2,2,2,12,12,12,13,generated,-
Franjiverdes,9,Lucas Cordero,-,ST,AML/AMC,28,ESP,EU,HGN,No,Registered,63,65,Right,187,84,13,11,11,13,7,5,5,12,9,11,7,12,11,9,12,10,11,13,2,2,2,2,11,12,12,11,generated,capped by band
Franjiverdes,13,Guillermo Trujillo,-,GK,-,28,ESP,EU,HGC,No,Registered,56,59,Either,193,91,2,8,3,8,2,3,3,4,7,11,13,9,11,7,7,6,8,12,12,12,11,12,13,2,2,10,generated,-
Franjiverdes,23,Marc Peláez,-,DL,-,22,ESP,EU,HGN,No,Registered,56,59,Left,183,79,6,11,10,10,10,11,10,10,9,10,9,12,9,7,11,12,10,9,2,2,2,2,12,11,7,10,generated,-
Franjiverdes,15,Marc Alcázar,-,DC,-,28,ESP,EU,HGC,No,Registered,59,61,Right,191,90,3,11,7,10,5,11,13,11,8,9,12,11,10,10,10,13,11,9,2,2,2,2,13,6,7,13,generated,-
Franjiverdes,24,Tudor Sandu,-,DC,DR/DL,21,ROU,EU,Non-HG,Yes,U21 Exempt,55,63,Right,183,74,5,11,7,11,7,13,10,11,9,9,14,12,10,10,10,8,13,10,2,2,2,2,10,5,5,12,generated,-
Franjiverdes,22,Ionuț Sandu,-,DR,-,29,ROU,EU,Non-HG,No,Registered,54,54,Right,177,75,7,10,10,10,10,10,11,10,9,10,10,12,10,10,10,13,8,11,2,2,2,2,9,10,9,12,generated,-
Franjiverdes,30,Mario Fajardo,-,DM,-,17,ESP,EU,HGC,Yes,U21 Exempt,54,65,Right,187,82,7,11,9,9,6,11,9,9,10,11,12,10,10,9,9,12,12,11,2,2,2,2,10,9,7,15,generated,-
Franjiverdes,14,Seydou Sidibé,-,MC,-,24,SEN,Non-EU,Non-HG,No,Registered,58,65,Left,176,67,8,13,12,11,9,9,9,7,11,11,10,11,12,10,13,13,9,11,2,2,2,2,12,10,10,13,generated,-
Franjiverdes,17,Julián Almeida,-,AMC,-,35,ESP,EU,HGN,No,Registered,56,56,Right,186,81,12,12,11,11,7,9,7,6,12,10,9,11,11,8,9,10,11,10,2,2,2,2,11,10,12,12,generated,-
Franjiverdes,21,Marcos Sanchís,-,AML,-,21,ESP,EU,HGC,Yes,U21 Exempt,57,64,Left,173,64,12,12,12,12,11,4,5,8,11,11,8,10,10,8,12,11,9,12,2,2,2,2,12,10,12,11,generated,-
Franjiverdes,19,Santi Cano,-,AMR,ST,27,ESP,EU,HGC,No,Registered,57,58,Right,179,76,12,9,11,13,11,7,5,6,8,9,6,11,11,6,15,11,10,13,2,2,2,2,8,10,13,11,generated,-
Franjiverdes,18,Xavi Aguilera,-,ST,AMC,26,ESP,EU,HGC,No,Registered,57,57,Right,187,90,11,9,10,15,8,4,4,10,10,11,8,10,11,7,13,11,13,10,2,2,2,2,12,14,9,9,generated,-
Franjiverdes,25,Guillermo Toledo,-,GK,-,17,ESP,EU,HGC,Yes,U21 Exempt,56,67,Right,195,94,2,10,3,9,2,3,3,4,6,10,9,8,13,8,7,7,12,9,11,11,11,11,13,2,2,9,generated,-
Franjiverdes,31,Nacho Castaño,-,MC,DM/AMC,18,ESP,EU,HGC,Yes,U21 Exempt,56,71,Right,170,67,7,11,11,11,6,11,9,6,11,13,11,14,11,6,11,13,12,11,2,2,2,2,12,13,10,13,generated,-
Franjiverdes,32,Nacho Rueda,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,57,71,Right,189,86,10,11,11,12,8,4,5,12,9,10,3,12,11,9,11,13,11,11,2,2,2,2,11,13,12,12,generated,-
```

### Granotas (Levante UD)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Granotas,1,Sotiris Theodoridis,-,GK,-,26,GRE,EU,Non-HG,No,Registered,61,61,Left,192,84,2,9,3,9,2,3,3,4,7,11,12,10,12,9,9,7,10,10,15,13,11,12,11,2,2,11,generated,-
Granotas,3,Carlos Duarte,-,DL,DC,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,63,74,Left,190,82,6,11,12,11,12,12,14,8,10,11,11,13,12,8,13,14,15,11,2,2,2,2,12,10,8,14,generated,capped by band
Granotas,4,Pedro Escudero,-,DC,-,30,ESP,EU,HGC,No,Registered,60,60,Right,185,79,6,9,6,8,8,11,12,14,11,12,12,14,11,10,11,8,12,11,2,2,2,2,13,6,6,14,generated,-
Granotas,5,Julián Vidal,-,DC,-,27,ESP,EU,HGN,No,Registered,60,63,Right,195,87,4,10,8,9,4,11,12,12,9,12,12,11,11,11,11,10,12,10,2,2,2,2,12,5,4,11,generated,-
Granotas,2,Daniel Escobar,-,DR,WBR,27,MEX,Non-EU,Non-HG,No,Registered,61,61,Left,182,75,5,12,12,11,13,12,11,10,10,13,12,14,11,11,15,13,12,13,2,2,2,2,13,10,9,13,generated,-
Granotas,6,Óscar Crespo,-,DM,DC,27,ESP,EU,HGC,No,Registered,61,63,Right,188,86,5,13,10,10,8,12,12,11,10,12,12,13,9,11,10,13,11,10,2,2,2,2,12,9,9,11,generated,-
Granotas,8,Sergio Aguilera,-,MC,-,28,ESP,EU,HGN,No,Registered,63,64,Left,175,71,7,11,12,15,9,11,10,9,14,11,10,14,12,9,10,13,11,11,2,2,2,2,15,11,11,14,generated,capped by band
Granotas,10,Sérgio Amaral,-,MC,-,21,POR,EU,Non-HG,Yes,U21 Exempt,59,67,Left,181,79,7,11,10,12,7,10,9,10,11,14,10,13,11,9,12,13,10,11,2,2,2,2,12,10,11,12,generated,-
Granotas,11,Anthony Carpentier,-,AML,-,28,FRA,EU,Non-HG,No,Registered,62,64,Left,180,74,12,12,14,12,15,6,4,7,10,11,7,13,13,8,14,13,9,11,2,2,2,2,12,15,14,12,generated,-
Granotas,7,Pablo Cano,-,AMR,-,31,ESP,EU,HGC,No,Registered,62,62,Right,180,76,12,10,15,13,10,7,6,6,12,11,6,11,11,9,10,11,10,14,2,2,2,2,13,11,15,12,generated,-
Granotas,9,Julián Toledo,-,ST,-,25,ESP,EU,HGC,No,Registered,62,62,Right,186,78,14,12,10,13,8,3,5,11,10,12,7,12,12,7,13,12,13,10,2,2,2,2,11,14,9,12,generated,-
Granotas,13,Pablo Navarro,-,GK,-,29,CHI,Non-EU,Non-HG,No,Registered,54,54,Right,185,74,2,9,2,9,2,3,3,4,7,10,10,7,9,8,7,6,11,11,14,12,12,11,9,2,2,9,generated,-
Granotas,23,Guillermo Maldonado,-,DL,DC,27,ESP,EU,HGN,No,Registered,54,54,Left,187,84,9,11,10,9,13,12,9,9,9,8,10,10,8,7,12,12,10,9,2,2,2,2,11,11,9,11,generated,-
Granotas,30,Dídac Naranjo,-,DC,-,19,ESP,EU,HGC,Yes,U21 Exempt,57,70,Right,188,82,4,9,8,11,6,12,12,12,9,13,13,9,11,9,12,10,13,10,2,2,2,2,12,6,8,12,generated,-
Granotas,15,Tomás Quaresma,-,DC,-,27,POR,EU,Non-HG,No,Registered,57,58,Right,182,81,7,10,8,10,3,14,14,10,7,12,11,11,13,10,13,12,12,10,2,2,2,2,12,6,7,10,generated,-
Granotas,22,Xavi Lorente,-,DR,-,21,ESP,EU,HGC,Yes,U21 Exempt,57,66,Right,181,77,6,11,10,10,11,14,11,8,10,10,11,13,10,9,13,12,8,11,2,2,2,2,12,9,10,13,generated,-
Granotas,14,Martín Cano,-,DM,DC,25,ESP,EU,HGN,No,Registered,55,56,Left,178,71,6,12,12,12,8,12,11,9,11,11,12,11,12,9,11,11,12,11,2,2,2,2,12,9,10,11,generated,-
Granotas,16,Dídac Arjona,-,MC,-,25,ESP,EU,HGC,No,Registered,57,60,Either,183,81,7,12,11,10,8,11,9,6,13,12,12,10,11,8,10,13,9,10,2,2,2,2,12,10,10,13,generated,-
Granotas,17,Adrián Soriano,-,AMC,AMR,25,ESP,EU,HGN,No,Registered,55,56,Right,180,80,10,13,11,11,9,8,9,8,10,11,8,12,9,10,11,11,9,10,2,2,2,2,10,10,11,11,generated,-
Granotas,21,Yeray Fajardo,-,AML,-,27,ESP,EU,HGC,No,Registered,56,57,Right,180,77,10,9,11,10,12,5,6,8,9,11,5,11,12,6,13,9,9,13,2,2,2,2,10,11,10,11,generated,-
Granotas,19,Wout Gielen,-,AMR,-,31,BEL,EU,Non-HG,No,Registered,61,61,Either,188,83,12,10,14,11,8,7,6,6,9,10,7,10,9,9,13,13,9,9,2,2,2,2,12,12,14,12,generated,-
Granotas,18,Carlos Varela,-,ST,-,27,ESP,EU,HGC,No,Registered,57,57,Right,185,78,12,13,10,12,6,5,4,12,8,8,7,11,11,9,13,12,12,10,2,2,2,2,10,11,9,11,generated,-
Granotas,25,Carlos Lorente,-,GK,-,21,ESP,EU,HGC,Yes,U21 Exempt,56,62,Left,196,92,2,8,3,6,2,3,3,4,8,12,12,7,12,10,8,9,9,10,11,11,11,11,10,2,2,12,generated,-
Granotas,31,Daniel Izquierdo,-,MC,-,19,ESP,EU,HGC,Yes,U21 Exempt,55,68,Right,184,71,7,14,11,9,7,10,8,7,10,12,9,13,12,8,10,12,8,10,2,2,2,2,11,10,9,12,generated,-
Granotas,32,Hugo Izquierdo,-,ST,AMC/AMR,18,ESP,EU,HGN,Yes,U21 Exempt,54,67,Left,187,84,12,9,9,12,6,4,4,9,7,11,5,10,9,6,12,13,11,11,2,2,2,2,11,10,10,12,generated,-
```

### Boquerones (Málaga CF)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Boquerones,1,Afonso Rebelo,-,GK,-,34,POR,EU,Non-HG,No,Registered,61,61,Right,182,80,2,10,6,10,2,3,3,4,9,12,11,10,13,9,7,9,10,13,15,14,13,10,12,2,2,11,generated,-
Boquerones,3,Santi Negrete,-,DL,DC,29,ESP,EU,HGN,No,Registered,61,61,Left,182,80,4,11,10,11,12,14,12,8,10,12,11,13,12,8,15,12,10,12,2,2,2,2,11,10,10,13,generated,-
Boquerones,4,Nacho Giménez,-,DC,-,27,COL,Non-EU,Non-HG,No,Registered,60,63,Right,191,86,4,9,8,9,4,13,13,11,8,12,15,12,11,9,11,10,13,10,2,2,2,2,12,4,5,12,generated,-
Boquerones,5,Valentin Engel,-,DC,-,27,GER,EU,Non-HG,No,Registered,62,64,Right,188,82,5,11,9,8,5,15,13,13,8,12,15,12,12,11,12,12,14,10,2,2,2,2,11,7,3,14,generated,capped by band
Boquerones,2,Bruno Coelho,-,DR,MR,27,POR,EU,Non-HG,No,Registered,61,64,Left,183,81,6,11,11,11,11,12,13,10,10,11,12,14,12,11,13,13,10,11,2,2,2,2,12,10,9,13,generated,-
Boquerones,6,Jaime Heredia,-,DM,-,33,ESP,EU,HGN,No,Registered,60,60,Left,177,73,7,11,11,10,8,16,13,11,12,10,12,13,10,10,9,14,13,11,2,2,2,2,11,7,8,11,generated,-
Boquerones,8,Aitor Barrios,-,MC,-,30,ESP,EU,Non-HG,No,Registered,61,61,Right,181,74,11,12,11,11,9,11,11,9,14,13,8,11,14,8,11,13,12,12,2,2,2,2,12,9,11,14,generated,-
Boquerones,10,Matteo Testa,-,MC,AMC/DM,28,ITA,EU,Non-HG,No,Registered,61,61,Right,184,79,9,13,12,16,10,12,10,8,13,14,11,15,13,10,11,13,11,12,2,2,2,2,12,12,9,15,generated,-
Boquerones,11,Marcos Quintero,-,AML,ST,29,ESP,EU,HGN,No,Registered,58,58,Left,176,72,11,12,10,12,10,5,5,9,10,11,7,12,10,6,14,10,11,14,2,2,2,2,9,15,13,10,generated,-
Boquerones,7,Noud Dijkstra,-,AMR,AMC,26,NED,EU,Non-HG,No,Registered,62,64,Left,175,77,10,12,12,12,11,6,6,4,12,12,6,12,11,4,14,11,9,15,2,2,2,2,12,13,12,10,generated,capped by band
Boquerones,9,Nico Valdés,-,ST,AMC,32,ESP,EU,Non-HG,No,Registered,62,62,Right,188,80,13,8,10,13,7,5,3,11,11,11,5,13,13,9,13,12,11,12,2,2,2,2,13,14,12,12,generated,capped by band
Boquerones,13,David Sanchís,-,GK,-,28,ESP,EU,HGC,No,Registered,53,54,Right,189,84,2,8,4,8,2,3,3,4,10,11,10,9,12,8,9,9,9,9,11,11,11,10,11,2,2,11,generated,-
Boquerones,23,Marcos Paredes,-,DL,-,27,MEX,Non-EU,Non-HG,No,Registered,54,57,Either,183,76,8,10,10,9,11,11,11,10,10,11,12,10,13,8,13,10,10,10,2,2,2,2,8,10,9,10,generated,-
Boquerones,15,Gonzalo Calvo,-,DC,DL,21,ESP,EU,HGC,Yes,U21 Exempt,53,65,Left,185,83,2,10,8,10,5,11,12,12,9,10,11,10,12,10,9,9,11,8,2,2,2,2,11,6,4,9,generated,-
Boquerones,24,Daniel Gallardo,-,DC,-,26,ESP,EU,HGC,No,Registered,55,56,Right,190,86,5,9,10,11,8,11,10,11,10,10,12,10,11,10,10,11,13,10,2,2,2,2,12,6,4,14,generated,-
Boquerones,22,Jorge Montero,-,DR,WBR,23,ESP,EU,HGN,No,Registered,53,58,Right,182,76,6,11,10,10,10,11,9,8,9,10,9,11,9,11,10,10,9,9,2,2,2,2,12,9,11,11,generated,-
Boquerones,30,Andrés Palomo,-,DM,DC/MC,19,ESP,EU,HGN,Yes,U21 Exempt,53,68,Right,185,78,7,10,9,10,7,12,9,9,10,13,11,11,12,9,9,12,12,8,2,2,2,2,11,8,8,12,generated,-
Boquerones,14,Diego Maldonado,-,MC,DM/AMC,19,ESP,EU,HGC,Yes,U21 Exempt,53,68,Left,175,67,6,13,10,10,8,9,9,7,11,12,9,12,11,7,9,12,9,10,2,2,2,2,10,11,8,12,generated,-
Boquerones,17,Daniel Casado,-,AMC,-,25,ESP,EU,HGC,No,Registered,57,57,Right,185,77,9,13,11,12,10,6,7,8,13,10,10,12,10,9,11,13,9,10,2,2,2,2,11,11,11,15,generated,-
Boquerones,21,Miguel Vera,-,AML,-,27,VEN,Non-EU,Non-HG,No,Registered,54,54,Right,186,87,11,10,12,9,10,7,6,5,11,10,6,10,8,6,11,12,8,11,2,2,2,2,8,13,12,10,generated,-
Boquerones,19,Benedikt Wagner,-,AMR,MR,23,GER,EU,Non-HG,No,Registered,54,59,Right,175,70,9,9,12,12,10,6,6,6,9,11,7,12,8,9,11,12,9,13,2,2,2,2,9,11,12,9,generated,-
Boquerones,18,Fernando Ferrer,-,ST,-,30,ESP,EU,HGC,No,Registered,55,55,Right,179,79,11,8,12,9,7,6,4,11,10,11,5,12,10,8,10,13,10,12,2,2,2,2,10,13,11,13,generated,-
Boquerones,25,Mateo Montero,-,GK,-,18,ESP,EU,HGC,Yes,U21 Exempt,53,62,Left,187,82,2,8,3,6,2,3,3,4,10,11,9,10,12,9,8,5,10,11,13,12,12,11,12,2,2,12,generated,-
Boquerones,31,Adrián Lorente,-,MC,AMC,21,ESP,EU,HGC,Yes,U21 Exempt,54,61,Right,183,80,9,12,11,10,9,9,11,9,11,12,9,11,13,8,11,12,9,11,2,2,2,2,11,8,7,11,generated,-
Boquerones,32,Lucas Crespo,-,ST,-,19,ESP,EU,HGC,Yes,U21 Exempt,53,65,Right,175,75,10,8,11,11,6,5,4,9,9,10,5,11,10,9,9,12,10,9,2,2,2,2,12,12,11,9,generated,-
```

### Herculinos (RC Deportivo La Coruña)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Herculinos,1,Thomas Vidal,-,GK,-,30,FRA,EU,Non-HG,No,Registered,62,62,Right,188,81,2,10,5,10,2,3,3,4,8,12,12,9,13,10,9,9,11,9,15,13,13,12,10,2,2,12,generated,capped by band
Herculinos,3,Guillermo Valdés,-,DL,-,29,ESP,EU,HGC,No,Registered,62,62,Left,182,78,6,12,12,11,13,10,11,10,13,12,11,13,12,7,12,15,11,10,2,2,2,2,13,10,10,12,generated,capped by band
Herculinos,4,Marc Lara,-,DC,DR,28,ESP,EU,HGC,No,Registered,61,64,Right,186,82,6,12,6,9,6,10,14,15,10,11,12,12,12,10,11,11,14,12,2,2,2,2,12,6,7,12,generated,-
Herculinos,5,Pedro Abreu,-,DC,DR,26,POR,EU,Non-HG,No,Registered,59,60,Right,192,93,4,10,8,11,5,14,12,12,6,13,13,12,13,8,12,10,13,9,2,2,2,2,12,5,4,11,generated,-
Herculinos,2,Nacho Ortuño,-,DR,-,31,ESP,EU,Non-HG,No,Registered,62,62,Left,173,71,7,11,11,11,11,14,13,10,9,11,12,13,12,10,14,16,10,12,2,2,2,2,12,12,11,13,generated,capped by band
Herculinos,6,Jorge Gallardo,-,DM,-,25,ESP,EU,HGC,No,Registered,61,63,Right,181,81,7,13,10,14,7,13,12,12,10,9,12,12,12,8,10,13,12,10,2,2,2,2,13,9,10,11,generated,-
Herculinos,8,Yuri Rocha,-,MC,DM,22,BRA,Non-EU,Non-HG,No,Registered,59,61,Right,179,77,8,14,12,10,9,9,10,9,12,12,11,11,11,10,11,12,11,10,2,2,2,2,11,10,10,13,generated,-
Herculinos,10,Roko Božić,-,MC,DM,31,CRO,EU,Non-HG,No,Registered,61,61,Right,178,75,8,11,9,12,8,12,10,7,13,12,11,14,12,8,10,11,12,13,2,2,2,2,12,12,11,13,generated,-
Herculinos,11,Aitor Cano,-,AML,-,25,ESP,EU,HGC,No,Registered,62,62,Right,184,79,11,11,11,14,12,7,7,8,12,10,8,11,11,8,13,11,11,14,2,2,2,2,10,10,13,11,generated,capped by band
Herculinos,7,Martín Insúa,-,AMR,-,29,URU,Non-EU,Non-HG,No,Registered,62,62,Right,179,69,10,11,12,14,11,6,5,7,11,10,6,13,12,9,15,12,10,13,2,2,2,2,11,10,12,13,generated,capped by band
Herculinos,9,Adrián Robles,-,ST,AMC,24,ESP,EU,Non-HG,No,Registered,61,67,Right,178,74,13,10,10,13,6,6,3,12,11,10,6,12,11,8,11,11,13,11,2,2,2,2,11,13,10,11,generated,-
Herculinos,13,Ismael Montero,-,GK,-,26,ESP,EU,HGC,No,Registered,55,57,Right,184,79,2,10,4,10,2,3,3,4,9,14,13,8,9,7,8,8,11,9,13,11,13,11,12,2,2,10,generated,-
Herculinos,23,Nacho Cabrera,-,DL,-,26,ESP,EU,HGN,No,Registered,56,58,Right,180,80,8,12,9,12,11,12,8,9,10,11,12,12,11,7,10,14,11,10,2,2,2,2,12,9,10,11,generated,-
Herculinos,15,Héctor Barrios,-,DC,-,24,ESP,EU,HGC,No,Registered,56,63,Right,187,87,4,12,8,11,5,12,12,13,7,12,14,11,9,7,10,9,11,10,2,2,2,2,11,4,5,10,generated,-
Herculinos,30,Jaime Valdés,-,DC,-,20,ESP,EU,Non-HG,Yes,U21 Exempt,54,62,Right,186,77,3,10,7,9,5,11,11,10,8,11,12,12,10,11,10,11,11,7,2,2,2,2,11,6,5,11,generated,-
Herculinos,22,Guillermo Sanchís,-,DR,WBR,22,ESP,EU,HGN,No,Registered,53,56,Right,180,79,7,10,11,11,9,11,13,8,8,11,11,11,10,7,11,12,10,10,2,2,2,2,10,11,10,11,generated,-
Herculinos,14,Pedro Salcedo,-,DM,DC,19,ESP,EU,HGC,Yes,U21 Exempt,60,74,Left,178,69,9,11,10,11,7,14,11,9,10,14,13,12,12,9,12,13,14,13,2,2,2,2,12,7,10,12,generated,-
Herculinos,16,Adrien Brunet,-,MC,AMC,28,FRA,EU,Non-HG,No,Registered,54,56,Right,179,67,7,13,10,10,9,8,9,7,12,11,11,14,10,9,10,13,10,11,2,2,2,2,11,9,8,11,generated,-
Herculinos,17,Chidera Nnamdi,-,AMC,-,32,NGA,Non-EU,Non-HG,No,Registered,53,53,Right,181,77,10,12,10,11,9,6,7,7,11,11,9,12,12,8,11,10,8,11,2,2,2,2,11,12,10,10,generated,-
Herculinos,21,Jesús Heredia,-,AML,ST,34,ESP,EU,HGN,No,Registered,55,55,Left,182,79,10,11,13,13,8,7,5,6,9,9,6,11,10,7,9,12,12,12,2,2,2,2,10,11,10,12,generated,-
Herculinos,19,Fábio Guedes,-,AMR,AMC,25,POR,EU,Non-HG,No,Registered,57,57,Right,177,79,9,13,13,14,10,5,5,7,11,12,6,11,10,9,10,10,8,13,2,2,2,2,10,11,12,10,generated,-
Herculinos,18,Giorgos Zografos,-,ST,AML/AMC,23,GRE,EU,HGN,No,Registered,53,60,Right,188,82,12,9,9,10,5,5,4,10,8,8,5,11,9,8,10,10,10,12,2,2,2,2,12,11,10,10,generated,-
Herculinos,25,Samuel Marín,-,GK,-,19,ESP,EU,HGC,Yes,U21 Exempt,53,63,Left,192,90,2,8,2,6,2,3,3,4,7,11,10,7,11,8,5,7,8,10,10,12,11,11,11,2,2,11,generated,-
Herculinos,31,Guillermo Zamora,-,MC,-,18,ESP,EU,Non-HG,Yes,U21 Exempt,53,62,Right,180,77,7,11,11,9,9,7,10,8,10,12,8,12,12,8,12,11,9,9,2,2,2,2,10,9,8,12,generated,-
Herculinos,32,Jesús Toledo,-,ST,-,20,ESP,EU,HGC,Yes,U21 Exempt,55,62,Right,185,79,9,9,11,11,6,6,4,12,10,9,5,10,10,9,11,10,11,11,2,2,2,2,8,14,10,11,generated,-
```

### Montañeses (Real Racing Club de Santander)
**Reputation:** 58 | **CA Band:** 52–61 | **Registration Rule:** Max 3 Non-EU players; GKs strictly 1, 13, 25.

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Montañeses,1,Dan Georgescu,-,GK,-,28,ROU,EU,Non-HG,No,Registered,57,57,Right,187,82,2,9,4,9,2,3,3,4,8,12,12,7,11,8,8,6,10,9,11,11,12,11,10,2,2,10,generated,-
Montañeses,3,Óscar Ortuño,-,DL,WBL,29,ESP,EU,HGC,No,Registered,60,60,Left,184,83,7,10,10,11,10,10,12,10,10,12,11,13,11,8,13,12,12,12,2,2,2,2,12,11,8,12,generated,-
Montañeses,4,David Insúa,-,DC,-,29,MEX,Non-EU,Non-HG,No,Registered,61,61,Right,185,82,3,10,8,10,5,12,12,15,10,12,12,12,12,9,12,12,13,10,2,2,2,2,13,6,5,13,generated,capped by band
Montañeses,5,Marius Mihai,-,DC,DM,29,ROU,EU,Non-HG,No,Registered,57,57,Left,184,79,4,11,9,7,4,12,12,12,10,10,14,12,11,11,11,10,11,7,2,2,2,2,11,6,7,13,generated,-
Montañeses,2,Aitor Valdés,-,DR,-,29,ESP,EU,HGC,No,Registered,57,57,Left,179,79,7,9,12,10,11,12,10,10,10,13,12,11,9,8,14,13,11,11,2,2,2,2,12,12,11,13,generated,-
Montañeses,6,Nacho Cardozo,-,DM,MC/DC,24,ARG,Non-EU,Non-HG,No,Registered,60,65,Left,181,76,7,12,10,10,8,14,12,10,10,12,13,14,12,12,10,14,9,11,2,2,2,2,12,8,8,13,generated,-
Montañeses,8,Samuel Casado,-,MC,-,28,ESP,EU,HGN,No,Registered,61,62,Either,187,83,8,12,12,13,8,11,9,7,12,9,9,13,12,11,9,12,12,13,2,2,2,2,12,12,9,14,generated,capped by band
Montañeses,10,Ivo Bermejo,-,MC,AMC,23,ESP,EU,HGN,No,Registered,59,65,Right,175,74,8,11,11,11,8,11,8,9,10,13,10,11,13,8,10,13,8,12,2,2,2,2,11,8,11,13,generated,-
Montañeses,11,Xavi Segura,-,AML,-,31,ESP,EU,HGN,No,Registered,59,59,Left,182,80,11,9,13,15,9,5,6,6,11,10,3,13,12,7,11,11,8,12,2,2,2,2,10,10,13,12,generated,-
Montañeses,7,Quentin Carpentier,-,AMR,ST,27,FRA,EU,Non-HG,No,Registered,59,59,Left,179,76,9,11,12,14,10,6,5,7,12,8,7,10,11,9,12,10,10,13,2,2,2,2,11,11,11,11,generated,-
Montañeses,9,Yeray Naranjo,-,ST,AML,26,ESP,EU,HGC,No,Registered,58,58,Right,176,79,12,9,10,14,7,5,4,10,9,11,8,13,10,10,13,11,13,10,2,2,2,2,11,13,11,11,generated,-
Montañeses,13,Vasco Pacheco,-,GK,-,21,POR,EU,Non-HG,Yes,U21 Exempt,54,59,Right,185,79,2,11,3,8,2,3,3,4,6,9,12,8,11,8,8,6,10,10,11,13,13,9,9,2,2,11,generated,-
Montañeses,23,Marc Cordero,-,DL,DC,29,ESP,EU,HGC,No,Registered,54,54,Left,179,73,6,10,11,10,10,11,10,8,11,10,10,12,11,8,8,14,9,11,2,2,2,2,11,9,8,11,generated,-
Montañeses,30,Guillermo Barrios,-,DC,-,18,ESP,EU,HGC,Yes,U21 Exempt,55,67,Right,190,81,4,8,5,9,6,11,12,13,9,9,12,10,13,9,10,12,13,10,2,2,2,2,10,4,5,12,generated,-
Montañeses,15,Bas De Jong,-,DC,-,22,NED,EU,Non-HG,No,Registered,54,60,Right,195,96,5,9,9,9,3,13,11,12,7,11,10,11,8,11,10,11,11,7,2,2,2,2,12,5,5,12,generated,-
Montañeses,22,Hugo Soriano,-,DR,-,24,ESP,EU,HGN,No,Registered,53,55,Left,183,79,6,10,10,11,10,10,11,8,9,10,11,12,11,7,11,13,11,12,2,2,2,2,11,10,8,11,generated,-
Montañeses,14,Hugo Sosa,-,DM,-,23,CHI,Non-EU,Non-HG,No,Registered,55,60,Left,181,74,5,11,8,10,7,11,11,10,13,12,12,12,10,10,9,12,11,9,2,2,2,2,13,8,6,11,generated,-
Montañeses,16,Pablo Rueda,-,MC,DM,25,ESP,EU,HGN,No,Registered,54,57,Right,180,77,8,12,11,11,7,10,10,7,11,13,10,12,10,8,11,11,11,10,2,2,2,2,11,10,11,11,generated,-
Montañeses,17,Pedro Negrete,-,AMC,-,23,ESP,EU,HGC,No,Registered,52,55,Right,179,76,8,10,12,11,10,6,8,7,12,10,9,10,12,7,8,10,8,10,2,2,2,2,10,12,11,11,generated,-
Montañeses,21,Davide Farina,-,AML,ML,23,ITA,EU,Non-HG,No,Registered,53,57,Left,174,71,11,9,13,11,11,7,4,8,11,8,7,10,9,5,11,10,10,13,2,2,2,2,8,10,14,8,generated,-
Montañeses,19,Álvaro Trujillo,-,AMR,-,26,ESP,EU,HGC,No,Registered,56,58,Right,174,68,9,9,12,13,8,5,5,8,9,9,7,10,11,7,11,10,9,14,2,2,2,2,13,10,12,8,generated,-
Montañeses,18,Gonzalo Izquierdo,-,ST,-,34,ESP,EU,HGN,No,Registered,52,52,Right,186,82,12,8,10,11,4,6,5,9,8,9,5,11,10,9,9,10,10,11,2,2,2,2,13,11,12,11,generated,-
Montañeses,25,Andrés Lorente,-,GK,-,21,ESP,EU,HGC,Yes,U21 Exempt,54,60,Right,196,87,2,10,2,9,2,3,3,4,8,10,12,7,13,8,9,9,10,10,12,10,11,11,10,2,2,7,generated,-
Montañeses,31,Héctor Segura,-,MC,-,20,ESP,EU,HGC,Yes,U21 Exempt,53,59,Right,184,74,6,9,10,12,9,9,9,8,12,10,9,11,11,9,9,14,10,9,2,2,2,2,11,11,10,12,generated,-
Montañeses,32,Hugo Calvo,-,ST,-,18,ESP,EU,HGC,Yes,U21 Exempt,55,71,Right,180,74,12,11,10,10,7,4,4,11,10,9,6,13,11,9,10,12,10,9,2,2,2,2,12,13,9,9,generated,-
```

## 2. Serie A

### Giallorossi (AS Roma)
**Reputation:** 81 | **CA Band:** 67–76 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Giallorossi,1,Vincenzo Carbone,-,GK,-,29,ITA,EU,HGC,No,Registered,75,75,Right,191,98,2,13,2,10,2,3,3,4,10,14,15,10,13,12,10,10,12,14,14,16,15,15,16,2,2,11,generated,-
Giallorossi,3,Nicolò Pellegrini,-,DL,ML,30,ITA,EU,HGN,No,Registered,72,72,Left,182,78,6,14,10,11,15,12,15,10,12,13,14,15,13,11,15,16,13,15,2,2,2,2,12,11,10,14,generated,-
Giallorossi,4,Gianluca Bellini,-,DC,-,28,ITA,EU,HGC,No,Registered,75,78,Right,192,93,6,13,10,12,5,15,17,12,12,14,17,15,13,12,15,13,16,12,2,2,2,2,14,6,6,15,generated,-
Giallorossi,5,Patrick Haider,-,DC,DL,30,AUT,EU,Non-HG,No,Registered,74,74,Right,185,83,4,13,9,12,5,15,16,16,10,15,19,14,14,12,13,13,17,11,2,2,2,2,14,6,6,15,generated,-
Giallorossi,2,Dimitrios Karagiannis,-,DR,WBR/MR,28,GRE,EU,Non-HG,No,Registered,73,73,Right,184,79,9,14,12,13,17,17,13,12,11,12,14,17,14,10,15,16,14,14,2,2,2,2,11,14,12,12,generated,-
Giallorossi,6,Max Norris,-,DM,-,32,ENG,Non-EU,Non-HG,No,Registered,74,74,Right,184,86,7,16,11,16,10,16,14,12,12,15,15,14,14,12,13,16,16,10,2,2,2,2,15,8,11,15,generated,-
Giallorossi,8,Nacho Cáceres,-,MC,AMC/DM,30,ARG,Non-EU,Non-HG,No,Registered,75,75,Right,180,76,12,15,14,16,9,13,10,11,15,13,11,16,16,10,13,14,13,14,2,2,2,2,15,11,13,17,generated,-
Giallorossi,10,Leon Fuchs,-,MC,-,23,SUI,Non-EU,Non-HG,No,Registered,75,79,Left,172,64,11,16,15,16,11,12,11,10,13,15,12,14,16,12,14,17,13,14,2,2,2,2,14,14,14,17,generated,-
Giallorossi,11,Valerio Mancini,-,AML,-,30,ITA,EU,HGC,No,Registered,75,75,Left,173,70,15,13,16,15,13,6,5,9,12,13,7,16,13,9,18,16,14,17,2,2,2,2,14,19,17,13,generated,-
Giallorossi,7,Luka Novak,-,AMR,-,27,SVN,EU,Non-HG,No,Registered,73,73,Right,178,77,11,12,14,13,12,6,7,10,14,12,6,12,11,9,15,13,11,15,2,2,2,2,15,13,14,14,generated,-
Giallorossi,9,Krzysztof Jabłoński,-,ST,AMR,27,POL,EU,Non-HG,No,Registered,74,74,Left,188,84,14,12,13,14,9,7,4,13,11,12,6,15,18,12,15,13,15,14,2,2,2,2,13,17,15,13,generated,-
Giallorossi,13,Giovanni Serra,-,GK,-,22,ITA,EU,HGC,No,Registered,68,75,Left,193,95,2,8,4,9,2,3,3,4,9,13,13,10,13,11,8,8,13,14,12,14,13,15,12,2,2,10,generated,-
Giallorossi,23,Manuel Longo,-,DL,ML,26,ITA,EU,HGC,No,Registered,67,68,Left,178,73,7,13,13,12,12,14,11,11,13,13,12,12,11,10,15,14,11,12,2,2,2,2,13,11,10,13,generated,-
Giallorossi,15,Théo Vidal,-,DC,DL,32,FRA,EU,Non-HG,No,Registered,67,67,Right,190,85,4,11,9,11,5,17,13,16,11,13,14,14,14,10,14,12,14,11,2,2,2,2,15,6,4,13,generated,-
Giallorossi,24,Jack Maddox,-,DC,DR,30,USA,Non-EU,Non-HG,No,Registered,73,73,Left,186,84,5,12,9,10,6,18,17,15,10,14,15,14,13,11,11,16,14,9,2,2,2,2,16,8,4,14,generated,-
Giallorossi,22,Riccardo Fabbri,-,DR,MR,31,ITA,EU,HGC,No,Registered,69,69,Left,181,76,6,13,12,12,13,14,13,11,12,12,14,14,12,9,16,14,9,14,2,2,2,2,13,11,12,16,generated,-
Giallorossi,14,Eduardo Guimarães,-,DM,MC,30,BRA,Non-EU,Non-HG,No,Registered,69,69,Right,179,73,7,14,12,12,9,14,13,10,12,18,15,17,12,10,10,15,12,13,2,2,2,2,15,10,9,15,generated,-
Giallorossi,16,Lasse Winther,-,MC,-,28,DEN,EU,Non-HG,No,Registered,69,69,Right,182,81,9,16,13,13,8,12,12,10,13,14,12,17,15,12,12,13,11,13,2,2,2,2,12,12,11,15,generated,-
Giallorossi,17,Mario Cano,-,AMC,-,20,ESP,EU,Non-HG,Yes,U21 Exempt,69,77,Right,176,71,13,14,14,13,13,8,8,9,13,14,9,15,14,9,13,13,13,13,2,2,2,2,13,15,16,13,generated,-
Giallorossi,30,Luca Fabbri,-,AML,-,17,ITA,EU,HGC,Yes,U21 Exempt,69,80,Right,179,79,12,12,13,15,12,7,4,8,13,13,6,14,14,9,16,12,10,14,2,2,2,2,13,12,15,14,generated,-
Giallorossi,19,Marc Salcedo,-,AMR,-,24,ESP,EU,Non-HG,No,Registered,69,72,Right,177,76,12,13,13,13,16,7,6,7,15,12,6,13,11,10,15,14,9,14,2,2,2,2,14,13,15,12,generated,-
Giallorossi,18,Uroš Milošević,-,ST,AML,23,SRB,Non-EU,Non-HG,No,Registered,71,77,Left,190,87,13,12,12,13,6,5,3,13,11,11,7,13,12,8,13,14,15,14,2,2,2,2,13,14,12,13,generated,-
Giallorossi,25,Giacomo Caputo,-,GK,-,18,ITA,EU,HGC,Yes,U21 Exempt,70,86,Left,187,79,2,11,3,10,2,3,3,4,9,16,13,11,12,11,8,8,12,13,14,13,14,13,13,2,2,13,generated,-
Giallorossi,31,Roberto Fontana,-,MC,AMC,19,ITA,EU,HGC,Yes,U21 Exempt,68,80,Right,181,78,11,13,12,14,10,10,9,11,13,15,13,16,11,10,14,15,11,14,2,2,2,2,14,11,12,14,generated,-
Giallorossi,32,Giacomo Farina,-,ST,-,19,ITA,EU,Non-HG,Yes,U21 Exempt,69,82,Right,184,79,13,12,12,13,8,5,4,13,12,13,5,12,12,8,13,14,15,13,2,2,2,2,14,13,12,12,generated,-
```

### Biancocelesti (SS Lazio)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Biancocelesti,1,Adil Berrada,-,GK,-,30,MAR,Non-EU,Non-HG,No,Registered,73,73,Right,190,79,2,11,2,11,2,3,3,4,8,15,12,11,15,10,7,9,13,13,15,16,14,13,15,2,2,12,generated,-
Biancocelesti,3,Andrea Rizzo,-,DL,-,32,ITA,EU,HGC,No,Registered,73,73,Left,187,82,5,13,13,13,14,13,15,11,12,13,14,15,12,10,13,16,12,15,2,2,2,2,13,13,9,15,generated,-
Biancocelesti,4,Florian Thys,-,DC,-,23,BEL,EU,Non-HG,No,Registered,73,78,Right,183,74,5,12,10,11,5,13,14,17,9,14,16,14,12,11,15,12,14,11,2,2,2,2,16,7,6,13,generated,-
Biancocelesti,5,Rafael Loureiro,-,DC,DR,32,POR,EU,Non-HG,No,Registered,72,72,Left,186,89,6,12,10,12,6,16,15,15,11,12,14,15,14,12,14,15,15,10,2,2,2,2,16,6,8,16,generated,-
Biancocelesti,2,Emanuele Monti,-,DR,DC,26,ITA,EU,HGN,No,Registered,73,75,Right,179,77,7,11,14,13,13,15,13,11,12,14,14,15,13,10,16,16,13,16,2,2,2,2,17,12,13,14,generated,-
Biancocelesti,6,Mattia Santoro,-,DM,MC/DC,24,ITA,EU,HGC,No,Registered,73,75,Right,185,77,9,15,13,15,7,15,12,12,13,14,13,14,13,11,11,14,12,13,2,2,2,2,14,9,9,16,generated,-
Biancocelesti,8,Tin Vidović,-,MC,-,26,SVN,EU,Non-HG,No,Registered,68,68,Right,177,75,11,17,13,13,8,13,10,9,14,12,9,16,14,10,11,15,12,13,2,2,2,2,14,12,10,16,generated,-
Biancocelesti,10,Adriano Rocha,-,MC,DM,24,BRA,Non-EU,Non-HG,No,Registered,74,80,Left,174,73,9,16,14,15,9,14,13,9,15,15,12,15,14,11,13,14,14,14,2,2,2,2,16,11,11,15,generated,capped by band
Biancocelesti,11,Alessandro Moretti,-,AML,ML/ST,33,ITA,EU,HGC,No,Registered,73,73,Either,170,68,11,14,15,13,13,5,6,8,12,12,6,14,14,9,16,14,12,14,2,2,2,2,14,16,15,14,generated,-
Biancocelesti,7,Petar Petković,-,AMR,-,34,MKD,Non-EU,Non-HG,No,Registered,74,74,Right,182,78,11,14,15,15,12,9,6,6,13,14,6,15,15,9,13,13,14,17,2,2,2,2,12,15,15,13,generated,capped by band
Biancocelesti,9,Jaime Palomo,-,ST,-,29,ESP,EU,Non-HG,No,Registered,71,71,Left,186,78,15,10,12,11,8,6,5,11,11,13,7,15,12,11,16,11,15,13,2,2,2,2,12,16,13,13,generated,-
Biancocelesti,13,Damien Leclerc,-,GK,-,26,FRA,EU,Non-HG,No,Registered,68,70,Left,191,84,2,9,4,10,2,3,3,4,10,12,13,11,14,10,8,10,11,12,13,14,14,14,15,2,2,12,generated,-
Biancocelesti,23,Fatjon Mehmeti,-,DL,ML,19,ALB,Non-EU,Non-HG,Yes,U21 Exempt,68,82,Left,185,83,6,12,13,14,12,13,13,11,11,14,14,14,9,8,16,14,13,12,2,2,2,2,13,11,10,12,generated,-
Biancocelesti,15,Eduardo Xavier,-,DC,-,30,BRA,Non-EU,Non-HG,No,Registered,66,66,Left,194,90,5,10,8,10,8,13,14,14,11,15,15,13,13,11,11,12,14,10,2,2,2,2,15,7,7,14,generated,-
Biancocelesti,24,Magnus Larsen,-,DC,DL,22,DEN,EU,Non-HG,No,Registered,68,70,Left,192,82,5,12,7,12,8,13,13,14,7,14,14,13,11,12,14,13,15,12,2,2,2,2,12,6,7,14,generated,-
Biancocelesti,22,Marko Dujmović,-,DR,-,23,CRO,EU,Non-HG,No,Registered,67,71,Right,173,63,6,12,14,12,12,15,13,11,10,12,11,15,12,11,13,15,12,12,2,2,2,2,14,13,9,14,generated,-
Biancocelesti,30,Paolo Barone,-,DM,DC,20,ITA,EU,HGC,Yes,U21 Exempt,68,77,Left,167,61,6,14,11,16,8,13,11,12,13,14,14,15,16,13,12,15,11,13,2,2,2,2,15,9,8,14,generated,-
Biancocelesti,14,Francesco Costa,-,MC,-,24,ITA,EU,Non-HG,No,Registered,66,69,Right,179,75,9,13,14,17,10,11,10,8,13,14,11,14,12,9,11,13,10,12,2,2,2,2,13,10,12,16,generated,-
Biancocelesti,17,Filip Majewski,-,AMC,-,30,POL,EU,Non-HG,No,Registered,66,66,Right,187,82,11,13,13,13,12,6,8,9,14,13,6,13,16,10,13,14,11,14,2,2,2,2,15,14,13,15,generated,-
Biancocelesti,21,Filip Bilić,-,AML,ML,32,CRO,EU,Non-HG,No,Registered,68,68,Left,177,76,12,13,13,14,17,6,6,9,12,11,10,13,10,8,16,13,11,12,2,2,2,2,12,14,14,11,generated,-
Biancocelesti,19,Adriano Queiroz,-,AMR,MR,34,BRA,Non-EU,Non-HG,No,Registered,65,65,Right,185,87,11,11,13,12,12,8,6,6,13,10,5,13,13,8,14,12,11,13,2,2,2,2,13,13,13,13,generated,-
Biancocelesti,18,Dino Brkić,-,ST,AML,26,CRO,EU,Non-HG,No,Registered,65,65,Left,186,79,15,10,13,13,7,5,5,10,9,10,6,13,12,11,13,12,11,10,2,2,2,2,14,13,12,14,generated,-
Biancocelesti,25,Giacomo Valentini,-,GK,-,18,ITA,EU,HGN,Yes,U21 Exempt,65,77,Right,194,93,2,12,4,10,2,3,3,4,10,11,12,8,12,11,9,8,9,14,12,14,13,12,11,2,2,12,generated,-
Biancocelesti,31,Marco Barone,-,MC,-,18,ITA,EU,HGC,Yes,U21 Exempt,65,76,Right,177,72,9,13,12,13,11,9,11,10,15,13,11,14,12,11,13,15,12,11,2,2,2,2,13,11,12,15,generated,-
Biancocelesti,32,Luca Amato,-,ST,-,20,ITA,EU,HGC,Yes,U21 Exempt,66,76,Right,187,80,14,10,14,12,8,6,4,13,11,12,7,13,13,8,14,13,13,11,2,2,2,2,14,13,9,12,generated,-
```

### Viola (ACF Fiorentina)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Viola,1,Simone Costa,-,GK,-,25,ITA,EU,HGN,No,Registered,73,75,Right,189,84,2,14,2,8,2,3,3,4,11,13,15,9,15,12,10,8,11,14,14,16,15,15,15,2,2,12,generated,-
Viola,3,Gianluca Serra,-,DL,DC,27,ITA,EU,HGC,No,Registered,73,76,Left,177,68,5,14,14,13,14,16,13,10,12,16,15,15,12,10,17,16,14,14,2,2,2,2,14,12,11,17,generated,-
Viola,4,Jean Rezende,-,DC,-,31,BRA,Non-EU,Non-HG,No,Registered,74,74,Right,192,86,5,13,11,13,7,16,17,14,10,14,17,14,13,11,14,15,17,11,2,2,2,2,16,5,2,15,generated,capped by band
Viola,5,Fabian Köhler,-,DC,-,27,GER,EU,Non-HG,No,Registered,74,75,Left,181,80,4,10,9,11,4,15,15,15,10,16,14,13,14,10,13,15,15,11,2,2,2,2,15,5,6,18,generated,capped by band
Viola,2,Aitor Palomo,-,DR,-,31,ESP,EU,Non-HG,No,Registered,73,73,Left,183,77,8,11,13,13,11,13,13,9,12,14,16,17,12,9,17,15,13,14,2,2,2,2,12,10,11,16,generated,-
Viola,6,Kai Winter,-,DM,MC,27,AUT,EU,Non-HG,No,Registered,74,74,Right,174,68,8,15,12,12,8,15,17,12,13,15,15,16,13,11,14,16,15,14,2,2,2,2,15,10,10,15,generated,capped by band
Viola,8,Mats Willems,-,MC,DM,31,NED,EU,Non-HG,No,Registered,71,71,Left,177,74,10,14,13,14,9,11,9,10,13,14,14,14,15,12,13,16,12,12,2,2,2,2,15,13,13,16,generated,-
Viola,10,Thomas Vandenberghe,-,MC,-,28,BEL,EU,Non-HG,No,Registered,71,73,Right,183,77,11,16,13,14,10,13,10,9,14,16,12,14,14,10,14,14,14,12,2,2,2,2,14,13,9,16,generated,-
Viola,11,Bardh Kastrati,-,AML,-,27,ALB,Non-EU,Non-HG,No,Registered,74,75,Left,184,80,12,12,16,14,17,7,4,8,11,13,7,15,15,7,16,12,10,16,2,2,2,2,15,14,17,13,generated,capped by band
Viola,7,Luka Babić,-,AMR,-,33,SVN,EU,Non-HG,No,Registered,74,74,Left,175,76,13,12,18,17,13,8,6,8,14,13,6,13,12,11,18,13,12,15,2,2,2,2,14,15,15,15,generated,capped by band
Viola,9,Kai Hofmann,-,ST,AMC,25,SUI,Non-EU,Non-HG,No,Registered,73,74,Right,189,91,14,11,12,15,8,5,4,14,11,10,8,14,13,10,16,12,13,14,2,2,2,2,17,16,12,12,generated,-
Viola,13,Paolo Serra,-,GK,-,23,ITA,EU,HGN,No,Registered,65,72,Right,189,92,2,11,3,9,2,3,3,4,9,13,12,10,13,12,8,7,12,14,12,11,13,11,13,2,2,11,generated,-
Viola,23,Santi Castaño,-,DL,ML,28,ESP,EU,Non-HG,No,Registered,68,68,Left,184,82,6,13,10,14,12,14,11,10,11,11,13,14,14,8,15,13,12,13,2,2,2,2,13,11,9,15,generated,-
Viola,15,Stefano Messina,-,DC,-,27,ITA,EU,HGC,No,Registered,65,65,Left,187,79,5,13,10,12,5,12,16,15,8,13,15,13,12,12,13,13,12,11,2,2,2,2,14,5,4,13,generated,-
Viola,24,Ivo Cuevas,-,DC,DL,21,COL,Non-EU,Non-HG,Yes,U21 Exempt,71,82,Right,186,77,3,12,8,14,5,13,13,15,12,12,12,13,14,11,14,11,15,10,2,2,2,2,15,7,5,17,generated,-
Viola,22,Roko Jurić,-,DR,DC/WBR,19,CRO,EU,Non-HG,Yes,U21 Exempt,65,80,Right,185,83,6,12,13,11,13,13,14,8,10,12,11,14,12,12,15,16,13,11,2,2,2,2,11,12,10,15,generated,-
Viola,14,Davide Valentini,-,DM,-,24,ITA,EU,HGC,No,Registered,69,72,Right,184,83,8,12,9,13,8,14,15,8,14,14,13,15,12,9,14,15,13,12,2,2,2,2,15,8,9,16,generated,-
Viola,16,Diego Greco,-,MC,DM/AMC,27,ITA,EU,HGN,No,Registered,67,70,Right,174,69,8,11,13,12,8,12,11,7,14,12,11,14,14,11,13,14,12,11,2,2,2,2,15,11,13,14,generated,-
Viola,17,Daniel Agyeman,-,AMC,-,26,GHA,Non-EU,Non-HG,No,Registered,72,72,Right,173,67,13,15,16,15,12,10,9,10,14,14,9,16,14,9,15,13,11,15,2,2,2,2,13,17,15,14,generated,-
Viola,21,Manuel Marino,-,AML,-,27,ITA,EU,HGC,No,Registered,66,67,Left,179,67,11,12,16,14,11,6,6,8,12,12,8,13,10,10,14,12,11,15,2,2,2,2,12,14,13,13,generated,-
Viola,19,Burak Kılıç,-,AMR,ST,28,TUR,Non-EU,Non-HG,No,Registered,65,66,Left,180,82,13,13,14,12,10,8,5,5,13,11,6,11,13,10,13,13,11,12,2,2,2,2,13,12,13,14,generated,-
Viola,30,Pietro Gentile,-,ST,AMC,19,ITA,EU,HGN,Yes,U21 Exempt,65,78,Right,179,71,14,10,10,10,5,5,6,9,11,12,7,12,13,11,11,12,11,13,2,2,2,2,14,12,10,11,generated,-
Viola,25,Gabriele Rossetti,-,GK,-,17,ITA,EU,HGN,Yes,U21 Exempt,65,80,Left,190,95,2,9,3,9,2,3,3,4,12,16,15,9,11,10,7,8,12,12,16,14,15,11,14,2,2,12,generated,-
Viola,31,Pietro Pellegrini,-,MC,-,17,ITA,EU,HGC,Yes,U21 Exempt,68,78,Right,178,70,11,14,12,13,10,11,11,10,15,14,11,14,14,10,13,12,11,13,2,2,2,2,13,11,12,15,generated,-
Viola,32,Giorgio Sala,-,ST,AMC,18,ITA,EU,HGC,Yes,U21 Exempt,65,75,Right,181,79,12,9,12,10,7,6,2,11,10,11,4,13,12,10,13,12,13,13,2,2,2,2,12,15,11,13,generated,-
```

### Felsinei (Bologna FC 1909)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Felsinei,1,Vincenzo Bianco,-,GK,-,30,ITA,EU,HGC,No,Registered,72,72,Right,187,85,2,12,3,10,2,3,3,4,9,13,15,9,13,11,9,11,13,13,14,14,16,15,13,2,2,11,generated,-
Felsinei,3,Linus Lindgren,-,DL,-,32,SWE,EU,Non-HG,No,Registered,71,71,Right,175,75,8,13,13,13,14,15,13,11,12,13,13,16,12,10,14,14,13,15,2,2,2,2,14,12,11,15,generated,-
Felsinei,4,Dídac Lorente,-,DC,DR,26,ESP,EU,Non-HG,No,Registered,70,72,Right,189,78,4,11,7,11,6,15,14,14,10,15,14,11,13,12,14,13,15,10,2,2,2,2,14,5,4,15,generated,-
Felsinei,5,Simon Fuchs,-,DC,DM,31,AUT,EU,Non-HG,No,Registered,73,73,Right,191,87,4,12,9,13,5,15,15,15,11,13,15,12,13,12,12,11,16,12,2,2,2,2,15,6,5,16,generated,-
Felsinei,2,Leonardo Marino,-,DR,-,30,ITA,EU,HGC,No,Registered,72,72,Right,180,80,8,14,12,15,12,16,12,10,11,14,13,15,14,11,16,17,12,12,2,2,2,2,13,14,10,12,generated,-
Felsinei,6,Riccardo Piras,-,DM,-,29,ITA,EU,HGC,No,Registered,74,74,Right,183,81,7,15,13,13,9,15,12,11,12,14,14,16,13,8,13,16,14,14,2,2,2,2,16,9,6,16,generated,capped by band
Felsinei,8,Adrián Olmedo,-,MC,DM,31,ESP,EU,Non-HG,No,Registered,72,72,Left,177,70,9,15,12,14,9,12,10,8,16,14,13,13,14,9,13,16,11,13,2,2,2,2,15,13,12,15,generated,-
Felsinei,10,Guillermo Escobar,-,MC,DM,23,URU,Non-EU,Non-HG,No,Registered,71,75,Right,176,76,8,19,14,13,10,13,11,10,15,14,14,16,14,10,12,14,12,12,2,2,2,2,16,12,12,18,generated,-
Felsinei,11,Finn Timmer,-,AML,-,23,NED,EU,Non-HG,No,Registered,74,81,Left,181,71,12,13,14,15,11,6,6,8,12,13,7,16,13,9,16,15,10,19,2,2,2,2,13,14,15,15,generated,capped by band
Felsinei,7,Lucas Hermans,-,AMR,ST,27,BEL,EU,Non-HG,No,Registered,73,76,Left,182,75,14,14,16,13,16,6,5,7,13,12,8,15,12,10,15,12,9,17,2,2,2,2,13,14,17,14,generated,-
Felsinei,9,Sem Meijer,-,ST,-,30,NED,EU,Non-HG,No,Registered,74,74,Right,182,83,14,11,11,13,6,5,6,15,11,11,6,13,18,12,17,13,14,15,2,2,2,2,14,14,11,12,generated,capped by band
Felsinei,13,Luka Zdravković,-,GK,-,28,BIH,Non-EU,Non-HG,No,Registered,66,67,Right,188,90,2,10,4,8,2,3,3,4,9,13,14,10,13,12,8,8,10,11,16,14,14,13,13,2,2,9,generated,-
Felsinei,23,Armando Cela,-,DL,WBL,25,ALB,Non-EU,Non-HG,No,Registered,66,66,Left,182,81,7,12,13,13,14,13,14,12,11,12,11,13,13,9,13,12,12,13,2,2,2,2,13,11,10,14,generated,-
Felsinei,15,Frederik Persson,-,DC,DR,24,SWE,EU,Non-HG,No,Registered,70,73,Right,191,90,5,13,8,13,4,17,13,16,11,15,15,13,14,11,15,14,14,11,2,2,2,2,15,7,5,15,generated,-
Felsinei,24,Rafael Araújo,-,DC,-,33,BRA,Non-EU,Non-HG,No,Registered,65,65,Right,188,83,5,11,9,11,6,15,14,14,8,12,13,13,13,10,13,11,14,8,2,2,2,2,14,9,5,15,generated,-
Felsinei,22,Hakan Kılıç,-,DR,MR,29,TUR,Non-EU,Non-HG,No,Registered,67,67,Either,176,76,6,13,13,12,13,13,12,13,11,12,14,15,16,10,13,13,13,12,2,2,2,2,13,13,9,14,generated,-
Felsinei,14,Riccardo Fontana,-,DM,-,21,ITA,EU,HGN,Yes,U21 Exempt,66,72,Right,181,74,6,13,11,13,6,14,12,10,12,11,13,14,13,10,12,14,12,11,2,2,2,2,12,10,9,15,generated,-
Felsinei,30,Giorgio Leone,-,MC,-,18,ITA,EU,HGC,Yes,U21 Exempt,68,81,Right,172,67,8,15,12,14,11,14,10,9,15,14,13,14,13,11,12,13,13,14,2,2,2,2,15,13,11,14,generated,-
Felsinei,17,Michele Cattaneo,-,AMC,MC,36,ITA,EU,HGC,No,Registered,68,68,Right,176,70,12,13,13,13,11,9,8,9,14,13,10,14,13,10,12,14,12,14,2,2,2,2,14,14,15,15,generated,-
Felsinei,21,Mert Doğan,-,AML,-,26,TUR,Non-EU,Non-HG,No,Registered,68,70,Left,182,79,14,10,14,12,10,7,5,7,12,11,8,15,12,8,13,12,12,18,2,2,2,2,13,12,13,11,generated,-
Felsinei,19,Roko Babić,-,AMR,-,25,SVN,EU,Non-HG,No,Registered,65,65,Right,171,73,11,13,12,13,10,6,8,8,12,12,6,10,12,8,14,11,8,13,2,2,2,2,11,11,14,12,generated,-
Felsinei,18,Simone Moretti,-,ST,AML,33,ITA,EU,HGN,No,Registered,66,66,Left,184,81,14,9,12,13,6,6,2,17,11,11,6,15,11,11,12,11,12,13,2,2,2,2,14,16,10,14,generated,-
Felsinei,25,Edoardo Longo,-,GK,-,17,ITA,EU,HGC,Yes,U21 Exempt,67,78,Right,188,81,2,10,3,8,2,3,3,4,10,12,12,9,13,11,7,7,12,12,15,11,10,13,15,2,2,11,generated,-
Felsinei,31,Marco Longo,-,MC,-,19,ITA,EU,HGC,Yes,U21 Exempt,68,82,Right,179,76,11,12,13,13,11,12,11,10,12,14,11,14,12,10,10,16,12,15,2,2,2,2,14,12,10,15,generated,-
Felsinei,32,Nicolò Bianco,-,ST,-,19,ITA,EU,HGC,Yes,U21 Exempt,68,84,Right,187,85,15,12,12,14,9,5,4,15,10,12,6,14,12,12,13,13,13,14,2,2,2,2,14,11,11,13,generated,-
```

### Granata (Torino FC)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Granata,1,Paweł Baran,-,GK,-,36,POL,EU,Non-HG,No,Registered,70,70,Right,192,93,2,11,3,11,2,3,3,4,10,13,14,9,12,11,9,11,14,13,16,14,14,14,15,2,2,12,generated,capped by band
Granata,3,Giovanni De Luca,-,DL,WBL,25,ITA,EU,Non-HG,No,Registered,70,70,Left,175,65,6,13,12,13,11,13,15,14,11,13,15,16,13,10,14,17,12,13,2,2,2,2,14,11,10,14,generated,capped by band
Granata,4,Clément Sauvage,-,DC,-,34,FRA,EU,Non-HG,No,Registered,69,69,Right,190,79,4,12,8,11,6,18,14,17,11,12,19,14,15,12,13,13,13,13,2,2,2,2,12,7,8,14,generated,-
Granata,5,Filippo Moretti,-,DC,DM,29,ITA,EU,Non-HG,No,Registered,69,69,Right,191,85,5,11,8,12,6,15,14,14,8,13,15,14,13,10,12,12,13,12,2,2,2,2,15,6,5,13,generated,-
Granata,2,Enzo Fabre,-,DR,-,27,FRA,EU,Non-HG,No,Registered,67,69,Right,182,78,7,11,12,13,13,13,15,11,10,11,13,15,13,11,13,14,10,15,2,2,2,2,12,13,11,16,generated,-
Granata,6,Joaquín Paredes,-,DM,MC,26,COL,Non-EU,Non-HG,No,Registered,68,69,Left,180,82,7,13,10,10,7,14,12,10,13,12,14,15,13,13,12,15,12,10,2,2,2,2,14,10,8,14,generated,-
Granata,8,Efe Sarı,-,MC,-,22,TUR,Non-EU,Non-HG,No,Registered,70,73,Right,180,77,10,13,14,15,8,11,11,8,12,13,13,15,14,12,13,15,12,14,2,2,2,2,14,12,12,17,generated,capped by band
Granata,10,Mathias Claes,-,MC,-,30,BEL,EU,Non-HG,No,Registered,67,67,Right,177,73,8,14,11,17,10,11,10,6,14,16,13,14,13,9,13,14,13,11,2,2,2,2,14,12,12,16,generated,-
Granata,11,Davide Ferrara,-,AML,ML,23,ITA,EU,HGN,No,Registered,67,72,Left,183,85,11,12,15,15,13,6,6,9,14,11,8,14,15,6,16,14,11,16,2,2,2,2,14,12,14,11,generated,-
Granata,7,Furkan Uçar,-,AMR,-,28,TUR,Non-EU,Non-HG,No,Registered,70,72,Left,174,71,14,15,15,15,11,8,5,9,14,11,8,12,13,11,13,12,10,17,2,2,2,2,14,16,16,11,generated,capped by band
Granata,9,Valentin Millet,-,ST,AML,30,FRA,EU,Non-HG,No,Registered,68,68,Right,182,83,13,11,12,14,8,5,4,10,10,10,5,12,14,8,14,11,14,14,2,2,2,2,14,16,13,13,generated,-
Granata,13,Xavi Insúa,-,GK,-,32,COL,Non-EU,Non-HG,No,Registered,67,67,Right,188,86,2,11,2,9,2,3,3,4,10,15,11,9,12,11,11,9,11,13,14,14,13,13,12,2,2,12,generated,-
Granata,23,Bartosz Dudek,-,DL,DC,36,POL,EU,Non-HG,No,Registered,62,62,Left,183,82,6,9,12,10,13,12,11,11,11,10,13,13,12,9,10,13,12,12,2,2,2,2,12,10,10,13,generated,-
Granata,15,Andrea Farina,-,DC,-,29,ITA,EU,HGN,No,Registered,62,62,Right,183,80,6,10,9,11,5,12,12,15,8,10,15,13,14,10,11,11,13,10,2,2,2,2,11,4,4,15,generated,-
Granata,24,Damien Renaud,-,DC,DR,27,FRA,EU,Non-HG,No,Registered,62,64,Right,194,86,4,10,7,10,4,13,11,13,8,10,13,11,12,9,13,13,13,11,2,2,2,2,13,4,6,14,generated,-
Granata,22,Kasper Bech,-,DR,-,34,DEN,EU,Non-HG,No,Registered,61,61,Left,178,77,8,10,11,10,13,12,13,9,10,11,10,16,13,9,13,14,11,13,2,2,2,2,13,12,8,13,generated,-
Granata,14,Samuele Caputo,-,DM,MC,30,ITA,EU,HGC,No,Registered,61,61,Right,180,73,7,11,13,11,6,12,13,10,11,12,13,14,13,12,11,15,10,11,2,2,2,2,13,7,9,13,generated,-
Granata,30,Edoardo Cattaneo,-,MC,AMC,18,ITA,EU,HGC,Yes,U21 Exempt,64,79,Right,185,84,10,14,11,12,11,10,10,8,13,14,14,13,12,11,11,14,10,13,2,2,2,2,14,8,10,14,generated,-
Granata,17,Jens Olesen,-,AMC,-,22,DEN,EU,Non-HG,No,Registered,63,65,Either,173,68,11,10,13,13,10,8,7,7,14,13,8,14,13,10,13,13,9,12,2,2,2,2,14,12,14,13,generated,-
Granata,21,Marko Obradović,-,AML,ST/ML,25,BIH,Non-EU,Non-HG,No,Registered,70,70,Left,178,70,14,11,16,15,14,6,5,5,13,12,7,15,13,9,16,10,10,16,2,2,2,2,10,13,16,12,generated,capped by band
Granata,19,Ivo Benítez,-,AMR,-,24,COL,Non-EU,Non-HG,No,Registered,64,69,Right,175,71,10,10,13,12,12,6,5,7,12,12,8,13,10,7,14,13,11,13,2,2,2,2,11,12,14,12,generated,-
Granata,18,Dario Dujmović,-,ST,-,27,CRO,EU,Non-HG,No,Registered,63,66,Right,186,85,14,8,13,13,7,3,4,14,9,10,7,15,12,9,13,11,13,10,2,2,2,2,15,13,12,13,generated,-
Granata,25,Stefano Gentile,-,GK,-,18,ITA,EU,HGC,Yes,U21 Exempt,61,76,Right,189,82,2,11,6,8,2,3,3,4,9,13,12,8,10,10,8,9,11,9,11,10,10,10,12,2,2,11,generated,-
Granata,31,Matteo Longo,-,MC,DM/AMC,18,ITA,EU,HGC,Yes,U21 Exempt,62,71,Right,173,69,7,13,12,12,9,10,11,7,14,10,10,13,11,9,9,11,9,13,2,2,2,2,15,11,10,14,generated,-
Granata,32,Andrea Fontana,-,ST,AML,20,ITA,EU,HGC,Yes,U21 Exempt,64,71,Right,182,76,12,11,12,12,8,5,3,13,11,11,6,13,12,10,13,11,13,14,2,2,2,2,13,13,11,15,generated,-
```

### Grifone (Genoa CFC)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Grifone,1,Andrea Cattaneo,-,GK,-,26,ITA,EU,HGN,No,Registered,68,71,Right,187,80,2,9,5,8,2,3,3,4,9,13,13,9,12,10,9,8,11,13,14,13,13,14,13,2,2,13,generated,-
Grifone,3,Nikola Babić,-,DL,WBL,23,SVN,EU,Non-HG,No,Registered,63,70,Left,173,70,6,11,12,11,11,12,12,11,11,9,13,13,11,9,12,13,11,13,2,2,2,2,13,11,9,12,generated,-
Grifone,4,Adam Urban,-,DC,DM,28,POL,EU,Non-HG,No,Registered,67,68,Right,189,85,4,12,7,11,5,14,14,15,9,13,13,11,12,12,13,12,15,10,2,2,2,2,13,6,5,14,generated,-
Grifone,5,Valentin Bouvier,-,DC,-,27,FRA,EU,Non-HG,No,Registered,65,66,Right,186,78,5,9,8,13,5,13,15,15,11,14,13,12,11,11,14,11,15,10,2,2,2,2,14,7,5,13,generated,-
Grifone,2,Matej Dujmović,-,DR,-,32,CRO,EU,Non-HG,No,Registered,69,69,Left,183,81,7,11,13,12,12,14,15,11,13,15,13,14,13,11,16,14,13,14,2,2,2,2,12,11,11,14,generated,capped by band
Grifone,6,José Viana,-,DM,-,31,POR,EU,Non-HG,No,Registered,66,66,Right,181,72,5,13,10,15,7,12,11,10,13,15,16,13,14,9,11,14,13,12,2,2,2,2,13,10,8,14,generated,-
Grifone,8,Uroš Kostić,-,MC,-,32,KOS,Non-EU,Non-HG,No,Registered,67,67,Right,176,70,11,15,14,15,10,10,10,9,13,16,12,16,14,10,15,12,12,14,2,2,2,2,14,11,12,16,generated,-
Grifone,10,Ramon Okafor,-,MC,-,30,NGA,Non-EU,Non-HG,No,Registered,66,66,Left,177,68,10,14,14,12,11,11,11,9,17,15,12,16,14,9,12,11,11,11,2,2,2,2,16,9,11,14,generated,-
Grifone,11,Simone Sala,-,AML,-,31,ITA,EU,HGC,No,Registered,69,69,Left,179,75,12,10,15,14,15,6,5,8,12,14,8,12,14,10,16,12,11,16,2,2,2,2,14,12,12,12,generated,capped by band
Grifone,7,Mario Petković,-,AMR,-,30,SRB,Non-EU,Non-HG,No,Registered,68,68,Left,177,78,10,13,13,12,12,7,6,6,14,10,6,10,11,8,14,13,13,14,2,2,2,2,13,13,15,12,generated,-
Grifone,9,Roko Vasić,-,ST,-,27,SRB,Non-EU,Non-HG,No,Registered,67,70,Left,188,83,13,11,14,11,9,5,3,13,10,12,4,13,14,11,13,15,15,11,2,2,2,2,13,12,11,13,generated,-
Grifone,13,Paolo Valentini,-,GK,-,21,ITA,EU,HGC,Yes,U21 Exempt,62,67,Either,195,86,2,8,5,7,2,3,3,4,10,12,12,9,14,10,8,8,10,10,13,14,13,13,11,2,2,11,generated,-
Grifone,23,Matej Radić,-,DL,-,33,CRO,EU,Non-HG,No,Registered,61,61,Either,190,84,7,12,11,11,11,12,10,10,9,12,10,13,10,7,13,12,13,11,2,2,2,2,11,12,8,13,generated,-
Grifone,15,Sorin Bălan,-,DC,DR,27,ROU,EU,Non-HG,No,Registered,67,68,Right,193,84,5,10,8,12,5,16,15,13,11,12,13,13,12,12,12,12,15,10,2,2,2,2,12,6,3,13,generated,-
Grifone,30,Emanuele Carbone,-,DC,-,20,ITA,EU,HGC,Yes,U21 Exempt,62,74,Right,191,89,3,10,7,10,5,13,14,14,7,13,14,10,12,10,12,10,11,11,2,2,2,2,12,4,7,13,generated,-
Grifone,22,Besnik Muça,-,DR,-,27,ALB,Non-EU,Non-HG,No,Registered,60,60,Left,187,80,8,9,10,12,11,12,14,8,11,9,12,15,9,10,12,12,12,10,2,2,2,2,12,11,10,14,generated,-
Grifone,14,Felix Vogel,-,DM,-,24,GER,EU,Non-HG,No,Registered,65,70,Right,190,84,6,12,10,12,9,14,12,11,11,12,13,13,13,11,11,14,12,11,2,2,2,2,13,8,9,14,generated,-
Grifone,16,Michele Gentile,-,MC,-,22,ITA,EU,HGC,No,Registered,60,65,Right,189,83,9,15,12,12,9,10,13,8,10,11,10,11,12,9,10,12,9,11,2,2,2,2,11,8,10,12,generated,-
Grifone,17,Vincenzo Fabbri,-,AMC,-,25,ITA,EU,HGN,No,Registered,60,60,Right,184,78,12,11,13,12,10,7,7,7,10,13,6,11,12,9,10,10,10,13,2,2,2,2,14,11,9,12,generated,-
Grifone,21,Marvin Schreiber,-,AML,-,32,GER,EU,Non-HG,No,Registered,60,60,Left,179,80,11,10,14,12,11,7,7,9,12,11,6,11,10,7,12,11,11,13,2,2,2,2,13,12,13,11,generated,-
Grifone,19,Matteo Fontana,-,AMR,ST,24,ITA,EU,HGN,No,Registered,63,68,Right,181,77,13,12,13,13,12,7,6,7,14,12,7,12,13,9,14,12,9,15,2,2,2,2,11,12,11,11,generated,-
Grifone,18,Kauã Batista,-,ST,-,24,BRA,Non-EU,Non-HG,No,Registered,64,70,Either,188,82,13,9,10,12,7,8,6,12,8,11,8,13,13,10,14,12,12,11,2,2,2,2,12,15,10,13,generated,-
Grifone,25,Giorgio Conti,-,GK,-,18,ITA,EU,HGC,Yes,U21 Exempt,62,77,Left,192,88,2,8,5,10,2,3,3,4,10,11,12,9,13,10,9,9,11,12,11,11,11,12,11,2,2,10,generated,-
Grifone,31,Edoardo De Luca,-,MC,DM,19,ITA,EU,HGC,Yes,U21 Exempt,60,76,Right,191,91,9,14,11,12,8,11,10,10,15,10,9,14,12,9,11,11,9,12,2,2,2,2,12,10,11,14,generated,-
Grifone,32,Emanuele Orlando,-,ST,AMC,20,ITA,EU,HGC,Yes,U21 Exempt,62,72,Right,185,88,13,7,11,11,7,5,4,12,11,12,6,14,10,12,13,11,12,10,2,2,2,2,12,14,9,15,generated,-
```

### Zebrette (Udinese Calcio)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Zebrette,1,Giorgio Bruni,-,GK,-,26,ITA,EU,HGC,No,Registered,66,67,Left,187,88,2,11,4,10,2,3,3,4,9,12,12,8,13,12,7,10,12,12,11,13,14,13,14,2,2,12,generated,-
Zebrette,3,Alexandru Dumitru,-,DL,DC,27,ROU,EU,Non-HG,No,Registered,66,68,Left,182,75,6,13,12,12,14,15,13,11,11,12,12,15,11,10,15,13,12,11,2,2,2,2,13,8,11,14,generated,-
Zebrette,4,Bas Van den Heuvel,-,DC,-,28,NED,EU,Non-HG,No,Registered,67,70,Right,194,93,4,11,10,11,5,11,14,14,10,12,13,13,12,13,10,13,12,9,2,2,2,2,13,7,6,14,generated,capped by band
Zebrette,5,Piotr Majewski,-,DC,-,27,POL,EU,Non-HG,No,Registered,66,68,Right,189,89,4,11,8,11,6,14,14,13,10,14,14,12,13,9,14,11,13,9,2,2,2,2,13,9,6,13,generated,-
Zebrette,2,Alessandro Orlando,-,DR,DC,25,ITA,EU,HGN,No,Registered,67,68,Left,184,78,8,12,11,11,14,13,11,12,12,13,13,14,12,9,13,14,12,13,2,2,2,2,13,12,12,14,generated,capped by band
Zebrette,6,Manuel Orlando,-,DM,-,27,ITA,EU,HGN,No,Registered,67,67,Right,179,77,7,13,12,13,8,13,12,10,12,13,12,12,11,8,11,14,13,14,2,2,2,2,15,8,10,15,generated,capped by band
Zebrette,8,Michele Conti,-,MC,-,21,ITA,EU,HGN,Yes,U21 Exempt,65,77,Right,170,62,9,13,12,15,9,11,9,9,13,14,12,16,14,9,11,11,11,10,2,2,2,2,13,13,11,14,generated,-
Zebrette,10,Lennert Hermans,-,MC,DM,23,BEL,EU,Non-HG,No,Registered,63,70,Right,181,77,8,11,12,12,10,11,10,9,11,12,11,14,12,10,11,12,8,10,2,2,2,2,12,11,9,12,generated,-
Zebrette,11,Davide Bruni,-,AML,AMC/ML,30,ITA,EU,HGC,No,Registered,67,67,Left,176,66,11,13,14,13,11,6,4,7,12,13,7,14,12,9,14,13,11,15,2,2,2,2,13,13,13,13,generated,capped by band
Zebrette,7,Federico Testa,-,AMR,-,27,ITA,EU,HGN,No,Registered,66,67,Right,180,78,11,13,11,16,10,7,6,6,13,12,8,11,13,10,14,13,8,14,2,2,2,2,12,13,13,13,generated,-
Zebrette,9,Charalampos Dimitriou,-,ST,-,27,GRE,EU,Non-HG,No,Registered,66,68,Right,180,73,13,13,12,13,8,5,5,11,11,12,6,14,15,9,12,12,12,11,2,2,2,2,15,14,10,12,generated,-
Zebrette,13,Roko Zdravković,-,GK,-,30,SRB,Non-EU,Non-HG,No,Registered,58,58,Left,181,78,2,8,2,6,2,3,3,4,9,10,10,8,14,8,9,8,10,9,11,12,12,11,12,2,2,10,generated,-
Zebrette,23,Chinedu Onuoha,-,DL,-,21,NGA,Non-EU,Non-HG,Yes,U21 Exempt,58,67,Left,184,85,5,10,8,13,13,10,9,9,10,11,11,13,11,9,12,12,13,12,2,2,2,2,11,9,10,12,generated,-
Zebrette,15,Luka Nikolić,-,DC,-,30,SRB,Non-EU,Non-HG,No,Registered,61,61,Left,180,78,4,9,8,9,5,13,11,11,8,12,12,10,12,10,10,11,13,11,2,2,2,2,13,5,6,12,generated,-
Zebrette,24,Davide Sala,-,DC,-,28,ITA,EU,HGC,No,Registered,58,61,Right,188,83,5,10,10,8,5,12,12,12,10,11,11,12,11,10,8,10,12,8,2,2,2,2,12,4,8,13,generated,-
Zebrette,22,Mathias Dumont,-,DR,-,23,BEL,EU,Non-HG,No,Registered,58,65,Right,185,80,6,9,12,10,12,11,10,10,10,11,11,14,10,12,12,12,10,11,2,2,2,2,12,11,8,12,generated,-
Zebrette,14,Diego Ibáñez,-,DM,DC,33,ESP,EU,Non-HG,No,Registered,58,58,Right,181,78,7,10,9,11,7,12,12,10,12,11,14,11,11,10,11,11,10,9,2,2,2,2,14,9,8,12,generated,-
Zebrette,16,Kristian Mehmeti,-,MC,AMC,27,ALB,Non-EU,Non-HG,No,Registered,60,63,Right,178,72,8,11,12,12,10,9,9,8,11,13,12,12,10,9,10,12,10,12,2,2,2,2,13,10,11,12,generated,-
Zebrette,17,Andrea Gallo,-,AMC,-,19,ITA,EU,HGN,Yes,U21 Exempt,62,71,Right,180,76,11,13,13,12,9,8,9,7,12,16,8,15,14,10,11,11,11,13,2,2,2,2,11,11,13,11,generated,-
Zebrette,30,Giorgio Gallo,-,AML,ST/AMC,18,ITA,EU,HGC,Yes,U21 Exempt,60,74,Right,186,83,11,12,13,12,11,6,5,8,11,12,6,11,10,8,14,10,10,12,2,2,2,2,11,11,12,11,generated,-
Zebrette,19,Sunday Lawal,-,AMR,AMC,29,NGA,Non-EU,Non-HG,No,Registered,60,60,Right,185,72,11,10,14,12,10,7,6,8,13,10,7,12,11,8,15,12,9,11,2,2,2,2,13,14,12,11,generated,-
Zebrette,18,Adrián Maidana,-,ST,AMR,26,URU,Non-EU,Non-HG,No,Registered,58,59,Right,190,89,12,8,13,12,6,7,3,10,9,10,6,11,15,6,15,10,12,13,2,2,2,2,11,14,11,11,generated,-
Zebrette,25,Stefano Bianco,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,59,74,Right,189,82,2,9,2,7,2,3,3,4,7,11,12,10,11,9,7,7,10,11,12,12,10,11,13,2,2,10,generated,-
Zebrette,31,Stefano Barone,-,MC,-,18,ITA,EU,Non-HG,Yes,U21 Exempt,60,70,Left,178,69,9,13,14,11,11,8,9,8,13,12,12,14,13,8,9,13,10,10,2,2,2,2,12,10,12,10,generated,-
Zebrette,32,Manuel Rizzo,-,ST,-,20,ITA,EU,Non-HG,Yes,U21 Exempt,61,73,Right,181,71,12,9,11,13,7,6,4,12,8,11,6,11,12,10,12,10,14,14,2,2,2,2,12,13,9,10,generated,-
```

### Lariani (Como 1907)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lariani,1,Elvis Hoxha,-,GK,-,26,ALB,Non-EU,Non-HG,No,Registered,63,64,Either,197,92,2,9,1,6,2,3,3,4,11,14,14,10,13,10,8,8,12,12,12,14,11,14,12,2,2,12,generated,-
Lariani,3,Mislav Stojanović,-,DL,-,29,SRB,Non-EU,Non-HG,No,Registered,64,64,Left,172,76,7,12,10,12,14,12,12,10,10,10,14,14,14,10,13,15,11,11,2,2,2,2,12,12,7,14,generated,-
Lariani,4,Simone Valentini,-,DC,-,28,ITA,EU,HGC,No,Registered,67,68,Left,193,84,6,10,9,9,5,14,13,14,9,13,14,14,12,9,13,11,13,13,2,2,2,2,15,8,6,13,generated,capped by band
Lariani,5,Michał Szewczyk,-,DC,DR,26,POL,EU,Non-HG,No,Registered,64,67,Right,193,87,2,13,9,10,4,13,13,15,10,12,12,11,11,11,12,13,14,11,2,2,2,2,15,6,8,13,generated,-
Lariani,2,Mislav Vuković,-,DR,MR/WBR,29,CRO,EU,Non-HG,No,Registered,66,66,Right,177,73,7,11,12,13,12,11,11,12,11,13,12,15,12,8,13,12,10,13,2,2,2,2,13,12,10,12,generated,-
Lariani,6,Edoardo Orlando,-,DM,DC,25,ITA,EU,HGC,No,Registered,66,68,Right,184,81,8,13,8,13,8,15,14,10,11,14,13,17,13,12,12,14,11,11,2,2,2,2,14,7,8,13,generated,-
Lariani,8,Salvatore Costa,-,MC,DM,30,ITA,EU,HGC,No,Registered,67,67,Left,177,70,9,13,13,16,10,10,10,9,15,14,12,15,13,9,10,13,13,13,2,2,2,2,14,11,11,16,generated,capped by band
Lariani,10,Vincenzo Farina,-,MC,DM,27,ITA,EU,HGC,No,Registered,64,67,Right,175,72,8,12,10,13,8,11,12,8,13,11,13,14,14,9,10,12,11,13,2,2,2,2,13,11,12,12,generated,-
Lariani,11,Kauã Lacerda,-,AML,-,22,BRA,Non-EU,Non-HG,No,Registered,66,70,Left,180,76,12,11,12,13,12,7,4,9,12,12,6,12,11,9,14,15,12,13,2,2,2,2,12,12,12,12,generated,-
Lariani,7,Nicolas Van Damme,-,AMR,ST,27,BEL,EU,Non-HG,No,Registered,65,66,Right,180,66,10,11,15,15,16,7,5,5,13,11,9,12,13,9,14,11,10,14,2,2,2,2,14,12,14,15,generated,-
Lariani,9,Mehdi Zniber,-,ST,-,30,MAR,Non-EU,Non-HG,No,Registered,66,66,Right,177,69,14,10,12,12,7,6,3,12,12,14,6,13,12,10,13,12,14,13,2,2,2,2,13,14,11,13,generated,-
Lariani,13,Dawid Zieliński,-,GK,-,22,POL,EU,Non-HG,No,Registered,58,60,Right,193,86,2,9,4,8,2,3,3,4,9,11,12,8,14,9,8,8,9,8,12,13,12,11,13,2,2,12,generated,-
Lariani,23,Ante Pavlović,-,DL,ML,29,CRO,EU,Non-HG,No,Registered,58,58,Left,178,76,6,9,12,10,12,12,10,12,11,10,13,12,12,10,11,13,11,12,2,2,2,2,10,8,10,11,generated,-
Lariani,15,Leonardo Orlando,-,DC,DM,22,ITA,EU,Non-HG,No,Registered,60,63,Right,194,81,5,10,8,10,5,14,13,13,11,14,12,13,11,10,11,10,14,13,2,2,2,2,14,5,4,13,generated,-
Lariani,24,Arbër Dedja,-,DC,-,27,ALB,Non-EU,Non-HG,No,Registered,61,64,Right,175,71,4,12,10,9,4,14,14,11,8,15,14,11,11,9,11,10,13,7,2,2,2,2,10,6,6,13,generated,-
Lariani,22,Giovanni Barone,-,DR,-,25,ITA,EU,HGC,No,Registered,59,61,Right,177,63,5,9,12,10,12,12,12,9,10,10,10,13,10,7,10,13,9,13,2,2,2,2,11,10,11,10,generated,-
Lariani,14,Mario Božić,-,DM,MC/DC,25,SVN,EU,Non-HG,No,Registered,58,59,Right,186,77,4,11,9,9,8,12,11,9,10,12,11,13,11,10,9,11,11,12,2,2,2,2,14,7,8,13,generated,-
Lariani,16,Lasse Larsen,-,MC,DM,24,DEN,EU,Non-HG,No,Registered,62,67,Right,178,77,9,13,14,12,8,7,12,7,15,12,11,14,10,9,10,12,11,11,2,2,2,2,12,9,8,13,generated,-
Lariani,17,Cheick Konaté,-,AMC,AML,29,SEN,Non-EU,Non-HG,No,Registered,63,63,Right,176,75,13,13,12,12,9,9,7,8,13,13,7,13,11,10,11,14,12,12,2,2,2,2,12,12,12,12,generated,-
Lariani,21,Filippo Bianco,-,AML,AMC,27,ITA,EU,HGC,No,Registered,64,66,Left,176,71,11,12,14,13,12,7,6,6,9,12,6,12,12,9,14,14,9,13,2,2,2,2,11,14,15,14,generated,-
Lariani,30,Leonardo Valentini,-,AMR,-,18,ITA,EU,HGC,Yes,U21 Exempt,60,69,Right,180,71,12,11,12,11,11,7,8,8,13,10,8,14,11,7,13,11,8,14,2,2,2,2,11,11,13,12,generated,-
Lariani,19,Mattia Zanetti,-,ST,-,26,ITA,EU,HGN,No,Registered,60,63,Right,189,85,11,11,12,11,8,4,5,10,9,11,7,12,12,9,13,10,13,10,2,2,2,2,11,12,12,12,generated,-
Lariani,25,Alessandro Gentile,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,59,69,Right,194,87,2,9,4,8,2,3,3,4,10,13,11,8,12,10,8,8,11,12,11,12,12,12,12,2,2,10,generated,-
Lariani,31,Pietro Farina,-,MC,-,17,ITA,EU,HGC,Yes,U21 Exempt,61,72,Left,173,69,11,14,12,14,9,10,10,8,13,11,9,11,10,10,13,14,9,11,2,2,2,2,15,11,10,13,generated,-
Lariani,32,Leonardo De Angelis,-,ST,AMC,17,ITA,EU,HGC,Yes,U21 Exempt,59,74,Right,180,73,12,11,10,13,7,5,5,11,7,10,4,11,10,8,13,13,11,10,2,2,2,2,11,11,10,12,generated,-
```

### Isolani (Cagliari Calcio)
**Reputation:** 66 | **CA Band:** 57–66 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Isolani,1,Lars Stevens,-,GK,-,33,BEL,EU,Non-HG,No,Registered,64,64,Right,188,85,2,10,1,8,2,3,3,4,10,13,10,10,13,10,6,7,11,13,13,14,12,12,11,2,2,13,generated,-
Isolani,3,Anders Dalsgaard,-,DL,-,33,DEN,EU,Non-HG,No,Registered,64,64,Left,182,74,7,12,12,13,12,12,11,11,11,11,10,14,13,9,14,13,12,12,2,2,2,2,13,10,9,11,generated,-
Isolani,4,Gabriele Orlando,-,DC,DR/DL,30,ITA,EU,HGC,No,Registered,65,65,Right,188,86,5,14,8,10,5,14,13,13,10,12,13,13,13,12,10,11,14,12,2,2,2,2,13,5,6,15,generated,-
Isolani,5,Carlos Salinas,-,DC,DM,31,COL,Non-EU,Non-HG,No,Registered,62,62,Right,194,87,4,11,10,10,5,12,11,14,7,12,13,12,12,10,12,14,14,9,2,2,2,2,14,6,6,13,generated,-
Isolani,2,Abdul Annan,-,DR,-,26,GHA,Non-EU,Non-HG,No,Registered,65,66,Left,184,81,7,11,13,12,11,13,12,11,10,12,15,13,11,10,14,13,12,12,2,2,2,2,14,12,10,15,generated,-
Isolani,6,Uche Lawal,-,DM,DC,26,NGA,Non-EU,Non-HG,No,Registered,64,67,Right,179,76,7,12,10,12,9,12,12,12,12,13,13,12,14,10,11,14,12,12,2,2,2,2,11,8,9,18,generated,-
Isolani,8,Mikkel Eriksen,-,MC,AMC/DM,23,DEN,EU,Non-HG,No,Registered,62,69,Right,177,69,11,11,11,12,9,12,9,10,14,14,12,13,12,7,11,13,11,13,2,2,2,2,13,11,12,11,generated,-
Isolani,10,Antonio Conti,-,MC,-,35,ITA,EU,HGC,No,Registered,65,65,Left,180,83,9,14,13,14,9,9,9,7,12,13,13,15,14,9,12,13,11,13,2,2,2,2,12,12,11,14,generated,-
Isolani,11,Karlo Lazić,-,AML,AMC,30,SRB,Non-EU,Non-HG,No,Registered,64,64,Left,175,67,10,11,13,14,12,6,5,7,12,13,6,12,13,8,13,12,10,13,2,2,2,2,12,14,14,10,generated,-
Isolani,7,Edoardo Zanetti,-,AMR,ST/AMC,30,ITA,EU,HGC,No,Registered,65,65,Right,185,81,9,12,16,11,13,6,4,8,13,11,8,11,12,9,13,12,10,13,2,2,2,2,12,12,12,13,generated,-
Isolani,9,Nicolò Fontana,-,ST,-,31,ITA,EU,Non-HG,No,Registered,64,64,Left,189,82,12,10,13,11,9,5,4,12,10,11,7,14,9,9,12,14,14,11,2,2,2,2,13,13,11,15,generated,-
Isolani,13,Damian Zieliński,-,GK,-,30,POL,EU,Non-HG,No,Registered,59,59,Right,196,92,2,7,4,9,2,3,3,4,8,10,11,8,10,10,9,7,11,12,11,14,12,11,11,2,2,12,generated,-
Isolani,23,Luka Kostić,-,DL,ML,28,BIH,Non-EU,Non-HG,No,Registered,59,59,Left,182,86,4,10,9,10,11,10,10,11,8,12,12,13,10,8,14,11,13,11,2,2,2,2,11,10,7,12,generated,-
Isolani,15,Roberto Ferrara,-,DC,-,23,ITA,EU,HGC,No,Registered,59,65,Right,192,93,6,10,8,11,6,11,13,13,9,12,14,12,11,8,11,10,11,10,2,2,2,2,11,5,6,12,generated,-
Isolani,24,Fernando Izquierdo,-,DC,-,24,ESP,EU,Non-HG,No,Registered,57,59,Right,191,86,4,11,6,9,6,13,13,10,10,10,13,10,10,11,11,10,14,9,2,2,2,2,12,6,3,11,generated,-
Isolani,22,Alexis Poirier,-,DR,-,27,FRA,EU,Non-HG,No,Registered,61,64,Right,180,75,7,11,12,11,12,11,13,10,11,12,12,15,11,10,13,12,9,12,2,2,2,2,11,10,10,13,generated,-
Isolani,14,Tin Horvat,-,DM,MC/DC,29,SVN,EU,Non-HG,No,Registered,64,64,Right,184,74,5,13,9,13,7,13,15,9,11,11,13,14,11,10,11,15,12,13,2,2,2,2,14,9,7,15,generated,-
Isolani,16,Diego Rossetti,-,MC,AMC,21,ITA,EU,Non-HG,Yes,U21 Exempt,61,71,Left,176,69,8,15,11,11,7,10,12,9,12,11,9,14,13,9,13,15,12,11,2,2,2,2,12,12,10,13,generated,-
Isolani,17,Bruno Barišić,-,AMC,AMR,27,SVN,EU,Non-HG,No,Registered,63,64,Left,178,72,12,13,11,12,11,7,9,8,12,14,10,13,13,10,10,12,11,12,2,2,2,2,11,12,11,15,generated,-
Isolani,21,Sora Hayashi,-,AML,-,28,JPN,Non-EU,Non-HG,No,Registered,57,58,Left,183,67,9,10,11,12,10,6,5,8,11,11,5,12,11,7,11,10,9,14,2,2,2,2,11,13,12,13,generated,-
Isolani,19,Manuel Caputo,-,AMR,AMC,26,ITA,EU,HGN,No,Registered,59,60,Left,182,80,11,10,12,13,8,7,5,7,10,8,6,11,11,10,11,11,9,11,2,2,2,2,11,10,11,10,generated,-
Isolani,30,Nicolò Gallo,-,ST,AMR/AML,19,ITA,EU,Non-HG,Yes,U21 Exempt,60,71,Either,177,65,13,9,10,12,6,5,5,14,9,12,5,11,12,9,13,10,11,10,2,2,2,2,14,12,9,11,generated,-
Isolani,25,Paolo Carbone,-,GK,-,17,ITA,EU,HGC,Yes,U21 Exempt,58,72,Right,195,96,2,9,2,7,2,3,3,4,8,10,11,10,11,10,6,7,10,10,12,11,12,13,10,2,2,9,generated,-
Isolani,31,Davide Rizzo,-,MC,DM,18,ITA,EU,HGC,Yes,U21 Exempt,60,73,Left,182,79,7,12,12,13,10,10,8,9,12,11,12,12,12,8,11,13,10,11,2,2,2,2,12,10,10,13,generated,-
Isolani,32,Samuele Villa,-,ST,AML,18,ITA,EU,HGC,Yes,U21 Exempt,58,68,Right,181,76,10,8,10,9,6,4,3,11,11,9,6,10,12,9,13,11,12,11,2,2,2,2,11,14,9,11,generated,-
```

### Neroverdi (US Sassuolo Calcio)
**Reputation:** 66 | **CA Band:** 57–66 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Neroverdi,1,Matteo Santoro,-,GK,-,29,ITA,EU,HGN,No,Registered,63,63,Either,196,85,2,9,5,9,2,3,3,4,7,11,12,8,13,7,8,8,10,10,14,13,12,12,14,2,2,12,generated,-
Neroverdi,3,Nemanja Vasić,-,DL,DC,30,SRB,Non-EU,Non-HG,No,Registered,65,65,Either,185,75,7,12,11,12,13,14,11,10,11,11,13,13,11,11,13,13,12,12,2,2,2,2,13,12,9,12,generated,-
Neroverdi,4,Corentin Perrot,-,DC,DR,22,FRA,EU,Non-HG,No,Registered,66,73,Right,194,92,4,12,9,8,4,12,14,12,7,13,15,13,13,10,10,10,14,13,2,2,2,2,15,6,5,14,generated,capped by band
Neroverdi,5,Lorenzo Amato,-,DC,-,27,ITA,EU,HGN,No,Registered,63,64,Right,183,74,5,11,8,10,5,12,13,13,9,14,12,11,12,10,12,13,13,9,2,2,2,2,13,6,4,12,generated,-
Neroverdi,2,Tin Božić,-,DR,-,25,CRO,EU,Non-HG,No,Registered,63,66,Left,177,74,8,10,12,13,12,11,12,11,12,11,13,12,12,12,16,15,10,11,2,2,2,2,13,11,9,14,generated,-
Neroverdi,6,Cláudio Pacheco,-,DM,-,25,POR,EU,Non-HG,No,Registered,65,66,Right,185,77,7,12,10,11,8,13,14,12,11,12,11,14,12,9,12,12,12,13,2,2,2,2,14,9,9,15,generated,-
Neroverdi,8,Lukas Sauer,-,MC,-,31,SUI,Non-EU,Non-HG,No,Registered,63,63,Either,184,80,7,14,11,12,9,11,10,8,14,13,12,15,11,9,12,11,11,12,2,2,2,2,11,10,11,13,generated,-
Neroverdi,10,Gianluca Piras,-,MC,-,27,ITA,EU,HGC,No,Registered,65,67,Right,182,76,11,13,13,14,8,9,9,9,13,12,12,14,13,10,13,14,11,10,2,2,2,2,13,11,10,15,generated,-
Neroverdi,11,Francesco Bellini,-,AML,AMC,21,ITA,EU,HGN,Yes,U21 Exempt,65,74,Right,179,76,12,11,15,14,11,8,4,8,12,10,6,12,11,9,13,13,10,13,2,2,2,2,12,13,15,13,generated,-
Neroverdi,7,Elliot Dawson,-,AMR,-,22,USA,Non-EU,Non-HG,No,Registered,63,68,Left,180,75,10,12,13,12,11,7,5,7,13,12,7,12,12,8,14,12,10,15,2,2,2,2,12,13,14,12,generated,-
Neroverdi,9,Vincenzo Moretti,-,ST,AMC,27,ITA,EU,HGC,No,Registered,65,65,Right,188,86,12,8,14,10,10,3,5,13,10,10,5,14,13,9,11,11,13,12,2,2,2,2,14,11,13,13,generated,-
Neroverdi,13,Gabriele Bianco,-,GK,-,24,ITA,EU,HGC,No,Registered,63,67,Right,192,82,2,11,5,12,2,3,3,4,8,14,12,9,14,9,6,7,11,13,14,14,13,12,13,2,2,11,generated,-
Neroverdi,23,Ola Adeyemi,-,DL,-,28,NGA,Non-EU,Non-HG,No,Registered,59,62,Left,181,84,6,9,9,11,11,11,9,9,11,11,10,12,12,7,14,13,11,12,2,2,2,2,11,11,9,13,generated,-
Neroverdi,30,Giovanni Mancini,-,DC,-,18,ITA,EU,HGC,Yes,U21 Exempt,59,72,Left,192,85,4,10,7,12,7,13,13,12,9,12,13,11,10,10,11,10,12,8,2,2,2,2,12,8,4,11,generated,-
Neroverdi,15,Karlo Petković,-,DC,DL,32,SRB,Non-EU,Non-HG,No,Registered,57,57,Right,192,89,3,8,7,9,7,13,12,14,7,10,13,10,12,9,10,10,15,10,2,2,2,2,11,7,5,12,generated,-
Neroverdi,22,Kasper Hansen,-,DR,-,26,DEN,EU,Non-HG,No,Registered,58,60,Left,194,93,5,10,10,10,11,11,12,10,8,9,10,12,10,6,12,13,11,11,2,2,2,2,11,9,8,12,generated,-
Neroverdi,14,Sam Sharpe,-,DM,-,26,ENG,Non-EU,Non-HG,No,Registered,58,59,Right,181,80,7,10,8,9,9,11,12,10,11,13,11,13,11,10,9,12,12,10,2,2,2,2,11,8,7,14,generated,-
Neroverdi,16,Roberto Marino,-,MC,DM,24,ITA,EU,HGN,No,Registered,57,60,Left,181,78,7,12,9,10,9,10,9,8,11,9,12,13,9,8,11,10,11,10,2,2,2,2,10,12,10,10,generated,-
Neroverdi,17,Antonio Valentini,-,AMC,-,24,ITA,EU,HGC,No,Registered,58,65,Right,181,81,12,13,11,14,8,8,6,7,12,12,9,12,11,7,10,11,8,10,2,2,2,2,10,13,11,12,generated,-
Neroverdi,21,Mateusz Kratochvíl,-,AML,ST,27,CZE,EU,Non-HG,No,Registered,58,61,Left,183,80,10,11,12,10,11,7,6,8,9,13,7,11,8,9,11,10,10,12,2,2,2,2,11,12,13,11,generated,-
Neroverdi,19,Mislav Babić,-,AMR,AMC/MR,24,CRO,EU,Non-HG,No,Registered,57,62,Right,177,68,10,12,11,13,14,5,7,5,9,12,5,11,9,7,13,11,10,13,2,2,2,2,11,13,12,10,generated,-
Neroverdi,18,Łukasz Baran,-,ST,-,27,POL,EU,Non-HG,No,Registered,60,63,Right,181,84,13,9,8,10,8,4,6,12,9,11,7,13,11,9,14,12,12,13,2,2,2,2,13,11,11,14,generated,-
Neroverdi,25,Samuele Greco,-,GK,-,19,ITA,EU,HGN,Yes,U21 Exempt,59,75,Left,196,90,2,10,3,9,2,3,3,4,9,11,12,9,10,8,8,8,11,13,13,13,11,11,12,2,2,11,generated,-
Neroverdi,31,Lorenzo Zanetti,-,MC,-,19,ITA,EU,HGC,Yes,U21 Exempt,58,69,Right,177,69,8,12,10,13,8,11,10,6,12,12,10,12,11,9,10,12,11,10,2,2,2,2,11,10,9,12,generated,-
Neroverdi,32,Emanuele Bruni,-,ST,AMR,17,ITA,EU,HGN,Yes,U21 Exempt,57,66,Right,173,67,13,10,12,11,5,5,3,12,8,11,5,11,13,9,10,10,11,10,2,2,2,2,11,14,12,11,generated,-
```

### Crociati (Parma Calcio 1913)
**Reputation:** 65 | **CA Band:** 56–65 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Crociati,1,Szymon Adamski,-,GK,-,30,POL,EU,Non-HG,No,Registered,64,64,Right,187,83,2,11,5,8,2,3,3,4,7,11,13,10,11,11,5,10,11,12,14,13,12,12,12,2,2,11,generated,-
Crociati,3,Gianluca Gentile,-,DL,-,31,ITA,EU,HGC,No,Registered,60,60,Right,180,71,8,12,9,10,12,13,12,10,11,11,12,12,10,9,12,11,11,11,2,2,2,2,11,10,7,11,generated,-
Crociati,4,Mahamadou Gueye,-,DC,-,23,SEN,Non-EU,Non-HG,No,Registered,63,68,Right,183,76,4,11,9,9,7,14,14,12,10,12,11,11,13,9,12,10,15,9,2,2,2,2,13,6,6,13,generated,-
Crociati,5,Renato Quaresma,-,DC,-,27,POR,EU,Non-HG,No,Registered,65,65,Right,190,90,5,11,10,10,8,15,14,14,9,13,16,13,13,11,8,12,13,12,2,2,2,2,13,6,7,13,generated,capped by band
Crociati,2,Francesco Testa,-,DR,-,28,ITA,EU,HGN,No,Registered,65,67,Right,179,75,8,12,13,11,11,14,11,9,9,14,13,15,10,10,13,14,12,15,2,2,2,2,12,13,8,13,generated,capped by band
Crociati,6,João Pacheco,-,DM,DC,24,BRA,Non-EU,Non-HG,No,Registered,64,66,Right,178,70,7,14,12,12,9,13,12,11,11,13,15,12,11,13,11,15,12,11,2,2,2,2,13,8,7,17,generated,-
Crociati,8,Giovanni Valentini,-,MC,-,30,ITA,EU,HGN,No,Registered,63,63,Right,177,74,10,14,12,13,10,11,9,9,14,12,12,12,12,8,13,14,11,11,2,2,2,2,14,11,10,13,generated,-
Crociati,10,Przemysław Hájek,-,MC,-,29,CZE,EU,Non-HG,No,Registered,65,65,Right,179,72,9,13,12,16,11,11,11,8,12,14,10,14,12,9,11,13,10,11,2,2,2,2,16,11,10,13,generated,capped by band
Crociati,11,Amine El Fassi,-,AML,-,31,MAR,Non-EU,Non-HG,No,Registered,64,64,Left,184,80,12,12,14,14,12,5,5,9,10,13,7,11,11,10,15,13,9,14,2,2,2,2,12,13,13,13,generated,-
Crociati,7,Nicola Marino,-,AMR,-,30,ITA,EU,HGC,No,Registered,63,63,Right,179,77,13,11,11,13,11,6,5,7,13,12,7,12,13,8,14,10,11,14,2,2,2,2,11,14,13,13,generated,-
Crociati,9,Nana Agyeman,-,ST,AMC,34,GHA,Non-EU,Non-HG,No,Registered,65,65,Either,180,78,12,8,11,14,7,5,3,12,11,13,6,13,13,9,14,13,11,14,2,2,2,2,12,14,11,14,generated,capped by band
Crociati,13,Yannick Jäger,-,GK,-,27,SUI,Non-EU,Non-HG,No,Registered,57,58,Right,189,82,2,9,3,8,2,3,3,4,9,11,13,7,11,10,9,8,11,11,11,11,12,8,11,2,2,10,generated,-
Crociati,23,Samuele Barone,-,DL,-,21,ITA,EU,HGC,Yes,U21 Exempt,57,68,Left,179,75,5,9,10,9,11,11,12,9,8,11,12,14,10,7,11,11,12,11,2,2,2,2,13,11,9,12,generated,-
Crociati,15,Paweł Adamski,-,DC,DL,28,POL,EU,Non-HG,No,Registered,60,60,Right,188,81,5,10,9,11,6,13,13,12,10,12,12,13,11,8,10,11,14,10,2,2,2,2,14,4,5,14,generated,-
Crociati,24,Diego De Angelis,-,DC,DM,34,ITA,EU,HGN,No,Registered,57,57,Either,181,76,4,11,8,10,7,12,12,12,8,12,11,12,12,10,11,8,11,11,2,2,2,2,12,6,5,14,generated,-
Crociati,22,Javier Arjona,-,DR,-,34,ESP,EU,Non-HG,No,Registered,56,56,Right,184,77,7,9,9,11,12,12,10,10,8,10,13,12,8,9,13,12,10,10,2,2,2,2,9,11,10,11,generated,-
Crociati,14,Daan Schouten,-,DM,-,23,NED,EU,Non-HG,No,Registered,58,60,Left,186,82,9,11,8,10,8,10,12,7,11,12,12,12,11,10,11,11,10,10,2,2,2,2,11,8,7,13,generated,-
Crociati,16,Valerio Caputo,-,MC,AMC,28,ITA,EU,HGC,No,Registered,59,62,Either,179,69,9,14,11,12,7,10,8,9,10,11,10,12,13,10,12,11,12,11,2,2,2,2,10,11,11,12,generated,-
Crociati,17,Ionuț Neagu,-,AMC,-,27,ROU,EU,Non-HG,No,Registered,63,63,Right,182,77,12,11,12,13,9,9,7,7,14,12,9,15,13,11,12,11,10,14,2,2,2,2,12,13,13,10,generated,-
Crociati,21,Emanuele Testa,-,AML,-,31,ITA,EU,HGC,No,Registered,58,58,Left,185,79,10,11,10,12,9,6,5,8,11,11,6,11,10,8,14,11,9,10,2,2,2,2,10,9,12,9,generated,-
Crociati,19,Nico Maidana,-,AMR,-,27,ARG,Non-EU,Non-HG,No,Registered,57,59,Right,180,80,9,10,12,12,11,6,6,6,9,11,7,11,10,7,13,10,8,14,2,2,2,2,9,9,13,12,generated,-
Crociati,30,Roberto Monti,-,ST,-,20,ITA,EU,HGC,Yes,U21 Exempt,58,65,Right,186,87,12,9,11,11,7,9,4,12,10,10,7,11,10,8,12,11,10,11,2,2,2,2,14,12,9,12,generated,-
Crociati,25,Luca Gallo,-,GK,-,21,ITA,EU,HGC,Yes,U21 Exempt,57,68,Right,192,89,2,8,3,8,2,3,3,4,9,9,13,7,10,9,7,7,10,11,14,11,10,12,12,2,2,12,generated,-
Crociati,31,Edoardo Conti,-,MC,DM,20,ITA,EU,HGC,Yes,U21 Exempt,56,67,Right,174,69,9,11,12,13,7,10,11,8,12,10,8,12,11,7,11,12,8,10,2,2,2,2,12,10,10,11,generated,-
Crociati,32,Gabriele Pellegrini,-,ST,-,19,ITA,EU,HGN,Yes,U21 Exempt,59,73,Left,182,77,12,9,10,12,6,7,6,13,8,11,6,12,12,9,10,12,12,12,2,2,2,2,12,12,9,12,generated,-
```

### Salentini (US Lecce)
**Reputation:** 64 | **CA Band:** 56–65 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Salentini,1,Dario Bilić,-,GK,-,35,CRO,EU,Non-HG,No,Registered,64,64,Right,189,86,2,10,2,8,2,3,3,4,8,14,13,10,12,9,7,9,10,10,13,13,14,12,13,2,2,14,generated,-
Salentini,3,Miloš Vasić,-,DL,DC,27,BIH,Non-EU,Non-HG,No,Registered,64,65,Left,184,81,7,13,11,10,12,14,15,11,12,11,13,14,11,8,12,12,11,13,2,2,2,2,12,10,9,14,generated,-
Salentini,4,Leonardo Conti,-,DC,DL/DR,30,ITA,EU,HGN,No,Registered,65,65,Left,184,82,5,13,9,11,7,13,14,13,10,10,14,13,12,10,11,13,12,10,2,2,2,2,14,7,7,12,generated,capped by band
Salentini,5,Lorik Gashi,-,DC,-,23,ALB,Non-EU,Non-HG,No,Registered,65,67,Right,192,90,3,12,6,10,5,15,13,14,10,12,13,15,13,10,12,12,14,10,2,2,2,2,14,7,6,14,generated,capped by band
Salentini,2,Issa Sagna,-,DR,DC/MR,29,SEN,Non-EU,Non-HG,No,Registered,63,63,Right,177,71,6,11,13,13,12,13,13,9,10,10,12,12,11,10,13,13,10,12,2,2,2,2,13,10,8,12,generated,-
Salentini,6,Noah Brandt,-,DM,DC/MC,30,GER,EU,Non-HG,No,Registered,63,63,Left,179,74,9,10,12,11,6,13,12,9,13,12,11,14,13,9,10,12,11,11,2,2,2,2,14,9,7,13,generated,-
Salentini,8,Mislav Petrović,-,MC,-,31,CRO,EU,Non-HG,No,Registered,63,63,Right,176,71,7,13,11,13,10,12,9,10,12,14,11,15,10,10,13,14,10,12,2,2,2,2,12,12,10,14,generated,-
Salentini,10,Valerio Monti,-,MC,-,30,ITA,EU,HGC,No,Registered,65,65,Either,182,84,10,16,13,12,9,10,11,7,14,13,9,13,14,11,12,12,10,13,2,2,2,2,14,13,11,15,generated,capped by band
Salentini,11,Pietro Ferrara,-,AML,-,22,ITA,EU,HGN,No,Registered,65,68,Left,177,71,11,13,13,14,11,5,5,9,11,14,6,13,12,9,12,13,11,13,2,2,2,2,13,12,15,11,generated,capped by band
Salentini,7,Diego Valentini,-,AMR,-,29,ITA,EU,HGC,No,Registered,63,63,Right,181,80,12,11,12,13,13,5,5,8,13,13,7,13,13,9,11,13,11,15,2,2,2,2,13,13,15,12,generated,-
Salentini,9,Víctor Ibarra,-,ST,AMC,21,URU,Non-EU,Non-HG,Yes,U21 Exempt,62,68,Right,191,96,13,10,10,11,7,4,3,12,9,11,4,13,11,10,12,12,14,13,2,2,2,2,13,12,12,13,generated,-
Salentini,13,Willian Pimentel,-,GK,-,22,BRA,Non-EU,Non-HG,No,Registered,59,61,Right,192,91,2,9,3,10,2,3,3,4,8,10,12,6,12,9,8,8,11,13,11,11,12,12,13,2,2,10,generated,-
Salentini,23,Diego Cattaneo,-,DL,-,21,ITA,EU,HGC,Yes,U21 Exempt,57,69,Left,184,87,6,11,12,10,12,10,11,10,8,12,10,12,8,9,12,11,10,10,2,2,2,2,12,9,8,14,generated,-
Salentini,15,Manuel Bruni,-,DC,DM/DR,29,ITA,EU,HGC,No,Registered,59,59,Left,190,88,4,9,8,8,7,13,11,9,7,10,14,10,11,8,12,10,12,10,2,2,2,2,10,5,5,13,generated,-
Salentini,24,Dario Zdravković,-,DC,-,26,SRB,Non-EU,Non-HG,No,Registered,62,63,Right,196,89,6,10,8,12,6,15,13,11,7,11,14,13,13,10,11,12,12,11,2,2,2,2,12,6,5,14,generated,-
Salentini,22,Pietro Santoro,-,DR,WBR,29,ITA,EU,HGC,No,Registered,61,61,Left,176,73,7,13,9,12,11,12,11,10,8,11,11,10,11,9,11,13,10,12,2,2,2,2,12,12,9,12,generated,-
Salentini,30,Alessandro De Angelis,-,DM,MC,17,ITA,EU,HGC,Yes,U21 Exempt,57,66,Right,182,75,6,11,8,14,7,12,10,10,10,13,14,10,10,9,12,15,11,10,2,2,2,2,13,9,7,12,generated,-
Salentini,14,Leon Stein,-,MC,-,24,GER,EU,Non-HG,No,Registered,60,66,Right,181,76,8,12,10,14,8,11,9,9,13,11,11,12,12,9,10,11,13,13,2,2,2,2,12,12,10,14,generated,-
Salentini,17,Jérémy Carpentier,-,AMC,-,27,FRA,EU,Non-HG,No,Registered,56,59,Right,183,85,10,11,12,11,11,9,6,8,10,10,8,11,12,8,11,13,10,12,2,2,2,2,12,14,10,10,generated,-
Salentini,21,Lorenzo Testa,-,AML,-,29,ITA,EU,Non-HG,No,Registered,62,62,Left,177,70,11,12,14,13,10,5,4,7,12,10,10,11,10,7,13,10,10,13,2,2,2,2,11,13,13,11,generated,-
Salentini,19,Ivan Barišić,-,AMR,-,25,CRO,EU,Non-HG,No,Registered,56,58,Left,183,72,10,11,12,10,11,6,6,6,12,8,6,11,11,8,10,9,11,11,2,2,2,2,13,10,14,12,generated,-
Salentini,18,Mattia Farina,-,ST,-,34,ITA,EU,HGC,No,Registered,58,58,Right,183,78,12,10,12,11,7,4,4,12,8,10,5,13,13,7,10,10,12,12,2,2,2,2,12,13,10,9,generated,-
Salentini,25,Marco Valentini,-,GK,-,18,ITA,EU,Non-HG,Yes,U21 Exempt,57,73,Right,190,90,2,10,5,9,2,3,3,4,8,12,12,6,11,8,7,7,9,10,11,11,11,11,12,2,2,10,generated,-
Salentini,31,Emanuele Santoro,-,MC,-,19,ITA,EU,HGC,Yes,U21 Exempt,59,72,Right,184,84,9,12,11,14,7,11,8,9,11,12,12,12,12,9,9,13,9,11,2,2,2,2,13,12,11,13,generated,-
Salentini,32,Lorenzo Marino,-,ST,-,18,ITA,EU,HGC,Yes,U21 Exempt,57,71,Right,181,79,12,8,11,12,9,6,4,10,8,8,4,12,11,8,12,11,11,11,2,2,2,2,13,12,11,11,generated,-
```

### Brianzoli (AC Monza)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Brianzoli,1,Benjamin Sauvage,-,GK,-,29,FRA,EU,Non-HG,No,Registered,61,61,Left,194,94,2,10,4,9,2,3,3,4,9,12,13,7,12,8,7,8,11,14,13,12,14,11,13,2,2,12,generated,-
Brianzoli,3,Alexandros Karagiannis,-,DL,DC,30,GRE,EU,Non-HG,No,Registered,63,63,Left,185,73,7,11,14,12,11,13,12,12,10,11,12,13,12,9,11,15,11,10,2,2,2,2,12,12,9,14,generated,capped by band
Brianzoli,4,Tommaso Messina,-,DC,DR/DM,26,ITA,EU,HGN,No,Registered,61,63,Right,181,80,5,10,8,9,5,13,11,12,9,12,10,13,13,10,12,12,13,9,2,2,2,2,12,7,5,13,generated,-
Brianzoli,5,Matteo Valentini,-,DC,-,27,ITA,EU,HGC,No,Registered,62,64,Left,186,82,7,10,7,11,7,14,13,13,10,12,15,12,12,11,10,11,12,10,2,2,2,2,12,4,5,12,generated,-
Brianzoli,2,Valerio Testa,-,DR,DC,33,ITA,EU,HGC,No,Registered,61,61,Left,186,90,7,13,13,13,12,13,12,8,11,12,11,14,10,9,11,13,12,10,2,2,2,2,10,9,8,11,generated,-
Brianzoli,6,Riccardo Zanetti,-,DM,MC/DC,26,ITA,EU,HGN,No,Registered,63,63,Right,180,71,7,12,13,13,8,15,12,10,11,12,13,16,12,11,12,17,13,10,2,2,2,2,15,8,8,13,generated,capped by band
Brianzoli,8,Seidu Annan,-,MC,-,21,GHA,Non-EU,Non-HG,Yes,U21 Exempt,63,69,Right,187,84,7,14,13,10,8,11,10,9,16,13,9,14,14,10,11,12,10,13,2,2,2,2,14,8,10,14,generated,capped by band
Brianzoli,10,Linus Olsson,-,MC,-,31,SWE,EU,Non-HG,No,Registered,62,62,Right,178,70,10,15,11,12,7,10,9,8,14,14,10,14,12,9,11,14,10,10,2,2,2,2,12,10,11,14,generated,-
Brianzoli,11,Leon Kessler,-,AML,-,31,SUI,Non-EU,Non-HG,No,Registered,61,61,Left,181,74,12,11,12,14,12,6,5,8,13,11,6,13,11,9,14,10,10,13,2,2,2,2,12,10,11,11,generated,-
Brianzoli,7,Leandro Giménez,-,AMR,MR,25,ARG,Non-EU,Non-HG,No,Registered,62,64,Right,176,65,13,9,13,11,11,4,7,6,11,11,7,13,12,7,12,13,10,13,2,2,2,2,11,13,13,10,generated,-
Brianzoli,9,Noah Vogel,-,ST,AMC,24,SUI,Non-EU,Non-HG,No,Registered,58,61,Right,187,85,11,10,10,11,6,6,5,12,9,10,6,13,12,8,11,14,11,10,2,2,2,2,9,12,12,11,generated,-
Brianzoli,13,Francesco Villa,-,GK,-,26,ITA,EU,HGC,No,Registered,54,57,Right,182,77,2,7,4,8,2,3,3,4,7,10,11,9,11,9,7,9,11,10,13,12,10,10,10,2,2,9,generated,-
Brianzoli,23,Marco Bellini,-,DL,-,21,ITA,EU,HGC,Yes,U21 Exempt,54,61,Left,189,87,4,9,9,10,10,11,12,8,9,12,9,13,10,9,11,12,8,11,2,2,2,2,10,10,8,13,generated,-
Brianzoli,15,Alessandro Marino,-,DC,DR/DM,19,ITA,EU,HGN,Yes,U21 Exempt,59,72,Left,187,78,3,10,8,9,3,13,13,12,9,11,12,12,9,12,13,12,12,10,2,2,2,2,13,6,6,12,generated,-
Brianzoli,30,Valerio Moretti,-,DC,DM,20,ITA,EU,Non-HG,Yes,U21 Exempt,56,66,Either,185,77,5,11,8,12,6,14,13,13,8,10,11,12,11,9,13,12,14,10,2,2,2,2,13,3,3,14,generated,-
Brianzoli,22,Daniel Moreira,-,DR,-,29,BRA,Non-EU,Non-HG,No,Registered,56,56,Right,182,73,5,12,11,12,12,12,11,9,7,11,10,13,12,8,11,12,9,10,2,2,2,2,11,10,10,11,generated,-
Brianzoli,14,Gianluca Conti,-,DM,-,27,ITA,EU,HGN,No,Registered,56,58,Right,183,76,6,11,7,11,7,15,12,10,7,10,10,11,11,10,10,12,13,9,2,2,2,2,12,10,9,13,generated,-
Brianzoli,16,Vincenzo Colombo,-,MC,-,30,ITA,EU,HGN,No,Registered,57,57,Left,180,77,7,13,11,12,7,10,9,7,10,11,12,12,12,9,11,11,10,11,2,2,2,2,13,12,10,15,generated,-
Brianzoli,17,Szymon Kratochvíl,-,AMC,AML,29,CZE,EU,Non-HG,No,Registered,57,57,Left,181,80,9,11,13,10,8,7,7,8,11,13,8,10,11,9,11,11,10,12,2,2,2,2,10,12,9,13,generated,-
Brianzoli,21,Guillermo Navarro,-,AML,ML,26,ARG,Non-EU,Non-HG,No,Registered,60,60,Left,180,74,10,12,14,10,10,5,4,8,12,11,7,11,12,8,11,12,11,13,2,2,2,2,12,12,9,11,generated,-
Brianzoli,19,Toni Perić,-,AMR,AMC,28,SVN,EU,Non-HG,No,Registered,59,60,Right,184,78,9,10,13,13,11,6,4,8,11,7,5,12,11,6,15,10,8,14,2,2,2,2,11,11,12,13,generated,-
Brianzoli,18,Marius Florea,-,ST,AML,22,ROU,EU,Non-HG,No,Registered,60,63,Right,178,68,11,11,12,11,8,7,3,12,10,10,8,14,12,10,12,11,12,12,2,2,2,2,11,15,9,10,generated,-
Brianzoli,25,Roberto Bruni,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,54,63,Right,183,78,2,9,2,7,2,3,3,4,7,10,9,7,11,8,8,9,10,9,13,10,11,10,11,2,2,10,generated,-
Brianzoli,31,Gianluca Fontana,-,MC,DM,18,ITA,EU,Non-HG,Yes,U21 Exempt,54,69,Left,179,86,9,11,12,10,10,8,9,7,13,12,10,11,11,9,9,10,9,9,2,2,2,2,9,9,9,12,generated,-
Brianzoli,32,Salvatore Fabbri,-,ST,-,17,ITA,EU,HGC,Yes,U21 Exempt,56,68,Right,184,77,14,9,11,11,8,6,3,12,10,10,5,11,11,10,9,12,12,11,2,2,2,2,9,12,10,11,generated,-
```

### Lagunari (Venezia FC)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Lagunari,1,Luka Vidović,-,GK,-,29,SVN,EU,Non-HG,No,Registered,59,59,Right,191,91,2,9,3,8,2,3,3,4,10,13,13,8,14,9,9,8,9,11,11,12,11,12,11,2,2,10,generated,-
Lagunari,3,Jesús Marín,-,DL,ML,34,ESP,EU,Non-HG,No,Registered,61,61,Left,180,76,6,13,11,12,10,10,11,8,10,10,11,14,13,8,12,11,13,12,2,2,2,2,13,10,9,10,generated,-
Lagunari,4,Nikola Radovanović,-,DC,DR/DM,30,SRB,Non-EU,Non-HG,No,Registered,59,59,Right,192,86,3,11,8,11,4,13,13,11,9,14,13,12,11,10,13,10,12,11,2,2,2,2,14,6,4,13,generated,-
Lagunari,5,Unai Tapia,-,DC,DR,27,ESP,EU,Non-HG,No,Registered,61,61,Left,193,85,6,10,9,11,3,13,12,10,9,12,13,14,11,11,13,11,12,10,2,2,2,2,13,6,6,12,generated,-
Lagunari,2,Valentin Keller,-,DR,MR/WBR,28,GER,EU,Non-HG,No,Registered,62,63,Right,179,71,7,13,11,12,10,14,13,9,9,12,13,14,10,11,13,14,11,12,2,2,2,2,13,9,8,15,generated,capped by band
Lagunari,6,Samuele Fabbri,-,DM,DC,27,ITA,EU,HGC,No,Registered,59,60,Left,182,76,7,11,10,11,8,12,11,12,10,11,8,16,10,9,11,11,10,11,2,2,2,2,11,10,9,14,generated,-
Lagunari,8,Giorgio Costa,-,MC,-,27,ITA,EU,HGC,No,Registered,62,65,Right,180,73,10,14,12,12,8,8,11,8,15,12,13,14,13,8,10,12,10,12,2,2,2,2,13,10,12,14,generated,capped by band
Lagunari,10,Matteo Moretti,-,MC,DM,27,ITA,EU,HGN,No,Registered,61,62,Right,187,85,8,13,12,12,9,11,10,10,14,10,11,14,12,9,13,13,12,12,2,2,2,2,13,10,11,13,generated,-
Lagunari,11,Karim Tazi,-,AML,-,29,MAR,Non-EU,Non-HG,No,Registered,62,62,Left,189,88,11,13,14,13,13,5,6,7,11,12,6,13,11,7,14,12,12,14,2,2,2,2,12,12,15,10,generated,capped by band
Lagunari,7,Ryan Fisher,-,AMR,-,31,USA,Non-EU,Non-HG,No,Registered,61,61,Right,181,80,9,9,12,11,11,6,3,7,11,10,5,11,11,7,12,11,11,12,2,2,2,2,10,10,12,13,generated,-
Lagunari,9,Bruno Simić,-,ST,-,27,MKD,Non-EU,Non-HG,No,Registered,59,59,Right,187,87,12,10,11,13,8,5,5,13,10,9,4,12,11,10,11,12,11,9,2,2,2,2,11,12,11,12,generated,-
Lagunari,13,Vincenzo Zanetti,-,GK,-,29,ITA,EU,HGC,No,Registered,56,56,Left,190,87,2,9,2,7,2,3,3,4,8,11,11,7,14,9,7,7,10,10,12,12,13,13,12,2,2,11,generated,-
Lagunari,23,Robbe Hermans,-,DL,-,21,BEL,EU,Non-HG,Yes,U21 Exempt,53,64,Left,183,73,5,9,11,10,7,12,11,10,7,9,10,12,8,10,11,8,10,11,2,2,2,2,9,9,9,10,generated,-
Lagunari,15,Martín Vera,-,DC,-,32,ARG,Non-EU,Non-HG,No,Registered,58,58,Right,180,70,2,10,7,11,5,13,12,13,8,10,13,11,11,11,11,13,11,9,2,2,2,2,11,4,5,13,generated,-
Lagunari,24,Gabriele Sala,-,DC,DM/DL,31,ITA,EU,HGN,No,Registered,57,57,Either,191,91,3,10,6,8,7,12,11,12,8,13,12,12,12,9,11,12,10,9,2,2,2,2,13,5,4,12,generated,-
Lagunari,22,Ante Kovačić,-,DR,-,31,CRO,EU,Non-HG,No,Registered,54,54,Left,186,85,6,10,12,9,11,12,11,10,9,10,10,14,9,9,12,11,10,9,2,2,2,2,9,11,8,10,generated,-
Lagunari,14,Mattia Amato,-,DM,-,25,ITA,EU,HGN,No,Registered,58,58,Right,183,79,6,11,10,13,6,10,10,9,12,11,11,13,11,10,8,13,11,10,2,2,2,2,12,9,10,13,generated,-
Lagunari,16,Gentian Dervishi,-,MC,-,34,ALB,Non-EU,Non-HG,No,Registered,54,54,Left,177,67,7,10,12,11,8,11,8,6,11,12,10,10,12,7,10,10,9,10,2,2,2,2,10,10,9,10,generated,-
Lagunari,17,Leandro Negrete,-,AMC,-,23,ESP,EU,Non-HG,No,Registered,54,56,Right,178,77,11,11,11,11,10,9,9,8,10,12,10,12,10,9,10,12,9,11,2,2,2,2,11,11,9,12,generated,-
Lagunari,21,Stefano Monti,-,AML,ST,25,ITA,EU,HGN,No,Registered,53,56,Left,181,80,10,11,12,10,8,4,5,8,10,10,7,12,8,6,10,10,9,12,2,2,2,2,10,11,11,8,generated,-
Lagunari,19,Salvatore Bruni,-,AMR,ST,27,ITA,EU,HGC,No,Registered,54,57,Right,168,69,11,11,12,12,10,7,6,6,10,11,4,11,9,8,14,10,9,13,2,2,2,2,9,6,11,10,generated,-
Lagunari,30,Manuel Zanetti,-,ST,-,20,ITA,EU,HGC,Yes,U21 Exempt,56,64,Right,194,93,11,12,11,12,4,6,5,10,9,10,7,11,9,8,12,11,14,9,2,2,2,2,9,12,10,9,generated,-
Lagunari,25,Leonardo Mancini,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,53,63,Left,188,90,2,10,2,6,2,3,3,4,8,10,11,6,11,7,7,7,10,10,11,10,12,11,11,2,2,10,generated,-
Lagunari,31,Simone Greco,-,MC,AMC/DM,21,ITA,EU,HGC,Yes,U21 Exempt,56,67,Right,184,83,8,12,11,12,9,10,9,9,11,12,11,14,10,11,11,12,9,11,2,2,2,2,10,14,9,13,generated,-
Lagunari,32,Alessandro Conti,-,ST,-,19,ITA,EU,Non-HG,Yes,U21 Exempt,54,65,Right,181,81,12,8,11,11,6,5,4,12,8,8,6,9,8,9,11,13,12,12,2,2,2,2,12,13,11,11,generated,-
```

### Canarini (Frosinone Calcio)
**Reputation:** 58 | **CA Band:** 52–61 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Canarini,1,Tin Pavlović,-,GK,-,32,CRO,EU,Non-HG,No,Registered,59,59,Right,195,94,2,11,3,7,2,3,3,4,8,11,13,7,12,11,6,9,10,12,12,12,12,12,11,2,2,10,generated,-
Canarini,3,Manuel Gentile,-,DL,-,25,ITA,EU,HGN,No,Registered,60,63,Right,187,80,7,10,12,10,11,14,12,9,9,10,10,14,10,10,12,13,11,10,2,2,2,2,13,9,8,12,generated,-
Canarini,4,Unai Bustamante,-,DC,DL,29,COL,Non-EU,Non-HG,No,Registered,59,59,Right,186,87,4,10,11,11,7,12,13,13,8,13,12,12,12,11,10,9,12,9,2,2,2,2,13,6,6,13,generated,-
Canarini,5,Ramon Obi,-,DC,DL,29,NGA,Non-EU,Non-HG,No,Registered,61,61,Left,184,77,6,10,8,11,5,14,13,13,8,12,12,12,12,8,11,13,12,11,2,2,2,2,11,6,6,12,generated,capped by band
Canarini,2,Giovanni Moretti,-,DR,MR,31,ITA,EU,HGC,No,Registered,60,60,Right,182,74,9,10,11,11,10,11,12,9,10,11,13,12,12,8,13,14,13,10,2,2,2,2,8,11,9,13,generated,-
Canarini,6,Shota Shimizu,-,DM,DC,31,JPN,Non-EU,Non-HG,No,Registered,60,60,Left,191,82,7,13,9,13,6,11,11,10,8,11,13,12,12,9,10,12,11,10,2,2,2,2,14,8,8,12,generated,-
Canarini,8,Edoardo De Angelis,-,MC,AMC/DM,30,ITA,EU,HGC,No,Registered,61,61,Right,171,70,7,13,12,13,8,11,11,7,15,13,11,14,13,8,10,13,11,13,2,2,2,2,13,10,12,13,generated,capped by band
Canarini,10,Renan Farias,-,MC,DM,25,BRA,Non-EU,Non-HG,No,Registered,56,57,Right,187,86,8,10,10,11,7,9,9,8,10,11,12,14,10,10,11,11,11,10,2,2,2,2,12,8,11,13,generated,-
Canarini,11,Emanuele Bianco,-,AML,-,31,ITA,EU,HGN,No,Registered,57,57,Left,179,76,9,8,12,10,10,7,2,6,10,11,6,11,10,9,13,12,11,13,2,2,2,2,12,12,12,11,generated,-
Canarini,7,Nicola Ferrara,-,AMR,-,28,ITA,EU,Non-HG,No,Registered,58,59,Right,179,71,12,11,14,10,10,7,5,6,11,11,4,10,10,7,12,9,9,11,2,2,2,2,11,12,12,11,generated,-
Canarini,9,Rafael Antunes,-,ST,AML,28,POR,EU,Non-HG,No,Registered,61,63,Right,182,81,12,10,12,11,6,6,3,12,10,12,4,12,11,10,12,11,13,14,2,2,2,2,13,11,11,11,generated,capped by band
Canarini,13,Matej Petković,-,GK,-,22,BIH,Non-EU,Non-HG,No,Registered,53,59,Right,189,88,2,12,3,8,2,3,3,4,9,11,11,8,10,8,6,9,9,10,10,12,10,10,11,2,2,9,generated,-
Canarini,23,Diego Serra,-,DL,WBL,19,ITA,EU,HGC,Yes,U21 Exempt,52,62,Right,173,76,5,10,10,10,8,11,11,10,8,12,11,13,9,9,11,12,11,10,2,2,2,2,8,8,9,12,generated,-
Canarini,15,Rasmus Holm,-,DC,DR,27,DEN,EU,Non-HG,No,Registered,59,61,Right,187,82,4,12,8,8,6,14,12,12,8,11,11,10,10,10,13,11,13,9,2,2,2,2,13,6,5,15,generated,-
Canarini,24,Luca Longo,-,DC,-,26,ITA,EU,HGC,No,Registered,55,55,Right,188,88,5,9,7,10,7,11,11,12,9,11,11,11,10,8,10,10,12,9,2,2,2,2,11,5,4,12,generated,-
Canarini,22,Luca De Angelis,-,DR,-,23,ITA,EU,HGC,No,Registered,56,61,Right,173,67,5,10,9,11,12,13,10,9,9,11,11,10,11,9,14,13,11,10,2,2,2,2,11,11,10,12,generated,-
Canarini,30,Filippo Fontana,-,DM,-,19,ITA,EU,HGC,Yes,U21 Exempt,52,67,Right,183,81,6,9,10,13,6,11,9,8,9,11,14,13,11,10,9,13,10,10,2,2,2,2,11,8,8,10,generated,-
Canarini,14,Jan Gajewski,-,MC,DM,27,POL,EU,Non-HG,No,Registered,56,58,Right,178,71,9,12,12,12,10,10,9,7,12,12,8,12,10,7,9,12,11,11,2,2,2,2,11,10,10,11,generated,-
Canarini,17,Gabriele Rizzo,-,AMC,AML,19,ITA,EU,Non-HG,Yes,U21 Exempt,54,70,Left,179,75,9,12,10,10,7,8,6,7,10,11,7,12,11,8,11,9,8,9,2,2,2,2,11,11,12,10,generated,-
Canarini,21,Petar Barišić,-,AML,ST/ML,23,CRO,EU,Non-HG,No,Registered,56,59,Left,184,84,9,12,13,11,11,7,6,7,10,10,7,9,11,8,12,12,9,13,2,2,2,2,10,13,13,11,generated,-
Canarini,19,Guillermo Tapia,-,AMR,-,28,ESP,EU,Non-HG,No,Registered,52,55,Right,166,66,10,10,13,13,14,5,5,7,11,10,7,12,9,6,10,11,7,10,2,2,2,2,12,10,11,11,generated,-
Canarini,18,Valon Zeqiri,-,ST,AML,21,ALB,Non-EU,Non-HG,Yes,U21 Exempt,56,67,Right,186,78,12,9,13,11,6,5,5,10,11,9,5,10,12,8,11,10,11,10,2,2,2,2,12,14,11,11,generated,-
Canarini,25,Antonio Greco,-,GK,-,19,ITA,EU,HGC,Yes,U21 Exempt,53,65,Right,180,77,2,9,2,9,2,3,3,4,9,10,12,9,11,10,7,8,10,9,13,11,12,11,11,2,2,11,generated,-
Canarini,31,Gianluca Costa,-,MC,DM,19,ITA,EU,HGC,Yes,U21 Exempt,53,66,Right,177,68,5,11,10,13,9,11,9,8,13,10,11,12,10,8,11,12,10,10,2,2,2,2,11,10,8,12,generated,-
Canarini,32,Nicola De Luca,-,ST,AMC,20,ITA,EU,HGN,Yes,U21 Exempt,53,59,Left,187,77,12,10,11,9,6,6,5,10,8,10,6,11,10,8,12,12,13,11,2,2,2,2,9,11,11,10,generated,-
```

## 3. Bundesliga

### Swabians (VfB Stuttgart)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Swabians,1,Itai Hadad,-,GK,-,25,ISR,Non-EU,Non-HG,No,Registered,71,71,Right,190,85,2,10,5,8,2,3,3,4,9,14,14,9,14,11,8,9,13,13,13,16,15,15,14,2,2,11,generated,-
Swabians,3,Sosuke Okada,-,DL,WBL,27,JPN,Non-EU,Non-HG,No,Registered,74,75,Left,176,72,6,13,13,15,13,14,16,11,12,14,15,16,12,11,16,15,13,13,2,2,2,2,13,11,11,14,generated,capped by band
Swabians,4,Jonas Maurer,-,DC,-,36,AUT,EU,Non-HG,No,Registered,74,74,Right,189,84,5,13,10,13,5,15,14,15,10,16,15,15,15,13,13,13,13,10,2,2,2,2,15,7,4,17,generated,capped by band
Swabians,5,Henri Wimmer,-,DC,DM,23,AUT,EU,HGN,No,Registered,74,79,Right,186,86,7,13,10,11,7,13,16,17,10,15,14,16,15,10,13,13,14,13,2,2,2,2,13,4,5,13,generated,capped by band
Swabians,2,Victor Madsen,-,DR,-,28,DEN,EU,Non-HG,No,Registered,72,72,Right,182,76,9,12,12,15,14,14,15,14,10,12,15,17,12,11,16,15,13,13,2,2,2,2,15,12,11,15,generated,-
Swabians,6,Yeray Calvo,-,DM,-,25,ESP,EU,Non-HG,No,Registered,74,75,Right,174,72,9,14,15,13,8,14,14,12,13,15,15,17,16,13,12,16,14,14,2,2,2,2,15,11,10,17,generated,capped by band
Swabians,8,Karim Sylla,-,MC,-,30,CIV,Non-EU,Non-HG,No,Registered,70,70,Right,179,76,11,17,13,13,10,12,13,8,12,14,14,14,17,11,13,12,12,11,2,2,2,2,15,10,13,17,generated,-
Swabians,10,Dennis Krause,-,MC,DM,34,GER,EU,HGN,No,Registered,68,68,Right,181,81,12,12,13,15,10,11,11,10,13,14,12,16,13,9,11,11,12,14,2,2,2,2,16,12,12,16,generated,-
Swabians,11,Marcel Huber,-,AML,ML,31,AUT,EU,Non-HG,No,Registered,71,71,Left,180,76,13,12,17,14,13,6,3,9,15,12,6,14,11,9,13,15,10,15,2,2,2,2,15,13,16,15,generated,-
Swabians,7,Filip Michalski,-,AMR,MR/AMC,27,POL,EU,Non-HG,No,Registered,72,72,Left,176,72,13,13,15,14,17,6,8,6,12,13,5,13,12,9,16,13,11,14,2,2,2,2,12,15,17,14,generated,-
Swabians,9,Alexander Schreiber,-,ST,AMR/AMC,26,GER,EU,HGC,No,Registered,74,75,Left,189,85,16,10,12,15,9,7,4,12,13,12,7,15,14,10,16,13,15,12,2,2,2,2,12,16,13,13,generated,capped by band
Swabians,13,Amit Dahan,-,GK,-,21,ISR,Non-EU,Non-HG,Yes,U21 Exempt,65,76,Either,191,92,2,10,3,9,2,3,3,4,8,11,14,11,13,11,8,7,12,14,15,11,12,12,12,2,2,11,generated,-
Swabians,23,Dario Obradović,-,DL,ML,30,SRB,Non-EU,Non-HG,No,Registered,71,71,Right,187,81,8,12,14,12,12,13,13,10,9,11,14,15,13,9,13,15,13,14,2,2,2,2,16,14,10,15,generated,-
Swabians,15,Hiroki Shimizu,-,DC,-,28,JPN,Non-EU,Non-HG,No,Registered,70,71,Right,186,75,5,12,7,11,8,13,13,16,8,12,15,12,13,12,12,12,16,9,2,2,2,2,14,6,5,14,generated,-
Swabians,24,Niklas Seidel,-,DC,-,19,GER,EU,Non-HG,Yes,U21 Exempt,67,79,Left,179,77,3,11,10,11,5,13,14,13,11,11,12,13,14,11,13,12,14,9,2,2,2,2,14,5,5,15,generated,-
Swabians,22,Enzo Barbier,-,DR,-,20,FRA,EU,Non-HG,Yes,U21 Exempt,70,75,Right,178,69,7,12,13,12,13,16,13,9,11,11,15,17,13,11,16,14,13,13,2,2,2,2,14,11,10,14,generated,-
Swabians,14,Fabian Vogel,-,DM,-,30,GER,EU,HGC,No,Registered,66,66,Right,188,82,7,14,13,11,9,13,12,8,12,13,14,14,12,11,12,14,11,11,2,2,2,2,14,9,9,15,generated,-
Swabians,16,Alexander Weber,-,MC,DM,27,GER,EU,HGC,No,Registered,67,67,Right,184,79,9,14,14,15,11,11,10,11,13,13,12,15,11,11,12,14,10,12,2,2,2,2,13,12,12,13,generated,-
Swabians,17,Leon Haider,-,AMC,-,32,AUT,EU,Non-HG,No,Registered,66,66,Right,186,80,11,15,11,14,13,8,6,8,13,12,6,13,14,9,12,13,11,13,2,2,2,2,13,14,13,12,generated,-
Swabians,21,Oskar Ahlberg,-,AML,-,26,SWE,EU,Non-HG,No,Registered,65,65,Left,182,80,12,10,15,14,12,7,5,7,12,12,7,11,12,8,13,11,10,11,2,2,2,2,11,14,15,12,generated,-
Swabians,30,Felix Scholz,-,AMR,-,19,GER,EU,HGC,Yes,U21 Exempt,65,74,Left,177,75,11,11,16,13,12,5,6,8,12,10,6,10,12,7,12,11,10,17,2,2,2,2,10,12,14,11,generated,-
Swabians,19,Valentin Huber,-,ST,AMR,25,AUT,EU,Non-HG,No,Registered,66,68,Right,187,87,14,10,12,14,8,4,5,13,9,10,6,13,12,8,12,12,12,12,2,2,2,2,13,13,10,14,generated,-
Swabians,25,Noah Keller,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,66,81,Right,187,86,2,12,5,8,2,3,3,4,7,12,11,10,13,12,8,8,8,14,14,13,13,13,12,2,2,13,generated,-
Swabians,31,Marcel Ehrlich,-,MC,AMC,17,GER,EU,HGC,Yes,U21 Exempt,67,76,Right,182,77,8,17,12,13,11,10,11,8,14,12,11,14,14,9,12,12,12,12,2,2,2,2,15,11,11,15,generated,-
Swabians,32,Sebastian Lehmann,-,ST,AMC,17,GER,EU,HGN,Yes,U21 Exempt,68,82,Right,179,76,14,11,11,14,7,6,3,13,12,12,6,13,12,10,15,13,14,13,2,2,2,2,14,17,10,15,generated,-
```

### Breisgau Brazilians (SC Freiburg)
**Reputation:** 76 | **CA Band:** 63–72 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Breisgau Brazilians,1,Zvonimir Vasić,-,GK,-,34,BIH,Non-EU,Non-HG,No,Registered,68,68,Either,190,93,2,11,3,9,2,3,3,4,10,15,13,8,13,9,8,10,13,13,13,14,12,15,13,2,2,13,generated,-
Breisgau Brazilians,3,Richárd Takács,-,DL,-,32,HUN,EU,Non-HG,No,Registered,70,70,Left,183,79,6,13,13,14,12,15,14,12,11,14,13,13,12,11,14,15,12,13,2,2,2,2,12,10,9,13,generated,-
Breisgau Brazilians,4,Adam Pawlak,-,DC,-,26,POL,EU,Non-HG,No,Registered,67,69,Right,189,82,4,9,10,8,5,13,13,14,10,12,15,11,12,10,10,13,14,12,2,2,2,2,15,7,5,13,generated,-
Breisgau Brazilians,5,Tygo Visser,-,DC,DR/DL,28,NED,EU,Non-HG,No,Registered,72,74,Right,185,78,4,13,9,12,5,17,15,16,11,13,16,12,14,10,15,14,14,13,2,2,2,2,15,6,7,14,generated,capped by band
Breisgau Brazilians,2,Tim Wimmer,-,DR,-,25,AUT,EU,Non-HG,No,Registered,72,73,Right,185,84,10,12,13,14,14,15,12,13,11,13,14,14,12,10,15,14,12,15,2,2,2,2,14,12,9,16,generated,capped by band
Breisgau Brazilians,6,Benedikt Scholz,-,DM,-,27,GER,EU,Non-HG,No,Registered,72,74,Right,193,94,8,14,12,15,7,15,14,11,14,15,15,15,13,10,11,17,15,13,2,2,2,2,15,9,8,18,generated,capped by band
Breisgau Brazilians,8,Sebastian Winter,-,MC,-,25,AUT,EU,Non-HG,No,Registered,70,71,Either,182,80,9,15,13,13,9,12,11,9,15,12,11,16,13,11,13,14,9,12,2,2,2,2,14,12,11,17,generated,-
Breisgau Brazilians,10,Valentin Tessier,-,MC,-,24,FRA,EU,Non-HG,No,Registered,72,77,Right,185,78,11,15,12,15,12,13,11,10,13,15,11,15,15,11,12,14,11,12,2,2,2,2,14,13,14,16,generated,capped by band
Breisgau Brazilians,11,Pascal Kainz,-,AML,ST,28,AUT,EU,Non-HG,No,Registered,70,71,Left,183,77,13,13,13,16,12,7,5,9,14,12,8,14,9,9,13,13,13,14,2,2,2,2,14,17,13,14,generated,-
Breisgau Brazilians,7,Yusuf Şahin,-,AMR,MR,25,TUR,Non-EU,Non-HG,No,Registered,70,71,Right,173,68,13,13,14,19,9,7,5,8,11,11,7,11,11,9,17,11,10,15,2,2,2,2,14,14,12,14,generated,-
Breisgau Brazilians,9,Tom Pohl,-,ST,-,32,GER,EU,HGC,No,Registered,71,71,Right,180,72,13,12,13,13,8,7,5,13,9,14,5,14,14,12,12,13,14,13,2,2,2,2,14,15,11,13,generated,-
Breisgau Brazilians,13,Wojciech Čermák,-,GK,-,21,CZE,EU,Non-HG,Yes,U21 Exempt,68,74,Right,185,88,2,11,3,8,2,3,3,4,9,14,12,10,13,11,7,8,12,13,12,13,16,13,14,2,2,13,generated,-
Breisgau Brazilians,23,Connor Parker,-,DL,-,25,USA,Non-EU,Non-HG,No,Registered,65,68,Left,183,81,7,14,13,11,13,13,12,11,10,10,12,13,13,8,16,14,14,13,2,2,2,2,14,12,8,13,generated,-
Breisgau Brazilians,15,Patrick Friedrich,-,DC,DM,21,GER,EU,HGC,Yes,U21 Exempt,64,74,Left,182,76,6,10,9,11,7,13,14,13,12,12,15,12,9,9,13,13,14,10,2,2,2,2,12,5,4,10,generated,-
Breisgau Brazilians,24,Ren Ikeda,-,DC,DR/DL,26,JPN,Non-EU,Non-HG,No,Registered,66,67,Right,185,86,5,11,9,11,5,12,14,13,9,13,13,13,12,12,11,11,15,10,2,2,2,2,14,6,6,13,generated,-
Breisgau Brazilians,22,Trevor Bennett,-,DR,-,31,USA,Non-EU,Non-HG,No,Registered,65,65,Right,178,72,8,12,11,11,13,12,12,10,11,12,12,14,12,7,13,13,12,10,2,2,2,2,12,11,10,14,generated,-
Breisgau Brazilians,14,Piotr Szewczyk,-,DM,MC,22,POL,EU,Non-HG,No,Registered,67,69,Right,187,83,8,15,14,14,9,13,13,12,11,13,13,16,14,9,13,14,13,13,2,2,2,2,15,8,9,15,generated,-
Breisgau Brazilians,16,Sebastian Jäger,-,MC,DM,23,GER,EU,HGN,No,Registered,64,68,Left,182,80,10,13,13,14,7,11,10,9,12,13,10,13,12,9,10,13,11,12,2,2,2,2,13,11,10,14,generated,-
Breisgau Brazilians,17,Mason Brooks,-,AMC,MC,29,USA,Non-EU,Non-HG,No,Registered,67,67,Right,177,72,13,12,15,13,11,9,8,7,14,12,9,13,13,11,13,13,11,11,2,2,2,2,13,15,14,13,generated,-
Breisgau Brazilians,30,Tim Franke,-,AML,-,18,GER,EU,HGC,Yes,U21 Exempt,65,80,Left,183,78,11,13,13,11,11,7,6,7,13,10,6,13,10,9,12,12,12,12,2,2,2,2,12,12,16,13,generated,-
Breisgau Brazilians,19,Kacper Šimek,-,AMR,ST,26,CZE,EU,Non-HG,No,Registered,67,67,Left,182,81,12,11,14,15,10,8,6,7,13,12,8,14,11,8,11,12,12,13,2,2,2,2,12,14,14,12,generated,-
Breisgau Brazilians,18,Tom Friedrich,-,ST,-,22,GER,EU,HGC,No,Registered,65,71,Right,187,84,12,9,12,14,9,4,5,12,10,12,5,14,13,10,15,12,13,12,2,2,2,2,11,13,12,12,generated,-
Breisgau Brazilians,25,Moritz Fischer,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,66,81,Right,187,83,2,9,3,9,2,3,3,4,9,12,13,7,13,9,6,10,13,14,12,15,12,12,12,2,2,10,generated,-
Breisgau Brazilians,31,Lukas Stein,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,63,78,Right,179,82,9,13,12,12,10,12,9,9,12,12,13,15,13,10,12,12,10,13,2,2,2,2,13,9,13,15,generated,-
Breisgau Brazilians,32,Dennis Bergmann,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,64,73,Left,184,86,11,13,12,10,7,5,5,13,10,10,5,13,13,8,14,13,12,10,2,2,2,2,12,14,10,12,generated,-
```

### Foals (Borussia Mönchengladbach)
**Reputation:** 75 | **CA Band:** 63–72 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Foals,1,Eduardo Nogueira,-,GK,-,24,BRA,Non-EU,Non-HG,No,Registered,70,75,Right,193,84,2,10,3,9,2,3,3,4,10,15,14,7,14,12,8,11,13,11,15,13,15,14,14,2,2,11,generated,-
Foals,3,Niklas Albrecht,-,DL,-,32,GER,EU,HGN,No,Registered,71,71,Left,185,83,5,11,14,13,12,16,14,14,12,12,15,17,11,9,14,17,13,15,2,2,2,2,16,12,10,14,generated,-
Foals,4,Yannick Friedrich,-,DC,-,26,GER,EU,HGC,No,Registered,68,68,Right,187,79,5,12,8,11,5,15,12,16,9,12,15,13,14,13,12,12,15,11,2,2,2,2,15,8,4,15,generated,-
Foals,5,Morten Bjørnstad,-,DC,DM,28,FIN,EU,Non-HG,No,Registered,70,71,Left,189,81,5,12,10,12,7,16,14,13,10,16,14,12,11,11,12,12,14,12,2,2,2,2,16,6,6,15,generated,-
Foals,2,Tom Seidel,-,DR,-,26,GER,EU,HGC,No,Registered,71,72,Right,169,59,8,11,12,12,13,13,15,11,15,12,12,16,13,10,14,16,13,12,2,2,2,2,12,11,11,15,generated,-
Foals,6,Burak Doğan,-,DM,-,24,TUR,Non-EU,Non-HG,No,Registered,71,73,Right,185,80,7,13,13,13,9,14,13,12,13,14,14,15,14,11,13,15,13,13,2,2,2,2,14,10,10,14,generated,-
Foals,8,Leon Heinz,-,MC,AMC,29,GER,EU,HGC,No,Registered,70,70,Right,175,75,7,16,11,16,7,12,11,7,13,14,13,13,16,9,14,15,13,14,2,2,2,2,16,12,10,16,generated,-
Foals,10,Filip Babić,-,MC,-,29,CRO,EU,Non-HG,No,Registered,72,72,Right,180,80,9,14,14,12,10,15,14,10,15,14,11,14,13,12,11,14,13,12,2,2,2,2,14,13,13,16,generated,capped by band
Foals,11,Rasmus Bech,-,AML,-,23,DEN,EU,HGN,No,Registered,68,71,Right,181,80,12,11,13,13,12,6,7,10,13,12,9,14,12,9,13,12,11,16,2,2,2,2,12,14,12,13,generated,-
Foals,7,Lars Mulder,-,AMR,MR,25,NED,EU,Non-HG,No,Registered,70,72,Left,171,69,12,12,15,13,12,6,8,7,13,12,7,13,13,7,17,14,11,14,2,2,2,2,9,12,14,13,generated,-
Foals,9,Simon Haider,-,ST,AMC/AMR,30,AUT,EU,Non-HG,No,Registered,70,70,Right,183,79,14,11,12,12,8,6,5,13,8,13,5,16,14,11,13,13,12,12,2,2,2,2,13,13,12,15,generated,-
Foals,13,Yannick Stein,-,GK,-,33,GER,EU,HGN,No,Registered,63,63,Right,182,81,2,10,3,8,2,3,3,4,11,11,10,11,12,9,8,8,10,13,11,14,10,12,12,2,2,11,generated,-
Foals,23,Mateo Gallardo,-,DL,-,26,ESP,EU,Non-HG,No,Registered,64,67,Left,179,74,7,11,10,11,14,13,13,11,12,13,13,12,11,11,11,13,12,11,2,2,2,2,12,11,8,13,generated,-
Foals,15,Berkay Tekin,-,DC,DL,21,TUR,Non-EU,Non-HG,Yes,U21 Exempt,68,79,Left,185,84,4,11,9,14,7,13,12,14,11,14,15,13,13,11,11,14,15,11,2,2,2,2,14,8,7,13,generated,-
Foals,24,Marcel Reiter,-,DC,-,24,AUT,EU,Non-HG,No,Registered,69,74,Right,178,76,5,10,7,12,4,16,15,17,12,13,16,13,12,12,12,11,15,13,2,2,2,2,17,6,6,15,generated,-
Foals,22,Jan Sadowski,-,DR,-,22,POL,EU,HGN,No,Registered,65,68,Left,181,78,6,11,11,12,13,11,14,9,12,14,12,15,12,10,12,13,10,14,2,2,2,2,10,11,11,12,generated,-
Foals,14,Wouter Willems,-,DM,MC/DC,36,NED,EU,Non-HG,No,Registered,66,66,Right,188,87,8,13,10,12,6,14,13,9,12,12,13,15,12,11,10,15,13,10,2,2,2,2,13,8,9,13,generated,-
Foals,16,Rafael Rocha,-,MC,DM/AMC,28,BRA,Non-EU,Non-HG,No,Registered,63,66,Right,177,75,11,12,12,13,9,12,11,8,15,12,13,15,13,11,12,11,12,11,2,2,2,2,13,12,11,16,generated,-
Foals,17,Samuel Onuoha,-,AMC,-,21,NGA,Non-EU,Non-HG,Yes,U21 Exempt,64,69,Left,182,78,12,12,13,13,9,8,7,8,12,12,9,13,15,10,10,13,11,12,2,2,2,2,13,13,14,13,generated,-
Foals,21,Achraf Chakir,-,AML,ST,22,MAR,Non-EU,Non-HG,No,Registered,66,68,Left,180,77,13,10,14,13,11,4,7,9,13,13,7,12,12,10,14,14,12,13,2,2,2,2,12,12,13,11,generated,-
Foals,30,Jannik Seidel,-,AMR,ST,18,GER,EU,HGC,Yes,U21 Exempt,63,73,Right,184,83,11,10,13,12,14,6,6,9,12,10,5,11,10,9,13,12,9,14,2,2,2,2,12,12,13,14,generated,-
Foals,19,Florian Winkler,-,ST,-,27,GER,EU,HGN,No,Registered,63,66,Left,183,82,13,10,11,11,6,4,4,13,10,11,5,13,13,10,12,11,13,13,2,2,2,2,12,15,10,12,generated,-
Foals,25,Valentin Albrecht,-,GK,-,20,GER,EU,HGC,Yes,U21 Exempt,66,75,Right,187,92,2,9,3,9,2,3,3,4,7,12,12,10,13,9,8,8,12,13,14,13,14,12,13,2,2,12,generated,-
Foals,31,Benedikt Maier,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,65,75,Left,186,80,9,13,12,14,10,11,11,8,12,12,12,15,9,8,11,14,12,12,2,2,2,2,12,12,12,15,generated,-
Foals,32,Kai Heinz,-,ST,-,20,GER,EU,HGC,Yes,U21 Exempt,65,77,Right,184,79,14,10,10,13,6,5,5,13,10,13,5,12,13,8,14,12,12,11,2,2,2,2,11,16,12,14,generated,-
```

### Village Club (TSG 1899 Hoffenheim)
**Reputation:** 74 | **CA Band:** 62–71 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Village Club,1,Rafael Mendes,-,GK,-,29,POR,EU,Non-HG,No,Registered,71,71,Left,186,83,2,11,6,9,2,3,3,4,10,12,14,12,15,12,9,10,15,12,13,15,16,14,14,2,2,13,generated,capped by band
Village Club,3,Maximilian Huber,-,DL,ML,31,AUT,EU,Non-HG,No,Registered,67,67,Right,182,80,5,11,13,11,11,14,15,12,10,13,11,15,13,9,15,12,14,13,2,2,2,2,12,11,8,13,generated,-
Village Club,4,Pascal Fuchs,-,DC,DR/DM,32,AUT,EU,Non-HG,No,Registered,66,66,Left,185,81,5,13,7,11,6,13,15,12,11,12,15,15,10,12,11,13,14,11,2,2,2,2,16,6,4,12,generated,-
Village Club,5,Kyle Maddox,-,DC,-,30,AUS,Non-EU,Non-HG,No,Registered,70,70,Right,187,86,5,13,8,11,4,14,11,14,12,12,14,15,12,12,13,13,13,10,2,2,2,2,17,7,5,14,generated,-
Village Club,2,Philipp Jäger,-,DR,DC/WBR,33,GER,EU,HGN,No,Registered,69,69,Right,174,62,7,11,11,13,13,12,15,10,9,12,11,15,12,9,14,14,12,12,2,2,2,2,15,13,9,16,generated,-
Village Club,6,Domagoj Barišić,-,DM,-,27,CRO,EU,Non-HG,No,Registered,71,73,Right,174,68,8,12,14,11,8,14,14,13,13,13,13,15,15,12,11,13,13,13,2,2,2,2,15,10,9,15,generated,capped by band
Village Club,8,Jan Scholz,-,MC,-,26,GER,EU,HGC,No,Registered,71,72,Right,173,64,10,14,15,14,10,13,11,9,14,13,11,14,14,11,13,16,13,15,2,2,2,2,15,12,10,17,generated,capped by band
Village Club,10,Łukasz Sikora,-,MC,-,32,POL,EU,Non-HG,No,Registered,71,71,Right,176,70,10,15,14,15,10,10,9,9,14,14,14,16,14,10,12,15,15,13,2,2,2,2,15,12,12,15,generated,capped by band
Village Club,11,Jesse Van Dam,-,AML,ML,28,NED,EU,Non-HG,No,Registered,65,65,Left,191,90,11,11,12,14,13,6,8,9,12,12,7,14,13,9,13,14,9,12,2,2,2,2,12,12,13,13,generated,-
Village Club,7,Adil El Fassi,-,AMR,AMC,29,MAR,Non-EU,Non-HG,No,Registered,71,71,Right,184,82,12,14,16,14,13,5,8,8,12,11,8,12,12,10,16,11,11,14,2,2,2,2,13,15,15,10,generated,capped by band
Village Club,9,Dino Vasić,-,ST,AMC,28,SRB,Non-EU,Non-HG,No,Registered,71,74,Right,176,77,14,13,14,13,9,3,3,12,12,12,6,14,15,12,14,12,13,13,2,2,2,2,13,15,13,15,generated,capped by band
Village Club,13,Kalidou Fofana,-,GK,-,23,CIV,Non-EU,Non-HG,No,Registered,64,71,Right,194,91,2,10,3,8,2,3,3,4,9,14,14,10,12,11,8,7,10,12,11,13,13,12,13,2,2,9,generated,-
Village Club,23,Bilal Ouazzani,-,DL,-,24,MAR,Non-EU,Non-HG,No,Registered,62,65,Left,183,81,8,10,11,13,12,13,13,13,9,12,13,12,13,10,12,14,12,13,2,2,2,2,11,12,7,12,generated,-
Village Club,15,Dennis Stein,-,DC,-,21,GER,EU,HGC,Yes,U21 Exempt,63,69,Right,181,78,4,10,9,10,5,13,12,11,10,14,12,14,12,9,11,10,12,9,2,2,2,2,11,6,4,13,generated,-
Village Club,30,Elias Schreiber,-,DC,-,19,GER,EU,HGC,Yes,U21 Exempt,64,75,Right,187,90,3,10,8,11,6,12,15,13,11,12,15,12,10,12,11,13,14,11,2,2,2,2,14,7,5,12,generated,-
Village Club,22,Maximilian Gärtner,-,DR,WBR/MR,26,GER,EU,HGC,No,Registered,65,68,Right,180,79,9,13,13,12,10,14,13,9,10,14,11,12,12,10,13,12,11,13,2,2,2,2,12,12,11,12,generated,-
Village Club,14,Henri Haider,-,DM,MC,29,AUT,EU,Non-HG,No,Registered,63,63,Right,178,75,8,12,12,12,9,13,11,8,11,12,12,13,12,12,12,15,12,11,2,2,2,2,13,10,10,13,generated,-
Village Club,16,Maximilian Heinz,-,MC,-,30,GER,EU,HGC,No,Registered,62,62,Left,180,78,10,13,12,14,9,12,10,9,12,12,11,14,12,10,12,11,11,12,2,2,2,2,12,11,11,13,generated,-
Village Club,17,Mathias Tangen,-,AMC,MC,25,FIN,EU,Non-HG,No,Registered,63,64,Left,176,77,11,13,12,12,11,8,9,10,11,12,9,12,11,9,10,11,12,12,2,2,2,2,13,13,10,13,generated,-
Village Club,21,Vuk Kostić,-,AML,-,21,BIH,Non-EU,Non-HG,Yes,U21 Exempt,71,76,Left,182,80,12,13,15,13,11,7,5,7,13,12,7,14,14,8,14,13,12,14,2,2,2,2,12,14,15,13,generated,capped by band
Village Club,19,Noah Becker,-,AMR,ST,22,GER,EU,HGC,No,Registered,63,69,Right,186,79,12,11,15,14,9,5,5,7,13,10,4,13,13,8,14,10,12,13,2,2,2,2,12,12,14,13,generated,-
Village Club,18,Richárd Vörös,-,ST,-,25,HUN,EU,Non-HG,No,Registered,63,65,Right,186,82,14,12,11,11,8,4,5,12,10,13,4,11,12,9,13,13,14,12,2,2,2,2,13,14,10,14,generated,-
Village Club,25,Benedikt Herrmann,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,63,74,Right,190,91,2,10,4,7,2,3,3,4,10,11,14,9,12,9,6,10,9,13,14,14,13,11,12,2,2,10,generated,-
Village Club,31,Christian Heinz,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,64,77,Right,177,75,7,12,12,13,10,10,10,9,12,14,12,13,11,8,12,13,9,12,2,2,2,2,14,12,10,13,generated,-
Village Club,32,Noah Friedrich,-,ST,AMR/AML,19,GER,EU,HGC,Yes,U21 Exempt,64,77,Right,182,71,12,12,13,13,7,4,4,11,11,11,6,13,12,12,13,14,12,12,2,2,2,2,12,13,12,11,generated,-
```

### River Islanders (SV Werder Bremen)
**Reputation:** 74 | **CA Band:** 62–71 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
River Islanders,1,Dino Đorđević,-,GK,-,27,SRB,Non-EU,Non-HG,No,Registered,68,71,Left,192,91,2,11,4,9,2,3,3,4,10,12,15,11,13,7,8,8,12,12,12,14,12,13,13,2,2,13,generated,-
River Islanders,3,Woo-jin Moon,-,DL,-,30,KOR,Non-EU,Non-HG,No,Registered,69,69,Right,186,88,5,12,11,12,13,12,13,11,11,12,13,15,13,8,15,15,13,12,2,2,2,2,14,12,8,15,generated,-
River Islanders,4,Min-jae Jung,-,DC,DR,27,KOR,Non-EU,Non-HG,No,Registered,71,73,Right,194,89,7,11,8,12,6,16,15,15,9,14,12,14,14,13,13,13,17,13,2,2,2,2,15,6,4,16,generated,capped by band
River Islanders,5,Alexander Becker,-,DC,DR,23,GER,EU,HGN,No,Registered,71,75,Right,191,84,6,11,9,11,4,15,16,16,10,14,16,15,12,12,14,13,16,12,2,2,2,2,12,5,6,14,generated,capped by band
River Islanders,2,Lars Sauer,-,DR,WBR,34,GER,EU,HGC,No,Registered,69,69,Right,175,71,7,12,13,13,12,17,14,10,13,13,12,14,13,10,16,15,11,11,2,2,2,2,13,13,9,14,generated,-
River Islanders,6,Ren Inoue,-,DM,MC,25,JPN,Non-EU,Non-HG,No,Registered,69,72,Right,172,67,9,13,11,13,9,15,13,10,14,14,15,13,13,9,11,13,14,11,2,2,2,2,16,10,9,15,generated,-
River Islanders,8,Maxime Sauvage,-,MC,AMC,31,FRA,EU,Non-HG,No,Registered,68,68,Left,180,69,10,13,12,14,8,13,13,9,14,12,14,15,14,10,12,14,13,13,2,2,2,2,11,13,12,16,generated,-
River Islanders,10,Linus Bergström,-,MC,AMC,30,SWE,EU,Non-HG,No,Registered,68,68,Right,181,74,9,14,14,12,10,11,12,8,13,13,14,14,13,11,11,15,13,14,2,2,2,2,14,13,13,15,generated,-
River Islanders,11,Wojciech Dudek,-,AML,-,28,POL,EU,Non-HG,No,Registered,71,74,Left,186,82,12,11,16,16,11,6,6,10,12,13,9,15,13,9,16,14,8,15,2,2,2,2,12,14,15,13,generated,capped by band
River Islanders,7,Christian Giesler,-,AMR,MR,30,GER,EU,HGC,No,Registered,68,68,Left,178,77,12,12,12,13,12,7,7,7,13,10,7,13,12,8,13,11,11,13,2,2,2,2,12,11,14,12,generated,-
River Islanders,9,Simon Jäger,-,ST,AMR,30,GER,EU,HGN,No,Registered,70,70,Right,181,76,14,13,12,15,10,5,1,14,10,12,5,13,12,9,12,11,14,12,2,2,2,2,14,15,12,12,generated,-
River Islanders,13,Jakub Havlík,-,GK,-,28,CZE,EU,Non-HG,No,Registered,67,67,Right,189,85,2,11,4,7,2,3,3,4,10,15,13,9,13,8,9,9,13,15,14,12,13,14,13,2,2,12,generated,-
River Islanders,23,Christian Köhler,-,DL,WBL,28,GER,EU,HGN,No,Registered,68,68,Left,189,81,6,13,14,13,13,12,12,11,12,12,13,14,11,11,17,14,12,11,2,2,2,2,13,12,8,15,generated,-
River Islanders,15,Thijs Franken,-,DC,DR,28,NED,EU,Non-HG,No,Registered,66,69,Right,191,87,4,12,8,11,6,13,14,15,10,15,14,13,12,11,11,13,14,10,2,2,2,2,14,5,4,15,generated,-
River Islanders,30,Tim Jäger,-,DC,DL,19,GER,EU,Non-HG,Yes,U21 Exempt,65,78,Right,178,76,4,12,8,10,3,13,12,12,8,11,13,12,11,8,11,13,15,10,2,2,2,2,15,4,5,12,generated,-
River Islanders,22,Unai Crespo,-,DR,-,21,ESP,EU,Non-HG,Yes,U21 Exempt,63,74,Either,175,77,7,11,11,11,12,13,11,8,11,14,13,14,10,9,16,15,11,11,2,2,2,2,12,12,12,13,generated,-
River Islanders,14,Aron Zijlstra,-,DM,-,32,NED,EU,Non-HG,No,Registered,63,63,Left,193,88,7,12,12,12,10,14,12,10,11,16,14,15,10,12,11,15,11,11,2,2,2,2,13,9,11,12,generated,-
River Islanders,16,Ivo Cano,-,MC,-,24,ESP,EU,Non-HG,No,Registered,62,66,Right,184,85,8,13,12,14,10,9,10,8,10,11,11,15,11,11,11,13,10,11,2,2,2,2,13,10,11,14,generated,-
River Islanders,17,Segun Ibrahim,-,AMC,-,23,NGA,Non-EU,Non-HG,No,Registered,64,66,Right,178,75,12,13,12,14,11,7,7,7,11,13,11,13,12,10,15,12,12,10,2,2,2,2,13,12,9,14,generated,-
River Islanders,21,Elias Eder,-,AML,-,30,AUT,EU,Non-HG,No,Registered,63,63,Left,184,77,10,13,14,14,10,6,6,9,11,11,5,13,13,7,15,12,11,15,2,2,2,2,12,13,13,11,generated,-
River Islanders,19,Niklas Baumann,-,AMR,AMC,30,GER,EU,HGN,No,Registered,65,65,Right,175,71,13,10,14,16,11,7,5,7,10,12,8,13,11,9,14,13,10,15,2,2,2,2,12,12,16,13,generated,-
River Islanders,18,Eduardo Freitas,-,ST,-,22,BRA,Non-EU,Non-HG,No,Registered,62,66,Right,185,86,12,10,12,12,4,9,5,12,10,10,5,13,13,9,13,12,12,11,2,2,2,2,13,14,10,12,generated,-
River Islanders,25,Niklas Dietrich,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,64,75,Left,195,89,2,9,2,7,2,3,3,4,9,12,13,9,13,8,9,9,13,13,12,12,13,13,14,2,2,9,generated,-
River Islanders,31,Patrick Albrecht,-,MC,-,18,GER,EU,HGC,Yes,U21 Exempt,62,72,Right,182,78,8,12,10,13,8,9,12,9,14,13,11,13,11,11,13,13,11,13,2,2,2,2,13,12,13,12,generated,-
River Islanders,32,Simon Maier,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,62,75,Right,183,80,12,10,11,12,10,2,4,13,9,12,7,14,13,9,11,11,11,12,2,2,2,2,13,15,13,11,generated,-
```

### Zero-Fivers (1. FSV Mainz 05)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Zero-Fivers,1,Robin Giesler,-,GK,-,28,GER,EU,HGN,No,Registered,68,68,Right,189,83,2,12,3,10,2,3,3,4,10,12,14,9,15,10,8,9,11,12,12,14,16,11,12,2,2,13,generated,-
Zero-Fivers,3,Uche Okonkwo,-,DL,ML,22,NGA,Non-EU,Non-HG,No,Registered,70,75,Right,185,77,6,11,12,11,14,14,15,12,11,12,12,14,11,11,15,16,14,13,2,2,2,2,11,13,11,15,generated,capped by band
Zero-Fivers,4,Evans Asamoah,-,DC,DM,25,GHA,Non-EU,Non-HG,No,Registered,68,71,Left,184,86,6,11,9,10,7,17,15,15,11,12,14,14,12,11,12,11,13,10,2,2,2,2,14,6,3,12,generated,-
Zero-Fivers,5,Bartosz Baran,-,DC,-,30,POL,EU,Non-HG,No,Registered,70,70,Right,193,94,6,13,8,11,5,15,14,15,9,16,14,14,13,10,12,13,14,10,2,2,2,2,14,5,5,16,generated,capped by band
Zero-Fivers,2,Christian Huber,-,DR,-,29,AUT,EU,Non-HG,No,Registered,69,69,Left,181,75,8,11,13,11,11,14,13,10,10,13,15,15,13,12,14,15,13,15,2,2,2,2,12,11,10,14,generated,-
Zero-Fivers,6,Julian Maurer,-,DM,MC,26,AUT,EU,Non-HG,No,Registered,69,72,Right,172,70,6,11,13,11,7,13,14,12,12,13,15,16,14,9,12,15,12,13,2,2,2,2,14,10,10,14,generated,-
Zero-Fivers,8,Kofi Tetteh,-,MC,AMC/DM,24,GHA,Non-EU,Non-HG,No,Registered,66,71,Either,177,76,9,14,12,12,10,11,12,8,13,14,12,12,13,10,12,13,11,13,2,2,2,2,13,10,11,15,generated,-
Zero-Fivers,10,Yannick Brandt,-,MC,DM/AMC,25,GER,EU,HGC,No,Registered,67,68,Right,176,73,10,15,13,15,10,13,10,8,15,11,14,14,14,10,12,13,12,13,2,2,2,2,12,11,13,13,generated,-
Zero-Fivers,11,Marco Monti,-,AML,-,36,ITA,EU,Non-HG,No,Registered,69,69,Left,177,74,11,12,14,14,13,6,5,8,12,9,5,13,13,9,15,12,11,14,2,2,2,2,14,13,14,14,generated,-
Zero-Fivers,7,Paweł Gajewski,-,AMR,-,36,POL,EU,Non-HG,No,Registered,67,67,Right,183,79,11,12,13,14,12,6,4,7,12,12,8,11,12,9,13,11,13,14,2,2,2,2,13,12,16,11,generated,-
Zero-Fivers,9,Christian Reuter,-,ST,-,29,GER,EU,HGC,No,Registered,66,66,Left,186,82,15,11,11,9,8,7,3,11,12,13,4,14,12,9,13,11,13,12,2,2,2,2,11,13,11,14,generated,-
Zero-Fivers,13,Manuel Piras,-,GK,-,33,ITA,EU,Non-HG,No,Registered,62,62,Left,192,88,2,9,2,8,2,3,3,4,7,13,13,8,13,8,8,9,10,11,14,13,14,13,13,2,2,13,generated,-
Zero-Fivers,23,Davi Farias,-,DL,ML/WBL,26,BRA,Non-EU,Non-HG,No,Registered,64,65,Left,185,88,4,12,13,10,13,12,13,10,9,14,14,13,12,10,13,14,13,11,2,2,2,2,11,11,11,12,generated,-
Zero-Fivers,15,Niklas Fuchs,-,DC,-,26,AUT,EU,Non-HG,No,Registered,62,63,Right,184,81,7,10,7,9,5,13,13,13,10,14,14,12,11,8,12,12,11,11,2,2,2,2,12,4,4,12,generated,-
Zero-Fivers,30,Alexander Roth,-,DC,-,18,GER,EU,HGC,Yes,U21 Exempt,63,73,Left,182,73,4,11,8,11,3,13,12,15,10,14,14,11,12,10,12,13,13,12,2,2,2,2,13,5,7,14,generated,-
Zero-Fivers,22,Marvin Kessler,-,DR,DC,30,GER,EU,HGN,No,Registered,64,64,Right,180,76,8,11,10,11,12,13,10,11,12,11,13,15,13,12,12,14,14,13,2,2,2,2,13,10,13,13,generated,-
Zero-Fivers,14,Thomas Nyberg,-,DM,-,26,SWE,EU,Non-HG,No,Registered,64,66,Left,185,79,8,14,11,9,9,13,13,10,10,14,11,13,12,12,11,13,12,13,2,2,2,2,14,8,7,12,generated,-
Zero-Fivers,16,Luiz Tavares,-,MC,DM,24,BRA,Non-EU,Non-HG,No,Registered,61,68,Right,185,80,6,14,12,14,9,12,10,8,13,11,11,12,12,9,13,14,8,11,2,2,2,2,14,10,10,11,generated,-
Zero-Fivers,17,Fabian Lehmann,-,AMC,-,27,GER,EU,HGC,No,Registered,62,62,Left,172,71,11,11,15,12,10,8,7,7,16,11,10,12,12,10,11,13,11,12,2,2,2,2,12,11,12,12,generated,-
Zero-Fivers,21,Diogo Sampaio,-,AML,ML,25,POR,EU,Non-HG,No,Registered,62,64,Either,178,74,10,11,12,12,15,7,4,7,13,11,7,12,10,7,13,12,11,14,2,2,2,2,12,11,12,13,generated,-
Zero-Fivers,19,Danilo Duarte,-,AMR,AMC,33,BRA,Non-EU,Non-HG,No,Registered,64,64,Right,179,71,12,10,13,11,11,6,7,8,13,13,7,12,11,8,12,11,12,12,2,2,2,2,13,13,14,12,generated,-
Zero-Fivers,18,Patrick Bergmann,-,ST,AML,29,GER,EU,HGC,No,Registered,61,61,Right,189,85,12,9,10,13,7,7,6,9,10,10,5,11,12,8,14,11,14,12,2,2,2,2,11,15,10,12,generated,-
Zero-Fivers,25,Lars Seidel,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,62,77,Right,187,87,2,12,5,9,2,3,3,4,7,12,12,9,13,8,7,9,10,11,14,13,12,13,13,2,2,10,generated,-
Zero-Fivers,31,Yannick Herrmann,-,MC,-,18,GER,EU,HGN,Yes,U21 Exempt,62,74,Right,180,73,8,12,12,11,9,11,10,8,13,10,11,12,13,10,11,11,10,11,2,2,2,2,13,8,8,11,generated,-
Zero-Fivers,32,Noah Reuter,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,64,73,Right,180,80,13,10,12,13,7,5,3,12,11,12,6,12,10,8,12,13,17,13,2,2,2,2,13,14,11,12,generated,-
```

### Iron Ones (1. FC Union Berlin)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Iron Ones,1,Nana Yeboah,-,GK,-,31,GHA,Non-EU,Non-HG,No,Registered,69,69,Right,192,84,2,9,4,8,2,3,3,4,10,12,14,10,14,8,7,9,12,11,14,15,13,14,14,2,2,12,generated,-
Iron Ones,3,Mateusz Adamski,-,DL,ML,22,POL,EU,HGN,No,Registered,69,76,Left,183,83,5,13,12,12,10,14,13,11,9,11,12,16,13,10,15,14,12,14,2,2,2,2,12,11,11,13,generated,-
Iron Ones,4,Karlo Đorđević,-,DC,DM/DR,27,SRB,Non-EU,Non-HG,No,Registered,68,69,Right,187,86,6,10,10,10,6,16,14,14,11,17,16,12,12,11,12,14,16,10,2,2,2,2,15,5,5,16,generated,-
Iron Ones,5,Kaito Takeda,-,DC,-,26,JPN,Non-EU,Non-HG,No,Registered,69,71,Right,187,82,5,11,7,12,7,15,14,13,10,12,14,13,14,12,14,13,16,11,2,2,2,2,14,7,4,16,generated,-
Iron Ones,2,Rodrigo Xavier,-,DR,-,26,BRA,Non-EU,Non-HG,No,Registered,69,70,Right,174,69,5,15,13,12,15,13,15,11,11,13,13,16,10,12,15,14,13,14,2,2,2,2,13,11,11,14,generated,-
Iron Ones,6,Niklas Reuter,-,DM,DC,27,GER,EU,HGC,No,Registered,70,70,Right,181,71,7,12,11,14,9,13,13,12,11,12,14,15,14,10,12,17,13,14,2,2,2,2,16,11,8,16,generated,capped by band
Iron Ones,8,Asger Eide,-,MC,AMC,21,FIN,EU,Non-HG,Yes,U21 Exempt,69,74,Right,179,66,12,15,13,14,8,12,12,9,13,12,11,14,15,10,13,15,11,12,2,2,2,2,15,12,12,15,generated,-
Iron Ones,10,Tim Neumann,-,MC,-,29,GER,EU,HGC,No,Registered,69,69,Right,183,75,9,14,12,13,10,13,11,9,14,12,11,14,15,9,13,14,12,14,2,2,2,2,13,12,12,15,generated,-
Iron Ones,11,Niklas Hartmann,-,AML,ST,30,GER,EU,HGC,No,Registered,69,69,Right,179,69,13,12,15,14,9,7,5,9,13,12,8,11,12,10,16,14,10,15,2,2,2,2,13,14,15,14,generated,-
Iron Ones,7,Wouter Veenstra,-,AMR,-,24,NED,EU,Non-HG,No,Registered,65,72,Left,180,74,11,11,13,15,14,5,7,7,10,10,9,10,12,8,16,12,10,14,2,2,2,2,13,13,14,13,generated,-
Iron Ones,9,Maximilian Albrecht,-,ST,AML,24,GER,EU,HGC,No,Registered,68,75,Right,188,87,16,11,12,13,8,3,6,14,11,13,6,12,12,8,17,13,12,13,2,2,2,2,13,16,11,12,generated,-
Iron Ones,13,Robin Wallner,-,GK,-,24,AUT,EU,Non-HG,No,Registered,62,65,Right,182,79,2,9,4,7,2,3,3,4,11,12,14,9,17,9,8,10,12,12,12,13,14,13,13,2,2,13,generated,-
Iron Ones,23,Yusuf Okafor,-,DL,-,24,NGA,Non-EU,Non-HG,No,Registered,61,66,Left,180,76,7,10,12,10,10,11,10,9,9,11,12,12,11,8,15,13,11,12,2,2,2,2,12,12,9,12,generated,-
Iron Ones,15,Marvin Albrecht,-,DC,DM/DR,30,SUI,Non-EU,Non-HG,No,Registered,62,62,Left,190,86,3,12,6,10,6,12,13,15,8,11,15,12,13,11,11,10,15,9,2,2,2,2,12,5,6,14,generated,-
Iron Ones,24,Przemysław Sadowski,-,DC,-,30,POL,EU,Non-HG,No,Registered,64,64,Right,190,90,5,10,11,13,6,11,14,12,8,13,12,12,13,11,12,10,13,9,2,2,2,2,12,6,5,11,generated,-
Iron Ones,22,Robin Stein,-,DR,DC,22,GER,EU,HGC,No,Registered,65,72,Right,184,76,6,10,11,11,13,12,11,9,12,13,11,14,12,10,11,12,11,14,2,2,2,2,12,11,11,16,generated,-
Iron Ones,14,Jannik Giesler,-,DM,DC,32,GER,EU,HGC,No,Registered,62,62,Left,182,74,7,15,12,14,7,16,9,9,11,13,10,12,10,12,12,13,12,11,2,2,2,2,13,9,11,12,generated,-
Iron Ones,16,Philipp Albrecht,-,MC,DM,31,GER,EU,HGC,No,Registered,66,66,Right,181,73,10,13,12,14,10,10,9,9,14,14,12,15,13,10,10,14,10,14,2,2,2,2,14,10,10,13,generated,-
Iron Ones,17,Vasilis Georgiou,-,AMC,AML,28,GRE,EU,Non-HG,No,Registered,62,65,Right,175,72,10,13,13,14,11,8,7,9,13,11,8,12,13,9,12,13,12,13,2,2,2,2,11,14,11,13,generated,-
Iron Ones,21,Nico Rebollo,-,AML,ST,25,ESP,EU,Non-HG,No,Registered,65,65,Left,181,76,12,12,12,11,15,6,5,7,9,10,5,12,14,9,14,13,10,15,2,2,2,2,11,9,13,11,generated,-
Iron Ones,19,Thomas Madsen,-,AMR,-,28,DEN,EU,Non-HG,No,Registered,67,68,Either,181,78,10,11,13,15,11,6,6,10,12,8,6,13,13,8,14,10,11,14,2,2,2,2,12,12,15,12,generated,-
Iron Ones,30,Patrick Gärtner,-,ST,AMR,21,GER,EU,Non-HG,Yes,U21 Exempt,61,73,Left,185,92,13,10,11,12,8,4,2,10,10,9,4,12,11,9,12,12,12,12,2,2,2,2,15,13,11,13,generated,-
Iron Ones,25,Moritz Stein,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,61,77,Left,192,95,2,9,6,9,2,3,3,4,7,11,13,9,11,9,6,9,10,11,12,14,12,11,13,2,2,13,generated,-
Iron Ones,31,Jan Neumann,-,MC,-,17,GER,EU,HGN,Yes,U21 Exempt,62,75,Right,174,78,9,11,12,12,10,12,11,8,9,12,11,15,13,10,13,13,9,14,2,2,2,2,13,11,10,13,generated,-
Iron Ones,32,Jannik Ostermann,-,ST,-,17,GER,EU,HGC,Yes,U21 Exempt,62,77,Right,182,78,13,11,11,12,8,6,3,12,11,11,5,12,12,10,14,12,11,13,2,2,2,2,11,13,10,13,generated,-
```

### Royal Blues (FC Schalke 04)
**Reputation:** 71 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Royal Blues,1,Patrick Seidel,-,GK,-,34,GER,EU,HGC,No,Registered,69,69,Right,187,83,2,11,4,8,2,3,3,4,12,15,13,9,12,10,9,8,12,11,13,15,15,12,14,2,2,10,generated,capped by band
Royal Blues,3,Dino Marković,-,DL,DC,28,SRB,Non-EU,Non-HG,No,Registered,64,66,Left,191,87,5,11,9,11,12,13,11,11,10,13,13,13,14,9,14,14,13,12,2,2,2,2,12,12,10,12,generated,-
Royal Blues,4,Antoine Gaillard,-,DC,-,30,FRA,EU,Non-HG,No,Registered,67,67,Right,194,91,4,11,10,11,7,12,12,13,10,12,13,12,12,11,13,12,14,9,2,2,2,2,13,5,6,15,generated,-
Royal Blues,5,Jens Poulsen,-,DC,-,25,DEN,EU,Non-HG,No,Registered,68,68,Right,193,94,5,12,9,11,4,17,14,13,11,15,13,14,11,13,12,11,14,10,2,2,2,2,12,5,4,14,generated,-
Royal Blues,2,Mathias Pedersen,-,DR,MR,26,DEN,EU,Non-HG,No,Registered,67,69,Right,178,73,6,11,16,11,10,14,15,10,11,14,14,13,8,11,15,15,12,15,2,2,2,2,12,13,11,15,generated,-
Royal Blues,6,Jean Cavalcanti,-,DM,MC,32,BRA,Non-EU,Non-HG,No,Registered,69,69,Right,179,75,8,12,12,12,8,13,14,11,13,13,15,16,16,11,13,13,12,11,2,2,2,2,13,8,9,14,generated,capped by band
Royal Blues,8,Mats Kuipers,-,MC,DM/AMC,24,NED,EU,Non-HG,No,Registered,65,72,Right,188,82,9,14,13,14,10,12,12,9,14,13,11,13,12,9,11,14,10,11,2,2,2,2,11,12,11,14,generated,-
Royal Blues,10,Kai Engel,-,MC,AMC,22,GER,EU,HGC,No,Registered,68,73,Right,184,76,7,13,12,13,9,11,10,9,15,15,12,14,13,9,12,13,11,11,2,2,2,2,15,12,11,16,generated,-
Royal Blues,11,Yacouba Diarra,-,AML,-,32,CIV,Non-EU,Non-HG,No,Registered,69,69,Left,178,72,12,12,14,15,14,6,6,9,12,11,7,13,14,8,13,14,11,15,2,2,2,2,12,15,14,14,generated,capped by band
Royal Blues,7,Pascal Reuter,-,AMR,-,35,GER,EU,HGN,No,Registered,67,67,Right,174,69,10,11,14,13,16,8,6,8,13,11,6,12,10,9,15,11,10,14,2,2,2,2,14,11,14,12,generated,-
Royal Blues,9,Antonio Pellegrini,-,ST,-,29,ITA,EU,Non-HG,No,Registered,69,69,Right,178,71,14,9,10,15,6,4,2,15,10,12,6,12,16,9,14,14,12,11,2,2,2,2,13,14,12,13,generated,capped by band
Royal Blues,13,Federico Carbone,-,GK,-,21,ITA,EU,Non-HG,Yes,U21 Exempt,60,69,Right,190,89,2,10,3,8,2,3,3,4,11,12,12,8,12,9,8,10,11,10,14,10,12,11,12,2,2,11,generated,-
Royal Blues,23,Niels Smit,-,DL,ML,26,NED,EU,Non-HG,No,Registered,60,61,Right,176,75,4,11,11,10,11,12,13,10,10,12,11,14,12,7,13,12,10,12,2,2,2,2,12,11,9,12,generated,-
Royal Blues,15,Noah Giesler,-,DC,-,26,GER,EU,HGN,No,Registered,62,63,Right,181,73,4,10,7,11,5,11,14,12,10,14,12,10,12,9,12,10,14,9,2,2,2,2,13,6,6,13,generated,-
Royal Blues,24,Simon Dietrich,-,DC,DR,24,GER,EU,HGC,No,Registered,60,65,Right,180,80,5,10,8,10,6,13,12,13,7,14,14,12,10,8,11,13,12,11,2,2,2,2,11,4,5,13,generated,-
Royal Blues,22,Xander Vandenberghe,-,DR,-,22,BEL,EU,Non-HG,No,Registered,61,67,Right,185,80,7,12,12,10,11,12,11,10,10,10,13,14,10,10,13,14,12,11,2,2,2,2,11,10,9,12,generated,-
Royal Blues,14,Jake Reese,-,DM,-,20,USA,Non-EU,Non-HG,Yes,U21 Exempt,62,72,Right,189,87,8,10,9,13,7,12,12,10,11,13,11,11,13,11,11,11,11,11,2,2,2,2,14,10,8,13,generated,-
Royal Blues,16,Jan Ziegler,-,MC,AMC,27,SUI,Non-EU,Non-HG,No,Registered,60,60,Right,180,76,8,14,11,11,8,9,11,9,13,11,11,13,12,10,8,12,12,12,2,2,2,2,14,11,10,14,generated,-
Royal Blues,17,Łukasz Čermák,-,AMC,-,32,CZE,EU,Non-HG,No,Registered,64,64,Right,183,79,13,12,12,14,11,9,7,9,13,12,10,13,14,11,10,12,12,13,2,2,2,2,13,14,14,11,generated,-
Royal Blues,30,Marcel Dietrich,-,AML,-,18,GER,EU,HGC,Yes,U21 Exempt,62,72,Left,189,80,10,10,13,12,9,5,5,6,11,12,6,13,13,9,15,11,10,13,2,2,2,2,9,12,11,10,generated,-
Royal Blues,19,Florian Maurer,-,AMR,-,21,AUT,EU,Non-HG,Yes,U21 Exempt,67,75,Right,182,80,12,13,15,14,10,5,6,7,12,10,6,12,11,11,14,12,9,16,2,2,2,2,12,10,14,12,generated,-
Royal Blues,18,Achraf Benali,-,ST,-,28,MAR,Non-EU,Non-HG,No,Registered,61,64,Left,187,84,11,9,10,12,7,6,7,12,10,11,5,13,12,8,14,12,12,11,2,2,2,2,13,14,10,12,generated,-
Royal Blues,25,Tobias Fischer,-,GK,-,20,GER,EU,HGC,Yes,U21 Exempt,61,68,Right,191,89,2,12,2,8,2,3,3,4,11,12,13,10,13,9,9,9,10,12,10,11,14,12,14,2,2,11,generated,-
Royal Blues,31,Julian Friedrich,-,MC,-,19,GER,EU,HGC,Yes,U21 Exempt,62,77,Right,186,82,8,12,12,13,9,11,8,8,14,11,10,13,13,10,12,14,10,10,2,2,2,2,12,9,9,13,generated,-
Royal Blues,32,Julian Heinz,-,ST,-,19,GER,EU,HGN,Yes,U21 Exempt,60,70,Right,186,81,12,9,11,11,8,9,4,12,10,10,5,12,10,8,12,11,14,11,2,2,2,2,10,11,11,11,generated,-
```

### Red Shorts (Hamburger SV)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Red Shorts,1,Toni Brkić,-,GK,-,27,CRO,EU,Non-HG,No,Registered,67,70,Right,186,77,2,10,3,9,2,3,3,4,10,11,14,10,13,10,8,10,13,11,14,12,13,16,13,2,2,11,generated,-
Red Shorts,3,Daniel Queiroz,-,DL,ML,27,BRA,Non-EU,Non-HG,No,Registered,67,67,Left,183,78,8,13,14,13,17,16,12,10,12,13,11,15,14,9,14,14,15,14,2,2,2,2,12,12,10,15,generated,-
Red Shorts,4,Balázs Fehér,-,DC,DL,30,HUN,EU,Non-HG,No,Registered,68,68,Right,183,80,6,11,8,10,7,15,16,15,8,12,16,13,11,13,12,11,15,12,2,2,2,2,14,8,5,15,generated,-
Red Shorts,5,Jakub Růžička,-,DC,-,26,CZE,EU,Non-HG,No,Registered,68,71,Right,188,84,4,10,10,14,7,15,13,15,9,13,12,13,13,12,12,11,16,11,2,2,2,2,14,6,5,16,generated,-
Red Shorts,2,Uroš Đorđević,-,DR,MR,26,BIH,Non-EU,Non-HG,No,Registered,68,70,Left,187,87,7,12,13,12,12,13,13,11,11,11,13,16,12,10,15,14,11,13,2,2,2,2,13,12,10,15,generated,-
Red Shorts,6,Luuk Willems,-,DM,DC,30,NED,EU,Non-HG,No,Registered,69,69,Right,176,73,8,12,12,15,9,13,12,9,12,15,14,16,13,11,11,14,14,12,2,2,2,2,14,8,8,14,generated,capped by band
Red Shorts,8,Selim Acar,-,MC,-,28,TUR,Non-EU,Non-HG,No,Registered,69,72,Right,179,68,12,15,12,14,9,13,12,8,12,13,12,14,14,11,12,13,11,13,2,2,2,2,14,13,12,17,generated,capped by band
Red Shorts,10,Dániel Takács,-,MC,DM,28,HUN,EU,Non-HG,No,Registered,69,70,Either,173,70,9,12,12,13,9,10,11,9,13,14,13,15,14,10,12,15,11,12,2,2,2,2,14,11,14,13,generated,capped by band
Red Shorts,11,Jan Reuter,-,AML,-,26,GER,EU,HGC,No,Registered,68,69,Left,175,71,13,14,15,14,13,7,6,8,14,13,6,11,12,9,14,13,11,14,2,2,2,2,14,12,12,14,generated,-
Red Shorts,7,Noah Jäger,-,AMR,-,28,GER,EU,HGC,No,Registered,69,72,Right,178,73,11,13,14,13,12,8,5,8,12,13,6,13,12,8,13,12,9,14,2,2,2,2,13,12,13,12,generated,capped by band
Red Shorts,9,Philipp Giesler,-,ST,-,28,GER,EU,HGN,No,Registered,64,67,Right,176,77,11,10,12,11,8,5,6,13,10,11,8,13,14,11,14,12,13,10,2,2,2,2,12,13,12,10,generated,-
Red Shorts,13,Oliver Nyberg,-,GK,-,22,SWE,EU,Non-HG,No,Registered,64,71,Right,187,80,2,12,3,10,2,3,3,4,9,9,10,8,15,8,7,9,13,13,15,12,13,13,12,2,2,9,generated,-
Red Shorts,23,Tin Kostić,-,DL,-,25,SRB,Non-EU,Non-HG,No,Registered,64,67,Left,185,80,5,10,13,14,12,13,11,10,10,12,14,13,11,10,14,14,11,12,2,2,2,2,11,12,9,14,generated,-
Red Shorts,30,Noah Scholz,-,DC,-,20,GER,EU,HGN,Yes,U21 Exempt,63,69,Right,190,83,4,9,9,10,5,13,13,12,8,11,12,12,13,11,11,12,16,11,2,2,2,2,13,7,5,13,generated,-
Red Shorts,15,Michele Bruni,-,DC,-,19,ITA,EU,Non-HG,Yes,U21 Exempt,63,78,Right,185,78,3,9,9,9,6,14,14,13,9,14,13,11,13,9,13,11,15,11,2,2,2,2,13,5,4,13,generated,-
Red Shorts,22,Davide Monti,-,DR,-,25,ITA,EU,Non-HG,No,Registered,64,67,Right,184,82,6,11,12,11,12,13,15,8,12,10,13,14,14,11,13,14,12,11,2,2,2,2,13,10,11,14,generated,-
Red Shorts,14,Lukas Becker,-,DM,-,23,GER,EU,HGC,No,Registered,60,65,Right,190,90,8,11,12,11,8,12,12,10,12,11,11,14,11,9,10,10,13,9,2,2,2,2,14,8,9,13,generated,-
Red Shorts,16,Yonatan Mizrahi,-,MC,DM,21,ISR,Non-EU,Non-HG,Yes,U21 Exempt,62,70,Right,185,78,8,12,13,11,8,10,11,9,13,14,9,14,12,10,12,14,9,11,2,2,2,2,12,12,11,13,generated,-
Red Shorts,17,Marcel Krause,-,AMC,AMR,29,GER,EU,HGC,No,Registered,64,64,Right,179,72,13,12,13,14,10,8,6,9,14,13,10,11,13,10,12,13,11,12,2,2,2,2,11,13,14,14,generated,-
Red Shorts,21,Ben Weaver,-,AML,ML/AMC,30,USA,Non-EU,Non-HG,No,Registered,67,67,Left,180,74,13,12,14,13,11,7,4,7,13,13,7,11,12,8,16,14,10,16,2,2,2,2,11,15,13,12,generated,-
Red Shorts,19,Philipp Friedrich,-,AMR,-,28,GER,EU,HGC,No,Registered,66,69,Right,180,79,11,11,15,13,12,3,6,5,12,10,6,14,11,9,14,12,10,15,2,2,2,2,10,15,15,13,generated,-
Red Shorts,18,Lars Declercq,-,ST,-,24,BEL,EU,Non-HG,No,Registered,63,67,Right,176,68,12,11,12,13,8,6,2,12,9,10,8,12,11,8,12,12,12,12,2,2,2,2,12,12,14,12,generated,-
Red Shorts,25,Lars Keller,-,GK,-,17,GER,EU,HGC,Yes,U21 Exempt,62,71,Right,191,88,2,9,1,9,2,3,3,4,11,12,11,10,14,12,8,8,8,10,12,12,11,11,14,2,2,11,generated,-
Red Shorts,31,Yannick Köhler,-,MC,AMC,19,GER,EU,HGC,Yes,U21 Exempt,60,74,Right,182,72,8,11,12,13,8,10,9,7,12,15,9,12,12,10,11,13,11,12,2,2,2,2,14,10,9,14,generated,-
Red Shorts,32,Niklas Hofmann,-,ST,-,21,GER,EU,HGN,Yes,U21 Exempt,60,68,Right,192,89,11,9,10,10,5,6,3,11,11,11,7,10,11,11,12,12,10,10,2,2,2,2,12,12,9,13,generated,-
```

### Billy Goats (1. FC Köln)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Billy Goats,1,Maximilian Neumann,-,GK,-,31,GER,EU,HGN,No,Registered,65,65,Left,187,83,2,11,3,11,2,3,3,4,8,12,13,10,13,10,7,10,13,10,13,14,13,12,12,2,2,12,generated,-
Billy Goats,3,Elias Engel,-,DL,WBL,25,GER,EU,Non-HG,No,Registered,64,64,Left,188,80,8,13,12,10,13,13,12,11,12,12,11,13,11,8,13,13,12,13,2,2,2,2,12,11,8,15,generated,-
Billy Goats,4,Philipp Pohl,-,DC,-,21,GER,EU,HGC,Yes,U21 Exempt,69,76,Either,179,74,5,12,7,11,7,13,13,14,10,12,14,14,12,12,11,13,13,10,2,2,2,2,13,5,7,13,generated,capped by band
Billy Goats,5,Lasse Rasmussen,-,DC,DR/DL,32,DEN,EU,Non-HG,No,Registered,69,69,Right,189,84,4,15,11,11,6,16,16,15,9,14,17,14,14,12,13,14,15,13,2,2,2,2,13,6,7,15,generated,capped by band
Billy Goats,2,Dušan Obradović,-,DR,-,32,BIH,Non-EU,Non-HG,No,Registered,69,69,Left,184,79,7,12,12,13,11,13,13,10,12,13,13,14,11,11,12,16,10,13,2,2,2,2,15,11,13,14,generated,capped by band
Billy Goats,6,Stefan Dijkstra,-,DM,-,30,NED,EU,Non-HG,No,Registered,69,69,Right,183,77,6,13,12,13,9,15,11,10,13,13,14,15,14,12,10,15,11,12,2,2,2,2,15,8,10,17,generated,capped by band
Billy Goats,8,Ante Zdravković,-,MC,-,25,SRB,Non-EU,Non-HG,No,Registered,68,68,Right,186,83,7,14,15,13,10,12,10,10,15,14,11,14,13,10,13,16,12,13,2,2,2,2,14,12,11,15,generated,-
Billy Goats,10,Max Lawson,-,MC,-,27,USA,Non-EU,Non-HG,No,Registered,66,67,Right,184,82,9,14,13,13,10,12,10,9,14,14,9,16,12,10,10,14,11,13,2,2,2,2,14,13,11,14,generated,-
Billy Goats,11,Krzysztof Lewandowicz,-,AML,-,27,POL,EU,Non-HG,No,Registered,69,72,Left,179,81,13,11,17,14,12,6,6,8,15,10,6,13,13,11,14,13,11,15,2,2,2,2,11,14,14,10,generated,capped by band
Billy Goats,7,Adrien Royer,-,AMR,-,22,FRA,EU,Non-HG,No,Registered,67,70,Right,179,73,10,13,14,13,17,8,5,8,13,10,5,11,12,9,14,12,12,16,2,2,2,2,11,13,13,12,generated,-
Billy Goats,9,Tom Haider,-,ST,-,22,AUT,EU,HGN,No,Registered,67,72,Right,187,78,15,12,12,15,7,4,3,13,9,12,5,13,12,8,14,13,13,13,2,2,2,2,12,14,13,13,generated,-
Billy Goats,13,Cody Maddox,-,GK,-,25,USA,Non-EU,Non-HG,No,Registered,66,68,Right,192,85,2,8,4,10,2,3,3,4,11,13,12,8,13,11,5,10,11,10,14,14,13,12,12,2,2,12,generated,-
Billy Goats,23,Henri Roth,-,DL,-,24,GER,EU,HGC,No,Registered,62,66,Left,177,70,6,11,12,12,10,14,12,11,9,11,13,13,13,10,12,15,12,12,2,2,2,2,12,10,11,13,generated,-
Billy Goats,15,Patrick Pichler,-,DC,-,25,AUT,EU,Non-HG,No,Registered,62,64,Right,191,91,7,10,8,11,6,13,11,12,7,13,13,13,11,11,11,11,13,11,2,2,2,2,13,9,6,12,generated,-
Billy Goats,24,James Ellis,-,DC,-,28,ENG,Non-EU,Non-HG,No,Registered,65,66,Left,189,82,3,10,9,11,7,15,14,12,8,13,14,13,12,11,11,12,13,11,2,2,2,2,11,5,5,16,generated,-
Billy Goats,22,Nico Varela,-,DR,-,26,ESP,EU,Non-HG,No,Registered,65,66,Right,181,78,5,10,11,10,11,12,11,9,9,13,12,15,14,9,14,13,11,10,2,2,2,2,12,10,11,15,generated,-
Billy Goats,30,Yannick Franke,-,DM,MC,18,GER,EU,HGN,Yes,U21 Exempt,63,75,Right,191,84,8,12,13,12,7,15,10,10,12,15,14,15,12,9,11,14,12,11,2,2,2,2,14,9,8,15,generated,-
Billy Goats,14,Daniel Brandt,-,MC,-,19,GER,EU,Non-HG,Yes,U21 Exempt,64,80,Right,183,77,9,13,13,13,10,12,10,9,13,13,13,14,13,12,11,13,12,12,2,2,2,2,11,11,13,12,generated,-
Billy Goats,17,Bakary Yattara,-,AMC,-,24,CIV,Non-EU,Non-HG,No,Registered,60,66,Left,177,72,11,11,12,11,8,8,7,9,12,13,9,11,12,8,12,11,11,12,2,2,2,2,12,14,13,11,generated,-
Billy Goats,21,Rayan Millet,-,AML,-,32,FRA,EU,Non-HG,No,Registered,62,62,Left,182,80,11,12,13,10,12,5,6,6,13,11,6,11,13,8,15,12,10,14,2,2,2,2,10,13,12,11,generated,-
Billy Goats,19,Adam Dvořák,-,AMR,-,21,CZE,EU,Non-HG,Yes,U21 Exempt,66,75,Right,173,71,11,12,11,13,10,6,6,8,14,13,6,11,13,7,13,14,10,15,2,2,2,2,11,10,13,13,generated,-
Billy Goats,18,David Hofmann,-,ST,AMC,24,GER,EU,HGN,No,Registered,61,66,Right,186,83,12,11,11,11,5,6,5,12,10,12,9,13,13,8,12,10,11,11,2,2,2,2,12,14,10,13,generated,-
Billy Goats,25,Valentin Pohl,-,GK,-,19,GER,EU,Non-HG,Yes,U21 Exempt,62,73,Right,191,88,2,8,4,8,2,3,3,4,10,12,12,9,13,10,8,9,12,11,11,13,13,11,13,2,2,12,generated,-
Billy Goats,31,Daniel Bergmann,-,MC,AMC,18,GER,EU,HGC,Yes,U21 Exempt,61,75,Right,176,72,9,14,11,12,9,10,12,12,13,10,11,13,13,10,9,12,11,13,2,2,2,2,15,9,9,15,generated,-
Billy Goats,32,Philipp Winkler,-,ST,-,18,GER,EU,HGC,Yes,U21 Exempt,60,71,Right,181,73,12,9,9,11,7,6,5,11,10,11,8,11,11,10,10,10,13,9,2,2,2,2,9,12,9,12,generated,-
```

### Fuggerstädter (FC Augsburg)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Fuggerstädter,1,Elias Schober,-,GK,-,34,AUT,EU,Non-HG,No,Registered,66,66,Either,192,90,2,10,1,8,2,3,3,4,10,13,13,10,14,8,8,10,12,12,14,12,14,14,14,2,2,13,generated,-
Fuggerstädter,3,Kwabena Boateng,-,DL,-,25,GHA,Non-EU,Non-HG,No,Registered,66,66,Left,189,85,8,11,11,12,10,13,13,10,12,12,14,12,13,9,13,13,13,11,2,2,2,2,12,10,10,13,generated,-
Fuggerstädter,4,Patryk Havlík,-,DC,DL,23,CZE,EU,HGN,No,Registered,65,71,Left,184,80,3,13,7,12,6,13,14,12,6,14,14,12,11,12,10,12,16,11,2,2,2,2,15,7,5,14,generated,-
Fuggerstädter,5,Davi Sampaio,-,DC,-,28,BRA,Non-EU,Non-HG,No,Registered,67,68,Right,187,85,6,12,9,12,6,14,11,12,8,12,17,13,13,11,13,13,15,9,2,2,2,2,14,7,5,14,generated,capped by band
Fuggerstädter,2,Simon Ostermann,-,DR,-,24,GER,EU,HGC,No,Registered,65,72,Right,182,77,6,11,10,12,16,13,12,9,10,11,12,12,12,10,15,15,12,13,2,2,2,2,14,11,10,16,generated,-
Fuggerstädter,6,Lucas Baert,-,DM,DC/MC,29,BEL,EU,Non-HG,No,Registered,66,66,Either,175,71,8,12,10,14,8,13,15,10,14,13,14,14,12,14,11,15,14,10,2,2,2,2,14,9,9,14,generated,-
Fuggerstädter,8,Tim Baumann,-,MC,AMC/DM,31,GER,EU,HGC,No,Registered,65,65,Right,177,71,9,13,11,14,9,8,10,11,11,13,10,14,10,10,10,13,10,12,2,2,2,2,13,10,11,14,generated,-
Fuggerstädter,10,Julian Haas,-,MC,DM,28,GER,EU,HGC,No,Registered,64,66,Right,176,68,9,14,12,11,9,9,10,7,14,12,12,13,14,9,13,13,10,12,2,2,2,2,15,11,9,13,generated,-
Fuggerstädter,11,Fabian Weber,-,AML,-,26,GER,EU,HGN,No,Registered,64,64,Right,171,68,12,11,13,14,12,7,5,8,10,13,6,13,12,9,14,13,9,13,2,2,2,2,11,12,12,13,generated,-
Fuggerstädter,7,Douglas Xavier,-,AMR,ST/AMC,26,BRA,Non-EU,Non-HG,No,Registered,67,67,Either,184,83,10,11,16,14,11,6,6,7,14,12,6,15,13,8,12,12,10,14,2,2,2,2,11,17,14,12,generated,capped by band
Fuggerstädter,9,Tim Stein,-,ST,AML,21,GER,EU,HGN,Yes,U21 Exempt,65,73,Right,184,87,14,12,12,12,7,6,5,12,7,12,7,13,11,8,13,13,11,12,2,2,2,2,12,15,13,13,generated,-
Fuggerstädter,13,Kasper Lindgren,-,GK,-,26,SWE,EU,Non-HG,No,Registered,60,62,Right,191,90,2,11,6,7,2,3,3,4,8,13,13,10,13,11,8,8,9,11,13,14,12,12,11,2,2,12,generated,-
Fuggerstädter,23,Ousmane Cissé,-,DL,-,24,CIV,Non-EU,Non-HG,No,Registered,64,69,Left,185,82,6,13,11,11,13,14,13,9,10,12,10,15,11,7,15,12,11,11,2,2,2,2,12,13,11,13,generated,-
Fuggerstädter,15,Petros Antoniou,-,DC,-,22,GRE,EU,Non-HG,No,Registered,61,65,Right,180,82,3,10,9,11,5,14,12,13,10,12,13,13,11,12,13,10,12,11,2,2,2,2,11,4,7,12,generated,-
Fuggerstädter,24,Roko Milošević,-,DC,DL/DR,27,BIH,Non-EU,Non-HG,No,Registered,62,65,Left,191,89,4,11,10,9,6,12,13,14,7,12,12,13,12,9,11,13,13,10,2,2,2,2,14,6,6,14,generated,-
Fuggerstädter,22,Enzo Vidal,-,DR,DC,25,FRA,EU,Non-HG,No,Registered,60,62,Right,181,79,6,11,11,11,10,11,11,8,10,11,10,14,10,9,14,14,9,15,2,2,2,2,11,9,9,11,generated,-
Fuggerstädter,14,Umut Akgün,-,DM,MC/DC,29,TUR,Non-EU,Non-HG,No,Registered,59,59,Right,185,76,6,14,11,11,8,10,13,12,11,11,12,15,10,12,10,13,11,11,2,2,2,2,11,7,7,12,generated,-
Fuggerstädter,16,Jens Winther,-,MC,DM,22,DEN,EU,Non-HG,No,Registered,64,69,Right,179,76,7,12,12,12,9,11,10,9,12,13,13,13,12,11,10,12,12,13,2,2,2,2,13,11,11,14,generated,-
Fuggerstädter,17,Daniel Köhler,-,AMC,MC,26,GER,EU,HGC,No,Registered,60,62,Right,182,76,11,11,13,14,10,9,7,9,14,11,7,14,12,11,7,11,12,11,2,2,2,2,12,10,13,12,generated,-
Fuggerstädter,21,Fabian Heinz,-,AML,ST,29,GER,EU,HGN,No,Registered,58,58,Left,168,62,12,11,13,12,13,7,4,7,12,11,5,11,9,8,13,13,9,12,2,2,2,2,13,12,12,11,generated,-
Fuggerstädter,30,Niklas Herrmann,-,AMR,MR,20,GER,EU,Non-HG,Yes,U21 Exempt,58,67,Right,175,75,10,10,12,10,9,5,5,6,10,10,6,10,12,6,14,10,10,11,2,2,2,2,10,11,12,12,generated,-
Fuggerstädter,19,Thomas Winther,-,ST,-,29,DEN,EU,Non-HG,No,Registered,64,64,Left,183,83,12,10,9,14,7,5,4,12,9,12,7,11,14,8,13,11,14,12,2,2,2,2,12,13,11,12,generated,-
Fuggerstädter,25,Jan Keller,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,60,72,Right,191,90,2,10,4,10,2,3,3,4,8,12,12,9,11,9,9,8,10,11,14,12,13,11,14,2,2,9,generated,-
Fuggerstädter,31,Maximilian Keller,-,MC,-,20,GER,EU,HGC,Yes,U21 Exempt,58,68,Right,182,84,8,12,11,13,9,10,10,8,14,10,12,14,14,9,12,13,11,12,2,2,2,2,13,10,10,13,generated,-
Fuggerstädter,32,Leon Reuter,-,ST,-,21,GER,EU,HGC,Yes,U21 Exempt,61,72,Left,185,76,15,9,13,11,6,5,4,12,11,11,7,12,11,7,12,12,13,12,2,2,2,2,13,14,10,13,generated,-
```

### Paderborn Blue-Blacks (SC Paderborn 07)
**Reputation:** 58 | **CA Band:** 52–61 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Paderborn Blue-Blacks,1,Selim Erdem,-,GK,-,26,TUR,Non-EU,Non-HG,No,Registered,58,58,Left,188,85,2,11,5,8,2,3,3,4,9,12,12,8,13,10,7,9,11,10,12,10,12,11,12,2,2,11,generated,-
Paderborn Blue-Blacks,3,Kaito Miyazaki,-,DL,DC,26,JPN,Non-EU,Non-HG,No,Registered,59,62,Left,186,85,3,11,14,11,11,12,12,11,9,13,12,15,10,7,12,12,11,9,2,2,2,2,10,12,10,12,generated,-
Paderborn Blue-Blacks,4,Valentin Bergmann,-,DC,DR,28,SUI,Non-EU,Non-HG,No,Registered,59,60,Right,184,81,4,11,6,11,6,12,12,13,9,11,15,10,12,10,11,10,11,11,2,2,2,2,12,4,3,11,generated,-
Paderborn Blue-Blacks,5,Gonzalo Bermejo,-,DC,-,24,ESP,EU,Non-HG,No,Registered,60,66,Right,183,80,3,11,7,12,6,12,13,11,9,10,11,13,12,10,10,12,12,9,2,2,2,2,11,5,5,14,generated,-
Paderborn Blue-Blacks,2,Jan Franke,-,DR,-,28,GER,EU,HGN,No,Registered,60,61,Right,183,84,7,10,10,12,12,10,11,8,8,11,10,12,9,10,12,11,11,12,2,2,2,2,11,11,9,12,generated,-
Paderborn Blue-Blacks,6,Patrick Fischer,-,DM,DC,31,GER,EU,HGC,No,Registered,56,56,Right,176,70,8,11,10,9,7,10,11,9,11,12,11,11,11,10,11,10,11,11,2,2,2,2,12,8,7,14,generated,-
Paderborn Blue-Blacks,8,Julian Richter,-,MC,-,27,GER,EU,HGN,No,Registered,59,62,Right,182,72,9,13,12,13,10,11,11,7,12,13,10,14,12,9,11,12,12,11,2,2,2,2,11,11,10,14,generated,-
Paderborn Blue-Blacks,10,Callum Fisher,-,MC,DM,27,AUS,Non-EU,Non-HG,No,Registered,59,61,Right,176,62,9,15,13,13,9,11,9,6,12,13,9,14,12,10,11,12,10,11,2,2,2,2,13,11,10,14,generated,-
Paderborn Blue-Blacks,11,Bastien Fournier,-,AML,-,30,FRA,EU,Non-HG,No,Registered,61,61,Left,172,76,10,13,12,11,9,4,6,9,11,12,6,11,10,7,13,11,11,12,2,2,2,2,11,10,13,10,generated,capped by band
Paderborn Blue-Blacks,7,Philipp Kessler,-,AMR,ST,30,GER,EU,Non-HG,No,Registered,61,61,Right,181,81,11,11,11,14,9,5,6,9,11,10,8,10,10,8,13,11,9,12,2,2,2,2,12,12,14,12,generated,capped by band
Paderborn Blue-Blacks,9,Sosuke Tanabe,-,ST,AMR/AMC,29,JPN,Non-EU,Non-HG,No,Registered,61,61,Either,191,84,11,9,11,12,8,3,4,10,11,10,7,10,12,9,13,10,11,11,2,2,2,2,13,13,11,12,generated,capped by band
Paderborn Blue-Blacks,13,Wesley Castro,-,GK,-,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,54,64,Right,196,93,2,7,3,7,2,3,3,4,9,10,13,8,11,8,9,7,10,10,12,11,11,9,9,2,2,9,generated,-
Paderborn Blue-Blacks,23,Tom Albrecht,-,DL,ML,20,GER,EU,HGC,Yes,U21 Exempt,54,65,Left,185,83,7,10,9,10,13,12,9,9,9,9,11,10,11,8,12,11,11,9,2,2,2,2,11,12,8,11,generated,-
Paderborn Blue-Blacks,15,Maximilian Roth,-,DC,-,24,GER,EU,HGC,No,Registered,55,57,Left,191,91,5,11,8,9,4,12,12,12,10,13,13,10,11,10,10,10,12,11,2,2,2,2,10,6,4,13,generated,-
Paderborn Blue-Blacks,24,Jens Nielsen,-,DC,DR/DL,22,DEN,EU,Non-HG,No,Registered,54,61,Left,187,85,4,9,6,11,6,12,12,11,10,13,12,11,11,8,10,10,11,10,2,2,2,2,10,5,7,11,generated,-
Paderborn Blue-Blacks,22,Yannick Wimmer,-,DR,-,27,AUT,EU,Non-HG,No,Registered,53,54,Right,176,72,6,8,9,11,10,9,10,7,10,9,9,13,11,9,10,10,9,8,2,2,2,2,10,10,9,12,generated,-
Paderborn Blue-Blacks,14,Julian Eder,-,DM,DC/MC,29,AUT,EU,Non-HG,No,Registered,52,52,Right,182,78,7,9,9,9,8,10,10,8,10,11,10,10,9,11,9,12,11,9,2,2,2,2,10,10,9,10,generated,-
Paderborn Blue-Blacks,16,Kai Köhler,-,MC,AMC/DM,24,GER,EU,HGC,No,Registered,54,57,Right,177,69,9,11,12,15,10,11,8,7,11,10,10,13,10,9,8,10,8,9,2,2,2,2,11,10,10,14,generated,-
Paderborn Blue-Blacks,17,Jannik Fuchs,-,AMC,-,19,GER,EU,Non-HG,Yes,U21 Exempt,54,70,Right,176,71,9,10,10,10,12,8,8,7,11,11,11,12,12,10,10,11,8,12,2,2,2,2,11,12,12,10,generated,-
Paderborn Blue-Blacks,30,Lukas Fischer,-,AML,-,18,GER,EU,HGC,Yes,U21 Exempt,55,68,Left,186,82,7,9,13,12,9,6,7,8,11,10,7,12,12,6,11,9,10,13,2,2,2,2,9,11,10,10,generated,-
Paderborn Blue-Blacks,19,Kamil Chmielewski,-,AMR,-,24,POL,EU,Non-HG,No,Registered,57,59,Right,181,81,9,10,12,13,11,6,5,6,10,10,5,10,11,7,11,11,8,13,2,2,2,2,10,12,12,12,generated,-
Paderborn Blue-Blacks,18,Jorne Segers,-,ST,AML/AMR,21,BEL,EU,Non-HG,Yes,U21 Exempt,54,59,Right,187,84,12,10,11,11,6,6,3,11,10,10,3,12,10,8,11,10,10,12,2,2,2,2,11,11,7,10,generated,-
Paderborn Blue-Blacks,25,Pascal Maier,-,GK,-,19,GER,EU,HGC,Yes,U21 Exempt,54,68,Right,187,81,2,10,5,8,2,3,3,4,8,12,12,6,11,8,8,9,9,11,11,12,12,10,12,2,2,10,generated,-
Paderborn Blue-Blacks,31,Jonas Giesler,-,MC,-,18,GER,EU,HGN,Yes,U21 Exempt,55,68,Right,178,77,7,12,9,13,10,9,7,9,13,12,8,11,10,7,8,10,10,9,2,2,2,2,12,9,11,12,generated,-
Paderborn Blue-Blacks,32,Kai Neumann,-,ST,-,18,GER,EU,Non-HG,Yes,U21 Exempt,54,69,Right,184,75,10,9,11,11,7,6,5,13,8,10,7,10,10,8,10,8,10,10,2,2,2,2,11,11,11,10,generated,-
```

### Elversberg Village Club (SV 07 Elversberg)
**Reputation:** 56 | **CA Band:** 50–59 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Elversberg Village Club,1,Can Tekin,-,GK,-,31,TUR,Non-EU,Non-HG,No,Registered,55,55,Right,192,93,2,9,3,8,2,3,3,4,9,13,13,7,11,10,6,7,9,11,11,11,10,12,12,2,2,12,generated,-
Elversberg Village Club,3,Oskar Borkowski,-,DL,ML,28,POL,EU,Non-HG,No,Registered,55,57,Left,186,81,7,10,13,12,10,10,11,8,10,8,15,14,10,9,10,14,10,11,2,2,2,2,11,10,8,10,generated,-
Elversberg Village Club,4,Pascal Ehrlich,-,DC,-,22,GER,EU,HGC,No,Registered,58,64,Right,186,73,4,7,10,11,5,13,12,11,9,10,14,10,11,10,11,11,13,8,2,2,2,2,12,6,4,11,generated,-
Elversberg Village Club,5,Hicham Mansouri,-,DC,DM,27,MAR,Non-EU,Non-HG,No,Registered,59,62,Right,191,87,4,9,9,8,6,14,11,14,8,10,14,10,13,12,8,9,12,10,2,2,2,2,11,5,5,12,generated,capped by band
Elversberg Village Club,2,Fabian Krause,-,DR,-,26,GER,EU,Non-HG,No,Registered,54,54,Right,180,77,7,10,10,11,11,10,11,8,9,10,11,12,9,8,11,11,12,11,2,2,2,2,10,8,9,11,generated,-
Elversberg Village Club,6,Kota Akiyama,-,DM,MC/DC,26,JPN,Non-EU,Non-HG,No,Registered,58,61,Right,178,69,4,11,9,12,8,14,11,9,9,12,9,15,10,10,11,12,12,10,2,2,2,2,13,6,7,10,generated,-
Elversberg Village Club,8,David Lang,-,MC,-,25,GER,EU,Non-HG,No,Registered,55,55,Either,181,78,7,11,10,12,7,10,9,8,12,10,10,11,11,6,11,11,11,10,2,2,2,2,9,11,11,13,generated,-
Elversberg Village Club,10,Tom Neumann,-,MC,-,32,GER,EU,HGN,No,Registered,58,58,Right,181,79,9,10,12,10,9,9,10,9,11,11,10,11,10,10,9,11,10,11,2,2,2,2,11,10,9,14,generated,-
Elversberg Village Club,11,Kévin Baudry,-,AML,-,27,FRA,EU,Non-HG,No,Registered,58,61,Left,172,68,12,9,11,14,12,5,6,9,13,12,4,12,9,7,10,12,8,11,2,2,2,2,11,13,15,10,generated,-
Elversberg Village Club,7,Patrick Richter,-,AMR,ST,26,GER,EU,HGC,No,Registered,57,59,Right,175,67,11,12,11,8,10,6,4,5,11,10,6,11,11,9,9,10,9,12,2,2,2,2,10,11,10,12,generated,-
Elversberg Village Club,9,Kenta Maeda,-,ST,-,31,JPN,Non-EU,Non-HG,No,Registered,59,59,Right,186,85,10,10,11,12,7,5,2,11,9,11,5,10,11,11,10,10,10,12,2,2,2,2,10,13,9,12,generated,capped by band
Elversberg Village Club,13,Zvonimir Nikolić,-,GK,-,26,BIH,Non-EU,Non-HG,No,Registered,53,56,Right,198,89,2,7,2,7,2,3,3,4,8,13,10,9,9,8,8,8,9,10,11,10,11,11,11,2,2,11,generated,-
Elversberg Village Club,23,Julien Morin,-,DL,WBL,19,FRA,EU,Non-HG,Yes,U21 Exempt,51,62,Left,178,69,6,9,9,11,11,11,12,9,10,10,10,11,11,7,13,12,10,8,2,2,2,2,9,9,9,12,generated,-
Elversberg Village Club,30,Jannik Weber,-,DC,-,19,GER,EU,HGN,Yes,U21 Exempt,51,60,Right,199,102,5,9,6,9,4,12,10,11,6,11,12,10,10,11,12,9,9,8,2,2,2,2,9,5,6,11,generated,-
Elversberg Village Club,15,Tom Baumann,-,DC,DL,26,GER,EU,HGN,No,Registered,54,57,Right,189,85,3,9,10,10,4,11,12,9,8,14,11,10,10,11,13,11,13,9,2,2,2,2,11,4,5,12,generated,-
Elversberg Village Club,22,Filip Šarić,-,DR,MR,31,CRO,EU,Non-HG,No,Registered,51,51,Left,178,73,7,8,11,9,11,10,11,8,9,8,12,13,10,8,11,10,11,9,2,2,2,2,9,9,11,12,generated,-
Elversberg Village Club,14,Florian Becker,-,DM,-,21,GER,EU,HGC,Yes,U21 Exempt,54,64,Left,183,85,8,10,8,10,4,10,10,10,10,13,11,14,11,7,10,11,12,10,2,2,2,2,14,10,8,11,generated,-
Elversberg Village Club,16,Bastien Gauthier,-,MC,-,25,FRA,EU,Non-HG,No,Registered,51,52,Left,177,70,8,12,11,11,7,9,10,9,11,10,9,11,12,8,9,12,9,10,2,2,2,2,10,10,9,12,generated,-
Elversberg Village Club,17,Tim Friedrich,-,AMC,-,29,GER,EU,HGN,No,Registered,50,50,Right,178,79,10,11,10,12,10,8,6,6,9,11,7,6,10,7,9,7,7,9,2,2,2,2,10,9,9,10,generated,-
Elversberg Village Club,21,Dario Stojanović,-,AML,ST,22,BIH,Non-EU,Non-HG,No,Registered,50,56,Left,175,68,8,9,10,11,9,6,4,7,9,10,6,10,11,6,10,9,9,12,2,2,2,2,7,9,10,11,generated,-
Elversberg Village Club,19,Fabian Richter,-,AMR,-,26,GER,EU,HGC,No,Registered,50,50,Left,176,68,10,10,10,11,12,6,5,6,9,9,7,11,10,7,11,11,10,12,2,2,2,2,10,9,12,11,generated,-
Elversberg Village Club,18,Oskar Bergström,-,ST,-,28,SWE,EU,Non-HG,No,Registered,50,50,Right,184,80,10,10,7,9,6,6,5,10,9,9,4,9,12,8,11,9,7,11,2,2,2,2,11,11,8,11,generated,-
Elversberg Village Club,25,Daniel Jäger,-,GK,-,18,GER,EU,HGC,Yes,U21 Exempt,52,63,Left,189,85,2,8,3,8,2,3,3,4,8,9,10,7,12,12,6,7,9,10,13,10,9,10,10,2,2,9,generated,-
Elversberg Village Club,31,Noah Richter,-,MC,-,21,GER,EU,HGC,Yes,U21 Exempt,51,63,Left,184,81,8,14,8,12,9,8,8,6,10,9,9,10,11,7,10,11,11,10,2,2,2,2,10,8,10,11,generated,-
Elversberg Village Club,32,Valentin Giesler,-,ST,-,18,GER,EU,HGN,Yes,U21 Exempt,51,66,Right,181,82,9,9,10,9,6,2,6,9,9,10,4,9,11,8,10,10,11,9,2,2,2,2,10,11,9,8,generated,-
```

## 4. Ligue 1

### Aiglons (OGC Nice)
**Reputation:** 79 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Aiglons,1,Axel Giraud,-,GK,-,33,FRA,EU,HGN,No,Registered,71,71,Right,190,94,2,12,2,10,2,3,3,4,10,15,13,9,14,11,8,10,12,13,17,14,13,12,16,2,2,13,generated,-
Aiglons,3,Nathan Barbier,-,DL,-,28,FRA,EU,Non-HG,No,Registered,73,74,Right,193,91,8,14,14,14,13,17,14,14,11,15,13,16,13,11,16,15,13,14,2,2,2,2,14,12,9,15,generated,-
Aiglons,4,Aboubacar Sagna,-,DC,DR,28,GUI,Non-EU,Non-HG,No,Registered,73,76,Left,186,78,4,13,8,12,8,13,15,17,10,12,15,14,13,11,14,15,14,13,2,2,2,2,13,5,3,15,generated,-
Aiglons,5,Lucas Lacroix,-,DC,-,25,FRA,EU,HGN,No,Registered,74,77,Left,189,90,3,12,10,13,6,17,16,16,12,14,16,14,14,10,14,15,14,12,2,2,2,2,14,6,6,15,generated,capped by band
Aiglons,2,Adrien Mercier,-,DR,-,24,FRA,EU,Non-HG,No,Registered,72,75,Right,180,68,6,14,13,13,13,16,13,9,12,12,13,15,12,11,14,16,14,13,2,2,2,2,15,12,12,16,generated,-
Aiglons,6,Rui Tavares,-,DM,-,23,POR,EU,Non-HG,No,Registered,74,81,Right,186,87,7,14,13,15,9,16,14,12,14,13,18,17,13,13,12,15,13,13,2,2,2,2,16,11,7,16,generated,capped by band
Aiglons,8,Wojciech Baran,-,MC,DM,24,POL,EU,Non-HG,No,Registered,74,77,Right,184,80,10,14,16,14,11,11,12,10,12,14,14,13,11,11,13,15,12,14,2,2,2,2,14,13,13,16,generated,capped by band
Aiglons,10,Karim Cissé,-,MC,AMC,29,MLI,Non-EU,Non-HG,No,Registered,71,71,Right,186,76,11,14,14,13,9,13,10,10,16,15,14,15,14,10,14,14,10,13,2,2,2,2,13,12,13,16,generated,-
Aiglons,11,Xander Dumont,-,AML,AMC/ML,26,BEL,EU,Non-HG,No,Registered,69,72,Left,182,74,13,12,14,14,11,5,5,7,13,11,7,13,11,10,16,12,11,17,2,2,2,2,14,13,15,13,generated,-
Aiglons,7,Nabil Zniber,-,AMR,ST,30,MAR,Non-EU,Non-HG,No,Registered,74,74,Right,177,78,12,13,15,13,12,9,6,7,11,12,7,14,11,9,15,15,10,15,2,2,2,2,14,14,16,14,generated,capped by band
Aiglons,9,Loïc Chauvin,-,ST,AMC,25,FRA,EU,HGC,No,Registered,71,73,Right,184,74,16,12,15,15,6,7,4,14,11,10,6,14,13,10,15,14,14,12,2,2,2,2,13,15,10,15,generated,-
Aiglons,13,Yanis Millet,-,GK,-,27,FRA,EU,HGN,No,Registered,66,68,Right,189,79,2,10,2,7,2,3,3,4,9,13,15,9,13,12,7,10,11,10,13,13,14,14,14,2,2,12,generated,-
Aiglons,23,Senne Hermans,-,DL,-,22,BEL,EU,Non-HG,No,Registered,66,68,Left,184,78,5,10,10,14,12,13,13,14,10,12,13,15,13,9,14,14,10,13,2,2,2,2,14,10,10,13,generated,-
Aiglons,15,Walid El Fassi,-,DC,-,26,MAR,Non-EU,Non-HG,No,Registered,68,69,Right,194,91,6,11,9,13,6,15,14,15,8,16,14,15,11,12,12,13,13,11,2,2,2,2,15,5,3,13,generated,-
Aiglons,24,Brent Van Damme,-,DC,DR/DL,33,BEL,EU,Non-HG,No,Registered,65,65,Left,195,93,5,13,9,11,7,14,13,14,10,12,15,12,11,10,12,12,14,12,2,2,2,2,13,7,4,13,generated,-
Aiglons,22,Pietro Marino,-,DR,-,27,ITA,EU,Non-HG,No,Registered,68,69,Right,182,76,6,12,11,11,10,13,12,10,11,14,15,16,12,12,16,14,11,11,2,2,2,2,13,9,13,14,generated,-
Aiglons,14,Enrique Lara,-,DM,DC,24,ESP,EU,Non-HG,No,Registered,65,71,Right,188,81,8,14,11,12,9,16,12,8,10,14,13,15,12,9,12,13,14,14,2,2,2,2,13,7,7,14,generated,-
Aiglons,16,Søren Nielsen,-,MC,-,23,DEN,EU,Non-HG,No,Registered,68,72,Right,180,76,9,15,11,13,9,13,11,8,13,13,12,14,13,9,12,13,11,14,2,2,2,2,13,13,13,16,generated,-
Aiglons,17,Achraf Amrani,-,AMC,-,28,MAR,Non-EU,Non-HG,No,Registered,68,69,Left,179,78,12,13,13,14,8,10,7,10,12,14,10,12,12,11,12,12,12,12,2,2,2,2,11,15,14,15,generated,-
Aiglons,21,Nolan Gauthier,-,AML,-,27,FRA,EU,Non-HG,No,Registered,66,66,Left,176,70,14,12,13,15,13,6,4,7,14,11,7,14,12,10,14,11,10,14,2,2,2,2,12,14,14,12,generated,-
Aiglons,19,Pierre Manga,-,AMR,-,20,COD,Non-EU,Non-HG,Yes,U21 Exempt,66,77,Right,176,72,12,14,14,12,11,5,6,8,11,12,7,12,12,8,15,13,11,15,2,2,2,2,13,11,17,13,generated,-
Aiglons,30,Julien Mercier,-,ST,AMC,17,FRA,EU,HGC,Yes,U21 Exempt,66,81,Left,191,93,14,10,11,13,6,4,4,12,11,13,6,12,15,12,12,12,11,11,2,2,2,2,13,14,10,14,generated,-
Aiglons,25,Adrien Bertrand,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,65,81,Right,181,74,2,11,5,9,2,3,3,4,11,10,16,10,11,10,7,9,12,11,12,12,15,12,13,2,2,12,generated,-
Aiglons,31,Jérémy Royer,-,MC,-,19,FRA,EU,HGN,Yes,U21 Exempt,65,78,Right,181,78,7,14,12,13,9,10,11,8,14,14,10,14,13,11,12,14,12,13,2,2,2,2,14,12,11,14,generated,-
Aiglons,32,Bastien Baudry,-,ST,-,20,FRA,EU,HGC,Yes,U21 Exempt,66,76,Right,181,77,14,11,11,12,7,7,5,15,10,10,6,12,11,9,14,11,14,9,2,2,2,2,14,14,12,13,generated,-
```

### Rouge et Noir (Stade Rennais FC 1901)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Rouge et Noir,1,Yassine Brahimi,-,GK,-,31,ALG,Non-EU,Non-HG,No,Registered,73,73,Left,196,93,2,11,4,9,2,3,3,4,11,13,13,11,15,10,10,9,14,13,15,15,15,14,16,2,2,13,generated,-
Rouge et Noir,3,Corentin Vidal,-,DL,-,26,FRA,EU,HGC,No,Registered,74,74,Left,183,78,8,12,13,12,15,15,13,13,13,13,14,15,13,10,15,16,14,14,2,2,2,2,13,12,11,13,generated,capped by band
Rouge et Noir,4,Xander Michiels,-,DC,DR,21,BEL,EU,Non-HG,Yes,U21 Exempt,73,83,Right,186,84,2,15,8,10,6,16,17,17,10,18,16,14,13,12,10,15,15,13,2,2,2,2,14,6,5,14,generated,-
Rouge et Noir,5,Paul Atangana,-,DC,DL/DM,32,CMR,Non-EU,Non-HG,No,Registered,74,74,Right,189,85,9,13,9,14,6,15,13,16,11,17,14,15,14,11,13,14,16,12,2,2,2,2,16,7,7,17,generated,capped by band
Rouge et Noir,2,Afonso Domingues,-,DR,MR/WBR,26,POR,EU,Non-HG,No,Registered,71,72,Left,177,75,7,13,14,13,12,14,13,11,11,13,14,15,13,13,14,14,13,13,2,2,2,2,15,15,11,15,generated,-
Rouge et Noir,6,Mathias Jacobs,-,DM,-,25,BEL,EU,Non-HG,No,Registered,74,74,Right,182,81,8,13,14,12,7,14,13,12,14,16,14,15,14,9,13,15,14,15,2,2,2,2,16,12,9,15,generated,capped by band
Rouge et Noir,8,Mehdi Amrani,-,MC,-,25,MAR,Non-EU,Non-HG,No,Registered,69,70,Left,179,78,8,13,15,13,10,11,11,9,12,16,11,14,14,10,12,14,13,12,2,2,2,2,13,11,12,15,generated,-
Rouge et Noir,10,Florian Desmet,-,MC,-,27,BEL,EU,Non-HG,No,Registered,72,75,Right,182,83,10,14,15,13,9,14,11,11,15,14,12,15,14,11,11,15,12,14,2,2,2,2,15,13,11,14,generated,-
Rouge et Noir,11,Antoine Bellanger,-,AML,-,25,FRA,EU,HGC,No,Registered,71,72,Right,178,75,11,12,14,14,13,6,7,7,12,13,8,13,11,8,15,15,10,14,2,2,2,2,14,13,15,12,generated,-
Rouge et Noir,7,Szymon Baran,-,AMR,AMC,29,POL,EU,Non-HG,No,Registered,73,73,Right,183,73,13,12,15,16,11,7,7,8,12,12,7,13,13,9,16,12,11,14,2,2,2,2,13,13,16,13,generated,-
Rouge et Noir,9,Nathan Hamon,-,ST,-,34,FRA,EU,HGC,No,Registered,74,74,Either,186,77,14,11,15,15,8,6,4,13,10,12,7,18,14,10,15,14,12,15,2,2,2,2,15,16,13,15,generated,capped by band
Rouge et Noir,13,Reda Lahlou,-,GK,-,25,MAR,Non-EU,Non-HG,No,Registered,68,68,Right,193,88,2,10,3,9,2,3,3,4,9,15,14,8,14,12,8,9,12,11,14,14,14,13,13,2,2,11,generated,-
Rouge et Noir,23,Marko Šarić,-,DL,DC/ML,26,CRO,EU,Non-HG,No,Registered,66,68,Left,185,86,7,11,11,11,10,13,13,10,11,13,12,13,13,9,13,13,13,13,2,2,2,2,13,10,9,15,generated,-
Rouge et Noir,15,Romain Arnaud,-,DC,-,28,FRA,EU,HGC,No,Registered,68,70,Right,194,93,3,12,8,11,6,13,13,12,9,12,14,15,14,11,13,12,13,10,2,2,2,2,14,7,6,15,generated,-
Rouge et Noir,24,Marc Valdés,-,DC,DM/DL,26,ESP,EU,Non-HG,No,Registered,65,67,Right,189,91,5,12,7,12,6,14,13,12,9,12,16,13,12,11,11,11,14,9,2,2,2,2,14,6,5,13,generated,-
Rouge et Noir,22,Hamza Alaoui,-,DR,WBR/MR,21,MAR,Non-EU,Non-HG,Yes,U21 Exempt,69,80,Left,184,82,8,13,12,12,16,13,14,10,14,13,14,14,15,10,14,15,13,13,2,2,2,2,16,14,10,12,generated,-
Rouge et Noir,30,Corentin Chauvin,-,DM,-,19,FRA,EU,HGC,Yes,U21 Exempt,65,81,Right,179,71,9,13,10,13,8,15,14,10,12,14,14,14,13,12,11,11,12,10,2,2,2,2,12,7,10,14,generated,-
Rouge et Noir,14,Corentin Poirier,-,MC,DM,32,FRA,EU,HGC,No,Registered,67,67,Right,179,75,11,13,14,13,12,12,11,11,14,12,10,13,11,11,14,14,10,12,2,2,2,2,14,9,11,14,generated,-
Rouge et Noir,17,Nathan Fabre,-,AMC,-,24,FRA,EU,HGC,No,Registered,69,75,Right,185,80,10,12,13,14,13,10,9,8,14,12,9,15,12,10,13,13,10,13,2,2,2,2,14,13,13,15,generated,-
Rouge et Noir,21,Kalidou Konaté,-,AML,-,27,GUI,Non-EU,Non-HG,No,Registered,68,71,Left,179,81,13,13,14,10,11,6,7,10,13,13,7,13,13,8,17,12,10,13,2,2,2,2,15,13,15,13,generated,-
Rouge et Noir,19,Bastien Lambert,-,AMR,-,28,FRA,EU,HGC,No,Registered,66,66,Right,176,77,13,11,14,14,16,6,4,9,13,13,8,13,11,10,14,12,11,15,2,2,2,2,11,12,13,13,generated,-
Rouge et Noir,18,Noud Dekker,-,ST,-,33,NED,EU,Non-HG,No,Registered,68,68,Right,189,89,15,12,10,13,6,6,8,14,9,12,7,14,12,10,11,13,14,13,2,2,2,2,11,14,10,14,generated,-
Rouge et Noir,25,Yanis Hamon,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,67,77,Right,188,81,2,12,3,8,2,3,3,4,9,16,13,8,12,11,7,9,12,12,13,12,15,13,13,2,2,11,generated,-
Rouge et Noir,31,Antoine Morin,-,MC,-,19,FRA,EU,HGC,Yes,U21 Exempt,68,84,Right,181,76,10,13,13,13,10,12,12,10,12,14,13,14,14,10,11,12,11,14,2,2,2,2,14,13,13,15,generated,-
Rouge et Noir,32,Dylan Barbier,-,ST,AMR/AMC,18,FRA,EU,HGC,Yes,U21 Exempt,66,76,Right,185,80,12,10,13,14,7,6,6,11,11,11,7,15,12,9,14,11,12,12,2,2,2,2,13,15,10,12,generated,-
```

### Sang et Or (Racing Club de Lens)
**Reputation:** 78 | **CA Band:** 65–74 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Sang et Or,1,Filip Jabłoński,-,GK,-,26,POL,EU,Non-HG,No,Registered,71,72,Right,191,92,2,12,3,10,2,3,3,4,10,13,17,10,14,11,7,8,10,12,14,12,15,13,13,2,2,15,generated,-
Sang et Or,3,Gabriele Longo,-,DL,ML,31,ITA,EU,Non-HG,No,Registered,74,74,Right,183,76,6,11,14,14,12,18,14,12,10,11,15,15,12,10,17,16,14,14,2,2,2,2,14,13,10,16,generated,capped by band
Sang et Or,4,Achraf Belaïd,-,DC,DL/DR,25,ALG,Non-EU,Non-HG,No,Registered,67,68,Right,186,75,4,11,8,10,8,14,15,14,9,14,15,12,13,13,12,9,15,11,2,2,2,2,12,7,4,13,generated,-
Sang et Or,5,Alexis Millet,-,DC,-,31,FRA,EU,HGN,No,Registered,74,74,Right,184,77,4,12,9,14,7,14,16,15,9,16,15,14,15,14,13,14,16,10,2,2,2,2,13,7,5,14,generated,capped by band
Sang et Or,2,Maxime Thys,-,DR,-,34,BEL,EU,Non-HG,No,Registered,70,70,Either,182,79,7,11,12,12,13,16,13,11,12,12,15,14,13,10,15,16,10,14,2,2,2,2,13,12,11,16,generated,-
Sang et Or,6,Drissa Fofana,-,DM,MC,28,CIV,Non-EU,Non-HG,No,Registered,73,75,Right,183,77,8,13,13,14,7,16,15,11,13,14,14,15,15,11,11,17,13,12,2,2,2,2,15,7,10,16,generated,-
Sang et Or,8,Damian Nowicki,-,MC,-,25,POL,EU,Non-HG,No,Registered,72,75,Left,179,76,9,14,15,14,10,12,12,9,14,15,12,15,16,11,11,15,13,13,2,2,2,2,15,12,11,16,generated,-
Sang et Or,10,Tom Gauthier,-,MC,AMC/DM,32,FRA,EU,HGN,No,Registered,71,71,Right,182,80,11,14,12,12,8,12,13,10,13,14,10,15,12,9,13,13,12,14,2,2,2,2,15,11,12,15,generated,-
Sang et Or,11,Jamie Wainwright,-,AML,AMC,24,ENG,Non-EU,Non-HG,No,Registered,71,77,Left,186,82,12,13,15,13,14,8,4,8,14,14,7,12,11,8,13,15,14,14,2,2,2,2,11,14,14,13,generated,-
Sang et Or,7,Rachid Touati,-,AMR,-,26,ALG,Non-EU,Non-HG,No,Registered,70,73,Left,173,70,13,13,15,13,15,6,8,7,14,11,6,13,11,9,14,10,10,16,2,2,2,2,13,13,13,12,generated,-
Sang et Or,9,Kévin Blanchet,-,ST,-,33,FRA,EU,HGC,No,Registered,74,74,Right,193,85,15,13,14,14,8,5,4,15,12,14,6,12,15,12,14,13,17,13,2,2,2,2,12,15,11,14,generated,capped by band
Sang et Or,13,Mats Meijer,-,GK,-,23,NED,EU,Non-HG,No,Registered,66,68,Right,191,89,2,11,1,8,2,3,3,4,8,15,13,8,13,10,10,9,10,13,16,12,14,12,15,2,2,11,generated,-
Sang et Or,23,Lucas Marchand,-,DL,ML,27,FRA,EU,HGN,No,Registered,65,66,Left,185,75,6,13,10,12,13,13,14,11,9,13,12,14,11,9,16,15,12,15,2,2,2,2,13,11,8,13,generated,-
Sang et Or,15,Florian Lacroix,-,DC,-,32,FRA,EU,HGC,No,Registered,69,69,Right,190,85,4,10,10,12,5,14,15,13,9,13,12,12,13,12,14,15,14,11,2,2,2,2,15,7,4,15,generated,-
Sang et Or,24,Lucas Bouvier,-,DC,DL/DR,28,FRA,EU,HGN,No,Registered,73,74,Right,192,90,4,10,8,10,6,16,13,15,11,15,15,16,13,14,14,14,15,11,2,2,2,2,16,6,5,14,generated,-
Sang et Or,22,Mateusz Kowal,-,DR,WBR,33,POL,EU,Non-HG,No,Registered,68,68,Right,178,73,6,12,12,11,13,12,13,10,13,12,12,13,13,9,14,16,12,16,2,2,2,2,13,11,10,13,generated,-
Sang et Or,14,Krzysztof Kaczmarek,-,DM,-,26,POL,EU,Non-HG,No,Registered,66,69,Right,182,77,7,11,11,12,7,13,12,11,13,13,14,15,13,11,11,14,12,11,2,2,2,2,14,8,6,13,generated,-
Sang et Or,16,Julien Baudry,-,MC,-,24,FRA,EU,HGC,No,Registered,67,74,Either,185,83,8,14,12,15,11,13,11,7,12,13,12,14,13,9,12,14,12,13,2,2,2,2,15,10,9,14,generated,-
Sang et Or,17,Karim Touati,-,AMC,-,27,ALG,Non-EU,Non-HG,No,Registered,69,69,Left,182,84,14,14,12,15,11,7,8,9,16,13,10,13,13,10,12,14,11,13,2,2,2,2,12,14,14,13,generated,-
Sang et Or,21,Wojciech Lewandowicz,-,AML,-,25,POL,EU,Non-HG,No,Registered,70,72,Left,179,75,11,14,15,15,12,7,6,9,14,11,9,14,12,7,14,13,10,16,2,2,2,2,12,15,14,14,generated,-
Sang et Or,30,Mathis Bertrand,-,AMR,-,20,FRA,EU,HGC,Yes,U21 Exempt,65,70,Right,176,72,13,13,13,13,11,6,6,7,12,12,7,12,10,7,14,13,9,14,2,2,2,2,11,12,13,12,generated,-
Sang et Or,19,Amadou Diarra,-,ST,AML/AMC,26,GUI,Non-EU,Non-HG,No,Registered,65,65,Right,181,77,12,7,13,16,6,5,4,13,11,11,7,13,12,11,15,13,10,14,2,2,2,2,13,15,9,13,generated,-
Sang et Or,25,Quentin Vasseur,-,GK,-,19,FRA,EU,HGC,Yes,U21 Exempt,68,81,Left,189,92,2,12,4,9,2,3,3,4,10,13,13,10,13,11,8,10,11,12,13,14,13,12,12,2,2,10,generated,-
Sang et Or,31,Thomas Bertrand,-,MC,-,18,FRA,EU,HGC,Yes,U21 Exempt,68,78,Right,180,77,9,14,12,15,10,13,10,12,13,13,13,14,13,10,12,13,9,13,2,2,2,2,14,11,11,13,generated,-
Sang et Or,32,Nolan Marchand,-,ST,AMC,17,FRA,EU,HGC,Yes,U21 Exempt,68,82,Either,175,73,14,10,12,12,8,5,5,14,9,12,7,12,14,9,16,13,15,13,2,2,2,2,12,15,12,12,generated,-
```

### Racing Alsace (RC Strasbourg Alsace)
**Reputation:** 72 | **CA Band:** 61–70 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Racing Alsace,1,Ilyas Rahmani,-,GK,-,31,MAR,Non-EU,Non-HG,No,Registered,68,68,Left,191,95,2,10,3,9,2,3,3,4,11,12,11,10,14,10,6,8,12,12,13,15,15,16,14,2,2,11,generated,-
Racing Alsace,3,Mamadou Sagna,-,DL,WBL/ML,27,GUI,Non-EU,Non-HG,No,Registered,68,71,Left,177,75,5,11,10,15,12,13,13,12,11,13,13,14,13,10,14,14,13,13,2,2,2,2,14,12,8,14,generated,-
Racing Alsace,4,Oliver Jørgensen,-,DC,DM,24,DEN,EU,Non-HG,No,Registered,68,71,Right,198,98,3,10,8,11,5,14,14,14,8,13,14,12,10,10,10,12,15,11,2,2,2,2,13,8,3,14,generated,-
Racing Alsace,5,Gianluca Leone,-,DC,DM,29,ITA,EU,Non-HG,No,Registered,68,68,Right,180,70,3,11,8,12,6,14,15,14,8,13,14,16,13,12,10,11,15,8,2,2,2,2,12,8,5,13,generated,-
Racing Alsace,2,Leonardo Silvestri,-,DR,-,23,ITA,EU,Non-HG,No,Registered,65,72,Right,176,69,7,11,10,9,11,12,12,9,11,13,14,14,10,10,13,13,12,12,2,2,2,2,15,10,10,14,generated,-
Racing Alsace,6,Cláudio Amaral,-,DM,-,33,POR,EU,Non-HG,No,Registered,67,67,Left,190,87,7,13,10,13,8,15,13,12,10,15,14,16,14,11,13,12,12,12,2,2,2,2,15,10,9,14,generated,-
Racing Alsace,8,Axel Guérin,-,MC,-,31,FRA,EU,HGN,No,Registered,66,66,Left,187,84,11,14,13,13,11,12,11,10,15,14,13,14,12,11,12,13,11,11,2,2,2,2,14,10,11,13,generated,-
Racing Alsace,10,Guillaume Lacroix,-,MC,DM,36,FRA,EU,HGC,No,Registered,69,69,Right,180,75,10,12,14,16,7,12,11,10,17,13,13,14,14,10,11,14,11,12,2,2,2,2,15,14,11,15,generated,-
Racing Alsace,11,Boubacar Diakité,-,AML,-,25,SEN,Non-EU,Non-HG,No,Registered,70,73,Right,172,65,12,14,14,13,12,5,6,6,13,11,8,13,11,8,14,13,8,15,2,2,2,2,12,13,14,14,generated,capped by band
Racing Alsace,7,Lennert Stevens,-,AMR,-,27,BEL,EU,Non-HG,No,Registered,70,73,Right,188,85,10,12,15,14,13,6,6,6,13,12,7,12,13,9,14,12,13,15,2,2,2,2,11,16,14,12,generated,capped by band
Racing Alsace,9,Brahim Zerrouki,-,ST,-,28,ALG,Non-EU,Non-HG,No,Registered,69,70,Right,180,78,13,10,13,13,7,4,4,13,10,14,7,14,13,9,14,14,14,15,2,2,2,2,12,14,11,11,generated,-
Racing Alsace,13,Niklas Krause,-,GK,-,27,GER,EU,Non-HG,No,Registered,64,66,Right,190,89,2,10,5,9,2,3,3,4,8,12,14,9,14,10,9,7,11,13,14,13,13,14,14,2,2,14,generated,-
Racing Alsace,23,Senne Dumont,-,DL,DC,21,BEL,EU,Non-HG,Yes,U21 Exempt,66,78,Left,190,82,5,13,10,12,12,14,13,10,11,12,14,13,13,8,14,16,13,11,2,2,2,2,13,10,10,15,generated,-
Racing Alsace,15,Valentin Perrot,-,DC,DR,28,FRA,EU,HGN,No,Registered,62,62,Left,183,79,5,10,10,11,4,14,11,13,9,11,15,10,14,10,11,12,14,9,2,2,2,2,12,8,6,10,generated,-
Racing Alsace,24,Kévin Bellanger,-,DC,-,24,FRA,EU,HGC,No,Registered,68,75,Right,190,82,4,12,9,13,5,13,14,16,9,14,14,13,12,11,11,12,15,12,2,2,2,2,15,5,5,15,generated,-
Racing Alsace,22,Rayan Hamon,-,DR,MR/WBR,27,FRA,EU,HGN,No,Registered,63,66,Right,181,77,6,12,11,12,12,12,12,11,13,11,10,11,12,10,13,13,10,12,2,2,2,2,11,9,8,15,generated,-
Racing Alsace,14,Samuel Mohammed,-,DM,-,24,NGA,Non-EU,Non-HG,No,Registered,63,68,Right,184,78,5,11,10,10,5,12,12,9,11,16,11,13,11,10,10,15,13,12,2,2,2,2,15,9,8,15,generated,-
Racing Alsace,16,Maxime Baudry,-,MC,-,27,FRA,EU,HGC,No,Registered,65,65,Either,182,71,9,14,14,13,12,11,12,8,12,13,12,14,14,11,12,13,12,11,2,2,2,2,12,12,10,14,generated,-
Racing Alsace,17,Youssef Djebbar,-,AMC,-,25,ALG,Non-EU,Non-HG,No,Registered,70,70,Right,180,77,13,15,14,17,12,7,8,8,13,18,8,15,13,9,13,13,11,13,2,2,2,2,13,14,14,15,generated,capped by band
Racing Alsace,21,Guillaume Gaillard,-,AML,-,25,FRA,EU,HGN,No,Registered,62,63,Right,181,79,10,11,15,12,11,7,6,8,11,10,6,11,12,8,13,11,12,11,2,2,2,2,12,12,11,12,generated,-
Racing Alsace,30,Lucas Perrot,-,AMR,-,19,FRA,EU,HGC,Yes,U21 Exempt,62,71,Right,181,78,9,13,14,13,12,6,6,7,11,12,8,11,10,9,15,11,9,15,2,2,2,2,12,13,15,12,generated,-
Racing Alsace,19,Thomas Thys,-,ST,AML,24,BEL,EU,Non-HG,No,Registered,64,70,Right,180,78,15,12,13,10,8,5,4,11,11,12,5,13,13,10,13,11,13,11,2,2,2,2,13,14,11,13,generated,-
Racing Alsace,25,Gaëtan Baudry,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,64,78,Right,198,92,2,10,6,10,2,3,3,4,8,14,14,9,11,9,7,8,12,11,13,11,11,12,13,2,2,13,generated,-
Racing Alsace,31,Alexis Fabre,-,MC,-,18,FRA,EU,HGC,Yes,U21 Exempt,64,73,Right,183,79,10,15,14,14,10,11,11,11,13,11,11,12,11,9,12,15,12,13,2,2,2,2,15,12,12,15,generated,-
Racing Alsace,32,Hugo Noël,-,ST,-,17,FRA,EU,HGC,Yes,U21 Exempt,61,76,Either,181,77,12,10,11,13,6,6,4,11,8,12,5,11,11,8,12,12,13,12,2,2,2,2,11,13,12,13,generated,-
```

### Pirates (Stade Brestois 29)
**Reputation:** 70 | **CA Band:** 60–69 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Pirates,1,Riccardo Silvestri,-,GK,-,33,ITA,EU,Non-HG,No,Registered,68,68,Right,189,87,2,12,3,9,2,3,3,4,13,13,14,10,13,11,9,10,11,12,13,13,14,12,14,2,2,13,generated,-
Pirates,3,Arthur Van Acker,-,DL,ML,27,BEL,EU,Non-HG,No,Registered,69,70,Left,185,83,6,13,11,13,12,14,14,14,11,11,13,14,15,8,15,13,13,13,2,2,2,2,13,12,12,14,generated,capped by band
Pirates,4,Sékou Diabaté,-,DC,-,28,SEN,Non-EU,Non-HG,No,Registered,67,70,Right,187,81,3,11,9,12,7,15,14,14,7,12,12,14,12,11,11,13,13,10,2,2,2,2,12,8,5,13,generated,-
Pirates,5,Bastien Millet,-,DC,-,24,FRA,EU,HGC,No,Registered,69,76,Right,189,86,4,12,8,12,5,13,16,16,12,15,16,13,13,12,13,12,15,10,2,2,2,2,15,6,5,13,generated,capped by band
Pirates,2,Kalidou Bamba,-,DR,WBR,36,SEN,Non-EU,Non-HG,No,Registered,67,67,Right,183,79,7,12,13,15,13,13,13,11,10,12,14,15,11,10,13,13,12,13,2,2,2,2,15,11,9,17,generated,-
Pirates,6,Karim Touré,-,DM,-,28,CIV,Non-EU,Non-HG,No,Registered,69,69,Right,176,70,7,13,9,12,9,14,13,10,13,13,14,14,14,10,12,14,12,14,2,2,2,2,15,10,10,14,generated,capped by band
Pirates,8,Romain Noël,-,MC,-,28,FRA,EU,Non-HG,No,Registered,66,68,Right,180,74,9,13,12,13,12,12,10,8,14,12,10,14,13,9,11,13,10,13,2,2,2,2,12,10,12,15,generated,-
Pirates,10,Gaëtan Bellanger,-,MC,DM/AMC,34,FRA,EU,HGC,No,Registered,69,69,Right,186,81,9,15,10,13,11,12,12,9,15,14,11,14,13,10,12,13,12,13,2,2,2,2,14,11,14,14,generated,capped by band
Pirates,11,Samuel Onana,-,AML,ST/ML,31,CMR,Non-EU,Non-HG,No,Registered,67,67,Left,185,79,13,12,14,13,9,6,6,7,13,13,6,13,12,9,15,12,10,10,2,2,2,2,12,13,11,12,generated,-
Pirates,7,Stefano Rossetti,-,AMR,-,25,ITA,EU,Non-HG,No,Registered,68,68,Right,173,71,12,12,16,13,12,7,7,7,11,9,7,11,14,8,13,13,12,14,2,2,2,2,14,15,16,14,generated,-
Pirates,9,Steve Mbarga,-,ST,-,25,COD,Non-EU,Non-HG,No,Registered,66,67,Right,188,84,13,9,13,13,8,6,5,13,12,10,5,10,12,9,14,12,12,11,2,2,2,2,13,14,9,14,generated,-
Pirates,13,Hugo Sauvage,-,GK,-,22,FRA,EU,HGC,No,Registered,60,64,Right,192,98,2,9,3,9,2,3,3,4,8,13,12,7,10,9,8,6,10,12,10,11,13,13,13,2,2,10,generated,-
Pirates,23,Oskar Sikora,-,DL,-,19,POL,EU,Non-HG,Yes,U21 Exempt,64,73,Right,185,76,6,14,12,11,13,12,14,11,8,11,12,13,10,10,12,13,13,11,2,2,2,2,10,10,10,14,generated,-
Pirates,15,Damien Rousseau,-,DC,-,27,FRA,EU,HGC,No,Registered,60,60,Right,186,75,5,11,10,12,6,12,12,13,7,13,13,13,13,9,11,12,14,11,2,2,2,2,13,8,5,12,generated,-
Pirates,24,Yannick Vandenberghe,-,DC,DL,23,BEL,EU,Non-HG,No,Registered,62,67,Right,186,81,5,10,9,11,6,15,13,14,8,12,16,11,12,10,12,12,15,10,2,2,2,2,13,6,4,13,generated,-
Pirates,22,Hugo Baudry,-,DR,WBR,22,FRA,EU,HGC,No,Registered,63,70,Right,183,77,6,10,12,11,12,13,14,10,10,11,13,14,10,10,14,12,12,13,2,2,2,2,13,12,10,13,generated,-
Pirates,30,Rayan Royer,-,DM,MC/DC,21,FRA,EU,HGC,Yes,U21 Exempt,63,70,Right,182,83,7,13,12,12,7,12,12,8,12,12,10,14,13,9,12,13,11,12,2,2,2,2,12,9,9,15,generated,-
Pirates,14,Cláudio Sampaio,-,MC,-,26,POR,EU,Non-HG,No,Registered,61,62,Right,177,73,8,12,10,14,8,11,10,8,14,13,12,12,14,10,13,13,12,12,2,2,2,2,11,11,10,15,generated,-
Pirates,17,Soufiane Guerfi,-,AMC,AMR,24,ALG,Non-EU,Non-HG,No,Registered,60,62,Right,183,85,9,12,11,12,11,8,7,7,13,11,9,11,11,9,11,12,10,12,2,2,2,2,13,11,13,11,generated,-
Pirates,21,Corentin Bellanger,-,AML,-,27,FRA,EU,Non-HG,No,Registered,62,62,Left,176,74,12,10,15,15,12,4,4,7,13,11,8,13,11,8,14,12,11,13,2,2,2,2,12,14,14,12,generated,-
Pirates,19,Noah Michiels,-,AMR,AMC/ST,28,BEL,EU,Non-HG,No,Registered,65,67,Right,175,72,12,12,15,16,12,6,6,8,11,12,7,11,12,10,13,13,9,14,2,2,2,2,11,14,15,14,generated,-
Pirates,18,Maxime Bellanger,-,ST,-,28,FRA,EU,HGC,No,Registered,61,63,Either,190,86,12,10,11,13,9,6,3,12,12,11,6,13,11,7,13,12,13,11,2,2,2,2,12,15,9,11,generated,-
Pirates,25,Nathan Colin,-,GK,-,20,FRA,EU,HGC,Yes,U21 Exempt,61,66,Right,193,90,2,9,2,7,2,3,3,4,9,11,12,7,12,8,5,8,11,11,11,12,12,12,13,2,2,11,generated,-
Pirates,31,Julien Hamon,-,MC,-,21,FRA,EU,Non-HG,Yes,U21 Exempt,62,71,Right,175,68,8,12,12,12,11,12,10,8,12,13,11,12,13,12,12,13,9,10,2,2,2,2,14,9,11,16,generated,-
Pirates,32,Adrien Bellanger,-,ST,-,21,FRA,EU,HGC,Yes,U21 Exempt,60,67,Right,184,83,12,8,10,13,7,6,4,12,10,11,6,12,10,7,12,11,12,10,2,2,2,2,12,13,10,10,generated,-
```

### Violets (Toulouse FC)
**Reputation:** 68 | **CA Band:** 58–67 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Violets,1,Anthony Vasseur,-,GK,-,31,FRA,EU,HGN,No,Registered,61,61,Left,192,90,2,10,3,9,2,3,3,4,10,11,13,10,11,9,7,7,11,11,12,13,12,14,12,2,2,11,generated,-
Violets,3,Samuel Lawal,-,DL,-,25,NGA,Non-EU,Non-HG,No,Registered,66,68,Left,186,84,5,12,13,13,13,12,12,11,10,13,12,14,12,11,15,13,11,12,2,2,2,2,14,10,9,14,generated,-
Violets,4,Thomas Pichon,-,DC,-,26,FRA,EU,HGN,No,Registered,62,62,Either,193,92,5,11,9,11,5,13,12,14,12,13,14,11,9,10,12,12,13,9,2,2,2,2,13,6,6,12,generated,-
Violets,5,Abdelhak Meziane,-,DC,-,27,ALG,Non-EU,Non-HG,No,Registered,62,64,Either,192,97,5,11,8,10,6,12,12,11,8,11,12,13,12,9,13,10,13,11,2,2,2,2,12,8,5,11,generated,-
Violets,2,Emanuele Barone,-,DR,DC/WBR,26,ITA,EU,Non-HG,No,Registered,67,70,Left,189,86,6,10,12,12,14,13,16,10,10,11,17,15,13,9,16,14,12,15,2,2,2,2,13,11,11,13,generated,capped by band
Violets,6,Jason Hamon,-,DM,DC/MC,26,FRA,EU,HGC,No,Registered,63,64,Right,177,68,5,13,12,13,10,13,14,9,11,14,10,12,14,10,11,13,14,10,2,2,2,2,13,9,9,14,generated,-
Violets,8,Mahamadou Fofana,-,MC,-,33,SEN,Non-EU,Non-HG,No,Registered,64,64,Right,180,80,9,12,13,16,10,12,9,7,11,14,10,15,12,8,12,14,13,11,2,2,2,2,14,11,12,14,generated,-
Violets,10,Axel Aubry,-,MC,-,24,FRA,EU,HGC,No,Registered,63,68,Right,174,74,9,13,11,13,9,9,8,8,13,14,9,12,12,10,11,14,11,12,2,2,2,2,12,11,13,14,generated,-
Violets,11,Rafael Queiroz,-,AML,ST,21,BRA,Non-EU,Non-HG,Yes,U21 Exempt,67,74,Left,176,74,12,11,13,15,12,5,6,6,14,9,7,13,13,7,14,13,12,17,2,2,2,2,11,13,15,14,generated,capped by band
Violets,7,Mahamadou Sylla,-,AMR,-,28,GUI,Non-EU,Non-HG,No,Registered,66,68,Right,180,74,11,12,15,13,10,6,6,10,14,12,4,10,10,7,14,12,8,16,2,2,2,2,13,13,14,12,generated,-
Violets,9,Corentin Aubry,-,ST,-,26,FRA,EU,HGN,No,Registered,67,70,Right,187,79,13,10,10,12,7,6,5,14,9,11,5,13,13,8,14,13,13,14,2,2,2,2,13,15,13,13,generated,capped by band
Violets,13,Jurre Bosman,-,GK,-,28,NED,EU,Non-HG,No,Registered,59,60,Left,198,93,2,9,3,8,2,3,3,4,10,11,13,8,13,10,8,7,10,11,11,12,13,11,11,2,2,9,generated,-
Violets,23,Morten Madsen,-,DL,-,28,DEN,EU,Non-HG,No,Registered,60,62,Either,185,81,5,12,11,11,11,11,12,10,9,10,13,13,14,12,13,14,11,12,2,2,2,2,13,8,8,13,generated,-
Violets,15,Sofiane Guérin,-,DC,DM/DL,22,FRA,EU,HGC,No,Registered,61,65,Right,191,85,6,12,9,10,7,15,10,12,9,14,13,11,11,13,10,10,15,11,2,2,2,2,12,6,7,13,generated,-
Violets,30,Sofiane Bertrand,-,DC,-,18,FRA,EU,Non-HG,Yes,U21 Exempt,61,73,Left,186,88,4,11,9,10,3,15,12,12,9,13,13,11,9,9,9,11,13,11,2,2,2,2,15,5,5,14,generated,-
Violets,22,Enzo Chauvin,-,DR,WBR,29,FRA,EU,HGN,No,Registered,61,61,Right,182,73,8,9,9,12,11,13,13,11,10,10,12,12,11,11,13,12,10,10,2,2,2,2,14,10,11,13,generated,-
Violets,14,Nuno Neves,-,DM,-,27,POR,EU,Non-HG,No,Registered,60,62,Right,181,77,8,12,9,11,8,13,12,10,11,11,12,13,11,9,12,13,12,13,2,2,2,2,12,8,9,12,generated,-
Violets,16,Jason Barbier,-,MC,-,34,FRA,EU,HGC,No,Registered,67,67,Right,180,82,9,15,13,13,10,13,11,9,15,11,11,14,14,9,10,12,12,14,2,2,2,2,12,12,12,14,generated,capped by band
Violets,17,Charlie Dalton,-,AMC,-,21,ENG,Non-EU,Non-HG,Yes,U21 Exempt,58,67,Right,175,65,11,13,12,11,8,7,8,6,11,12,9,12,9,9,11,12,10,13,2,2,2,2,12,12,10,11,generated,-
Violets,21,Giacomo Santoro,-,AML,-,23,ITA,EU,Non-HG,No,Registered,60,64,Left,187,81,11,10,13,13,11,7,5,6,12,8,6,11,11,9,14,11,10,14,2,2,2,2,10,12,14,12,generated,-
Violets,19,Manuel Pellegrini,-,AMR,MR,25,ITA,EU,Non-HG,No,Registered,62,63,Right,178,71,12,13,13,13,8,8,6,6,10,9,6,13,10,8,13,11,10,14,2,2,2,2,12,13,14,10,generated,-
Violets,18,Axel Tessier,-,ST,AMR/AML,27,FRA,EU,HGN,No,Registered,63,66,Right,185,83,14,9,12,9,7,6,3,15,10,10,7,13,14,10,14,12,12,13,2,2,2,2,13,13,9,13,generated,-
Violets,25,Maxime Fabre,-,GK,-,20,FRA,EU,HGC,Yes,U21 Exempt,59,69,Right,185,85,2,9,2,8,2,3,3,4,7,12,12,7,12,12,7,8,11,11,13,13,12,11,11,2,2,12,generated,-
Violets,31,Léo Vidal,-,MC,AMC/DM,19,FRA,EU,HGC,Yes,U21 Exempt,58,68,Left,188,81,7,13,12,11,9,9,9,10,11,12,11,14,11,10,12,12,9,12,2,2,2,2,10,9,10,13,generated,-
Violets,32,Florian Leclerc,-,ST,AMR,18,FRA,EU,HGN,Yes,U21 Exempt,60,71,Right,183,80,11,9,11,11,6,3,5,11,10,9,6,12,11,8,12,12,11,13,2,2,2,2,11,12,11,10,generated,-
```

### Auxerrois (AJ Auxerre)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Auxerrois,1,Baptiste Fournier,-,GK,-,31,FRA,EU,HGC,No,Registered,60,60,Right,191,91,2,7,4,8,2,3,3,4,8,11,13,10,12,11,5,8,11,10,12,13,13,13,11,2,2,11,generated,-
Auxerrois,3,Valentin Colin,-,DL,DC,27,FRA,EU,HGN,No,Registered,61,62,Left,186,87,4,10,9,13,10,11,11,9,10,11,10,12,13,9,11,13,11,12,2,2,2,2,13,11,9,12,generated,-
Auxerrois,4,Enzo Lacroix,-,DC,DL,25,FRA,EU,HGN,No,Registered,62,63,Right,189,82,5,10,7,9,4,13,13,12,8,11,14,12,12,10,11,11,14,9,2,2,2,2,13,5,6,12,generated,-
Auxerrois,5,Mattia Leone,-,DC,DR,25,ITA,EU,Non-HG,No,Registered,61,63,Right,190,89,4,11,8,12,7,12,13,10,10,11,15,11,12,12,13,11,14,10,2,2,2,2,13,4,6,14,generated,-
Auxerrois,2,Loïc Vasseur,-,DR,WBR/DC,36,FRA,EU,HGN,No,Registered,62,62,Right,185,79,6,10,11,12,15,13,15,9,11,11,11,14,12,10,12,14,14,12,2,2,2,2,13,9,9,13,generated,-
Auxerrois,6,Gilles Van Acker,-,DM,-,26,BEL,EU,Non-HG,No,Registered,61,62,Right,181,79,8,13,10,10,7,13,11,9,13,12,14,15,14,8,11,14,10,12,2,2,2,2,12,7,8,13,generated,-
Auxerrois,8,Drissa Coulibaly,-,MC,AMC/DM,24,MLI,Non-EU,Non-HG,No,Registered,63,70,Left,184,81,8,14,12,15,8,11,8,8,12,13,11,13,12,9,12,14,9,11,2,2,2,2,13,10,10,13,generated,capped by band
Auxerrois,10,Antoine Vidal,-,MC,AMC,30,FRA,EU,HGN,No,Registered,61,61,Right,169,69,7,11,12,13,9,10,10,9,12,15,10,14,14,10,10,12,10,12,2,2,2,2,12,12,12,13,generated,-
Auxerrois,11,Siebe Dumont,-,AML,-,28,BEL,EU,Non-HG,No,Registered,62,63,Left,181,77,9,10,15,11,10,6,5,8,11,11,8,13,12,9,13,12,9,13,2,2,2,2,12,13,12,9,generated,-
Auxerrois,7,Kévin Giraud,-,AMR,ST,31,FRA,EU,HGC,No,Registered,62,62,Right,180,81,12,13,12,10,11,5,6,6,11,11,7,10,11,8,12,12,10,13,2,2,2,2,11,12,14,10,generated,-
Auxerrois,9,Paul Tchoua,-,ST,AMC,27,CMR,Non-EU,Non-HG,No,Registered,63,65,Right,185,86,13,9,11,12,9,6,4,10,8,10,8,12,12,10,11,13,13,11,2,2,2,2,11,13,11,13,generated,capped by band
Auxerrois,13,Leandro Nogueira,-,GK,-,27,POR,EU,Non-HG,No,Registered,57,57,Right,191,90,2,8,5,7,2,3,3,4,9,11,15,7,12,9,9,6,11,12,11,10,11,10,14,2,2,10,generated,-
Auxerrois,23,Alexis Tessier,-,DL,-,25,FRA,EU,HGC,No,Registered,55,57,Left,185,90,6,9,8,12,9,12,10,8,10,10,10,13,11,7,12,14,9,10,2,2,2,2,11,10,11,10,generated,-
Auxerrois,15,Benjamin Pichon,-,DC,DL,24,FRA,EU,HGN,No,Registered,54,57,Right,190,80,3,11,5,10,6,11,12,13,7,10,13,11,9,10,11,11,12,8,2,2,2,2,8,6,6,10,generated,-
Auxerrois,30,Yoann Vidal,-,DC,-,18,FRA,EU,HGC,Yes,U21 Exempt,54,64,Right,188,83,2,10,7,9,4,12,13,13,11,9,12,12,11,9,9,11,13,9,2,2,2,2,12,6,3,10,generated,-
Auxerrois,22,Landry Atangana,-,DR,-,27,CMR,Non-EU,Non-HG,No,Registered,55,56,Right,179,74,5,11,12,10,11,12,11,11,10,9,9,14,11,8,12,13,11,11,2,2,2,2,10,11,6,12,generated,-
Auxerrois,14,Ikenna Ibrahim,-,DM,MC,27,NGA,Non-EU,Non-HG,No,Registered,59,59,Left,179,76,7,12,10,12,8,12,12,8,13,11,11,12,12,10,11,12,11,11,2,2,2,2,10,9,7,14,generated,-
Auxerrois,16,Marcin Jabłoński,-,MC,AMC,26,POL,EU,Non-HG,No,Registered,57,59,Left,177,74,7,13,9,12,8,11,11,10,13,12,11,14,10,10,10,12,10,11,2,2,2,2,10,10,10,13,generated,-
Auxerrois,17,Baptiste Sauvage,-,AMC,-,29,FRA,EU,HGN,No,Registered,60,60,Left,181,73,10,11,14,12,10,10,8,10,13,11,10,11,12,9,9,11,12,12,2,2,2,2,9,12,9,12,generated,-
Auxerrois,21,Adrien Poirier,-,AML,-,30,FRA,EU,HGN,No,Registered,59,59,Left,177,74,11,12,11,12,9,5,4,7,11,10,6,12,12,8,12,10,9,11,2,2,2,2,10,12,11,12,generated,-
Auxerrois,19,Jake Marsden,-,AMR,AMC/ST,21,ENG,Non-EU,Non-HG,Yes,U21 Exempt,54,61,Either,180,75,11,9,11,11,13,5,6,7,10,9,8,9,10,7,12,12,8,11,2,2,2,2,10,12,11,11,generated,-
Auxerrois,18,Yannick Nguema,-,ST,-,29,CMR,Non-EU,Non-HG,No,Registered,56,56,Left,181,82,12,9,11,11,6,5,4,13,8,9,6,13,10,8,13,10,11,11,2,2,2,2,13,14,10,12,generated,-
Auxerrois,25,Enzo Royer,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,56,70,Right,194,98,2,11,3,8,2,3,3,4,9,9,12,8,10,8,5,7,8,11,14,11,11,12,11,2,2,11,generated,-
Auxerrois,31,Quentin Sauvage,-,MC,-,18,FRA,EU,HGC,Yes,U21 Exempt,54,65,Right,180,82,7,11,11,12,9,9,10,7,12,13,9,12,11,8,11,11,8,11,2,2,2,2,12,8,10,11,generated,-
Auxerrois,32,Lucas Renaud,-,ST,AMR,19,FRA,EU,HGN,Yes,U21 Exempt,57,66,Right,189,84,12,10,10,12,7,4,6,11,8,11,6,12,9,9,11,10,13,13,2,2,2,2,11,11,9,10,generated,-
```

### Merlus (FC Lorient)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Merlus,1,Nabil Chakir,-,GK,-,33,MAR,Non-EU,Non-HG,No,Registered,63,63,Right,192,91,2,10,3,8,2,3,3,4,8,11,14,8,12,8,7,10,11,12,14,13,13,12,13,2,2,12,generated,capped by band
Merlus,3,Nelson Vilaça,-,DL,-,28,POR,EU,Non-HG,No,Registered,61,64,Left,182,76,7,11,10,8,13,11,11,10,9,13,13,13,13,8,12,12,14,10,2,2,2,2,12,11,9,13,generated,-
Merlus,4,Issa Cissé,-,DC,DR,32,MLI,Non-EU,Non-HG,No,Registered,63,63,Right,189,76,6,11,9,11,5,15,14,13,7,14,14,13,11,11,9,12,14,9,2,2,2,2,13,6,4,15,generated,capped by band
Merlus,5,Jérémy Brunet,-,DC,-,26,FRA,EU,HGN,No,Registered,62,65,Right,185,76,3,11,7,11,5,12,14,12,8,11,11,13,13,11,11,13,13,11,2,2,2,2,13,7,6,12,generated,-
Merlus,2,Loïc Lambert,-,DR,DC,29,FRA,EU,HGN,No,Registered,58,58,Right,180,78,5,10,11,10,11,12,13,10,9,9,12,14,9,9,13,11,10,12,2,2,2,2,10,8,10,13,generated,-
Merlus,6,Anthony Guérin,-,DM,-,28,FRA,EU,HGN,No,Registered,63,66,Right,176,70,6,9,12,12,5,14,12,9,9,11,12,14,11,10,10,13,13,11,2,2,2,2,14,9,10,16,generated,capped by band
Merlus,8,Kamil Zieliński,-,MC,-,24,POL,EU,Non-HG,No,Registered,63,69,Right,177,75,8,12,12,14,10,11,11,11,13,12,12,11,12,10,13,12,11,11,2,2,2,2,14,10,8,13,generated,capped by band
Merlus,10,Siebe Vandenberghe,-,MC,DM,28,BEL,EU,Non-HG,No,Registered,62,65,Right,174,69,9,11,11,13,8,13,10,8,14,14,12,15,12,9,10,11,9,12,2,2,2,2,12,12,12,16,generated,-
Merlus,11,Julien Vasseur,-,AML,AMC,28,FRA,EU,HGC,No,Registered,59,59,Left,181,74,10,10,12,8,10,6,4,8,9,8,6,10,12,7,14,11,9,14,2,2,2,2,10,13,11,12,generated,-
Merlus,7,Alex Azevedo,-,AMR,-,22,BRA,Non-EU,Non-HG,No,Registered,60,62,Right,178,72,11,13,14,10,13,7,6,8,10,10,4,12,12,9,12,10,11,12,2,2,2,2,10,10,12,11,generated,-
Merlus,9,André Rebelo,-,ST,-,31,POR,EU,Non-HG,No,Registered,59,59,Right,183,75,13,10,12,13,8,5,3,12,9,9,7,13,9,10,11,13,12,10,2,2,2,2,13,14,10,11,generated,-
Merlus,13,Damien Dufour,-,GK,-,25,FRA,EU,Non-HG,No,Registered,59,60,Right,187,83,2,10,5,8,2,3,3,4,8,12,12,11,10,8,6,8,13,10,11,14,12,13,12,2,2,10,generated,-
Merlus,23,Guillaume Renaud,-,DL,-,23,FRA,EU,HGC,No,Registered,59,63,Left,185,83,6,10,12,11,13,12,12,12,11,12,12,13,11,10,13,14,11,11,2,2,2,2,11,11,8,13,generated,-
Merlus,15,Nathan Pichon,-,DC,DR,27,FRA,EU,HGC,No,Registered,57,59,Left,184,80,7,10,6,9,5,11,13,12,7,11,13,11,11,8,11,9,14,7,2,2,2,2,8,6,6,12,generated,-
Merlus,24,Julien Lemaire,-,DC,DR/DM,33,FRA,EU,HGC,No,Registered,56,56,Right,192,88,4,12,9,11,5,10,12,11,9,12,12,11,10,10,11,10,11,7,2,2,2,2,10,5,6,12,generated,-
Merlus,22,Dylan Lacroix,-,DR,-,28,FRA,EU,HGC,No,Registered,55,56,Left,180,81,6,10,9,11,12,11,10,9,10,12,9,11,10,10,13,13,10,10,2,2,2,2,12,11,11,11,generated,-
Merlus,14,Zak Stanley,-,DM,-,24,ENG,Non-EU,Non-HG,No,Registered,58,65,Left,177,78,7,12,12,9,7,12,10,8,10,10,12,14,13,10,12,11,12,9,2,2,2,2,14,8,8,13,generated,-
Merlus,16,Miguel Izquierdo,-,MC,-,34,ESP,EU,Non-HG,No,Registered,55,55,Right,181,77,9,14,11,9,9,8,7,6,9,11,11,10,11,8,8,11,9,11,2,2,2,2,12,9,11,12,generated,-
Merlus,17,Axel Fabre,-,AMC,-,23,FRA,EU,HGC,No,Registered,56,59,Left,177,74,9,11,11,12,11,9,7,8,13,11,7,11,12,8,14,10,11,14,2,2,2,2,13,11,11,11,generated,-
Merlus,21,Kaan Aksoy,-,AML,-,21,TUR,Non-EU,Non-HG,Yes,U21 Exempt,55,62,Left,185,83,9,10,11,11,9,7,5,7,7,9,5,9,11,7,12,11,9,13,2,2,2,2,12,12,11,12,generated,-
Merlus,19,Boubacar Bamba,-,AMR,AMC,28,MLI,Non-EU,Non-HG,No,Registered,55,55,Right,179,75,11,8,12,12,11,6,5,8,11,11,6,9,11,9,13,10,9,12,2,2,2,2,11,11,12,8,generated,-
Merlus,30,Quentin Perrot,-,ST,-,19,FRA,EU,Non-HG,Yes,U21 Exempt,55,67,Right,188,84,11,9,11,10,7,5,4,12,7,9,5,12,11,10,13,10,8,10,2,2,2,2,10,11,9,11,generated,-
Merlus,25,Mathis Dufour,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,57,69,Left,186,83,2,9,2,8,2,3,3,4,8,12,12,7,11,9,6,7,9,10,11,11,10,9,12,2,2,10,generated,-
Merlus,31,Kévin Vasseur,-,MC,-,17,FRA,EU,HGC,Yes,U21 Exempt,55,65,Right,177,73,9,11,10,10,10,8,7,8,11,13,9,12,9,10,11,7,11,14,2,2,2,2,8,10,11,12,generated,-
Merlus,32,Anthony Fabre,-,ST,AMC,20,FRA,EU,HGC,Yes,U21 Exempt,56,62,Either,183,78,13,11,11,14,7,6,6,9,7,10,6,11,9,10,13,13,11,10,2,2,2,2,12,13,10,12,generated,-
```

### Ciel et Marine (Le Havre AC)
**Reputation:** 62 | **CA Band:** 54–63 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Ciel et Marine,1,Drissa Sangaré,-,GK,-,26,CIV,Non-EU,Non-HG,No,Registered,61,61,Left,194,91,2,11,4,8,2,3,3,4,9,11,14,6,12,10,8,8,11,10,14,11,12,10,13,2,2,13,generated,-
Ciel et Marine,3,Adrien Dufour,-,DL,-,28,FRA,EU,HGN,No,Registered,63,66,Left,186,82,6,13,11,11,11,11,12,11,10,11,13,13,12,8,13,13,12,12,2,2,2,2,14,11,11,13,generated,capped by band
Ciel et Marine,4,Bruno Radić,-,DC,DL,28,CRO,EU,Non-HG,No,Registered,63,65,Right,184,73,4,11,9,10,3,17,16,16,9,12,14,12,13,11,12,12,14,10,2,2,2,2,14,5,5,13,generated,capped by band
Ciel et Marine,5,Ousmane Konaté,-,DC,-,26,SEN,Non-EU,Non-HG,No,Registered,62,65,Right,189,89,6,10,8,10,5,14,12,14,7,12,15,12,11,10,14,12,11,9,2,2,2,2,13,6,4,12,generated,-
Ciel et Marine,2,Sergio Godoy,-,DR,-,26,ARG,Non-EU,Non-HG,No,Registered,62,62,Right,187,84,7,13,13,10,10,17,13,7,10,11,11,13,10,10,13,16,12,11,2,2,2,2,13,10,10,12,generated,-
Ciel et Marine,6,Tom Mercier,-,DM,-,30,FRA,EU,HGN,No,Registered,63,63,Left,181,75,7,12,9,12,6,13,13,11,13,14,13,13,12,10,10,15,13,11,2,2,2,2,13,8,9,13,generated,capped by band
Ciel et Marine,8,Cheick Camara,-,MC,DM,21,SEN,Non-EU,Non-HG,Yes,U21 Exempt,61,72,Right,185,79,7,14,12,11,9,12,10,8,11,13,11,13,11,9,13,12,11,11,2,2,2,2,12,10,9,13,generated,-
Ciel et Marine,10,Thomas Fournier,-,MC,DM/AMC,25,FRA,EU,HGC,No,Registered,63,66,Right,178,78,8,15,12,10,9,10,7,6,10,15,11,14,11,9,12,14,10,13,2,2,2,2,12,11,13,12,generated,capped by band
Ciel et Marine,11,Alfie Hutchins,-,AML,ST,26,ENG,Non-EU,Non-HG,No,Registered,60,60,Left,176,68,11,12,13,13,12,7,4,8,12,12,5,12,11,8,12,12,7,12,2,2,2,2,11,11,13,12,generated,-
Ciel et Marine,7,Anthony Aubry,-,AMR,AMC/ST,27,FRA,EU,Non-HG,No,Registered,62,63,Right,178,75,11,10,13,14,10,5,6,6,12,11,6,11,11,8,13,11,11,14,2,2,2,2,12,11,14,11,generated,-
Ciel et Marine,9,Guilherme Vaz,-,ST,-,28,POR,EU,Non-HG,No,Registered,61,62,Right,179,80,11,10,9,11,7,6,5,11,9,11,6,13,13,10,13,13,13,11,2,2,2,2,13,13,10,12,generated,-
Ciel et Marine,13,Benjamin Gauthier,-,GK,-,21,FRA,EU,HGC,Yes,U21 Exempt,54,64,Left,194,87,2,8,3,6,2,3,3,4,7,11,12,7,10,9,5,6,8,12,11,11,10,8,10,2,2,8,generated,-
Ciel et Marine,23,Axel Vidal,-,DL,ML/WBL,30,FRA,EU,HGC,No,Registered,57,57,Left,187,84,6,13,12,11,11,11,11,11,10,9,10,12,11,7,15,11,9,11,2,2,2,2,12,10,8,12,generated,-
Ciel et Marine,15,Jérémy Guérin,-,DC,-,23,FRA,EU,HGN,No,Registered,54,56,Right,182,75,4,9,7,9,5,11,12,10,7,10,12,11,9,10,10,9,12,9,2,2,2,2,11,6,6,9,generated,-
Ciel et Marine,24,Romain Baudry,-,DC,DR,21,FRA,EU,HGC,Yes,U21 Exempt,54,59,Left,197,95,4,10,8,10,6,12,11,13,6,10,12,11,10,9,11,10,12,9,2,2,2,2,11,6,5,11,generated,-
Ciel et Marine,22,Théo Dufour,-,DR,DC,23,FRA,EU,HGN,No,Registered,56,59,Right,180,76,8,10,11,11,10,13,13,11,10,9,11,11,10,8,12,10,9,10,2,2,2,2,12,9,12,13,generated,-
Ciel et Marine,14,Max Dekker,-,DM,-,25,NED,EU,Non-HG,No,Registered,55,57,Right,181,81,7,10,9,11,6,10,11,10,8,12,12,11,12,10,10,13,9,9,2,2,2,2,11,8,8,14,generated,-
Ciel et Marine,30,Lucas Tessier,-,MC,-,20,FRA,EU,HGC,Yes,U21 Exempt,57,64,Left,178,77,10,12,10,11,8,11,8,7,13,12,10,12,12,8,10,12,10,10,2,2,2,2,12,9,8,12,generated,-
Ciel et Marine,17,Sergio Varela,-,AMC,AML,27,ESP,EU,Non-HG,No,Registered,56,58,Either,185,83,10,11,13,12,9,8,6,6,13,10,8,12,11,10,11,12,10,11,2,2,2,2,12,9,12,11,generated,-
Ciel et Marine,21,Yanis Noël,-,AML,AMC,20,FRA,EU,Non-HG,Yes,U21 Exempt,58,68,Left,182,78,11,10,10,13,10,7,5,5,9,9,4,12,11,8,14,12,8,13,2,2,2,2,11,15,11,9,generated,-
Ciel et Marine,19,Issa Fofana,-,AMR,-,32,GUI,Non-EU,Non-HG,No,Registered,54,54,Right,178,75,9,10,14,10,11,5,6,6,11,11,6,9,8,8,12,9,7,12,2,2,2,2,9,11,9,10,generated,-
Ciel et Marine,18,Valentin Barbier,-,ST,-,25,FRA,EU,HGN,No,Registered,55,56,Left,186,86,11,10,10,12,7,4,4,9,6,8,4,10,10,9,9,8,12,12,2,2,2,2,12,13,9,11,generated,-
Ciel et Marine,25,Romain Aubry,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,55,65,Left,188,82,2,10,5,6,2,3,3,4,8,11,12,7,9,9,7,8,9,12,10,12,12,9,12,2,2,10,generated,-
Ciel et Marine,31,Damien Gauthier,-,MC,DM,18,FRA,EU,HGC,Yes,U21 Exempt,56,66,Right,175,65,10,11,11,10,8,12,8,6,13,11,10,13,11,10,12,11,9,10,2,2,2,2,12,10,10,12,generated,-
Ciel et Marine,32,Enzo Guérin,-,ST,-,19,FRA,EU,HGC,Yes,U21 Exempt,54,64,Right,185,80,12,10,9,10,6,5,5,12,9,9,5,12,11,11,11,8,10,13,2,2,2,2,10,11,8,11,generated,-
```

### Scoïstes (Angers SCO)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Scoïstes,1,Thomas Baudry,-,GK,-,35,FRA,EU,HGN,No,Registered,56,56,Right,187,84,2,9,1,9,2,3,3,4,10,11,12,8,13,8,8,7,10,11,11,11,13,14,12,2,2,9,generated,-
Scoïstes,3,Hakan Erdem,-,DL,-,27,TUR,Non-EU,Non-HG,No,Registered,62,63,Left,190,90,7,12,12,10,11,12,11,11,11,14,11,13,11,8,12,14,10,10,2,2,2,2,13,11,8,13,generated,capped by band
Scoïstes,4,Reda Djebbar,-,DC,-,29,ALG,Non-EU,Non-HG,No,Registered,62,62,Right,185,79,5,11,6,10,5,14,13,15,8,12,15,12,9,11,9,11,15,9,2,2,2,2,13,6,5,12,generated,capped by band
Scoïstes,5,Julián Ortuño,-,DC,DR,28,ESP,EU,Non-HG,No,Registered,58,60,Right,188,91,3,9,8,10,4,12,13,13,8,14,12,13,11,9,13,9,13,11,2,2,2,2,13,6,6,13,generated,-
Scoïstes,2,Henri Vogel,-,DR,DC,30,GER,EU,Non-HG,No,Registered,62,62,Right,182,77,9,10,11,13,12,10,13,10,10,13,12,12,10,9,14,14,13,11,2,2,2,2,14,10,10,14,generated,capped by band
Scoïstes,6,Yoann Marchand,-,DM,-,29,FRA,EU,HGC,No,Registered,61,61,Right,194,90,7,11,11,12,8,14,11,9,13,12,13,15,11,8,12,11,10,12,2,2,2,2,13,10,10,12,generated,-
Scoïstes,8,Seydou Camara,-,MC,AMC,26,SEN,Non-EU,Non-HG,No,Registered,60,61,Left,180,78,12,15,11,14,10,8,10,11,12,12,11,12,11,12,11,12,11,10,2,2,2,2,12,11,9,13,generated,-
Scoïstes,10,Charlie Carver,-,MC,-,24,ENG,Non-EU,Non-HG,No,Registered,58,63,Right,175,68,9,13,11,12,9,11,9,6,15,14,11,12,12,9,11,12,9,10,2,2,2,2,11,11,10,14,generated,-
Scoïstes,11,Valentin Jacquet,-,AML,AMC,30,FRA,EU,HGN,No,Registered,61,61,Left,179,83,13,12,13,12,10,8,5,10,11,12,6,12,12,7,12,11,9,13,2,2,2,2,9,12,13,9,generated,-
Scoïstes,7,Furkan Aydın,-,AMR,-,30,TUR,Non-EU,Non-HG,No,Registered,62,62,Right,172,73,11,9,14,12,9,7,6,6,12,10,7,11,11,7,12,12,10,13,2,2,2,2,11,13,13,11,generated,capped by band
Scoïstes,9,Victor Larsen,-,ST,-,36,DEN,EU,Non-HG,No,Registered,61,61,Right,181,80,13,8,11,11,8,5,4,11,9,11,8,14,11,10,14,12,11,12,2,2,2,2,14,13,11,13,generated,-
Scoïstes,13,Corentin Guérin,-,GK,-,24,FRA,EU,HGC,No,Registered,53,59,Right,188,80,2,8,3,7,2,3,3,4,8,12,11,8,11,9,8,5,11,11,12,12,9,9,9,2,2,9,generated,-
Scoïstes,23,Damien Morin,-,DL,ML,31,FRA,EU,HGN,No,Registered,53,53,Left,177,72,7,12,9,10,7,12,12,8,10,10,9,11,8,8,11,8,11,11,2,2,2,2,9,10,9,12,generated,-
Scoïstes,15,Dylan Noël,-,DC,DL/DR,26,FRA,EU,HGC,No,Registered,57,59,Right,193,91,3,10,5,10,6,11,12,10,7,10,12,11,11,12,11,11,13,7,2,2,2,2,12,5,5,13,generated,-
Scoïstes,24,Adrián Varela,-,DC,-,19,ESP,EU,Non-HG,Yes,U21 Exempt,53,67,Either,179,81,4,8,6,10,4,10,12,11,9,9,11,11,11,10,8,9,10,8,2,2,2,2,12,7,6,13,generated,-
Scoïstes,22,Yoann Aubry,-,DR,-,29,FRA,EU,HGC,No,Registered,55,55,Right,181,70,6,10,9,12,9,11,10,10,11,11,13,11,11,8,13,11,10,10,2,2,2,2,11,10,9,12,generated,-
Scoïstes,30,Léo Barbier,-,DM,-,18,FRA,EU,HGC,Yes,U21 Exempt,53,66,Left,175,74,6,9,9,9,8,12,11,10,10,11,9,10,9,11,10,11,10,9,2,2,2,2,12,7,7,13,generated,-
Scoïstes,14,Damian Olszewski,-,MC,DM,19,POL,EU,Non-HG,Yes,U21 Exempt,53,66,Right,181,81,7,11,9,11,7,10,8,7,11,10,9,12,11,8,9,10,10,11,2,2,2,2,10,7,9,12,generated,-
Scoïstes,17,Reda Khelifa,-,AMC,-,31,ALG,Non-EU,Non-HG,No,Registered,53,53,Left,173,69,10,11,12,11,8,8,5,8,10,12,6,10,12,7,9,10,11,11,2,2,2,2,10,9,11,10,generated,-
Scoïstes,21,Baptiste Morin,-,AML,-,22,FRA,EU,HGN,No,Registered,54,57,Left,176,77,11,10,13,13,11,4,8,7,11,9,7,10,10,5,14,12,8,12,2,2,2,2,10,12,13,10,generated,-
Scoïstes,19,Axel Rousseau,-,AMR,MR,28,FRA,EU,HGC,No,Registered,56,57,Right,175,67,10,10,13,12,11,4,5,5,10,8,7,12,11,7,12,10,9,13,2,2,2,2,10,11,13,13,generated,-
Scoïstes,18,Rayan Colin,-,ST,AMC,22,FRA,EU,HGC,No,Registered,60,63,Left,179,76,11,8,12,12,7,7,5,12,9,10,6,12,13,10,13,10,11,11,2,2,2,2,13,12,9,11,generated,-
Scoïstes,25,Alexis Bouvier,-,GK,-,20,FRA,EU,HGC,Yes,U21 Exempt,53,58,Right,191,90,2,9,2,9,2,3,3,4,8,12,10,8,8,9,6,7,9,9,14,8,11,11,11,2,2,10,generated,-
Scoïstes,31,Adrien Pichon,-,MC,AMC,18,FRA,EU,HGC,Yes,U21 Exempt,55,69,Left,187,77,8,12,12,12,9,8,8,9,11,12,10,12,10,8,10,11,11,12,2,2,2,2,12,9,9,13,generated,-
Scoïstes,32,Sofiane Colin,-,ST,-,21,FRA,EU,HGN,Yes,U21 Exempt,54,60,Right,180,80,10,10,12,9,7,4,1,9,8,10,5,11,11,9,11,12,11,10,2,2,2,2,9,13,9,11,generated,-
```

### Parisiens FC (Paris FC)
**Reputation:** 60 | **CA Band:** 53–62 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Parisiens FC,1,Benedikt Köhler,-,GK,-,35,GER,EU,Non-HG,No,Registered,61,61,Right,192,83,2,11,4,8,2,3,3,4,9,11,13,9,12,10,8,7,10,10,13,12,13,12,12,2,2,10,generated,-
Parisiens FC,3,Abdelhak Larbi,-,DL,ML,29,ALG,Non-EU,Non-HG,No,Registered,61,61,Left,184,75,4,12,11,9,10,11,11,10,10,12,13,11,10,7,13,12,11,10,2,2,2,2,12,10,9,11,generated,-
Parisiens FC,4,Eric Bassogog,-,DC,DL,25,COD,Non-EU,Non-HG,No,Registered,60,61,Right,191,85,4,12,7,9,6,12,12,15,8,13,15,12,13,10,12,11,12,11,2,2,2,2,13,7,6,13,generated,-
Parisiens FC,5,Yanis Perrot,-,DC,DM,22,FRA,EU,HGN,No,Registered,59,63,Right,192,93,5,12,6,10,7,12,12,11,8,12,13,10,10,8,12,13,13,10,2,2,2,2,13,5,5,13,generated,-
Parisiens FC,2,Dylan Arnaud,-,DR,-,27,FRA,EU,HGC,No,Registered,60,61,Right,179,76,7,11,10,11,10,12,11,8,12,12,11,14,12,8,14,11,11,11,2,2,2,2,13,9,8,12,generated,-
Parisiens FC,6,Efe Uçar,-,DM,-,23,TUR,Non-EU,Non-HG,No,Registered,60,65,Left,190,91,7,13,7,12,8,14,13,9,11,13,12,13,13,10,10,15,12,11,2,2,2,2,13,7,8,12,generated,-
Parisiens FC,8,Jason Pichon,-,MC,AMC,31,FRA,EU,HGN,No,Registered,59,59,Right,172,73,8,13,10,9,7,9,10,10,13,14,10,13,10,10,10,12,8,10,2,2,2,2,14,9,10,14,generated,-
Parisiens FC,10,Lucas Fournier,-,MC,-,27,FRA,EU,HGN,No,Registered,62,63,Right,185,82,8,14,10,15,8,10,9,9,14,12,11,13,12,11,11,13,11,10,2,2,2,2,13,10,12,15,generated,capped by band
Parisiens FC,11,Sunday Ibrahim,-,AML,-,30,NGA,Non-EU,Non-HG,No,Registered,62,62,Left,174,69,10,12,13,12,9,6,5,7,14,12,6,10,9,8,14,11,8,13,2,2,2,2,10,13,13,12,generated,capped by band
Parisiens FC,7,Nathan Royer,-,AMR,-,27,FRA,EU,HGN,No,Registered,58,59,Either,179,78,11,8,13,13,10,7,4,7,9,10,7,11,11,7,12,10,9,13,2,2,2,2,11,12,12,10,generated,-
Parisiens FC,9,Aron Schouten,-,ST,AML,24,NED,EU,Non-HG,No,Registered,62,68,Left,175,73,11,10,12,10,9,4,4,12,9,12,5,14,12,9,12,13,13,12,2,2,2,2,12,13,10,10,generated,capped by band
Parisiens FC,13,Corentin Royer,-,GK,-,28,FRA,EU,HGC,No,Registered,56,59,Right,190,89,2,9,4,8,2,3,3,4,9,13,12,8,12,10,8,7,11,11,9,11,12,9,9,2,2,10,generated,-
Parisiens FC,23,Hugo Gauthier,-,DL,-,27,FRA,EU,HGN,No,Registered,55,58,Left,182,84,5,10,10,10,12,13,10,9,11,10,12,11,10,8,12,11,11,10,2,2,2,2,10,9,10,10,generated,-
Parisiens FC,15,Pedro Matos,-,DC,-,25,POR,EU,Non-HG,No,Registered,54,57,Right,194,83,6,10,6,10,6,12,10,11,7,11,13,10,9,9,11,10,14,8,2,2,2,2,11,6,6,12,generated,-
Parisiens FC,24,Axel Baudry,-,DC,-,31,FRA,EU,HGC,No,Registered,60,60,Right,192,90,6,11,7,8,6,14,12,13,11,10,13,13,14,10,11,11,12,11,2,2,2,2,14,5,7,12,generated,-
Parisiens FC,22,Gilles Maes,-,DR,-,21,BEL,EU,Non-HG,Yes,U21 Exempt,54,64,Right,176,69,5,9,11,9,11,12,9,8,8,10,10,12,7,8,12,11,10,12,2,2,2,2,12,10,7,12,generated,-
Parisiens FC,14,Bakary Sylla,-,DM,MC/DC,32,GUI,Non-EU,Non-HG,No,Registered,54,54,Left,188,81,6,10,11,10,7,11,12,8,8,11,11,14,10,9,9,12,11,8,2,2,2,2,11,7,8,13,generated,-
Parisiens FC,16,Baptiste Gaillard,-,MC,-,33,FRA,EU,HGC,No,Registered,55,55,Right,179,70,8,13,11,11,9,10,8,9,12,12,8,13,9,9,12,10,9,11,2,2,2,2,11,10,13,12,generated,-
Parisiens FC,17,Riccardo Conti,-,AMC,AMR/AML,30,ITA,EU,Non-HG,No,Registered,54,54,Right,177,77,12,12,10,11,10,7,7,9,11,9,7,10,11,9,11,11,9,13,2,2,2,2,11,12,10,13,generated,-
Parisiens FC,21,Souleymane Diabaté,-,AML,-,29,GUI,Non-EU,Non-HG,No,Registered,54,54,Left,183,79,7,12,12,11,10,6,6,7,9,7,5,12,8,7,11,12,8,12,2,2,2,2,9,10,10,11,generated,-
Parisiens FC,30,Anthony Marchand,-,AMR,ST,18,FRA,EU,HGN,Yes,U21 Exempt,55,66,Right,177,78,8,11,10,11,9,5,6,6,11,10,5,11,10,7,12,10,8,12,2,2,2,2,9,10,12,10,generated,-
Parisiens FC,19,Clément Giraud,-,ST,AMC,19,FRA,EU,HGC,Yes,U21 Exempt,55,71,Right,178,77,11,8,9,10,6,4,5,12,11,10,6,12,10,9,11,11,8,9,2,2,2,2,10,13,10,12,generated,-
Parisiens FC,25,Antoine Blanchet,-,GK,-,18,FRA,EU,HGC,Yes,U21 Exempt,53,62,Right,193,92,2,9,4,6,2,3,3,4,8,11,8,7,12,9,6,9,9,10,12,12,13,13,13,2,2,10,generated,-
Parisiens FC,31,Julien Carpentier,-,MC,-,19,FRA,EU,HGC,Yes,U21 Exempt,53,63,Right,191,81,7,11,10,8,7,10,8,6,10,12,10,12,8,11,9,11,10,10,2,2,2,2,11,9,10,11,generated,-
Parisiens FC,32,Bastien Perrot,-,ST,-,20,FRA,EU,HGC,Yes,U21 Exempt,56,63,Right,181,80,12,9,9,12,9,5,2,12,8,11,4,11,13,8,11,11,12,10,2,2,2,2,10,12,9,11,generated,-
```

### Troyens (ES Troyes AC)
**Reputation:** 56 | **CA Band:** 50–59 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Troyens,1,Sékou Ndiaye,-,GK,-,33,SEN,Non-EU,Non-HG,No,Registered,57,57,Right,187,82,2,10,2,8,2,3,3,4,8,10,12,9,11,7,7,8,11,9,14,13,11,11,13,2,2,12,generated,-
Troyens,3,Damien Hamon,-,DL,DC,26,FRA,EU,HGC,No,Registered,58,60,Left,185,84,8,9,10,12,12,12,12,9,10,10,10,12,11,8,13,12,11,13,2,2,2,2,11,10,9,12,generated,-
Troyens,4,Boubacar Sidibé,-,DC,DL,30,MLI,Non-EU,Non-HG,No,Registered,56,56,Left,186,82,6,11,8,9,6,11,13,11,8,10,11,12,10,9,11,10,12,9,2,2,2,2,12,5,5,10,generated,-
Troyens,5,Lennert Declercq,-,DC,DM,28,BEL,EU,Non-HG,No,Registered,56,59,Right,190,80,5,10,11,11,4,10,11,10,8,11,13,12,11,9,9,12,14,8,2,2,2,2,11,5,5,13,generated,-
Troyens,2,Sékou Coulibaly,-,DR,-,32,CIV,Non-EU,Non-HG,No,Registered,55,55,Either,185,70,5,10,8,11,11,11,12,8,11,11,9,14,11,8,13,12,11,10,2,2,2,2,11,10,8,12,generated,-
Troyens,6,Bastien Bertrand,-,DM,-,24,FRA,EU,Non-HG,No,Registered,58,62,Right,183,86,6,12,8,12,8,10,11,10,11,9,11,14,11,9,12,13,13,9,2,2,2,2,12,9,7,13,generated,-
Troyens,8,Clément Renaud,-,MC,-,26,FRA,EU,HGC,No,Registered,53,54,Right,181,77,7,11,10,11,10,10,7,7,10,10,10,11,10,7,10,11,11,11,2,2,2,2,12,9,9,10,generated,-
Troyens,10,Baptiste Hamon,-,MC,-,27,FRA,EU,HGC,No,Registered,59,60,Left,181,76,8,12,10,12,9,11,9,9,12,13,9,12,10,10,11,12,12,12,2,2,2,2,12,10,11,14,generated,capped by band
Troyens,11,Youssouf Bamba,-,AML,-,29,GUI,Non-EU,Non-HG,No,Registered,59,59,Left,188,87,9,8,12,11,11,6,3,6,11,12,6,14,10,11,10,10,9,12,2,2,2,2,11,12,13,12,generated,capped by band
Troyens,7,Corentin Bertrand,-,AMR,-,31,FRA,EU,HGC,No,Registered,59,59,Right,186,91,10,9,12,12,11,5,5,8,11,11,7,10,10,8,14,10,9,13,2,2,2,2,10,13,11,9,generated,capped by band
Troyens,9,Olivier Etame,-,ST,AML,25,CMR,Non-EU,Non-HG,No,Registered,59,61,Right,177,74,12,8,11,11,7,4,3,12,6,12,6,12,11,8,11,12,9,12,2,2,2,2,13,13,9,12,generated,capped by band
Troyens,13,Corentin Noël,-,GK,-,22,FRA,EU,HGN,No,Registered,53,55,Right,192,89,2,8,5,8,2,3,3,4,9,11,10,7,11,8,8,5,11,10,12,11,11,12,10,2,2,11,generated,-
Troyens,23,Valentin Mercier,-,DL,-,30,FRA,EU,HGC,No,Registered,52,52,Left,178,76,6,11,9,10,9,10,12,8,10,11,9,11,9,8,10,10,9,8,2,2,2,2,10,7,9,10,generated,-
Troyens,15,Aitor Montero,-,DC,-,23,ESP,EU,Non-HG,No,Registered,52,55,Right,182,77,3,8,6,8,6,13,11,12,7,10,13,10,11,8,11,11,14,8,2,2,2,2,13,4,7,11,generated,-
Troyens,24,Loïc Lemaire,-,DC,DM,26,FRA,EU,HGN,No,Registered,50,51,Right,193,93,5,10,8,8,4,9,9,12,9,13,12,10,8,10,8,9,11,9,2,2,2,2,8,6,5,9,generated,-
Troyens,22,Filipe Quaresma,-,DR,-,24,POR,EU,Non-HG,No,Registered,54,56,Right,178,73,6,10,10,10,11,12,9,8,11,10,11,13,12,9,12,12,11,10,2,2,2,2,10,9,8,14,generated,-
Troyens,30,Sofiane Barbier,-,DM,-,17,FRA,EU,HGC,Yes,U21 Exempt,52,62,Right,185,83,7,9,8,10,8,12,11,8,8,13,11,13,12,8,10,12,10,8,2,2,2,2,10,7,5,10,generated,-
Troyens,14,Bram Kok,-,MC,AMC,30,NED,EU,Non-HG,No,Registered,50,50,Right,188,86,7,12,9,11,7,10,9,7,9,9,9,10,9,7,10,10,8,9,2,2,2,2,11,8,8,10,generated,-
Troyens,17,Martin Tchoua,-,AMC,-,19,CMR,Non-EU,Non-HG,Yes,U21 Exempt,51,60,Left,176,70,12,9,11,13,9,7,4,8,11,8,8,12,11,9,9,10,9,8,2,2,2,2,11,10,9,11,generated,-
Troyens,21,Dylan Marchand,-,AML,-,19,FRA,EU,HGC,Yes,U21 Exempt,52,67,Left,178,69,10,9,9,13,10,6,3,6,9,8,5,9,10,7,12,10,10,11,2,2,2,2,10,10,11,10,generated,-
Troyens,19,Bas Peeters,-,AMR,MR,28,NED,EU,Non-HG,No,Registered,52,53,Right,177,67,10,8,13,11,9,5,6,7,12,9,6,11,10,6,9,9,10,11,2,2,2,2,8,12,9,11,generated,-
Troyens,18,Leandro Castaño,-,ST,-,27,ESP,EU,Non-HG,No,Registered,55,58,Left,179,72,11,9,12,9,7,4,4,13,8,10,5,11,10,9,12,10,12,11,2,2,2,2,11,14,8,11,generated,-
Troyens,25,Clément Guérin,-,GK,-,19,FRA,EU,HGC,Yes,U21 Exempt,53,69,Right,193,87,2,9,2,6,2,3,3,4,8,11,12,8,11,10,7,7,10,10,11,11,10,12,9,2,2,9,generated,-
Troyens,31,Baptiste Carpentier,-,MC,-,21,FRA,EU,HGC,Yes,U21 Exempt,53,59,Right,180,76,10,10,10,10,7,9,9,6,11,10,9,10,11,8,10,11,8,11,2,2,2,2,10,11,8,11,generated,-
Troyens,32,Rayan Brunet,-,ST,-,20,FRA,EU,HGC,Yes,U21 Exempt,50,57,Right,182,80,9,9,10,10,5,4,6,8,8,8,6,9,8,6,8,9,10,10,2,2,2,2,9,10,10,10,generated,-
```

### Sang et Or du Mans (Le Mans FC)
**Reputation:** 55 | **CA Band:** 50–59 | **Registration Rule:** None

```csv
club,squad_no,name_in_game,inspired_by,position,alt_positions,age,nation,eu_status,hg_status,u21_elig,reg_status,ca,pa,foot,ht_cm,wt_kg,fin,pas,dri,fir,cro,tck,mar,hea,vis,dec,pos,wor,cmp,ldr,pac,sta,str,agi,ref,han,one,kic,ant,otb,fla,tea,confidence,notes
Sang et Or du Mans,1,Florian Rousseau,-,GK,-,28,FRA,EU,HGN,No,Registered,57,60,Right,192,91,2,7,4,5,2,3,3,4,9,8,10,8,12,9,7,9,10,8,11,12,11,9,13,2,2,10,generated,-
Sang et Or du Mans,3,Benjamin Perrot,-,DL,-,36,FRA,EU,HGC,No,Registered,58,58,Left,179,80,6,11,9,12,11,13,10,10,10,9,11,12,11,9,13,13,9,12,2,2,2,2,14,10,8,10,generated,-
Sang et Or du Mans,4,Souleymane Traoré,-,DC,DR,29,CIV,Non-EU,Non-HG,No,Registered,56,56,Right,186,80,4,12,8,8,6,13,13,11,7,12,11,10,10,9,9,10,12,11,2,2,2,2,12,7,4,12,generated,-
Sang et Or du Mans,5,Anthony Jacquet,-,DC,-,34,FRA,EU,HGN,No,Registered,54,54,Right,190,88,3,11,6,10,6,11,12,12,7,10,9,9,11,9,10,11,12,9,2,2,2,2,12,4,6,11,generated,-
Sang et Or du Mans,2,Bastien Poirier,-,DR,-,35,FRA,EU,HGC,No,Registered,57,57,Right,180,67,6,10,12,11,10,12,10,7,9,10,11,12,9,10,12,12,10,14,2,2,2,2,13,10,10,13,generated,-
Sang et Or du Mans,6,Léo Bouvier,-,DM,-,25,FRA,EU,HGC,No,Registered,58,61,Left,183,83,7,13,10,11,7,11,11,10,11,12,13,13,11,8,8,12,12,11,2,2,2,2,12,9,7,13,generated,-
Sang et Or du Mans,8,Tom Bakker,-,MC,DM,24,NED,EU,Non-HG,No,Registered,58,60,Either,182,78,9,11,12,13,8,11,9,9,9,11,10,12,11,8,10,12,9,11,2,2,2,2,12,11,10,12,generated,-
Sang et Or du Mans,10,Wout Segers,-,MC,-,25,BEL,EU,Non-HG,No,Registered,59,62,Left,183,80,8,12,13,11,8,9,10,8,13,10,11,13,13,10,11,11,10,10,2,2,2,2,12,11,11,12,generated,capped by band
Sang et Or du Mans,11,Mamadou Sow,-,AML,-,34,CIV,Non-EU,Non-HG,No,Registered,56,56,Left,182,80,8,10,13,10,11,6,4,7,9,10,5,12,11,7,11,12,10,11,2,2,2,2,10,12,11,10,generated,-
Sang et Or du Mans,7,Yassine Belaïd,-,AMR,AMC/MR,28,ALG,Non-EU,Non-HG,No,Registered,58,59,Right,176,73,10,10,13,11,9,6,6,5,12,11,6,9,10,7,12,10,8,13,2,2,2,2,11,12,10,11,generated,-
Sang et Or du Mans,9,Youssouf Yattara,-,ST,AMR/AMC,30,MLI,Non-EU,Non-HG,No,Registered,58,58,Right,183,78,12,10,10,10,8,4,5,11,10,10,7,14,9,10,11,11,13,12,2,2,2,2,11,13,8,12,generated,-
Sang et Or du Mans,13,Tom Vidal,-,GK,-,31,FRA,EU,HGC,No,Registered,50,50,Right,188,83,2,9,5,7,2,3,3,4,5,10,9,8,9,7,7,8,7,9,12,11,13,9,11,2,2,9,generated,-
Sang et Or du Mans,23,Filip Dujmović,-,DL,-,28,CRO,EU,Non-HG,No,Registered,51,52,Left,186,78,5,8,11,10,10,10,11,9,10,11,11,12,9,7,11,10,11,11,2,2,2,2,10,8,6,8,generated,-
Sang et Or du Mans,15,Maciej Baran,-,DC,DM,30,POL,EU,Non-HG,No,Registered,54,54,Right,193,91,6,9,7,10,7,14,11,12,7,10,12,11,10,9,9,9,12,8,2,2,2,2,12,6,5,12,generated,-
Sang et Or du Mans,24,Alexis Dufour,-,DC,-,21,FRA,EU,HGC,Yes,U21 Exempt,56,63,Left,186,87,5,9,9,9,6,14,12,14,8,11,10,13,10,9,11,9,13,10,2,2,2,2,11,6,4,9,generated,-
Sang et Or du Mans,22,Landry Zambo,-,DR,-,29,CMR,Non-EU,Non-HG,No,Registered,50,50,Right,186,82,7,10,11,10,10,13,7,7,9,9,9,11,11,8,12,12,8,8,2,2,2,2,9,9,7,11,generated,-
Sang et Or du Mans,30,Antoine Colin,-,DM,MC,18,FRA,EU,HGC,Yes,U21 Exempt,51,63,Right,185,86,5,11,10,9,8,12,11,10,10,10,8,11,12,6,10,10,10,10,2,2,2,2,12,7,8,13,generated,-
Sang et Or du Mans,14,Damien Carpentier,-,MC,-,23,FRA,EU,HGC,No,Registered,53,60,Right,182,76,9,11,9,12,8,11,8,9,10,13,9,12,8,8,8,12,9,10,2,2,2,2,12,9,7,10,generated,-
Sang et Or du Mans,17,Anthony Sauvage,-,AMC,-,22,FRA,EU,Non-HG,No,Registered,50,52,Right,179,73,9,10,11,13,9,9,7,7,12,10,8,10,8,8,10,10,11,10,2,2,2,2,10,9,12,10,generated,-
Sang et Or du Mans,21,Romain Tessier,-,AML,ST/AMC,25,FRA,EU,HGC,No,Registered,51,52,Left,180,75,8,9,12,11,10,6,6,7,8,9,3,9,10,8,12,8,12,12,2,2,2,2,10,9,10,9,generated,-
Sang et Or du Mans,19,Bernardo Pinheiro,-,AMR,-,23,POR,EU,Non-HG,No,Registered,54,58,Left,170,71,12,10,12,11,14,6,5,5,10,11,4,10,10,8,11,12,10,13,2,2,2,2,11,10,12,10,generated,-
Sang et Or du Mans,18,Daniel Albuquerque,-,ST,-,28,BRA,Non-EU,Non-HG,No,Registered,54,56,Either,181,74,12,8,9,10,8,5,6,11,8,10,4,12,9,6,9,12,11,11,2,2,2,2,12,13,9,11,generated,-
Sang et Or du Mans,25,Dylan Lambert,-,GK,-,17,FRA,EU,HGC,Yes,U21 Exempt,52,65,Right,188,84,2,9,1,7,2,3,3,4,8,9,10,6,9,9,6,8,11,10,11,10,13,9,11,2,2,11,generated,-
Sang et Or du Mans,31,Lucas Barbier,-,MC,-,21,FRA,EU,HGC,Yes,U21 Exempt,52,60,Right,172,70,8,11,11,12,7,8,6,8,11,10,8,9,11,7,11,11,8,9,2,2,2,2,9,10,9,12,generated,-
Sang et Or du Mans,32,Léo Rousseau,-,ST,-,21,FRA,EU,HGC,Yes,U21 Exempt,53,63,Either,182,73,11,8,9,10,6,5,6,9,9,10,5,11,9,9,10,9,11,9,2,2,2,2,9,10,8,11,generated,-
```
