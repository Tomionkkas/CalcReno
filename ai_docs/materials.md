1. Podstawowe Obliczenia Geometryczne
Na początku funkcja calculateRequiredMaterials pobiera szczegóły pomieszczenia (roomDetails) i na ich podstawie oblicza kluczowe wartości:
floorArea (Powierzchnia podłogi): długość * szerokość
roomPerimeter (Obwód pomieszczenia): Suma długości wszystkich ścian (walls.reduce(...))
totalDoorArea (Powierzchnia drzwi): Suma szerokość * wysokość dla wszystkich drzwi.
totalWindowArea (Powierzchnia okien): Suma szerokość * wysokość dla wszystkich okien.
grossWallArea (Powierzchnia ścian brutto): obwód pomieszczenia * wysokość pomieszczenia
netWallArea (Powierzchnia ścian netto): Powierzchnia ścian brutto - Powierzchnia drzwi - Powierzchnia okien. Jest to kluczowa wartość do obliczeń materiałów ściennych.

2. Mechanizm Kalkulacji Kosztów
Aplikacja używa funkcji pomocniczej addMaterial(klucz, ilość), która:
Pobiera cenę jednostkową dla danego materiału (klucz) z obiektu costs. Ceny te są zarządzane przez użytkownika na ekranie MaterialPricesScreen i przechowywane w AsyncStorage.
Oblicza koszt dla danego materiału: Koszt = Ilość * Cena Jednostkowa.
Dodaje ten koszt do całkowitego kosztu remontu (totalCost).

3. Formuły Obliczeniowe dla Każdego Materiału
Poniżej znajdują się dokładne wzory używane do obliczenia ilości każdego materiału. ceil oznacza zaokrąglenie w górę do najbliższej liczby całkowitej.
Materiały Podstawowe
Panel podłogowy (floorPanels): ceil(floorArea) - ilość w m².
Podkład pod podłogę (underlayment): ceil(floorArea) - ilość w m².
Farba (paint): ceil(netWallArea * 0.25) - ilość w litrach, zakładając zużycie 0.25l na m² (np. na dwie warstwy).
Płyty GK ścienne (drywall): ceil(netWallArea / 3.12) - w sztukach, zakładając standardowy wymiar płyty.
Profile CW (cwProfiles): ceil((roomPerimeter / 0.6) * 1.1) - w sztukach, rozmieszczone co 60 cm z 10% zapasem.
Profile UW (uwProfiles): ceil((roomPerimeter / 3) * 1.1) - w sztukach, na obwód z 10% zapasem.
Wełna mineralna (mineralWool): ceil(netWallArea / 5) - w paczkach, zakładając 5 m² w paczce.
Wkręty TN do GK (tnScrews): ceil(netWallArea / 10) - w opakowaniach, zakładając zużycie na 10 m².
Gips szpachlowy ścienny (wallPlaster): ceil(netWallArea / 30) - w workach, zakładając wydajność 30 m² z worka.
Gładź szpachlowa (finishingPlaster): ceil(netWallArea / 25) - w workach, wydajność 25 m² z worka.
Materiały na Podłogę OSB (jeśli opcja useOsbFloor jest włączona)
Płyta OSB (osb): ceil(floorArea / 3.125) - w sztukach.
Wkręty OSB (osbScrews): ceil(floorArea / 10) - w opakowaniach.
Listwy przypodłogowe (baseboards): ceil((roomPerimeter - szerokość_drzwi) / 2.5) - w sztukach, długość 2.5m.
Narożniki/zakończenia listew (baseboardEnds): (ilość_drzwi * 2) + 4 - 2 na drzwi i 4 na narożniki.
Materiały na Sufit Podwieszany (jeśli opcja useSuspendedCeiling jest włączona)
Profile CD 60 (cdProfiles): ceil(floorArea)
Profile UD 27 (udProfiles): ceil(floorArea * 0.4)
Wieszaki ES (hangers): ceil(floorArea * 4.5)
Płyty GK sufitowe (gypsum): ceil(floorArea / 2.4) - w sztukach.
Gips szpachlowy sufitowy (plaster): ceil(floorArea / 30) - w workach.
Instalacja Elektryczna
Gniazdka (sockets): Równe wartości socketsCount podanej przez użytkownika.
Włączniki (switches): Równe wartości switchesCount podanej przez użytkownika.
Przewód YDY 3x1.5 (cable15): ceil(switchesCount * 5) - 5 metrów na każdy włącznik.
Przewód YDY 3x2.5 (cable25): ceil(socketsCount * 5) - 5 metrów na każde gniazdko.
Puszki podtynkowe (junctionBox): ceil(socketsCount + switchesCount).
Dla każdego z powyższych materiałów, końcowy koszt jest obliczany przez pomnożenie obliczonej ilości przez cenę jednostkową, którą użytkownik może zdefiniować w aplikacji.


