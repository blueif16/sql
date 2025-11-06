#!/usr/bin/env bash
# Manually populate the database with all required data

cd backend

echo "📊 Populating database..."
echo ""

echo "1️⃣ Populating SQL Concepts..."
DEBUG=True python manage.py populate_concepts
echo ""

echo "2️⃣ Populating Interest Areas..."
DEBUG=True python manage.py populate_interests
echo ""

echo "3️⃣ Populating Users..."
DEBUG=True python manage.py populate_data
echo ""

echo "✅ Database population complete!"
echo ""
echo "Checking data counts..."
DEBUG=True python manage.py shell -c "
from learning.models import Concept, InterestArea, User
print(f'Concepts: {Concept.objects.count()}')
print(f'Interest Areas: {InterestArea.objects.count()}')
print(f'Users: {User.objects.count()}')
"

