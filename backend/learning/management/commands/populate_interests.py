"""Management command to populate interest areas database"""

from django.core.management.base import BaseCommand
from learning.models import InterestArea


class Command(BaseCommand):
    help = '初始化兴趣领域数据库'

    def handle(self, *args, **options):
        interests = [
            # Entertainment
            {"name": "movie", "display_name": "电影娱乐", "display_name_zh": "电影娱乐", "display_name_en": "Movies", "description": "关于电影、演员、票房等数据的题目", "description_zh": "关于电影、演员、票房等数据的题目", "description_en": "Problems about movies, actors, box office, and related data", "icon": "🎬", "category": "entertainment"},
            {"name": "music", "display_name": "音乐", "display_name_zh": "音乐", "display_name_en": "Music", "description": "关于音乐、歌手、专辑等数据的题目", "description_zh": "关于音乐、歌手、专辑等数据的题目", "description_en": "Problems about music, singers, albums, and related data", "icon": "🎵", "category": "entertainment"},
            {"name": "tv_show", "display_name": "电视剧", "display_name_zh": "电视剧", "display_name_en": "TV Shows", "description": "关于电视剧、剧集、收视率等数据的题目", "description_zh": "关于电视剧、剧集、收视率等数据的题目", "description_en": "Problems about TV shows, episodes, ratings, and related data", "icon": "📺", "category": "entertainment"},
            {"name": "gaming", "display_name": "游戏", "display_name_zh": "游戏", "display_name_en": "Gaming", "description": "关于游戏、玩家、游戏数据等的题目", "description_zh": "关于游戏、玩家、游戏数据等的题目", "description_en": "Problems about games, players, gaming data, and related topics", "icon": "🎮", "category": "entertainment"},
            
            # Sports
            {"name": "football", "display_name": "足球", "display_name_zh": "足球", "display_name_en": "Football", "description": "关于足球、球员、比赛等数据的题目", "description_zh": "关于足球、球员、比赛等数据的题目", "description_en": "Problems about football, players, matches, and related data", "icon": "⚽", "category": "sports"},
            {"name": "basketball", "display_name": "篮球", "display_name_zh": "篮球", "display_name_en": "Basketball", "description": "关于篮球、NBA、球员等数据的题目", "description_zh": "关于篮球、NBA、球员等数据的题目", "description_en": "Problems about basketball, NBA, players, and related data", "icon": "🏀", "category": "sports"},
            {"name": "olympics", "display_name": "奥运会", "display_name_zh": "奥运会", "display_name_en": "Olympics", "description": "关于奥运会、运动员、奖牌等数据的题目", "description_zh": "关于奥运会、运动员、奖牌等数据的题目", "description_en": "Problems about Olympics, athletes, medals, and related data", "icon": "🏅", "category": "sports"},
            
            # Business
            {"name": "ecommerce", "display_name": "电商", "display_name_zh": "电商", "display_name_en": "E-commerce", "description": "关于在线购物、订单、产品等数据的题目", "description_zh": "关于在线购物、订单、产品等数据的题目", "description_en": "Problems about online shopping, orders, products, and related data", "icon": "🛒", "category": "business"},
            {"name": "finance", "display_name": "金融", "display_name_zh": "金融", "display_name_en": "Finance", "description": "关于股票、交易、投资等数据的题目", "description_zh": "关于股票、交易、投资等数据的题目", "description_en": "Problems about stocks, trading, investments, and related data", "icon": "💰", "category": "business"},
            {"name": "hr", "display_name": "人力资源", "display_name_zh": "人力资源", "display_name_en": "Human Resources", "description": "关于员工、薪资、部门等数据的题目", "description_zh": "关于员工、薪资、部门等数据的题目", "description_en": "Problems about employees, salaries, departments, and related data", "icon": "👥", "category": "business"},
            {"name": "restaurant", "display_name": "餐饮", "display_name_zh": "餐饮", "display_name_en": "Restaurant", "description": "关于餐厅、菜单、订单等数据的题目", "description_zh": "关于餐厅、菜单、订单等数据的题目", "description_en": "Problems about restaurants, menus, orders, and related data", "icon": "🍽️", "category": "business"},
            
            # Technology
            {"name": "social_media", "display_name": "社交媒体", "display_name_zh": "社交媒体", "display_name_en": "Social Media", "description": "关于用户、帖子、互动等数据的题目", "description_zh": "关于用户、帖子、互动等数据的题目", "description_en": "Problems about users, posts, interactions, and related data", "icon": "📱", "category": "technology"},
            {"name": "software", "display_name": "软件开发", "display_name_zh": "软件开发", "display_name_en": "Software Development", "description": "关于项目、bug、代码等数据的题目", "description_zh": "关于项目、bug、代码等数据的题目", "description_en": "Problems about projects, bugs, code, and related data", "icon": "💻", "category": "technology"},
            
            # Education
            {"name": "school", "display_name": "学校教育", "display_name_zh": "学校教育", "display_name_en": "School Education", "description": "关于学生、课程、成绩等数据的题目", "description_zh": "关于学生、课程、成绩等数据的题目", "description_en": "Problems about students, courses, grades, and related data", "icon": "🎓", "category": "education"},
            {"name": "online_learning", "display_name": "在线学习", "display_name_zh": "在线学习", "display_name_en": "Online Learning", "description": "关于在线课程、学员、进度等数据的题目", "description_zh": "关于在线课程、学员、进度等数据的题目", "description_en": "Problems about online courses, learners, progress, and related data", "icon": "📚", "category": "education"},
            
            # Travel & Transportation
            {"name": "travel", "display_name": "旅游", "display_name_zh": "旅游", "display_name_en": "Travel", "description": "关于旅行、酒店、景点等数据的题目", "description_zh": "关于旅行、酒店、景点等数据的题目", "description_en": "Problems about travel, hotels, attractions, and related data", "icon": "✈️", "category": "travel"},
            {"name": "transportation", "display_name": "交通运输", "display_name_zh": "交通运输", "display_name_en": "Transportation", "description": "关于航班、车票、物流等数据的题目", "description_zh": "关于航班、车票、物流等数据的题目", "description_en": "Problems about flights, tickets, logistics, and related data", "icon": "🚗", "category": "travel"},
            
            # Health
            {"name": "healthcare", "display_name": "医疗健康", "display_name_zh": "医疗健康", "display_name_en": "Healthcare", "description": "关于病人、诊断、治疗等数据的题目", "description_zh": "关于病人、诊断、治疗等数据的题目", "description_en": "Problems about patients, diagnosis, treatment, and related data", "icon": "🏥", "category": "health"},
            {"name": "fitness", "display_name": "健身运动", "display_name_zh": "健身运动", "display_name_en": "Fitness", "description": "关于健身、锻炼、健康数据的题目", "description_zh": "关于健身、锻炼、健康数据的题目", "description_en": "Problems about fitness, workouts, health data, and related topics", "icon": "💪", "category": "health"},
        ]

        created_count = 0
        updated_count = 0
        for interest_data in interests:
            interest, created = InterestArea.objects.update_or_create(
                name=interest_data['name'],
                defaults={
                    'display_name': interest_data['display_name'],
                    'display_name_zh': interest_data['display_name_zh'],
                    'display_name_en': interest_data['display_name_en'],
                    'description': interest_data['description'],
                    'description_zh': interest_data['description_zh'],
                    'description_en': interest_data['description_en'],
                    'icon': interest_data['icon'],
                    'category': interest_data['category']
                }
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ 创建兴趣领域: {interest.display_name}'))
            else:
                updated_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ 更新兴趣领域: {interest.display_name}'))

        self.stdout.write(self.style.SUCCESS(f'\n完成！共创建 {created_count} 个新兴趣领域，更新 {updated_count} 个现有兴趣领域'))

