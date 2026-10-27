"""Fictional name pools for the overseas squad builder, keyed by football nationality.

Pools are deliberately generic. They are meant to look right for the country, not
to reproduce any real player; collisions are checked against the game files by the
builder. Each value is (first names, surnames, optional second-surname style).
"""

def _w(s):
    return [t.replace('_', ' ') for t in s.split()]

ESP = (_w("Adrián Álvaro Andrés Aitor Carlos César Cristian Daniel David Diego Dídac Enrique Fernando Gonzalo Guillermo Héctor Hugo Ismael Ivo Jaime Javier Jesús Joaquín Jorge Julián Leandro Lucas Marc Marcos Mario Martín Mateo Miguel Nacho Nico Óscar Pablo Pedro Rafa Raúl Rubén Samuel Santi Sergio Tomás Unai Víctor Xavi Yeray"),
       _w("Aguilera Alcázar Almeida Arjona Barrios Bermejo Bustos Cabrera Calvo Camacho Cano Casado Castaño Cordero Crespo Escudero Fajardo Ferrer Gallardo Garrido Heredia Ibáñez Izquierdo Lara Lorente Maldonado Marín Medina Montero Naranjo Negrete Olmedo Ortuño Palomo Peláez Quintero Rebollo Robles Rueda Salcedo Sanchís Segura Soriano Tapia Toledo Trujillo Valdés Varela Vidal Zamora"))
BASQUE = (_w("Aitor Ander Aritz Asier Beñat Eneko Gaizka Gorka Haritz Iban Ibon Iker Imanol Iñigo Jon Julen Koldo Markel Mikel Oier Peru Unai Unax Xabier Egoitz Ekain Endika Joseba Josu Kepa Lander Urko"),
          _w("Aldekoa Altuna Aranzabal Arrieta Azkue Barrenetxea Berasategi Etxeberria Elorza Garmendia Goikoetxea Ibarra Iturralde Lasa Larrañaga Mendia Mugika Odriozola Olaizola Otxoa Sagarna Uriarte Urkiola Urrutia Zabala Zubeldia Zubiaurre Artola Bilbao Landa Eizaguirre"))
POR = (_w("André Afonso Bernardo Bruno Carlos Cláudio Daniel Diogo Duarte Eduardo Fábio Filipe Francisco Gonçalo Guilherme Hélder Hugo João Jorge José Leandro Luís Marco Miguel Nelson Nuno Paulo Pedro Rafael Renato Ricardo Rodrigo Rúben Rui Sérgio Tiago Tomás Vasco Vítor"),
       _w("Abreu Alves Amaral Antunes Barbosa Bastos Cardoso Carneiro Coelho Domingues Esteves Fontes Freitas Gaspar Guedes Leite Loureiro Machado Matos Mendes Neves Nogueira Pacheco Peixoto Pinheiro Quaresma Rebelo Ribeiro Sampaio Sequeira Tavares Teixeira Valente Vaz Viana Vilaça"))
FRA = (_w("Adrien Alexis Anthony Antoine Axel Baptiste Benjamin Bastien Clément Corentin Damien Dylan Enzo Florian Gaëtan Guillaume Hugo Jason Jérémy Julien Kévin Léo Loïc Lucas Maxime Mathis Nolan Nathan Quentin Rayan Romain Sofiane Théo Thomas Tom Valentin Yanis Yoann"),
       _w("Arnaud Aubry Barbier Baudry Bellanger Bertrand Blanchet Bouvier Brunet Carpentier Chauvin Colin Dufour Fabre Fournier Gaillard Gauthier Giraud Guérin Hamon Jacquet Lacroix Lambert Leclerc Lemaire Marchand Mercier Millet Morin Noël Perrot Pichon Poirier Renaud Rousseau Royer Sauvage Tessier Vasseur Vidal"))
GER = (_w("Alexander Benedikt Christian Daniel David Dennis Elias Fabian Felix Florian Henri Jannik Jan Jonas Julian Kai Lars Leon Lukas Marcel Marvin Maximilian Moritz Niklas Noah Pascal Patrick Philipp Robin Sebastian Simon Tim Tobias Tom Valentin Yannick"),
       _w("Albrecht Baumann Becker Bergmann Brandt Dietrich Ehrlich Engel Fischer Franke Friedrich Fuchs Gärtner Giesler Haas Hartmann Heinz Herrmann Hofmann Jäger Keller Kessler Köhler Krause Lang Lehmann Maier Neumann Ostermann Pohl Reuter Richter Roth Sauer Scholz Schreiber Seidel Stein Vogel Wagner Weber Winkler Ziegler"))
