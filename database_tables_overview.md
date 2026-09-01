# 🗄️ Database Collections & Live Table Data Overview

**Database Name**: `UGFormDB` (MongoDB Atlas Cluster)

## 👤 1. Users Collection (`users`)

| ID | Name | Email | Role | AG Number / Emp ID | Phone | CNIC | Campus | Department |
|---|---|---|---|---|---|---|---|---|
| `6a847bf0b3b5474079741164` | **Ali Ahmed** | ali@gmail.com | `student` | 2026-CS-001 | 03001234567 | N/A | N/A | N/A |
| `6a847c28b3b5474079741165` | **Dr Ahmed** | coordinator@uaf.edu.pk | `coordinator` | N/A | N/A | N/A | N/A | N/A |
| `6a84bc0b3cd04faf7ae9d0db` | **javii** | javi@gmail.com | `student` | 90 | N/A | N/A | N/A | N/A |
| `6a85ddf33e3ded4322373715` | **javeria naz** | javeriasher90@gmail.com | `student` | 061062 | 03107299820 | 3310208090605 | N/A | N/A |
| `6a85dfdd3e3ded4322373716` | **Ayesha** | ayeshi@gmail.com | `coordinator` | 75 | 03057683695 | N/A | N/A | N/A |
| `6a860ac103043e9da1a8b61c` | **Mahnoor** | mano@gmail.com | `coordinator` | 01 | 03107299820 | N/A | Main Campus | Department of Biochemistry |
| `6a88d4dcefb83ea1a5561046` | **fatima** | fatima123@gmail.com | `student` | 03 | 03107299 | 3310282037115 | N/A | N/A |
| `6a8d22ca99733b2565489206` | **Zainab Nokhaiz** | zaini80@gmail.com | `student` | 80 | 0301234 | 33102-0809060-5 | N/A | N/A |
| `6a966a20bb9d35608506076c` | **Dr. Muhammad Kashif** | mkashifuaf79@gmail.com | `coordinator` | 38288 | 03336601542 | N/A | Main Campus | Department of Mathematics and Statistics |
| `6a9671862e1e8dd277fa041c` | **Hafiz Bilal** | hafizbilalphd@gmail.com | `coordinator` | 3310223 | 03059992774 | N/A | Main Campus | Department Of Computer Science |
| `6a967284918546a14250b140` | **Super Admin** | admin@uaf.com | `superadmin` | N/A | N/A | N/A | N/A | N/A |
| `6a967abc744d9e0b1abdc677` | **Test** | testuser@gmail.com | `coordinator` | 787898 | 03176289020 | N/A | Main Campus | Department Of Computer Science |
| `6a96824db8474aeff6421418` | **Muhammad Waleed mohsin** | idepartment915@gmail.com | `student` | 2023-ag-9647 | 03267290614 | 3310032234941 | Main Campus | Department Of Computer Science |

---

## 🏛️ 2. Campuses Collection (`campuses`)

| ID | Code | Campus Name | Status |
|---|---|---|---|
| `6a8db88d112cdfb0613fd089` | `CMC1001` | **Main Campus** | Active |
| `6a8db892112cdfb0613fd0c9` | `CUSP1065` | **UAF Sub-Campus PARS** | Active |
| `6a8db893112cdfb0613fd0d2` | `CUSB1074` | **UAF Sub-Campus Burewala-Vehari** | Active |
| `6a8db893112cdfb0613fd0de` | `CUSD1086` | **UAF Sub-Campus Depalpur** | Active |
| `6a8db893112cdfb0613fd0f1` | `CUSTTS1090` | **University of Agriculture Faisalabad, Constituent College Toba Tek Singh** | Active |

---

## 🏢 3. Faculties Collection (`faculties`)

