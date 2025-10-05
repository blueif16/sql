"""
Utility functions for query execution and validation.
"""

import json
import re


def execute_query(query, table_data, expected_table_name):
    """
    Execute a SQL-like query on the provided table data.
    Returns a dictionary with 'isValid' and 'data' keys.
    """
    if not query or not table_data:
        return None
    
    try:
        # Clean and normalize the query
        clean_query = query.strip().replace(';', '')
        normalized_query = clean_query.lower()
        
        # Basic validation
        if not normalized_query.startswith('select') or 'from' not in normalized_query:
            return None
        
        # Extract table name from FROM clause
        from_match = re.search(r'from\s+(\w+)', normalized_query)
        if not from_match:
            return None
        
        table_name = from_match.group(1)
        if table_name != expected_table_name.lower():
            return None
        
        # Start with all data
        current_data = list(table_data)
        
        # Handle SELECT clause
        select_match = re.search(r'select\s+(.*?)\s+from', normalized_query)
        if not select_match:
            return None
        
        select_clause = select_match.group(1).strip()
        
        if select_clause != '*':
            if 'distinct' in select_clause:
                # Handle DISTINCT
                distinct_match = re.search(r'distinct\s+(.*)', select_clause)
                if distinct_match:
                    columns = [col.strip() for col in distinct_match.group(1).split(',')]
                    # Filter columns
                    current_data = [{col: row[col] for col in columns if col in row} for row in current_data]
                    # Remove duplicates
                    seen = set()
                    unique_data = []
                    for row in current_data:
                        key = tuple(row.items())
                        if key not in seen:
                            seen.add(key)
                            unique_data.append(row)
                    current_data = unique_data
            else:
                # Handle regular column selection
                columns = [col.strip() for col in select_clause.split(',')]
                current_data = [{col: row[col] for col in columns if col in row} for row in current_data]
        
        # Handle WHERE clause
        if 'where' in normalized_query:
            where_start = normalized_query.find('where') + 5
            order_by_index = normalized_query.find('order by')
            where_end = order_by_index if order_by_index != -1 else len(normalized_query)
            where_clause = normalized_query[where_start:where_end].strip()
            
            # Simple equality conditions
            if '=' in where_clause:
                parts = where_clause.split('=')
                if len(parts) == 2:
                    column = parts[0].strip()
                    value = parts[1].strip().strip('\'"`')
                    
                    current_data = [row for row in current_data if str(row.get(column, '')).lower() == value.lower()]
        
        # Handle ORDER BY clause
        if 'order by' in normalized_query:
            order_match = re.search(r'order\s+by\s+(\w+)(?:\s+(asc|desc))?', normalized_query)
            if order_match:
                column = order_match.group(1)
                direction = order_match.group(2) or 'asc'
                
                if current_data and column in current_data[0]:
                    current_data.sort(key=lambda x: str(x.get(column, '')), reverse=(direction == 'desc'))
        
        return {
            'isValid': True,
            'data': current_data
        }
        
    except Exception as e:
        return None


def validate_query(query):
    """
    Validate a SQL query for basic syntax.
    Returns True if valid, False otherwise.
    """
    if not query:
        return False
    
    normalized = query.lower().strip()
    
    # Must start with SELECT
    if not normalized.startswith('select'):
        return False
    
    # Must have FROM clause
    if 'from' not in normalized:
        return False
    
    # Basic structure validation
    select_from_match = re.search(r'select\s+.*?\s+from\s+\w+', normalized)
    if not select_from_match:
        return False
    
    return True


def get_theme_data(theme_name='default'):
    """
    Get theme data for the frontend.
    """
    themes = {
        'default': {
            'name': 'default',
            'display_name': 'Default',
            'customersData': [
                {'id': 103, 'name': 'Carine', 'company': 'Atelier graphique', 'country': 'France', 'phone': '40.32.2555'},
                {'id': 112, 'name': 'Jean', 'company': 'Signal Gift Stores', 'country': 'USA', 'phone': '7025551838'},
                {'id': 114, 'name': 'Peter', 'company': 'Australian Collectors', 'country': 'Australia', 'phone': '03 9520 4555'},
                {'id': 119, 'name': 'Janine', 'company': 'La Rochelle Gifts', 'country': 'France', 'phone': '40.67.8555'},
                {'id': 121, 'name': 'Jonas', 'company': 'Baane Mini Imports', 'country': 'Norway', 'phone': '07-98 9555'}
            ],
            'productsData': [
                {'product_id': 0, 'low_fats': 'Y', 'recyclable': 'N'},
                {'product_id': 1, 'low_fats': 'Y', 'recyclable': 'Y'},
                {'product_id': 2, 'low_fats': 'N', 'recyclable': 'Y'},
                {'product_id': 3, 'low_fats': 'Y', 'recyclable': 'Y'},
                {'product_id': 4, 'low_fats': 'N', 'recyclable': 'N'}
            ],
            'tableName': 'customers',
            'productsTableName': 'products'
        },
        'harryPotter': {
            'name': 'harryPotter',
            'display_name': 'Harry Potter',
            'customersData': [
                {'student_id': 103, 'wizard_name': 'Harry Potter', 'house': 'Gryffindor', 'year': '7th', 'wand_core': 'Phoenix Feather'},
                {'student_id': 112, 'wizard_name': 'Hermione Granger', 'house': 'Gryffindor', 'year': '7th', 'wand_core': 'Dragon Heartstring'},
                {'student_id': 114, 'wizard_name': 'Ron Weasley', 'house': 'Gryffindor', 'year': '7th', 'wand_core': 'Unicorn Hair'},
                {'student_id': 119, 'wizard_name': 'Draco Malfoy', 'house': 'Slytherin', 'year': '7th', 'wand_core': 'Unicorn Hair'},
                {'student_id': 121, 'wizard_name': 'Luna Lovegood', 'house': 'Ravenclaw', 'year': '6th', 'wand_core': 'Phoenix Feather'}
            ],
            'productsData': [
                {'spell_id': 0, 'difficulty': 'Easy', 'forbidden': 'N'},
                {'spell_id': 1, 'difficulty': 'Easy', 'forbidden': 'Y'},
                {'spell_id': 2, 'difficulty': 'Hard', 'forbidden': 'Y'},
                {'spell_id': 3, 'difficulty': 'Easy', 'forbidden': 'Y'},
                {'spell_id': 4, 'difficulty': 'Hard', 'forbidden': 'N'}
            ],
            'tableName': 'students',
            'productsTableName': 'spells'
        }
    }
    
    return themes.get(theme_name, themes['default'])
