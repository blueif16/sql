import { themes } from '../data/themes';

export const getSections = (currentTheme = 'default') => {
  const themeData = themes[currentTheme] || themes.default;
  const isHarryPotter = currentTheme === 'harryPotter';
  
  return [
    {
      title: "Section 1: Querying Data",
      description: "Foundation of database interaction",
      concepts: [
        {
          name: "SELECT FROM",
          explanation: "SELECT FROM is the foundation of working with databases. Every time you need customer information, product details, or any data from your company's database, you use SELECT FROM.",
          problems: [
            {
              id: 1,
              task: isHarryPotter ? "Get ALL information about every student" : "Get ALL information about every customer",
              query: isHarryPotter ? "SELECT * FROM students" : "SELECT * FROM customers",
              expectedOutput: themeData.customersData,
              tableData: themeData.customersData,
              tableName: themeData.tableName
            },
            {
              id: 2,
              task: isHarryPotter ? "Get only wizard names and their houses" : "Get only customer names and their countries",
              query: isHarryPotter ? "SELECT wizard_name, house FROM students" : "SELECT name, country FROM customers",
              expectedOutput: isHarryPotter 
                ? themeData.customersData.map(row => ({ wizard_name: row.wizard_name, house: row.house }))
                : themeData.customersData.map(row => ({ name: row.name, country: row.country })),
              tableData: themeData.customersData,
              tableName: themeData.tableName
            }
          ]
        }
      ]
    },
    {
      title: "Section 2: Sorting Data", 
      description: "Organizing results meaningfully",
      concepts: [
        {
          name: "ORDER BY",
          explanation: "ORDER BY helps you organize data meaningfully. Want customers listed alphabetically? Sales sorted by highest revenue? ORDER BY makes data readable and actionable instead of random chaos.",
          problems: [
            {
              id: 1,
              task: isHarryPotter ? "Get all students sorted by wizard name in alphabetical order" : "Get all customers sorted by name in alphabetical order",
              query: isHarryPotter ? "SELECT * FROM students ORDER BY wizard_name ASC" : "SELECT * FROM customers ORDER BY name ASC",
              expectedOutput: isHarryPotter 
                ? [...themeData.customersData].sort((a, b) => a.wizard_name.localeCompare(b.wizard_name))
                : [...themeData.customersData].sort((a, b) => a.name.localeCompare(b.name)),
              tableData: themeData.customersData,
              tableName: themeData.tableName
            },
            {
              id: 2,
              task: isHarryPotter ? "Get wizard names and houses, sorted by house (Z to A)" : "Get customer names and countries, sorted by country (Z to A)",
              query: isHarryPotter ? "SELECT wizard_name, house FROM students ORDER BY house DESC" : "SELECT name, country FROM customers ORDER BY country DESC",
              expectedOutput: isHarryPotter
                ? themeData.customersData.map(row => ({ wizard_name: row.wizard_name, house: row.house })).sort((a, b) => b.house.localeCompare(a.house))
                : themeData.customersData.map(row => ({ name: row.name, country: row.country })).sort((a, b) => b.country.localeCompare(a.country)),
              tableData: themeData.customersData,
              tableName: themeData.tableName
            }
          ]
        }
      ]
    },
    {
      title: "Section 3: Filtering Data",
      description: "Finding specific records and removing duplicates",
      concepts: [
        {
          name: "WHERE",
          explanation: "WHERE lets you find exactly what you need in massive databases. Instead of getting millions of records, you can find specific customers or products that meet specific criteria.",
          problems: [
            {
              id: 1,
              task: isHarryPotter ? "Get all students from Gryffindor House only" : "Get all customers from France only",
              query: isHarryPotter ? "SELECT * FROM students WHERE house = 'Gryffindor'" : "SELECT * FROM customers WHERE country = 'France'",
              expectedOutput: isHarryPotter 
                ? themeData.customersData.filter(row => row.house === 'Gryffindor')
                : themeData.customersData.filter(row => row.country === 'France'),
              tableData: themeData.customersData,
              tableName: themeData.tableName
            },
            {
              id: 2,
              task: isHarryPotter ? "Find the IDs of spells that are both easy and forbidden" : "Find the IDs of products that are both low fat and recyclable",
              query: isHarryPotter ? "SELECT spell_id FROM spells WHERE difficulty = 'Easy' AND forbidden = 'Y'" : "SELECT product_id FROM products WHERE low_fats = 'Y' AND recyclable = 'Y'",
              expectedOutput: isHarryPotter
                ? themeData.productsData.filter(row => row.difficulty === 'Easy' && row.forbidden === 'Y').map(row => ({ spell_id: row.spell_id }))
                : themeData.productsData.filter(row => row.low_fats === 'Y' && row.recyclable === 'Y').map(row => ({ product_id: row.product_id })),
              tableData: themeData.productsData,
              tableName: themeData.productsTableName
            }
          ]
        },
        {
          name: "DISTINCT",
          explanation: "DISTINCT removes duplicate rows from your query results. Essential when you want unique values like 'all countries we ship to' or 'unique product categories'. Eliminates messy repeated data.",
          problems: [
            {
              id: 1,
              task: isHarryPotter ? "Get unique houses from all students (no duplicates)" : "Get unique countries from all customers (no duplicates)",
              query: isHarryPotter ? "SELECT DISTINCT house FROM students" : "SELECT DISTINCT country FROM customers",
              expectedOutput: isHarryPotter
                ? [...new Set(themeData.customersData.map(row => row.house))].map(house => ({ house }))
                : [...new Set(themeData.customersData.map(row => row.country))].map(country => ({ country })),
              tableData: themeData.customersData,
              tableName: themeData.tableName
            },
            {
              id: 2,
              task: isHarryPotter ? "Get unique wand cores from students" : "Get unique company names from customers",
              query: isHarryPotter ? "SELECT DISTINCT wand_core FROM students" : "SELECT DISTINCT company FROM customers",
              expectedOutput: isHarryPotter
                ? [...new Set(themeData.customersData.map(row => row.wand_core))].map(wand_core => ({ wand_core }))
                : [...new Set(themeData.customersData.map(row => row.company))].map(company => ({ company })),
              tableData: themeData.customersData,
              tableName: themeData.tableName
            }
          ]
        }
      ]
    }
  ];
};
