"""
Management commands for the SQL Learning Platform.
"""

from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from learning.models import Theme, Section, Concept, Problem
from learning.utils import get_theme_data


class Command(BaseCommand):
    help = 'Populate the database with initial learning data'

    def handle(self, *args, **options):
        self.stdout.write('Creating initial learning data...')
        
        # Create themes
        default_theme, created = Theme.objects.get_or_create(
            name='default',
            defaults={
                'display_name': 'Default',
                'description': 'Standard business database theme',
                'is_active': True
            }
        )
        
        harry_potter_theme, created = Theme.objects.get_or_create(
            name='harryPotter',
            defaults={
                'display_name': 'Harry Potter',
                'description': 'Magical world theme',
                'is_active': True
            }
        )
        
        # Create sections for default theme
        self.create_sections_for_theme(default_theme)
        self.create_sections_for_theme(harry_potter_theme)
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created initial learning data')
        )

    def create_sections_for_theme(self, theme):
        """Create sections and concepts for a theme."""
        theme_data = get_theme_data(theme.name)
        
        # Section 1: Querying Data
        section1, created = Section.objects.get_or_create(
            theme=theme,
            title='Section 1: Querying Data',
            defaults={
                'description': 'Foundation of database interaction',
                'order': 1,
                'is_active': True
            }
        )
        
        # SELECT FROM concept
        concept1, created = Concept.objects.get_or_create(
            section=section1,
            name='SELECT FROM',
            defaults={
                'explanation': 'SELECT FROM is the foundation of working with databases. Every time you need customer information, product details, or any data from your company\'s database, you use SELECT FROM.',
                'order': 1,
                'is_active': True
            }
        )
        
        # Create problems for SELECT FROM
        self.create_select_from_problems(concept1, theme_data)
        
        # Section 2: Sorting Data
        section2, created = Section.objects.get_or_create(
            theme=theme,
            title='Section 2: Sorting Data',
            defaults={
                'description': 'Organizing results meaningfully',
                'order': 2,
                'is_active': True
            }
        )
        
        # ORDER BY concept
        concept2, created = Concept.objects.get_or_create(
            section=section2,
            name='ORDER BY',
            defaults={
                'explanation': 'ORDER BY helps you organize data meaningfully. Want customers listed alphabetically? Sales sorted by highest revenue? ORDER BY makes data readable and actionable instead of random chaos.',
                'order': 1,
                'is_active': True
            }
        )
        
        # Create problems for ORDER BY
        self.create_order_by_problems(concept2, theme_data)
        
        # Section 3: Filtering Data
        section3, created = Section.objects.get_or_create(
            theme=theme,
            title='Section 3: Filtering Data',
            defaults={
                'description': 'Finding specific records and removing duplicates',
                'order': 3,
                'is_active': True
            }
        )
        
        # WHERE concept
        concept3, created = Concept.objects.get_or_create(
            section=section3,
            name='WHERE',
            defaults={
                'explanation': 'WHERE lets you find exactly what you need in massive databases. Instead of getting millions of records, you can find specific customers or products that meet specific criteria.',
                'order': 1,
                'is_active': True
            }
        )
        
        # Create problems for WHERE
        self.create_where_problems(concept3, theme_data)
        
        # DISTINCT concept
        concept4, created = Concept.objects.get_or_create(
            section=section3,
            name='DISTINCT',
            defaults={
                'explanation': 'DISTINCT removes duplicate rows from your query results. Essential when you want unique values like \'all countries we ship to\' or \'unique product categories\'. Eliminates messy repeated data.',
                'order': 2,
                'is_active': True
            }
        )
        
        # Create problems for DISTINCT
        self.create_distinct_problems(concept4, theme_data)

    def create_select_from_problems(self, concept, theme_data):
        """Create SELECT FROM problems."""
        is_harry_potter = theme_data['name'] == 'harryPotter'
        
        # Problem 1: Get all data
        Problem.objects.get_or_create(
            concept=concept,
            order=1,
            defaults={
                'task': 'Get ALL information about every student' if is_harry_potter else 'Get ALL information about every customer',
                'query': 'SELECT * FROM students' if is_harry_potter else 'SELECT * FROM customers',
                'expected_output': theme_data['customersData'],
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )
        
        # Problem 2: Get specific columns
        if is_harry_potter:
            expected_output = [{'wizard_name': row['wizard_name'], 'house': row['house']} for row in theme_data['customersData']]
        else:
            expected_output = [{'name': row['name'], 'country': row['country']} for row in theme_data['customersData']]
        
        Problem.objects.get_or_create(
            concept=concept,
            order=2,
            defaults={
                'task': 'Get only wizard names and their houses' if is_harry_potter else 'Get only customer names and their countries',
                'query': 'SELECT wizard_name, house FROM students' if is_harry_potter else 'SELECT name, country FROM customers',
                'expected_output': expected_output,
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )

    def create_order_by_problems(self, concept, theme_data):
        """Create ORDER BY problems."""
        is_harry_potter = theme_data['name'] == 'harryPotter'
        
        # Problem 1: Sort ascending
        if is_harry_potter:
            expected_output = sorted(theme_data['customersData'], key=lambda x: x['wizard_name'])
        else:
            expected_output = sorted(theme_data['customersData'], key=lambda x: x['name'])
        
        Problem.objects.get_or_create(
            concept=concept,
            order=1,
            defaults={
                'task': 'Get all students sorted by wizard name in alphabetical order' if is_harry_potter else 'Get all customers sorted by name in alphabetical order',
                'query': 'SELECT * FROM students ORDER BY wizard_name ASC' if is_harry_potter else 'SELECT * FROM customers ORDER BY name ASC',
                'expected_output': expected_output,
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )
        
        # Problem 2: Sort descending
        if is_harry_potter:
            result = [{'wizard_name': row['wizard_name'], 'house': row['house']} for row in theme_data['customersData']]
            expected_output = sorted(result, key=lambda x: x['house'], reverse=True)
        else:
            result = [{'name': row['name'], 'country': row['country']} for row in theme_data['customersData']]
            expected_output = sorted(result, key=lambda x: x['country'], reverse=True)
        
        Problem.objects.get_or_create(
            concept=concept,
            order=2,
            defaults={
                'task': 'Get wizard names and houses, sorted by house (Z to A)' if is_harry_potter else 'Get customer names and countries, sorted by country (Z to A)',
                'query': 'SELECT wizard_name, house FROM students ORDER BY house DESC' if is_harry_potter else 'SELECT name, country FROM customers ORDER BY country DESC',
                'expected_output': expected_output,
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )

    def create_where_problems(self, concept, theme_data):
        """Create WHERE problems."""
        is_harry_potter = theme_data['name'] == 'harryPotter'
        
        # Problem 1: Simple WHERE
        if is_harry_potter:
            expected_output = [row for row in theme_data['customersData'] if row['house'] == 'Gryffindor']
        else:
            expected_output = [row for row in theme_data['customersData'] if row['country'] == 'France']
        
        Problem.objects.get_or_create(
            concept=concept,
            order=1,
            defaults={
                'task': 'Get all students from Gryffindor House only' if is_harry_potter else 'Get all customers from France only',
                'query': 'SELECT * FROM students WHERE house = \'Gryffindor\'' if is_harry_potter else 'SELECT * FROM customers WHERE country = \'France\'',
                'expected_output': expected_output,
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )
        
        # Problem 2: WHERE with AND
        if is_harry_potter:
            expected_output = [{'spell_id': row['spell_id']} for row in theme_data['productsData'] if row['difficulty'] == 'Easy' and row['forbidden'] == 'Y']
        else:
            expected_output = [{'product_id': row['product_id']} for row in theme_data['productsData'] if row['low_fats'] == 'Y' and row['recyclable'] == 'Y']
        
        Problem.objects.get_or_create(
            concept=concept,
            order=2,
            defaults={
                'task': 'Find the IDs of spells that are both easy and forbidden' if is_harry_potter else 'Find the IDs of products that are both low fat and recyclable',
                'query': 'SELECT spell_id FROM spells WHERE difficulty = \'Easy\' AND forbidden = \'Y\'' if is_harry_potter else 'SELECT product_id FROM products WHERE low_fats = \'Y\' AND recyclable = \'Y\'',
                'expected_output': expected_output,
                'table_data': theme_data['productsData'],
                'table_name': theme_data['productsTableName'],
                'is_active': True
            }
        )

    def create_distinct_problems(self, concept, theme_data):
        """Create DISTINCT problems."""
        is_harry_potter = theme_data['name'] == 'harryPotter'
        
        # Problem 1: DISTINCT countries/houses
        if is_harry_potter:
            unique_houses = list(set(row['house'] for row in theme_data['customersData']))
            expected_output = [{'house': house} for house in unique_houses]
        else:
            unique_countries = list(set(row['country'] for row in theme_data['customersData']))
            expected_output = [{'country': country} for country in unique_countries]
        
        Problem.objects.get_or_create(
            concept=concept,
            order=1,
            defaults={
                'task': 'Get unique houses from all students (no duplicates)' if is_harry_potter else 'Get unique countries from all customers (no duplicates)',
                'query': 'SELECT DISTINCT house FROM students' if is_harry_potter else 'SELECT DISTINCT country FROM customers',
                'expected_output': expected_output,
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )
        
        # Problem 2: DISTINCT companies/wand cores
        if is_harry_potter:
            unique_cores = list(set(row['wand_core'] for row in theme_data['customersData']))
            expected_output = [{'wand_core': core} for core in unique_cores]
        else:
            unique_companies = list(set(row['company'] for row in theme_data['customersData']))
            expected_output = [{'company': company} for company in unique_companies]
        
        Problem.objects.get_or_create(
            concept=concept,
            order=2,
            defaults={
                'task': 'Get unique wand cores from students' if is_harry_potter else 'Get unique company names from customers',
                'query': 'SELECT DISTINCT wand_core FROM students' if is_harry_potter else 'SELECT DISTINCT company FROM customers',
                'expected_output': expected_output,
                'table_data': theme_data['customersData'],
                'table_name': theme_data['tableName'],
                'is_active': True
            }
        )
