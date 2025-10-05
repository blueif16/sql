export const themes = {
  default: {
    name: "Default",
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
    name: "Harry Potter",
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
  }
};