ITA = (_w("Alessandro Andrea Antonio Davide Diego Edoardo Emanuele Federico Filippo Francesco Gabriele Giacomo Gianluca Giorgio Giovanni Leonardo Lorenzo Luca Manuel Marco Matteo Mattia Michele Nicola Nicolò Paolo Pietro Riccardo Roberto Salvatore Samuele Simone Stefano Tommaso Valerio Vincenzo"),
       _w("Amato Barone Bellini Bianco Bruni Caputo Carbone Cattaneo Colombo Conti Costa De_Angelis De_Luca Fabbri Farina Ferrara Fontana Gallo Gentile Greco Leone Longo Mancini Marino Messina Monti Moretti Orlando Pellegrini Piras Rizzo Rossetti Sala Santoro Serra Silvestri Testa Valentini Villa Zanetti"))
NED = (_w("Aron Bas Bram Daan Dennis Dylan Finn Jasper Jelle Jesse Joost Jordy Jurre Kevin Lars Luuk Mats Max Niels Noud Quinten Ruben Sam Sem Sjoerd Stefan Thijs Tim Tom Tygo Wesley Wouter"),
       _w("Bakker Beekman Bosman Brouwer De_Boer De_Jong De_Vries Dekker Dijkstra Franken Hendriks Jacobs Kok Kuipers Maas Meijer Mulder Peeters Postma Prins Schouten Smit Smits Timmer Van_Dam Van_den_Heuvel Van_Leeuwen Veenstra Verbeek Visser Vos Willems Zijlstra"))
BEL = (_w("Arthur Brent Dries Florian Gilles Hannes Jonas Jorne Kobe Lars Lennert Lucas Maxime Mathias Nicolas Noah Robbe Senne Siebe Simon Thomas Thibault Tibo Wout Yannick Xander"),
       _w("Baert Claes Coppens Declercq De_Smedt Desmet Dumont Gielen Goossens Hermans Jacobs Janssens Lambrecht Maes Michiels Peeters Segers Stevens Thys Van_Acker Van_Damme Vandenberghe Verhaegen Vermeulen Wouters"))
ENG = (_w("Adam Alfie Ben Callum Charlie Connor Dan Danny Elliot Finley Freddie Harry Jack Jake James Jamie Josh Kieran Liam Luke Matty Max Nathan Oliver Ryan Sam Tom Tyler Will Zak"),
       _w("Archer Ashworth Baxter Bates Blackwell Brooks Carver Chambers Dalton Ellis Fairclough Garland Hargreaves Holloway Hutchins Kemp Langley Marsden Norris Parkin Pemberton Radcliffe Sharpe Stanley Thorne Turnbull Wainwright Whitaker Yates"))
SCO = (ENG[0], _w("Anderson Baird Cameron Crawford Dunbar Fraser Galbraith Gordon Henderson Kerr Lennox MacAllister MacLeod Munro Murray Ogilvie Rennie Sinclair Stewart Wallace"))
IRL = (ENG[0], _w("Brennan Byrne Clancy Coughlan Doherty Dunne Fahy Gallagher Hennessy Keane Lenihan McCarthy Moran Nolan Quigley Reilly Rooney Tierney Whelan"))
DEN = (_w("Anders Asger Frederik Jakob Jens Kasper Lasse Magnus Mathias Mikkel Morten Nikolaj Oliver Rasmus Simon Søren Thomas Victor Emil Christian"),
       _w("Andersen Bech Christensen Dalsgaard Eriksen Hansen Holm Jensen Jørgensen Kristiansen Larsen Lund Madsen Møller Nielsen Olesen Pedersen Poulsen Rasmussen Sørensen Thomsen Winther"))
