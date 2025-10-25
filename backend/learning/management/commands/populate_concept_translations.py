"""
管理命令：为Concept添加多语言翻译
"""
from django.core.management.base import BaseCommand
from learning.models import Concept

class Command(BaseCommand):
    help = '为现有的Concept添加中英文翻译'

    def handle(self, *args, **options):
        # Concept翻译映射
        translations = {
            'SELECT': {
                'name_en': 'SELECT',
                'name_zh': 'SELECT查询',
                'description_en': 'Retrieve data from database tables. The most fundamental SQL operation for querying data.',
                'description_zh': '从数据库表中检索数据。这是查询数据最基本的SQL操作。'
            },
            'WHERE': {
                'name_en': 'WHERE',
                'name_zh': 'WHERE条件',
                'description_en': 'Filter records based on specified conditions. Essential for targeted data retrieval.',
                'description_zh': '根据指定条件过滤记录。是针对性数据检索的关键。'
            },
            'ORDER_BY': {
                'name_en': 'ORDER BY',
                'name_zh': 'ORDER BY排序',
                'description_en': 'Sort query results in ascending or descending order based on one or more columns.',
                'description_zh': '根据一个或多个列对查询结果进行升序或降序排序。'
            },
            'GROUP_BY': {
                'name_en': 'GROUP BY',
                'name_zh': 'GROUP BY分组',
                'description_en': 'Group rows that have the same values in specified columns. Often used with aggregate functions.',
                'description_zh': '将具有相同值的行分组。通常与聚合函数一起使用。'
            },
            'HAVING': {
                'name_en': 'HAVING',
                'name_zh': 'HAVING条件',
                'description_en': 'Filter grouped records after GROUP BY. Similar to WHERE but for aggregated data.',
                'description_zh': '在GROUP BY之后过滤分组记录。类似于WHERE但用于聚合数据。'
            },
            'JOIN': {
                'name_en': 'JOIN',
                'name_zh': 'JOIN连接',
                'description_en': 'Combine rows from two or more tables based on related columns.',
                'description_zh': '根据相关列组合两个或多个表中的行。'
            },
            'INNER_JOIN': {
                'name_en': 'INNER JOIN',
                'name_zh': 'INNER JOIN内连接',
                'description_en': 'Return records that have matching values in both tables.',
                'description_zh': '返回两个表中具有匹配值的记录。'
            },
            'LEFT_JOIN': {
                'name_en': 'LEFT JOIN',
                'name_zh': 'LEFT JOIN左连接',
                'description_en': 'Return all records from the left table and matched records from the right table.',
                'description_zh': '返回左表的所有记录以及右表中匹配的记录。'
            },
            'RIGHT_JOIN': {
                'name_en': 'RIGHT JOIN',
                'name_zh': 'RIGHT JOIN右连接',
                'description_en': 'Return all records from the right table and matched records from the left table.',
                'description_zh': '返回右表的所有记录以及左表中匹配的记录。'
            },
            'FULL_OUTER_JOIN': {
                'name_en': 'FULL OUTER JOIN',
                'name_zh': 'FULL OUTER JOIN全外连接',
                'description_en': 'Return all records when there is a match in either left or right table.',
                'description_zh': '当左表或右表中有匹配时返回所有记录。'
            },
            'SUBQUERY': {
                'name_en': 'SUBQUERY',
                'name_zh': 'SUBQUERY子查询',
                'description_en': 'A query nested inside another query. Used to perform complex operations.',
                'description_zh': '嵌套在另一个查询中的查询。用于执行复杂操作。'
            },
            'AGGREGATE_FUNCTIONS': {
                'name_en': 'AGGREGATE FUNCTIONS',
                'name_zh': 'AGGREGATE FUNCTIONS聚合函数',
                'description_en': 'Functions like COUNT, SUM, AVG, MAX, MIN that operate on groups of rows.',
                'description_zh': 'COUNT、SUM、AVG、MAX、MIN等操作行组的函数。'
            },
            'CASE_WHEN': {
                'name_en': 'CASE WHEN',
                'name_zh': 'CASE WHEN条件表达式',
                'description_en': 'Conditional logic in SQL queries. Like if-else statements.',
                'description_zh': 'SQL查询中的条件逻辑。类似于if-else语句。'
            },
            'WINDOW_FUNCTIONS': {
                'name_en': 'WINDOW FUNCTIONS',
                'name_zh': 'WINDOW FUNCTIONS窗口函数',
                'description_en': 'Perform calculations across rows related to the current row. Like ROW_NUMBER, RANK, etc.',
                'description_zh': '对与当前行相关的行执行计算。如ROW_NUMBER、RANK等。'
            },
            'CTE': {
                'name_en': 'CTE (Common Table Expression)',
                'name_zh': 'CTE公共表表达式',
                'description_en': 'Temporary named result set defined with WITH clause. Makes complex queries more readable.',
                'description_zh': '使用WITH子句定义的临时命名结果集。使复杂查询更易读。'
            },
            'UNION': {
                'name_en': 'UNION',
                'name_zh': 'UNION联合',
                'description_en': 'Combine result sets of two or more SELECT statements.',
                'description_zh': '合并两个或多个SELECT语句的结果集。'
            },
            'DISTINCT': {
                'name_en': 'DISTINCT',
                'name_zh': 'DISTINCT去重',
                'description_en': 'Remove duplicate rows from the result set.',
                'description_zh': '从结果集中删除重复行。'
            },
            'LIMIT': {
                'name_en': 'LIMIT',
                'name_zh': 'LIMIT限制',
                'description_en': 'Limit the number of rows returned by a query.',
                'description_zh': '限制查询返回的行数。'
            },
        }
        
        updated_count = 0
        for concept in Concept.objects.all():
            if concept.name in translations:
                trans = translations[concept.name]
                concept.name_en = trans['name_en']
                concept.name_zh = trans['name_zh']
                concept.description_en = trans['description_en']
                concept.description_zh = trans['description_zh']
                concept.save()
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'Updated: {concept.name}'))
            else:
                # 如果没有预定义翻译，使用原名称
                if not concept.name_en:
                    concept.name_en = concept.name
                if not concept.name_zh:
                    concept.name_zh = concept.name
                if not concept.description_en:
                    concept.description_en = concept.description
                if not concept.description_zh:
                    concept.description_zh = concept.description
                concept.save()
                self.stdout.write(self.style.WARNING(f'Default: {concept.name}'))
        
        self.stdout.write(self.style.SUCCESS(f'\n成功更新 {updated_count} 个Concept的翻译'))

