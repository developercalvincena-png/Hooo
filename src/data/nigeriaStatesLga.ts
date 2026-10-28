export interface NigerianStateEntry {
  state: string;
  zone: 'South West' | 'South East' | 'South South' | 'North Central' | 'North East' | 'North West';
  lgas: string[];
}

export const NIGERIAN_STATES: NigerianStateEntry[] = [
  {
    state: 'Oyo',
    zone: 'South West',
    lgas: [
      'Afijio', 'Akinyele', 'Atiba', 'Atisbo', 'Egbeda', 'Ibadan North',
      'Ibadan North-East', 'Ibadan North-West', 'Ibadan South-East', 'Ibadan South-West',
      'Ibarapa Central', 'Ibarapa East', 'Ibarapa North', 'Ido', 'Irepo', 'Iseyin',
      'Itesiwaju', 'Iwajowa', 'Kajola', 'Lagelu', 'Ogbomosho North', 'Ogbomosho South',
      'Ogo Oluwa', 'Olorunsogo', 'Oluyole', 'Ona Ara', 'Orelope', 'Ori Ire',
      'Oyo East', 'Oyo West', 'Saki East', 'Saki West', 'Surulere'
    ]
  },
  {
    state: 'Lagos',
    zone: 'South West',
    lgas: [
      'Agege', 'Ajeromi-Ifelodun', 'Alimosho', 'Amuwo-Odofin', 'Apapa', 'Badagry',
      'Epe', 'Eti-Osa', 'Ibeju-Lekki', 'Ifako-Ijaiye', 'Ikeja', 'Ikorodu',
      'Kosofe', 'Lagos Island', 'Lagos Mainland', 'Mushin', 'Ojo', 'Oshodi-Isolo',
      'Shomolu', 'Surulere'
    ]
  },
  {
    state: 'Ogun',
    zone: 'South West',
    lgas: [
      'Abeokuta North', 'Abeokuta South', 'Ado-Odo/Ota', 'Egbado North', 'Egbado South',
      'Ewekoro', 'Ifo', 'Ijebu East', 'Ijebu North', 'Ijebu North East', 'Ijebu Ode',
      'Ikenne', 'Imeko Afon', 'Ipokia', 'Obafemi Owode', 'Odeda', 'Odogbolu',
      'Ogun Waterside', 'Remo North', 'Shagamu'
    ]
  },
  {
    state: 'Osun',
    zone: 'South West',
    lgas: [
      'Aiyedaade', 'Aiyedire', 'Atakunmosa East', 'Atakunmosa West', 'Boluwaduro',
      'Boripe', 'Ede North', 'Ede South', 'Egbedore', 'Ejigbo', 'Ife Central',
      'Ife East', 'Ife North', 'Ife South', 'Ifedayo', 'Ifelodun', 'Ila',
      'Ilesa East', 'Ilesa West', 'Irepodun', 'Irewole', 'Isokan', 'Iwo',
      'Obokun', 'Odo Otin', 'Ola Oluwa', 'Olorunda', 'Oriade', 'Orolu', 'Osogbo'
    ]
  },
  {
    state: 'Ondo',
    zone: 'South West',
    lgas: [
      'Akoko North-East', 'Akoko North-West', 'Akoko South-East', 'Akoko South-West',
      'Akure North', 'Akure South', 'Ese Odo', 'Idanre', 'Ifedore', 'Ilaje',
      'Ile Oluji/Okeigbo', 'Irele', 'Odigbo', 'Okitipupa', 'Ondo East', 'Ondo West',
      'Ose', 'Owo'
    ]
  },
  {
    state: 'Ekiti',
    zone: 'South West',
    lgas: [
      'Ado Ekiti', 'Efon', 'Ekiti East', 'Ekiti South-West', 'Ekiti West', 'Emure',
      'Gbonyin', 'Ido Osi', 'Ijero', 'Ikere', 'Ikole', 'Ilejemeje', 'Irepodun/Ifelodun',
      'Ise/Orun', 'Moba', 'Oye'
    ]
  },
  {
    state: 'Abia',
    zone: 'South East',
    lgas: [
      'Aba North', 'Aba South', 'Arochukwu', 'Bende', 'Ikwuano', 'Isiala Ngwa North',
      'Isiala Ngwa South', 'Isuikwuato', 'Obi Ngwa', 'Ohafia', 'Osisioma', 'Ugwunagbo',
      'Ukwa East', 'Ukwa West', 'Umuahia North', 'Umuahia South', 'Umu Nneochi'
    ]
  },
  {
    state: 'Anambra',
    zone: 'South East',
    lgas: [
      'Aguata', 'Anambra East', 'Anambra West', 'Anaocha', 'Awka North', 'Awka South',
      'Ayamelum', 'Dunukofia', 'Ekwusigo', 'Idemili North', 'Idemili South', 'Ihiala',
      'Njikoka', 'Nnewi North', 'Nnewi South', 'Ogbaru', 'Onitsha North', 'Onitsha South',
      'Orumba North', 'Orumba South', 'Oyi'
    ]
  },
  {
    state: 'Ebonyi',
    zone: 'South East',
    lgas: [
      'Abakaliki', 'Afikpo North', 'Afikpo South', 'Ebonyi', 'Ezza North', 'Ezza South',
      'Ikwo', 'Ishielu', 'Ivo', 'Izzi', 'Ohaozara', 'Ohaukwu', 'Onicha'
    ]
  },
  {
    state: 'Enugu',
    zone: 'South East',
    lgas: [
      'Aninri', 'Awgu', 'Enugu East', 'Enugu North', 'Enugu South', 'Ezeagu', 'Igbo Etiti',
      'Igbo Eze North', 'Igbo Eze South', 'Isi Uzo', 'Nkanu East', 'Nkanu West',
      'Nsukka', 'Oji River', 'Udenu', 'Udi', 'Uzo Uwani'
    ]
  },
  {
    state: 'Imo',
    zone: 'South East',
    lgas: [
      'Aboh Mbaise', 'Ahiazu Mbaise', 'Ehime Mbano', 'Ezinihitte', 'Ideato North',
      'Ideato South', 'Ihitte/Uboma', 'Ikeduru', 'Isiala Mbano', 'Isu', 'Mbaitoli',
      'Ngor Okpala', 'Njaba', 'Nkwerre', 'Nwangele', 'Obowo', 'Oguta', 'Ohaji/Egbema',
      'Okigwe', 'Orlu', 'Orsu', 'Oru East', 'Oru West', 'Owerri Municipal',
      'Owerri North', 'Owerri West', 'Unuimo'
    ]
  },
  {
    state: 'Akwa Ibom',
    zone: 'South South',
    lgas: [
      'Abak', 'Eastern Obolo', 'Eket', 'Esit Eket', 'Essien Udim', 'Etim Ekpo', 'Etinan',
      'Ibeno', 'Ibesikpo Asutan', 'Ibiono-Ibom', 'Ika', 'Ikono', 'Ikot Abasi', 'Ikot Ekpene',
      'Ini', 'Itu', 'Mbo', 'Mkpat-Enin', 'Nsit-Atai', 'Nsit-Ibom', 'Nsit-Ubium', 'Obot Akara',
      'Okobo', 'Onna', 'Oron', 'Oruk Anam', 'Udung-Uko', 'Ukanafun', 'Uruan',
      'Urue-Offong/Oruko', 'Uyo'
    ]
  },
  {
    state: 'Bayelsa',
    zone: 'South South',
    lgas: ['Brass', 'Ekeremor', 'Kolokuma/Opokuma', 'Nembe', 'Ogbia', 'Sagbama', 'Southern Ijaw', 'Yenagoa']
  },
  {
    state: 'Cross River',
    zone: 'South South',
    lgas: [
      'Abi', 'Akamkpa', 'Akpabuyo', 'Bakassi', 'Bekwarra', 'Biase', 'Boki', 'Calabar Municipal',
      'Calabar South', 'Etung', 'Ikom', 'Obanliku', 'Obubra', 'Obudu', 'Odukpani', 'Ogoja', 'Yakuur', 'Yala'
    ]
  },
  {
    state: 'Delta',
    zone: 'South South',
    lgas: [
      'Aniocha North', 'Aniocha South', 'Bomadi', 'Burutu', 'Ethiope East', 'Ethiope West',
      'Ika North East', 'Ika South', 'Isoko North', 'Isoko South', 'Ndokwa East', 'Ndokwa West',
      'Okpe', 'Oshimili North', 'Oshimili South', 'Patani', 'Sapele', 'Udu', 'Ughelli North',
      'Ughelli South', 'Ukwuani', 'Uvwie', 'Warri North', 'Warri South', 'Warri South West'
    ]
  },
  {
    state: 'Edo',
    zone: 'South South',
    lgas: [
      'Akoko-Edo', 'Egor', 'Esan Central', 'Esan North-East', 'Esan South-East', 'Esan West',
      'Etsako Central', 'Etsako East', 'Etsako West', 'Igueben', 'Ikpoba Okha', 'Orhionmwon',
      'Oredo', 'Ovia North-East', 'Ovia South-West', 'Owan East', 'Owan West', 'Uhunmwonde'
    ]
  },
  {
    state: 'Rivers',
    zone: 'South South',
    lgas: [
      'Abua/Odual', 'Ahoada East', 'Ahoada West', 'Akuku-Toru', 'Andoni', 'Asari-Toru',
      'Bonny', 'Degema', 'Eleme', 'Emuoha', 'Etche', 'Gokana', 'Ikwerre', 'Khana',
      'Obio/Akpor', 'Ogba/Egbema/Ndoni', 'Ogu/Bolo', 'Okrika', 'Omuma', 'Opobo/Nkoro',
      'Oyigbo', 'Port Harcourt', 'Tai'
    ]
  },
  {
    state: 'FCT Abuja',
    zone: 'North Central',
    lgas: ['Abaji', 'Bwari', 'Gwagwalada', 'Kuje', 'Kwali', 'Municipal Area Council (AMAC)']
  },
  {
    state: 'Kwara',
    zone: 'North Central',
    lgas: [
      'Asa', 'Baruten', 'Edu', 'Ekiti', 'Ifelodun', 'Ilorin East', 'Ilorin South',
      'Ilorin West', 'Irepodun', 'Isin', 'Kaiama', 'Moro', 'Offa', 'Oke Ero', 'Oyun', 'Pategi'
    ]
  },
  {
    state: 'Kogi',
    zone: 'North Central',
    lgas: [
      'Adavi', 'Ajaokuta', 'Ankpa', 'Bassa', 'Dekina', 'Ibaji', 'Idah', 'Igalamela Odolu',
      'Ijumu', 'Kabba/Bunu', 'Kogi', 'Lokoja', 'Mopa Muro', 'Ofu', 'Ogori/Magongo',
      'Okehi', 'Okene', 'Olamaboro', 'Omala', 'Yagba East', 'Yagba West'
    ]
  },
  {
    state: 'Benue',
    zone: 'North Central',
    lgas: [
      'Ado', 'Agatu', 'Apa', 'Buruku', 'Gboko', 'Guma', 'Gwer East', 'Gwer West',
      'Katsina-Ala', 'Konshisha', 'Kwande', 'Logo', 'Makurdi', 'Obi', 'Ogbadibo',
      'Ohimini', 'Oju', 'Okpokwu', 'Oturkpo', 'Tarka', 'Ukum', 'Ushongo', 'Vandeikya'
    ]
  },
  {
    state: 'Nasarawa',
    zone: 'North Central',
    lgas: ['Akwanga', 'Awe', 'Doma', 'Karu', 'Keana', 'Keffi', 'Kokona', 'Lafia', 'Nasarawa', 'Nasarawa Egon', 'Obi', 'Toto', 'Wamba']
  },
  {
    state: 'Niger',
    zone: 'North Central',
    lgas: [
      'Agaie', 'Agwara', 'Bida', 'Borgu', 'Bosso', 'Chanchaga', 'Edati', 'Gbako', 'Gurara',
      'Katcha', 'Kontagora', 'Lapai', 'Lavun', 'Magama', 'Mariga', 'Mashegu', 'Mokwa',
      'Moya', 'Paikoro', 'Rafi', 'Rijau', 'Shiroro', 'Suleja', 'Tafa', 'Wushishi'
    ]
  },
  {
    state: 'Plateau',
    zone: 'North Central',
    lgas: [
      'Barkin Ladi', 'Bassa', 'Bokkos', 'Jos East', 'Jos North', 'Jos South', 'Kanam',
      'Kanke', 'Langtang North', 'Langtang South', 'Mangu', 'Mikang', 'Pankshin',
      'Qua\'an Pan', 'Riyom', 'Shendam', 'Wase'
    ]
  },
  {
    state: 'Adamawa',
    zone: 'North East',
    lgas: [
      'Demsa', 'Fufure', 'Ganye', 'Gayuk', 'Gombi', 'Grie', 'Hong', 'Jada', 'Larmurde',
      'Madagali', 'Maiha', 'Mayo Belwa', 'Michika', 'Mubi North', 'Mubi South', 'Numan',
      'Shelleng', 'Song', 'Toungo', 'Yola North', 'Yola South'
    ]
  },
  {
    state: 'Bauchi',
    zone: 'North East',
    lgas: [
      'Alkaleri', 'Bauchi', 'Bogoro', 'Damban', 'Darazo', 'Dass', 'Gamawa', 'Ganjuwa',
      'Giade', 'Itas/Gadau', 'Jama\'are', 'Katagum', 'Kirfi', 'Misau', 'Ningi', 'Shira',
      'Tafawa Balewa', 'Toro', 'Warji', 'Zaki'
    ]
  },
  {
    state: 'Borno',
    zone: 'North East',
    lgas: [
      'Abadam', 'Askira/Uba', 'Bama', 'Bayo', 'Biu', 'Chibok', 'Damboa', 'Dikwa',
      'Gubio', 'Guzamala', 'Gwoza', 'Hawul', 'Jere', 'Kaga', 'Kala/Balge', 'Konduga',
      'Kukawa', 'Kwaya Kusar', 'Mafa', 'Magumeri', 'Maiduguri', 'Marte', 'Mobbar',
      'Monguno', 'Ngala', 'Nganzai', 'Shani'
    ]
  },
  {
    state: 'Gombe',
    zone: 'North East',
    lgas: ['Akko', 'Balanga', 'Billiri', 'Dukku', 'Funakaye', 'Gombe', 'Kaltungo', 'Kwami', 'Nafada', 'Shongom', 'Yamaltu/Deba']
  },
  {
    state: 'Taraba',
    zone: 'North East',
    lgas: [
      'Ardo Kola', 'Bali', 'Donga', 'Gashaka', 'Gassol', 'Ibi', 'Jalingo', 'Karim Lamido',
      'Kumi', 'Lau', 'Sardauna', 'Takum', 'Ussa', 'Wukari', 'Yorro', 'Zing'
    ]
  },
  {
    state: 'Yobe',
    zone: 'North East',
    lgas: [
      'Bade', 'Bursari', 'Damaturu', 'Fika', 'Fune', 'Geidam', 'Gujba', 'Gulani',
      'Jakusko', 'Karasuwa', 'Machina', 'Nangere', 'Nguru', 'Potiskum', 'Tarmuwa', 'Yunusari', 'Yusufari'
    ]
  },
  {
    state: 'Kaduna',
    zone: 'North West',
    lgas: [
      'Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jema\'a', 'Kachia',
      'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau',
      'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'
    ]
  },
  {
    state: 'Kano',
    zone: 'North West',
    lgas: [
      'Ajingi', 'Albasu', 'Bagwai', 'Bebeji', 'Bichi', 'Bunkure', 'Dala', 'Dambatta',
      'Dawakin Kudu', 'Dawakin Tofa', 'Doguwa', 'Fagge', 'Gabasawa', 'Garko', 'Garun Mallam',
      'Gaya', 'Gezawa', 'Gwale', 'Gwarzo', 'Kabo', 'Kano Municipal', 'Karaye', 'Kibiya',
      'Kiru', 'Kumbotso', 'Kunchi', 'Kura', 'Madobi', 'Makoda', 'Minjibir', 'Nasarawa',
      'Rano', 'Rimin Gado', 'Rogo', 'Shanono', 'Sumaila', 'Takai', 'Tarauni', 'Tofa',
      'Tsanyawa', 'Tudun Wada', 'Ungogo', 'Warawa', 'Wudil'
    ]
  },
  {
    state: 'Katsina',
    zone: 'North West',
    lgas: [
      'Bakori', 'Batagarawa', 'Batsari', 'Baure', 'Bindawa', 'Charanchi', 'Dandume',
      'Danja', 'Dan Musa', 'Daura', 'Dutsi', 'Dutsin Ma', 'Faskari', 'Funtua', 'Ingawa',
      'Jibia', 'Kafur', 'Kaita', 'Kankara', 'Kankia', 'Katsina', 'Kurfi', 'Kusada',
      'Mai\'Adua', 'Malumfashi', 'Mani', 'Mashi', 'Matazu', 'Musawa', 'Rimi', 'Sabuwa',
      'Safana', 'Sandamu', 'Zango'
    ]
  },
  {
    state: 'Kebbi',
    zone: 'North West',
    lgas: [
      'Aleiro', 'Arewa Dandi', 'Argungu', 'Augie', 'Bagudo', 'Birnin Kebbi', 'Bunza',
      'Dandi', 'Fakai', 'Gwandu', 'Jega', 'Kalgo', 'Koko/Besse', 'Maiyama', 'Ngaski',
      'Sakaba', 'Shanga', 'Suru', 'Wasagu/Danko', 'Yauri', 'Zuru'
    ]
  },
  {
    state: 'Jigawa',
    zone: 'North West',
    lgas: [
      'Auyo', 'Babura', 'Biriniwa', 'Birnin Kudu', 'Buji', 'Dutse', 'Gagarawa', 'Garki',
      'Gumel', 'Guri', 'Gwaram', 'Gwiwa', 'Hadejia', 'Jahun', 'Kafin Hausa', 'Kazaure',
      'Kiri Kasama', 'Kiyawa', 'Kaugama', 'Maigatari', 'Malam Madori', 'Miga', 'Ringim',
      'Roni', 'Sule Tankarkar', 'Taura', 'Yankwashi'
    ]
  },
  {
    state: 'Sokoto',
    zone: 'North West',
    lgas: [
      'Binji', 'Bodinga', 'Dange Shuni', 'Gada', 'Goronyo', 'Gudu', 'Gwadabawa', 'Illela',
      'Isa', 'Kebbe', 'Kware', 'Rabah', 'Sabon Birni', 'Shagari', 'Silame', 'Sokoto North',
      'Sokoto South', 'Tambuwal', 'Tangaza', 'Tureta', 'Wamako', 'Wurno', 'Yabo'
    ]
  },
  {
    state: 'Zamfara',
    zone: 'North West',
    lgas: [
      'Anka', 'Bakura', 'Birnin Magaji/Kiyaw', 'Bukkuyum', 'Bungudu', 'Gummi', 'Gusau',
      'Kaura Namoda', 'Maradun', 'Maru', 'Shinkafi', 'Talata Mafara', 'Chafe', 'Zurmi'
    ]
  }
];