SWE = (DEN[0] + _w("Albin Gustav Viktor Isak Oskar Elias Linus"), _w("Ahlberg Bergström Ek Engström Forsberg Holmgren Karlsson Lindgren Lindqvist Nyberg Olsson Persson Sandberg Sjöberg Strömberg Wikström Åberg Öberg"))
NOR = (DEN[0] + _w("Håkon Sander Torbjørn Markus Sigurd Mats"), _w("Aasen Berg Bjørnstad Dahl Eide Haugen Hagen Johansen Knutsen Lie Moen Nilsen Rønning Solberg Strand Tangen Vik Øien"))
SUI = GER
AUT = (GER[0], _w("Aigner Bauer Eder Fuchs Gruber Haider Hofer Huber Kainz Lechner Maurer Mayr Pichler Reiter Schober Steiner Wallner Winter Wimmer Zauner"))
POL = (_w("Adam Bartosz Damian Dawid Filip Jakub Jan Kacper Kamil Krzysztof Łukasz Maciej Marcin Mateusz Michał Oskar Patryk Paweł Piotr Przemysław Sebastian Szymon Tomasz Wojciech"),
       _w("Adamski Baran Borkowski Chmielewski Dudek Gajewski Jabłoński Kaczmarek Kowal Krawczyk Lewandowicz Majewski Michalski Nowicki Olszewski Pawlak Rutkowski Sadowski Sikora Szewczyk Urban Wójcik Zalewski Zieliński"))
CZE = (POL[0], _w("Beneš Čermák Dvořák Hájek Havlík Horák Kratochvíl Marek Novotný Pospíšil Procházka Růžička Svoboda Šimek Veselý Zeman"))
CRO = (_w("Ante Bruno Dario Dino Domagoj Filip Ivan Josip Karlo Luka Marin Marko Mario Matej Mislav Nikola Petar Roko Tin Toni Zvonimir"),
       _w("Babić Barišić Bilić Božić Brkić Dujmović Horvat Jurić Kovačić Knežević Lovrić Matić Novak Pavlović Perić Petrović Radić Šarić Tomić Vidović Vuković Žigić"))
SRB = (CRO[0] + _w("Nemanja Stefan Miloš Dušan Vuk Lazar Uroš"), _w("Đorđević Ilić Janković Jovanović Kostić Lazić Marković Milošević Nikolić Obradović Petković Radovanović Savić Simić Stojanović Todorović Vasić Zdravković"))
BIH = SRB; SVN = CRO; MKD = SRB; KOS = SRB; MNE = SRB
ALB = (_w("Armando Besnik Endrit Ermal Fatjon Gentian Granit Kristian Lorik Redon Valon Elvis Arbër Ardit Bardh Dren"), _w("Berisha Bajrami Dervishi Gashi Hoxha Kastrati Krasniqi Lleshi Mehmeti Muça Rama Shehu Zeqiri Basha Cela Dedja"))
GRE = (_w("Alexandros Anastasios Charalampos Christos Dimitrios Giannis Giorgos Konstantinos Lazaros Nikos Panagiotis Petros Sotiris Stavros Vasilis Thanos"), _w("Antoniou Dimitriou Georgiou Kalogeros Karagiannis Katsaros Konstantinidis Lazaridis Makris Nikolaidis Papadakis Papadopoulos Stathopoulos Theodoridis Vlachos Zografos"))
ROU = (_w("Adrian Alexandru Andrei Bogdan Cătălin Cosmin Dan Daniel Denis Florin Gabriel Ionuț Marius Mihai Nicolae Radu Răzvan Sorin Tudor Vlad"), _w("Barbu Bălan Constantin Dumitru Florea Georgescu Ionescu Lungu Mihai Munteanu Neagu Oprea Popescu Radu Sandu Stan Stoica Tănase Ungureanu Vasile"))
HUN = (_w("Ádám Attila Balázs Bence Csaba Dániel Gábor István Kristóf László Máté Norbert Péter Richárd Roland Zoltán Zsolt Dominik"), _w("Balogh Farkas Fehér Horváth Kis Kiss Lakatos Molnár Nagy Oláh Papp Szabó Szilágyi Takács Tóth Varga Vörös"))
TUR = (_w("Ahmet Akın Arda Berkay Burak Can Cem Deniz Emre Efe Eren Furkan Hakan Kaan Kerem Mert Murat Oğuz Ozan Salih Selim Tolga Umut Yusuf Yiğit"), _w("Acar Akgün Aksoy Aydın Bayram Çelik Demir Doğan Erdem Gül Güneş Kaya Kılıç Koç Özdemir Polat Sarı Şahin Tekin Turan Uçar Yalçın Yıldız Yılmaz"))
UKR = (_w("Andriy Artem Bohdan Denys Dmytro Illia Ivan Maksym Mykola Oleksandr Oleh Roman Serhiy Taras Vitaliy Volodymyr Yaroslav Yevhen"), _w("Bondar Boyko Hrytsenko Kovalenko Kravchuk Lysenko Marchenko Melnyk Moroz Pavlenko Petrenko Savchenko Shevchenko Tkachenko Vasylenko Zinchenko"))
RUS = UKR
ISR = (_w("Amit Dor Eden Eitan Guy Itai Liam Noam Omer Oren Roee Shon Tal Yonatan Yuval"), _w("Abutbul Azulay Ben-David Cohen Dahan Friedman Gabay Hadad Levi Mizrahi Peretz Shapira Stern Tamir Zohar"))
FIN = NOR; ISL = NOR
BRA = (_w("Adriano Alan Alex Bruno Caio Carlos Daniel Danilo Davi Diego Douglas Eduardo Elias Felipe Gabriel Gustavo Henrique Igor Jean João Kauã Leandro Lucas Luiz Marcelo Matheus Murilo Paulo Pedro Rafael Renan Rodrigo Thiago Vinícius Wesley Willian Yuri"),
       _w("Albuquerque Araújo Azevedo Barbosa Barros Batista Cardoso Carvalho Castro Cavalcanti Correia Dantas Duarte Fagundes Farias Freitas Gomes Guimarães Lacerda Lima Macedo Magalhães Medeiros Moraes Moreira Nascimento Nogueira Pacheco Pimentel Queiroz Ramos Rezende Rocha Sampaio Siqueira Tavares Teixeira Vasconcelos Xavier"))