| ID | Faculty Name | Campus |
|---|---|---|
| `6a8db88d112cdfb0613fd08a` | **Faculty of Agriculture** | Main Campus |
| `6a8db88e112cdfb0613fd094` | **Faculty of Sciences** | Main Campus |
| `6a8db890112cdfb0613fd0a9` | **Faculty of Animal Husbandry** | Main Campus |
| `6a8db890112cdfb0613fd0ab` | **Faculty of Food Nutrition and Home Sciences** | Main Campus |
| `6a8db890112cdfb0613fd0b5` | **Faculty of Veterinary Sciences** | Main Campus |
| `6a8db891112cdfb0613fd0bd` | **Faculty of Agricultural Engineering and Technology** | Main Campus |
| `6a8db892112cdfb0613fd0c4` | **Faculty of Social Sciences** | Main Campus |
| `6a8db892112cdfb0613fd0ca` | **Faculty of Sciences** | UAF Sub-Campus PARS |
| `6a8db893112cdfb0613fd0d3` | **Faculty of Agriculture** | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0d6` | **Faculty of Sciences** | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0d8` | **Faculty of Social Sciences** | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0dd` | **Faculty of Arts and Humanities** | UAF Sub-Campus Burewala-Vehari |
| `6a8db894112cdfb0613fd0df` | **Faculty of Agriculture** | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e2` | **Faculty of Food, Nutrition & Home Sciences** | UAF Sub-Campus Depalpur |
| `6a8db893112cdfb0613fd0f2` | **Faculty of Poultry Sciences** | University of Agriculture Faisalabad, Constituent College Toba Tek Singh |
| `6a8db893112cdfb0613fd0f3` | **Faculty of Arts & Humantarians** | University of Agriculture Faisalabad, Constituent College Toba Tek Singh |
| `6a8db893112cdfb0613fd0f4` | **Faculty of Sciences** | University of Agriculture Faisalabad, Constituent College Toba Tek Singh |

---

## 📂 4. Departments Collection (`departments`)

| ID | Department Name | Faculty | Campus |
|---|---|---|---|
| `6a8db88d112cdfb0613fd08b` | **Department of Agronomy** | Faculty of Agriculture | Main Campus |
| `6a8db88d112cdfb0613fd08c` | **Department of Plant Breeding & Genetics** | Faculty of Agriculture | Main Campus |
| `6a8db88d112cdfb0613fd08d` | **Department of Entomology** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd08e` | **Department of Plant Pathology** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd08f` | **Department of Forestry and Range Management** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd090` | **Institute of Soil & Environmental Sciences** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd091` | **Institute of Horticultural Sciences** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd092` | **Centre of Agricultural Biochemistry and Biotechnology** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd093` | **Department of Crop Physiology** | Faculty of Agriculture | Main Campus |
| `6a8db88e112cdfb0613fd095` | **Department Of Computer Science** | Faculty of Sciences | Main Campus |
| `6a8db88f112cdfb0613fd09c` | **Department of Botany** | Faculty of Sciences | Main Campus |
| `6a8db88f112cdfb0613fd09e` | **Department of Chemistry** | Faculty of Sciences | Main Campus |
| `6a8db88f112cdfb0613fd0a0` | **Department of Biochemistry** | Faculty of Sciences | Main Campus |
| `6a8db88f112cdfb0613fd0a2` | **Department of Physics** | Faculty of Sciences | Main Campus |
| `6a8db88f112cdfb0613fd0a4` | **Department of Mathematics and Statistics** | Faculty of Sciences | Main Campus |
| `6a8db88f112cdfb0613fd0a7` | **Department of Zoology, Wildlife and Fisheries** | Faculty of Sciences | Main Campus |
| `6a8db890112cdfb0613fd0aa` | **Institute of Animal and Dairy Sciences** | Faculty of Animal Husbandry | Main Campus |
| `6a8db890112cdfb0613fd0ac` | **National Institute of Food Science and Technology (NIFSAT)** | Faculty of Food Nutrition and Home Sciences | Main Campus |
| `6a8db890112cdfb0613fd0af` | **Institute of Home Sciences** | Faculty of Food Nutrition and Home Sciences | Main Campus |
| `6a8db890112cdfb0613fd0b6` | **Department of Anatomy** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0b7` | **Department of Pathology** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0b8` | **Department of Clinical Medicine & Surgery** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0b9` | **Department of Theriogenology** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0ba` | **Department of Parasitology** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0bb` | **Institute of Microbiology** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0bc` | **Institute of Physiology and Pharmacology** | Faculty of Veterinary Sciences | Main Campus |
| `6a8db891112cdfb0613fd0be` | **Department of Farm Machinery and Power** | Faculty of Agricultural Engineering and Technology | Main Campus |
| `6a8db891112cdfb0613fd0bf` | **Department of Fiber and Textile Technology** | Faculty of Agricultural Engineering and Technology | Main Campus |
| `6a8db891112cdfb0613fd0c0` | **Department of Structures & Environmental Engineering** | Faculty of Agricultural Engineering and Technology | Main Campus |
| `6a8db891112cdfb0613fd0c1` | **Department of Energy Systems Engineering** | Faculty of Agricultural Engineering and Technology | Main Campus |
| `6a8db891112cdfb0613fd0c2` | **Department of Food Engineering** | Faculty of Agricultural Engineering and Technology | Main Campus |
| `6a8db891112cdfb0613fd0c3` | **Department of Irrigation and Drainage** | Faculty of Agricultural Engineering and Technology | Main Campus |
| `6a8db892112cdfb0613fd0c5` | **Institute of Agricultural Extension, Education and Rural Development** | Faculty of Social Sciences | Main Campus |
| `6a8db892112cdfb0613fd0c6` | **Institute of Agricultural and Resource Economics** | Faculty of Social Sciences | Main Campus |
| `6a8db892112cdfb0613fd0c7` | **Institute of Business Management Sciences** | Faculty of Social Sciences | Main Campus |
| `6a8db892112cdfb0613fd0c8` | **Department of English and Linguistics** | Faculty of Social Sciences | Main Campus |
| `6a8db892112cdfb0613fd0cb` | **Department Of Computer Science** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db892112cdfb0613fd0cc` | **Department of Botany** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db892112cdfb0613fd0cd` | **Department of Chemistry** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db892112cdfb0613fd0ce` | **Department of Biochemistry** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db892112cdfb0613fd0cf` | **Department of Physics** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db892112cdfb0613fd0d0` | **Department of Mathematics and Statistics** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db892112cdfb0613fd0d1` | **Department of Zoology, Wildlife and Fisheries** | Faculty of Sciences | UAF Sub-Campus PARS |
| `6a8db893112cdfb0613fd0d4` | **Department of Agricultural Sciences (BSc Hons)** | Faculty of Agriculture | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0d7` | **Department of Computer Science** | Faculty of Sciences | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0d9` | **Department of BBA (Agribusiness)** | Faculty of Social Sciences | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0db` | **Department of MBA (Regular)** | Faculty of Social Sciences | UAF Sub-Campus Burewala-Vehari |
| `6a8db894112cdfb0613fd0e0` | **Agriculture (BSc Hons)** | Faculty of Agriculture | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e3` | **Food Science & Technology** | Faculty of Food, Nutrition & Home Sciences | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e5` | **Human Nutrition & Dietetics** | Faculty of Food, Nutrition & Home Sciences | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e7` | **Home Economics (BSc Hons)** | Faculty of Food, Nutrition & Home Sciences | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e9` | **Human Development & Family Studies** | Faculty of Food, Nutrition & Home Sciences | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0eb` | **Dairy Technology (MSc Hons)** | Faculty of Food, Nutrition & Home Sciences | UAF Sub-Campus Depalpur |
| `6a8db893112cdfb0613fd0f5` | **Department of Poultry Sciences** | Faculty of Poultry Sciences | University of Agriculture Faisalabad, Constituent College Toba Tek Singh |
| `6a8db893112cdfb0613fd0f6` | **Department of Home Ecnomics** | Faculty of Arts & Humantarians | University of Agriculture Faisalabad, Constituent College Toba Tek Singh |
| `6a8db893112cdfb0613fd0f7` | **Department of Computer Science** | Faculty of Sciences | University of Agriculture Faisalabad, Constituent College Toba Tek Singh |

