import json

# Load the existing data.json
with open('data.json', 'r') as f:
    data = json.load(f)

# Load the categorized institute names from the new categorization file
with open('categorized_institutes_unique.json', 'r') as f:
    categorized_data = json.load(f)

# Function to categorize the institute based on its name
def categorize_institute(institute_name):
    # Trim and normalize multiple spaces to a single space
    institute_name = ' '.join(institute_name.split()).lower()
    
    # Explicit checks for special cases
    if "indian institute of engineering science and technology, shibpur" in institute_name:
        return 'NIT'
    elif "international institute of information technology, naya raipur" in institute_name:
        return 'IIIT'
    
    # General categorization logic
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

# Update the original data with the new 'iitin' property
for entry in data:
    institute_name = entry.get("institute", "").strip()
    category = categorize_institute(institute_name)
    entry['type'] = category

# Save the updated data to a new file
with open('merged_data_with_iitin.json', 'w') as f:
    json.dump(data, f, indent=4)

print("Successfully merged and added 'iitin' property to data.json.")
