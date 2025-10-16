export const themes = {
  default: {
    id: 'default',
    name: "默认",
    icon: "🏢",
    customersData: [
      { id: 103, name: "Carine", company: "Atelier graphique", country: "France", phone: "40.32.2555" },
      { id: 112, name: "Jean", company: "Signal Gift Stores", country: "USA", phone: "7025551838" },
      { id: 114, name: "Peter", company: "Australian Collectors", country: "Australia", phone: "03 9520 4555" },
      { id: 119, name: "Janine", company: "La Rochelle Gifts", country: "France", phone: "40.67.8555" },
      { id: 121, name: "Jonas", company: "Baane Mini Imports", country: "Norway", phone: "07-98 9555" }
    ],
    productsData: [
      { product_id: 0, low_fats: "Y", recyclable: "N" },
      { product_id: 1, low_fats: "Y", recyclable: "Y" },
      { product_id: 2, low_fats: "N", recyclable: "Y" },
      { product_id: 3, low_fats: "Y", recyclable: "Y" },
      { product_id: 4, low_fats: "N", recyclable: "N" }
    ],
    tableName: "customers",
    productsTableName: "products"
  },
  harryPotter: {
    id: 'harryPotter',
    name: "哈利波特",
    icon: "🧙",
    customersData: [
      { student_id: 103, wizard_name: "Harry Potter", house: "Gryffindor", year: "7th", wand_core: "Phoenix Feather" },
      { student_id: 112, wizard_name: "Hermione Granger", house: "Gryffindor", year: "7th", wand_core: "Dragon Heartstring" },
      { student_id: 114, wizard_name: "Ron Weasley", house: "Gryffindor", year: "7th", wand_core: "Unicorn Hair" },
      { student_id: 119, wizard_name: "Draco Malfoy", house: "Slytherin", year: "7th", wand_core: "Unicorn Hair" },
      { student_id: 121, wizard_name: "Luna Lovegood", house: "Ravenclaw", year: "6th", wand_core: "Phoenix Feather" }
    ],
    productsData: [
      { spell_id: 0, difficulty: "Easy", forbidden: "N" },
      { spell_id: 1, difficulty: "Easy", forbidden: "Y" },
      { spell_id: 2, difficulty: "Hard", forbidden: "Y" },
      { spell_id: 3, difficulty: "Easy", forbidden: "Y" },
      { spell_id: 4, difficulty: "Hard", forbidden: "N" }
    ],
    tableName: "students",
    productsTableName: "spells"
  },
  titanic: {
    id: 'titanic',
    name: "泰坦尼克号",
    icon: "🚢",
    customersData: [
      { passenger_id: 103, passenger_name: "Jack Dawson", class: "3rd Class", cabin: "Lower Deck", survived: "Yes" },
      { passenger_id: 112, passenger_name: "Rose DeWitt Bukater", class: "1st Class", cabin: "B-52", survived: "Yes" },
      { passenger_id: 114, passenger_name: "Cal Hockley", class: "1st Class", cabin: "B-58", survived: "Yes" },
      { passenger_id: 119, passenger_name: "Molly Brown", class: "1st Class", cabin: "B-82", survived: "Yes" },
      { passenger_id: 121, passenger_name: "Thomas Andrews", class: "Officer", cabin: "A-36", survived: "No" }
    ],
    productsData: [
      { item_id: 0, item_type: "Jewelry", valuable: "Y" },
      { item_id: 1, item_type: "Clothing", valuable: "N" },
      { item_id: 2, item_type: "Jewelry", valuable: "Y" },
      { item_id: 3, item_type: "Document", valuable: "Y" },
      { item_id: 4, item_type: "Furniture", valuable: "N" }
    ],
    tableName: "passengers",
    productsTableName: "items"
  },
  music: {
    id: 'music',
    name: "音乐",
    icon: "🎵",
    customersData: [
      { artist_id: 103, artist_name: "Taylor Swift", genre: "Pop", country: "USA", albums: "10" },
      { artist_id: 112, artist_name: "Ed Sheeran", genre: "Pop", country: "UK", albums: "5" },
      { artist_id: 114, artist_name: "Beyoncé", genre: "R&B", country: "USA", albums: "8" },
      { artist_id: 119, artist_name: "Drake", genre: "Hip Hop", country: "Canada", albums: "7" },
      { artist_id: 121, artist_name: "Adele", genre: "Soul", country: "UK", albums: "4" }
    ],
    productsData: [
      { song_id: 0, hit_single: "Y", platinum: "Y" },
      { song_id: 1, hit_single: "Y", platinum: "N" },
      { song_id: 2, hit_single: "N", platinum: "Y" },
      { song_id: 3, hit_single: "Y", platinum: "Y" },
      { song_id: 4, hit_single: "N", platinum: "N" }
    ],
    tableName: "artists",
    productsTableName: "songs"
  },
  starWars: {
    id: 'starWars',
    name: "星球大战",
    icon: "⚔️",
    customersData: [
      { character_id: 103, character_name: "Luke Skywalker", side: "Light", planet: "Tatooine", force_sensitive: "Yes" },
      { character_id: 112, character_name: "Darth Vader", side: "Dark", planet: "Mustafar", force_sensitive: "Yes" },
      { character_id: 114, character_name: "Princess Leia", side: "Light", planet: "Alderaan", force_sensitive: "Yes" },
      { character_id: 119, character_name: "Han Solo", side: "Light", planet: "Corellia", force_sensitive: "No" },
      { character_id: 121, character_name: "Yoda", side: "Light", planet: "Dagobah", force_sensitive: "Yes" }
    ],
    productsData: [
      { weapon_id: 0, type: "Lightsaber", dangerous: "Y" },
      { weapon_id: 1, type: "Blaster", dangerous: "Y" },
      { weapon_id: 2, type: "Lightsaber", dangerous: "Y" },
      { weapon_id: 3, type: "Blaster", dangerous: "N" },
      { weapon_id: 4, type: "Force", dangerous: "N" }
    ],
    tableName: "characters",
    productsTableName: "weapons"
  },
  pokemon: {
    id: 'pokemon',
    name: "宝可梦",
    icon: "⚡",
    customersData: [
      { pokemon_id: 103, pokemon_name: "Pikachu", type: "Electric", region: "Kanto", evolution: "2nd" },
      { pokemon_id: 112, pokemon_name: "Charizard", type: "Fire", region: "Kanto", evolution: "3rd" },
      { pokemon_id: 114, pokemon_name: "Blastoise", type: "Water", region: "Kanto", evolution: "3rd" },
      { pokemon_id: 119, pokemon_name: "Mewtwo", type: "Psychic", region: "Kanto", evolution: "1st" },
      { pokemon_id: 121, pokemon_name: "Dragonite", type: "Dragon", region: "Kanto", evolution: "3rd" }
    ],
    productsData: [
      { item_id: 0, item_type: "Potion", rare: "N" },
      { item_id: 1, item_type: "Master Ball", rare: "Y" },
      { item_id: 2, item_type: "Rare Candy", rare: "Y" },
      { item_id: 3, item_type: "Potion", rare: "N" },
      { item_id: 4, item_type: "TM", rare: "Y" }
    ],
    tableName: "pokemon",
    productsTableName: "items"
  }
};
