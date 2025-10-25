"""Management command to populate SQL concepts database"""

from django.core.management.base import BaseCommand
from learning.models import Concept


class Command(BaseCommand):
    help = '初始化SQL概念数据库'

    def handle(self, *args, **options):
        concepts = [
            {
                "name": "SELECT",
                "name_zh": "查询语句",
                "name_en": "SELECT Statement",
                "description": "SELECT语句用于从数据库中查询数据。这是最基本的SQL语句，用于指定需要检索哪些列的数据。语法：SELECT column1, column2 FROM table_name。可以使用*选择所有列。",
                "description_zh": "SELECT语句用于从数据库中查询数据。这是最基本的SQL语句，用于指定需要检索哪些列的数据。语法：SELECT column1, column2 FROM table_name。可以使用*选择所有列。",
                "description_en": "The SELECT statement is used to query data from a database. This is the most basic SQL statement, used to specify which columns of data to retrieve. Syntax: SELECT column1, column2 FROM table_name. You can use * to select all columns.",
                "difficulty_level": "beginner",
                "prerequisites": []
            },
            {
                "name": "WHERE",
                "name_zh": "条件筛选",
                "name_en": "WHERE Clause",
                "description": "WHERE子句用于过滤记录，只返回满足特定条件的数据。可以使用比较运算符（=, >, <, >=, <=, !=）和逻辑运算符（AND, OR, NOT）。语法：SELECT * FROM table WHERE condition。",
                "description_zh": "WHERE子句用于过滤记录，只返回满足特定条件的数据。可以使用比较运算符（=, >, <, >=, <=, !=）和逻辑运算符（AND, OR, NOT）。语法：SELECT * FROM table WHERE condition。",
                "description_en": "The WHERE clause is used to filter records, returning only data that meets specific conditions. You can use comparison operators (=, >, <, >=, <=, !=) and logical operators (AND, OR, NOT). Syntax: SELECT * FROM table WHERE condition.",
                "difficulty_level": "beginner",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "ORDER_BY",
                "name_zh": "结果排序",
                "name_en": "ORDER BY Clause",
                "description": "ORDER BY用于对查询结果进行排序。可以按升序（ASC）或降序（DESC）排列。可以指定多个列进行排序。语法：SELECT * FROM table ORDER BY column1 DESC, column2 ASC。",
                "description_zh": "ORDER BY用于对查询结果进行排序。可以按升序（ASC）或降序（DESC）排列。可以指定多个列进行排序。语法：SELECT * FROM table ORDER BY column1 DESC, column2 ASC。",
                "description_en": "ORDER BY is used to sort query results. You can arrange in ascending (ASC) or descending (DESC) order. You can specify multiple columns for sorting. Syntax: SELECT * FROM table ORDER BY column1 DESC, column2 ASC.",
                "difficulty_level": "beginner",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "LIMIT",
                "name_zh": "结果限制",
                "name_en": "LIMIT Clause",
                "description": "LIMIT子句用于限制查询返回的记录数量。常用于分页或只需要前几条记录的场景。语法：SELECT * FROM table LIMIT 10 或 LIMIT 10 OFFSET 20。",
                "description_zh": "LIMIT子句用于限制查询返回的记录数量。常用于分页或只需要前几条记录的场景。语法：SELECT * FROM table LIMIT 10 或 LIMIT 10 OFFSET 20。",
                "description_en": "The LIMIT clause is used to restrict the number of records returned by a query. Commonly used for pagination or when only the first few records are needed. Syntax: SELECT * FROM table LIMIT 10 or LIMIT 10 OFFSET 20.",
                "difficulty_level": "beginner",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "DISTINCT",
                "name_zh": "去重查询",
                "name_en": "DISTINCT Keyword",
                "description": "DISTINCT关键字用于去除查询结果中的重复记录，只返回唯一值。语法：SELECT DISTINCT column FROM table。常用于统计不同值的数量。",
                "description_zh": "DISTINCT关键字用于去除查询结果中的重复记录，只返回唯一值。语法：SELECT DISTINCT column FROM table。常用于统计不同值的数量。",
                "description_en": "The DISTINCT keyword is used to remove duplicate records from query results, returning only unique values. Syntax: SELECT DISTINCT column FROM table. Often used to count the number of different values.",
                "difficulty_level": "beginner",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "COUNT",
                "name_zh": "计数函数",
                "name_en": "COUNT Function",
                "description": "COUNT是聚合函数，用于计算记录数量。COUNT(*)统计所有行，COUNT(column)统计非NULL值的行数。常与GROUP BY配合使用。语法：SELECT COUNT(*) FROM table。",
                "description_zh": "COUNT是聚合函数，用于计算记录数量。COUNT(*)统计所有行，COUNT(column)统计非NULL值的行数。常与GROUP BY配合使用。语法：SELECT COUNT(*) FROM table。",
                "description_en": "COUNT is an aggregate function used to calculate the number of records. COUNT(*) counts all rows, COUNT(column) counts rows with non-NULL values. Often used with GROUP BY. Syntax: SELECT COUNT(*) FROM table.",
                "difficulty_level": "intermediate",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "SUM",
                "name_zh": "求和函数",
                "name_en": "SUM Function",
                "description": "SUM是聚合函数，用于计算数值列的总和。只能用于数值类型的列。常用于统计销售额、总分等场景。语法：SELECT SUM(amount) FROM orders。",
                "description_zh": "SUM是聚合函数，用于计算数值列的总和。只能用于数值类型的列。常用于统计销售额、总分等场景。语法：SELECT SUM(amount) FROM orders。",
                "description_en": "SUM is an aggregate function used to calculate the total of numeric columns. Can only be used with numeric column types. Commonly used for calculating sales totals, total scores, etc. Syntax: SELECT SUM(amount) FROM orders.",
                "difficulty_level": "intermediate",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "AVG",
                "name_zh": "平均值函数",
                "name_en": "AVG Function",
                "description": "AVG是聚合函数，用于计算数值列的平均值。自动忽略NULL值。常用于计算平均分、平均价格等。语法：SELECT AVG(score) FROM students。",
                "description_zh": "AVG是聚合函数，用于计算数值列的平均值。自动忽略NULL值。常用于计算平均分、平均价格等。语法：SELECT AVG(score) FROM students。",
                "description_en": "AVG is an aggregate function used to calculate the average of numeric columns. Automatically ignores NULL values. Commonly used for calculating average scores, average prices, etc. Syntax: SELECT AVG(score) FROM students.",
                "difficulty_level": "intermediate",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "MAX_MIN",
                "name_zh": "最值函数",
                "name_en": "MAX/MIN Functions",
                "description": "MAX和MIN是聚合函数，分别用于查找列的最大值和最小值。可用于数值、日期和字符串类型。语法：SELECT MAX(price), MIN(price) FROM products。",
                "description_zh": "MAX和MIN是聚合函数，分别用于查找列的最大值和最小值。可用于数值、日期和字符串类型。语法：SELECT MAX(price), MIN(price) FROM products。",
                "description_en": "MAX and MIN are aggregate functions used to find the maximum and minimum values of a column respectively. Can be used with numeric, date, and string types. Syntax: SELECT MAX(price), MIN(price) FROM products.",
                "difficulty_level": "intermediate",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "GROUP_BY",
                "name_zh": "分组查询",
                "name_en": "GROUP BY Clause",
                "description": "GROUP BY用于将查询结果按一个或多个列进行分组，通常与聚合函数配合使用。每个组会返回一行结果。语法：SELECT category, COUNT(*) FROM products GROUP BY category。",
                "description_zh": "GROUP BY用于将查询结果按一个或多个列进行分组，通常与聚合函数配合使用。每个组会返回一行结果。语法：SELECT category, COUNT(*) FROM products GROUP BY category。",
                "description_en": "GROUP BY is used to group query results by one or more columns, usually used with aggregate functions. Each group returns one row of results. Syntax: SELECT category, COUNT(*) FROM products GROUP BY category.",
                "difficulty_level": "intermediate",
                "prerequisites": ["SELECT", "COUNT"]
            },
            {
                "name": "HAVING",
                "name_zh": "分组筛选",
                "name_en": "HAVING Clause",
                "description": "HAVING子句用于过滤分组后的结果，类似于WHERE但用于聚合数据。必须与GROUP BY一起使用。语法：SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 5。",
                "description_zh": "HAVING子句用于过滤分组后的结果，类似于WHERE但用于聚合数据。必须与GROUP BY一起使用。语法：SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 5。",
                "description_en": "The HAVING clause is used to filter results after grouping, similar to WHERE but for aggregated data. Must be used with GROUP BY. Syntax: SELECT category, COUNT(*) FROM products GROUP BY category HAVING COUNT(*) > 5.",
                "difficulty_level": "intermediate",
                "prerequisites": ["GROUP_BY"]
            },
            {
                "name": "INNER_JOIN",
                "name_zh": "内连接",
                "name_en": "INNER JOIN",
                "description": "INNER JOIN用于连接两个表，只返回两个表中都匹配的记录。这是最常用的连接类型。语法：SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.foreign_id。常用于关联用户和订单、学生和成绩等。",
                "description_zh": "INNER JOIN用于连接两个表，只返回两个表中都匹配的记录。这是最常用的连接类型。语法：SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.foreign_id。常用于关联用户和订单、学生和成绩等。",
                "description_en": "INNER JOIN is used to connect two tables, returning only records that match in both tables. This is the most commonly used join type. Syntax: SELECT * FROM table1 INNER JOIN table2 ON table1.id = table2.foreign_id. Often used to relate users and orders, students and grades, etc.",
                "difficulty_level": "intermediate",
                "prerequisites": ["SELECT", "WHERE"]
            },
            {
                "name": "LEFT_JOIN",
                "name_zh": "左外连接",
                "name_en": "LEFT JOIN",
                "description": "LEFT JOIN（左外连接）返回左表的所有记录，以及右表中匹配的记录。如果右表没有匹配，则显示NULL。语法：SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.foreign_id。",
                "description_zh": "LEFT JOIN（左外连接）返回左表的所有记录，以及右表中匹配的记录。如果右表没有匹配，则显示NULL。语法：SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.foreign_id。",
                "description_en": "LEFT JOIN (left outer join) returns all records from the left table and matching records from the right table. If there is no match in the right table, NULL is displayed. Syntax: SELECT * FROM table1 LEFT JOIN table2 ON table1.id = table2.foreign_id.",
                "difficulty_level": "intermediate",
                "prerequisites": ["INNER_JOIN"]
            },
            {
                "name": "RIGHT_JOIN",
                "name_zh": "右外连接",
                "name_en": "RIGHT JOIN",
                "description": "RIGHT JOIN（右外连接）返回右表的所有记录，以及左表中匹配的记录。如果左表没有匹配，则显示NULL。语法：SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.foreign_id。",
                "description_zh": "RIGHT JOIN（右外连接）返回右表的所有记录，以及左表中匹配的记录。如果左表没有匹配，则显示NULL。语法：SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.foreign_id。",
                "description_en": "RIGHT JOIN (right outer join) returns all records from the right table and matching records from the left table. If there is no match in the left table, NULL is displayed. Syntax: SELECT * FROM table1 RIGHT JOIN table2 ON table1.id = table2.foreign_id.",
                "difficulty_level": "intermediate",
                "prerequisites": ["INNER_JOIN"]
            },
            {
                "name": "SUBQUERY",
                "name_zh": "子查询",
                "name_en": "Subquery",
                "description": "子查询是嵌套在另一个查询中的查询。可以用在SELECT、FROM、WHERE等子句中。子查询结果可作为条件或临时表使用。语法：SELECT * FROM table WHERE id IN (SELECT id FROM other_table WHERE condition)。",
                "description_zh": "子查询是嵌套在另一个查询中的查询。可以用在SELECT、FROM、WHERE等子句中。子查询结果可作为条件或临时表使用。语法：SELECT * FROM table WHERE id IN (SELECT id FROM other_table WHERE condition)。",
                "description_en": "A subquery is a query nested within another query. It can be used in SELECT, FROM, WHERE, and other clauses. Subquery results can be used as conditions or temporary tables. Syntax: SELECT * FROM table WHERE id IN (SELECT id FROM other_table WHERE condition).",
                "difficulty_level": "advanced",
                "prerequisites": ["SELECT", "WHERE"]
            },
            {
                "name": "UNION",
                "name_zh": "联合查询",
                "name_en": "UNION Operator",
                "description": "UNION用于合并多个SELECT语句的结果，自动去除重复行。UNION ALL保留重复行。要求各SELECT语句的列数和类型必须相同。语法：SELECT column FROM table1 UNION SELECT column FROM table2。",
                "description_zh": "UNION用于合并多个SELECT语句的结果，自动去除重复行。UNION ALL保留重复行。要求各SELECT语句的列数和类型必须相同。语法：SELECT column FROM table1 UNION SELECT column FROM table2。",
                "description_en": "UNION is used to combine the results of multiple SELECT statements, automatically removing duplicate rows. UNION ALL keeps duplicate rows. Requires that the number and types of columns in each SELECT statement match. Syntax: SELECT column FROM table1 UNION SELECT column FROM table2.",
                "difficulty_level": "advanced",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "CASE_WHEN",
                "name_zh": "条件表达式",
                "name_en": "CASE WHEN Expression",
                "description": "CASE表达式用于在查询中实现条件逻辑，类似于编程语言中的if-else。可以根据不同条件返回不同的值。语法：SELECT CASE WHEN condition THEN result1 ELSE result2 END FROM table。",
                "description_zh": "CASE表达式用于在查询中实现条件逻辑，类似于编程语言中的if-else。可以根据不同条件返回不同的值。语法：SELECT CASE WHEN condition THEN result1 ELSE result2 END FROM table。",
                "description_en": "CASE expression is used to implement conditional logic in queries, similar to if-else in programming languages. Can return different values based on different conditions. Syntax: SELECT CASE WHEN condition THEN result1 ELSE result2 END FROM table.",
                "difficulty_level": "advanced",
                "prerequisites": ["SELECT"]
            },
            {
                "name": "WINDOW_FUNCTION",
                "name_zh": "窗口函数",
                "name_en": "Window Function",
                "description": "窗口函数（如ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG）用于在结果集的窗口上执行计算，不减少行数。配合OVER子句使用。语法：SELECT ROW_NUMBER() OVER (PARTITION BY category ORDER BY price) FROM products。",
                "description_zh": "窗口函数（如ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG）用于在结果集的窗口上执行计算，不减少行数。配合OVER子句使用。语法：SELECT ROW_NUMBER() OVER (PARTITION BY category ORDER BY price) FROM products。",
                "description_en": "Window functions (such as ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG) are used to perform calculations over a window of result sets without reducing the number of rows. Used with the OVER clause. Syntax: SELECT ROW_NUMBER() OVER (PARTITION BY category ORDER BY price) FROM products.",
                "difficulty_level": "advanced",
                "prerequisites": ["SELECT", "ORDER_BY"]
            }
        ]

        created_count = 0
        updated_count = 0
        for concept_data in concepts:
            concept, created = Concept.objects.update_or_create(
                name=concept_data['name'],
                defaults={
                    'name_zh': concept_data['name_zh'],
                    'name_en': concept_data['name_en'],
                    'description': concept_data['description'],
                    'description_zh': concept_data['description_zh'],
                    'description_en': concept_data['description_en'],
                    'difficulty_level': concept_data['difficulty_level'],
                    'prerequisites': concept_data['prerequisites']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ 创建概念: {concept.name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ 更新概念: {concept.name}'))

        self.stdout.write(self.style.SUCCESS(f'\n完成！共创建 {created_count} 个新概念，更新 {updated_count} 个现有概念'))