System Automatycznej Kalkulacji Materiałów w CalcReno
Podstawowe Założenia Systemu
Aplikacja CalcReno wykorzystuje zaawansowany system automatycznych obliczeń, który na podstawie parametrów pomieszczenia generuje kompletny kosztorys materiałów budowlanych. System operuje na fundamentalnych obliczeniach geometrycznych i branżowych współczynnikach zużycia materiałów.
Proces Obliczeniowy

Etap 1: Analiza Geometryczna Pomieszczenia
System rozpoczyna od analizy podstawowych parametrów geometrycznych pomieszczenia. Oblicza powierzchnię podłogi, obwód pomieszczenia, całkowitą powierzchnię ścian oraz powierzchnię netto ścian po odjęciu otworów drzwiowych i okiennych. Te wartości stanowią fundament dla wszystkich dalszych kalkulacji materiałowych.

Etap 2: Kategoryzacja Materiałów
Materiały są podzielone na kategorie tematyczne odpowiadające etapom prac remontowych. Każda kategoria ma własne algorytmy obliczeniowe dopasowane do specyfiki zastosowania danego materiału.

Etap 3: Zastosowanie Współczynników Branżowych
Dla każdego materiału system stosuje sprawdzone w branży budowlanej współczynniki zużycia. Współczynniki te uwzględniają straty materiału, technologie montażu oraz standardowe wymiary dostępnych produktów. Wszystkie obliczenia są zaokrąglane w górę do pełnych jednostek handlowych.
Kategorie Materiałów i Metodyka Obliczeń
Materiały Podstawowe
Grupa materiałów podstawowych obejmuje elementy niezbędne w każdym remoncie. Panele podłogowe i podkłady obliczane są bezpośrednio na podstawie powierzchni podłogi. Materiały ścienne jak płyty gipsowo-kartonowe, profile konstrukcyjne, wełna mineralna oraz materiały wykończeniowe kalkulowane są w oparciu o powierzchnię ścian netto z uwzględnieniem specyficznych współczynników wydajności dla każdego produktu.
Materiały Specjalistyczne - Podłoga OSB
W przypadku wyboru opcji podłogi OSB, system aktywuje dodatkowy moduł obliczeniowy. Uwzględnia płyty OSB z elementami mocującymi, materiały izolacyjne oraz elementy wykończeniowe jak listwy przypodłogowe. Obliczenia listew uwzględniają redukcję obwodu o szerokości otworów drzwiowych oraz dodają elementy końcowe i narożniki.
Materiały Specjalistyczne - Sufit Podwieszany
Moduł sufitu podwieszonego kalkuluje kompletny system konstrukcyjno-wykończeniowy. Obejmuje profile nośne, elementy mocujące, płyty sufitowe oraz materiały wykończeniowe. Wszystkie obliczenia bazują na powierzchni sufitu z uwzględnieniem gęstości rozmieszczenia elementów konstrukcyjnych.
Instalacja Elektryczna
System instalacji elektrycznej operuje na liczbie punktów elektrycznych zdefiniowanych przez użytkownika. Kalkuluje gniazdka, włączniki, odpowiednie przekroje przewodów, puszki instalacyjne oraz akcesoria montażowe. Długości przewodów są szacowane na podstawie standardowych odległości montażowych.
Mechanizm Kosztorysowania
Elastyczne Ceny Materiałów
System wykorzystuje edytowalną bazę cen materiałów, pozwalając użytkownikowi na dostosowanie kosztorysu do lokalnych warunków rynkowych. Ceny są przechowywane lokalnie i mogą być modyfikowane w dedykowanym module zarządzania cenami.
Wielowalutowość
Aplikacja obsługuje różne waluty z możliwością globalnego przełączania. System automatycznie przelicza wszystkie koszty przy zmianie waluty, zachowując spójność kosztorysu.
Struktura Wyników
System generuje trójpoziomowy wynik: ilości materiałów, koszty jednostkowe oraz koszt całkowity. To pozwala na szczegółową analizę kosztorysu na poziomie pojedynczych materiałów oraz globalnej sumy projektu.
Inteligentne Dostosowania
Kompensacja Otworów
System inteligentnie odejmuje powierzchnie otworów drzwiowych i okiennych od kalkulacji materiałów ściennych, jednocześnie uwzględniając je w obliczeniach elementów wykończeniowych jak listwy przypodłogowe.
Adaptacja do Kształtu
Algorytmy są dostosowane do różnych kształtów pomieszczeń, od prostokątnych po złożone formy L-kształtne. System automatycznie generuje odpowiednie ściany i kalkuluje materiały na podstawie rzeczywistej geometrii.
Warunkowe Moduły
Materiały specjalistyczne są kalkulowane tylko przy aktywacji odpowiednich opcji, zapewniając precyzyjne kosztorysowanie tylko rzeczywiście potrzebnych elementów.
Ten system zapewnia profesjonalne, dokładne i dostosowywalne kosztorysowanie materiałów budowlanych, łącząc automatyzację z elastycznością dostosowania do indywidualnych potrzeb projektu.