LAT = (ESP[0], _w("Acosta Aguirre Alvarado Barrera Benítez Bustamante Cabral Cáceres Campos Cardozo Cuevas Delgado Duarte Escobar Figueroa Franco Giménez Godoy Ibarra Insúa Ledesma Maidana Montiel Navarro Ojeda Paredes Peralta Quiroga Rivero Rojas Salinas Sosa Vera Villalba Zabaleta"))
ARG = URU = COL = CHI = ECU = PAR = MEX = VEN = PER = LAT
USA = (ENG[0] + _w("Brandon Cody Dillon Jordan Kyle Mason Trevor Tanner"), _w("Bennett Brooks Caldwell Dawson Fisher Gibson Hayes Holt Keller Lawson Maddox Mercer Nash Parker Reese Sawyer Sullivan Tucker Walsh Weaver"))
CAN = USA; AUS = USA
JPN = (_w("Daichi Haruki Hayato Hiroki Itsuki Kaito Kenta Kosei Kota Ryo Ryota Shota Sora Sosuke Takumi Taro Yuki Yuta Yuya Ren Riku Naoki Shun Kazuki"), _w("Akiyama Fujita Hasegawa Hayashi Ikeda Inoue Kikuchi Maeda Matsuda Miyazaki Mori Nakamura Okada Saito Sakamoto Sasaki Shimizu Takeda Tanabe Ueda Yamada Yoshida"))
KOR = (_w("Dong-hyun Hyun-woo Ji-hoon Jin-seo Jun-ho Min-jae Min-soo Seong-min Seung-ho Sung-jin Tae-hyun Woo-jin Yong-hwan Young-jun Hyeon-seok"), _w("Bae Cho Choi Han Hwang Jang Jeon Jung Kang Kim Kwon Lee Moon Nam Oh Park Seo Shin Song Yoon"))
NGA = (_w("Abdul Chidera Chukwu Emeka Femi Ifeanyi Kelechi Obinna Ola Ramon Samuel Segun Sunday Tunde Victor Yusuf Adebayo Chinedu Ikenna Taiwo Uche"), _w("Adeyemi Afolabi Akinola Balogun Chukwuma Eze Ibrahim Idowu Lawal Mohammed Nnamdi Obi Okafor Okonkwo Olawale Onuoha Salisu Uzoma Yakubu"))
GHA = (_w("Abdul Daniel Emmanuel Evans Isaac Kwabena Kwadwo Kwame Kofi Mohammed Nana Richmond Samuel Seidu Yaw Joseph Gideon Prince"), _w("Adjei Agyeman Amoah Annan Appiah Asamoah Asante Boateng Darko Frimpong Kyei Mensah Nkansah Opoku Owusu Quaye Tetteh Yeboah"))
WAF = (_w("Abdoulaye Amadou Boubacar Cheick Ibrahima Idrissa Issa Karim Lamine Mamadou Moussa Ousmane Sékou Seydou Souleymane Youssouf Yacouba Aboubacar Bakary Drissa Mahamadou Kalidou"), _w("Bamba Camara Cissé Coulibaly Diabaté Diakité Diallo Diarra Diop Doumbia Fofana Gueye Kaba Keïta Koné Konaté Ndiaye Sagna Sangaré Sidibé Sow Sylla Touré Traoré Yattara"))
SEN = CIV = MLI = GUI = BFA = GAM = WAF
CMR = (_w("Alain Aurélien Christian Franck Georges Jean Junior Landry Martin Olivier Paul Patrick Pierre Samuel Steve Vincent Yannick Eric"), _w("Abanda Atangana Bassogog Biyik Eboué Etame Fotso Kamdem Manga Mbarga Mbida Mvondo Ndzie Nguema Nkoulou Onana Tchoua Zambo"))
COD = CMR; CGO = CMR
ANG = (POR[0], _w("Bento Cabral Domingos Fernandes Gomes Kiala Lopes Mateus Neto Pedro Sebastião Simão Tomás Vieira Zeca"))
MOZ = ANG; CPV = ANG
MAR = (_w("Abdelhak Achraf Adil Amine Anas Aymen Bilal Brahim Hamza Hicham Ilyas Karim Mehdi Nabil Oussama Rachid Reda Soufiane Walid Yassine Youssef Zakaria"), _w("Alaoui Amrani Benali Benhaddou Bennani Berrada Boukhari Chakir El_Amrani El_Idrissi El_Fassi Fassi Haddad Idrissi Lahlou Mansouri Naciri Ouazzani Rahmani Tazi Zniber"))
ALG = (MAR[0], _w("Belaïd Benchikh Bouzid Brahimi Djebbar Ferhat Guerfi Haddadi Hamidi Khelifa Larbi Mebarki Meziane Rahmani Saadi Slimani Touati Zerrouki"))
TUN = (MAR[0], _w("Abidi Ayari Ben_Ali Ben_Youssef Bouguerra Chaouch Dridi Gharbi Hamdi Jebali Khemiri Mejri Mzoughi Nasri Rekik Sassi Trabelsi"))
EGY = (MAR[0], _w("Abdelrahman Fathy Hassan Ibrahim Mahmoud Mostafa Nabil Saad Salem Soliman Taha Zaki"))
MAS = (_w("Aiman Amirul Faisal Hafiz Hakim Irfan Khairul Nazri Syafiq Syahmi Zaquan Danial"), _w("Abdullah Hamid Hashim Ismail Kamal Latif Mahmud Rahim Rashid Salleh Yusof Zainal"))

