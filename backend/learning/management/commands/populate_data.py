"""
Management command to populate database with sample data - Based on schema.sql
"""

from django.core.management.base import BaseCommand
from learning.models import User, UserRole, Preference, UserProgress


class Command(BaseCommand):
    help = 'Populate database with sample problems and user data'

    def handle(self, *args, **options):
        self.stdout.write('Populating database with sample data...')
        
        # Create test users
        self.create_users()
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database!'))

    def create_users(self):
        """Create test users with roles and preferences"""
        self.stdout.write('Creating users...')
        
        # Admin user
        admin, created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@test.com',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            admin.set_password('admin123')
            admin.save()
            # 信号已自动创建 UserRole，更新为 admin 角色
            UserRole.objects.filter(user=admin).update(role='admin')
            Preference.objects.create(
                user=admin,
                difficulty_preference='hard',
                learning_style='challenge',
                interest_areas=['database', 'system'],
                learned_concepts=['SELECT', 'WHERE', 'JOINS'],
                ui_theme='dark'
            )
            self.stdout.write(f'  Created admin user')
        
        # Test user
        testuser, created = User.objects.get_or_create(
            username='testuser',
            defaults={'email': 'user@test.com'}
        )
        if created:
            testuser.set_password('test123')
            testuser.save()
            # 信号已自动创建 UserRole 为 'user'，无需额外操作
            Preference.objects.create(
                user=testuser,
                difficulty_preference='easy',
                learning_style='guided',
                interest_areas=['movie', 'entertainment'],
                learned_concepts=['SELECT', 'WHERE'],
                ui_theme='light'
            )
            UserProgress.objects.create(user=testuser, solved_problem_ids=[])
            self.stdout.write(f'  Created test user')