---

## 🎓 5. Degrees / Disciplines Collection (`degrees`)

| ID | Degree Name | Department | Campus |
|---|---|---|---|
| `6a8db88e112cdfb0613fd096` | **Computer Science** | Department Of Computer Science | Main Campus |
| `6a8db88e112cdfb0613fd097` | **Information Technology** | Department Of Computer Science | Main Campus |
| `6a8db88e112cdfb0613fd098` | **Software Engineering** | Department Of Computer Science | Main Campus |
| `6a8db88e112cdfb0613fd099` | **Bioinformatics** | Department Of Computer Science | Main Campus |
| `6a8db88e112cdfb0613fd09a` | **Data Science** | Department Of Computer Science | Main Campus |
| `6a8db88e112cdfb0613fd09b` | **Artificial Intelligence** | Department Of Computer Science | Main Campus |
| `6a8db88f112cdfb0613fd09d` | **BS Botany** | Department of Botany | Main Campus |
| `6a8db88f112cdfb0613fd09f` | **BS Chemistry** | Department of Chemistry | Main Campus |
| `6a8db88f112cdfb0613fd0a1` | **BS Bio-Chemistry** | Department of Biochemistry | Main Campus |
| `6a8db88f112cdfb0613fd0a3` | **BS Physics** | Department of Physics | Main Campus |
| `6a8db88f112cdfb0613fd0a5` | **BS Data Analytics** | Department of Mathematics and Statistics | Main Campus |
| `6a8db88f112cdfb0613fd0a6` | **BS Bio-Statistics** | Department of Mathematics and Statistics | Main Campus |
| `6a8db88f112cdfb0613fd0a8` | **BS Aquaculture** | Department of Zoology, Wildlife and Fisheries | Main Campus |
| `6a8db890112cdfb0613fd0ad` | **BS (Hons.) HND** | National Institute of Food Science and Technology (NIFSAT) | Main Campus |
| `6a8db890112cdfb0613fd0ae` | **BS Food Science** | National Institute of Food Science and Technology (NIFSAT) | Main Campus |
| `6a8db890112cdfb0613fd0b0` | **BS Home Economics** | Institute of Home Sciences | Main Campus |
| `6a8db890112cdfb0613fd0b1` | **BS Fashion Designing** | Institute of Home Sciences | Main Campus |
| `6a8db890112cdfb0613fd0b2` | **BS Clothing and Textile** | Institute of Home Sciences | Main Campus |
| `6a8db890112cdfb0613fd0b3` | **BS Human Development and Family Studies** | Institute of Home Sciences | Main Campus |
| `6a8db890112cdfb0613fd0b4` | **BS Fine Arts** | Institute of Home Sciences | Main Campus |
| `6a8db893112cdfb0613fd0d5` | **BSc (Hons.) Agriculture** | Department of Agricultural Sciences (BSc Hons) | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0da` | **BBA Agribusiness** | Department of BBA (Agribusiness) | UAF Sub-Campus Burewala-Vehari |
| `6a8db893112cdfb0613fd0dc` | **MBA Regular** | Department of MBA (Regular) | UAF Sub-Campus Burewala-Vehari |
| `6a8db894112cdfb0613fd0e1` | **BSc (Hons.) Agriculture** | Agriculture (BSc Hons) | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e4` | **Food Science & Technology** | Food Science & Technology | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e6` | **Human Nutrition & Dietetics** | Human Nutrition & Dietetics | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0e8` | **BSc (Hons.) Home Economics** | Home Economics (BSc Hons) | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0ea` | **Human Development & Family Studies** | Human Development & Family Studies | UAF Sub-Campus Depalpur |
| `6a8db894112cdfb0613fd0ec` | **MSc (Hons.) Dairy Technology** | Dairy Technology (MSc Hons) | UAF Sub-Campus Depalpur |

---

## 📚 6. Courses Collection (`courses`)

| ID | Course Code | Course Title | Credit Hours | Category | Degree |
|---|---|---|---|---|---|
| `6a847240765934339535afaf` | **CS101** | Programming Fundamentals | 3 | `General Course` | N/A |
| `6a8472d7765934339535afb0` | **CS101** | Programming Fundamentals | 3 | `General Course` | N/A |
| `6a88b242221e93c92b18d253` | **cs-301** | introduction to computing | 3(2-1) | `General Course` | N/A |
| `6a88b398221e93c92b18d254` | **cs-301** | introduction to computing | 3(2-1) | `General Course` | N/A |
| `6a8955dd3007629a79543951` | **CS-301** | Introduction to Computing | 3(2-1) | `General Course` | N/A |
| `6a8960d2a0c60f1ffc9f5253` | **cs-301** | abs | 3(2-1) | `General Course` | N/A |
| `6a8bfc140a28c5d59e117c39` | **CSI-302** | Communication | 3(3-0) | `General Course` | N/A |
| `6a8d3d80a2ee66542fa1567b` | **jav-334** | website | 3(2-1) | `General Course` | N/A |

---

## 📋 7. UG Forms Submissions Collection (`ugforms`)

| ID | Student Name | AG Number | Degree | Status | Submitted At |
|---|---|---|---|---|---|
| `6a894c1c3007629a79543950` | **fatima** | 03 | N/A | `Submitted` | 8/22/2026 |
| `6a8d28b6afd9034c5b4f5aeb` | **Zainab Nokhaiz** | 80 | N/A | `Submitted` | 8/25/2026 |
| `6a8d3434a2ee66542fa15676` | **Zainab Nokhaiz** | 80 | N/A | `Submitted` | 8/25/2026 |
| `6a8d3abea2ee66542fa15678` | **Zainab Nokhaiz** | 80 | N/A | `Draft` | 8/25/2026 |