# Keyed by football nationality code; unknown codes fall back to the region noted below.
POOLS = {k: v for k, v in dict(
    ESP=ESP, BASQUE=BASQUE, POR=POR, FRA=FRA, GER=GER, ITA=ITA, NED=NED, BEL=BEL, ENG=ENG, SCO=SCO, IRL=IRL,
    DEN=DEN, SWE=SWE, NOR=NOR, SUI=SUI, AUT=AUT, POL=POL, CZE=CZE, CRO=CRO, SRB=SRB, BIH=BIH, SVN=SVN, MKD=MKD,
    KOS=KOS, MNE=MNE, ALB=ALB, GRE=GRE, ROU=ROU, HUN=HUN, TUR=TUR, UKR=UKR, RUS=RUS, ISR=ISR, FIN=FIN, ISL=ISL,
    BRA=BRA, ARG=ARG, URU=URU, COL=COL, CHI=CHI, ECU=ECU, PAR=PAR, MEX=MEX, VEN=VEN, PER=PER, USA=USA, CAN=CAN, AUS=AUS,
    JPN=JPN, KOR=KOR, NGA=NGA, GHA=GHA, SEN=SEN, CIV=CIV, MLI=MLI, GUI=GUI, BFA=BFA, GAM=GAM, CMR=CMR, COD=COD,
    CGO=CGO, ANG=ANG, MOZ=MOZ, CPV=CPV, MAR=MAR, ALG=ALG, TUN=TUN, EGY=EGY, MAS=MAS).items()}
# Nationalities whose surnames take a second family name when a pool runs out.
DOUBLE_SURNAME = {'ESP', 'BASQUE', 'POR', 'BRA', 'ARG', 'URU', 'COL', 'CHI', 'ECU', 'PAR', 'MEX', 'VEN', 'PER'}
