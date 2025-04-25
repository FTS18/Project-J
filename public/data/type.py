import json
import re

# Load the existing data.json
with open('data.json', 'r') as f:
    data = json.load(f)

# Function to categorize the institute based on its name
def categorize_institute(institute_name):
    # Trim and normalize multiple spaces to a single space
    institute_name = ' '.join(institute_name.split()).lower()
    
    # Explicit checks to categorize based on keywords
    if 'indian institute of technology' in institute_name or 'iit' in institute_name:
        if 'information technology' not in institute_name:  # Exclude IIITs with IIT in the name
            return 'IIT'
        else:
            return 'IIIT'
    elif 'indian institute of information technology' in institute_name or 'iiit' in institute_name:
        return 'IIIT'
    elif 'national institute of technology' in institute_name or 'nit' in institute_name:
        return 'NIT'
    else:
        return 'GFTI'

# Create sets (to ensure uniqueness) for each category
iit_institutes = set()
iiit_institutes = set()
nit_institutes = set()
gfti_institutes = set()

# Loop through each entry and categorize the institutes
for entry in data:
    institute_name = entry.get("institute", "")
    category = categorize_institute(institute_name)
    
    if category == 'IIT':
        iit_institutes.add(institute_name)
    elif category == 'IIIT':
        iiit_institutes.add(institute_name)
    elif category == 'NIT':
        nit_institutes.add(institute_name)
    else:
        gfti_institutes.add(institute_name)

# Create a new dictionary with the filtered categories
categorized_data = {
    'IIT': list(iit_institutes),
    'IIIT': list(iiit_institutes),
    'NIT': list(nit_institutes),
    'GFTI': list(gfti_institutes)
}

# Save the categorized data to a new JSON file
with open('categorized_institutes_unique.json', 'w') as f:
    json.dump(categorized_data, f, indent=4)

print("Successfully categorized the unique institutes and saved to 'categorized_institutes_unique.json'.")
